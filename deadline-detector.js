(function (root) {
    const months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];

    function detectDeadline(text) {
        if (typeof text !== "string" || !text.trim()) {
            return null;
        }

        const datePatterns = [
            {
                regex: /\b\d{4}-\d{2}-\d{2}\b/,
                getDate: match => match[0]
            },
            {
                regex: /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/i,
                getDate: match => {
                    const month = months.findIndex(
                        name => name.toLowerCase() === match[2].toLowerCase()
                    ) + 1;

                    return `${match[3]}-${String(month).padStart(2, "0")}-${String(match[1]).padStart(2, "0")}`;
                }
            },
            {
                regex: /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\b/i,
                getDate: match => {
                    const month = months.findIndex(
                        name => name.toLowerCase() === match[1].toLowerCase()
                    ) + 1;

                    return `${match[3]}-${String(month).padStart(2, "0")}-${String(match[2]).padStart(2, "0")}`;
                }
            }
        ];

        for (const pattern of datePatterns) {
            const match = text.match(pattern.regex);

            if (!match) continue;

            const date = pattern.getDate(match);

            if (!root.DeadlineUtils.isValidDateString(date)) {
                continue;
            }

            const title = text
                .replace(match[0], " ")
                .replace(/\b(must be submitted by|due on|due by|deadline is|deadline:)\b/gi, " ")
                .replace(/\s+/g, " ")
                .replace(/^[\s.,:;-]+|[\s.,:;-]+$/g, "")
                .trim();

            return {
                title: title || "New deadline",
                date: date
            };
        }

        return null;
    }

    const detector = { detectDeadline };

    root.DeadlineDetector = detector;

    if (typeof module !== "undefined" && module.exports) {
        module.exports = detector;
    }
})(globalThis);