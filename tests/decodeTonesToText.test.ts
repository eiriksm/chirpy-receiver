const tonesTest2 = [
    8, 0, 8, 0, 7, 4, 1, 1, 7,
    6, 3, 2, 4, 0, 1, 6, 7, 6,
    7, 0, 4, 3, 6, 0, 5, 0, 8,
    5, 7, 6, 8, 8, 8
]

import { decodeTones } from "../src/decodeFromChunks"


describe("main", () => {
    test('Should return the expected string from test 2', async () => {
        const text = decodeTones(tonesTest2).trim()
        expect(text).toStrictEqual('🚀️')
    })
})
