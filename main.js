const electron = require( 'electron' );
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ejs = require('ejs-electron')

ejs.data({
  "title": "First App",
  "rows" : 100,
  "cols" : 26
});

function createWindow()
{
    const win = new BrowserWindow({
        webPreferences: {
        nodeIntegration: true,
        enableRemoteModule : true
      }
    });
    win.loadFile( 'index.ejs' ).then( function(){
      win.removeMenu();
      win.maximize();
      win.webContents.openDevTools(); //to open inspect element of the app
    } );
}
app.whenReady().then( createWindow );

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
  
  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.