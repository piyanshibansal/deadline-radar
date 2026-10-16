import { describe, it, expect } from "vitest";

const {
    isValidDateString,
    isTodayOrFuture,
    isDuplicateDeadline,
    escapeCalendarText
} = require("./deadline-utils.js");

describe("isValidDateString", () => {
    it("accepts a valid date", () => {
        expect(isValidDateString("2026-10-14")).toBe(true);
    });

    it("rejects an impossible date", () => {
        expect(isValidDateString("2026-02-30")).toBe(false);
    });

    it("rejects an incorrectly formatted date", () => {
        expect(isValidDateString("14-10-2026")).toBe(false);
    });

    it("rejects an empty date", () => {
        expect(isValidDateString("")).toBe(false);
    });
});

describe("isTodayOrFuture", () => {
    const today = new Date(2026, 9, 14, 12, 0, 0);

    it("accepts today's date", () => {
        expect(isTodayOrFuture("2026-10-14", today)).toBe(true);
    });

    it("accepts a future date", () => {
        expect(isTodayOrFuture("2026-10-15", today)).toBe(true);
    });

    it("rejects a past date", () => {
        expect(isTodayOrFuture("2026-10-13", today)).toBe(false);
    });

    it("rejects an invalid date", () => {
        expect(isTodayOrFuture("2026-02-30", today)).toBe(false);
    });
});

describe("isDuplicateDeadline", () => {
    const deadlines = [
        {
            id: "1",
            title: "Digital Electronics",
            date: "2026-10-20"
        }
    ];

    it("detects a duplicate title and date", () => {
        expect(
            isDuplicateDeadline(
                deadlines,
                "Digital Electronics",
                "2026-10-20"
            )
        ).toBe(true);
    });

    it("ignores differences in title capitalization", () => {
        expect(
            isDuplicateDeadline(
                deadlines,
                "DIGITAL ELECTRONICS",
                "2026-10-20"
            )
        ).toBe(true);
    });

    it("allows the same title on a different date", () => {
        expect(
            isDuplicateDeadline(
                deadlines,
                "Digital Electronics",
                "2026-10-21"
            )
        ).toBe(false);
    });

    it("does not treat the deadline being edited as a duplicate", () => {
        expect(
            isDuplicateDeadline(
                deadlines,
                "Digital Electronics",
                "2026-10-20",
                "1"
            )
        ).toBe(false);
    });
});

describe("escapeCalendarText", () => {
    it("escapes commas", () => {
        expect(escapeCalendarText("Assignment, Lab")).toBe(
            "Assignment\\, Lab"
        );
    });

    it("escapes semicolons", () => {
        expect(escapeCalendarText("Lab; Report")).toBe(
            "Lab\\; Report"
        );
    });

    it("escapes backslashes", () => {
        expect(escapeCalendarText("Folder\\Task")).toBe(
            "Folder\\\\Task"
        );
    });

    it("escapes newlines", () => {
        expect(escapeCalendarText("Assignment\nReport")).toBe(
            "Assignment\\nReport"
        );
    });
});