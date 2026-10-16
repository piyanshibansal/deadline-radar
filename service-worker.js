console.log("Deadline Radar service worker started!");

const REMINDER_MINUTES_BEFORE = 24 * 60;
const CONTEXT_MENU_ID = "deadline-radar-detect-deadline";

async function getDeadlines() {
    const result = await chrome.storage.local.get("deadlines");
    return result.deadlines || [];
}

async function scheduleReminder(deadline) {
    if (!deadline.id || !deadline.date) return;

    const alarmName = "deadline-" + deadline.id;

    await chrome.alarms.clear(alarmName);

    const dueTime = new Date(deadline.date + "T09:00:00").getTime();
    const reminderTime =
        dueTime - REMINDER_MINUTES_BEFORE * 60 * 1000;

    if (reminderTime > Date.now()) {
        chrome.alarms.create(alarmName, { when: reminderTime });
    }
}

async function syncReminders() {
    const deadlines = await getDeadlines();

    const activeNames = new Set(
        deadlines.map(deadline => "deadline-" + deadline.id)
    );

    const alarms = await chrome.alarms.getAll();

    for (const alarm of alarms) {
        if (
            alarm.name.startsWith("deadline-") &&
            !activeNames.has(alarm.name)
        ) {
            await chrome.alarms.clear(alarm.name);
        }
    }

    for (const deadline of deadlines) {
        await scheduleReminder(deadline);
    }

    console.log("Reminders synchronized:", deadlines.length);
}

async function createContextMenu() {
    await chrome.contextMenus.removeAll();

    chrome.contextMenus.create({
        id: CONTEXT_MENU_ID,
        title: "Detect deadline with Deadline Radar",
        contexts: ["selection"]
    });
}

chrome.alarms.onAlarm.addListener(async function (alarm) {
    if (!alarm.name.startsWith("deadline-")) return;

    const deadlineId = alarm.name.slice("deadline-".length);
    const deadlines = await getDeadlines();

    const deadline = deadlines.find(item => item.id === deadlineId);

    if (!deadline) return;

    chrome.notifications.create("reminder-" + deadlineId, {
        type: "basic",
        iconUrl: "icon.png",
        title: "Deadline Radar Reminder",
        message: deadline.title + " is due tomorrow!",
        priority: 2
    });
});

chrome.runtime.onMessage.addListener(function (
    message,
    sender,
    sendResponse
) {
    if (message.action === "syncReminders") {
        syncReminders()
            .then(() => sendResponse({ success: true }))
            .catch(error => {
                console.error("Reminder sync failed:", error);
                sendResponse({
                    success: false,
                    error: error.message
                });
            });

        return true;
    }
});

chrome.runtime.onInstalled.addListener(function () {
    createContextMenu().catch(console.error);
    syncReminders().catch(console.error);
});

chrome.runtime.onStartup.addListener(function () {
    createContextMenu().catch(console.error);
    syncReminders().catch(console.error);
});

chrome.contextMenus.onClicked.addListener(function (info) {
    if (info.menuItemId !== CONTEXT_MENU_ID) return;

    const selectedText = (info.selectionText || "").trim();

    if (!selectedText) return;

    chrome.storage.local.set(
        { detectedDeadlineText: selectedText },
        function () {
            chrome.action.openPopup();
        }
    );
});