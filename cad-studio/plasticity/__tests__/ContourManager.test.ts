import * as THREE from "three";
import { CenterCircleFactory } from "../src/commands/circle/CircleFactory";
import CurveFactory from "../src/commands/curve/CurveFactory";
import JoinCurvesFactory from "../src/commands/curve/JoinCurvesFactory";
import LineFactory from "../src/commands/line/LineFactory";
import { ContourFilletFactory } from "../src/commands/modify_contour/ContourFilletFactory";
import ContourManager from '../src/editor/curves/ContourManager';
import { PlanarCurveDatabase } from "../src/editor/curves/PlanarCurveDatabase";
import { RegionManager } from "../src/editor/curves/RegionManager";
import { EditorSignals } from '../src/editor/EditorSignals';
import { Empties } from "../src/editor/Empties";
import { GeometryDatabase } from '../src/editor/GeometryDatabase';
import { Images } from "../src/editor/Images";
import MaterialDatabase from '../src/editor/MaterialDatabase';
import { ParallelMeshCreator } from "../src/editor/MeshCreator";
import { Scene } from "../src/editor/Scene";
import { SolidCopier } from "../src/editor/SolidCopier";
import * as visual from '../src/visual_model/VisualModel';
import { FakeMaterials } from "../__mocks__/FakeMaterials";
import './matchers';

let _db: GeometryDatabase;
let materials: MaterialDatabase;
let curves: PlanarCurveDatabase;
let regions: RegionManager;
let contours: ContourManager;
let signals: EditorSignals;
let scene: Scene;
let images: Images;
let empties: Empties;

let makeCircle1: CenterCircleFactory;
let makeCircle2: CenterCircleFactory;
let makeCircle3: CenterCircleFactory;
let makeCurve1: CurveFactory;
let makeCurve2: CurveFactory;
let makeCurve3: CurveFactory;
let makeLine1: LineFactory;
let makeLine2: LineFactory;
let makeContour: JoinCurvesFactory;
let makeFillet: ContourFilletFactory;

beforeEach(() => {
    materials = new FakeMaterials();
    signals = new EditorSignals();
    _db = new GeometryDatabase(new ParallelMeshCreator(), new SolidCopier(), materials, signals);
    images = new Images();
    empties = new Empties(images, signals);
    scene = new Scene(_db, empties, materials, signals);
    curves = new PlanarCurveDatabase(_db);
    regions = new RegionManager(_db, curves);
    contours = new ContourManager(_db, curves, regions, signals);
});

beforeEach(() => {
    makeCircle1 = new CenterCircleFactory(contours, materials, signals);
    makeCircle2 = new CenterCircleFactory(contours, materials, signals);
    makeCircle3 = new CenterCircleFactory(contours, materials, signals);
    makeCurve1 = new CurveFactory(contours, materials, signals);
    makeCurve2 = new CurveFactory(contours, materials, signals);
    makeCurve3 = new CurveFactory(contours, materials, signals);
    makeLine1 = new LineFactory(contours, materials, signals);
    makeLine2 = new LineFactory(contours, materials, signals);
    makeContour = new JoinCurvesFactory(contours, materials, signals);
    makeFillet = new ContourFilletFactory(contours, materials, signals);
})

test("transactions batch add and removes", async () => {
    let added = 0, removed = 0, replaced = 0;
    signals.objectAdded.add(() => added++);
    signals.objectRemoved.add(() => removed++);
    signals.objectReplaced.add(() => replaced++);

    await contours.transaction(async () => {
        makeLine1.p1 = new THREE.Vector3();
        makeLine1.p2 = new THREE.Vector3(1, 1, 0);
        const line1 = await makeLine1.commit() as visual.SpaceInstance<visual.Curve3D>;

        makeLine2.p1 = new THREE.Vector3(1, 1, 0);
        makeLine2.p2 = new THREE.Vector3(0, 1, 0);
        const line2 = await makeLine2.commit() as visual.SpaceInstance<visual.Curve3D>;

        makeContour.push(line1);
        makeContour.push(line2);
        const contour = (await makeContour.commit() as visual.SpaceInstance<visual.Curve3D>[])[0] as visual.SpaceInstance<visual.Curve3D>;

        makeFillet.contour = contour;
        makeFillet.radiuses[0] = 0.1;
        await makeFillet.commit() as visual.SpaceInstance<visual.Curve3D>;
    });

    expect(_db.find(visual.SpaceInstance, true).length).toBe(4);
    expect(_db.find(visual.PlaneInstance, true).length).toBe(0);
    expect(added).toBe(5);
    expect(removed).toBe(1);
    expect(replaced).toBe(2);
});

test("two overlapping coplanar circles, adding and removing creates the right regions", async () => {
    let circle1: visual.SpaceInstance<visual.Curve3D>, circle2: visual.SpaceInstance<visual.Curve3D>;
    makeCircle1.center = new THREE.Vector3(0, -1.1, 0);
    makeCircle1.radius = 1;
    circle1 = await makeCircle1.commit() as visual.SpaceInstance<visual.Curve3D>;
    expect(_db.find(visual.PlaneInstance, true).length).toBe(1);

    makeCircle2.center = new THREE.Vector3(0, 0, 0);
    makeCircle2.radius = 1;
    circle2 = await makeCircle2.commit() as visual.SpaceInstance<visual.Curve3D>;
    expect(_db.find(visual.PlaneInstance, true).length).toBe(1);

    await contours.removeItem(circle2);
    expect(_db.find(visual.PlaneInstance, true).length).toBe(1);

    await contours.removeItem(circle1);
    expect(_db.find(visual.PlaneInstance, true).length).toBe(0);
});

test("two overlapping coplanar circles, adding and hiding creates the right regions", async () => {
    let circle1: visual.SpaceInstance<visual.Curve3D>, circle2: visual.SpaceInstance<visual.Curve3D>;
    makeCircle1.center = new THREE.Vector3(0, -1.1, 0);
    makeCircle1.radius = 1;
    circle1 = await makeCircle1.commit() as visual.SpaceInstance<visual.Curve3D>;
    expect(_db.find(visual.PlaneInstance, true).length).toBe(1);

    makeCircle2.center = new THREE.Vector3(0, 0, 0);
    makeCircle2.radius = 1;
    circle2 = await makeCircle2.commit() as visual.SpaceInstance<visual.Curve3D>;
    expect(_db.find(visual.PlaneInstance, true).length).toBe(1);

    await contours.transaction(async () => {
        await scene.makeHidden(circle2, true);
    })
    expect(_db.find(visual.PlaneInstance, true).length).toBe(1);

    await contours.transaction(async () => {
        await scene.makeHidden(circle1, true);
    })
    expect(_db.find(visual.PlaneInstance, true).length).toBe(0);

    await contours.transaction(async () => {
        await scene.unhideAll();
    })
    expect(_db.find(visual.PlaneInstance, true).length).toBe(1);
});

test("two overlapping coplanar circles, visible and invisible creates the right regions", async () => {
    let circle1: visual.SpaceInstance<visual.Curve3D>, circle2: visual.SpaceInstance<visual.Curve3D>;
    makeCircle1.center = new THREE.Vector3(0, -1.1, 0);
    makeCircle1.radius = 1;
    circle1 = await makeCircle1.commit() as visual.SpaceInstance<visual.Curve3D>;
    expect(_db.find(visual.PlaneInstance, true).length).toBe(1);

    makeCircle2.center = new THREE.Vector3(0, 0, 0);
    makeCircle2.radius = 1;
    circle2 = await makeCircle2.commit() as visual.SpaceInstance<visual.Curve3D>;
    expect(_db.find(visual.PlaneInstance, true).length).toBe(1);

    await contours.transaction(async () => {
        await scene.makeVisible(circle2, false);
    })
    expect(_db.find(visual.PlaneInstance, true).length).toBe(1);

    await contours.transaction(async () => {
        await scene.makeVisible(circle1, false);
    })
    expect(_db.find(visual.PlaneInstance, true).length).toBe(0);

    await contours.transaction(async () => {
        await scene.makeVisible(circle2, true);
    })
    await contours.transaction(async () => {
        await scene.makeVisible(circle1, true);
    })
    expect(_db.find(visual.PlaneInstance, true).length).toBe(1);
});