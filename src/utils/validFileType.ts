export default function validFileType(url: string | undefined) {
    if (url?.endsWith('.png')
        || url?.endsWith('.jpg')
        || url?.endsWith('.jpg')
        || url?.endsWith('.jpeg')
        || url?.endsWith('.gif')
    ) return true

    return false
}
