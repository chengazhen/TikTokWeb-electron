import { GetID } from './httpRequest'

export default (ipcMain) => {
  // 获取作品ID
  ipcMain.handle('fetch-data', async (event, url) => {
    return GetID(url)
  })
}
