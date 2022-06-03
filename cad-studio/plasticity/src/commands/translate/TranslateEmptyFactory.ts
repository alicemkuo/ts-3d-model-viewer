import * as THREE from "three";
import c3d from '../../../build/Release/c3d.node';
import { AbstractFactory } from "../../command/AbstractFactory";
import { NoOpError } from '../../command/GeometryFactory';
import { TemporaryObject } from "../../editor/DatabaseLike";
import { EditorSignals } from "../../editor/EditorSignals";
import { Empty } from "../../editor/Empties";
import MaterialDatabase from "../../editor/MaterialDatabase";
import { Scene } from "../../editor/Scene";
import { deunit, mat2mat, point2point, vec2vec } from "../../util/Conversion";
import { MoveParams, RotateParams, ScaleParams } from "./TranslateItemFactory";

abstract class EmptyFactory extends AbstractFactory<Empty> {
    constructor(
        protected readonly scene: Scene,
        protected readonly materials: MaterialDatabase,
        protected readonly signals: EditorSignals,
    ) { super() }
}

abstract class TranslateFactory extends EmptyFactory {
    _items!: Empty[];
    protected originalTransforms!: THREE.Matrix4[];

    get items() { return this._items }
    set items(items: Empty[]) {
        const originalTransforms = [];
        this._items = items;
        for (const item of items) {
            const tx = this.scene.getTransform(item);
            const mat = new THREE.Matrix4().compose(tx.position, tx.quaternion, tx.scale);
            originalTransforms.push(mat);
        }
        this.originalTransforms = originalTransforms;
    }

    protected readonly _matrix = new THREE.Matrix4();
    get matrix(): THREE.Matrix4 {
        const { transform, _matrix } = this;
        const mat = transform.GetMatrix();
        mat2mat(mat, _matrix);
        return _matrix;
    }

    // This is confusing. But view units are meters and model units are centimeters, as per usual.
    // this.matrix pivot is in model units. So any view level transforms (e.g., update) need to deunit just that part.
    private readonly tmp = new THREE.Matrix4();
    get deunitMatrix() {
        const { tmp, matrix } = this;
        const de = deunit(1);
        tmp.copy(matrix);
        tmp.elements[12] *= de;
        tmp.elements[13] *= de;
        tmp.elements[14] *= de;
        return tmp
    }

    async doUpdate(abortEarly: () => boolean) {
        const { items, originalTransforms, deunitMatrix: mat } = this;
        let result: TemporaryObject[] = [];
        for (const [i, item] of items.entries()) {
            mat.multiply(originalTransforms[i]);
            const temp = translateTemporary(item, mat);
            result.push(temp);
        }
        return await Promise.all(result);
    }

    protected async doCommit() {
        const { items, originalTransforms, deunitMatrix: mat } = this;
        const transform = { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), scale: new THREE.Vector3 };
        for (const [i, item] of items.entries()) {
            mat.multiply(originalTransforms[i]).decompose(transform.position, transform.quaternion, transform.scale)
            this.scene.setTransform(this.items[0], transform);
        }
        return this.items;
    }

    protected abstract get transform(): c3d.TransformValues

    get originalItem() { return this.items }
}

export class MoveEmptyFactory extends TranslateFactory implements MoveParams {
    move = new THREE.Vector3();
    pivot!: THREE.Vector3;

    protected get transform(): c3d.TransformValues {
        const { move } = this;

        if (move.manhattanLength() < 10e-6) throw new NoOpError();

        const params = new c3d.TransformValues();
        params.Move(vec2vec(move));
        return params;
    }
}

export class ScaleEmptyFactory extends TranslateFactory implements ScaleParams {
    pivot = new THREE.Vector3();
    scale = new THREE.Vector3(1, 1, 1);
    protected get transform(): c3d.TransformValues {
        const { scale, pivot } = this;
        return new c3d.TransformValues(scale.x, scale.y, scale.z, point2point(pivot));
    }
}

export class RotateEmptyFactory extends TranslateFactory implements RotateParams {
    pivot!: THREE.Vector3
    axis = new THREE.Vector3(1, 0, 0);
    angle = 0;

    get degrees() { return THREE.MathUtils.radToDeg(this.angle) }
    set degrees(degrees: number) {
        this.angle = THREE.MathUtils.degToRad(degrees);
    }

    // I'm honestly not sure why we can't use apply matrices as in TranslateFactory above,
    // but this works instead.
    async doUpdate(abortEarly: () => boolean) {
        const { items, pivot: point, axis, angle, originalTransforms } = this;
        axis.normalize();
        let result: TemporaryObject[] = [];
        for (const [i, item] of items.entries()) {
            const temp = rotateTemporary(item, point, axis, angle, originalTransforms[i]);
            result.push(temp);
        }
        return await Promise.all(result);
    }

    protected get transform(): c3d.TransformValues {
        const { axis, angle, pivot: point } = this;

        if (angle === 0) throw new NoOpError();

        const mat = new c3d.Matrix3D();
        const p = point2point(point);
        const v = vec2vec(axis, 1);
        const axi = new c3d.Axis3D(p, v);
        const rotation = mat.Rotate(axi, angle);

        return new c3d.TransformValues(rotation);
    }
}

function translateTemporary(item: THREE.Object3D, mat: THREE.Matrix4): TemporaryObject {
    item.matrixAutoUpdate = false;
    item.matrix.copy(mat);
    item.matrix.decompose(item.position, item.quaternion, item.scale);
    item.updateMatrixWorld(true);

    const temp = { underlying: item, show() { }, hide() { }, cancel() { } };
    return temp as TemporaryObject;
}

function rotateTemporary(item: THREE.Object3D, point: THREE.Vector3, axis: THREE.Vector3, angle: number, mat: THREE.Matrix4) {
    if (angle === 0) {
        item.matrix.copy(mat);
        item.updateMatrixWorld(true);
        const temp = { underlying: item, show() { }, hide() { }, cancel() { } };
        return temp as TemporaryObject;
    }

    _sub.makeTranslation(-point.x, -point.y, -point.z);
    _add.makeTranslation(point.x, point.y, point.z);
    _mul.makeRotationAxis(axis, angle);
    item.matrix.copy(mat);
    item.matrix.premultiply(_sub);
    item.matrix.premultiply(_mul);
    item.matrix.premultiply(_add);
    item.matrix.decompose(item.position, item.quaternion, item.scale);
    item.updateMatrixWorld(true);

    const temp = { underlying: item, show() { }, hide() { }, cancel() { } };
    return temp as TemporaryObject;
}

const _add = new THREE.Matrix4();
const _sub = new THREE.Matrix4();
const _mul = new THREE.Matrix4();
