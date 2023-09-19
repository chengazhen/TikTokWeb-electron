import { getFp } from './cookie'
import XB from './x-bogus'
import URLS from './urls'
import { generateTtwid } from '../httpRequest'
import axios from 'axios'
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

    this.initHeaders().then(() => {
      // 初始化默认调用登录二维码
      this.getQrCode()
    })
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
      return qrcode_index_url
      // this.showQrCode(qrcode_index_url)
      // this.checkQrConnect(token)
    } catch (e) {
      const errorMessage = `网络异常: 获取二维码失败。 状态码: ${e}`
      console.error(errorMessage)
    }
  }

  checkQrConnect(token) {
    try {
      const params = XB.getXBogus(
        `token=${token}&service=https%3A%2F%2Fwww.douyin.com&need_logo=false&need_short_url=true&device_platform=web_app&aid=6383&account_sdk_source=sso&sdk_version=2.2.5&language=zh&verifyFp=${this.verifyFp}&fp=${this.verifyFp}`
      )
      const domain = URLS.SSO_LOGIN_CHECK_QR

      while (true) {
        const response = Util.requests.get(`${domain}${params[0]}`, { headers: this.loginHeaders })
        const data = response.json().data
        const status = data.status

        switch (status) {
          case '1':
            this.logAndPrint('1')
            break
          case '2':
            this.logAndPrint('2')
            break
          case '3':
            this.logAndPrint('3')
            const redirectUrl = data.redirect_url
            const loginCookies = Util.Cookies().splitCookies(response.headers['set-cookie'] || '')
            return this.loginRedirect(redirectUrl, loginCookies)
          case '4':
            this.logAndPrint('4')
            break
          case '5':
            this.logAndPrint('5')
            this.getQrCode()
            break
        }
        Util.time.sleep(3)
      }
    } catch (e) {
      if (response) {
        const errorMessage = `网络异常: 检查二维码扫码状态失败。 状态码: ${response.status_code}, 响应体: ${response.text}, 异常: ${e}`
        console.error(errorMessage)
        throw new Error(errorMessage)
      } else {
        const errorMessage = `网络异常: 获取二维码失败。 无法连接到服务器。 异常: ${e}`
        console.error(errorMessage)
        throw new Error(errorMessage)
      }
    }
  }

  loginRedirect(redirectUrl, cookie) {
    try {
      this.loginHeaders.Cookie = cookie
      const loginResponse = Util.requests.get(redirectUrl, { headers: this.loginHeaders })

      if (loginResponse.history[0].status_code === 302) {
        this.loginHeaders.Cookie = Util.Cookies().splitCookies(
          loginResponse.history[1].headers['set-cookie'] || ''
        )
        this.loginHeaders['User-Agent'] =
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
        // 写入配置文件
        Util.Config().save(this.loginHeaders.Cookie)
        console.log('[  登录  ]:重定向登录成功\r')
        return true
      } else {
        console.log('[  登录  ]:重定向登录失败\r')
        if (loginResponse) {
          const errorMessage = `网络异常: 重定向登录失败。 状态码: ${loginResponse.status_code}, 响应体: ${loginResponse.text}`
          console.warn(errorMessage)
        } else {
          console.warn('网络异常: 重定向登录失败。 无法连接到服务器。')
        }
        return false
      }
    } catch (e) {
      console.error(e)
      return false
    }
  }

  logAndPrint(status) {
    const data = this.statusMapping[status] || {}
    const message = data.message || ''
    const logFunc = data.log || console.log
    console.log(message)
    logFunc(message)
  }
}
