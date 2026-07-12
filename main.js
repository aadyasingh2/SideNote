const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron/main')
const path = require('path')
const createWindow = () => {
    const win = new BrowserWindow({
        width: 400,
        height: 600,
        transparent: true,
        frame: false,
        resizable: false,
        alwaysOnTop: true,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    let isCollapsed = false
    let isTransitioning = false
    let moveTimeout
    function togglecollapse() {
        if (isTransitioning) return // Lock execution if already changing sizes
        isTransitioning = true

        win.setResizable(true)
        if (isCollapsed === false) {
            win.setSize(60, 60)
            win.webContents.send('collapsed')
            isCollapsed = true
        } else {
            win.setSize(400, 600)
            win.webContents.send('expanded')
            isCollapsed = false
        }
        win.setResizable(false)

        // Release lock after window dimensions update
        setTimeout(() => { isTransitioning = false }, 50)

    }
    win.on('closed', () => {
        globalShortcut.unregister('CommandOrControl+Shift+D')
    })
    globalShortcut.register('CommandOrControl+Shift+D', togglecollapse)
    ipcMain.on('toggling collapse', (event) => {
        togglecollapse()
    })
    win.on('move', () => {
        clearTimeout(moveTimeout)
        moveTimeout = setTimeout(() => {
            let { x, y, width, height } = win.getBounds();
            let { width: screenwidth, height: screenheight } = screen.getPrimaryDisplay().workAreaSize

            const outLeft = x + width / 2 < 0
            const outRight = x + width / 2 > screenwidth
            const outBottom = y + height / 2 > screenheight

            if ((outLeft || outRight || outBottom) && isCollapsed == false) {
                let newX = x
                let newY = y

                if (outLeft) newX = 0
                if (outRight) newX = screenwidth - 60
                if (outBottom) newY = screenheight - 60
                if (newY < 0) newY = 0
                togglecollapse()
                win.setBounds({ x: newX, y: newY, width: 60, height: 60 })
            }
        }, 200)
    })
    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})