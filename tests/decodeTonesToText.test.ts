const tonesTest1 = [
    8, 0, 8, 0, 3, 5, 0, 6,
    2, 5, 6, 3, 3, 5, 0, 0,
    5, 0, 8, 4, 6, 6, 8, 8,
    8
]

const tonesTest2 = [
    8, 0, 8, 0, 7, 4, 1, 1, 7,
    6, 3, 2, 4, 0, 1, 6, 7, 6,
    7, 0, 4, 3, 6, 0, 5, 0, 8,
    5, 7, 6, 8, 8, 8
]

const tonesTest3 = "8 0 8 0 3 5 0 6 2 5 6 3 3 5 0 6 4 5 5 6 3 1 6 2 0 1 6 4 3 1 2 7 1 5 6 4 1 0 0 3 0 4 4 0 8 7 1 0 8 1 4 4 2 0 0 6 1 1 0 0 3 1 0 1 2 8 7 2 4 8 8 8".split(" ").map(Number)
const tonesTest4 = "8 0 8 0 3 0 2 6 1 0 1 2 8 5 6 6 8 8 8".split(" ").map(Number)
// For some reason that also decodes to "ab" in the test.
const tonesTest5 = "8 0 8 0 3 0 2 6 1 0 1 2 2 8 5 6 6 8 8 8".split(" ").map(Number)

import { decodeTones } from "../src/decodeFromChunks"


describe("main", () => {
    test('Should return the expected string from test 1', async () => {
        const text = decodeTones(tonesTest1).trim()
        expect(text).toStrictEqual('test')
    })
    test('Should return the expected string from test 2', async () => {
        const text = decodeTones(tonesTest2).trim()
        expect(text).toStrictEqual('🚀️')
    })
    test('Should return the expected string from test 3', async () => {
        const text = decodeTones(tonesTest3).trim()
        expect(text).toStrictEqual('testing test 1 2 1 2')
    })
    test('Should return the expected string from test 4', async () => {
        const text = decodeTones(tonesTest4).trim()
        expect(text).toStrictEqual('ab')
    })
    test('Should return the expected string from test 5', async () => {
        const text = decodeTones(tonesTest5).trim()
        expect(text).toStrictEqual('ab')
    })
})
