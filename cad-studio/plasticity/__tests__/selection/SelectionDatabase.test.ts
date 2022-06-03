import * as THREE from 'three';
import { ThreePointBoxFactory } from '../../src/commands/box/BoxFactory';
import { CenterCircleFactory } from '../../src/commands/circle/CircleFactory';
import LineFactory from '../../src/commands/line/LineFactory';
import { RegionFactory } from '../../src/commands/region/RegionFactory';
import { EditorSignals } from '../../src/editor/EditorSignals';
import { Empties, Empty } from '../../src/editor/Empties';
import { GeometryDatabase } from '../../src/editor/GeometryDatabase';
import { Group } from '../../src/editor/Groups';
import { Images } from '../../src/editor/Images';
import MaterialDatabase from '../../src/editor/MaterialDatabase';
import { ParallelMeshCreator } from '../../src/editor/MeshCreator';
import { Scene } from '../../src/editor/Scene';
import { SolidCopier } from '../../src/editor/SolidCopier';
import { Selection, SignalLike } from '../../src/selection/SelectionDatabase';
import * as visual from '../../src/visual_model/VisualModel';
import { FakeMaterials } from "../../__mocks__/FakeMaterials";
import { FakeImages } from "../../__mocks__/FakeImages";
import '../matchers';

let db: GeometryDatabase;
let materials: MaterialDatabase;
let signals: EditorSignals;
let scene: Scene;
let images: Images;
let empties: Empties;

beforeEach(() => {
    materials = new FakeMaterials();
    signals = new EditorSignals();
    db = new GeometryDatabase(new ParallelMeshCreator(), new SolidCopier(), materials, signals);
    images = new FakeImages();
    empties = new Empties(images, signals);
    scene = new Scene(db, empties, materials, signals);
});

export let solid: visual.Solid;
let circle: visual.SpaceInstance<visual.Curve3D>;
let curve: visual.SpaceInstance<visual.Curve3D>;
let region: visual.PlaneInstance<visual.Region>;
let group: Group;
let empty: Empty;

beforeEach(async () => {
    expect(db.temporaryObjects.children.length).toBe(0);
    const makeBox = new ThreePointBoxFactory(db, materials, signals);
    makeBox.p1 = new THREE.Vector3();
    makeBox.p2 = new THREE.Vector3(1, 0, 0);
    makeBox.p3 = new THREE.Vector3(1, 1, 0);
    makeBox.p4 = new THREE.Vector3(1, 1, 1);
    solid = await makeBox.commit() as visual.Solid;

    const makeCircle = new CenterCircleFactory(db, materials, signals);
    makeCircle.center = new THREE.Vector3();
    makeCircle.radius = 1;
    circle = await makeCircle.commit() as visual.SpaceInstance<visual.Curve3D>;

    const makeCurve = new LineFactory(db, materials, signals);
    makeCurve.p1 = new THREE.Vector3();
    makeCurve.p2 = new THREE.Vector3(1, 1, 1);
    curve = await makeCurve.commit() as visual.SpaceInstance<visual.Curve3D>;

    const makeRegion = new RegionFactory(db, materials, signals);
    makeRegion.contours = [circle];
    const regions = await makeRegion.commit() as visual.PlaneInstance<visual.Region>[];
    region = regions[0];

    group = scene.createGroup();
    images.add('foo', Buffer.from(''));
    empty = empties.addImage('foo');
});

describe(Selection, () => {
    let selection: Selection;

    beforeEach(() => {
        const sigs: SignalLike = {
            objectRemovedFromDatabase: signals.objectRemoved,
            groupRemoved: signals.groupDeleted,
            emptyRemoved: signals.emptyRemoved,
            objectHidden: signals.objectHidden,
            objectUnselectable: signals.objectUnselectable,
            objectReplaced: signals.objectReplaced,
            objectAdded: signals.objectSelected,
            objectRemoved: signals.objectDeselected,
            selectionChanged: signals.selectionChanged
        };
        selection = new Selection(db, scene, sigs);
    });

    afterEach(() => {
        selection.validate();
    })

    test("add & remove solid", async () => {
        const objectAdded = jest.spyOn(signals.objectSelected, 'dispatch');
        const objectRemoved = jest.spyOn(signals.objectDeselected, 'dispatch');

        expect(selection.solids.first).toBe(undefined);
        expect(objectAdded).toHaveBeenCalledTimes(0);
        expect(objectRemoved).toHaveBeenCalledTimes(0);

        selection.addSolid(solid);
        expect(selection.solids.first).toBe(solid);
        expect(objectAdded).toHaveBeenCalledTimes(1);
        expect(objectRemoved).toHaveBeenCalledTimes(0);

        selection.removeSolid(solid);
        expect(selection.solids.first).toBe(undefined);
        expect(objectAdded).toHaveBeenCalledTimes(1);
        expect(objectRemoved).toHaveBeenCalledTimes(1);
    });

    test("add solid twice", async () => {
        const objectAdded = jest.spyOn(signals.objectSelected, 'dispatch');
        const objectRemoved = jest.spyOn(signals.objectDeselected, 'dispatch');

        selection.addSolid(solid);
        expect(selection.solids.first).toBe(solid);
        expect(objectAdded).toHaveBeenCalledTimes(1);
        expect(objectRemoved).toHaveBeenCalledTimes(0);

        selection.addSolid(solid);
        expect(selection.solids.first).toBe(solid);
        expect(objectAdded).toHaveBeenCalledTimes(1);
        expect(objectRemoved).toHaveBeenCalledTimes(0);
    });

    test("remove solid twice", async () => {
        const objectAdded = jest.spyOn(signals.objectSelected, 'dispatch');
        const objectRemoved = jest.spyOn(signals.objectDeselected, 'dispatch');

        selection.addSolid(solid);
        expect(selection.solids.first).toBe(solid);
        expect(objectAdded).toHaveBeenCalledTimes(1);
        expect(objectRemoved).toHaveBeenCalledTimes(0);

        selection.removeSolid(solid);
        expect(selection.solids.first).toBe(undefined);
        expect(objectAdded).toHaveBeenCalledTimes(1);
        expect(objectRemoved).toHaveBeenCalledTimes(1);

        selection.removeSolid(solid);
        expect(selection.solids.first).toBe(undefined);
        expect(objectAdded).toHaveBeenCalledTimes(1);
        expect(objectRemoved).toHaveBeenCalledTimes(1);
    });

    test("add & remove face", async () => {
        const objectAdded = jest.spyOn(signals.objectSelected, 'dispatch');
        const objectRemoved = jest.spyOn(signals.objectDeselected, 'dispatch');

        const face = solid.faces.get(0);

        selection.addFace(face);
        expect(selection.faces.first).toBe(face);
        expect(objectAdded).toHaveBeenCalledTimes(1);
        expect(objectRemoved).toHaveBeenCalledTimes(0);

        expect(selection.hasSelectedChildren(solid)).toBe(true);

        selection.removeFace(face);
        expect(selection.faces.first).toBe(undefined);
        expect(objectAdded).toHaveBeenCalledTimes(1);
        expect(objectRemoved).toHaveBeenCalledTimes(1);

        expect(selection.hasSelectedChildren(solid)).toBe(false);
    });

    test("add face twice", async () => {
        const objectAdded = jest.spyOn(signals.objectSelected, 'dispatch');
        const objectRemoved = jest.spyOn(signals.objectDeselected, 'dispatch');

        const face = solid.faces.get(0);

        selection.addFace(face);
        expect(selection.faces.first).toBe(face);
        expect(objectAdded).toHaveBeenCalledTimes(1);
        expect(objectRemoved).toHaveBeenCalledTimes(0);

        expect(selection.hasSelectedChildren(solid)).toBe(true);

        selection.addFace(face);
        expect(selection.faces.first).toBe(face);
        expect(objectAdded).toHaveBeenCalledTimes(1);
        expect(objectRemoved).toHaveBeenCalledTimes(0);

        expect(selection.hasSelectedChildren(solid)).toBe(true);

        selection.removeFace(face);
        expect(selection.faces.first).toBe(undefined);
        expect(objectAdded).toHaveBeenCalledTimes(1);
        expect(objectRemoved).toHaveBeenCalledTimes(1);

        expect(selection.hasSelectedChildren(solid)).toBe(false);
    });

    test("add face & remove solid", async () => {
        const face = solid.faces.get(0);
        selection.addFace(face);
        expect(selection.faces.first).toBe(face);
        expect(selection.hasSelectedChildren(solid)).toBe(true);
        await db.removeItem(solid);
        expect(selection.faces.first).toBe(undefined);
        expect(selection.hasSelectedChildren(solid)).toBe(false);
    });

    test("add edge & remove solid", async () => {
        const edge = solid.edges.get(0);
        selection.addEdge(edge);
        expect(selection.edges.first).toBe(edge);
        expect(selection.hasSelectedChildren(solid)).toBe(true);
        await db.removeItem(solid);
        expect(selection.edges.first).toBe(undefined);
        expect(selection.hasSelectedChildren(solid)).toBe(false);
    });

    test("add face & hide solid", async () => {
        const face = solid.faces.get(0);
        selection.addFace(face);
        expect(selection.faces.first).toBe(face);
        expect(selection.hasSelectedChildren(solid)).toBe(true);
        scene.makeHidden(solid, true);
        expect(selection.faces.first).toBe(undefined);
        expect(selection.hasSelectedChildren(solid)).toBe(false);
    });

    test("add edge & hide solid", async () => {
        const edge = solid.edges.get(0);
        selection.addEdge(edge);
        expect(selection.edges.first).toBe(edge);
        expect(selection.hasSelectedChildren(solid)).toBe(true);
        scene.makeHidden(solid, true);
        expect(selection.edges.first).toBe(undefined);
        expect(selection.hasSelectedChildren(solid)).toBe(false);
    });

    test("deleting an object removes face selection", async () => {
        const face = solid.faces.get(0);
        selection.addFace(face);
        expect(selection.faces.first).toBe(face);
        await db.removeItem(solid);
        expect(selection.faces.size).toBe(0);
    });

    test("removeAll", () => {
        const face = solid.faces.get(0);
        selection.addFace(face);
        selection.addGroup(group);
        selection.addEmpty(empty);
        const point = curve.underlying.points.get(0);
        selection.addControlPoint(point);
        expect(selection.faces.size).toBe(1);
        expect(selection.groups.size).toBe(1);
        expect(selection.controlPoints.size).toBe(1);
        selection.removeAll();
        expect(selection.faces.size).toBe(0);
        expect(selection.groups.size).toBe(0);
        expect(selection.empties.size).toBe(0);
        expect(selection.controlPoints.size).toBe(0);
    });

    test("add & remove region", () => {
        selection.addRegion(region);
        expect(selection.regions.size).toBe(1);
        selection.removeRegion(region);
        expect(selection.regions.size).toBe(0);
    })

    test("addGroup & removeGroup", () => {
        expect(selection.groups.size).toBe(0);
        selection.has(group);
        expect(selection.has(group)).toBe(false);

        selection.addGroup(group);
        expect(selection.groups.size).toBe(1);
        expect(selection.has(group)).toBe(true);

        selection.removeGroup(group);
        expect(selection.groups.size).toBe(0);
        expect(selection.has(group)).toBe(false);
    })

    test("add & remove group", () => {
        expect(selection.groups.size).toBe(0);
        selection.has(group);
        expect(selection.has(group)).toBe(false);

        selection.add(group);
        expect(selection.groups.size).toBe(1);
        expect(selection.has(group)).toBe(true);

        selection.remove([group]);
        expect(selection.groups.size).toBe(0);
        expect(selection.has(group)).toBe(false);
    })

    test("add & delete group", () => {
        selection.add(group);
        expect(selection.groups.size).toBe(1);
        expect(selection.has(group)).toBe(true);

        scene.deleteGroup(group);
        expect(selection.groups.size).toBe(0);
        expect(selection.has(group)).toBe(false);
    })

    test("addEmpty & removeEmpty", () => {
        expect(selection.empties.size).toBe(0);
        selection.has(empty);
        expect(selection.has(empty)).toBe(false);

        selection.addEmpty(empty);
        expect(selection.empties.size).toBe(1);
        expect(selection.has(empty)).toBe(true);

        selection.removeEmpty(empty);
        expect(selection.empties.size).toBe(0);
        expect(selection.has(empty)).toBe(false);
    })

    test("add & remove empty", () => {
        expect(selection.empties.size).toBe(0);
        selection.has(empty);
        expect(selection.has(empty)).toBe(false);

        selection.add(empty);
        expect(selection.empties.size).toBe(1);
        expect(selection.has(empty)).toBe(true);

        selection.remove([empty]);
        expect(selection.empties.size).toBe(0);
        expect(selection.has(empty)).toBe(false);
    })

    test("add & delete empty", () => {
        selection.add(empty);
        expect(selection.empties.size).toBe(1);
        expect(selection.has(empty)).toBe(true);

        scene.deleteEmpty(empty);
        expect(selection.empties.size).toBe(0);
        expect(selection.has(empty)).toBe(false);
    })

    test("add & remove control point", () => {
        expect(selection.controlPoints.size).toBe(0);
        const point = curve.underlying.points.get(0);
        selection.addControlPoint(point);
        expect(selection.controlPoints.size).toBe(1);
        selection.removeControlPoint(point);
        expect(selection.controlPoints.size).toBe(0);
    });

    test("deleting curve deletes its control point", async () => {
        expect(selection.controlPoints.size).toBe(0);
        const point = curve.underlying.points.get(0);
        selection.addControlPoint(point);
        expect(selection.controlPoints.size).toBe(1);
        await db.removeItem(curve);
        expect(selection.controlPoints.size).toBe(0);
    });

    test("hiding an object removes it from the selection", async () => {
        selection.addSolid(solid);
        expect(selection.solids.size).toBe(1);
        scene.makeHidden(solid, true);
        expect(selection.solids.size).toBe(0);
    })

    test("making an object unselectable removes it from the selection", async () => {
        selection.addSolid(solid);
        expect(selection.solids.size).toBe(1);
        scene.makeSelectable(solid, false);
        expect(selection.solids.size).toBe(0);
    })
});
