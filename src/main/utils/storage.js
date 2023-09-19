import storage from 'electron-json-storage'

const KEY = 'cookie'
export function getCookie() {
  return storage.get(KEY)
}

export function setCookie(cookie) {
  return storage.set(KEY, cookie)
}
