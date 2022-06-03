/**
 * @jest-environment jsdom
 */
import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils";
import { Intersector, MovementInfo } from "../../src/command/AbstractGizmo";
import { GizmoMaterialDatabase } from "../../src/command/GizmoMaterials";
import { AngleGizmo, DistanceGizmo, LengthGizmo } from "../../src/command/MiniGizmos";
import { CircleMoveGizmo, MoveAxisGizmo, PlanarMoveGizmo } from "../../src/commands/translate/MoveGizmo";
import { CircleScaleGizmo, PlanarScaleGizmo, ScaleAxisGizmo } from "../../src/commands/translate/ScaleGizmo";
import { Viewport } from "../../src/components/viewport/Viewport";
import { Editor } from "../../src/editor/Editor";
import { EditorSignals } from '../../src/editor/EditorSignals';
import { GeometryDatabase } from '../../src/editor/GeometryDatabase';
import { Helpers } from "../../src/util/Helpers";
import { MakeViewport } from "../../__mocks__/FakeViewport";
import '../matchers';

let db: GeometryDatabase;
let gizmos: GizmoMaterialDatabase;
let signals: EditorSignals;
let helpers: Helpers;
let editor: Editor;
let viewport: Viewport;

beforeEach(() => {
    editor = new Editor();
    db = editor._db;
    signals = editor.signals;
    helpers = editor.helpers;
    gizmos = editor.gizmos;
    viewport = MakeViewport(editor);
})

describe(AngleGizmo, () => {
    let gizmo: AngleGizmo;

    beforeEach(() => {
        gizmo = new AngleGizmo("name", editor);
        expect(gizmo.value).toBe(0);
    })

    test("it changes the angle, and respects interrupts", () => {
        const intersector = { raycast: jest.fn(), snap: jest.fn() } as Intersector;
        const cb = jest.fn();
        const event = new MouseEvent('move', { ctrlKey: false });
        const info = { viewport, event } as MovementInfo;

        gizmo.onPointerEnter(intersector);
        gizmo.onPointerDown(cb, intersector, info);
        gizmo.onPointerMove(cb, intersector, { angle: Math.PI / 2, viewport, event } as MovementInfo);
        expect(gizmo.value).toBe(Math.PI / 2);
        gizmo.onPointerUp(cb, intersector, info);
        gizmo.onPointerLeave(intersector);

        gizmo.onPointerEnter(intersector);
        gizmo.onPointerDown(cb, intersector, info);
        gizmo.onPointerMove(cb, intersector, { angle: Math.PI / 2, viewport, event } as MovementInfo);
        expect(gizmo.value).toBe(Math.PI);

        gizmo.onInterrupt(() => { });
        expect(gizmo.value).toBe(Math.PI / 2);
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);
    })

    test("it truncates when ctrl is held", () => {
        const intersector = { raycast: jest.fn(), snap: jest.fn() } as Intersector;
        const cb = jest.fn();
        const event = new MouseEvent('move', { ctrlKey: true });
        const info = { viewport, event } as MovementInfo;

        gizmo.onPointerEnter(intersector);
        gizmo.onPointerDown(cb, intersector, info);
        gizmo.onPointerMove(cb, intersector, { angle: degToRad(47), viewport, event } as MovementInfo);
        expect(gizmo.value).toBe(degToRad(45));
        gizmo.onPointerUp(cb, intersector, info);
        gizmo.onPointerLeave(intersector);
    })

})

describe(CircleScaleGizmo, () => {
    let gizmo: CircleScaleGizmo;

    beforeEach(() => {
        gizmo = new CircleScaleGizmo("name", editor);
        expect(gizmo.value).toBe(1);
    })

    test("it changes size and respects interrupts", () => {
        const intersector = { raycast: jest.fn(), snap: jest.fn() } as Intersector;
        const cb = jest.fn();
        let info = {} as MovementInfo;

        const center2d = new THREE.Vector2();
        const pointStart2d = new THREE.Vector2(0.1, 0.1);

        gizmo.onPointerEnter(intersector);
        gizmo.onPointerDown(cb, intersector, { pointStart2d, center2d } as MovementInfo);
        gizmo.onPointerMove(cb, intersector, { pointStart2d, center2d, pointEnd2d: new THREE.Vector2(0.2, 0.2) } as MovementInfo);
        expect(gizmo.value).toBe(2);
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);

        gizmo.onPointerEnter(intersector);
        gizmo.onPointerDown(cb, intersector, { pointStart2d, center2d } as MovementInfo);
        gizmo.onPointerMove(cb, intersector, { pointStart2d, center2d, pointEnd2d: new THREE.Vector2(0.2, 0.2) } as MovementInfo);
        expect(gizmo.value).toBe(4);

        gizmo.onInterrupt(() => { });
        expect(gizmo.value).toBe(2);
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);
    })

})

describe(CircleMoveGizmo, () => {
    let gizmo: CircleMoveGizmo;

    beforeEach(() => {
        gizmo = new CircleMoveGizmo("name", editor);
        expect(gizmo.value).toEqual(new THREE.Vector3());
    })

    test("it changes vector delta and respects interrupts", () => {
        const intersector = { raycast: jest.fn(), snap: jest.fn() } as Intersector;
        const cb = jest.fn();
        let info = {} as MovementInfo;

        const pointStart3d = new THREE.Vector3(0, 0, 0);
        const pointEnd3d = new THREE.Vector3(1, 1, 1);

        gizmo.onPointerEnter(intersector);
        gizmo.onPointerDown(cb, intersector, {} as MovementInfo);
        gizmo.onPointerMove(cb, intersector, { pointStart3d, pointEnd3d } as MovementInfo);
        expect(gizmo.value).toEqual(pointEnd3d.clone().sub(pointStart3d));
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);

        gizmo.onPointerEnter(intersector);
        gizmo.onPointerDown(cb, intersector, { pointStart3d, pointEnd3d } as MovementInfo);
        gizmo.onPointerMove(cb, intersector, { pointStart3d, pointEnd3d } as MovementInfo);
        expect(gizmo.value).toEqual(pointEnd3d.clone().sub(pointStart3d).multiplyScalar(2));

        gizmo.onInterrupt(() => { });
        expect(gizmo.value).toEqual(pointEnd3d.clone().sub(pointStart3d));
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);
    })
})

describe(LengthGizmo, () => {
    let gizmo: LengthGizmo;

    beforeEach(() => {
        gizmo = new LengthGizmo("name", editor);
        expect(gizmo.value).toBe(0);
    })

    test("it changes size and respects interrupts", () => {
        const intersector = { raycast: jest.fn(), snap: jest.fn() };
        const cb = jest.fn();
        let info = {} as MovementInfo;
        const moveEvent = new MouseEvent('move', { ctrlKey: false });

        gizmo.onPointerEnter(intersector);
        intersector.raycast.mockReturnValueOnce({ point: new THREE.Vector3() })
        gizmo.onPointerDown(cb, intersector, {} as MovementInfo);
        intersector.raycast.mockReturnValueOnce({ point: new THREE.Vector3(0, 1, 0) })
        gizmo.onPointerMove(cb, intersector, { viewport, event: moveEvent } as MovementInfo);
        expect(gizmo.value).toBe(1);
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);

        gizmo.onPointerEnter(intersector);
        intersector.raycast.mockReturnValueOnce({ point: new THREE.Vector3() })
        gizmo.onPointerDown(cb, intersector, {} as MovementInfo);
        intersector.raycast.mockReturnValueOnce({ point: new THREE.Vector3(0, 1, 0) })
        gizmo.onPointerMove(cb, intersector, { viewport, event: moveEvent } as MovementInfo);
        expect(gizmo.value).toBe(2);

        gizmo.onInterrupt(() => { });
        expect(gizmo.value).toBe(1);
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);
    })

    test("ctrl key uses snaps", () => {
        const snap = jest.fn();
        const intersector = { raycast: jest.fn(), snap };
        const cb = jest.fn();
        let info = {} as MovementInfo;
        const moveEvent = new MouseEvent('move', { ctrlKey: true });

        snap.mockImplementation(() => [{ position: new THREE.Vector3(1, 1, 1) }]);
        gizmo.update(viewport.camera);

        gizmo.onPointerEnter(intersector);

        intersector.raycast.mockReturnValueOnce({ point: new THREE.Vector3() })
        gizmo.onPointerDown(cb, intersector, {} as MovementInfo);

        gizmo.onPointerMove(cb, intersector, { viewport, event: moveEvent } as MovementInfo);
        expect(gizmo.value).toBe(1);

        gizmo.onPointerUp(cb, intersector, info)

        gizmo.onPointerLeave(intersector);
    })
})

describe(DistanceGizmo, () => {
    let gizmo: DistanceGizmo;

    beforeEach(() => {
        gizmo = new DistanceGizmo("name", editor);
        expect(gizmo.value).toBe(0);
    })

    test("it changes size and respects interrupts", () => {
        const intersector = { raycast: jest.fn(), snap: jest.fn() };
        const cb = jest.fn();
        let info = {} as MovementInfo;

        gizmo.onPointerEnter(intersector);
        intersector.raycast.mockReturnValueOnce({ point: new THREE.Vector3() })
        gizmo.onPointerDown(cb, intersector, {} as MovementInfo);
        intersector.raycast.mockReturnValueOnce({ point: new THREE.Vector3(0, 1, 0) })
        gizmo.onPointerMove(cb, intersector, { viewport, event: moveEvent } as MovementInfo);
        expect(gizmo.value).toBe(1);
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);

        gizmo.onPointerEnter(intersector);
        intersector.raycast.mockReturnValueOnce({ point: new THREE.Vector3() })
        gizmo.onPointerDown(cb, intersector, {} as MovementInfo);
        intersector.raycast.mockReturnValueOnce({ point: new THREE.Vector3(0, 1, 0) })
        gizmo.onPointerMove(cb, intersector, { viewport, event: moveEvent } as MovementInfo);
        expect(gizmo.value).toBe(2);

        gizmo.onInterrupt(() => { });
        expect(gizmo.value).toBe(1);
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);
    })
})

const moveEvent = new MouseEvent('move');

describe(MoveAxisGizmo, () => {
    let gizmo: MoveAxisGizmo;

    beforeEach(() => {
        gizmo = new MoveAxisGizmo("name", editor, gizmos.default);
        expect(gizmo.value).toBe(0);
    })

    test("it changes size and respects interrupts", () => {
        const intersector = { raycast: jest.fn(), snap: jest.fn() };
        const cb = jest.fn();
        let info = {} as MovementInfo;

        gizmo.onPointerEnter(intersector);
        intersector.raycast.mockReturnValueOnce({ point: new THREE.Vector3() })
        gizmo.onPointerDown(cb, intersector, {} as MovementInfo);
        intersector.raycast.mockReturnValueOnce({ point: new THREE.Vector3(0, 1, 0) });
        gizmo.onPointerMove(cb, intersector, { viewport, event: moveEvent } as MovementInfo);
        expect(gizmo.value).toBe(1);
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);

        gizmo.onPointerEnter(intersector);
        intersector.raycast.mockReturnValueOnce({ point: new THREE.Vector3() })
        gizmo.onPointerDown(cb, intersector, {} as MovementInfo);
        intersector.raycast.mockReturnValueOnce({ point: new THREE.Vector3(0, 1, 0) });
        gizmo.onPointerMove(cb, intersector, { viewport, event: moveEvent } as MovementInfo);
        expect(gizmo.value).toBe(2);

        gizmo.onInterrupt(() => { });
        expect(gizmo.value).toBe(1);
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);
    })
})

describe(ScaleAxisGizmo, () => {
    let gizmo: ScaleAxisGizmo;

    beforeEach(() => {
        gizmo = new ScaleAxisGizmo("name", editor, gizmos.default);
        expect(gizmo.value).toBe(1);
    })

    test("it changes size and respects interrupts", () => {
        const intersector = { raycast: jest.fn(), snap: jest.fn() } as Intersector;
        const cb = jest.fn();
        let info = {} as MovementInfo;

        const center2d = new THREE.Vector2();
        const pointStart2d = new THREE.Vector2(0.1, 0.1);

        gizmo.onPointerEnter(intersector);
        gizmo.onPointerDown(cb, intersector, { pointStart2d, center2d } as MovementInfo);
        gizmo.onPointerMove(cb, intersector, { pointStart2d, center2d, pointEnd2d: new THREE.Vector2(0.2, 0.2) } as MovementInfo);
        expect(gizmo.value).toBe(2);
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);

        gizmo.onPointerEnter(intersector);
        gizmo.onPointerDown(cb, intersector, { pointStart2d, center2d } as MovementInfo);
        gizmo.onPointerMove(cb, intersector, { pointStart2d, center2d, pointEnd2d: new THREE.Vector2(0.2, 0.2) } as MovementInfo);
        expect(gizmo.value).toBe(4);

        gizmo.onInterrupt(() => { });
        expect(gizmo.value).toBe(2);
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);
    })
})

describe(PlanarMoveGizmo, () => {
    let gizmo: PlanarMoveGizmo;

    beforeEach(() => {
        gizmo = new PlanarMoveGizmo("name", editor, gizmos.default);
        expect(gizmo.value).toEqual(new THREE.Vector3());
    })

    test("it changes vector delta and respects interrupts", () => {
        const intersector = { raycast: jest.fn(), snap: jest.fn() };
        const cb = jest.fn();
        let info = {} as MovementInfo;

        const pointStart = new THREE.Vector3();
        const pointEnd = new THREE.Vector3(1, 1, 0);

        const event = new MouseEvent('move', { ctrlKey: false });

        gizmo.onPointerEnter(intersector);
        intersector.raycast.mockReturnValueOnce({ point: pointStart })
        gizmo.onPointerDown(cb, intersector, {} as MovementInfo);
        intersector.raycast.mockReturnValueOnce({ point: pointEnd })
        gizmo.onPointerMove(cb, intersector, { event } as MovementInfo);
        expect(gizmo.value).toEqual(pointEnd.clone().sub(pointStart));
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);

        gizmo.onPointerEnter(intersector);
        intersector.raycast.mockReturnValueOnce({ point: pointStart })
        gizmo.onPointerDown(cb, intersector, {} as MovementInfo);
        intersector.raycast.mockReturnValueOnce({ point: pointEnd })
        gizmo.onPointerMove(cb, intersector, { event } as MovementInfo);
        expect(gizmo.value).toEqual(pointEnd.clone().sub(pointStart).multiplyScalar(2));

        gizmo.onInterrupt(() => { });
        expect(gizmo.value).toEqual(pointEnd.clone().sub(pointStart));
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);
    })
})

describe(PlanarScaleGizmo, () => {
    let gizmo: PlanarScaleGizmo;

    beforeEach(() => {
        gizmo = new PlanarScaleGizmo("name", editor, gizmos.default);
        expect(gizmo.value).toBe(1);
    })

    test("it changes size and respects interrupts", () => {
        const intersector = { raycast: jest.fn(), snap: jest.fn() };
        const cb = jest.fn();
        let info = {} as MovementInfo;

        const pointStart = new THREE.Vector3();
        const pointEnd = new THREE.Vector3(1, 1, 0);

        gizmo.onPointerEnter(intersector);
        intersector.raycast.mockReturnValueOnce({ point: pointStart })
        gizmo.onPointerDown(cb, intersector, {} as MovementInfo);
        intersector.raycast.mockReturnValueOnce({ point: pointEnd })
        gizmo.onPointerMove(cb, intersector, {} as MovementInfo);
        expect(gizmo.value).toBe(Math.sqrt(2));
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);

        gizmo.onPointerEnter(intersector);
        intersector.raycast.mockReturnValueOnce({ point: pointStart })
        gizmo.onPointerDown(cb, intersector, {} as MovementInfo);
        intersector.raycast.mockReturnValueOnce({ point: pointEnd })
        gizmo.onPointerMove(cb, intersector, {} as MovementInfo);
        expect(gizmo.value).toBeCloseTo(2);

        gizmo.onInterrupt(() => { });
        expect(gizmo.value).toBe(Math.sqrt(2));
        gizmo.onPointerUp(cb, intersector, info)
        gizmo.onPointerLeave(intersector);
    })
})