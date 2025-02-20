import { fetchColumns, addContextMenuListeners } from "./columnManagement.js";
import {
  addGradesInputs,
  addGradesToBackend,
  fetchGrades,
} from "./gradeManagement.js";
import { fetchGradesForCharts } from "./chartManagement.js";

export function getClassIdFromUrl() {
  const urlParts = window.location.pathname.split("/");
  return urlParts[urlParts.length - 1];
}

// Pobranie nazwy klasy
export async function fetchClassName(classId) {
  try {
    const response = await fetch(`/api/classes/${classId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const classData = await response.json();
    return classData;
  } catch (error) {
    console.error("Failed to fetch class", error);
    return null;
  }
}

//Dodawanie studenta
export async function addStudent(classId, firstName, lastName, email) {
  console.log("Class ID being sent:", classId);
  try {
    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email,
        class_id: classId,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add student");
    }
    const result = await response.json();
    console.log("Student added successfully:", result);
    setTimeout(() => {
      showStudents(classId);
    }, 500);

    showStudents(classId);
  } catch (error) {
    console.error("Error adding student:", error.message);
  }
}

export function createStudentForm() {
  const studentPopup = document.getElementById("add-student-popup");
  const studentClose = document.getElementById("add-student-close");
  const addStudentBtn = document.getElementById("add-student-btn");
  const firstNameInput = document.getElementById("student-firstname");
  const lastNameInput = document.getElementById("student-lastname");
  const emailInput = document.getElementById("student-email");
  const fileInput = document.getElementById("student-file-upload");

  // Jeśli popup jest już otwarty, nie dodawaj nowych event listenerów
  if (studentPopup.style.display === "block") return;

  // Otwórz popup
  studentPopup.style.display = "block";

  // Usuń poprzednie event listenery (jeśli istnieją)
  addStudentBtn.removeEventListener("click", handleStudentAdd);
  studentClose.removeEventListener("click", closeStudentPopup);
  window.removeEventListener("click", closeStudentPopupOutside);
  fileInput.removeEventListener("change", handleFileUpload);

  // Dodaj event listenery
  addStudentBtn.addEventListener("click", handleStudentAdd, { once: true });
  studentClose.addEventListener("click", closeStudentPopup, { once: true });
  window.addEventListener("click", closeStudentPopupOutside, { once: true });
  fileInput.addEventListener("change", handleFileUpload, { once: true });

  function handleStudentAdd() {
    const classId = getClassIdFromUrl();
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();

    if (!firstName || !lastName || !email) {
      alert("Uzupełnij wszystkie pola!");
      return;
    }

    addStudent(classId, firstName, lastName, email);
    closeStudentPopup();
  }

  function handleFileUpload(event) {
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const file = event.target.files[0];

    if (file && allowedTypes.includes(file.type)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("classId", getClassIdFromUrl());

      fetch("/api/files", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to send file");
          showStudents(getClassIdFromUrl());
        })
        .catch((error) => console.error("Error sending file", error.message));
    } else {
      alert("Invalid file type");
      fileInput.value = "";
    }
  }

  function closeStudentPopup() {
    studentPopup.style.display = "none";
    clearStudentPopup();
  }

  function closeStudentPopupOutside(event) {
    if (event.target === studentPopup) {
      closeStudentPopup();
    }
  }

  function clearStudentPopup() {
    firstNameInput.value = "";
    lastNameInput.value = "";
    emailInput.value = "";
    fileInput.value = "";
  }
}

export async function showStudents(classId) {
  console.log("Fetching students for class ID:", classId);
  const counter = document.getElementById("student-counter");
  document.getElementById("table-average");
  try {
    const response = await fetch(`/api/students/${classId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const students = await response.json();
    console.log("Fetched:", students);

    // if(!students){
    //   table.classList.add('table-style-display-none')
    //   console.log('KLASA DODANE')
    // }

    const columns = await fetchColumns();

    const studentContainer = document.getElementById("students-container");
    if (!studentContainer) {
      console.error("students-container element not found");
      return;
    }
    studentContainer.innerHTML = "";

    const filteredColumns = columns.filter(
      (column) => column.class_id === parseInt(classId, 10)
    );
    // const filteredStudents = students.filter(
    //   (student) => student.class_id === parseInt(classId, 10)
    // );

    if (students.length === 0) {
      console.log("No students found for this class.");
      studentContainer.textContent = "Brak uczniów w tej klasie.";
      return;
    }

    console.log(`Displaying ${students.length} students`);

    const table = document.createElement("table");
    const trTitle = document.createElement("tr");

    const thIndex = document.createElement("th");
    thIndex.textContent = "ID"; // lub "Lp."
    const thName = document.createElement("th");
    thName.textContent = "NAME";
    const thSecondName = document.createElement("th");
    thSecondName.textContent = "LAST NAME";
    const thEmail = document.createElement("th");
    thEmail.textContent = "EMAIL";

    trTitle.appendChild(thIndex);
    trTitle.appendChild(thName);
    trTitle.appendChild(thSecondName);
    trTitle.appendChild(thEmail);
    table.appendChild(trTitle);

    // W funkcji showStudents zmień fragment tworzący komórki z imieniem i nazwiskiem:
    students.forEach((student, index) => {
      const trStudentData = document.createElement("tr");
      trStudentData.dataset.studentId = student.id;

      const tdIndex = document.createElement("td");
      tdIndex.textContent = index + 1;

      if (index == 0) {
        counter.textContent = `${index + 1} STUDENT`;
      } else {
        counter.textContent = `${index + 1} STUDENTS`;
      }

      // IMIONA
      const tdName = document.createElement("td");
      tdName.textContent = student.first_name;
      tdName.addEventListener("contextmenu", (e) =>
        handleStudentContextMenu(e, student.id)
      ); // TUTAJ ZMIANA

      // NAZWISKA
      const tdSecondName = document.createElement("td"); // POPRAWA LITERÓWKI
      tdSecondName.textContent = student.last_name;
      tdSecondName.addEventListener("contextmenu", (e) =>
        handleStudentContextMenu(e, student.id)
      ); // TUTAJ ZMIANA

      // EMAIL
      const tdEmail = document.createElement("td");
      tdEmail.textContent = student.email;

      trStudentData.appendChild(tdIndex);
      trStudentData.appendChild(tdName);
      trStudentData.appendChild(tdSecondName); // POPRAWA LITERÓWKI
      trStudentData.appendChild(tdEmail);

      table.appendChild(trStudentData);
    });
    filteredColumns.forEach((column, idx) => {
      const th = document.createElement("th");
      // const averageTh = document.createElement("th");
      // averageTh.textContent = "A";

      th.textContent = column.column_name;
      th.dataset.columnId = column.id;
      console.log("Dodano kolumnę:", th); // Debug
      th.classList.add("column");

      th.addEventListener("click", () => {
        addGradesInputs(th.cellIndex);
      });
      th.classList.add("grade-column");
      trTitle.appendChild(th);
    });

    studentContainer.appendChild(table);

    const getGradesButton = document.createElement("button");
    getGradesButton.textContent = "SAVE GRADES";
    getGradesButton.id = "grades-button";
    studentContainer.appendChild(getGradesButton);
    getGradesButton.onclick = addGradesToBackend;

    const totalCols = 4 + filteredColumns.length;
    for (let r = 1; r < table.rows.length; r++) {
      const row = table.rows[r];
      while (row.cells.length < totalCols) {
        row.insertCell(-1);
        row.classList.add("grades-cell");
      }
    }

    const columnIndexMap = {};
    console.log(`+++++++++++++++++ ${filteredColumns.length}`);

    for (let c = 4; c < 4 + filteredColumns.length + 1; c++) {
      const cell = trTitle.cells[c];
      if (!cell) continue;
      const colId = cell.dataset.columnId;
      if (colId) {
        columnIndexMap[colId] = c;
      }
    }

    const studentRowMap = {};
    for (let r = 1; r < table.rows.length; r++) {
      const row = table.rows[r];
      const stId = row.dataset.studentId;
      if (stId) {
        studentRowMap[stId] = row;
      }
    }

    // Zapisujemy w window
    window.columnIndexMap = columnIndexMap;
    console.log(`===KOLUMNY=== ${JSON.stringify(columnIndexMap, null, 10)}`);

    window.studentRowMap = studentRowMap;
    console.log(`===WIERSZE=== ${JSON.stringify(studentRowMap, null, 10)}`);

    await fetchGrades();
    addContextMenuListeners();
  } catch (error) {
    console.error("Error fetching students:", error.message);
  }
}

function handleStudentContextMenu(event, studentId) {
  event.preventDefault();

  // Pobierz imię i nazwisko studenta z klikniętej komórki
  const studentRow = event.target.closest("tr");
  const firstName = studentRow.children[1].textContent;
  const lastName = studentRow.children[2].textContent;

  // Usuń istniejące menu jeśli jest
  const existingMenu = document.querySelector(".student-context-menu");
  if (existingMenu) existingMenu.remove();

  // Utwórz nowe menu
  const menu = document.createElement("div");
  menu.className = "student-context-menu";
  menu.style.position = "absolute";
  menu.style.left = `${event.pageX}px`;
  menu.style.top = `${event.pageY}px`;
  menu.style.zIndex = "1000";
  menu.style.backgroundColor = "white";
  menu.style.border = "1px solid #ddd";
  menu.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  menu.style.padding = "10px";
  menu.style.borderRadius = "8px";

  // Nagłówek z imieniem i nazwiskiem
  const title = document.createElement("div");
  title.textContent = `${firstName} ${lastName}`;
  title.style.fontWeight = "bold";
  title.style.padding = "8px 16px";
  title.style.borderBottom = "1px solid #ddd";
  title.style.marginBottom = "5px";
  title.style.textAlign = "center";

  // Opcja wykresu
  const chartOption = document.createElement("div");
  chartOption.textContent = "Wykres";
  chartOption.style.padding = "8px 16px";
  chartOption.style.cursor = "pointer";
  chartOption.style.textAlign = "center";
  chartOption.addEventListener("click", () => {
    fetchGradesForCharts(studentId);
    menu.remove();
  });

  // Opcja usuwania
  const deleteOption = document.createElement("div");
  deleteOption.textContent = "Usuń";
  deleteOption.style.padding = "8px 16px";
  deleteOption.style.cursor = "pointer";
  deleteOption.style.backgroundColor = "#e74c3c";
  deleteOption.style.color = "white";
  deleteOption.style.textAlign = "center";
  deleteOption.style.marginTop = "5px";
  deleteOption.addEventListener("click", async () => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Błąd podczas usuwania studenta");

      menu.remove();
      location.reload();
    } catch (error) {
      console.error("Błąd:", error);
    }
  });

  menu.appendChild(title);
  menu.appendChild(chartOption);
  menu.appendChild(deleteOption);
  document.body.appendChild(menu);

  const closeMenu = () => {
    menu.remove();
    document.removeEventListener("click", closeMenu);
  };
  setTimeout(() => {
    document.addEventListener("click", closeMenu);
  }, 10);
}

const style = document.createElement("style");
style.textContent = `
  .student-context-menu div:hover {
    background-color: #f5f5f5;
  }
`;

document.head.appendChild(style);
