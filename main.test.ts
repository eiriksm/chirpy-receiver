import { main } from "./test"

test("main", async () => {
    const result = await main()
    expect(result).toStrictEqual(["test\n"])
})
