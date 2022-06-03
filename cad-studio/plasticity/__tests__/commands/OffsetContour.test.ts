import * as THREE from "three";
import c3d from '../../build/Release/c3d.node';
import { ThreePointBoxFactory } from "../../src/commands/box/BoxFactory";
import { CenterCircleFactory } from "../../src/commands/circle/CircleFactory";
import CurveFactory from "../../src/commands/curve/CurveFactory";
import OffsetCurveFactory, { OffsetFaceFactory, OffsetSpaceCurveFactory } from "../../src/commands/curve/OffsetContourFactory";
import CylinderFactory from "../../src/commands/cylinder/CylinderFactory";
import { EditorSignals } from '../../src/editor/EditorSignals';
import { GeometryDatabase } from '../../src/editor/GeometryDatabase';
import MaterialDatabase from '../../src/editor/MaterialDatabase';
import { ParallelMeshCreator } from "../../src/editor/MeshCreator";
import { ConstructionPlaneSnap } from "../../src/editor/snaps/ConstructionPlaneSnap";
import { SolidCopier } from "../../src/editor/SolidCopier";
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

describe(OffsetFaceFactory, () => {
    let offsetContour: OffsetFaceFactory;

    beforeEach(() => {
        offsetContour = new OffsetFaceFactory(db, materials, signals);
    });

    describe('faces', () => {
        let cylinder: visual.Solid;

        beforeEach(async () => {
            const makeCylinder = new CylinderFactory(db, materials, signals);
            makeCylinder.p0 = new THREE.Vector3();
            makeCylinder.p1 = new THREE.Vector3(1, 0, 0);
            makeCylinder.p2 = new THREE.Vector3(0, 0, 10);
            cylinder = await makeCylinder.commit() as visual.Solid;
        })

        test('it works', async () => {
            offsetContour.face = cylinder.faces.get(1);
            offsetContour.distance = 0.1;

            expect(offsetContour.center).toApproximatelyEqual(new THREE.Vector3());
            expect(offsetContour.normal).toApproximatelyEqual(new THREE.Vector3(0, 0, 1));

            const curve = await offsetContour.commit() as visual.SpaceInstance<visual.Curve3D>;
            const bbox = new THREE.Box3().setFromObject(curve);
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            expect(center).toApproximatelyEqual(new THREE.Vector3());
            expect(bbox.min).toApproximatelyEqual(new THREE.Vector3(-1.1, -1.1, 0));
            expect(bbox.max).toApproximatelyEqual(new THREE.Vector3(1.1, 1.1, 0));
        });
    });
});

describe(OffsetSpaceCurveFactory, () => {
    let offsetCurve: OffsetSpaceCurveFactory;

    beforeEach(() => {
        offsetCurve = new OffsetSpaceCurveFactory(db, materials, signals);
    });

    describe('planar curves', () => {
        let circle: visual.SpaceInstance<visual.Curve3D>;

        beforeEach(async () => {
            const makeCircle = new CenterCircleFactory(db, materials, signals);
            makeCircle.center = new THREE.Vector3();
            makeCircle.radius = 1;
            circle = await makeCircle.commit() as visual.SpaceInstance<visual.Curve3D>;
        })

        test('distance > 0', async () => {
            offsetCurve.curve = circle;
            offsetCurve.distance = 0.1;

            expect(offsetCurve.center).toApproximatelyEqual(new THREE.Vector3(-1, 0, 0));
            expect(offsetCurve.normal).toApproximatelyEqual(new THREE.Vector3(1, 0, 0));

            const curve = await offsetCurve.commit() as visual.SpaceInstance<visual.Curve3D>;
            const bbox = new THREE.Box3().setFromObject(curve);
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            expect(center).toApproximatelyEqual(new THREE.Vector3());
            expect(bbox.min).toApproximatelyEqual(new THREE.Vector3(-0.9, -0.9, 0));
            expect(bbox.max).toApproximatelyEqual(new THREE.Vector3(0.9, 0.9, 0));
        });

        test('distance = 0', async () => {
            offsetCurve.curve = circle;
            offsetCurve.distance = 0;

            expect(offsetCurve.center).toApproximatelyEqual(new THREE.Vector3(-1, 0, 0));
            expect(offsetCurve.normal).toApproximatelyEqual(new THREE.Vector3(1, 0, 0));

            const curve = await offsetCurve.commit() as visual.SpaceInstance<visual.Curve3D>;
            const bbox = new THREE.Box3().setFromObject(curve);
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            expect(center).toApproximatelyEqual(new THREE.Vector3());
            expect(bbox.min).toApproximatelyEqual(new THREE.Vector3(-1, -1, 0));
            expect(bbox.max).toApproximatelyEqual(new THREE.Vector3(1, 1, 0));
        });
    });

    describe('planar open curves', () => {
        let line: visual.SpaceInstance<visual.Curve3D>;

        beforeEach(async () => {
            const makeLine = new CurveFactory(db, materials, signals);
            makeLine.type = c3d.SpaceType.Polyline3D;
            makeLine.points.push(new THREE.Vector3());
            makeLine.points.push(new THREE.Vector3(1, 0, 0));
            makeLine.points.push(new THREE.Vector3(1, 1, 0));
            line = await makeLine.commit() as visual.SpaceInstance<visual.Curve3D>;
        })

        test('it works', async () => {
            offsetCurve.curve = line;
            offsetCurve.distance = 0.1;

            expect(offsetCurve.center).toApproximatelyEqual(new THREE.Vector3(1, 0, 0));
            expect(offsetCurve.normal).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));

            const curve = await offsetCurve.commit() as visual.SpaceInstance<visual.Curve3D>;
            const bbox = new THREE.Box3().setFromObject(curve);
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            expect(center).toApproximatelyEqual(new THREE.Vector3(0.45, 0.55, 0));
            expect(bbox.min).toApproximatelyEqual(new THREE.Vector3(0, 0.1, 0));
            expect(bbox.max).toApproximatelyEqual(new THREE.Vector3(0.9, 1, 0));
        });
    });

    describe('edges', () => {
        let solid: visual.Solid;
        
        beforeEach(async () => {
            const makeBox = new ThreePointBoxFactory(db, materials, signals);
            makeBox.p1 = new THREE.Vector3();
            makeBox.p2 = new THREE.Vector3(1, 0, 0);
            makeBox.p3 = new THREE.Vector3(1, 1, 0);
            makeBox.p4 = new THREE.Vector3(1, 1, 1);
            solid = await makeBox.commit() as visual.Solid;
        });

        test('it works', async () => {
            offsetCurve.edges = [solid.edges.get(0), solid.edges.get(1)];
            offsetCurve.distance = 0.1;

            expect(offsetCurve.center).toApproximatelyEqual(new THREE.Vector3(0, 1, 0));
            expect(offsetCurve.normal).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));

            const curve = await offsetCurve.commit() as visual.SpaceInstance<visual.Curve3D>;
            const bbox = new THREE.Box3().setFromObject(curve);
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            expect(center).toApproximatelyEqual(new THREE.Vector3(0.55, 0.45, 0));
            expect(bbox.min).toApproximatelyEqual(new THREE.Vector3(0.1, 0, 0));
            expect(bbox.max).toApproximatelyEqual(new THREE.Vector3(1, 0.9, 0));
        });
    })

    describe('straight lines', () => {
        let line: visual.SpaceInstance<visual.Curve3D>;
        
        beforeEach(async () => {
            const makeLine = new CurveFactory(db, materials, signals);
            makeLine.type = c3d.SpaceType.Polyline3D;
            makeLine.points.push(new THREE.Vector3());
            makeLine.points.push(new THREE.Vector3(1, 1, 0));
            line = await makeLine.commit() as visual.SpaceInstance<visual.Curve3D>;
        });

        test('it works', async () => {
            offsetCurve.curve = line;
            offsetCurve.distance = 0.1;
            offsetCurve.constructionPlane = new ConstructionPlaneSnap();

            expect(offsetCurve.center).toApproximatelyEqual(new THREE.Vector3(0.5, 0.5, 0));
            expect(offsetCurve.normal).toApproximatelyEqual(new THREE.Vector3(-Math.SQRT1_2, Math.SQRT1_2, 0));

            const curve = await offsetCurve.commit() as visual.SpaceInstance<visual.Curve3D>;
            const bbox = new THREE.Box3().setFromObject(curve);
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            expect(center).toApproximatelyEqual(new THREE.Vector3(0.43, 0.57, 0));
            expect(bbox.min).toApproximatelyEqual(new THREE.Vector3(-0.07, 0.07, 0));
            expect(bbox.max).toApproximatelyEqual(new THREE.Vector3(0.929, 1.07, 0));
        });
    })
});


describe(OffsetCurveFactory, () => {
    let offsetContour: OffsetCurveFactory;

    beforeEach(() => {
        offsetContour = new OffsetCurveFactory(db, materials, signals);
    });

    describe('planar closed curves', () => {
        let circle: visual.SpaceInstance<visual.Curve3D>;

        beforeEach(async () => {
            const makeCircle = new CenterCircleFactory(db, materials, signals);
            makeCircle.center = new THREE.Vector3();
            makeCircle.radius = 1;
            circle = await makeCircle.commit() as visual.SpaceInstance<visual.Curve3D>;
        })

        test('it works', async () => {
            offsetContour.curve = circle;
            offsetContour.distance = 0.1;

            expect(offsetContour.center).toApproximatelyEqual(new THREE.Vector3(-1, 0, 0));
            expect(offsetContour.normal).toApproximatelyEqual(new THREE.Vector3(1, 0, 0));

            const curve = await offsetContour.commit() as visual.SpaceInstance<visual.Curve3D>;
            const bbox = new THREE.Box3().setFromObject(curve);
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            expect(center).toApproximatelyEqual(new THREE.Vector3());
            expect(bbox.min).toApproximatelyEqual(new THREE.Vector3(-0.9, -0.9, 0));
            expect(bbox.max).toApproximatelyEqual(new THREE.Vector3(0.9, 0.9, 0));
        });
    });

    describe('faces', () => {
        let cylinder: visual.Solid;

        beforeEach(async () => {
            const makeCylinder = new CylinderFactory(db, materials, signals);
            makeCylinder.p0 = new THREE.Vector3();
            makeCylinder.p1 = new THREE.Vector3(1, 0, 0);
            makeCylinder.p2 = new THREE.Vector3(0, 0, 10);
            cylinder = await makeCylinder.commit() as visual.Solid;
        })

        test('it works', async () => {
            offsetContour.face = cylinder.faces.get(1);
            offsetContour.distance = 0.1;

            expect(offsetContour.center).toApproximatelyEqual(new THREE.Vector3());
            expect(offsetContour.normal).toApproximatelyEqual(new THREE.Vector3(0, 0, 1));

            const curve = await offsetContour.commit() as visual.SpaceInstance<visual.Curve3D>;
            const bbox = new THREE.Box3().setFromObject(curve);
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            expect(center).toApproximatelyEqual(new THREE.Vector3());
            expect(bbox.min).toApproximatelyEqual(new THREE.Vector3(-1.1, -1.1, 0));
            expect(bbox.max).toApproximatelyEqual(new THREE.Vector3(1.1, 1.1, 0));
        });
    });
});
