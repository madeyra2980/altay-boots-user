export const normalizePhoto = (url?: string) => {
    if (!url) return ''
    return url.startsWith('http') ? url : `http://185.146.3.132:8080${url}`
}
