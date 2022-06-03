import * as THREE from "three";
import Command from "../../command/Command";
import { PointPicker, PointResult } from "../../command/point-picker/PointPicker";
import { AxisSnap } from "../../editor/snaps/AxisSnap";
import * as visual from "../../visual_model/VisualModel";
import { PossiblyBooleanKeyboardGizmo } from "../boolean/BooleanKeyboardGizmo";
import { PossiblyBooleanCenterBoxFactory, PossiblyBooleanCornerBoxFactory, PossiblyBooleanThreePointBoxFactory } from './BoxFactory';
import LineFactory from '../line/LineFactory';
import { CenterRectangleFactory, CornerRectangleFactory, ThreePointRectangleFactory } from '../rect/RectangleFactory';
import { EditBoxGizmo } from "./BoxGizmo";
import { BoxDialog } from "./BoxDialog";
import { ObjectPicker } from "../../command/ObjectPicker";
import { RectangleModeKeyboardGizmo } from "../rect/RectangleModeKeyboardGizmo";
import { SelectionMode } from "../../selection/SelectionModeSet";

const Z = new THREE.Vector3(0, 0, 1);

export class ThreePointBoxCommand extends Command {
    async execute(): Promise<void> {
        const box = new PossiblyBooleanThreePointBoxFactory(this.editor.db, this.editor.materials, this.editor.signals).resource(this);
        const selection = this.editor.selection.selected;
        if (selection.solids.size > 0) box.targets = [...selection.solids];

        const line = new LineFactory(this.editor.db, this.editor.materials, this.editor.signals).resource(this);
        const pointPicker = new PointPicker(this.editor);
        const { point: p1 } = await pointPicker.execute().resource(this);
        line.p1 = p1;
        const { point: p2 } = await pointPicker.execute(({ point: p2 }) => {
            line.p2 = p2;
            line.update();
        }).resource(this);
        line.cancel();

        const rect = new ThreePointRectangleFactory(this.editor.db, this.editor.materials, this.editor.signals).resource(this);
        rect.p1 = p1;
        rect.p2 = p2;
        const { point: p3 } = await pointPicker.execute(({ point: p3 }) => {
            rect.p3 = p3;
            rect.update();
        }).resource(this);
        rect.cancel();

        const keyboard = new PossiblyBooleanKeyboardGizmo("box", this.editor);
        keyboard.prepare(box).resource(this);

        box.p1 = p1;
        box.p2 = p2;
        box.p3 = p3;
        await pointPicker.execute(({ point: p4 }) => {
            box.p4 = p4;
            box.update();
            keyboard.toggle(box.isOverlapping);
        }).resource(this);

        const results = await box.commit() as visual.Solid[];
        selection.add(results);
    }
}

export class CornerBoxCommand extends Command {
    pr1?: PointResult;
    pr2?: PointResult;

    async execute(): Promise<void> {
        const box = new PossiblyBooleanCornerBoxFactory(this.editor.db, this.editor.materials, this.editor.signals).resource(this);
        const selection = this.editor.selection.selected;
        box.targets = [...selection.solids];
        let { pr1, pr2 } = this;

        const dialog = new BoxDialog(box, this.editor.signals);
        const gizmo = new EditBoxGizmo(box, this.editor);

        let pointPicker = new PointPicker(this.editor);
        pointPicker.facePreferenceMode = 'strong';
        pointPicker.straightSnaps.delete(AxisSnap.X);
        pointPicker.straightSnaps.delete(AxisSnap.Y);
        pointPicker.straightSnaps.delete(AxisSnap.Z);
        pointPicker.straightSnaps.add(new AxisSnap("Square", new THREE.Vector3(1, 1, 0)));
        pointPicker.straightSnaps.add(new AxisSnap("Square", new THREE.Vector3(1, -1, 0)));

        const { point: p1, info: { snap } } = pr1 = await pointPicker.execute({ result: pr1 }).resource(this);
        pointPicker.restrictToPlaneThroughPoint(p1, snap);

        const mode = new RectangleModeKeyboardGizmo(this.editor);
        const m = mode.execute(e => {
            switch (e) {
                case 'mode':
                    const command = new CenterBoxCommand(this.editor);
                    command.pr1 = pr1;
                    command.pr2 = pr2;
                    this.editor.enqueue(command, true);
            }
        }).resource(this);

        const rect = new CornerRectangleFactory(this.editor.db, this.editor.materials, this.editor.signals).resource(this);
        rect.p1 = p1;
        const { point: p2, info: { orientation } } = pr2 = await pointPicker.execute(result => {
            const { point: p2, info: { orientation } } = pr2 = result;
            rect.p2 = p2;
            rect.orientation = orientation;
            rect.update();
        }, { result: pr2 }).resource(this);
        rect.cancel();
        m.finish();

        box.p1 = p1;
        box.p2 = p2;
        box.orientation = orientation;

        const keyboard = new PossiblyBooleanKeyboardGizmo("box", this.editor);
        keyboard.prepare(box).resource(this);

        pointPicker = new PointPicker(this.editor);
        pointPicker.restrictToLine(p2, box.heightNormal);
        await pointPicker.execute(({ point: p3 }) => {
            box.p3 = p3;
            box.update();
            keyboard.toggle(box.isOverlapping);
        }).resource(this);

        dialog.execute(params => {
            gizmo.render(params);
            box.update();
        }).resource(this).then(() => this.finish(), () => this.cancel());

        dialog.prompt("Select target bodies", () => {
            const objectPicker = new ObjectPicker(this.editor);
            objectPicker.selection.selected.add(box.targets);
            return objectPicker.execute(async delta => {
                const targets = [...objectPicker.selection.selected.solids];
                box.targets = targets;
                await box.update();
                keyboard.toggle(box.isOverlapping);
            }, 1, Number.MAX_SAFE_INTEGER, SelectionMode.Solid).resource(this)
        }, async () => {
            box.targets = [];
            await box.update();
            keyboard.toggle(box.isOverlapping);
        });

        gizmo.basis = box.basis;
        gizmo.position.copy(box.p1);
        gizmo.execute(async (params) => {
            dialog.render();
            await box.update();
        }).resource(this);

        await this.finished;

        const results = await box.commit() as visual.Solid[];
        selection.add(results);
    }
}

export class CenterBoxCommand extends Command {
    pr1?: PointResult;
    pr2?: PointResult;

    async execute(): Promise<void> {
        const box = new PossiblyBooleanCenterBoxFactory(this.editor.db, this.editor.materials, this.editor.signals).resource(this);
        const selection = this.editor.selection.selected;
        box.targets = [...selection.solids];
        let { pr1, pr2 } = this;

        let pointPicker = new PointPicker(this.editor);
        pointPicker.facePreferenceMode = 'strong';
        pointPicker.straightSnaps.delete(AxisSnap.X);
        pointPicker.straightSnaps.delete(AxisSnap.Y);
        pointPicker.straightSnaps.delete(AxisSnap.Z);
        pointPicker.straightSnaps.add(new AxisSnap("Square", new THREE.Vector3(1, 1, 0)));
        pointPicker.straightSnaps.add(new AxisSnap("Square", new THREE.Vector3(1, -1, 0)));
        const { point: p1, info: { snap } } = pr1 = await pointPicker.execute({ result: pr1 }).resource(this);
        pointPicker.restrictToPlaneThroughPoint(p1, snap);

        const mode = new RectangleModeKeyboardGizmo(this.editor);
        const m = mode.execute(e => {
            switch (e) {
                case 'mode':
                    const command = new CornerBoxCommand(this.editor);
                    command.pr1 = pr1;
                    command.pr2 = pr2;
                    this.editor.enqueue(command, true);
            }
        }).resource(this);

        const rect = new CenterRectangleFactory(this.editor.db, this.editor.materials, this.editor.signals).resource(this);
        rect.p1 = p1;
        const { point: p2, info: { orientation } } = pr2 = await pointPicker.execute(({ point: p2, info: { orientation } }) => {
            rect.p2 = p2;
            rect.orientation = orientation;
            rect.update();
        }, { result: pr2 }).resource(this);
        rect.cancel();
        m.finish();

        box.p1 = p1;
        box.p2 = p2;
        box.orientation = orientation;

        const keyboard = new PossiblyBooleanKeyboardGizmo("box", this.editor);
        keyboard.prepare(box).resource(this);

        pointPicker = new PointPicker(this.editor);
        pointPicker.restrictToLine(p2, box.heightNormal);
        await pointPicker.execute(({ point: p3 }) => {
            box.p3 = p3;
            box.update();
            keyboard.toggle(box.isOverlapping);
        }).resource(this);

        const results = await box.commit() as visual.Solid[];
        selection.add(results);
    }
}
