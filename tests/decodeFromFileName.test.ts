import {
  getRawStringBlocksFromFileName,
  getStringFromFileName,
} from "../src/decodeFromFileName";

describe("main", () => {
  test("Should return the expected string blocks", async () => {
    const file = "tests/assets/1.wav";
    const result = await getRawStringBlocksFromFileName(file, 32);
    expect(result).toStrictEqual(["test\n"]);
  });
  test("Should return the expected string", async () => {
    const file = "tests/assets/1.wav";
    const result = await getStringFromFileName(file, 32);
    expect(result).toStrictEqual("test");
  });
  test("Should return the expected string from test 2", async () => {
    const file = "tests/assets/2.wav";
    const result = await getStringFromFileName(file, 32);
    expect(result).toStrictEqual("🚀️");
  });
});
