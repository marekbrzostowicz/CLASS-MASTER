import { fetchColumns } from "./columnManagement.js";

export async function fetchStudent(searchQuery, tbody, headers, classId) {
  try {
    const response = await fetch(
      `/api/students?search=${encodeURIComponent(
        searchQuery
      )}&class_id=${classId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    console.log(await fetchColumns());
    const students = await response.json();
    console.log(students);
    await displayStudents(students, tbody, headers, classId);
  } catch (error) {
    console.error("Error fetching student", error.message);
    tbody.innerHTML = "";
    headers.innerHTML = "";
  }
}

async function displayStudents(students, tbody, headers, classId) {
  headers.innerHTML = "";

  const baseHeaders = ["Imię", "Nazwisko", "Email"];
  baseHeaders.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    headers.appendChild(th);
  });

  const columns = await fetchColumns();
  const filteredColumns = columns.filter(
    (column) => column.class_id === parseInt(classId, 10)
  );

  filteredColumns.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column.column_name;
    headers.appendChild(th);
  });

  const existingRows = tbody.querySelectorAll("tr");

  students.forEach((student, index) => {
    let row = existingRows[index] || tbody.insertRow();
    row.innerHTML = "";
    const tdFirstName = document.createElement("td");
    const tdLastName = document.createElement("td");
    const tdEmail = document.createElement("td");

    tdFirstName.textContent = student.first_name;
    tdLastName.textContent = student.last_name;
    tdEmail.textContent = student.email;

    row.appendChild(tdFirstName);
    row.appendChild(tdLastName);
    row.appendChild(tdEmail);

    filteredColumns.forEach((column) => {
      const tdGrade = document.createElement("td");
      let gradeValue = "";
      if (student.grades && student.grades.length > 0) {
        const gradeObj = student.grades.find(
          (g) => Number(g.assesments_id) === Number(column.id)
        );
        if (gradeObj) {
          gradeValue = gradeObj.grade;
        }
      }
      tdGrade.textContent = gradeValue;
      row.appendChild(tdGrade);
    });
  });

  while (tbody.children.length > students.length) {
    tbody.lastChild.remove();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const findStudentBtn = document.getElementById("find-student-btn");
  const modal = document.getElementById("student-search-popup");
  const closeSpan = modal.querySelector(".close");
  const popupSearchInput = document.getElementById("popup-search-input");
  const popupHeaders = document.getElementById("popup-table-headers");
  const popupBody = document.getElementById("popup-students-data");

  findStudentBtn.addEventListener("click", () => {
    modal.style.display = "block";
    popupSearchInput.focus();
  });

  closeSpan.addEventListener("click", () => {
    modal.style.display = "none";
    popupHeaders.innerHTML = "";
    popupBody.innerHTML = "";
    popupSearchInput.value = "";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      popupHeaders.innerHTML = "";
      popupBody.innerHTML = "";
      popupSearchInput.value = "";
    }
  });
  popupSearchInput.addEventListener("input", async () => {
    const query = popupSearchInput.value.trim();
    const classTitleElem = document.getElementById("class-title");
    const classId = classTitleElem ? classTitleElem.dataset.classId : "";

    if (query.length > 0) {
      try {
        const response = await fetch(
          `/api/students?search=${encodeURIComponent(
            query
          )}&class_id=${classId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok) throw new Error("Błąd sieciowy");
        const students = await response.json();

        popupHeaders.innerHTML = "";
        popupBody.innerHTML = "";

        const baseHeaders = ["Imię", "Nazwisko", "Email"];
        baseHeaders.forEach((header) => {
          const th = document.createElement("th");
          th.textContent = header;
          popupHeaders.appendChild(th);
        });

        const columns = await fetchColumns();
        const filteredColumns = columns.filter(
          (column) => column.class_id === parseInt(classId, 10)
        );

        filteredColumns.forEach((column) => {
          const th = document.createElement("th");
          th.textContent = column.column_name;
          popupHeaders.appendChild(th);
        });

        if (students.length === 0) {
          popupBody.innerHTML = "<tr><td colspan='100%'>Brak wyników</td></tr>";
        } else {
          students.forEach((student) => {
            let row = document.createElement("tr");

            ["first_name", "last_name", "email"].forEach((key) => {
              const td = document.createElement("td");
              td.textContent = student[key];
              row.appendChild(td);
            });

            filteredColumns.forEach((column) => {
              const td = document.createElement("td");
              const gradeValue =
                student.grades?.find(
                  (g) => Number(g.assesments_id) === Number(column.id)
                )?.grade || "";
              td.textContent = gradeValue;
              row.appendChild(td);
            });

            popupBody.appendChild(row);

            row.addEventListener("click", async () => {
              modal.style.display = "none";
              popupHeaders.innerHTML = "";
              popupBody.innerHTML = "";
              popupSearchInput.value = "";
              const mainHeaders = document.getElementById("main-table-headers");
              const mainBody = document.getElementById("main-students-data");
              await displayStudents([student], mainBody, mainHeaders, classId);
            });
          });
        }
      } catch (err) {
        popupBody.innerHTML = `<tr><td colspan='100%'>Błąd podczas wyszukiwania</td></tr>`;
      }
    } else {
      popupHeaders.innerHTML = "";
      popupBody.innerHTML = "";
    }
  });
});
