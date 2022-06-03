import { Signal } from "signals";
import c3d from '../../build/Release/c3d.node';
import { Measure } from "../components/stats/Measure";
import { DatabaseLike, MaterialOverride, TemporaryObject } from "../editor/DatabaseLike";
import { EditorSignals } from '../editor/EditorSignals';
import MaterialDatabase from '../editor/MaterialDatabase';
import { toArray } from "../util/Conversion";
import { zip } from '../util/Util';
import * as visual from '../visual_model/VisualModel';
import { AbstractFactory } from "./AbstractFactory";

type State = { tag: 'none', last: undefined }
    | { tag: 'updated' }
    | { tag: 'updating', hasNext: boolean, failed?: any, step: SubStep }
    | { tag: 'failed', error: any }
    | { tag: 'cancelled' }
    | { tag: 'committed' }

/**
 * A GeometryFactory is an object responsible for making and transforming geometrical objects, like
 * solids and curves. All of the spheres and circles and fillets and boolean operations are represented
 * as factories. The factories take various arguments (such as a fillet radius) and have commit(), update(),
 * and cancel() methods. Commit() computes the geometry and adds it to the database whereas update() creates
 * a temporary object for visualization before the user decides to commit().
 * 
 * A typical subclass only implements the calculate() template method. So the default superclass update()
 * and commit() (which call calculate()) are sufficient in 90% of cases; the exceptions are usually to allow
 * update() to have optimizations. Scale, for example, can show results to the user without having to invoke
 * c3d commands (which are often slower and always generate a lot of garbage).
 * 
 * Further, one should be aware that some factories create objects (like a new sphere), some create
 * and CONSUME objects such as boolean union (where two objects become one), some replace like fillet, and so
 * forth. Thus there is some code complexity in managing the inserting, replacing, deleting, etc. of objects
 * in the databases. All of this is implemented in AbstractGeometryFactory -- it is the "essential" functionality.
 * 
 * In addition to the above, a GeometryFactory is a state machine. Because computations can succeed and fail,
 * and because computations can take a long time (and happen asynchronously), the GeometryFactory has states
 * like none/updating/updated/failed/cancelled/committed. For the purposes of code organization and unit testing,
 * the state machine behavior is implemented in the abstract subclass GeometryFactory.
 * 
 * Particularly in the case of update(), where the user is interactively trying one value after another,
 * the factory can temporarily be in a failure state. Similarly, if an update takes too long, the user
 * might request another update before the last has finished. Hence there are states like 'updating',
 * 'failed', 'updated', etc.
 * 
 * In general, if the user is requesting updates too fast we drop all but the most recent request; this
 * is implemented with the hasNext field on the updating state. We also need to ensure some synchronization;
 * if an update is taking too long and in the meantime the user cancels or commits, the system needs to
 * end up in a coherent state. We could queue everything to do this, which would be simple but slow. Instead,
 * after every `await` check if the state has changed and if so perform whatever cleanup is necessary.
 * 
 */

export abstract class AbstractGeometryFactory extends AbstractFactory<visual.Item> {
    readonly changed = new Signal();

    private _state: State = { tag: 'none', last: undefined };
    get state() { return this._state }
    set state(state: State) {
        this._state = state;
        this.changed.dispatch();
    }

    constructor(
        protected readonly db: DatabaseLike,
        protected readonly materials: MaterialDatabase,
        protected readonly signals: EditorSignals,
        protected readonly cache: GeometryFactoryCache = new Map()
    ) { super() }

    private phants: TemporaryObject[] = [];
    private hidden: THREE.Object3D[] = [];

    protected async doPhantoms(abortEarly: () => boolean): Promise<TemporaryObject[]> {
        const infos = await this.calculatePhantoms();
        if (abortEarly()) return Promise.resolve([]);

        const promises: Promise<TemporaryObject>[] = [];
        for (const { phantom, material } of infos) {
            promises.push(this.db.addPhantom(phantom, material));
        }
        const phantoms = await Promise.all(promises);
        this.cleanupPhantoms();

        if (abortEarly()) {
            for (const p of phantoms) p.cancel();
            return Promise.resolve([]);
        }

        return this.phants = this.showTemps(phantoms);
    }

    async doUpdate(abortEarly: () => boolean, options?: any): Promise<TemporaryObject[]> {
        const temps: Promise<TemporaryObject>[] = [];

        // 1. Asynchronously compute the geometry
        let result;
        const stats = Measure.get('factory-calculate');
        stats.begin();
        try {
            result = await this.calculate(options);
        } catch (e) {
            if (e instanceof ValidationError) this.cleanupTemps();
            this.restoreOriginalItems();
            this.signals.factoryUpdated.dispatch();
            throw e;
        } finally {
            stats.end();
        }
        if (abortEarly()) {
            return Promise.resolve([]);
        }

        // 2. Asynchronously compute the mesh for temporary items.
        const geometries = toArray(result);
        const zipped = this.zip(this.originalItems, geometries, this.shouldHideOriginalItemDuringUpdate);

        const toHide = [];
        for (const [from, to] of zipped) {
            if (from === undefined) {
                temps.push(this.db.addTemporaryItem(to!));
            } else if (to === undefined) {
                toHide.push(from);
            } else {
                temps.push(this.db.replaceWithTemporaryItem(from, to));
            }
        }

        // 3. When all async work is complete, we can safely show/hide items to the user;
        // The specific order of operations is designed to avoid any flicker: compute
        // everything async, then sync show/hide objects when all data is ready.
        const finished = await Promise.all(temps);

        // 3.a. Bring the original items to the correct state
        this.restoreOriginalItems();
        toHide.forEach(h => h.visible = false);
        this.hidden = toHide;

        // 3.b. remove any previous temporary items.
        this.cleanupTemps();

        if (abortEarly()) {
            for (const p of finished) p.cancel();
            return Promise.resolve([]);
        }

        // 3.c. show the newly created temporary items.
        return this.temps = this.showTemps(finished);
    }

    protected async doCommit(): Promise<visual.Item | visual.Item[]> {
        try {
            const unarray = await this.calculate();
            const geometries = toArray(unarray);
            let detached: c3d.Item[] = [];
            const names = new c3d.SNameMaker(c3d.CreatorType.DetachSolid, c3d.ESides.SideNone, 0);
            for (const item of geometries) {
                if (item instanceof c3d.Solid) {
                    const { parts } = c3d.ActionSolid.DetachParts(item, false, names);
                    detached = detached.concat(parts);
                    detached.push(item);
                } else {
                    detached.push(item);
                }
            }
            const promises = [];
            const zipped = this.zip(this.originalItems, detached, this.shouldRemoveOriginalItemOnCommit);
            for (const [from, to] of zipped) {
                if (from === undefined) {
                    promises.push(this.db.addItem(to!));
                } else if (to === undefined) {
                    this.db.removeItem(from);
                } else {
                    promises.push(this.db.replaceItem(from, to))
                }
            }

            const result = await Promise.all(promises);
            return dearray(result, unarray);
        } finally {
            await Promise.resolve(); // This removes flickering when rendering. // FIXME: is that still true?
            this.finalize();
        }
    }

    protected finalize() {
        super.finalize();
        this.cleanupPhantoms();
        this.dispose();
    }

    protected restoreOriginalItems() {
        for (const i of this.hidden) i.visible = true;
        super.restoreOriginalItems();
    }

    private cleanupPhantoms() {
        for (const phantom of this.phants) phantom.cancel();
        this.phants = [];
    }

    dispose() { }

    private zip(originals: visual.Item[], replacements: c3d.Item[], shouldRemoveOriginal: boolean) {
        if (shouldRemoveOriginal) {
            return zip(originals, replacements);
        } else {
            return zip([], replacements);
        }
    }

    calculate(options?: any): Promise<c3d.Item | c3d.Item[]> { throw new Error("Implement this for simple factories"); }
    calculatePhantoms(): Promise<PhantomInfo[]> { return Promise.resolve([]) }

    protected get cacheKey(): string | undefined { return undefined }
    calculateWithCache(options?: any): Promise<c3d.Item | c3d.Item[]> {
        let result;
        const cacheKey = this.cacheKey;
        if (cacheKey !== undefined) {
            if (this.cache.has(cacheKey)) {
                const memoized = this.cache.get(cacheKey)!;
                result = memoized;
            } else {
                result = this.calculate(options);
                result.catch(e => { });
                this.cache.set(cacheKey, result);
            }
        } else {
            result = this.calculate(options);
        }
        return result;
    }

    protected get shouldRemoveOriginalItemOnCommit() { return true }
    protected get shouldHideOriginalItemDuringUpdate() { return this.shouldRemoveOriginalItemOnCommit }
}

export abstract class GeometryFactory extends AbstractGeometryFactory {
    async update() {
        const abortEarly = () => this.done;

        switch (this.state.tag) {
            case 'none':
            case 'failed':
            case 'updated': {
                const state: State = { tag: 'updating', hasNext: false, step: 'begin' };
                this.state = state;
                c3d.Mutex.EnterParallelRegion();
                try {
                    const phantoms = this.doPhantoms(abortEarly);
                    const temps = this.doUpdate(abortEarly);
                    phantoms.then(() => {
                        if (state.step === 'begin') state.step = 'phantoms-completed';
                        else state.step = 'all-completed';
                        // ensure phantoms are rendered as soon as they're ready:
                        if (this.state.tag !== 'cancelled') this.signals.factoryUpdated.dispatch();
                    }, () => { });
                    temps.then(() => {
                        if (state.step === 'begin') state.step = 'calculate-completed';
                        else state.step = 'all-completed';
                        // rerender now that we're done calculating the temps:
                        if (this.state.tag !== 'cancelled') this.signals.factoryUpdated.dispatch();
                    }, () => { });
                    await Promise.all([phantoms, temps]);
                } catch (e) {
                    this.state.failed = e ?? new Error("unknown error");
                } finally {
                    c3d.Mutex.ExitParallelRegion();

                    await this.continueUpdatingIfMoreWork();
                }
                break;
            }
            case 'updating':
                const state = this.state;
                if (state.hasNext) console.warn("Dropping job because of latency");
                if (state.step === 'phantoms-completed') {
                    state.step = 'begin';
                    c3d.Mutex.EnterParallelRegion();
                    await this.doPhantoms(abortEarly);
                    c3d.Mutex.ExitParallelRegion();
                    if (state.step === 'begin') state.step = state.step = 'phantoms-completed';
                    else state.step = 'all-completed';
                }

                state.hasNext = true;
                break;
            default:
                throw new Error('invalid state: ' + this.state.tag);
        }
    }

    get done() {
        return this.state.tag === 'cancelled' || this.state.tag === 'committed';
    }

    // If another update() job was "enqueued" while still doing the previous one, do that too
    private async continueUpdatingIfMoreWork() {
        switch (this.state.tag) {
            case 'updating':
                const hasNext = this.state.hasNext;
                const error = this.state.failed;
                if (error) {
                    this.state = { tag: 'failed', error };
                    if (hasNext) await this.update();
                    else await this.notifyOfError();
                } else {
                    this.state = { tag: 'updated' };
                    if (hasNext) await this.update();
                }
                break;
            case 'cancelled': break;
            case 'committed': break;
            default: throw new Error("invalid state: " + this.state.tag);
        }
    }

    private async notifyOfError() {
        switch (this.state.tag) {
            case 'failed':
                const e = this.state.error;
                if (!(e instanceof NoOpError)) {
                    if (e instanceof ValidationError || e.isC3dError) {
                        console.warn(`${this.constructor.name}: ${e.message}`);
                    }
                }

                for (const temp of this.temps) temp.hide();

                if (!(e instanceof NoOpError)) {
                    if (e instanceof ValidationError || e.isC3dError) {
                        this.signals.factoryUpdateFailed.dispatch(e);
                    } else throw e;
                }
                break;
            case 'updating': break;
            default:
                throw new Error("invalid state: " + this.state.tag);
        }
    }

    async commit(): Promise<visual.Item | visual.Item[]> {
        switch (this.state.tag) {
            case 'none':
            case 'updated':
            case 'failed':
            case 'updating':
                try {
                    c3d.Mutex.EnterParallelRegion();
                    const result = await this.doCommit();
                    c3d.Mutex.ExitParallelRegion();
                    this.state = { tag: 'committed' };
                    this.signals.factoryCommitted.dispatch();
                    return result;
                } catch (error) {
                    this.state = { tag: 'failed', error };
                    this.doCancel();
                    this.signals.factoryCancelled.dispatch();
                    throw error;
                }
            default:
                console.trace();
                throw new Error('invalid state: ' + this.state.tag);
        }
    }

    cancel() {
        switch (this.state.tag) {
            case 'updated':
            case 'none':
            case 'cancelled':
            case 'failed':
            case 'updating':
                this.doCancel();
                this.state = { tag: 'cancelled' };
                this.signals.factoryCancelled.dispatch();
                return;
            default:
                throw new Error(`Factory ${this.constructor.name} in invalid state: ${this.state.tag}`);
        }
    }

    pause() {
        switch (this.state.tag) {
            case 'none':
            case 'updated':
            case 'failed':
            case 'updating':
                for (const temp of this.temps) temp.hide();
                break;
            default:
                throw new Error(`Factory ${this.constructor.name} in invalid state: ${this.state.tag}`);
        }
    }

    resume() {
        switch (this.state.tag) {
            case 'none':
            case 'updated':
            case 'failed':
            case 'updating':
                for (const temp of this.temps) temp.show();
                break;
            default:
                throw new Error(`Factory ${this.constructor.name} in invalid state: ${this.state.tag}`);
        }
    }

    protected get keys(): string[] {
        return [];
    }
}

function dearray<S, T>(array: S[], antecedent: T | T[]): S | S[] {
    if (antecedent instanceof Array) return array;
    return array[0];
}

export class ValidationError extends Error { }
export class NoOpError extends ValidationError {
    constructor() {
        super("Operation has no effect");
    }
}

type SubStep = 'begin' | 'phantoms-completed' | 'calculate-completed' | 'all-completed';

export type PhantomInfo = { phantom: c3d.Item, material: MaterialOverride, ancestor?: visual.Item }
export type GeometryFactoryCache = Map<string, Promise<c3d.Item | c3d.Item[]>>;
