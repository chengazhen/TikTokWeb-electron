import axios from 'axios'
// const axios = require('axios')

// 常量定义
// eslint-disable-next-line no-useless-escape

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

/**
 * @description: 获取ttwid
 * @return {*}
 */
export function generateTtwid() {
  return axios
    .post('https://ttwid.bytedance.com/ttwid/union/register/', {
      region: 'cn',
      aid: 1768,
      needFid: false,
      service: 'www.ixigua.com',
      migrate_info: {
        ticket: '',
        source: 'node'
      },
      cbUrlProtocol: 'https',
      union: true
    })
    .then((response) => {
      const cookieHeaders = response.headers['set-cookie'] || []
      let ttwid = ''
      for (const cookieHeader of cookieHeaders) {
        const matches = cookieHeader.match(/ttwid=([^;]+)/)
        if (matches && matches.length > 1) {
          ttwid = matches[1]
          break
        }
      }
      return ttwid
    })
}
