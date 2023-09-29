<template>
  <div class="max-w-800px mx-auto">
    <div>
      <h1>TikTokElectron</h1>

      <blockquote>
        <p><em>先填写你的抖音cookie，然后输入长短链点击解析试试吧🎉！</em></p>
      </blockquote>

      <div class="input-group input-group-lg" style="margin-bottom: 10px">
        <n-input v-model:value="videoUrl" type="text" placeholder="请输入作品链接" />
        <div class="input-group-btn">
          <div class="mt-2">
            <NButton type="success" class="mr-1" :loading="analysisLoading" @click="parseVideo">
              解析
            </NButton>
            <NButton type="warning" class="mr-1" @click="showModal = true">
              手动设置Cookie
            </NButton>
            <!-- <NButton type="warning" class="mr-1" @click="getQrocde"> 扫码设置Cookie </NButton> -->
            <NButton type="success" class="mr-1" :disabled="!videoData.url" @click="handleSave">
              下载视频
            </NButton>
            <NButton type="success" :disabled="!videoData.music" @click="handleSaveMusic">
              下载音频
            </NButton>
          </div>
        </div>

        <!-- cookie配置-->
      </div>

      <!-- 作品详细-->
      <div id="xgplayer"></div>
      <div id="video_info">
        <!--  -->
        <n-table :single-line="false">
          <table class="w-full">
            <tr align="right">
              <td style="width: 40%"><span class="column">类型</span></td>
              <td>
                <span id="type" class="column" style="text-align: center; display: block">{{
                  videoData.type
                }}</span>
              </td>
            </tr>
            <tr align="right">
              <td style="width: 40%"><span class="column">文案</span></td>
              <td>
                <span id="desc" class="column" style="text-align: center; display: block">{{
                  videoData.desc
                }}</span>
              </td>
            </tr>
            <tr align="right">
              <td style="width: 40%"><span class="column">抖音ID</span></td>
              <td>
                <span id="unique_id" class="column" style="text-align: center; display: block">{{
                  videoData.unique_id
                }}</span>
              </td>
            </tr>
            <tr align="right">
              <td style="width: 40%"><span class="column">视频ID</span></td>
              <td>
                <span id="video_id" class="column" style="text-align: center; display: block">{{
                  videoData.video_id
                }}</span>
              </td>
            </tr>
            <tr align="right">
              <td style="width: 40%"><span class="column">主页</span></td>
              <td>
                <a
                  id="userhome"
                  class="column"
                  target="_blank"
                  :href="videoData.userhome"
                  style="text-align: center; display: block"
                  >{{ videoData.nickname }}</a
                >
              </td>
            </tr>
          </table>
        </n-table>
      </div>

      <!-- 页脚-->
      <!-- <footer>
        <span style="text-align: center; display: block; padding: 20px">
          <a
            target="_blank"
            style="color: #9b4dca"
            rel="noreferrer"
            href="https://github.com/Johnserf-Seed/TikTokWeb"
            >GitHub · JohnserfSeed · 2023</a
          >
        </span>
      </footer> -->

      <!-- 回到顶部-->
      <ScrollTop />
    </div>
  </div>
  <n-modal v-model:show="showModal" title="设置Cookie" :closable="true" preset="dialog">
    <div>
      <ul>
        <li>只需填写cookie的value，不需要填写key 😀</li>
        <li>大部分情况下只填写ttwid即可解析 😉</li>
        <li>例如 ttwid的值是1%7CxvIZqo2hPx…………只需要填这部分即可 🥴</li>
        <li>你的所有信息均储存在本地 🚨</li>
      </ul>
    </div>
    <n-form ref="formRef" :rules="rules" :model="cookie">
      <n-form-item label="odin_tt" path="odin_tt">
        <n-input v-model:value="cookie.odin_tt" placeholder="odin_tt的值" />
      </n-form-item>
      <n-form-item label="passport_csrf_token" path="passport_csrf_token">
        <n-input v-model:value="cookie.passport_csrf_token" placeholder="passport_csrf_token的值" />
      </n-form-item>
      <n-form-item label="sessionid_ss" path="sessionid_ss">
        <n-input v-model:value="cookie.sessionid_ss" placeholder="sessionid_ss的值" />
      </n-form-item>
      <n-form-item label="ttwid" path="ttwid">
        <n-input v-model:value="cookie.ttwid" placeholder="ttwid的值" />
      </n-form-item>
      <n-form-item label="msToken" path="msToken">
        <n-input v-model:value="cookie.msToken" placeholder="msToken的值" />
      </n-form-item>
      <n-form-item>
        <n-button class="mr-2" type="primary" @click="saveCookie">保存</n-button>
        <n-button type="default" @click="cleanCookie">清理</n-button>
      </n-form-item>
    </n-form>
  </n-modal>

  <n-modal
    v-model:show="qrcodeModalVisible"
    :on-close="stopTime"
    :title="loginStatus"
    :closable="true"
    preset="dialog"
  >
    <div class="text-center">
      <qrcode-vue :value="qrcodeValue" level="H" :size="300" class="mx-auto" />
    </div>
  </n-modal>
</template>

<script>
import { reactive, ref, onMounted } from 'vue'
import ScrollTop from '../components/ScrollTop.vue'
import { NButton, NInput, NForm, NFormItem, NModal, useMessage, NTable } from 'naive-ui'
import { setCookie, getCookie } from '@renderer/utils/token.js'
import Player from 'xgplayer'
import 'xgplayer/dist/index.min.css'
import save from '../utils/save'
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'
import QrcodeVue from 'qrcode.vue'
import local from '../utils/local.js'

const jsCookie = local.local

export default {
  components: { ScrollTop, NButton, NInput, NForm, NFormItem, NModal, NTable, QrcodeVue },
  setup() {
    let player
    onMounted(() => {
      player = new Player({
        id: 'xgplayer',
        url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/nupenuvpxnuvo/xgplayer_doc/xgplayer-demo.mp4',
        playsinline: true,
        poster:
          'https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/byted-player-videos/1.0.0/poster.jpg',
        plugins: [],
        autoplay: false,
        download: false
      })
    })

    const message = useMessage()
    const qrcodeValue = ref('')
    const qrcodeModalVisible = ref(false)
    /**
     * @description: 获取二维码
     * @return {*}
     */
    async function getQrocde() {
      try {
        qrcodeModalVisible.value = true
        const url = await window.electron.ipcRenderer.invoke('login')
        qrcodeValue.value = url
        onLogin()
      } catch (error) {
        console.log(error)
      }
    }

    let onLoginTimer = null
    let loginStatus = ref('')
    const messageMap = {
      1: { message: '[  登录  ]:等待二维码扫描！\r' },
      2: { message: '[  登录  ]:扫描二维码成功！\r' },
      3: { message: '[  登录  ]:确认二维码登录！\r' },
      4: { message: '[  登录  ]:访问频繁，请检查参数！\r' },
      5: { message: '[  登录  ]:二维码过期，重新获取！\r' }
    }
    /**
     * @description: 监听二维码扫描结果
     * @return {*}
     */
    async function onLogin() {
      try {
        const { status, data } = await window.electron.ipcRenderer.invoke('getLoginStatus')

        console.log(status, data)
        if (status === -1) {
          clearTimeout(onLoginTimer)
          onLoginTimer = null
          message.error('登录失败！当前网络可能被风控')
          return
        }

        if (status !== '3') {
          loginStatus.value = messageMap[status].message
          onLoginTimer = setTimeout(() => {
            onLogin()
          }, 1000)
        } else {
          jsCookie.set('scan_token', data, 604800000)
          qrcodeModalVisible.value = false
          message.success('登录成功')
          clearTimeout(onLoginTimer)
          onLoginTimer = null
        }
      } catch (error) {
        console.log(error)
      }
    }
    /**
     * @description: 停止刷新登录状态
     * @return {*}
     */
    function stopTime() {
      // console.log('onLoginTimer', onLoginTimer)
      clearTimeout(onLoginTimer)
      onLoginTimer = null
    }

    //

    // eslint-disable-next-line no-useless-escape
    const URL_REGEXP =
      // eslint-disable-next-line no-useless-escape
      /((http|https):\/\/([\w-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/gi

    const showModal = ref(false)
    const videoUrl = ref('https://v.douyin.com/NKyY6Ch/')
    const cookie = reactive({
      odin_tt: '',
      passport_csrf_token: '',
      sessionid_ss: '',
      ttwid: '',
      msToken: ''
    })

    const formRef = ref()

    const rules = {
      odin_tt: {
        required: true,
        message: '请输入odin_tt的值',
        trigger: 'blur'
      },
      passport_csrf_token: {
        required: true,
        message: '请输入passport_csrf_token的值',
        trigger: 'blur'
      },
      sessionid_ss: {
        required: true,
        message: '请输入sessionid_ss的值',
        trigger: 'blur'
      },
      ttwid: {
        required: true,
        message: '请输入ttwid的值',
        trigger: 'blur'
      },
      msToken: {
        required: true,
        message: '请输入msToken的值',
        trigger: 'blur'
      }
    }
    const videoData = reactive({
      type: '',
      images: [],
      url: '',
      desc: '',
      unique_id: '',
      video_id: '',
      userhome: '',
      nickname: '',
      m_title: '',
      music: ''
    })

    /**
     * @description: 下载视频文件
     * @return {*}
     */
    function handleSave() {
      Nprogress.start()
      save(videoData.url, `${videoData.desc}.mp4`, (progress) => {
        Nprogress.set(progress)
      })
    }

    /**
     * @description: 下载音频文件
     * @return {*}
     */
    function handleSaveMusic() {
      Nprogress.start()
      save(videoData.music, `${videoData.desc}.mp3`, (progress) => {
        Nprogress.set(progress)
      })
    }

    const analysisLoading = ref(false)
    /**
     * @description: 解析视频
     * @return {*}
     */
    async function parseVideo() {
      if (!validate()) {
        return
      }

      try {
        // 向主进程请求数据
        analysisLoading.value = true
        const id = await window.electron.ipcRenderer.invoke(
          'GetID',
          videoUrl.value.match(URL_REGEXP)[0]
        )

        if (id) {
          GetInfo(id)
        }
      } catch (error) {
        console.log(error)
      } finally {
        analysisLoading.value = false
      }

      async function GetInfo(id) {
        const { status, data } = await window.electron.ipcRenderer.invoke(
          'GetInfo',
          id,
          JSON.stringify(cookie)
        )
        if (status === -1) {
          return message.error('解析失败')
        }
        player.switchURL(data.url)
        Object.assign(videoData, data)
      }

      function validate() {
        const isAvailable = Object.values(cookie).every((item) => item)
        if (!isAvailable) {
          message.error('请设置cookie！')
          return false
        }

        if (!URL_REGEXP.test(videoUrl.value)) {
          message.warning('错误', '请填写正确作品链接', 'error')
          return false
        }

        return true
      }
    }

    const getCookieByLocal = () => {
      const cookieStr = getCookie()
      if (cookieStr) {
        Object.assign(cookie, cookieStr)
      }
    }

    getCookieByLocal()

    const saveCookie = (e) => {
      e.preventDefault()
      console.log(formRef.value)
      try {
        formRef.value?.validate((errors) => {
          if (!errors) {
            showModal.value = false
            console.log(cookie)
            setCookie(cookie)
            message.success('保存成功')
          } else {
            console.log(errors)
          }
        })
      } catch (error) {
        console.log(error)
        message.error('保存失败')
      }
      // 在这里添加保存 Cookie 的逻辑
    }

    const cleanCookie = () => {
      try {
        showModal.value = false
        cookie.value.odin_tt = ''
        cookie.value.passport_csrf_token = ''
        cookie.value.sessionid_ss = ''
        cookie.value.ttwid = ''
        cookie.value.msToken = ''
        message.success('清理成功')
      } catch (error) {
        message.error('清理失败')
      }

      // 在这里添加清理 Cookie 的逻辑
    }

    return {
      showModal,
      videoUrl,
      cookie,
      rules,
      videoData,
      parseVideo,
      setCookie,
      saveCookie,
      cleanCookie,
      formRef,
      analysisLoading,
      handleSave,
      handleSaveMusic,
      getQrocde,
      qrcodeValue,
      qrcodeModalVisible,
      loginStatus,
      stopTime
    }
  }
}
</script>

<style lang="scss" scoped>
// @import '@renderer/assets/css/style.css';
</style>
