// This is a placeholder file which shows how you can access functions and data defined in other files.
// It can be loaded into index.html.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.

import { getGreeting } from "./common.mjs";
import daysData from "./days.json" with { type: "json" };

const calendar = document.getElementById("calendar");
const statusEl = document.getElementById("status");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect")

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const startYear = currentYear - 50;
const endYear = currentYear + 50; 

for (let year = startYear; year <= endYear; year++) {
  const option = document.createElement("option");
  option.value = year;
  option.textContent = year;
  yearSelect.appendChild(option)
}

yearSelect.value = currentYear;

yearSelect.addEventListener("change", () => {
  displayedYear = parseInt(yearSelect.value);
  updateCalendar();
})

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"]

monthNames.forEach((name, index) => {
  const option = document.createElement("option")
  option.value = index;
  option.textContent = name;
  monthSelect.appendChild(option);
})

monthSelect.value = currentMonth

monthSelect.addEventListener("change", () => {
  displayedMonth = parseInt(monthSelect.value)
  updateCalendar()
})

let displayedYear = currentYear;
let displayedMonth = currentMonth;

function updateCalendar() {
  renderCalendar (displayedYear, displayedMonth)
  yearSelect.value = displayedYear
   monthSelect.value = displayedMonth
}
 
  

nextBtn.addEventListener("click", () => {
  
  displayedMonth++;
  if(displayedMonth > 11) {
    displayedMonth = 0;
    displayedYear++;
  }
  updateCalendar();
})


prevBtn.addEventListener("click", () => {
  
  displayedMonth--;
  if(displayedMonth < 0) {
    displayedMonth = 11;
    displayedYear--;
  }
  updateCalendar();
})

// Function to count how many days are in a month
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Function to render the days of a month
function renderCalendar(year, month) {
  // Clear any previous calendar content
  calendar.innerHTML = "";

  const numDays = daysInMonth(year, month);

  const firstDay = new Date(year,month, 1).getDay();
  const startDay = (firstDay + 6) % 7

  for (let i = 0; i < startDay; i++) {
    const emptyDiv = document.createElement("div")
    emptyDiv.classList.add("empty");
    calendar.appendChild(emptyDiv)
  }



 

  for (let day = 1; day <= numDays; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");
    dayDiv.textContent = day;
    calendar.appendChild(dayDiv);
  }
   statusEl.textContent = `${year} - ${month + 1} (${numDays} days)`;
}

// Render the current month when the page loads
renderCalendar(currentYear, currentMonth);
