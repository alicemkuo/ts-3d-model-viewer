import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
import { TempDir } from './editor/TempDir';
import { isMac } from './index';
import { ConfigFiles, OrbitMode } from './startup/ConfigFiles';

export function buildMenu(mainWindow: BrowserWindow) {
    const template: MenuItemConstructorOptions[] = [];
    // { role: 'appMenu' }
    if (isMac) {
        template.push({
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });
    }
    // { role: 'fileMenu' }
    template.push({
        label: 'File',
        submenu: [
            { label: 'New...', accelerator: "CommandOrControl+N", click: e => mainWindow.webContents.send('menu-command', 'file:new') },
            { label: 'Open...', accelerator: "CommandOrControl+O", click: e => mainWindow.webContents.send('menu-command', 'file:open') },
            { label: 'Save as...', accelerator: "CommandOrControl+S", click: e => mainWindow.webContents.send('menu-command', 'file:save-as') },
            { role: 'quit' }
        ]
    });
    // { role: 'editMenu' }

    template.push({
        label: 'Edit',
        submenu: [
            { label: 'Undo', accelerator: "CommandOrControl+Z", click: (i, w, e) => { if (e.triggeredByAccelerator) return; mainWindow.webContents.send('menu-command', 'edit:undo') } },
            { label: 'Redo', accelerator: "Shift+CommandOrControl+Z", click: (i, w, e) => { if (e.triggeredByAccelerator) return; mainWindow.webContents.send('menu-command', 'edit:redo') } },
            { label: 'Repeat last command', accelerator: "Shift+R", click: (i, w, e) => { if (e.triggeredByAccelerator) return; mainWindow.webContents.send('menu-command', 'edit:repeat-last-command') } },
        ]
    });
    template.push({
        label: 'Selection',
        submenu: [
            { label: 'Hide selected', accelerator: "H", click: (i, w, e) => { if (e.triggeredByAccelerator) return; mainWindow.webContents.send('menu-command', 'command:hide-selected') } },
            { label: 'Unhide all', accelerator: "Alt+H", click: (i, w, e) => { if (e.triggeredByAccelerator) return; mainWindow.webContents.send('menu-command', 'command:unhide-all') } },
            { label: 'Hide everything other than selected', accelerator: "Shift+H", click: (i, w, e) => { if (e.triggeredByAccelerator) return; mainWindow.webContents.send('menu-command', 'command:hide-unselected') } },
            { label: 'Invert hidden', accelerator: "Control+H", click: (i, w, e) => { if (e.triggeredByAccelerator) return; mainWindow.webContents.send('menu-command', 'command:invert-hidden') } },
            { type: 'separator' },
            { label: 'Focus camera on selected', accelerator: "/", click: (i, w, e) => { if (e.triggeredByAccelerator) return; mainWindow.webContents.send('menu-command', 'viewport:focus') } },
            { type: 'separator' },
            { label: 'Deselect all', accelerator: "Alt+A", click: (i, w, e) => { if (e.triggeredByAccelerator) return; mainWindow.webContents.send('menu-command', 'command:deselect-all') } },
            { type: 'separator' },
            { label: 'Convert current selection to points', accelerator: "Control+1", click: (i, w, e) => { if (e.triggeredByAccelerator) return; mainWindow.webContents.send('menu-command', 'selection:convert:control-point') } },
            { label: 'Convert current selection to edges', accelerator: "Control+2", click: (i, w, e) => { if (e.triggeredByAccelerator) return; mainWindow.webContents.send('menu-command', 'selection:convert:edge') } },
            { label: 'Convert current selection to faces', accelerator: "Control+3", click: (i, w, e) => { if (e.triggeredByAccelerator) return; mainWindow.webContents.send('menu-command', 'selection:convert:face') } },
            { label: 'Convert current selection to solids', accelerator: "Control+4", click: (i, w, e) => { if (e.triggeredByAccelerator) return; mainWindow.webContents.send('menu-command', 'selection:convert:solid') } },
        ]
    });
    // { role: 'viewMenu' }
    template.push({
        label: 'View',
        submenu: [
            {
                label: 'Reload', accelerator: 'CommandOrControl+R', click: async () => {
                    BrowserWindow.getFocusedWindow()?.webContents.forcefullyCrashRenderer();
                    BrowserWindow.getFocusedWindow()?.webContents.reload();
                }
            },
            { role: 'toggleDevTools' },
            { role: 'togglefullscreen' }
        ]
    });
    // { role: 'windowMenu' }
    if (isMac) {
        template.push({
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'window' }
            ]
        });
    } else {
        template.push({
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { role: 'close' }
            ]
        });
    }
    template.push({
        label: 'Keybindings',
        submenu: [
            { label: 'Default', click: updateOrbitControls('default') },
            { label: 'Blender', click: updateOrbitControls('blender') },
            { label: 'Maya', click: updateOrbitControls('maya') },
            { label: 'Moi3D', click: updateOrbitControls('moi3d') },
            { label: '3ds Max', click: updateOrbitControls('3dsmax') },
            { label: 'Touchpad', click: updateOrbitControls('touchpad') },
        ]
    });
    template.push({
        role: 'help',
        submenu: [
            { label: `Version: ${app.getVersion()}` },
            {
                label: 'Emergency clear backup', click: e => {
                    TempDir.clear();
                    BrowserWindow.getFocusedWindow()?.webContents.forcefullyCrashRenderer();
                    BrowserWindow.getFocusedWindow()?.webContents.reload();
                }
            },
        ]
    });
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

export function updateOrbitControls(mode: OrbitMode): ((menuItem: Electron.MenuItem, browserWindow: Electron.BrowserWindow | undefined, event: Electron.KeyboardEvent) => void) | undefined {
    return e => {
        ConfigFiles.updateOrbitControls(mode);
        BrowserWindow.getFocusedWindow()?.webContents.reload();
    };
}

