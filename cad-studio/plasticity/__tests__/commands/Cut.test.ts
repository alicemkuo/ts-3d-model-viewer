import * as THREE from "three";
import { bestPlacementForCut, CutAndSplitFactory, CutFactory, MultiCutFactory, SplitFactory } from '../../src/commands/boolean/CutFactory';
import { CenterBoxFactory, ThreePointBoxFactory } from "../../src/commands/box/BoxFactory";
import CurveFactory from "../../src/commands/curve/CurveFactory";
import SphereFactory from '../../src/commands/sphere/SphereFactory';
import { EditorSignals } from '../../src/editor/EditorSignals';
import { GeometryDatabase } from '../../src/editor/GeometryDatabase';
import MaterialDatabase from '../../src/editor/MaterialDatabase';
import { ParallelMeshCreator } from "../../src/editor/MeshCreator";
import { PlaneSnap } from "../../src/editor/snaps/PlaneSnap";
import { SolidCopier } from "../../src/editor/SolidCopier";
import { point2point, vec2vec } from "../../src/util/Conversion";
import * as visual from '../../src/visual_model/VisualModel';
import { FakeMaterials } from "../../__mocks__/FakeMaterials";
import '../matchers';

let db: GeometryDatabase;
let materials: Required<MaterialDatabase>;
let signals: EditorSignals;


beforeEach(() => {
    materials = new FakeMaterials();
    signals = new EditorSignals();
    db = new GeometryDatabase(new ParallelMeshCreator(), new SolidCopier(), materials, signals);
})

describe(CutFactory, () => {
    let sphere: visual.Solid;
    beforeEach(async () => {
        const makeSphere = new SphereFactory(db, materials, signals);
        makeSphere.center = new THREE.Vector3(0, 0, 0);
        makeSphere.radius = 1;
        sphere = await makeSphere.commit() as visual.Solid;
    })

    test('takes a cutting curve and a solid and produces a divided solid', async () => {
        const makeCurve = new CurveFactory(db, materials, signals);
        makeCurve.points.push(new THREE.Vector3(-2, 2, 0));
        makeCurve.points.push(new THREE.Vector3(0, 2, 0.5));
        makeCurve.points.push(new THREE.Vector3(2, 2, 0));
        const curve = await makeCurve.commit() as visual.SpaceInstance<visual.Curve3D>;

        const cut = new CutFactory(db, materials, signals);
        cut.solid = sphere;
        cut.curve = curve;
        const result = await cut.commit() as visual.SpaceItem[];

        expect(result.length).toBe(2);
    });

    test('works with lines', async () => {
        const makeLine = new CurveFactory(db, materials, signals);
        makeLine.points.push(new THREE.Vector3(-2, -2, 0));
        makeLine.points.push(new THREE.Vector3(2, 2, 0));
        const line = await makeLine.commit() as visual.SpaceInstance<visual.Curve3D>;

        const cut = new CutFactory(db, materials, signals);
        cut.constructionPlane = new PlaneSnap(new THREE.Vector3(0, 0, 1));
        cut.solid = sphere;
        cut.curve = line;
        const result = await cut.commit() as visual.SpaceItem[];

        expect(result.length).toBe(2);
    });

    test('works with lines parallel to Y axis (negative)', async () => {
        const makeLine = new CurveFactory(db, materials, signals);
        makeLine.points.push(new THREE.Vector3(-2, -2, 0));
        makeLine.points.push(new THREE.Vector3(2, -2, 0));
        const line = await makeLine.commit() as visual.SpaceInstance<visual.Curve3D>;

        const cut = new CutFactory(db, materials, signals);
        cut.constructionPlane = new PlaneSnap(new THREE.Vector3(0, 0, 1));
        cut.solid = sphere;
        cut.curve = line;
        const result = await cut.commit() as visual.SpaceItem[];

        expect(result.length).toBe(2);
    });

    test('works with lines parallel to X axis (positive)', async () => {
        const makeLine = new CurveFactory(db, materials, signals);
        makeLine.points.push(new THREE.Vector3(-2, 2, 0));
        makeLine.points.push(new THREE.Vector3(2, 2, 0));
        const line = await makeLine.commit() as visual.SpaceInstance<visual.Curve3D>;

        const cut = new CutFactory(db, materials, signals);
        cut.constructionPlane = new PlaneSnap(new THREE.Vector3(0, 0, 1));
        cut.solid = sphere;
        cut.curve = line;
        const result = await cut.commit() as visual.SpaceItem[];

        expect(result.length).toBe(2);
    });


    test('works with lines parallel to X axis (negative)', async () => {
        const makeLine = new CurveFactory(db, materials, signals);
        makeLine.points.push(new THREE.Vector3(-2, -2, 0));
        makeLine.points.push(new THREE.Vector3(-2, 2, 0));
        const line = await makeLine.commit() as visual.SpaceInstance<visual.Curve3D>;

        const cut = new CutFactory(db, materials, signals);
        cut.constructionPlane = new PlaneSnap(new THREE.Vector3(0, 0, 1));
        cut.solid = sphere;
        cut.curve = line;
        const result = await cut.commit() as visual.SpaceItem[];

        expect(result.length).toBe(2);
    });

    test('works with lines parallel to X axis (positive)', async () => {
        const makeLine = new CurveFactory(db, materials, signals);
        makeLine.points.push(new THREE.Vector3(2, -2, 0));
        makeLine.points.push(new THREE.Vector3(2, 2, 0));
        const line = await makeLine.commit() as visual.SpaceInstance<visual.Curve3D>;

        const cut = new CutFactory(db, materials, signals);
        cut.constructionPlane = new PlaneSnap(new THREE.Vector3(0, 0, 1));
        cut.solid = sphere;
        cut.curve = line;
        const result = await cut.commit() as visual.SpaceItem[];

        expect(result.length).toBe(2);
    });

    test('works with diagonal lines on y to z', async () => {
        const makeLine = new CurveFactory(db, materials, signals);
        makeLine.points.push(new THREE.Vector3(0, 1, 0));
        makeLine.points.push(new THREE.Vector3(0, -1, 2));
        const line = await makeLine.commit() as visual.SpaceInstance<visual.Curve3D>;

        const cut = new CutFactory(db, materials, signals);
        cut.constructionPlane = new PlaneSnap(new THREE.Vector3(0, 0, 1));
        cut.solid = sphere;
        cut.curve = line;
        const result = await cut.commit() as visual.SpaceItem[];

        expect(result.length).toBe(2);
    });

    test('works with faces', async () => {
        const makeBox = new ThreePointBoxFactory(db, materials, signals);
        makeBox.p1 = new THREE.Vector3();
        makeBox.p2 = new THREE.Vector3(0.5, 0, 0);
        makeBox.p3 = new THREE.Vector3(0.5, 0.5, 0);
        makeBox.p4 = new THREE.Vector3(0.5, 0.5, 0.5);
        const box = await makeBox.commit() as visual.Solid;

        const cut = new CutFactory(db, materials, signals);
        cut.constructionPlane = new PlaneSnap(new THREE.Vector3(0, 0, 1));
        cut.solid = sphere;
        cut.surface = box.faces.get(0);
        const result = await cut.commit() as visual.SpaceItem[];

        expect(result.length).toBe(2);
    });

    test('works with axes', async () => {
        const cut = new CutFactory(db, materials, signals);
        cut.constructionPlane = new PlaneSnap(new THREE.Vector3(0, 0, 1));
        cut.solid = sphere;
        cut.axis = 'X';
        const result = await cut.commit() as visual.SpaceItem[];
        expect(result.length).toBe(2);
    })
});

describe(SplitFactory, () => {
    test('cuts faces', async () => {
        const makeBox = new ThreePointBoxFactory(db, materials, signals);
        makeBox.p1 = new THREE.Vector3();
        makeBox.p2 = new THREE.Vector3(1, 0, 0);
        makeBox.p3 = new THREE.Vector3(1, 1, 0);
        makeBox.p4 = new THREE.Vector3(1, 1, 1);
        const box = await makeBox.commit() as visual.Solid;
        expect([...box.faces].length).toBe(6);

        const makeLine = new CurveFactory(db, materials, signals);
        makeLine.points.push(new THREE.Vector3(-2, -2, 0));
        makeLine.points.push(new THREE.Vector3(2, 2, 0));
        const line = await makeLine.commit() as visual.SpaceInstance<visual.Curve3D>;

        const split = new SplitFactory(db, materials, signals);
        split.constructionPlane = new PlaneSnap(new THREE.Vector3(0, 0, 1));
        split.faces = [box.faces.get(0)];
        split.curve = line;
        const result = await split.commit() as visual.Solid;

        expect([...result.faces].length).toBe(7);
    });
});

describe(CutAndSplitFactory, () => {
    test('cuts faces', async () => {
        const makeBox = new ThreePointBoxFactory(db, materials, signals);
        makeBox.p1 = new THREE.Vector3();
        makeBox.p2 = new THREE.Vector3(1, 0, 0);
        makeBox.p3 = new THREE.Vector3(1, 1, 0);
        makeBox.p4 = new THREE.Vector3(1, 1, 1);
        const box = await makeBox.commit() as visual.Solid;
        expect([...box.faces].length).toBe(6);

        const makeLine = new CurveFactory(db, materials, signals);
        makeLine.points.push(new THREE.Vector3(-2, -2, 0));
        makeLine.points.push(new THREE.Vector3(2, 2, 0));
        const line = await makeLine.commit() as visual.SpaceInstance<visual.Curve3D>;

        const split = new CutAndSplitFactory(db, materials, signals);
        split.constructionPlane = new PlaneSnap(new THREE.Vector3(0, 0, 1));
        split.faces = [box.faces.get(0)];
        split.curve = line;
        const results = await split.commit() as visual.Solid[];
        const result = results[0];

        expect([...result.faces].length).toBe(7);
    });

    test('works with lines', async () => {
        const makeSphere = new SphereFactory(db, materials, signals);
        makeSphere.center = new THREE.Vector3(0, 0, 0);
        makeSphere.radius = 1;
        const sphere = await makeSphere.commit() as visual.Solid;

        const makeLine = new CurveFactory(db, materials, signals);
        makeLine.points.push(new THREE.Vector3(-2, -2, 0));
        makeLine.points.push(new THREE.Vector3(2, 2, 0));
        const line = await makeLine.commit() as visual.SpaceInstance<visual.Curve3D>;

        const cut = new CutAndSplitFactory(db, materials, signals);
        cut.constructionPlane = new PlaneSnap(new THREE.Vector3(0, 0, 1));
        cut.solid = sphere;
        cut.curve = line;
        const result = await cut.commit() as visual.SpaceItem[];

        expect(result.length).toBe(2);
    });
});

describe(MultiCutFactory, () => {
    let cut: MultiCutFactory;
    beforeEach(() => {
        cut = new MultiCutFactory(db, materials, signals);
    })

    let sphere: visual.Solid;
    beforeEach(async () => {
        const makeSphere = new SphereFactory(db, materials, signals);
        makeSphere.center = new THREE.Vector3(0, 0, 0);
        makeSphere.radius = 1;
        sphere = await makeSphere.commit() as visual.Solid;
    })

    let box: visual.Solid;
    beforeEach(async () => {
        const makeBox = new CenterBoxFactory(db, materials, signals);
        makeBox.p1 = new THREE.Vector3();
        makeBox.p2 = new THREE.Vector3(0.25, 0.25, 0);
        makeBox.p3 = new THREE.Vector3(0.25, 0.25, -0.25);
        box = await makeBox.commit() as visual.Solid;
    })

    it('cuts multiply', async () => {
        cut.solids = [sphere];
        cut.surfaces = [...box.faces];
        const result = await cut.commit() as visual.Solid[];
        expect(result.length).toBe(27);
    })
})

describe(bestPlacementForCut, () => {
    const min = new THREE.Vector3(-1, -1, -1);
    const max = new THREE.Vector3(1, 1, 1);
    const bbox = new THREE.Box3(min, max);

    test('works with lines parallel to X axis (negative)', async () => {
        const limit1 = new THREE.Vector3(-2, -2, 0);
        const limit2 = new THREE.Vector3(2, -2, 0);
        const result = vec2vec(bestPlacementForCut(bbox, limit1, limit2)!.GetAxisZ(), 1);
        expect(result).toApproximatelyEqual(Y)
    });

    test('works with lines parallel to X axis (positive)', async () => {
        const limit1 = new THREE.Vector3(-2, 2, 0);
        const limit2 = new THREE.Vector3(2, 2, 0);
        const result = vec2vec(bestPlacementForCut(bbox, limit1, limit2)!.GetAxisZ(), 1);
        expect(result).toApproximatelyEqual(Y)
    });

    test('works with lines parallel to Y axis (negative)', async () => {
        const limit1 = new THREE.Vector3(-2, -2, 0);
        const limit2 = new THREE.Vector3(-2, 2, 0);
        const result = vec2vec(bestPlacementForCut(bbox, limit1, limit2)!.GetAxisZ(), 1);
        expect(result).toApproximatelyEqual(X)
    });

    test('works with lines parallel to Y axis (positive)', async () => {
        const limit1 = new THREE.Vector3(2, -2, 0);
        const limit2 = new THREE.Vector3(2, 2, 0);
        const result = vec2vec(bestPlacementForCut(bbox, limit1, limit2)!.GetAxisZ(), 1);
        expect(result).toApproximatelyEqual(X)
    });

    test('works with lines parallel to Z axis (front)', async () => {
        const limit1 = new THREE.Vector3(-2, 0, -2);
        const limit2 = new THREE.Vector3(-2, 0, 2);
        const result = vec2vec(bestPlacementForCut(bbox, limit1, limit2)!.GetAxisZ(), 1);
        expect(result).toApproximatelyEqual(X)
    });

    test('works with lines parallel to Z axis (front)', async () => {
        const limit1 = new THREE.Vector3(2, 0, -2);
        const limit2 = new THREE.Vector3(2, 0, 2);
        const result = vec2vec(bestPlacementForCut(bbox, limit1, limit2)!.GetAxisZ(), 1);
        expect(result).toApproximatelyEqual(X)
    });


    test('works with lines parallel to Z axis (front)', async () => {
        const limit1 = new THREE.Vector3(0, -2, -2);
        const limit2 = new THREE.Vector3(0, -2, 2);
        const result = vec2vec(bestPlacementForCut(bbox, limit1, limit2)!.GetAxisZ(), 1);
        expect(result).toApproximatelyEqual(Y)
    });

    test('works with lines parallel to Z axis (front)', async () => {
        const limit1 = new THREE.Vector3(0, 2, -2);
        const limit2 = new THREE.Vector3(0, 2, 2);
        const result = vec2vec(bestPlacementForCut(bbox, limit1, limit2)!.GetAxisZ(), 1);
        expect(result).toApproximatelyEqual(Y)
    });
  })

const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 0);