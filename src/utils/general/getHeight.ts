export default function getHeight(length: number) {
    return length > 9 ? 100 : length > 6 ? 90 : length > 3 ? 60 : 30
}
