const axios = require('axios')

// 常量定义
// const invalid = /[\\\n\r/:*?\"<>|]/g
// const repWith = ``
// const AWE_URL_BASE = 'http://aweme.snssdk.com/aweme/v1/play/?'
// const DETAIL_URL_BASE = 'https://www.douyin.com/aweme/v1/web/aweme/detail/?'
// const USER_AGENT_MOBILE =
//   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
const USER_AGENT_DESKTOP =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
const VIDEO_REGEX = /video\/(\d*)/
const NOTE_REGEX = /note\/(\d*)/

/**
 * 获取作品ID
 * @param {string} dyurl - 抖音短链接。
 * @returns {string} 作品ID
 * @throws {Error} 在请求失败或解析ID时可能会抛出错误。
 */
export async function GetID(dyurl) {
  return axios
    .get(dyurl, {
      headers: { 'user-agent': USER_AGENT_DESKTOP }
    })
    .then((response) => {
      let item_ids
      if (response.request.res.responseUrl.includes('video')) {
        item_ids = VIDEO_REGEX.exec(response.request.res.responseUrl)[1]
      } else if (response.request.res.responseUrl.includes('note')) {
        item_ids = NOTE_REGEX.exec(response.request.res.responseUrl)[1]
      } else {
        throw new Error('URL格式不匹配任何已知模式')
      }
      return item_ids
    })
}
