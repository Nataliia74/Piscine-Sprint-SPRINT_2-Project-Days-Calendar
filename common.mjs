
// This is a placeholder file which shows how you can define functions which can be used from both a browser script and a node script. You can delete the contents of the file once you have understood how it works.
import daysData from "./days.json" with { type: "json" };

// export function getGreeting() {
//   return "Hello";
// }


export function getMonthIndex(monthName, locale = navigator.language) {
    const monthFormatter = new Intl.DateTimeFormat(locale, {month: "long"});
    const year = new Date().getFullYear();
    const day = 1;

    for (let i=0; i<12; i++) {
      const formattedMonth = monthFormatter.format(new Date(year, i, day)).toLowerCase();
      if (monthName.toLowerCase() === formattedMonth) return i
      }
    throw Error ("There is no such month")
}

export function getWeekDayIndex(dayName, locale = navigator.language) {
    const dayFormatter = new Intl.DateTimeFormat(locale, {weekday: "long"});
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const day = 7;

    for (let i=0; i<7; i++) {
      const date = new Date(year, month, day + i);
      const formattedDay = dayFormatter.format(date).toLowerCase();
      if (dayName.toLowerCase() === formattedDay) return date.getDay();
      }
    throw Error ("There is no such weekday")
}

let dayOccurrence = { "first": 1, "second": 2, "third": 3, "fourth": 4, "last": -1};

export function getOccurrenceWeekdayInMonth (year, monthIndex, weekdayIndex, occurrence) {
  let day = 1;

  if (occurrence > 0 ) {
  while (day <= 31) {
    const date = new Date (year, monthIndex, day);
    if (date.getDay() === weekdayIndex) {
      occurrence --;
      if (occurrence === 0) {
        return day
      }
    }
    day++;
    if (day > new Date(year, monthIndex + 1, 0).getDate()) break;
  }
  }
  else if (occurrence === -1) {
    let day = new Date(year, monthIndex + 1, 0).getDate()
    while (day >= 1) {
      const date = new Date (year, monthIndex, day)
      if (date.getDay() === weekdayIndex) return day;
      day--;
    }
    } else {
    throw new Error("Invalid occurrence");
  }

  return null; // if the month doesn’t have that occurrence
}

export function getCommemorativeDayOfMonth (year, monthIndex, locale = navigator.language) {
  let arrayResults =[];
  // const year = new Date().getFullYear();

 
  for (let day of daysData) {
     try {
      const commemorativeMonthIndex = getMonthIndex(day.monthName, locale);
      const weekdayIndex = getWeekDayIndex(day.dayName, locale);
      const occurrence = dayOccurrence[day.occurence?.toLowerCase()]
      
      const date = getOccurrenceWeekdayInMonth(year, commemorativeMonthIndex, weekdayIndex, occurrence)
      if (commemorativeMonthIndex === monthIndex && date!=null) {
        arrayResults.push({
          name: day.name,
          date: date
        })
      }
    } catch (error) {
      console.error(`Error commemorative day "${day.name}":`, error.toString());
    }
  }
return arrayResults
}