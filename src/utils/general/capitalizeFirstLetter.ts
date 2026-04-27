/**
 * Capitalizes the first letter of the word, and converts the rest of the word
 * to lowercase. For example "StAVangEr" becomes "Stavanger"
 * @param word
 * @returns
 */
export default function capitalizeFirstLetter(word: string | undefined): string {
    return word ? `${word?.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}` : ''
}
