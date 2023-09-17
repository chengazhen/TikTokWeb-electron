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
            <NButton type="success" class="mr-1" @click="parseVideo"> 解析 </NButton>
            <NButton type="warning" @click="showModal = true"> 设置Cookie </NButton>
          </div>
        </div>

        <!-- cookie配置-->
      </div>

      <!-- 作品详细-->
      <div id="video_info" style="display: none">
        <div class="card">
          <div class="card-body">
            <table style="overflow: auto">
              <tr align="center">
                <td>
                  <div class="video_play">
                    <video
                      id="play"
                      autoplay
                      width="50%"
                      controls="controls"
                      preload="auto"
                      type="video/mp4"
                      webkit-playsinline="true"
                      playsinline=""
                      x5-video-player-type="h5"
                      x5-video-player-fullscreen="portraint"
                    >
                      <source :src="videoData.url" type="video/mp4" />
                    </video>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="row">
                    <table align="center" style="width: 60%">
                      <tr align="right">
                        <td style="width: 40%"><span class="column">类型</span></td>
                        <td>
                          <span
                            id="type"
                            class="column"
                            style="text-align: center; display: block"
                            >{{ videoData.type }}</span
                          >
                        </td>
                      </tr>
                      <tr align="right">
                        <td style="width: 40%"><span class="column">文案</span></td>
                        <td>
                          <span
                            id="desc"
                            class="column"
                            style="text-align: center; display: block"
                            >{{ videoData.desc }}</span
                          >
                        </td>
                      </tr>
                      <tr align="right">
                        <td style="width: 40%"><span class="column">抖音ID</span></td>
                        <td>
                          <span
                            id="unique_id"
                            class="column"
                            style="text-align: center; display: block"
                            >{{ videoData.unique_id }}</span
                          >
                        </td>
                      </tr>
                      <tr align="right">
                        <td style="width: 40%"><span class="column">视频ID</span></td>
                        <td>
                          <span
                            id="video_id"
                            class="column"
                            style="text-align: center; display: block"
                            >{{ videoData.video_id }}</span
                          >
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
                  </div>
                </td>
              </tr>
              <tr align="center">
                <td align="center">
                  <a
                    id="downloadVIDEO"
                    class="button"
                    role="button"
                    href="#"
                    :download="videoData.desc + '.mp4'"
                    rel="noreferrer"
                    >下载视频</a
                  >
                  <a
                    id="downloadMUSIC"
                    class="button"
                    role="button"
                    href="#"
                    :download="videoData.m_title + '.mp3'"
                    rel="noreferrer"
                  >
                    {{ videoData.music === '' ? '该原声不可用' : '下载原声' }}
                  </a>
                </td>
              </tr>
            </table>
          </div>
        </div>
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
</template>

<script>
import { reactive, ref } from 'vue'
import ScrollTop from '../components/ScrollTop.vue'
import { NButton, NInput, NForm, NFormItem, NModal, useMessage } from 'naive-ui'
import { setCookie, getCookie } from '@renderer/utils/token.js'

export default {
  components: { ScrollTop, NButton, NInput, NForm, NFormItem, NModal },
  setup() {
    const message = useMessage()

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
    const videoData = {
      type: ref(''),
      images: [],
      url: '',
      desc: '',
      unique_id: '',
      video_id: '',
      userhome: '',
      nickname: '',
      m_title: '',
      music: ''
    }

    const parseVideo = async () => {
      if (!validate()) {
        return
      }

      try {
        // 向主进程请求数据
        const id = await window.electron.ipcRenderer.invoke('fetch-data', videoUrl.value)
        console.log(id, 'id')
      } catch (error) {
        console.log(error)
      }

      function validate() {
        const isAvailable = Object.values(cookie).every((item) => item)
        if (!isAvailable) {
          message.error('请设置cookie！')
          return false
        }

        // eslint-disable-next-line no-useless-escape
        const URL_REGEXP =
          // eslint-disable-next-line no-useless-escape
          /((http|https):\/\/([\w-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/gi

        if (!URL_REGEXP.test(videoUrl.value)) {
          message.warning('错误', '请填写正确作品链接', 'error')
          return false
        }

        return true
      }
      // 在这里添加解析视频的逻辑
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
      formRef
    }
  }
}
</script>

<style lang="scss" scoped>
// @import '@renderer/assets/css/style.css';
</style>
