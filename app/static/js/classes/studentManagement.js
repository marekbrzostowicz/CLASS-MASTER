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

    showStudents(classId);
  } catch (error) {
    console.error("Error adding student:", error.message);
  }
}

// Tworzy formularz do dodawania studenta
export function createStudentForm() {
  const classId = getClassIdFromUrl();
  const formContainer = document.getElementById("form-container");
  const p1 = document.getElementById("desc-1");
  const p2 = document.getElementById("desc-2");

  // Sprawdzamy, czy jest schowany i ewentualnie pokazujemy
  if (formContainer.style.display === "none") {
    formContainer.style.display = "block";

    // Czyścimy poprzednią zawartość
    const inputStudent = document.getElementById("input-students");
    inputStudent.innerHTML = "";

    // Pola do manualnego dodania studenta
    const firstNameInput = document.createElement("input");
    firstNameInput.placeholder = "Name";

    const lastNameInput = document.createElement("input");
    lastNameInput.placeholder = "Last name";

    const emailInput = document.createElement("input");
    emailInput.placeholder = "Email";

    const addButton = document.createElement("button");
    addButton.id = "add-manual";
    const icon = document.createElement("p");
    icon.className = "fas fa-arrow-right";
    addButton.appendChild(icon);

    addButton.onclick = () => {
      addStudent(
        classId,
        firstNameInput.value,
        lastNameInput.value,
        emailInput.value
      );
    };

    // --- TU DODAJEMY input[type="file"] i od razu podpinamy event "change" ---
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "file-input";

    fileInput.addEventListener("change", async (event) => {
      // logika walidacji i wysyłki
      const allowedTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      const allowedExtensions = ["csv", "xls", "xlsx"];

      const file = event.target.files[0];
      if (file) {
        const fileType = file.type;
        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (
          allowedTypes.includes(fileType) &&
          allowedExtensions.includes(fileExtension)
        ) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append('classId', getClassIdFromUrl())
          try {
            const response = await fetch("/api/files", {
              method: "POST",
              body: formData,
              
            });
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to send file");
            }
            const result = await response.json();
            showStudents(getClassIdFromUrl()) //////
            console.log("Wysłano plik:", result);
          } catch (error) {
            console.error("Error sending file", error.message);
          }
        } else {
          alert("Invalid file type");
          // resetujemy input, żeby można było wybrać kolejny
          event.target.value = "";
        }
      }
    });

    // Wstawiamy elementy do kontenera
    inputStudent.appendChild(p1);
    inputStudent.appendChild(p2);
    inputStudent.appendChild(firstNameInput);
    inputStudent.appendChild(lastNameInput);
    inputStudent.appendChild(emailInput);
    inputStudent.appendChild(addButton);

    // Na koniec wstawiamy nasze pole typu file
    inputStudent.appendChild(fileInput);
  } else {
    formContainer.style.display = "none";
  }
}

export async function showStudents(classId) {
  console.log("Fetching students for class ID:", classId);
  const counter = document.getElementById("student-counter");
  document.getElementById("table-average");
  try {
    // Pobierz listę studentów
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

    // Pobierz listę kolumn
    const columns = await fetchColumns();

    // Szukamy kontenera w HTML
    const studentContainer = document.getElementById("students-container");
    if (!studentContainer) {
      console.error("students-container element not found");
      return;
    }
    studentContainer.innerHTML = "";

    // Filtrowanie po classId
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

    // Tworzymy tabelę
    const table = document.createElement("table");
    const trTitle = document.createElement("tr");

    // Stałe kolumny (Index, Imię, Nazwisko, E-mail)
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

    // Dodajemy wiersze (dla studentów)
    students.forEach((student, index) => {
      const trStudentData = document.createElement("tr");

      trStudentData.dataset.studentId = student.id; // Ustawienie dataset

      // Tworzenie i dodawanie komórek do wiersza
      const tdIndex = document.createElement("td");
      tdIndex.textContent = index + 1;

      if (index == 0) {
        counter.textContent = `${index + 1} STUDENT`;
      } else {
        counter.textContent = `${index + 1} STUDENTS`;
      }

      const tdName = document.createElement("td");
      tdName.textContent = student.first_name;
      tdName.addEventListener("click", () => {
        fetchGradesForCharts(student.id);
      });

      const tdSedondName = document.createElement("td");
      tdSedondName.textContent = student.last_name;
      tdSedondName.addEventListener("click", () => {
        fetchGradesForCharts(student.id);
      });

      const tdEmail = document.createElement("td");
      tdEmail.textContent = student.email;

      trStudentData.appendChild(tdIndex);
      trStudentData.appendChild(tdName);
      trStudentData.appendChild(tdSedondName);
      trStudentData.appendChild(tdEmail);

      // Dodanie wiersza do tabeli
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

    // Tworzymy guzik "ZAPISZ OCENY"
    const getGradesButton = document.createElement("button");
    getGradesButton.textContent = "SAVE GRADES";
    getGradesButton.id = "grades-button";
    studentContainer.appendChild(getGradesButton);
    getGradesButton.onclick = addGradesToBackend;

    // ====== Rozszerz wiersze do 4 + filteredColumns.length kolumn =======
    const totalCols = 4 + filteredColumns.length;
    for (let r = 1; r < table.rows.length; r++) {
      const row = table.rows[r];
      while (row.cells.length < totalCols) {
        row.insertCell(-1);
        row.classList.add("grades-cell");
      }
    }

    // === Tworzymy mapy do fetchGrades ===
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

    // map: studentId -> <tr>
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
