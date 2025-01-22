import { createTable } from "./average.js";

let areClassesAdded = false;

export function addGradesInputs(index) {
  console.log("addGradesInputs, colIndex =", index);
  const table = document.querySelector("table");
  const rows = table.rows;

  // kolumna dynamiczna
  const columnId = rows[0].cells[index].dataset.columnId;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cell = row.cells[index]; // już istnieje, bo rozszerzyliśmy wiersze

    if (cell.firstChild && cell.firstChild.tagName === "INPUT") {
      // usuwamy input => przywracamy tekst
      const inputValue = cell.firstChild.value;
      cell.innerHTML = inputValue;
    } else {
      // wstawiamy input
      const previousValue = cell.textContent.trim();
      cell.innerHTML = "";
      const input = document.createElement("input");
      input.value = previousValue;

      const studentId = row.dataset.studentId;
      input.dataset.studentId = studentId;
      input.dataset.columnId = columnId;

      cell.appendChild(input);
    }
  }
}

// Zbieramy dane z inputow
export function getGradesFromInputs() {
  const inputs = document.querySelectorAll("table input");
  let gradesArray = [];

  for (const input of inputs) {
    const gradeValue = input.value;
    if (input.value < 0 || input.value > 5 || isNaN(input.value)) {
      alert("Enter numbers only, Grades must be between 1 - 5");
      input.value = "";
      return [];
    }
    const studentId = input.dataset.studentId;
    const columnId = input.dataset.columnId;

    // usuwamy input, przywracamy tekst
    const cell = input.parentElement;
    cell.classList.add("grade-cells");
    cell.removeChild(input);
    cell.textContent = gradeValue;

    gradesArray.push({
      grade: gradeValue,
      student_id: studentId,
      assesments_id: columnId,
    });
  }

  return gradesArray;
}

// Wysyłanie ocen do backendu (wywoływane przy "ZAPISZ OCENY")
export async function addGradesToBackend() {
  const allGrades = getGradesFromInputs();
  try {
    const response = await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grades: allGrades }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add column name");
    }
    const result = await response.json();
    console.log("Oceny zapisane:", result);
    createTable();
  } catch (error) {
    console.error("Error adding grades", error.message);
  }
}

// Pobieranie ocen z backendu i wstawianie do tabeli
export async function fetchGrades() {
  console.log("Fetching grades");
  try {
    const response = await fetch("/api/grades", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const grades = await response.json();
    console.log("Fetched grades", grades);

    // Odczytanie globalnych map
    const columnIndexMap = window.columnIndexMap || {};
    const studentRowMap = window.studentRowMap || {};

    grades.forEach((gradeObj) => {
      const stId = gradeObj.student_id;
      const colId = gradeObj.assesments_id;
      const gradeVal = gradeObj.grade;

      const row = studentRowMap[stId];
      if (!row) {
        console.warn(`No row for studentId=${stId}`);
        return;
      }

      const colIndex = columnIndexMap[colId];
      if (colIndex === undefined) {
        console.warn(`No columnIndex for colId=${colId}`);
        return;
      }

      const cell = row.cells[colIndex];
      if (!cell) {
        console.warn(`No cell at row.cells[${colIndex}]`);
        return;
      }
      // if (gradeVal){
      //   cell.className = ""
      //   cell.classList.add(`grade-${gradeVal}`)
      // }
      // Wstawiamy ocenę
      cell.textContent = gradeVal;
    });

    return grades;
  } catch (error) {
    console.error("Error fetching columns", error.message);
    return [];
  }
}

export function toggleGradeCells() {
  const rows = document.querySelectorAll(".grades-cell");

  console.log(`========================${rows}`);

  rows.forEach((row) => {
    // Pobierz liczbę komórek w wierszu
    const totalCells = row.cells.length;

    // Iteruj po komórkach w wierszu od czwartej do przedostatniej
    for (let c = 4; c < totalCells; c++) {
      const cell = row.cells[c];
      // Dodaj klasę do komórki
      cell.classList.add("grades-colour");
    }
  });
  applyGradesColor();
  areClassesAdded = !areClassesAdded;
}

function applyGradesColor() {
  const allCells = document.querySelectorAll(".grades-colour");

  allCells.forEach((cell) => {
    const value = cell.textContent.trim();

    if (!areClassesAdded) {
      if (value === "5") {
        cell.classList.add("grade-5");
      } else if (value === "4") {
        cell.classList.add("grade-4");
      } else if (value === "3") {
        cell.classList.add("grade-3");
      } else if (value === "2") {
        cell.classList.add("grade-2");
      } else if (value === "1") {
        cell.classList.add("grade-1");
      }
    } else {
      cell.classList.remove(
        "grade-5",
        "grade-4",
        "grade-3",
        "grade-2",
        "grade-1"
      );
    }
  });
}
