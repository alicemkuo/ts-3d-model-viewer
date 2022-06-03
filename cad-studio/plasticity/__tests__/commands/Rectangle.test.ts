import * as THREE from "three";
import { CenterRectangleFactory, CornerRectangleFactory, DiagonalRectangleFactory, EditCenterRectangleFactory, EditCornerRectangleFactory, ThreePointRectangleFactory } from "../../src/commands/rect/RectangleFactory";
import { EditorSignals } from '../../src/editor/EditorSignals';
import { GeometryDatabase } from '../../src/editor/GeometryDatabase';
import MaterialDatabase from '../../src/editor/MaterialDatabase';
import { ParallelMeshCreator } from "../../src/editor/MeshCreator";
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

describe(ThreePointRectangleFactory, () => {
    let makeRectangle: ThreePointRectangleFactory;

    beforeEach(() => {
        makeRectangle = new ThreePointRectangleFactory(db, materials, signals);
    })

    describe('commit', () => {
        test('invokes the appropriate c3d commands', async () => {
            makeRectangle.p1 = new THREE.Vector3();
            makeRectangle.p2 = new THREE.Vector3(1, 0, 0);
            makeRectangle.p3 = new THREE.Vector3(1, 1, 0);
            const item = await makeRectangle.commit() as visual.SpaceInstance<visual.Curve3D>;
            const bbox = new THREE.Box3().setFromObject(item);
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            expect(center).toApproximatelyEqual(new THREE.Vector3(0.5, 0.5, 0));
            expect(bbox.min).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));
            expect(bbox.max).toApproximatelyEqual(new THREE.Vector3(1, 1, 0));
        })
    })
});

describe(CornerRectangleFactory, () => {
    let makeRectangle: CornerRectangleFactory;

    beforeEach(() => {
        makeRectangle = new CornerRectangleFactory(db, materials, signals);
    })

    describe('commit', () => {
        test('invokes the appropriate c3d commands', async () => {
            makeRectangle.p1 = new THREE.Vector3(-1, -1, -1);
            makeRectangle.p2 = new THREE.Vector3(1, 1, 1);
            const item = await makeRectangle.commit() as visual.SpaceInstance<visual.Curve3D>;
            const bbox = new THREE.Box3().setFromObject(item);
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            expect(center).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));
            expect(bbox.min).toApproximatelyEqual(new THREE.Vector3(-1, -1, -1));
            expect(bbox.max).toApproximatelyEqual(new THREE.Vector3(1, 1, 1));
        })
    })
});

describe(CenterRectangleFactory, () => {
    let makeRectangle: CenterRectangleFactory;

    beforeEach(() => {
        makeRectangle = new CenterRectangleFactory(db, materials, signals);
    })

    describe('commit', () => {
        test('invokes the appropriate c3d commands', async () => {
            makeRectangle.p1 = new THREE.Vector3(0, 0, 0);
            makeRectangle.p2 = new THREE.Vector3(1, 1, 1);
            const item = await makeRectangle.commit() as visual.SpaceInstance<visual.Curve3D>;
            const bbox = new THREE.Box3().setFromObject(item);
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            expect(center).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));
            expect(bbox.min).toApproximatelyEqual(new THREE.Vector3(-1, -1, -1));
            expect(bbox.max).toApproximatelyEqual(new THREE.Vector3(1, 1, 1));
        })
    })
});

describe(DiagonalRectangleFactory, () => {
    describe('orthogonal', () => {
        describe('results are always clockwise', () => {
            test('quadrant 1', () => {
                const { p1, p2, p3, p4 } = DiagonalRectangleFactory.orthogonal(
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(1, 1, 0),
                    new THREE.Vector3(0, 0, 1),
                )
                expect(p1).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));
                expect(p2).toApproximatelyEqual(new THREE.Vector3(1, 0, 0));
                expect(p3).toApproximatelyEqual(new THREE.Vector3(1, 1, 0));
                expect(p4).toApproximatelyEqual(new THREE.Vector3(0, 1, 0));
            })

            test('quadrant 2', () => {
                const { p1, p2, p3, p4 } = DiagonalRectangleFactory.orthogonal(
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(-1, 1, 0),
                    new THREE.Vector3(0, 0, 1),
                )
                expect(p1).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));
                expect(p2).toApproximatelyEqual(new THREE.Vector3(-1, 0, 0));
                expect(p3).toApproximatelyEqual(new THREE.Vector3(-1, 1, 0));
                expect(p4).toApproximatelyEqual(new THREE.Vector3(0, 1, 0));
            })

            test('quadrant 4', () => {
                const { p1, p2, p3, p4 } = DiagonalRectangleFactory.orthogonal(
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(1, -1, 0),
                    new THREE.Vector3(0, 0, 1),
                )
                expect(p1).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));
                expect(p2).toApproximatelyEqual(new THREE.Vector3(1, 0, 0));
                expect(p3).toApproximatelyEqual(new THREE.Vector3(1, -1, 0));
                expect(p4).toApproximatelyEqual(new THREE.Vector3(0, -1, 0));
            })

        })

        test('normal = x', () => {
            const { p1, p2, p3, p4 } = DiagonalRectangleFactory.orthogonal(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 1, 1),
                new THREE.Vector3(1, 0, 0),
            )
            expect(p1).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));
            expect(p2).toApproximatelyEqual(new THREE.Vector3(0, 0, 1));
            expect(p3).toApproximatelyEqual(new THREE.Vector3(0, 1, 1));
            expect(p4).toApproximatelyEqual(new THREE.Vector3(0, 1, 0));
        })

        test('normal = y', () => {
            const { p1, p2, p3, p4 } = DiagonalRectangleFactory.orthogonal(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(1, 0, 1),
                new THREE.Vector3(0, 1, 0),
            )
            expect(p1).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));
            expect(p2).toApproximatelyEqual(new THREE.Vector3(0, 0, 1));
            expect(p3).toApproximatelyEqual(new THREE.Vector3(1, 0, 1));
            expect(p4).toApproximatelyEqual(new THREE.Vector3(1, 0, 0));
        })

        test('weird numerical precision edge case', () => {
            const { p1, p2, p3, p4 } = DiagonalRectangleFactory.orthogonal(
                new THREE.Vector3(-1, -1, 1),
                new THREE.Vector3(-1, 1, 2),
                new THREE.Vector3(-0.9999999999999998, 6.123233995736e-17, 0),
            )
            expect(p1).toApproximatelyEqual(new THREE.Vector3(-1, -1, 1));
            expect(p2).toApproximatelyEqual(new THREE.Vector3(-1, -1, 2));
            expect(p3).toApproximatelyEqual(new THREE.Vector3(-1, 1, 2));
            expect(p4).toApproximatelyEqual(new THREE.Vector3(-1, 1, 1));
        })

        test('n=1,0,1', () => {
            const { p1, p2, p3, p4 } = DiagonalRectangleFactory.orthogonal(
                new THREE.Vector3(0.5, 0, 1),
                new THREE.Vector3(1, 1, 0.5),
                new THREE.Vector3(1, 0, 1).normalize(),
            )
            expect(p1).toApproximatelyEqual(new THREE.Vector3(0.5, 0, 1));
            expect(p2).toApproximatelyEqual(new THREE.Vector3(1, 0, 0.5));
            expect(p3).toApproximatelyEqual(new THREE.Vector3(1, 1, 0.5));
            expect(p4).toApproximatelyEqual(new THREE.Vector3(0.5, 1, 1));
        })

        test('n=1,-1,0', () => {
            const { p1, p2, p3, p4 } = DiagonalRectangleFactory.orthogonal(
                new THREE.Vector3(0.5, 0, 1),
                new THREE.Vector3(1, 0.5, 0),
                new THREE.Vector3(1, -1, 0).normalize(),
            )
            expect(p1).toApproximatelyEqual(new THREE.Vector3(0.5, 0, 1));
            expect(p2).toApproximatelyEqual(new THREE.Vector3(0.5, 0, 0));
            expect(p3).toApproximatelyEqual(new THREE.Vector3(1, 0.5, 0));
            expect(p4).toApproximatelyEqual(new THREE.Vector3(1, 0.5, 1));
        })

        test('n=0,1,1', () => {
            const { p1, p2, p3, p4 } = DiagonalRectangleFactory.orthogonal(
                new THREE.Vector3(1, 0.5, 1),
                new THREE.Vector3(0, 1, 0.5),
                new THREE.Vector3(0, 1, 1).normalize(),
            )
            expect(p1).toApproximatelyEqual(new THREE.Vector3(1, 0.5, 1));
            expect(p2).toApproximatelyEqual(new THREE.Vector3(1, 1, 0.5));
            expect(p3).toApproximatelyEqual(new THREE.Vector3(0, 1, 0.5));
            expect(p4).toApproximatelyEqual(new THREE.Vector3(0, 0.5, 1));
        })

        test('n=1,1,1', () => {
            const { p1, p2, p3, p4 } = DiagonalRectangleFactory.orthogonal(
                new THREE.Vector3(1, 0, -1),
                new THREE.Vector3(0, 1, -1),
                new THREE.Vector3(1, 1, 1).normalize(),
            )
            expect(p1).toApproximatelyEqual(new THREE.Vector3(1, 0, -1));
            expect(p3).toApproximatelyEqual(new THREE.Vector3(0, 1, -1));
            expect(p2).toApproximatelyEqual(new THREE.Vector3(1, 0, -1));
            expect(p4).toApproximatelyEqual(new THREE.Vector3(0, 1, -1));
        })
    })
})

describe(EditCornerRectangleFactory, () => {
    const p1 = new THREE.Vector3();
    const p2 = new THREE.Vector3(1, 1, 0);
    let rectangle: visual.SpaceInstance<visual.Curve3D>;

    beforeEach(async () => {
        const makeRectangle = new CornerRectangleFactory(db, materials, signals);
        makeRectangle.p1 = p1;
        makeRectangle.p2 = p2;
        rectangle = await makeRectangle.commit() as visual.SpaceInstance<visual.Curve3D>;
    })

    let editRectangle: EditCornerRectangleFactory;

    beforeEach(() => {
        editRectangle = new EditCornerRectangleFactory(db, materials, signals);
    })

    test('invokes the appropriate c3d commands', async () => {
        editRectangle.rectangle = rectangle;
        editRectangle.width = 10;
        editRectangle.length = 20;
        editRectangle.p1 = p1;
        editRectangle.p2 = p2;
        const result = await editRectangle.commit() as visual.SpaceInstance<visual.Curve3D>;

        const bbox = new THREE.Box3().setFromObject(result);
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        expect(center).toApproximatelyEqual(new THREE.Vector3(5, 10, 0));
        expect(bbox.min).toApproximatelyEqual(new THREE.Vector3(0, 0, 0));
        expect(bbox.max).toApproximatelyEqual(new THREE.Vector3(10, 20, 0));
    })
});

describe(EditCenterRectangleFactory, () => {
    const p1 = new THREE.Vector3(0, 1);
    const p2 = new THREE.Vector3(1, 2, 0);
    let rectangle: visual.SpaceInstance<visual.Curve3D>;

    beforeEach(async () => {
        const makeRectangle = new CenterRectangleFactory(db, materials, signals);
        makeRectangle.p1 = p1;
        makeRectangle.p2 = p2;
        rectangle = await makeRectangle.commit() as visual.SpaceInstance<visual.Curve3D>;
    })

    let editRectangle: EditCenterRectangleFactory;

    beforeEach(() => {
        editRectangle = new EditCenterRectangleFactory(db, materials, signals);
    })

    test('invokes the appropriate c3d commands', async () => {
        editRectangle.rectangle = rectangle;
        editRectangle.width = 10;
        editRectangle.length = 20;
        editRectangle.p1 = p1;
        editRectangle.p2 = p2;
        const result = await editRectangle.commit() as visual.SpaceInstance<visual.Curve3D>;

        const bbox = new THREE.Box3().setFromObject(result);
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        expect(center).toApproximatelyEqual(new THREE.Vector3(0, 1, 0));
        expect(bbox.min).toApproximatelyEqual(new THREE.Vector3(-5, -9, 0));
        expect(bbox.max).toApproximatelyEqual(new THREE.Vector3(5, 11, 0));
    })

    test('orthogonal', async () => {
        editRectangle.rectangle = rectangle;
        editRectangle.width = 10;
        editRectangle.length = 20;
        editRectangle.p1 = p1;
        editRectangle.p2 = p2;
        // @ts-expect-error
        const { p1: p1_, p2: p2_, p3, p4 } = editRectangle.orthogonal();

        expect(p1_).toApproximatelyEqual(new THREE.Vector3(-5, -9));
        expect(p2_).toApproximatelyEqual(new THREE.Vector3(5, -9));
        expect(p3).toApproximatelyEqual(new THREE.Vector3(5, 11));
        expect(p4).toApproximatelyEqual(new THREE.Vector3(-5, 11));

    })
});

