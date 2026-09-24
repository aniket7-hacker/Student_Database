# Student Database Management

A responsive, browser-based student database dashboard for adding, editing, searching, and managing student records. The project is built with plain HTML, CSS, and JavaScript; no build tools or dependencies are required.

## Features

- Dashboard metrics for total, active, newly added, and department counts
- Add, edit, and delete student records
- Search students by name, ID, department, year, or status
- Local browser storage, so records remain after a page refresh
- Recent-student table and a live status report
- Download the current records as a CSV report
- Light/dark theme switcher and compact table-row option
- Responsive layout for desktop and mobile screens

## Run locally

1. Clone or download this project.
2. Open `student database_management.html` in a modern web browser.

Alternatively, serve the folder with any local static-file server and open the displayed local address.

## Project structure

```text
Student_database/
|-- student database_management.html  # Application markup
|-- student database_management.css   # Responsive styles and themes
|-- student database_management.js    # Application behavior and local storage
`-- README.md
```

## Data storage

Student records are stored only in the browser's `localStorage` under the key `edutrack-students-v1`. No backend or external database is connected. Use **Settings > Reset demo data** to remove all saved records from the current browser.

## CSV export

Open **Reports** and select **Download report** to export the current student list as `edutrack-students.csv`.

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
