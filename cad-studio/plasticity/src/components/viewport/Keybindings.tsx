import { render } from 'preact';
import { Editor } from '../../editor/Editor';
import { humanizeKeystrokes } from '../atom/tooltip-manager';
import { keybindings } from '../toolbar/icons';

export default (editor: Editor) => {
    class Keybindings extends HTMLElement {
        private commands = new Set<string>();

        connectedCallback() {
            editor.signals.keybindingsRegistered.add(this.add);
            editor.signals.keybindingsCleared.add(this.delete);
        }

        disconnectedCallback() {
            editor.signals.keybindingsRegistered.remove(this.add);
            editor.signals.keybindingsCleared.remove(this.delete);
        }

        render() {
            const { commands } = this;
            const keymaps = editor.keymaps;
            const sections = new Map<string, string[]>();
            for (const command of commands) {
                const [, prefix, name] = command.match(/([\w-:]+):([\w-]+)$/)!;
                if (!sections.has(prefix)) sections.set(prefix, []);
                const section = sections.get(prefix)!;
                section.push(name);
            }
            const result = [...sections].map(([prefix, values]) =>
                <dl class="grid grid-cols-2 auto-rows-[1.25rem] w-52 text-xs bg-transparent text-neutral-100 min-h-24 min-w-[6rem] first-of-type:mr-8">
                    {[...values].map(postfix => {
                        const command = `${prefix}:${postfix}`;
                        const bindings = keymaps.findKeyBindings({ command });
                        if (bindings.length == 0) {
                            console.warn("Command missing from keymap (default-keymap.ts):", command);
                            return;
                        }
                        const keystroke = humanizeKeystrokes(bindings[0].keystrokes);
                        const desc = keybindings.get(command);
                        if (desc === undefined) console.error("Description missing from (icons.ts)", command);

                        return <>
                            <dt class="px-1">
                                <label class="text-center px-1 mr-1 text-xs font-extrabold border min-w-[1.5rem] text-neutral-50 border-neutral-200 float-right">{keystroke}</label>
                            </dt>
                            <dd>{desc}</dd>
                        </>
                    })}
                </dl>
            );
            render(<div class="flex absolute right-3 bottom-3 space-x-2 pointer-events-none">
                {result}
            </div>, this);
        }

        add = (commands: string[]) => {
            for (const command of commands) this.commands.add(command);
            this.render();
        }

        delete = (commands: string[]) => {
            for (const command of commands) this.commands.delete(command);
            this.render();
        }
    }
    customElements.define('plasticity-keybindings', Keybindings);
};