import { getFp, splitCookies } from './cookie'
import XB from './x-bogus'
import URLS from './urls'
import { generateTtwid } from '../httpRequest'
import axios from 'axios'
// import { getCookie, setCookie } from './storage'
// import { ipcMain } from 'electron'

export default class Login {
  constructor() {
    // 登录日志消息映射
    this.statusMapping = {
      1: { message: '[  登录  ]:等待二维码扫描！\r', log: console.log },
      2: { message: '[  登录  ]:扫描二维码成功！\r', log: console.log },
      3: { message: '[  登录  ]:确认二维码登录！\r', log: console.log },
      4: { message: '[  登录  ]:访问频繁，请检查参数！\r', log: console.warn },
      5: { message: '[  登录  ]:二维码过期，重新获取！\r', log: console.warn }
    }

    this.verifyFp = ''
    this.loginHeaders = {
      Cookie: '',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.183',
      Referer: 'https://www.douyin.com/'
    }

    this.initHeaders()
  }

  async initHeaders() {
    const ttwid = await generateTtwid()
    if (ttwid) {
      this.loginHeaders.Cookie = `ttwid=${ttwid}`
    }
  }

  async getQrCode() {
    try {
      this.verifyFp = getFp()
      const params = XB.getXBogus(
        `service=https%3A%2F%2Fwww.douyin.com&need_logo=false&need_short_url=true&device_platform=web_app&aid=6383&account_sdk_source=sso&sdk_version=2.2.5&language=zh&verifyFp=${this.verifyFp}&fp=${this.verifyFp}`
      )
      const { data } = await axios.get(`${URLS.SSO_LOGIN_GET_QR}${params[0]}`, {
        headers: this.loginHeaders
      })

      const { qrcode_index_url, token } = data.data

      // 开始检查二维码扫码状态
      this.checkQrConnect(token)
      return qrcode_index_url
    } catch (e) {
      const errorMessage = `网络异常: 获取二维码失败。 状态码: ${e}`
      console.error(errorMessage)
    }
  }

  checkQrConnect(token) {
    let timer = 0
    let maxRequest = 10
    let requestCount = 0
    try {
      const params = XB.getXBogus(
        `token=${token}&service=https%3A%2F%2Fwww.douyin.com&need_logo=false&need_short_url=true&device_platform=web_app&aid=6383&account_sdk_source=sso&sdk_version=2.2.5&language=zh&verifyFp=${this.verifyFp}&fp=${this.verifyFp}`
      )

      const check = async () => {
        // 每三秒检查一次
        timer = setTimeout(() => {
          if (timer) {
            check()
          }
        }, 5000)

        if (requestCount > maxRequest) {
          requestCount = 0
          clearTimeout(timer)
          timer = 0
          return
        }

        const { headers, data: _data } = await axios.get(`${URLS.SSO_LOGIN_CHECK_QR}${params[0]}`, {
          headers: this.loginHeaders
        })

        const data = _data.data
        const status = data.status

        switch (status) {
          case '1':
            this.logAndPrint('1')
            break
          case '2':
            this.logAndPrint('2')
            break
          case '3':
            {
              this.logAndPrint('3')
              clearTimeout(timer)
              timer = 0
              this.loginRedirect(data.redirect_url, splitCookies(headers['set-cookie'] || ''))
            }
            break
          case '4':
            this.logAndPrint('4')
            break
          case '5':
            this.logAndPrint('5')
            this.getQrCode()
            break
        }
        requestCount++
      }

      check()
    } catch (e) {
      clearTimeout(timer)
      timer = 0
      const errorMessage = `网络异常: 检查二维码扫码状态失败。 状态码: ${e}`
      console.error(errorMessage)
    }
  }

  async loginRedirect(redirectUrl, cookie) {
    try {
      this.loginHeaders.Cookie = cookie
      const { status, headers } = await axios.get(redirectUrl, { headers: this.loginHeaders })
      if (status === 200) {
        this.loginHeaders.Cookie = splitCookies(headers['set-cookie'])
        this.loginHeaders['User-Agent'] =
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
        return
      }
      throw new Error('登录失败')
    } catch (e) {
      console.error(e)
    }
  }

  logAndPrint(status) {
    const data = this.statusMapping[status] || {}
    const message = data.message || ''
    console.log(message)
    // logFunc(message)
  }
}
