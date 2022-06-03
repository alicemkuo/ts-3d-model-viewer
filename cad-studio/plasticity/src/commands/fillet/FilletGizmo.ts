import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2";
import * as c3d from '../../kernel/kernel';
import { EditorLike, Mode } from "../../command/AbstractGizmo";
import { CompositeGizmo } from "../../command/CompositeGizmo";
import { AbstractAxialScaleGizmo, AbstractAxisGizmo, AngleGizmo, AxisHelper, CompositeHelper, lineGeometry, MagnitudeStateMachine, NumberHelper, sphereGeometry } from "../../command/MiniGizmos";
import { groupBy } from "../../command/MultiFactory";
import { CancellablePromise } from "../../util/CancellablePromise";
import { point2point, vec2vec } from "../../util/Conversion";
import { Helper } from "../../util/Helpers";
import * as fillet from './FilletFactory';
import { FilletParams } from './FilletFactory';

const Y = new THREE.Vector3(0, 1, 0);
Object.freeze(Y);

export class FilletSolidGizmo extends CompositeGizmo<FilletParams> {
    private readonly main = new FilletMagnitudeGizmo("fillet-solid:distance", this.editor);
    private readonly stretchFillet = new FilletStretchGizmo("fillet-solid:fillet", this.editor);
    private readonly stretchChamfer = new ChamferStretchGizmo("fillet-solid:chamfer", this.editor);
    private readonly angle = new FilletAngleGizmo("fillet-solid:angle", this.editor, this.editor.gizmos.white);
    private readonly variables: FilletMagnitudeGizmo[] = [];

    private mode: fillet.Mode = c3d.CreatorType.FilletSolid;

    constructor(params: FilletParams, editor: EditorLike, private readonly hint?: THREE.Vector3) {
        super(params, editor);
    }

    prepare() {
        const { main, angle, stretchFillet: stretchFillet, stretchChamfer } = this;
        const { point, normal } = this.placement(this.hint);

        main.quaternion.setFromUnitVectors(Y, normal);
        main.position.copy(point);
        stretchFillet.position.copy(point);
        stretchChamfer.position.copy(point);

        main.relativeScale.setScalar(0.8);
        angle.relativeScale.setScalar(0.5);

        this.add(main, stretchFillet, stretchChamfer);
        main.tip.add(angle);

        this.toggle(this.mode);
    }

    execute(cb: (params: FilletParams) => void): CancellablePromise<void> {
        const { main, angle, stretchFillet: stretchFillet, stretchChamfer, params } = this;

        angle.value = Math.PI / 4;

        this.addGizmo(main, length => {
            if (this.mode === c3d.CreatorType.ChamferSolid) {
                params.distance1 = length;
                params.distance2 = params.distance1 * Math.tan(angle.value);
                stretchFillet.value = -length;
                stretchChamfer.value = length;
            } else {
                params.distance = length;
                stretchFillet.value = length;
                stretchChamfer.value = -length;
            }
            angle.stateMachine!.isEnabled = this.shouldShowAngle;
        });

        this.addGizmo(stretchFillet, length => {
            params.distance = length;
            main.value = length;
            stretchChamfer.value = -length;
            angle.stateMachine!.isEnabled = this.shouldShowAngle;
        });

        this.addGizmo(stretchChamfer, length => {
            params.distance = length;
            main.value = length;
            stretchFillet.value = -length;
            angle.stateMachine!.isEnabled = this.shouldShowAngle;
        });

        this.addGizmo(angle, angle => {
            params.distance2 = params.distance1 * Math.tan(angle);
        }, false);

        return super.execute(cb, Mode.Persistent);
    }

    toggle(mode: fillet.Mode) {
        const { variables } = this;
        this.mode = mode;
        if (mode === c3d.CreatorType.ChamferSolid) {
            for (const variable of variables) {
                variable.visible = false;
                variable.stateMachine!.isEnabled = false;
            }
        } else if (mode === c3d.CreatorType.FilletSolid) {
            for (const variable of variables) {
                variable.visible = true;
                variable.stateMachine!.isEnabled = true;
            }
        }
    }

    get shouldShowAngle(): boolean {
        return Math.abs(this.params.distance1) + Math.abs(this.params.distance2) > 0
    }

    private placement(point?: THREE.Vector3): { point: THREE.Vector3, normal: THREE.Vector3 } {
        const { params: { edges }, editor: { db } } = this;
        const models = edges.map(view => db.lookupTopologyItem(view));
        const curveEdge = models[models.length - 1];

        if (point !== undefined) {
            const t = curveEdge.PointProjection(point2point(point))
            const normal = vec2vec(curveEdge.EdgeNormal(t), 1);
            const projected = point2point(curveEdge.Point(t));
            return { point: projected, normal };
        } else {
            const normal = vec2vec(curveEdge.EdgeNormal(0.5), 1);
            point = point2point(curveEdge.Point(0.5));
            return { point, normal };
        }
    }

    render(length: number) {
        this.main.render(length * Math.tan(Math.PI / 4));
    }

    addVariable(point: THREE.Vector3, edge: c3d.CurveEdge, t: number): FilletMagnitudeGizmo {
        const normal = edge.EdgeNormal(t);
        const gizmo = new FilletMagnitudeGizmo(`fillet:distance:${this.variables.length}`, this.editor);
        gizmo.relativeScale.setScalar(0.5);
        gizmo.value = 1;
        gizmo.position.copy(point);
        gizmo.quaternion.setFromUnitVectors(Y, vec2vec(normal, 1));
        this.variables.push(gizmo);

        return gizmo;
    }

    private edges: THREE.Object3D[] = [];
    showEdges() {
        for (const edge of this.edges) edge.removeFromParent();

        const map = groupBy('parentItem', this.params.edges);
        const views = [];
        for (const [solid, edges] of map.entries()) {
            const view = solid.edges.slice(edges);
            view.material = this.editor.materials.lineDashed();
            view.computeLineDistances();
            this.add(view);
            views.push(view);
        }
        this.edges = views;
    }

    get shouldRescaleOnZoom() { return false }
}

export class FilletMagnitudeGizmo extends AbstractAxisGizmo {
    readonly state = new MagnitudeStateMachine(0);
    protected material = this.editor.gizmos.default;
    readonly helper = new CompositeHelper([new AxisHelper(this.material.line), new NumberHelper()]);
    readonly tip = new THREE.Mesh(sphereGeometry, this.material.mesh);
    protected readonly shaft = new THREE.Mesh();
    protected readonly knob = new THREE.Mesh(new THREE.SphereGeometry(0.2), this.editor.gizmos.invisible);
    private readonly line = new Line2(lineGeometry, this.material.line2);

    constructor(name: string, editor: EditorLike) {
        super(name, editor);
        this.setup();
        this.add(this.helper);
        this.tip.add(this.line);
        this.line.position.set(0, - 0.5, 0);
    }

    onInterrupt(cb: (radius: number) => void) {
        this.state.push();
    }

    render(length: number) {
        const approxDist = length * Math.sin(Math.PI / 4);
        this.tip.position.set(0, approxDist, 0);
        this.knob.position.copy(this.tip.position);
    }

    protected accumulate(original: number, sign: number, dist: number): number {
        return original + dist
    }

    protected override scaleIndependentOfZoom(camera: THREE.Camera) {
        // Rather than scaling the parent, we scale the children, so that the position (set in render)
        // is in world space
        this.tip.scale.copy(this.relativeScale);
        this.knob.scale.copy(this.relativeScale);
        this.helper.scale.copy(this.relativeScale);
        Helper.scaleIndependentOfZoom(this.tip, camera, this.worldPosition);
        Helper.scaleIndependentOfZoom(this.knob, camera, this.worldPosition);
        Helper.scaleIndependentOfZoom(this.helper, camera, this.worldPosition);
    }
}

class FilletAngleGizmo extends AngleGizmo {
    onInterrupt(cb: (radius: number) => void) {
        this.state.push();
    }

    get shouldRescaleOnZoom() { return false }

    onEnabled() { this.visible = true }
    onDisabled() { this.visible = false }
}

class FilletStretchGizmo extends AbstractAxialScaleGizmo {
    readonly state = new MagnitudeStateMachine(0);
    readonly tip = new THREE.Mesh();
    protected readonly shaft = new THREE.Mesh();
    protected readonly knob = new THREE.Mesh();

    constructor(name: string, editor: EditorLike) {
        super(name, editor, editor.gizmos.default);
        this.setup();
    }

    onInterrupt(cb: (radius: number) => void) {
        this.state.push();
    }

    protected accumulate(original: number, dist: number, denom: number, _: number = 1): number {
        if (original === 0) return Math.max(0, dist - denom);
        else return (original + ((dist - denom) * original) / denom);
    }

    override get shouldRescaleOnZoom(): boolean {
        return true;
    }
}

class ChamferStretchGizmo extends FilletStretchGizmo {
    protected accumulate(original: number, dist: number, denom: number, sign: number = 1): number {
        return -Math.abs(super.accumulate(original, dist, denom, sign));
    }

    override get shouldRescaleOnZoom(): boolean {
        return true;
    }
}