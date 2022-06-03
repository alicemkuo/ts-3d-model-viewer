import * as THREE from 'three';
import * as c3d from '../../kernel/kernel';
import * as visual from '../../visual_model/VisualModel';
import { composeMainName, decomposeMainName, vec2vec } from '../../util/Conversion';
import { GeometryFactory, NoOpError } from '../../command/GeometryFactory';
import { MoveParams } from '../translate/TranslateItemFactory';

export interface FilletFaceParams {
    distance: number;
    faces: visual.Face[];
}

export abstract class ModifyFaceFactory extends GeometryFactory {
    protected abstract operationType: c3d.ModifyingType;
    direction = new THREE.Vector3();

    protected names = new c3d.SNameMaker(composeMainName(c3d.CreatorType.FaceModifiedSolid, this.db.version), c3d.ESides.SideNone, 0);

    private _solid!: visual.Solid;
    protected solidModel!: c3d.Solid;
    get solid(): visual.Solid { return this._solid }
    set solid(solid: visual.Solid | c3d.Solid) {
        if (solid instanceof visual.Solid) {
            this._solid = solid;
            this.solidModel = this.db.lookup(solid);
        } else {
            this.solidModel = solid;
        }
    }

    private _faces = new Array<visual.Face>();
    protected facesModel!: c3d.Face[];
    get faces(): visual.Face[] { return this._faces }
    set faces(faces: visual.Face[] | c3d.Face[]) {
        if (faces[0] instanceof visual.Face) {
            const views = faces as visual.Face[];
            this._faces = views;

            const facesModel = [];
            for (const face of views) {
                const model = this.db.lookupTopologyItem(face);
                facesModel.push(model);
            }
            this.facesModel = facesModel;
        } else {
            this.facesModel = faces as c3d.Face[];
        }
    }

    async calculate(): Promise<c3d.Solid> {
        const { solidModel, facesModel, direction } = this;
        if (direction.manhattanLength() < 10e-4) {
            if (this.operationType === c3d.ModifyingType.Action ||
                this.operationType === c3d.ModifyingType.Offset ||
                this.operationType === c3d.ModifyingType.Fillet) {
                throw new NoOpError();
            }
        }

        const params = new c3d.ModifyValues();
        params.way = this.operationType;
        params.direction = vec2vec(direction);
        const result = await c3d.ActionDirect.FaceModifiedSolid_async(solidModel, c3d.CopyMode.Copy, params, facesModel, this.names);
        return result;
    }

    get keys() { return ['direction'] }
    get originalItem(): visual.Item[] | visual.Solid { return this.solid }
}

export class RemoveFaceFactory extends ModifyFaceFactory {
    operationType = c3d.ModifyingType.Remove;
}

export class CreateFaceFactory extends ModifyFaceFactory {
    operationType = c3d.ModifyingType.Create;
    get originalItem() { return [] }
}

export class ActionFaceFactory extends ModifyFaceFactory implements MoveParams {
    operationType = c3d.ModifyingType.Action;
    pivot = new THREE.Vector3();
    set move(direction: THREE.Vector3) {
        this.direction = direction;
    }
}

export class FilletFaceFactory extends ModifyFaceFactory implements FilletFaceParams {
    areFilletOrChamferFaces(faces: visual.Face[] | c3d.Face[]): boolean {
        const models = this.models(faces);
        return c3d.Action.FindFilletFaces(models, 10e-3).length == models.length;
    }

    areFilletFaces(faces: visual.Face[] | c3d.Face[]): boolean {
        const models = this.models(faces);
        for (const model of models) {
            const [type] = decomposeMainName(model.GetMainName());
            if (type != c3d.CreatorType.FilletSolid) return false;
        }
        return this.areFilletOrChamferFaces(faces);
    }

    private models(faces: visual.Face[] | c3d.Face[]): c3d.Face[] {
        if (faces.length === 0) return [];
        if (faces[0] instanceof visual.Face) {
            return faces.map(f => this.db.lookupTopologyItem(f as visual.Face));
        } else {
            return faces as c3d.Face[];
        }
    }

    operationType = c3d.ModifyingType.Fillet;
    set distance(d: number) { this.direction = new THREE.Vector3(d, 0, 0) }
}

export class SuppleFaceFactory extends ModifyFaceFactory {
    operationType = c3d.ModifyingType.Supple;
}

export class PurifyFaceFactory extends ModifyFaceFactory {
    operationType = c3d.ModifyingType.Purify;
}

export class MergerFaceFactory extends ModifyFaceFactory {
    operationType = c3d.ModifyingType.Merger;
}

export class UnitedFaceFactory extends ModifyFaceFactory {
    operationType = c3d.ModifyingType.United;
}

export class ModifyEdgeFactory extends GeometryFactory {
    direction = new THREE.Vector3();

    protected names = new c3d.SNameMaker(composeMainName(c3d.CreatorType.FaceModifiedSolid, this.db.version), c3d.ESides.SideNone, 0);

    private _solid!: visual.Solid;
    protected solidModel!: c3d.Solid;
    get solid() { return this._solid }
    set solid(obj: visual.Solid) {
        this._solid = obj;
        this.solidModel = this.db.lookup(this.solid);
    }

    private _edges = new Array<visual.CurveEdge>();
    protected edgesModel!: c3d.CurveEdge[];
    get edges() { return this._edges }
    set edges(edges: visual.CurveEdge[]) {
        this._edges = edges;

        const edgesModel = [];
        for (const edge of edges) {
            const model = this.db.lookupTopologyItem(edge);
            edgesModel.push(model);
        }
        this.edgesModel = edgesModel;
    }

    async calculate() {
        const { solidModel, edgesModel, direction } = this;

        const params = new c3d.ModifyValues();
        params.way = c3d.ModifyingType.Merger;
        params.direction = new c3d.Vector3D(1, 0, 0);
        const result = await c3d.ActionDirect.EdgeModifiedSolid_async(solidModel, c3d.CopyMode.Copy, params, edgesModel, this.names);
        return result;
    }

    get originalItem() { return this.solid }
}