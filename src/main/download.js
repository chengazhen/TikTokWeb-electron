import getXB from './utils/x-bogus1'
import axios from 'axios'

// 常量定义
// eslint-disable-next-line no-useless-escape
const invalid = /[\\\n\r/:*?\"<>|]/g
const repWith = ``
const DETAIL_URL_BASE = 'https://www.douyin.com/aweme/v1/web/aweme/detail/?'
const USER_AGENT_MOBILE =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'

/**
 * 根据作品ID和cookie获取作品详细信息
 * @param {string} item_ids - 作品ID。
 * @param {Object} dycookie - 抖音cookie对象。
 * @param {Function} getXB - 获取XB参数的函数。
 * @param {boolean} isScanCode - 是否为扫码获取。
 * @returns {Object} 作品的详细信息
 * @throws {Error} 在请求失败或解析数据时可能会抛出错误。
 */
export function GetInfo(item_ids, dycookie, isScanCode = false) {
  // 构造请求URL
  const params_url = `aweme_id=${item_ids}&aid=1128&version_name=23.5.0&device_platform=android&os_version=2333`
  const xb = getXB(params_url)
  const url = `${DETAIL_URL_BASE}${params_url}&X-Bogus=${xb}`

  let cookie = null
  if (isScanCode) {
    cookie = dycookie
  } else {
    dycookie = JSON.parse(dycookie)
    cookie = `sessionid_ss=${dycookie['sessionid_ss']};ttwid=${dycookie['ttwid']};passport_csrf_token=${dycookie['passport_csrf_token']};msToken=${dycookie['msToken']};`
  }

  return axios
    .get(url, {
      headers: {
        cookie,
        referer: 'https://www.douyin.com/',
        'user-agent': USER_AGENT_MOBILE
      }
    })
    .then((response) => {
      // 如果response.data为空或未定义
      if (!response.data) {
        return {
          status: -1
        }
      }

      // 校验响应状态
      if (response.data.status_code === 0) {
        // 提取需要的数据
        const { video, music, author, desc, aweme_id, aweme_type } = response.data.aweme_detail
        const unique_id = author.unique_id || author.short_id // 如果unique_id为空，则使用short_id
        const userhome = `https://www.douyin.com/user/${author.sec_uid}`
        const type = Number(aweme_type) === 0 ? '视频' : '图集'
        const images =
          Number(aweme_type) !== 0
            ? response.data.aweme_detail.images.map((image) => image.url_list[0])
            : []
        //const images = aweme_type !== 0 && response.data.aweme_detail.images ? response.data.aweme_detail.images.map(image => image.url_list[0]) : [];

        const url = video?.bit_rate?.[0]?.play_addr?.url_list?.[0] ?? ''
        const cleanedDesc = desc.replaceAll(invalid, repWith)

        return {
          status: 0,
          data: {
            url,
            desc: cleanedDesc,
            music: music.play_url.uri,
            m_title: music.title,
            nickname: author.nickname,
            unique_id,
            video_id: aweme_id,
            userhome,
            type,
            images
          }
        }
      } else {
        // 如果响应状态码不为0，抛出错误
        throw new Error(`Error with status code: ${response.data.status_code}`)
      }
    })
}
