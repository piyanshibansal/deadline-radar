
# Deadline Radar 🎯

**Never lose track of a deadline again.**

Deadline Radar is a Chrome extension that helps students manage academic deadlines by saving assignments, exams, and other important dates in one place. It can also detect potential deadlines from selected webpage text and lets users review them before saving.

## ✨ Features

- **Deadline management:** Add, edit, delete, and sort deadlines by date.
- **Smart date detection:** Extract supported dates and suggested titles from selected webpage text.
- **Duplicate prevention:** Prevent duplicate deadlines with the same title and date.
- **Date validation:** Reject invalid calendar dates and deadlines in the past.
- **Persistent storage:** Keep saved deadlines between browser sessions.
- **Reminders:** Schedule browser notifications for upcoming deadlines.
- **Calendar export:** Export deadlines as an `.ics` file for compatible calendar applications.
- **Automated testing:** Validate utility functions and date-detection logic using Vitest.

## 🛠️ Tech Stack

- HTML
- CSS
- JavaScript
- Chrome Extensions API (Manifest V3)
- Chrome Storage, Alarms, Notifications, and Context Menus APIs
- Vitest

## 🚀 Installation

1. Clone this repository:

   ```bash
   git clone YOUR_GITHUB_REPOSITORY_URL
   ```

2. Open the project folder in VS Code or another editor.
3. Open Google Chrome and navigate to `chrome://extensions`.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the project folder containing `manifest.json`.

Deadline Radar should now appear in your Chrome toolbar.

## 🧪 Run Automated Tests

Make sure Node.js and npm are installed. From the project directory, run:

```bash
npm install
npm test
```

The current test suite contains **26 automated tests** across two test files.

## 📁 Project Structure

```text
deadline-radar/
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
├── service-worker.js
├── deadline-utils.js
├── deadline-utils.test.js
├── deadline-detector.js
├── deadline-detector.test.js
├── icon.png
├── package.json
└── package-lock.json
```

## 🔮 Future Improvements

- A web dashboard for managing deadlines.
- Search, filtering, and calendar-style views.
- Improved deadline detection from webpage content.
- Optional synchronization between the extension and website.
- Additional automated tests and usability improvements.

## 👩‍💻 Motivation

Built as a personal software engineering project to explore browser extension development, JavaScript modularization, automated testing, and productivity tools.

---

**Deadline Radar — Stay ahead of every deadline.**
