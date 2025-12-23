type PhotoObject = {
    photo_id: number
    photoURL: string
}

export const normalizePhoto = (photo?: PhotoObject | string | null): string => {
    if (!photo) return ''

    let path = ''

    // Если это объект с photoURL
    if (typeof photo === 'object' && photo !== null && 'photoURL' in photo) {
        path = photo.photoURL || ''
    } else if (typeof photo === 'string') {
        path = photo
    }

    if (!path) return ''

    if (path.startsWith('http')) return path

    // Очищаем путь: оставляем только то, что начинается с /uploads
    const idx = path.indexOf("/uploads");
    if (idx !== -1) {
        return `http://185.146.3.132:8080${path.slice(idx)}`;
    }

    return `http://185.146.3.132:8080${path.startsWith('/') ? path : '/' + path}`;
}
