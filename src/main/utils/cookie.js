export function generateRandomStr(randomlength = 16) {
  let randomStr = ''
  const baseStr = 'ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789='
  const length = baseStr.length - 1
  for (let i = 0; i < randomlength; i++) {
    randomStr += baseStr[Math.floor(Math.random() * length)]
  }
  return randomStr
}

export function getFp() {
  const e = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const t = e.length
  let milliseconds = Date.now()
  let base36 = ''
  while (milliseconds > 0) {
    const remainder = milliseconds % 36
    if (remainder < 10) {
      base36 = remainder.toString() + base36
    } else {
      base36 = String.fromCharCode('a'.charCodeAt(0) + remainder - 10) + base36
    }
    milliseconds = Math.floor(milliseconds / 36)
  }
  const r = base36
  const o = Array(36).fill('')
  o[8] = o[13] = o[18] = o[23] = '_'
  o[14] = '4'

  for (let i = 0; i < 36; i++) {
    if (!o[i]) {
      let n = 0 || Math.floor(Math.random() * t)
      if (i === 19) {
        n = (3 & n) | 8
      }
      o[i] = e[n]
    }
  }
  const ret = 'verify_' + r + '_' + o.join('')
  return ret
}

export function getSvWebId() {
  const e = Array.from('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
  const t = e.length
  const n = this.base36Encode(Date.now())
  const r = Array(36).fill('')
  r[8] = r[13] = r[18] = r[23] = '_'
  r[14] = '4'

  for (let i = 0; i < 36; i++) {
    if (!r[i]) {
      let o = Math.floor(Math.random() * t)
      r[i] = e[i === 19 ? (3 & o) | 8 : o]
    }
  }
  return 'verify_' + n + '_' + r.join('')
}

export function base36Encode(number) {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
  const base36 = []

  while (number) {
    const [quotient, remainder] = [Math.floor(number / 36), number % 36]
    base36.push(alphabet[remainder])
    number = quotient
  }

  return base36.reverse().join('')
}

export function splitCookies(rawCookies) {
  const cookiesList = rawCookies.filter((cookie) => /[a-zA-Z]/.test(cookie))
  const cookies = cookiesList.map((cookie) => cookie.split(';')[0])
  return cookies.join(';')
}

export function getCookie(cookieHeaders, key) {
  const rege = new RegExp(`${key}=([^;]+)`)
  let ttwid = ''
  for (const cookieHeader of cookieHeaders) {
    const matches = cookieHeader.match(rege)
    if (matches && matches.length > 1) {
      ttwid = matches[1]
      break
    }
  }
  return ttwid
}
