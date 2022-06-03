import * as c3d from '../../kernel/kernel';
import { point2point } from '../../util/Conversion';
import { CrossPointMemento, MementoOriginator } from '../History';
import { Transaction } from './ContourManager';

export class CrossPointDatabase implements MementoOriginator<CrossPointMemento> {
    private readonly curve2touched = new Map<c3d.SimpleName, ReadonlySet<c3d.SimpleName>>();
    private readonly id2cross = new Map<c3d.SimpleName, ReadonlySet<CrossPoint>>();
    private readonly id2curve = new Map<c3d.SimpleName, c3d.Curve3D>();
    private readonly _crosses: Set<CrossPoint> = new Set();
    get crosses(): ReadonlySet<CrossPoint> { return this._crosses }

    constructor(other?: CrossPointDatabase) {
        if (other !== undefined) {
            this.restoreFromMemento(other.saveToMemento());
        }
    }

    add(id: c3d.SimpleName, curve: c3d.Curve3D) {
        const { curve2touched, _crosses: allCrosses, id2cross } = this;
        const { crosses: newCrosses, touched } = this.calculate(id, curve);

        this.id2curve.set(id, curve);
        id2cross.set(id, new Set());
        curve2touched.set(id, touched);
        for (const touchee of touched) {
            const orig = curve2touched.get(touchee)!;
            const other = new Set(orig);
            other.add(id);
            // updating the touched curves is copy-on-write to allow for nesting CrossPointDatabases
            curve2touched.set(touchee, other);
        }

        for (const cross of newCrosses) {
            const orig1 = new Set(id2cross.get(cross.on1.id));
            orig1.add(cross);
            id2cross.set(cross.on1.id, orig1);

            const orig2 = new Set(id2cross.get(cross.on2.id));
            orig2.add(cross);
            id2cross.set(cross.on2.id, orig2);
            
            allCrosses.add(cross);
        }
        return newCrosses;
    }

    private calculate(name: c3d.SimpleName, curve: c3d.Curve3D): { crosses: Set<CrossPoint>, touched: Set<c3d.SimpleName> } {
        const { allCurves } = this;
        const touched = new Set<c3d.SimpleName>();

        const crosses = new Set<CrossPoint>();
        for (const { id: otherName, curve: other } of allCurves) {
            const { count, result1, result2 } = c3d.ActionPoint.CurveCurveIntersection3D(curve, other, 10e-3,)
            if (count > 0) {
                touched.add(otherName);
                for (let i = 0; i < count; i++) {
                    const position = curve.PointOn(result1[i]);
                    const cross = new CrossPoint(
                        point2point(position),
                        new PointOnCurve(name, result1[i], curve.GetTMin(), curve.GetTMax()),
                        new PointOnCurve(otherName, result2[i], other.GetTMin(), other.GetTMax()));
                    crosses.add(cross);
                }
            }
        }
        return { crosses, touched };
    }

    private get allCurves() {
        return [...this.id2curve.entries()].map(([id, curve]) => { return { id, curve } });
    }

    remove(id: c3d.SimpleName) {
        const data = this.cascade(id);

        const readd = new Map<c3d.SimpleName, c3d.Curve3D>();
        for (const touchee of data.dirty) {
            readd.set(touchee, this.id2curve.get(touchee)!);
            this.removeInfo(touchee);
        }
        for (const touchee of data.deleted) {
            if (data.dirty.has(touchee)) continue;
            this.removeInfo(touchee);
        }
        for (const touchee of data.dirty) {
            if (data.deleted.has(touchee)) continue;
            this.add(touchee, readd.get(touchee)!);
        }
    }

    private cascade(id: c3d.SimpleName, transaction: Transaction = { dirty: new Set(), deleted: new Set(), added: new Set() }) {
        const { curve2touched } = this;
        const { dirty, deleted } = transaction;

        deleted.add(id);

        const touched = curve2touched.get(id)!;
        if (touched === undefined) return transaction;

        const visited = dirty;
        let toVisit = [...touched];
        while (toVisit.length > 0) {
            const touchee = toVisit.pop()!;
            if (visited.has(touchee)) continue;

            visited.add(touchee);
            toVisit = toVisit.concat([...curve2touched.get(touchee)!]);
        }

        return transaction;
    }

    private removeInfo(id: c3d.SimpleName) {
        const { curve2touched, id2curve, id2cross, _crosses: crosses } = this;
        id2curve.delete(id);
        curve2touched.delete(id);
        const invalidatedCrosses = id2cross.get(id)!;
        if (invalidatedCrosses === undefined) return;
        
        for (const cross of invalidatedCrosses) {
            crosses.delete(cross);
        }
        id2cross.delete(id);
    }

    validate() {
        console.assert(this.curve2touched.size === this.id2cross.size, "maps should have same size", this.curve2touched, this.id2cross);
        console.assert(this.id2cross.size === this.id2curve.size, "maps should have same size", this.id2cross, this.id2curve);
        if (this.curve2touched.size === 0) {
            console.assert(this._crosses.size === 0, "crosses should have be empty", this._crosses);
        }
    }

    saveToMemento(): CrossPointMemento {
        return new CrossPointMemento(
            new Map(this.curve2touched),
            new Map(this.id2cross),
            new Map(this.id2curve),
            new Set(this.crosses)
        );
    }

    restoreFromMemento(m: CrossPointMemento) {
        (this.curve2touched as CrossPointDatabase['curve2touched']) = new Map(m.curve2touched);
        (this.id2cross as CrossPointDatabase['id2cross']) = new Map(m.id2cross);
        (this.id2curve as CrossPointDatabase['id2curve']) = new Map(m.id2curve);
        (this._crosses as CrossPointDatabase['crosses']) = new Set(m.crosses);
    }

    clear() {
        this.curve2touched.clear();
        this.id2cross.clear();
        this.id2curve.clear();
        this._crosses.clear();
    }

    debug(): void { }
}


export class PointOnCurve {
    constructor(
        readonly id: c3d.SimpleName,
        readonly t: number,
        readonly tmin: number,
        readonly tmax: number
    ) { }

    get isTmin() { return this.t === this.tmin }
    get isTmax() { return this.t === this.tmax }
}


export class CrossPoint {
    constructor(
        readonly position: THREE.Vector3,
        readonly on1: PointOnCurve,
        readonly on2: PointOnCurve
    ) { }
}