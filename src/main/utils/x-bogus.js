class XBogus {
  constructor() {
    this.Array = [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      10,
      11,
      12,
      13,
      14,
      15
    ]
    this.character = 'Dkdpgh4ZKsQB80/Mfvw36XI1R25-WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe='
  }

  md5StrToArray(md5Str) {
    if (typeof md5Str === 'string' && md5Str.length > 32) {
      return [...md5Str].map((char) => char.charCodeAt(0))
    } else {
      const array = []
      let idx = 0
      while (idx < md5Str.length) {
        const num =
          (this.Array[md5Str.charCodeAt(idx)] << 4) | this.Array[md5Str.charCodeAt(idx + 1)]
        array.push(num)
        idx += 2
      }
      return array
    }
  }

  md5Encrypt(urlPath) {
    const hashedUrlPath = this.md5StrToArray(this.md5(this.md5StrToArray(this.md5(urlPath))))
    return hashedUrlPath
  }

  md5(inputData) {
    let array
    if (typeof inputData === 'string') {
      array = this.md5StrToArray(inputData)
    } else if (Array.isArray(inputData)) {
      array = inputData
    } else {
      throw new Error('Invalid input type. Expected string or array.')
    }

    const md5Hash = new TextEncoder().encode(array)
    return this.bytesToHex(md5Hash)
  }

  bytesToHex(byteArray) {
    return Array.prototype.map
      .call(byteArray, (byte) => {
        return ('0' + (byte & 0xff).toString(16)).slice(-2)
      })
      .join('')
  }

  encodingConversion(a, b, c, e, d, t, f, r, n, o, i, _, x, u, s, l, v, h, p) {
    const y = [a, i, b, _, c, x, e, u, d, s, t, l, f, v, r, h, n, p, o]
    const re = new TextDecoder('ISO-8859-1').decode(new Uint8Array(y))
    return re
  }

  encodingConversion2(a, b, c) {
    return String.fromCharCode(a, b) + c
  }

  rc4Encrypt(key, data) {
    let S = [...Array(256).keys()]
    let j = 0
    const encryptedData = new Uint8Array(data.length)

    // Initialize the S box
    for (let i = 0; i < 256; i++) {
      j = (j + S[i] + key[i % key.length]) % 256
      ;[S[i], S[j]] = [S[j], S[i]]
    }

    let i = 0
    j = 0
    for (let idx = 0; idx < data.length; idx++) {
      i = (i + 1) % 256
      j = (j + S[i]) % 256
      ;[S[i], S[j]] = [S[j], S[i]]
      const byte = data[idx] ^ S[(S[i] + S[j]) % 256]
      encryptedData[idx] = byte
    }

    return encryptedData
  }

  calculation(a1, a2, a3) {
    const x1 = (a1 & 255) << 16
    const x2 = (a2 & 255) << 8
    const x3 = x1 | x2 | a3
    return (
      this.character[(x3 & 16515072) >> 18] +
      this.character[(x3 & 258048) >> 12] +
      this.character[(x3 & 4032) >> 6] +
      this.character[x3 & 63]
    )
  }

  getXBogus(urlPath) {
    const array1 = this.md5StrToArray('d88201c9344707acde7261b158656c0e')
    const array2 = this.md5StrToArray(
      this.md5(this.md5StrToArray('d41d8cd98f00b204e9800998ecf8427e'))
    )
    const urlPathArray = this.md5Encrypt(urlPath)

    const timer = Math.floor(Date.now() / 1000)
    const ct = 536919696
    const array3 = []
    const array4 = []
    let xb = ''

    const newArray = [
      64,
      0.00390625,
      1,
      8,
      urlPathArray[14],
      urlPathArray[15],
      array2[14],
      array2[15],
      array1[14],
      array1[15],
      (timer >> 24) & 255,
      (timer >> 16) & 255,
      (timer >> 8) & 255,
      timer & 255,
      (ct >> 24) & 255,
      (ct >> 16) & 255,
      (ct >> 8) & 255,
      ct & 255
    ]

    let xorResult = newArray[0]
    for (let i = 1; i < newArray.length; i++) {
      xorResult ^= newArray[i]
    }

    newArray.push(xorResult)

    let idx = 0
    while (idx < newArray.length) {
      array3.push(newArray[idx])
      if (newArray[idx + 1] !== undefined) {
        array4.push(newArray[idx + 1])
      }
      idx += 2
    }

    const mergeArray = array3.concat(array4)

    const garbledCode = this.encodingConversion2(
      2,
      255,
      this.rc4Encrypt(
        new TextEncoder().encode('ÿ'),
        new TextEncoder().encode(this.encodingConversion(...mergeArray))
      ).toString()
    )

    idx = 0
    while (idx < garbledCode.length) {
      xb += this.calculation(
        garbledCode.charCodeAt(idx),
        garbledCode.charCodeAt(idx + 1),
        garbledCode.charCodeAt(idx + 2)
      )
      idx += 3
    }

    this.params = `${urlPath}&X-Bogus=${xb}`
    this.xb = xb
    return [this.params, this.xb]
  }
}

export default new XBogus()
