import jsCookie from 'js-cookie'
const KEY = 'dycookie'

export function setCookie(token) {
  jsCookie.set(KEY, JSON.stringify(token), { expires: 7 })
}

export function getCookie() {
  return JSON.parse(jsCookie.get(KEY) || 'null')
}

export function clearCookie() {
  jsCookie.remove()
}
