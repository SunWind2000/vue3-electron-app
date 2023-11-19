export const generateId = () => Math.floor(Math.random() * 10000)

/**
 * @description 取字符串哈希值
 * @param str 任一字符串
 * @returns {number} 该字符串的哈希值
 */
export const hash = (str: string) => {
  let hash = 0
  if (str.length === 0) return hash
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash
}

export const isValidKey = (key: string | number | symbol, object: object): key is keyof typeof object => {
  return key in object
}

function padLeftZero (str: string) {
  return ('00' + str).substring(str.length)
}
function dateTimeFormatter (date: Date, fmt: string): string {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substring(4 - RegExp.$1.length))
  }
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      const str = isValidKey(k, o) ? o[k] + '' : ''
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
    }
  }
  return fmt
}

export const logger = (title: string, info: string, type = 'info') => {
  const isDevelopment = process.env.NODE_ENV !== 'production'
  if (!isDevelopment) return
  console.log(`[${title}][${dateTimeFormatter(new Date(), 'yyyy-MM-dd hh:mm:ss')}][${type}]${info}`)
}