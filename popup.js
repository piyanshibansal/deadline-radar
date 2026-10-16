const form = document.querySelector("#deadline-form");
const message = document.querySelector("#message");
const deadlineList = document.querySelector("#deadline-list");
const exportButton = document.querySelector("#export-button");

const detectionSection = document.querySelector("#detection-section");
const selectedTextElement = document.querySelector("#selected-text");
const detectedTitleInput = document.querySelector("#detected-title");
const detectedDateInput = document.querySelector("#detected-date");
const saveDetectedButton = document.querySelector("#save-detected-button");
const dismissDetectionButton = document.querySelector("#dismiss-detection-button");

let deadlines = [];
let editingId = null;

// ---------------------------------------------
// Show detected webpage text in the popup
// ---------------------------------------------

async function loadDetectedText() {
    const result = await chrome.storage.local.get("detectedDeadlineText");
    const selectedText = result.detectedDeadlineText;

    if (!selectedText) {
        detectionSection.hidden = true;
        return;
    }

    detectionSection.hidden = false;
    selectedTextElement.textContent = selectedText;

    // Use our separate deadline detector module.
    const detected = DeadlineDetector.detectDeadline(selectedText);

    if (detected) {
        detectedTitleInput.value = detected.title;
        detectedDateInput.value = detected.date;

        message.textContent =
            "Possible deadline detected. Review the details before saving.";
    } else {
        detectedTitleInput.value = "";
        detectedDateInput.value = "";

        message.textContent =
            "No supported date found. Enter the title and date manually.";
    }
}

// ---------------------------------------------
// Save a detected deadline
// ---------------------------------------------

saveDetectedButton.addEventListener("click", async function () {
    const title = detectedTitleInput.value.trim();
    const date = detectedDateInput.value;

    if (!title || !date) {
        message.textContent = "Please enter a title and due date.";
        return;
    }

    if (!DeadlineUtils.isValidDateString(date)) {
        message.textContent = "Please enter a valid date.";
        return;
    }

    if (!DeadlineUtils.isTodayOrFuture(date)) {
        message.textContent = "Due date cannot be in the past!";
        return;
    }

    const duplicate = DeadlineUtils.isDuplicateDeadline(
        deadlines,
        title,
        date
    );

    if (duplicate) {
        message.textContent = "This deadline already exists!";
        return;
    }

    deadlines.push({
        id: crypto.randomUUID(),
        title,
        date
    });

    await saveDeadlines();

    detectionSection.hidden = true;
    await chrome.storage.local.remove("detectedDeadlineText");

    displayDeadlines();
    message.textContent = "Detected deadline saved successfully!";
});

// ---------------------------------------------
// Dismiss a detected deadline
// ---------------------------------------------

dismissDetectionButton.addEventListener("click", async function () {
    detectionSection.hidden = true;

    await chrome.storage.local.remove("detectedDeadlineText");

    message.textContent = "Detected deadline dismissed.";
});

// ---------------------------------------------
// Add or edit deadlines using the regular form
// ---------------------------------------------

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.querySelector("#title").value.trim();
    const date = document.querySelector("#date").value;

    if (!title || !date) {
        message.textContent = "Please enter a title and due date.";
        return;
    }

    if (!DeadlineUtils.isValidDateString(date)) {
        message.textContent = "Please enter a valid date.";
        return;
    }

    if (!DeadlineUtils.isTodayOrFuture(date)) {
        message.textContent = "Due date cannot be in the past!";
        return;
    }

    const duplicate = DeadlineUtils.isDuplicateDeadline(
        deadlines,
        title,
        date,
        editingId
    );

    if (duplicate) {
        message.textContent = "This deadline already exists!";
        return;
    }

    if (editingId !== null) {
        deadlines = deadlines.map(function (deadline) {
            return deadline.id === editingId
                ? { ...deadline, title, date }
                : deadline;
        });
    } else {
        deadlines.push({
            id: crypto.randomUUID(),
            title,
            date
        });
    }

    await saveDeadlines();

    editingId = null;
    form.reset();

    displayDeadlines();
    message.textContent = "Deadline saved successfully!";
});

// ---------------------------------------------
// Save deadlines and synchronize reminders
// ---------------------------------------------

async function saveDeadlines() {
    await chrome.storage.local.set({ deadlines });

    try {
        const response = await chrome.runtime.sendMessage({
            action: "syncReminders"
        });

        if (!response || !response.success) {
            console.error(
                "Could not synchronize reminders:",
                response?.error
            );
        }
    } catch (error) {
        console.error("Reminder synchronization failed:", error);
    }
}

// ---------------------------------------------
// Display deadlines
// ---------------------------------------------

function displayDeadlines() {
    deadlineList.replaceChildren();

    deadlines.sort((a, b) => a.date.localeCompare(b.date));

    deadlines.forEach(function (deadline) {
        const item = document.createElement("div");
        const details = document.createElement("p");

        details.textContent = deadline.title + " — " + deadline.date;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.type = "button";

        editButton.addEventListener("click", function () {
            document.querySelector("#title").value = deadline.title;
            document.querySelector("#date").value = deadline.date;

            editingId = deadline.id;

            message.textContent =
                "Edit your deadline and click Save Changes.";

            form.querySelector('button[type="submit"]').textContent =
                "Save Changes";
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", async function () {
            deadlines = deadlines.filter(function (savedDeadline) {
                return savedDeadline.id !== deadline.id;
            });

            await chrome.alarms.clear("deadline-" + deadline.id);
            await chrome.notifications.clear("reminder-" + deadline.id);
            await saveDeadlines();

            if (editingId === deadline.id) {
                editingId = null;
                form.reset();
            }

            displayDeadlines();
            message.textContent = "Deadline deleted.";
        });

        item.append(details, editButton, deleteButton);
        deadlineList.appendChild(item);
    });

    form.querySelector('button[type="submit"]').textContent =
        editingId === null ? "Add Deadline" : "Save Changes";
}

// ---------------------------------------------
// Export deadlines to a calendar file
// ---------------------------------------------

function exportToCalendar() {
    if (deadlines.length === 0) {
        message.textContent = "Add a deadline before exporting.";
        return;
    }

    const events = deadlines.map(function (deadline) {
        const nextDay = new Date(deadline.date + "T12:00:00");
        nextDay.setDate(nextDay.getDate() + 1);

        const endDate =
            nextDay.getFullYear().toString().padStart(4, "0") +
            (nextDay.getMonth() + 1).toString().padStart(2, "0") +
            nextDay.getDate().toString().padStart(2, "0");

        const startDate = deadline.date.replace(/-/g, "");

        const timestamp = new Date()
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d{3}/, "");

        return [
            "BEGIN:VEVENT",
            "UID:" + deadline.id + "@deadlineradar",
            "DTSTAMP:" + timestamp,
            "DTSTART;VALUE=DATE:" + startDate,
            "DTEND;VALUE=DATE:" + endDate,
            "SUMMARY:" + DeadlineUtils.escapeCalendarText(deadline.title),
            "END:VEVENT"
        ].join("\r\n");
    });

    const calendarContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Deadline Radar//EN",
        "CALSCALE:GREGORIAN",
        ...events,
        "END:VCALENDAR",
        ""
    ].join("\r\n");

    const blob = new Blob([calendarContent], {
        type: "text/calendar;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "deadline-radar.ics";
    link.click();

    setTimeout(function () {
        URL.revokeObjectURL(url);
    }, 1000);

    message.textContent = "Calendar file exported successfully!";
}

exportButton.addEventListener("click", exportToCalendar);

// ---------------------------------------------
// Load saved deadlines and detected text
// ---------------------------------------------

async function loadDeadlines() {
    const result = await chrome.storage.local.get("deadlines");
    deadlines = result.deadlines || [];

    let changed = false;

    deadlines = deadlines.map(function (deadline) {
        if (!deadline.id) {
            changed = true;
            return { ...deadline, id: crypto.randomUUID() };
        }

        return deadline;
    });

    if (changed) {
        await chrome.storage.local.set({ deadlines });
    }

    displayDeadlines();
    await loadDetectedText();
}

loadDeadlines();