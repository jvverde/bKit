'use strict'

const electron = require('electron')
const path = require('path')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Tray = electron.Tray
const Menu = electron.Menu
const ipcMain = electron.ipcMain
const shell = electron.shell

let mainWindow
let config = {}
let tray = null

if (process.env.NODE_ENV === 'development') {
  config = require('../config')
  config.url = `http://localhost:${config.port}`
} else {
  config.devtron = false
  config.url = `file://${__dirname}/dist/index.html`
}

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1200
  })

  mainWindow.loadURL(config.url)

  if (process.env.NODE_ENV === 'development') {
    BrowserWindow.addDevToolsExtension(path.join(__dirname, '../node_modules/devtron'))

    let installExtension = require('electron-devtools-installer')

    installExtension.default(installExtension.VUEJS_DEVTOOLS)
      .then((name) => mainWindow.webContents.openDevTools())
      .catch((err) => console.log('An error occurred: ', err))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  console.log('mainWindow opened')

  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    // Set the save path, making Electron not to prompt a save dialog.
    //item.setSavePath('/tmp/save.pdf')

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed')
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused')
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`)
        }
      }
    })
    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log(`Download successfully: ${item.getFilename()} in ${item.getSavePath()}`)
        console.log(`${item.getMimeType()}`)
        consoles[0].receiver.send(consoles[0].channel, {
          type: 'download',
          fullpath: `${item.getSavePath()}`,
          filename: `${item.getFilename()}`,
          mimetype: `${item.getMimeType()}`,
          disposition: `${item.getContentDisposition()}`
        })
      } else {
        console.log(`Download failed: ${state}`)
      }
    })
  })

  mainWindow.webContents.on('new-window', function(event, url) {
    event.preventDefault()
    console.log("Handing off to O/S: "+url)
    shell.openExternal(url)
  })
}
let consoles = []
ipcMain.on('register', (event, arg) => {
  consoles.push({receiver:event.sender, channel: arg})
  event.sender.send(arg, 'done register done for channel' + arg)
})

global.server = {
  address: '10.11.0.135',
  port:8088
}
//app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/*function createRecoveryWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    frame: false,
    webPreferences: {
      webSecurity: false
    }
  });
  //win.loadURL(`file://${__dirname}/recovery/index.html`);
  //win.loadURL(`file://${__dirname}/ionic/bKit/www/index.html`);
  //win.webContents.openDevTools();
  win.loadURL('file://10.11.0.135:8088/');
  win.on('closed', () => {
    //win = null
  })
  return win;
}*/

function openRecovery(menuItem, browserWindow, event) {
  //mainWindow = createRecoveryWindow()
  createWindow()
}

function exitApp() {
    app.quit();
}

app.on('ready', () => {
  createWindow()
  tray = new Tray('icons/logo/512x512.png')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Recovery', type: 'normal', click: openRecovery },
    { label: 'Backup', type: 'normal' },
    { label: 'Exit', type: 'normal', click: exitApp }
  ])
  tray.setToolTip('Back me up')
  tray.setContextMenu(contextMenu)
});

// console.log('Path:',app.getAppPath());

/*const spawn = require('child_process').spawn;
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});*/
