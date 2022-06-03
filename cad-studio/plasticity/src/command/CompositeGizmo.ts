import { CompositeDisposable, Disposable } from "event-kit";
import * as THREE from "three";
import { CancellablePromise } from "../util/CancellablePromise";
import { Helper } from "../util/Helpers";
import { AbstractGizmo, EditorLike, GizmoLike, Mode } from "./AbstractGizmo";

export abstract class CompositeGizmo<P> extends Helper implements GizmoLike<P, void> {
    private readonly gizmos: [AbstractGizmo<any>, (a: any) => void, boolean][] = [];

    constructor(protected readonly params: P, protected readonly editor: EditorLike) {
        super();
    }

    protected prepare(mode: Mode) { }

    execute(compositeCallback: (params: P) => void, mode: Mode = Mode.Persistent, disposable = new Disposable()): CancellablePromise<void> {
        this.prepare(mode);

        const disposables = new CompositeDisposable();
        disposables.add(disposable);

        this.editor.helpers.add(this);
        disposables.add(new Disposable(() => this.editor.helpers.remove(this)));

        const cancellables = [];
        for (const [gizmo, miniCallback, isEnabled] of this.gizmos) {
            const executingGizmo = gizmo.execute((x: any) => {
                miniCallback(x);
                compositeCallback(this.params);
            }, mode);
            cancellables.push(executingGizmo);
            if (!isEnabled) gizmo.stateMachine!.isEnabled = isEnabled;
        }

        const all = CancellablePromise.all(cancellables);
        all.then(() => disposables.dispose(), () => disposables.dispose());
        return all;
    }

    addGizmo<T>(gizmo: AbstractGizmo<T>, cb: (t: T) => void, isEnabled = true) {
        this.gizmos.push([gizmo, cb, isEnabled]);
        gizmo.addEventListener('start', () => this.deactivateGizmosExcept(gizmo));
        gizmo.addEventListener('end', () => this.activateGizmos());
    }

    private deactivateGizmosExcept<T>(except: AbstractGizmo<T>) {
        for (const [gizmo] of this.gizmos) {
            if (gizmo === except) {
                gizmo.stateMachine!.isActive = true;
            } else {
                gizmo.stateMachine!.interrupt();
                gizmo.stateMachine!.isActive = false;
            }
        }
    }

    disable() {
        for (const [gizmo] of this.gizmos) {
            gizmo.stateMachine!.interrupt();
            gizmo.stateMachine!.isEnabled = false;
        }
    }

    enable() {
        for (const [gizmo] of this.gizmos) {
            gizmo.stateMachine!.isEnabled = true;
        }
    }

    private activateGizmos() {
        for (const [gizmo] of this.gizmos) {
            gizmo.stateMachine!.isActive = true;
        }
    }

    update(camera: THREE.Camera) {
        super.update(camera);
        for (const [gizmo,] of this.gizmos) gizmo.update(camera);
    }

    start(command: string) {
        const event = new CustomEvent(command, { bubbles: true });
        this.editor.activeViewport?.renderer.domElement.dispatchEvent(event);
    }
}
