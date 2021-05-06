const {app,BrowserWindow,ipcMain,dialog,Menu} = require('electron')
const Store = require('electron-store');
const DataStore = require('./MusicDataStore')
const myStore = new DataStore({'name':'Music Data'})




class AppWindow extends BrowserWindow{
    constructor(config,fileLocation){
        
        const basicConfig = {
            width:800,
            height:600,
            webPreferences:{
                nodeIntegration:true,
                contextIsolation: false
            }
        }
        //const finalConfig = Object.assign(basicConfig, config)
        const finalConfig ={...basicConfig,...config}
        super(finalConfig)
        this.loadFile(fileLocation)
        this.once('ready-to-show', () => {
            this.show()
        })

    }
}

app.on('ready',()=>{
    
    const mainWindow = new AppWindow({},'./renderer/index.html')
    //mainWindow.loadFile('./renderer/index.html')
    // 隐藏菜单栏 
    Menu.setApplicationMenu(null)
    mainWindow.webContents.openDevTools();
    mainWindow.webContents.on('did-finish-load',() =>{
        mainWindow.send('getTracks',myStore.getTracks())
    })
     ipcMain.on ('add-music-window',() => {
        const addWindow = new AppWindow({
            width:400,
            height:300,
            parent : mainWindow
        },'./renderer/add.html')
      
       // addWindow.loadFile('./renderer/add.html')
         // event.sender.send('reply','yes')
        // addWindow.send('reply','yes')
     })
     ipcMain.on ('music-track',(event,tracks)=>{
        const updatedTracks = myStore.addTracks(tracks).getTracks()
        mainWindow.send('getTracks', updatedTracks)
     })

     ipcMain.on ('open-music-file',(event)=>{
         dialog.showOpenDialog({
             properties:['openFile','multiSelections'],
             filters: [{ name: 'Musaic', extensions: ['wav', 'mp3' ,'flac'] }]

         }).then(result => {
            //console.log(result)
            if(result){
                event.sender.send('selected-files',result.filePaths)
            }
           // console.log(result.canceled)
           // console.log(result.filePaths)
          }).catch(err => {
            console.log(err)
          })
     })

     ipcMain.on ('delete-track',(event,id)=>{
        const updatedTracks = myStore.deleteTracks(id).getTracks()
        mainWindow.send('getTracks', updatedTracks)
     })


    
})