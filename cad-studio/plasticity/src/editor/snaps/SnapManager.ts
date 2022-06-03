import * as THREE from "three";
import * as c3d from '../../kernel/kernel';
import { cornerInfo, inst2curve, point2point, vec2vec } from "../../util/Conversion";
import * as visual from '../../visual_model/VisualModel';
import { CrossPointDatabase } from "../curves/CrossPointDatabase";
import { DatabaseLike } from "../DatabaseLike";
import { EditorSignals } from "../EditorSignals";
import { MementoOriginator, SnapMemento } from "../History";
import { DisablableType } from "../TypeManager";
import { CircleCenterPointSnap, CircleCurveCenterPointSnap, CircularNurbsCenterPointSnap, CrossPointSnap, CurveEndPointSnap, CurvePointSnap, CurveSnap, EdgePointSnap, FaceCenterPointSnap } from "./Snaps";
import { AxisSnap } from "./AxisSnap";
import { PointSnap } from "./PointSnap";
import { Snap } from "./Snap";
import { SnapIdentityMap } from "./SnapIdentityMap";
import { SnapManagerGeometryCache } from "./SnapManagerGeometryCache";
import { Scene } from "../Scene";

export enum SnapType {
    Basic = 1 << 0,
    Geometry = 1 << 1,
    Crosses = 2 << 1,
}

export type SnapMap = Map<c3d.SimpleName, ReadonlySet<PointSnap>>;

export class SnapManager implements MementoOriginator<SnapMemento> {
    private _enabled = true;
    set enabled(enabled: boolean) { this._enabled = enabled }
    get enabled() {
        return this._enabled !== this.xor;
    }

    private _snapToGrid = false;
    set snapToGrid(snapToGrid: boolean) { this._snapToGrid = snapToGrid }
    get snapToGrid() {
        return this._snapToGrid && !this.xor;
    }

    private _xor = false;
    get xor() { return this._xor }
    set xor(xor: boolean) {
        if (this._xor === xor) return;

        this._xor = xor;
        if (xor) this.signals.snapsEnabled.dispatch();
        else this.signals.snapsDisabled.dispatch();
    }

    options: SnapType = SnapType.Basic | SnapType.Geometry | SnapType.Crosses;
    readonly layers = new THREE.Layers();

    private readonly basicSnaps = new Set<Snap>([originSnap, xAxisSnap, yAxisSnap, zAxisSnap]);
    private readonly id2snaps = new Map<DisablableType, SnapMap>();
    private readonly hidden = new Map<c3d.SimpleName, ReadonlySet<PointSnap>>()

    readonly identityMap = new SnapIdentityMap(this.db);

    readonly cache = new SnapManagerGeometryCache(this, this.db);

    constructor(
        private readonly db: DatabaseLike,
        private readonly scene: Scene,
        private readonly crosses: CrossPointDatabase,
        private readonly signals: EditorSignals
    ) {
        Object.freeze(this.basicSnaps);

        this.layers.enableAll();
        this.init();

        signals.objectAdded.add(([item, agent]) => {
            if (agent === 'user') {
                this.add(item);
                this.cache.update();
            }
        });
        signals.objectRemoved.add(([item, agent]) => {
            if (agent === 'user') {
                this.delete(item);
                this.cache.update();
            }
        });
        signals.objectReplaced.add(({ from, to }) => {
            this.delete(from);
            this.add(to);
        });
        signals.objectUnhidden.add(([item, mode]) => {
            if (item instanceof visual.Item) this.unhide(item);
        });
        signals.objectHidden.add(([item, mode]) => {
            if (item instanceof visual.Item) this.hide(item);
        });
        signals.commandEnded.add(() => this.cache.update());
        signals.objectReplaced.add(() => this.cache.update());
        signals.historyChanged.add(() => this.cache.update());
    }

    private init() {
        this.id2snaps.set(visual.Solid, new Map());
        this.id2snaps.set(visual.Curve3D, new Map());
        this.id2snaps.set(visual.Region, new Map());
    }

    get all(): { basicSnaps: ReadonlySet<Snap>, geometrySnaps: readonly ReadonlySet<PointSnap>[], crossSnaps: readonly CrossPointSnap[] } {
        const { scene: { types } } = this;
        const basicSnaps = (this.options & SnapType.Basic) === SnapType.Basic ? this.basicSnaps : new Set<Snap>();
        const crossSnaps = (this.options & SnapType.Crosses) === SnapType.Crosses ? this.crossSnaps : [];

        let geometrySnaps: ReadonlySet<PointSnap>[] = [];
        if ((this.options & SnapType.Geometry) === SnapType.Geometry) {
            for (const [type, id2snaps] of this.id2snaps) {
                if (!types.isEnabled(type)) continue;
                const snaps = [...id2snaps.values()];
                geometrySnaps = geometrySnaps.concat(snaps);
            }
        }

        return { basicSnaps, geometrySnaps, crossSnaps }
    }

    get crossSnaps(): CrossPointSnap[] {
        return [...this.crosses.crosses].map(cross => {
            const { view: view1, model: model1 } = this.db.lookupItemById(cross.on1.id);
            const curve1 = inst2curve(model1)!;
            const curveSnap1 = this.identityMap.CurveSnap(view1 as visual.SpaceInstance<visual.Curve3D>, curve1);
            const { view: view2, model: model2 } = this.db.lookupItemById(cross.on2.id);
            const curve2 = inst2curve(model2)!;
            const curveSnap2 = this.identityMap.CurveSnap(view2 as visual.SpaceInstance<visual.Curve3D>, curve2);

            return new CrossPointSnap(cross, curveSnap1, curveSnap2);
        });
    }

    private add(item: visual.Item) {
        performance.mark('begin-snap-add');
        const id2snaps = this.snapMapFor(item);
        const snapsForItem = new Set<PointSnap>();
        id2snaps.set(item.simpleName, snapsForItem);
        if (item instanceof visual.Solid) {
            const model = this.db.lookup(item);
            const edges = model.GetEdges();
            const faces = model.GetFaces();
            for (const edge of item.edges) {
                this.addEdge(edge, edges[edge.index], snapsForItem);
            }
            for (const [i, face] of [...item.faces].entries()) {
                this.addFace(face, faces[i], snapsForItem);
            }
        } else if (item instanceof visual.SpaceInstance) {
            this.addInstance(item, snapsForItem);
        }

        performance.measure('snap-add', 'begin-snap-add');
    }

    private snapMapFor(item: visual.Item): SnapMap {
        if (item instanceof visual.Solid) {
            return this.id2snaps.get(visual.Solid)!;
        } else if (item instanceof visual.SpaceInstance) {
            return this.id2snaps.get(visual.Curve3D)!;
        } else if (item instanceof visual.PlaneInstance) {
            return this.id2snaps.get(visual.Region)!;
        } else throw new Error(`Unsupported type: ${item.constructor.name}`);
    }

    private addFace(view: visual.Face, model: c3d.Face, into: Set<Snap>) {
        const faceSnap = this.identityMap.FaceSnap(view, model);
        const centerSnap = new FaceCenterPointSnap(point2point(model.Point(0.5, 0.5)), vec2vec(model.Normal(0.5, 0.5), 1), faceSnap);
        into.add(centerSnap);
    }

    private addEdge(view: visual.CurveEdge, model: c3d.CurveEdge, into: Set<Snap>) {
        const edgeSnap = this.identityMap.CurveEdgeSnap(view, model);
        const begPt = point2point(model.GetBegPoint());
        const endPt = point2point(model.GetEndPoint());
        const midPt = point2point(model.Point(0.5));
        const begTau = vec2vec(model.GetBegTangent(), 1);
        const endTau = vec2vec(model.GetEndTangent(), 1);
        const midTau = vec2vec(model.Tangent(0.5), 1);
        const begSnap = new EdgePointSnap("Beginning", begPt, begTau, edgeSnap);
        const endSnap = new EdgePointSnap("End", endPt, endTau, edgeSnap);
        const midSnap = new EdgePointSnap("Middle", midPt, midTau, edgeSnap);

        const underlying = model.GetSpaceCurve();
        if (underlying !== null) {
            if (underlying.IsA() === c3d.SpaceType.Arc3D) {
                const cast = underlying.Cast<c3d.Arc3D>(underlying.IsA());
                const centerSnap = new CircleCenterPointSnap(cast, view);
                into.add(centerSnap);

                const quartPt = point2point(model.Point(0.25));
                const threeQuartPt = point2point(model.Point(0.75));
                const quartTau = vec2vec(model.Tangent(0.25), 1);
                const threeQuartTau = vec2vec(model.Tangent(0.75), 1);

                const quarter = new EdgePointSnap("1/4", quartPt, quartTau, edgeSnap);
                const threeQuarter = new EdgePointSnap("3/4", threeQuartPt, threeQuartTau, edgeSnap);
                into.add(quarter);
                into.add(threeQuarter);
            } else if (underlying.IsA() === c3d.SpaceType.Nurbs3D) {
                const cast = underlying.Cast<c3d.Nurbs3D>(c3d.SpaceType.Nurbs3D);
                const { success, axis } = cast.GetCircleAxis();
                if (success && cast.IsPlanar()) {
                    const center = point2point(axis.GetOrigin());
                    const z = vec2vec(axis.GetAxisZ(), 1);
                    const centerSnap = new CircularNurbsCenterPointSnap(center, z, view);
                    into.add(centerSnap);
                }
            }
        }

        into.add(begSnap);
        into.add(midSnap);
        into.add(endSnap);
    }

    private addInstance(view: visual.SpaceInstance<visual.Curve3D>, into: Set<Snap>) {
        const inst = this.db.lookup(view);
        const item = inst2curve(inst)!;
        this.crosses.add(view.simpleName, item);
        const curveSnap = this.identityMap.CurveSnap(view, item);
        this.addCurve(curveSnap, item, item, into);
    }

    private addCurve(curveSnap: CurveSnap, item: c3d.Curve3D, ancestor: c3d.Curve3D, into: Set<Snap>) {
        if (item instanceof c3d.Polyline3D) {
            const points = item.GetPoints();
            const endSnaps = points.map(point =>
                new CurveEndPointSnap("End", point2point(point), curveSnap, ancestor.NearPointProjection(point, false).t)
            );
            for (const endSnap of endSnaps) into.add(endSnap);

            const first = point2point(points.shift()!);
            let prev = first;
            const mid = new THREE.Vector3();
            const midSnaps: CurvePointSnap[] = [];
            for (const point of points) {
                const current = point2point(point);
                mid.copy(prev).add(current).multiplyScalar(0.5);
                const midSnap = new CurvePointSnap("Mid", mid, curveSnap, ancestor.NearPointProjection(point2point(mid), false).t);
                midSnaps.push(midSnap);
                prev = current;
            }
            if (item.IsClosed()) {
                const current = first;
                mid.copy(prev).add(current).multiplyScalar(0.5);
                const midSnap = new CurvePointSnap("Mid", mid, curveSnap, ancestor.NearPointProjection(point2point(mid), false).t);
                midSnaps.push(midSnap);
            }
            for (const midSnap of midSnaps) into.add(midSnap);
        } else if (item instanceof c3d.Contour3D) {
            const corners = cornerInfo(item);
            const joints = [];
            for (const [, info] of corners) {
                const point = info.origin;
                const snap = new CurveEndPointSnap("Corner", point, curveSnap, ancestor.NearPointProjection(point2point(point), false).t)
                joints.push(snap);
            }
            for (const endSnap of joints) into.add(endSnap);
            const segments = item.GetSegments();
            for (const [i, segment] of segments.entries()) {
                const cast = segment.Cast<c3d.Curve3D>(segment.IsA());
                if (cast instanceof c3d.Polyline3D) {
                    const points = cast.GetPoints();
                    if (i > 0) points.shift(); // First and (potentially) last would be a joint
                    if (i < segments.length - 1) points.pop();
                    const endSnaps = points.map(point =>
                        new CurveEndPointSnap("End", point2point(point), curveSnap, ancestor.NearPointProjection(point, false).t)
                    );
                    for (const endSnap of endSnaps) into.add(endSnap);
                } else {
                    this.addCurve(curveSnap, segment.Cast<c3d.Curve3D>(segment.IsA()), ancestor, into);
                }
            }
            const begPt = item.GetLimitPoint(1);
            const beg = new CurveEndPointSnap("Beginning", point2point(begPt), curveSnap, ancestor.NearPointProjection(begPt, false).t)
            into.add(beg);

            const endPt = item.GetLimitPoint(2);
            const end = new CurveEndPointSnap("End", point2point(endPt), curveSnap, ancestor.NearPointProjection(endPt, false).t)
            into.add(end);
        } else if (item instanceof c3d.Arc3D) {
            const centerSnap = new CircleCurveCenterPointSnap(item, curveSnap);
            if (item.IsClosed()) {
                const zeroPt = point2point(item.PointOn(0));
                const quartPt = point2point(item.PointOn(2 * Math.PI / 4));
                const halfPt = point2point(item.PointOn(Math.PI));
                const threeQuartPt = point2point(item.PointOn(Math.PI * 3 / 2));

                const zeroSnap = new CurvePointSnap("Start", zeroPt, curveSnap, ancestor.NearPointProjection(point2point(zeroPt), false).t);
                const quartSnap = new CurvePointSnap("1/4", quartPt, curveSnap, ancestor.NearPointProjection(point2point(quartPt), false).t);
                const halfSnap = new CurvePointSnap("1/2", halfPt, curveSnap, ancestor.NearPointProjection(point2point(halfPt), false).t);
                const threeQuartSnap = new CurvePointSnap("3/4", threeQuartPt, curveSnap, ancestor.NearPointProjection(point2point(threeQuartPt), false).t);

                into.add(zeroSnap);
                into.add(quartSnap);
                into.add(halfSnap);
                into.add(threeQuartSnap);
            } else {
                const tmin = item.GetTMin();
                const tmax = item.GetTMax();
                const min = item.PointOn(tmin);
                const mid = item.PointOn(0.5 * (tmin + tmax));
                const max = item.PointOn(tmax);
                const begSnap = new CurveEndPointSnap("Beginning", point2point(min), curveSnap, ancestor.NearPointProjection(min, false).t);
                const midSnap = new CurveEndPointSnap("Middle", point2point(mid), curveSnap, ancestor.NearPointProjection(mid, false).t);
                const endSnap = new CurveEndPointSnap("End", point2point(max), curveSnap, ancestor.NearPointProjection(max, false).t);
                into.add(begSnap);
                into.add(midSnap);
                into.add(endSnap);
            }

            into.add(centerSnap);
        } else {
            if (item.IsClosed()) return;

            const min = item.PointOn(item.GetTMin());
            const mid = item.PointOn(0.5 * (item.GetTMin() + item.GetTMax()));
            const max = item.PointOn(item.GetTMax());
            const begSnap = new CurveEndPointSnap("Beginning", point2point(min), curveSnap, item.GetTMin());
            const midSnap = new CurveEndPointSnap("Middle", point2point(mid), curveSnap, 0.5 * (item.GetTMin() + item.GetTMax()));
            const endSnap = new CurveEndPointSnap("End", point2point(max), curveSnap, item.GetTMax());
            into.add(begSnap);
            if (item.IsStraight()) into.add(midSnap);
            into.add(endSnap);
        }
    }

    private delete(item: visual.Item) {
        const id2snaps = this.snapMapFor(item);
        id2snaps.delete(item.simpleName);
        this.hidden.delete(item.simpleName);
        if (item instanceof visual.SpaceInstance) this.crosses.remove(item.simpleName);
    }

    private hide(item: visual.Item) {
        const id = item.simpleName;
        const id2snaps = this.snapMapFor(item);
        const info = id2snaps.get(id);
        if (info === undefined) return;
        id2snaps.delete(id);
        this.hidden.set(id, info);
    }

    private unhide(item: visual.Item) {
        const id = item.simpleName;
        const id2snaps = this.snapMapFor(item);
        const info = this.hidden.get(id);
        if (info === undefined) return;
        id2snaps.set(id, info);
        this.hidden.delete(id);
    }

    saveToMemento(): SnapMemento {
        const id2snaps = this.id2snaps;
        const id2snapsCopy = copyId2Snaps(id2snaps);

        return new SnapMemento(
            id2snapsCopy,
            new Map(this.hidden));
    }

    restoreFromMemento(m: SnapMemento) {
        (this.id2snaps as SnapManager['id2snaps']) = copyId2Snaps(m.id2snaps);
        (this.hidden as SnapManager['hidden']) = new Map(m.hidden);
    }

    clear() {
        this.id2snaps.clear();
        this.hidden.clear();
        this.init();
    }

    validate() {
        for (const [, snaps] of this.id2snaps) {
            for (const id of snaps.keys()) {
                console.assert(this.db.lookupItemById(id) !== undefined, "item in database", id);
            }
        }
        for (const id of this.hidden.keys()) {
            console.assert(this.db.lookupItemById(id) !== undefined, "item in database", id);
        }
    }

    debug() {
        console.group("Snaps");
        console.groupEnd();
    }
}

const origin = new THREE.Vector3();
const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0)
const Z = new THREE.Vector3(0, 0, 1);

export const originSnap = new PointSnap("Origin");
export const xAxisSnap = new AxisSnap("X", X, origin, Z);
export const yAxisSnap = new AxisSnap("Y", Y, origin, Z);
export const zAxisSnap = new AxisSnap("Z", Z, origin, Z);

function copyId2Snaps(id2snaps: ReadonlyMap<DisablableType, ReadonlyMap<c3d.SimpleName, ReadonlySet<PointSnap>>>) {
    const id2snapsCopy = new Map<DisablableType, SnapMap>();
    for (const [key, value] of id2snaps) {
        id2snapsCopy.set(key, new Map(value));
    }
    return id2snapsCopy;
}
