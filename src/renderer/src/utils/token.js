// import jsCookie from 'js-cookie'
import local from './local.js'
const jsCookie = local.local
const KEY = 'dycookie'

export function setCookie(token) {
  jsCookie.set(KEY, JSON.stringify(token), 604800000)
}

export function getCookie() {
  return JSON.parse(jsCookie.get(KEY) || 'null')
}

export function clearCookie() {
  jsCookie.remove()
}
