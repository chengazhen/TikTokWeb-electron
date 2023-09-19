import Store from 'electron-store'
const store = new Store()
console.log(store.path)
const KEY = 'cookie'
export function getCookie() {
  return store.get(KEY)
}

export function setCookie(cookie) {
  return store.set(KEY, cookie)
}
