import { describe, expect, it } from "vitest";
import { buildQueryString, cleanObject, getPositiveInt } from "./utils";

describe("cleanObject", () => {
  it("removes empty and undefined string values", () => {
    expect(
      cleanObject({
        name: "Ada",
        empty: "",
        skipped: "undefined"
      })
    ).toEqual({
      name: "Ada"
    });
  });
});

describe("buildQueryString", () => {
  it("serializes only valid query fields", () => {
    expect(
      buildQueryString({
        q: "young males from nigeria",
        page: "1",
        empty: ""
      })
    ).toBe("q=young+males+from+nigeria&page=1");
  });
});

describe("getPositiveInt", () => {
  it("returns the parsed integer when valid", () => {
    expect(getPositiveInt("12", 5)).toBe(12);
  });

  it("falls back when the value is invalid", () => {
    expect(getPositiveInt("-1", 5)).toBe(5);
    expect(getPositiveInt(null, 5)).toBe(5);
    expect(getPositiveInt("abc", 5)).toBe(5);
  });
});
