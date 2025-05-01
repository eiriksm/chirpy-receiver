import { getRawStringBlocksFromFileName, getStringFromFileName } from "./src/decodeFromFileName"

describe("main", () => {
    test('Should return the expected string blocks', async () => {
        const file = 'tests/assets/1.wav'
        const result = await getRawStringBlocksFromFileName(file)
        expect(result).toStrictEqual(["test\n"])
    })
    test('Should return the expected string', async () => {
        const file = 'tests/assets/1.wav'
        const result = await getStringFromFileName(file)
        expect(result).toStrictEqual("test")
    })
})
