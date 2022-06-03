import KeymapManager from "atom-keymap-plasticity";
import { CompositeDisposable, Disposable } from "event-kit";
import * as THREE from "three";

/**
 * This class is responsible for listening to events (e.g., keydown events) and sending them to the keymap manager
 * to be interpreted and to invoke the various commands. Most of the implementation is concerned with mapping mouse
 * events like click and wheel+up/wheel+down to key events so that they can be bound by the user as well.
 */

// Time thresholds are in milliseconds, distance thresholds are in pixels.
const consummationTimeThreshold = 200; // once the mouse is down at least this long the drag is consummated
const consummationDistanceThreshold = 4; // once the mouse moves at least this distance the drag is consummated

type State = { tag: 'none' } | { tag: 'down', downEvent: PointerEvent, disposable: Disposable }

export default class KeyboardEventManager {
    private state: State = { tag: 'none' };
    private readonly disposable = new CompositeDisposable();

    constructor(private readonly keymaps: AtomKeymap.KeymapManager) {
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onWheelEvent = this.onWheelEvent.bind(this);
        this.onKey = this.onKey.bind(this);

        window.addEventListener('keydown', this.onKey);
        window.addEventListener('keyup', this.onKey);
        window.addEventListener('pointerdown', this.onPointerDown);
        window.addEventListener('wheel', this.onWheelEvent, { capture: true, passive: false });
        window.addEventListener('pointermove', this.onPointerMove);
        this.disposable.add(new Disposable(() => {
            window.removeEventListener('keydown', this.onKey);
            window.removeEventListener('keyup', this.onKey);
            window.removeEventListener('pointerdown', this.onPointerDown);
            window.removeEventListener('wheel', this.onWheelEvent, { capture: true });
            window.removeEventListener('pointermove', this.onPointerMove);
        }));
    }

    private lastTarget?: HTMLElement;

    onPointerMove(e: PointerEvent) {
        const target = e.target;
        if (target instanceof HTMLElement) {
            this.lastTarget = target;
        }
    }

    onPointerDown(downEvent: PointerEvent) {
        switch (this.state.tag) {
            case 'none':
                const disposable = new CompositeDisposable();

                if (downEvent.button != 2) return;

                window.addEventListener('pointerup', this.onPointerUp);
                disposable.add(new Disposable(() => window.removeEventListener('pointerup', this.onPointerUp)));
                this.state = { tag: 'down', downEvent, disposable };
                break;
            default: throw new Error('invalid state: ' + this.state.tag);
        }
    }

    onPointerUp(e: PointerEvent) {
        switch (this.state.tag) {
            case 'down': {
                const { downEvent, disposable } = this.state;
                if (e.pointerId !== downEvent.pointerId) return;

                const currentPosition = new THREE.Vector2(e.clientX, e.clientY);
                const startPosition = new THREE.Vector2(downEvent.clientX, downEvent.clientY);
                const dragStartTime = downEvent.timeStamp;

                if (e.timeStamp - dragStartTime < consummationTimeThreshold &&
                    currentPosition.distanceTo(startPosition) < consummationDistanceThreshold
                ) {
                    this.handleKeyboardEvent(pointerEvent2keyboardEvent(e));
                }

                disposable.dispose();
                this.state = { tag: 'none' };

                break;
            }
            case 'none':
                break;
        }
    }

    onWheelEvent(event: WheelEvent) {
        let e: KeyboardEvent;
        if (!event.shiftKey) {
            e = (event.deltaY > 0) ?
                wheelEvent2keyboardEvent('wheel+up', event) :
                wheelEvent2keyboardEvent('wheel+down', event);
        } else {
            e = (event.deltaX > 0) ?
                wheelEvent2keyboardEvent('wheel+up', event) :
                wheelEvent2keyboardEvent('wheel+down', event);
        }
        this.handleKeyboardEvent(e);
    }

    onKey(event: KeyboardEvent) {
        if (event.repeat) return event.preventDefault();
        const lastTarget = this.lastTarget;
        if (lastTarget === undefined) return;

        Object.defineProperty(event, 'target', { value: lastTarget });
        this.handleKeyboardEvent(event);
    }

    private handleKeyboardEvent(event: KeyboardEvent) {
        this.keymaps.handleKeyboardEvent(event);
    }

    dispose() {
        this.disposable.dispose();
    }
}

export function pointerEvent2keyboardEvent(event: MouseEvent): KeyboardEvent {
    const build = modifiers(event)
    let name = "mouse";
    if (event.button !== -1) name += event.button;
    else if (event.type === 'pointermove' && event.buttons != 0) {
        if (event.buttons === 1) name += '0';
        else if (event.buttons === 2) name += '2';
        else if (event.buttons === 4) name += '1';
        else if (event.buttons === 8) name += '4';
        else if (event.buttons === 16) name += '5';
    }
    return KeymapManager.buildKeydownEvent(name, build) as unknown as KeyboardEvent;
}

export function wheelEvent2keyboardEvent(name: string, event: WheelEvent): KeyboardEvent {
    const e = KeymapManager.buildKeydownEvent(name, modifiers(event)) as unknown as KeyboardEvent;
    console.log(e);
    // NOTE: because wheel events are ALSO listened for by the viewport orbit controls, it's important
    // to allow the original event to be stopped if something takes precedence.
    const stopPropagation = e.stopPropagation.bind(e);
    Object.defineProperty(e, 'stopPropagation', {
        value() {
            event.stopPropagation();
            stopPropagation();
        }
    });
    const preventDefault = e.preventDefault.bind(e);
    Object.defineProperty(e, 'preventDefault', {
        value() {
            event.preventDefault();
            preventDefault();
        }
    });
    return e;
}

function modifiers(event: MouseEvent) {
    return {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        cmd: event.metaKey,
        target: event.target as Element | undefined,
    };
}
