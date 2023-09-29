import { GetID } from './httpRequest'
import { GetInfo } from './download'
import Login from './utils/login'

const login = new Login()
export default (ipcMain) => {
  // 获取作品ID
  ipcMain.handle('GetID', async (event, url) => {
    return GetID(url)
  })

  // 获取作品ID
  ipcMain.handle('GetInfo', async (event, id, dycookie, isScanCode) => {
    return GetInfo(id, dycookie, isScanCode)
  })

  ipcMain.handle('login', async () => {
    return login.getQrCode()
  })

  ipcMain.handle('getLoginStatus', async () => {
    return login.checkQrConnect()
  })
}
