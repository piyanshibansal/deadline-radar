(function (root) {
    function isValidDateString(dateString) {
        if (typeof dateString !== "string") {
            return false;
        }

        const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);

        if (!match) {
            return false;
        }

        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);

        const date = new Date(year, month - 1, day);

        return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        );
    }

    function isTodayOrFuture(dateString, now = new Date()) {
        if (!isValidDateString(dateString)) {
            return false;
        }

        const selectedDate = new Date(`${dateString}T00:00:00`);

        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        return selectedDate >= today;
    }

    function isDuplicateDeadline(
        deadlines,
        title,
        date,
        editingId = null
    ) {
        return deadlines.some(function (deadline) {
            return (
                deadline.title.trim().toLowerCase() ===
                    title.trim().toLowerCase() &&
                deadline.date === date &&
                deadline.id !== editingId
            );
        });
    }

    function escapeCalendarText(text) {
        return text
            .replace(/\\/g, "\\\\")
            .replace(/\r?\n/g, "\\n")
            .replace(/,/g, "\\,")
            .replace(/;/g, "\\;");
    }

    const utils = {
        isValidDateString,
        isTodayOrFuture,
        isDuplicateDeadline,
        escapeCalendarText
    };

    root.DeadlineUtils = utils;

    if (typeof module !== "undefined" && module.exports) {
        module.exports = utils;
    }
})(globalThis);