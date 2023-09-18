import { GetID, GetInfo } from './httpRequest'

export default (ipcMain) => {
  // 获取作品ID
  ipcMain.handle('fetch-data', async (event, url) => {
    return GetID(url)
  })

  // 获取作品ID
  ipcMain.handle('GetInfo', async (event, id, dycookie) => {
    return GetInfo(id, dycookie)
  })
}
