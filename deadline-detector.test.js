import { describe, it, expect, beforeEach } from "vitest";

const DeadlineUtils = require("./deadline-utils.js");
const { detectDeadline } = require("./deadline-detector.js");

describe("Deadline Detector", () => {
    beforeEach(() => {
        globalThis.DeadlineUtils = DeadlineUtils;
    });

    it("detects a date in YYYY-MM-DD format", () => {
        expect(
            detectDeadline("Submit assignment by 2027-10-25")
        ).toEqual({
            title: "Submit assignment by",
            date: "2027-10-25"
        });
    });

    it("detects a date in day month year format", () => {
        expect(
            detectDeadline("Digital Electronics assignment 25 October 2027")
        ).toEqual({
            title: "Digital Electronics assignment",
            date: "2027-10-25"
        });
    });

    it("detects a date in month day year format", () => {
        expect(
            detectDeadline("Project submission October 25, 2027")
        ).toEqual({
            title: "Project submission",
            date: "2027-10-25"
        });
    });

    it("handles lowercase month names", () => {
        expect(
            detectDeadline("Assignment due 25 october 2027")
        ).toEqual({
            title: "Assignment due",
            date: "2027-10-25"
        });
    });

    it("returns null when no date is present", () => {
        expect(
            detectDeadline("Complete your assignment soon")
        ).toBeNull();
    });

    it("rejects an impossible calendar date", () => {
        expect(
            detectDeadline("Assignment due 2027-02-30")
        ).toBeNull();
    });

    it("returns null for empty input", () => {
        expect(detectDeadline("")).toBeNull();
    });

    it("returns null for whitespace-only input", () => {
        expect(detectDeadline("   ")).toBeNull();
    });

    it("uses New deadline when the selected text contains only a date", () => {
        expect(
            detectDeadline("2027-10-25")
        ).toEqual({
            title: "New deadline",
            date: "2027-10-25"
        });
    });

    it("removes common deadline wording from the suggested title", () => {
        expect(
            detectDeadline("Assignment must be submitted by 25 October 2027")
        ).toEqual({
            title: "Assignment",
            date: "2027-10-25"
        });
    });
});