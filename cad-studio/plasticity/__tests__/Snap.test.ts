import * as THREE from "three";
import c3d from '../build/Release/c3d.node';
import { ThreePointBoxFactory } from '../src/commands/box/BoxFactory';
import { CenterCircleFactory } from "../src/commands/circle/CircleFactory";
import CurveFactory from "../src/commands/curve/CurveFactory";
import LineFactory from "../src/commands/line/LineFactory";
import { CrossPointDatabase } from "../src/editor/curves/CrossPointDatabase";
import { EditorSignals } from '../src/editor/EditorSignals';
import { GeometryDatabase } from '../src/editor/GeometryDatabase';
import MaterialDatabase from '../src/editor/MaterialDatabase';
import { ParallelMeshCreator } from "../src/editor/MeshCreator";
import { ConstructionPlaneSnap, ScreenSpaceConstructionPlaneSnap } from "../src/editor/snaps/ConstructionPlaneSnap";
import {  CurveEdgeSnap, CurveSnap, FaceSnap, TanTanSnap } from "../src/editor/snaps/Snaps";
import { SnapManager } from "../src/editor/snaps/SnapManager";
import { SolidCopier } from "../src/editor/SolidCopier";
import * as visual from '../src/visual_model/VisualModel';
import { FakeMaterials } from "../__mocks__/FakeMaterials";
import './matchers';
import { AxisSnap } from "../src/editor/snaps/AxisSnap";
import { OrRestriction } from "../src/editor/snaps/Snap";
import { PlaneSnap } from "../src/editor/snaps/PlaneSnap";
import { PointSnap } from "../src/editor/snaps/PointSnap";
import { Scene } from "../src/editor/Scene";
import { Images } from "../src/editor/Images";
import { Empties } from "../src/editor/Empties";

let db: GeometryDatabase;
let scene: Scene;
let snaps: SnapManager;
let materials: MaterialDatabase;
let images: Images;
let empties: Empties;
let signals: EditorSignals;
let intersect: jest.Mock<any, any>;
let raycaster: THREE.Raycaster;
let camera: THREE.Camera;
let bbox: THREE.Box3;

beforeEach(() => {
    materials = new FakeMaterials();
    signals = new EditorSignals();
    db = new GeometryDatabase(new ParallelMeshCreator(), new SolidCopier(), materials, signals);
    images = new Images();
    empties = new Empties(images, signals);
    scene = new Scene(db, empties, materials, signals);
    snaps = new SnapManager(db, scene, new CrossPointDatabase(), signals);
    camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 0, 1);
    bbox = new THREE.Box3();

    intersect = jest.fn();
    raycaster = {
        intersectObjects: intersect
    } as unknown as THREE.Raycaster;
})

describe(AxisSnap, () => {
    test("project", () => {
        expect(AxisSnap.X.project(new THREE.Vector3(0, 0, 0)).position).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));
        expect(AxisSnap.X.project(new THREE.Vector3(1, 0, 0)).position).toApproximatelyEqual(new THREE.Vector3(1, 0, 0));
        expect(AxisSnap.X.project(new THREE.Vector3(0, 1, 0)).position).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));

        const moved = AxisSnap.X.move(new THREE.Vector3(0, 0, 1));
        expect(moved.project(new THREE.Vector3(1, 0, 1)).position).toApproximatelyEqual(new THREE.Vector3(1, 0, 1));
    });

    test("isValid", () => {
        expect(AxisSnap.X.isValid(new THREE.Vector3(0, 0, 0))).toBe(true);

        expect(AxisSnap.X.isValid(new THREE.Vector3(1, 0, 0))).toBe(true);

        expect(AxisSnap.X.isValid(new THREE.Vector3(0, 1, 0))).toBe(false);
    });

    test("isValid when line is moved", () => {
        const axis = AxisSnap.Z.move(new THREE.Vector3(1, 0, 0));
        expect(axis.isValid(new THREE.Vector3(1, 0, 0))).toBe(true);
        expect(axis.isValid(new THREE.Vector3(1, 0, 1))).toBe(true);
        expect(axis.isValid(new THREE.Vector3(1, 0, 10))).toBe(true);
        expect(axis.isValid(new THREE.Vector3(1, 1, 10))).toBe(false);
    });
})

describe(OrRestriction, () => {
    test("isValid", () => {
        const or = new OrRestriction([AxisSnap.X, AxisSnap.Y]);
        expect(or.isValid(new THREE.Vector3(1, 0, 0))).toBe(true);
        expect(or.isValid(new THREE.Vector3(0, 1, 0))).toBe(true);
        expect(or.isValid(new THREE.Vector3(0, 0, 1))).toBe(false);
    })
})

describe(CurveEdgeSnap, () => {
    let box: visual.Solid;
    let snap: CurveEdgeSnap;
    const e = {} as PointerEvent;

    beforeEach(async () => {
        const makeBox = new ThreePointBoxFactory(db, materials, signals);
        makeBox.p1 = new THREE.Vector3();
        makeBox.p2 = new THREE.Vector3(1, 0, 0);
        makeBox.p3 = new THREE.Vector3(1, 1, 0);
        makeBox.p4 = new THREE.Vector3(1, 1, 1);
        box = await makeBox.commit() as visual.Solid;
        const edge = box.edges.get(0); // this is the edge from 0,0,0 to 0,1,0
        const model = db.lookupTopologyItem(edge);
        snap = new CurveEdgeSnap(edge, model);
    })

    test("project", () => {
        expect(snap.project(new THREE.Vector3(0, 0, 0)).position).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));
        expect(snap.project(new THREE.Vector3(1, 0.5, 0)).position).toApproximatelyEqual(new THREE.Vector3(0, 0.5, 0));
        expect(snap.project(new THREE.Vector3(2, 1, 0)).position).toApproximatelyEqual(new THREE.Vector3(0, 1, 0));
        expect(snap.project(new THREE.Vector3(0, 0.5, 1)).position).toApproximatelyEqual(new THREE.Vector3(0, 0.5, 0));
    })

    test("isValid", () => {
        expect(snap.isValid(new THREE.Vector3(0, 0, 0))).toBe(true);
        expect(snap.isValid(new THREE.Vector3(0, 0.5, 0))).toBe(true);
        expect(snap.isValid(new THREE.Vector3(0, 1, 0))).toBe(true);
        expect(snap.isValid(new THREE.Vector3(1, 0, 0))).toBe(false);
        expect(snap.isValid(new THREE.Vector3(0, 0, 1))).toBe(false);
    })
})

describe(CurveSnap, () => {
    let line: visual.SpaceInstance<visual.Curve3D>;
    let snap: CurveSnap;

    beforeEach(async () => {
        const makeLine = new LineFactory(db, materials, signals);
        makeLine.p1 = new THREE.Vector3();
        makeLine.p2 = new THREE.Vector3(0, 1, 0);
        line = await makeLine.commit() as visual.SpaceInstance<visual.Curve3D>;
        const inst = db.lookup(line) as c3d.SpaceInstance;
        const item = inst.GetSpaceItem()!;
        snap = new CurveSnap(line, item.Cast(item.IsA()));
    })

    test("project", () => {
        expect(snap.project(new THREE.Vector3(0, 0, 0)).position).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));
        expect(snap.project(new THREE.Vector3(1, 0.5, 0)).position).toApproximatelyEqual(new THREE.Vector3(0, 0.5, 0));
        expect(snap.project(new THREE.Vector3(2, 1, 0)).position).toApproximatelyEqual(new THREE.Vector3(0, 1, 0));
        expect(snap.project(new THREE.Vector3(0, 0.5, 1)).position).toApproximatelyEqual(new THREE.Vector3(0, 0.5, 0));
    })

    test("isValid", () => {
        expect(snap.isValid(new THREE.Vector3(0, 0, 0))).toBe(true);
        expect(snap.isValid(new THREE.Vector3(0, 0.5, 0))).toBe(true);
        expect(snap.isValid(new THREE.Vector3(0, 1, 0))).toBe(true);
        expect(snap.isValid(new THREE.Vector3(1, 0, 0))).toBe(false);
        expect(snap.isValid(new THREE.Vector3(0, 0, 1))).toBe(false);
    })

    describe("addAdditionalSnapsTo", () => {
        test("when curvy", async () => {
            const makeCurve = new CurveFactory(db, materials, signals);
            makeCurve.points.push(new THREE.Vector3());
            makeCurve.points.push(new THREE.Vector3(0, 1, 0));
            makeCurve.points.push(new THREE.Vector3(1, 2, 0));
            const curve = await makeCurve.commit() as visual.SpaceInstance<visual.Curve3D>;
            const inst = db.lookup(curve) as c3d.SpaceInstance;
            const item = inst.GetSpaceItem()!;
            const snap = new CurveSnap(curve, item.Cast(item.IsA()));

            const additional = snap.additionalSnapsFor(new THREE.Vector3(0, 1, 0));

            expect(additional[0]).toBeInstanceOf(AxisSnap);
            expect(additional[1]).toBeInstanceOf(AxisSnap);
            expect(additional[2]).toBeInstanceOf(AxisSnap);

            expect(additional[0].n).toApproximatelyEqual(new THREE.Vector3(0.945, -0.316, 0));
            expect(additional[0].o).toApproximatelyEqual(new THREE.Vector3(0, 1, 0));

            expect(additional[1].n).toApproximatelyEqual(new THREE.Vector3(0, 0, -1));
            expect(additional[1].o).toApproximatelyEqual(new THREE.Vector3(0, 1, 0));

            expect(additional[2].n).toApproximatelyEqual(new THREE.Vector3(0.316, 0.948, 0));
            expect(additional[2].o).toApproximatelyEqual(new THREE.Vector3(0, 1, 0));
        })

        test("when straight along X", async () => {
            const makeLine = new LineFactory(db, materials, signals);
            makeLine.p1 = new THREE.Vector3();
            makeLine.p2 = new THREE.Vector3(1, 0, 0);
            const line = await makeLine.commit() as visual.SpaceInstance<visual.Curve3D>;
            const inst = db.lookup(line) as c3d.SpaceInstance;
            const item = inst.GetSpaceItem()!;
            const snap = new CurveSnap(line, item.Cast(item.IsA()));

            const additional = snap.additionalSnapsFor(makeLine.p2);

            expect(additional[0]).toBeInstanceOf(AxisSnap);
            expect(additional[1]).toBeInstanceOf(AxisSnap);
            expect(additional[2]).toBeInstanceOf(AxisSnap);

            expect(additional[0].n).toApproximatelyEqual(new THREE.Vector3(0, -1, 0));
            expect(additional[0].o).toApproximatelyEqual(makeLine.p2);

            expect(additional[1].n).toApproximatelyEqual(new THREE.Vector3(0, 0, 1));
            expect(additional[1].o).toApproximatelyEqual(makeLine.p2);

            expect(additional[2].n).toApproximatelyEqual(new THREE.Vector3(1, 0, 0));
            expect(additional[2].o).toApproximatelyEqual(makeLine.p2);
        })

        test("when straight along Y", async () => {
            const makeLine = new LineFactory(db, materials, signals);
            makeLine.p1 = new THREE.Vector3();
            makeLine.p2 = new THREE.Vector3(0, 1, 0);
            const line = await makeLine.commit() as visual.SpaceInstance<visual.Curve3D>;
            const inst = db.lookup(line) as c3d.SpaceInstance;
            const item = inst.GetSpaceItem()!;
            const snap = new CurveSnap(line, item.Cast(item.IsA()));

            const additional = snap.additionalSnapsFor(makeLine.p2);

            expect(additional[0]).toBeInstanceOf(AxisSnap);
            expect(additional[1]).toBeInstanceOf(AxisSnap);
            expect(additional[2]).toBeInstanceOf(AxisSnap);

            expect(additional[0].n).toApproximatelyEqual(new THREE.Vector3(1, 0, 0));
            expect(additional[0].o).toApproximatelyEqual(makeLine.p2);

            expect(additional[1].n).toApproximatelyEqual(new THREE.Vector3(0, 0, 1));
            expect(additional[1].o).toApproximatelyEqual(makeLine.p2);

            expect(additional[2].n).toApproximatelyEqual(makeLine.p2);
            expect(additional[2].o).toApproximatelyEqual(makeLine.p2);
        })

        test("when straight along Z", async () => {
            const makeLine = new LineFactory(db, materials, signals);
            makeLine.p1 = new THREE.Vector3();
            makeLine.p2 = new THREE.Vector3(0, 0, 1);
            const line = await makeLine.commit() as visual.SpaceInstance<visual.Curve3D>;
            const inst = db.lookup(line) as c3d.SpaceInstance;
            const item = inst.GetSpaceItem()!;
            const snap = new CurveSnap(line, item.Cast(item.IsA()));

            const additional = snap.additionalSnapsFor(makeLine.p2);

            expect(additional[0]).toBeInstanceOf(AxisSnap);
            expect(additional[1]).toBeInstanceOf(AxisSnap);
            expect(additional[2]).toBeInstanceOf(AxisSnap);

            expect(additional[0].n).toApproximatelyEqual(new THREE.Vector3(-1, 0, 0));
            expect(additional[0].o).toApproximatelyEqual(makeLine.p2);

            expect(additional[1].n).toApproximatelyEqual(new THREE.Vector3(0, 1, 0));
            expect(additional[1].o).toApproximatelyEqual(makeLine.p2);

            expect(additional[2].n).toApproximatelyEqual(new THREE.Vector3(0, 0, 1));
            expect(additional[2].o).toApproximatelyEqual(makeLine.p2);
        })
    })

    test('additionalSnapsForLast', () => {
        let result;
        result = snap.additionalSnapsGivenPreviousSnap(new THREE.Vector3(0, 10, 0), new PlaneSnap());
        expect(result.length).toBe(1);
        expect(result[0]).toBeInstanceOf(PointSnap);
        expect(result[0].name).toBe("Tangent");

        result = snap.additionalSnapsGivenPreviousSnap(new THREE.Vector3(0, 10, 10), new PlaneSnap());
        expect(result.length).toBe(0);
    });

    test('additionalSnapsForLast when given a coplanar curve snap', async () => {
        let snap1: CurveSnap;
        let snap2: CurveSnap;
        {
            const makeCircle = new CenterCircleFactory(db, materials, signals);
            makeCircle.center = new THREE.Vector3(-2, 0, 0);
            makeCircle.radius = 1;
            const circle1 = await makeCircle.commit() as visual.SpaceInstance<visual.Curve3D>;
            const inst = db.lookup(circle1);
            const item = inst.GetSpaceItem()!;
            const model1 = item.Cast<c3d.Curve3D>(item.IsA());
            snap1 = new CurveSnap(circle1, model1);
        }

        {
            const makeCircle = new CenterCircleFactory(db, materials, signals);
            makeCircle.center = new THREE.Vector3(2, 0, 0);
            makeCircle.radius = 1;
            const circle2 = await makeCircle.commit() as visual.SpaceInstance<visual.Curve3D>;
            const inst = db.lookup(circle2);
            const item = inst.GetSpaceItem()!;
            const model2 = item.Cast<c3d.Curve3D>(item.IsA());
            snap2 = new CurveSnap(circle2, model2);
        }

        const snaps = snap1.additionalSnapsGivenPreviousSnap(new THREE.Vector3(), snap2);
        expect(snaps.length).toBe(6);
        expect(snaps[2]).toBeInstanceOf(TanTanSnap);
        expect(snaps[3]).toBeInstanceOf(TanTanSnap);
        let tantan = snaps[2] as TanTanSnap;
        expect(tantan.point1).toApproximatelyEqual(new THREE.Vector3(2, -1, 0));
        expect(tantan.point2).toApproximatelyEqual(new THREE.Vector3(-2, -1, 0));
        tantan = snaps[3] as TanTanSnap;
        expect(tantan.point1).toApproximatelyEqual(new THREE.Vector3(2, 1, 0));
        expect(tantan.point2).toApproximatelyEqual(new THREE.Vector3(-2, 1, 0));
    });
})

describe(FaceSnap, () => {
    let box: visual.Solid;
    let snap: FaceSnap;
    const e = {} as PointerEvent;

    beforeEach(async () => {
        const makeBox = new ThreePointBoxFactory(db, materials, signals);
        makeBox.p1 = new THREE.Vector3();
        makeBox.p2 = new THREE.Vector3(1, 0, 0);
        makeBox.p3 = new THREE.Vector3(1, 1, 0);
        makeBox.p4 = new THREE.Vector3(1, 1, 1);
        box = await makeBox.commit() as visual.Solid;
        const face = box.faces.get(0); // bottom face
        const model = db.lookupTopologyItem(face);
        snap = new FaceSnap(face, model);
    })

    test("project", () => {
        expect(snap.project(new THREE.Vector3(0, 0, 0)).position).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));
        expect(snap.project(new THREE.Vector3(1, 0.5, 0)).position).toApproximatelyEqual(new THREE.Vector3(1, 0.5, 0));
        expect(snap.project(new THREE.Vector3(2, 1, 0)).position).toApproximatelyEqual(new THREE.Vector3(1, 1, 0));
        expect(snap.project(new THREE.Vector3(0, 0.5, 1)).position).toApproximatelyEqual(new THREE.Vector3(0, 0.5, 0));
    })

    test("isValid", () => {
        expect(snap.isValid(new THREE.Vector3(0, 0, 0))).toBe(true);
        expect(snap.isValid(new THREE.Vector3(0, 0.5, 0))).toBe(true);
        expect(snap.isValid(new THREE.Vector3(0, 1, 0))).toBe(true);
        expect(snap.isValid(new THREE.Vector3(1, 0, 0))).toBe(true);
        expect(snap.isValid(new THREE.Vector3(10, 0, 0))).toBe(false);
        expect(snap.isValid(new THREE.Vector3(0, 0, 1))).toBe(false);
    })
})

describe(PointSnap, () => {
    test("project", () => {
        let snap: PointSnap;
        snap = new PointSnap(undefined, new THREE.Vector3(0, 0, 0));
        expect(snap.project(new THREE.Vector3(0, 0, 0)).position).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));
        expect(snap.project(new THREE.Vector3(1, 1, 1)).position).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));

        snap = new PointSnap(undefined, new THREE.Vector3(1, 1, 1));
        expect(snap.project(new THREE.Vector3(0, 0, 0)).position).toApproximatelyEqual(new THREE.Vector3(1, 1, 1));
        expect(snap.project(new THREE.Vector3(1, 1, 1)).position).toApproximatelyEqual(new THREE.Vector3(1, 1, 1));
    })

    test("isValid", () => {
        let snap: PointSnap;
        snap = new PointSnap(undefined, new THREE.Vector3(0, 0, 0));
        expect(snap.isValid(new THREE.Vector3(0, 0, 0))).toBe(true);
        expect(snap.isValid(new THREE.Vector3(1, 1, 1))).toBe(false);

        snap = new PointSnap(undefined, new THREE.Vector3(1, 1, 1));
        expect(snap.isValid(new THREE.Vector3(0, 0, 0))).toBe(false);
        expect(snap.isValid(new THREE.Vector3(1, 1, 1))).toBe(true);
    })
});

describe(ScreenSpaceConstructionPlaneSnap, () => {
    test("delegates to basis when unset", () => {
        const basis = new ConstructionPlaneSnap(new THREE.Vector3(1, 0, 0));
        const ss = new ScreenSpaceConstructionPlaneSnap(basis);
        expect(ss.n).toEqual(basis.n);
        expect(ss.p).toEqual(basis.p);
    });

    test("uses new values when set", () => {
        const basis = new ConstructionPlaneSnap(new THREE.Vector3(1, 0, 0));
        const ss = new ScreenSpaceConstructionPlaneSnap(basis);
        const point = new THREE.Vector3(10, 10, 10);
        const X = new THREE.Vector3(1, 0, 0);
        const Y = new THREE.Vector3(0, 1, 0);
        const cameraOrientation = new THREE.Quaternion().setFromUnitVectors(X, Y);
        ss.set({ point, info: { cameraOrientation } });
        expect(ss.n).toApproximatelyEqual(new THREE.Vector3(0, 0, 1));
        expect(ss.p).toApproximatelyEqual(point);

        ss.reset();
        expect(ss.n).toEqual(basis.n);
        expect(ss.p).toEqual(basis.p);
    });

})