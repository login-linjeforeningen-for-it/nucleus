jest.mock('expo-file-system/legacy', () => ({
    cacheDirectory: 'file:///cache/',
    downloadAsync: jest.fn(async (_url: string, destination: string) => ({
        status: 200,
        uri: destination,
    })),
}))

jest.mock('expo-media-library', () => ({
    requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
    saveToLibraryAsync: jest.fn(async () => undefined),
}))

jest.mock('react-native', () => ({
    Platform: { OS: 'ios' },
}))

import * as FileSystem from 'expo-file-system/legacy'
import * as MediaLibrary from 'expo-media-library'
import { downloadAlbumImages } from '@/utils/albums/downloadImages'

describe('album image downloads', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('downloads selected images directly into the app media flow', async () => {
        const result = await downloadAlbumImages({
            albumId: 42,
            images: ['one.jpg', 'two.png'],
        })

        expect(result).toEqual({ errors: [], failed: [], saved: ['one.jpg', 'two.png'] })
        expect(MediaLibrary.requestPermissionsAsync).toHaveBeenCalledWith(true, ['photo'])
        expect(FileSystem.downloadAsync).toHaveBeenCalledTimes(2)
        expect(FileSystem.downloadAsync).toHaveBeenNthCalledWith(
            1,
            'https://cdn.login.no/albums/42/one.jpg',
            expect.stringMatching(/^file:\/\/\/cache\/\d+-one\.jpg$/)
        )
        expect(MediaLibrary.saveToLibraryAsync).toHaveBeenCalledTimes(2)
    })

    it('downloads all unique images without opening the CDN URL', async () => {
        const result = await downloadAlbumImages({
            albumId: 7,
            images: ['a.jpg', 'b.jpg', 'a.jpg'],
        })

        expect(result.saved).toEqual(['a.jpg', 'b.jpg'])
        expect(result.failed).toEqual([])
        expect(FileSystem.downloadAsync).toHaveBeenCalledTimes(2)
        expect(MediaLibrary.saveToLibraryAsync).toHaveBeenCalledTimes(2)
    })
})
