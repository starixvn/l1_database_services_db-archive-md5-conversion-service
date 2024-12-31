import { describe, expect, it } from "vitest";
import { dotNotation, filterStringValue, isEmpty } from "./converter-utils.js";

describe("Converter helpers", () => {
    describe("[function filterStringValue]", () => {
        it("Return filter type string", () => {
            expect(filterStringValue("test")).toStrictEqual({ test: { $type: "string" } });
        });
    });

    describe("[function isEmpty]", () => {
        it("Empty object return true", () => {
            const testCases: { input: unknown; expected: boolean }[] = [
                { input: {}, expected: true }, //
                { input: [], expected: true },
            ];

            for (const { input, expected } of testCases) {
                expect(isEmpty(input)).toBe(expected);
            }
        });

        it("Otherwise return false", () => {
            const testCases: { input: unknown; expected: boolean }[] = [
                { input: 1, expected: false },
                { input: "a", expected: false },
                { input: null, expected: false },
                { input: { a: 1 }, expected: false },
                { input: { a: 1, b: 2 }, expected: false },
            ];

            for (const { input, expected } of testCases) {
                expect(isEmpty(input)).toBe(expected);
            }
        });
    });

    describe("[function dotNotation]", () => {
        const obj = { a: 1, b: "2", c: { d: 3, e: "4", f: { g: 5, h: false }, i: null, j: undefined }, k: null, l: undefined };

        it("Normal field", () => {
            expect(dotNotation(obj, "a")).toStrictEqual(obj.a);
            expect(dotNotation(obj, "b")).toStrictEqual(obj.b);
            expect(dotNotation(obj, "c")).toStrictEqual(obj.c);
            expect(dotNotation(obj, "d")).toStrictEqual(null);
            expect(dotNotation(obj, "k")).toStrictEqual(null);
            expect(dotNotation(obj, "l")).toStrictEqual(null);
        });

        it("Dot field", () => {
            expect(dotNotation(obj, "a.b")).toStrictEqual(null);
            expect(dotNotation(obj, "b.1")).toStrictEqual(null);
            expect(dotNotation(obj, "c.d")).toStrictEqual(obj.c.d);
            expect(dotNotation(obj, "c.e")).toStrictEqual(obj.c.e);
            expect(dotNotation(obj, "c.f")).toStrictEqual(obj.c.f);
            expect(dotNotation(obj, "c.g")).toStrictEqual(null);
            expect(dotNotation(obj, "c.f.g")).toStrictEqual(obj.c.f.g);
            expect(dotNotation(obj, "c.f.h")).toStrictEqual(obj.c.f.h);
            expect(dotNotation(obj, "c.f.1")).toStrictEqual(null);
            expect(dotNotation(obj, "c.i")).toStrictEqual(null);
            expect(dotNotation(obj, "c.j")).toStrictEqual(null);
            expect(dotNotation(obj, "c.i.1")).toStrictEqual(null);
            expect(dotNotation(obj, "k.i")).toStrictEqual(null);
        });
    });
});
