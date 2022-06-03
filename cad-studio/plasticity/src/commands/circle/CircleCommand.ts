import Command from "../../command/Command";
import { PointPicker } from "../../command/point-picker/PointPicker";
import { AxisSnap } from "../../editor/snaps/AxisSnap";
import * as visual from "../../visual_model/VisualModel";
import { CenterPointArcFactory } from "../arc/ArcFactory";
import LineFactory from '../line/LineFactory';
import { CircleDialog } from "./CircleDialog";
import { CenterCircleFactory, EditCircleFactory, ThreePointCircleFactory, TwoPointCircleFactory } from './CircleFactory';
import { CircleGizmo } from "./CircleGizmo";
import { CircleKeyboardGizmo } from "./CircleKeyboardGizmo";
import * as THREE from "three";

export class CenterCircleCommand extends Command {
    async execute(): Promise<void> {
        const circle = new CenterCircleFactory(this.editor.db, this.editor.materials, this.editor.signals).resource(this);

        const pointPicker = new PointPicker(this.editor);
        pointPicker.facePreferenceMode = 'strong';
        pointPicker.straightSnaps.delete(AxisSnap.Z);
        const { point: p1, info: { snap } } = await pointPicker.execute().resource(this);
        circle.center = p1;

        const keyboard = new CircleKeyboardGizmo(this.editor);
        keyboard.execute(e => {
            switch (e) {
                case 'mode':
                    circle.toggleMode();
                    circle.update();
            }
        }).resource(this);

        pointPicker.restrictToPlaneThroughPoint(p1, snap);
        await pointPicker.execute(({ point: p2, info: { orientation, viewport } }) => {
            circle.point = p2;
            circle.orientation = orientation;
            circle.update();
        }).resource(this);

        const result = await circle.commit() as visual.SpaceInstance<visual.Curve3D>;
        this.editor.selection.selected.addCurve(result);

        const next = new EditCircleCommand(this.editor);
        next.circle = result;
        this.editor.enqueue(next, false);
    }
}

export class EditCircleCommand extends Command {
    circle!: visual.SpaceInstance<visual.Curve3D>;
    remember = false;

    async execute(): Promise<void> {
        const edit = new EditCircleFactory(this.editor.db, this.editor.materials, this.editor.signals).resource(this);
        edit.circle = this.circle;

        const dialog = new CircleDialog(edit, this.editor.signals);
        const gizmo = new CircleGizmo(edit, this.editor);
        
        dialog.execute(params => {
            edit.update();
            dialog.render();
            gizmo.render(edit);
        }).rejectOnInterrupt().resource(this);

        gizmo.position.copy(edit.center);
        gizmo.quaternion.setFromUnitVectors(Z, edit.axis);
        gizmo.execute(async params => {
            dialog.render();
            await edit.update();
        }).resource(this);

        await this.finished;

        const result = await edit.commit() as visual.SpaceInstance<visual.Curve3D>;
        this.editor.selection.selected.addCurve(result);
    }
}

export class TwoPointCircleCommand extends Command {
    async execute(): Promise<void> {
        const circle = new TwoPointCircleFactory(this.editor.db, this.editor.materials, this.editor.signals).resource(this);

        const keyboard = new CircleKeyboardGizmo(this.editor);
        keyboard.execute(e => {
            switch (e) {
                case 'mode':
                    circle.toggleMode();
                    circle.update();
                    break;
            }
        }).resource(this);

        const pointPicker = new PointPicker(this.editor);
        pointPicker.straightSnaps.delete(AxisSnap.Z);
        const { point: p1, info: { snap } } = await pointPicker.execute().resource(this);
        circle.p1 = p1;

        pointPicker.restrictToPlaneThroughPoint(p1, snap);
        await pointPicker.execute(({ point: p2, info: { orientation, viewport } }) => {
            circle.p2 = p2;
            circle.orientation = orientation;
            circle.update();
        }).resource(this);

        const result = await circle.commit() as visual.SpaceInstance<visual.Curve3D>;
        this.editor.selection.selected.addCurve(result);

        const next = new EditCircleCommand(this.editor);
        next.circle = result;
        this.editor.enqueue(next, false);
    }
}

export class ThreePointCircleCommand extends Command {
    async execute(): Promise<void> {
        const circle = new ThreePointCircleFactory(this.editor.db, this.editor.materials, this.editor.signals).resource(this);

        const pointPicker = new PointPicker(this.editor);
        const { point: p1 } = await pointPicker.execute().resource(this);
        circle.p1 = p1;

        const { point: p2 } = await pointPicker.execute().resource(this);
        circle.p2 = p2;

        await pointPicker.execute(({ point: p3, info: { viewport } }) => {
            circle.p3 = p3;
            circle.update();
        }).resource(this);

        const result = await circle.commit() as visual.SpaceInstance<visual.Curve3D>;
        this.editor.selection.selected.addCurve(result);

        const next = new EditCircleCommand(this.editor);
        next.circle = result;
        this.editor.enqueue(next, false);
    }
}

export class CenterPointArcCommand extends Command {
    async execute(): Promise<void> {
        const arc = new CenterPointArcFactory(this.editor.db, this.editor.materials, this.editor.signals).resource(this);

        const pointPicker = new PointPicker(this.editor);
        pointPicker.straightSnaps.delete(AxisSnap.Z);
        const { point: p1, info: { snap } } = await pointPicker.execute().resource(this);
        arc.center = p1;

        pointPicker.restrictToPlaneThroughPoint(p1, snap);

        const line = new LineFactory(this.editor.db, this.editor.materials, this.editor.signals).resource(this);
        line.p1 = p1;
        const { point: p2 } = await pointPicker.execute(({ point }) => {
            line.p2 = point;
            line.update();
        }).resource(this);
        line.cancel();
        arc.p2 = p2;

        await pointPicker.execute(({ point: p3, info: { orientation } }) => {
            arc.p3 = p3;
            arc.orientation = orientation;
            arc.update();
        }).resource(this);

        const result = await arc.commit() as visual.SpaceInstance<visual.Curve3D>;
        this.editor.selection.selected.addCurve(result);
    }
}

const Z = new THREE.Vector3(0, 0, 1);
