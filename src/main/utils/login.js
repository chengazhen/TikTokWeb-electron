import { getFp, splitCookies } from './cookie'
import XB from './x-bogus'
import URLS from './urls'
import { generateTtwid } from '../httpRequest'
import axios from 'axios'
import { setCookie } from './storage'
// import { ipcMain } from 'electron'

export default class Login {
  constructor() {
    this.verifyFp = ''
    this.loginHeaders = {
      Cookie: '',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.183',
      Referer: 'https://www.douyin.com/'
    }

    this.checkQrParams = ''

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
      const _params = await XB.getXBogus(
        `token=${token}&service=https%3A%2F%2Fwww.douyin.com&need_logo=false&need_short_url=true&device_platform=web_app&aid=6383&account_sdk_source=sso&sdk_version=2.2.5&language=zh&verifyFp=${this.verifyFp}&fp=${this.verifyFp}`
      )
      this.checkQrParams = _params[0]
      return qrcode_index_url
    } catch (e) {
      const errorMessage = `网络异常: 获取二维码失败。 状态码: ${e}`
      console.error(errorMessage)
    }
  }

  async checkQrConnect() {
    // let timer = 0
    // let maxRequest = 10
    // let requestCount = 0
    try {
      // const params = XB.getXBogus(
      //   `token=${token}&service=https%3A%2F%2Fwww.douyin.com&need_logo=false&need_short_url=true&device_platform=web_app&aid=6383&account_sdk_source=sso&sdk_version=2.2.5&language=zh&verifyFp=${this.verifyFp}&fp=${this.verifyFp}`
      // )

      const {
        headers,
        data: {
          data: { status, redirect_url }
        }
      } = await axios.get(`${URLS.SSO_LOGIN_CHECK_QR}${this.checkQrParams}`, {
        headers: this.loginHeaders
      })

      if (status === '3') {
        const res = await this.loginRedirect(
          redirect_url,
          splitCookies(headers['set-cookie'] || '')
        )
        if (res) {
          return '3'
        }
      }

      return status
    } catch (e) {
      return Promise.reject(e)
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
        setCookie(this.loginHeaders.Cookie)
        return true
      }
      throw new Error('登录失败')
    } catch (e) {
      return Promise.reject(e)
    }
  }
}
