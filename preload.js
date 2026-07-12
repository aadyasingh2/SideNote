const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld(
    'sidenote',
    {
        getCollapse: () => {
            ipcRenderer.send('toggling collapse')
        },
        onCollapsed: (callback) => ipcRenderer.on('collapsed', (e, ...args) => callback(args)),
        onExpand: (callback) => ipcRenderer.on('expanded', (e, ...args) => callback(args))
    },



)