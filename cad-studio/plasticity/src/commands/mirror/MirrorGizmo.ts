import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { AbstractGizmo, EditorLike, Intersector, Mode, MovementInfo } from "../../command/AbstractGizmo";
import { CompositeGizmo } from "../../command/CompositeGizmo";
import { GizmoMaterial } from "../../command/GizmoMaterials";
import { AbstractAxisGizmo, AxisHelper, boxGeometry, lineGeometry } from "../../command/MiniGizmos";
import { ProxyCamera } from "../../components/viewport/ProxyCamera";
import { CancellablePromise } from "../../util/CancellablePromise";
import { MoveAxisGizmo } from "../translate/MoveGizmo";
import { MirrorParams } from "./MirrorFactory";

const freeze = Object.freeze;

const X = freeze(new THREE.Vector3(1, 0, 0));
const Y = freeze(new THREE.Vector3(0, 1, 0));
const Z = freeze(new THREE.Vector3(0, 0, 1));

const _X = freeze(new THREE.Vector3(-1, 0, 0));
const _Y = freeze(new THREE.Vector3(0, -1, 0));
const _Z = freeze(new THREE.Vector3(0, 0, -1));

const mirrorPosX = freeze(new THREE.Quaternion().setFromUnitVectors(Z, X));
const mirrorPosY = freeze(new THREE.Quaternion().setFromUnitVectors(Z, Y));
const mirrorPosZ = freeze(new THREE.Quaternion().setFromUnitVectors(Z, Z));

const mirrorNegX = freeze(new THREE.Quaternion().setFromUnitVectors(Z, _X));
const mirrorNegY = freeze(new THREE.Quaternion().setFromUnitVectors(Z, _Y));
const mirrorNegZ = freeze(new THREE.Quaternion().setFromUnitVectors(Z, _Z));

const movePosX = freeze(new THREE.Quaternion().setFromUnitVectors(Y, X));
const movePosY = freeze(new THREE.Quaternion().setFromUnitVectors(Y, Y));
const movePosZ = freeze(new THREE.Quaternion().setFromUnitVectors(Y, Z));

const moveNegX = freeze(new THREE.Quaternion().setFromUnitVectors(Y, _X));
const moveNegY = freeze(new THREE.Quaternion().setFromUnitVectors(Y, _Y));
const moveNegZ = freeze(new THREE.Quaternion().setFromUnitVectors(Y, _Z));

export class MirrorGizmo extends CompositeGizmo<MirrorParams> {
    private readonly materials = this.editor.gizmos;
    private readonly red = this.materials.red;
    private readonly green = this.materials.green;
    private readonly blue = this.materials.blue;
    private readonly yellow = this.materials.yellow;
    private readonly x = new MirrorAxisGizmo("mirror:x", this.editor, this.red);
    private readonly y = new MirrorAxisGizmo("mirror:y", this.editor, this.green);
    private readonly z = new MirrorAxisGizmo("mirror:z", this.editor, this.blue);
    private readonly _x = new MirrorAxisGizmo("mirror:-x", this.editor, this.red);
    private readonly _y = new MirrorAxisGizmo("mirror:-y", this.editor, this.green);
    private readonly _z = new MirrorAxisGizmo("mirror:-z", this.editor, this.blue);
    private readonly move = new MirrorMoveGizmo("mirror:move", this.editor, this.yellow);

    prepare() {
        const { x, y, z, _x, _y, _z, move } = this;
        for (const o of [x, y, z, _x, _y, _z, move]) o.relativeScale.setScalar(0.8);

        x.quaternion.setFromUnitVectors(Y, X);
        y.quaternion.setFromUnitVectors(Y, Y);
        z.quaternion.setFromUnitVectors(Y, Z);

        _x.quaternion.setFromUnitVectors(Y, _X);
        _y.quaternion.setFromUnitVectors(Y, _Y);
        _z.quaternion.setFromUnitVectors(Y, _Z);

        this.add(x, y, z, _x, _y, _z, move);
        move.visible = false;
    }

    execute(cb: (params: MirrorParams) => void, mode: Mode = Mode.Persistent | Mode.DisableSelection): CancellablePromise<void> {
        const { x, y, z, _x, _y, _z, move, params } = this;

        const set = (mirrorQ: THREE.Quaternion, moveQ: THREE.Quaternion) => () => {
            this.move.value = params.move = 0;
            params.origin = new THREE.Vector3();
            move.position.copy(params.origin);
            params.quaternion = mirrorQ.clone();
            move.quaternion.copy(moveQ);
            this.move.visible = true;
        };

        this.addGizmo(x, set(mirrorPosX, movePosX));
        this.addGizmo(y, set(mirrorPosY, movePosY));
        this.addGizmo(z, set(mirrorPosZ, movePosZ));
        this.addGizmo(_x, set(mirrorNegX, moveNegX));
        this.addGizmo(_y, set(mirrorNegY, moveNegY));
        this.addGizmo(_z, set(mirrorNegZ, moveNegZ));

        this.addGizmo(move, delta => {
            params.move = delta;
            move.position.copy(params.origin).add(params.normal.clone().multiplyScalar(delta));
        });

        return super.execute(cb, mode);
    }

    render(params: MirrorParams) {
        this.move.value = params.move;
        this.move.visible = true;
        this.move.position.copy(params.origin);
        this.move.quaternion.setFromUnitVectors(Y, params.normal);
    }

    get shouldRescaleOnZoom() { return false }
}

class MirrorAxisGizmo extends AbstractGizmo<boolean>  {
    readonly tip: THREE.Mesh<any, any> = new THREE.Mesh(boxGeometry, this.material.mesh);
    protected readonly shaft = new Line2(lineGeometry, this.material.line2);
    protected readonly knob = new THREE.Mesh(new THREE.SphereGeometry(0.2), this.editor.gizmos.invisible);
    readonly helper = new AxisHelper(this.material.line);

    constructor(
        private readonly longName: string,
        editor: EditorLike,
        protected readonly material: GizmoMaterial
    ) {
        super(longName.split(':')[0], editor);
        this.setup();
        this.add(this.helper);
    }

    protected setup() {
        this.knob.userData.command = [`gizmo:${this.longName}`, (cb: (t: boolean) => void) => {
            cb(true);
            return true;
        }];
        this.tip.position.set(0, 0.5, 0);
        this.knob.position.copy(this.tip.position);

        this.handle.add(this.tip, this.shaft);
        this.picker.add(this.knob);
    }

    onPointerEnter(intersect: Intersector) {
        this.shaft.material = this.material.hover.line2;
        this.tip.material = this.material.hover.mesh;
    }

    onPointerLeave(intersect: Intersector) {
        this.shaft.material = this.material.line2;
        this.tip.material = this.material.mesh;
    }

    onPointerUp(cb: (b: boolean) => void, intersect: Intersector, info: MovementInfo) {
        this.shaft.material = this.material.line2;
        this.tip.material = this.material.mesh;
    }

    onInterrupt(cb: (b: boolean) => void) { }
    onPointerMove(cb: (b: boolean) => void, intersect: Intersector, info: MovementInfo) {
        return undefined;
    }

    onPointerDown(cb: (b: boolean) => void, intersect: Intersector, info: MovementInfo) {
        cb(true);
    }

    get shouldRescaleOnZoom() { return true }
}

export class MirrorMoveGizmo extends MoveAxisGizmo {
    get shouldRescaleOnZoom() { return true }

    update(camera: ProxyCamera) {
        AbstractAxisGizmo.prototype.update.call(this, camera);
    }
}