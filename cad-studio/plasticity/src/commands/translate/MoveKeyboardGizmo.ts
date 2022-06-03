import * as cmd from "../../command/CommandKeyboardInput";
import { CommandKeyboardInput } from "../../command/CommandKeyboardInput";
import * as pp from "../../command/point-picker/PointPicker";

interface EditorLike extends cmd.EditorLike, pp.EditorLike {
}

export class MoveKeyboardGizmo extends CommandKeyboardInput {
    constructor(editor: EditorLike) {
        super('move', editor, [
            'keyboard:move:free',
            'keyboard:move:pivot',
        ]);
    }
}