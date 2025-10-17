
import { getCommemorativeDayOfMonth } from "./common.mjs";

const calendar = document.getElementById("calendar");
const statusEl = document.getElementById("status");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect")
const LOCALE     = "en-GB"; 
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const startYear =   1900;
const endYear = 2050; 

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


function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}


function renderCalendar(year, month) {

  calendar.innerHTML = "";
  const commemorativeDays = getCommemorativeDayOfMonth(year, month, LOCALE);

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
    const commemorative = commemorativeDays.find(d => d.date === day);
    if(commemorative) {
      dayDiv.classList.add("commemorative");
      dayDiv.title = `${commemorative.name} — click for details`;


      dayDiv.tabIndex = 0;
      dayDiv.setAttribute("role", "button");

      const label = document.createElement("span");
      label.classList.add("commemorative-label");
      label.textContent = commemorative.name;
      dayDiv.appendChild(label);


      const open = () => showDescription(commemorative, year, month, day);
      dayDiv.addEventListener("click", open);
      dayDiv.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    }
    calendar.appendChild(dayDiv);
  }


  const totalCells = startDay + numDays;
  const trailing = 42 - totalCells;
  for (let i = 0; i < trailing; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.classList.add("empty");
    calendar.appendChild(emptyDiv);
  }

  statusEl.textContent = `${year} - ${month + 1} (${numDays} days)`;
  
}

async function showDescription(ev, y, m, d) {
  try {
    const res = await fetch(ev.descriptionURL, { cache: "force-cache" });
    const text = res.ok ? (await res.text()).trim()
                        : `${ev.name}\n\n(No description available)`;

    const dialog = document.createElement("dialog");
    dialog.classList.add("modal");
    dialog.innerHTML = `
      <div class="modal-content">
        <h2 class="modal-title">${ev.name} — ${new Date(y, m, d).toDateString()}</h2>
        <pre class="modal-body">${text}</pre>
        <div class="modal-actions">
          <button class="modal-close" id="closeDlg" type="button">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();

    dialog.querySelector("#closeDlg").addEventListener("click", () => {
      dialog.close();
      dialog.remove();
    });
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        dialog.close();
        dialog.remove();
      }
    });
  } catch {
    alert(`${ev.name}`);
  }
}



renderCalendar(currentYear, currentMonth);
