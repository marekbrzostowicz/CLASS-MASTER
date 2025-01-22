import {
  getClassIdFromUrl,
  fetchClassName,
  createStudentForm,
  showStudents,
} from "./studentManagement.js";

import { addGradesColumn } from "./columnManagement.js";
import { fetchStudent } from "./studentSearch.js";
import { toggleGradeCells } from "./gradeManagement.js";
import { createTable, fetchColumnId } from "./average.js";

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-student");
  const tbody = document.getElementById("students-data");
  const headers = document.getElementById("table-headers");

  searchInput.addEventListener("input", async (event) => {
    const searchQuery = event.target.value;

    if (searchQuery.trim() !== "") {
      await fetchStudent(searchQuery, tbody, headers, getClassIdFromUrl());
    } else {
      tbody.innerHTML = "";
      console.log("pusty");
    }
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const classId = getClassIdFromUrl();
  const classData = await fetchClassName(classId);

  if (classData) {
    document.getElementById("class-title").textContent = classData.name;
  }
  await showStudents(classId);

  createTable();

  await fetchColumnId(classId);
});

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("create-student-btn")
    .addEventListener("click", createStudentForm);

  document
    .getElementById("add-grades-col-btn")
    .addEventListener("click", addGradesColumn);

  document
    .getElementById("color-change")
    .addEventListener("click", toggleGradeCells);
  const counterElement = document.getElementById("student-counter");
  counterElement.textContent =
    document.querySelectorAll("#students-data tr").length;
});
