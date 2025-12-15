type PhotoObject = {
    photo_id: number
    photoURL: string
}

export const normalizePhoto = (photo?: PhotoObject | string | null): string => {
    if (!photo) return ''

    // Если это объект с photoURL
    if (typeof photo === 'object' && photo !== null && 'photoURL' in photo) {
        const url = photo.photoURL
        if (!url) return ''
        return url.startsWith('http') ? url : `http://185.146.3.132:8080${url}`
    }

    // Если это строка
    if (typeof photo === 'string') {
        return photo.startsWith('http') ? photo : `http://185.146.3.132:8080${photo}`
    }

    return ''
}
