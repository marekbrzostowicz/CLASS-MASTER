import { getClassIdFromUrl } from "./studentManagement.js";

export async function createTable() {

  const counterElement = document.getElementById("student-counter");
  
  const table = document.getElementById("table-average");

  while (table.rows.length > 1) {
    table.deleteRow(1);
  }

  const grades = await fetchColumnId(getClassIdFromUrl());
  console.log(grades);
  grades.forEach((grade) => {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.textContent = grade;
    tr.appendChild(td);
    table.appendChild(tr);
  });
  //   createTable();
}

//FUNCKJA DO WYSYLANIA ID KOLUMNY
export async function fetchColumnId(classId) {
  try {
    const response = await fetch(
      `/api/averages?classId=${encodeURIComponent(classId)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    const table = document.getElementById('table-average')
    if (data.length == 0) {
      
      table.classList.add("table-style-display-none");
      console.log("KLASA DODANA");
    } else {
      table.classList.remove("table-style-display-none")
    }

    console.log(data);
    return data;
  } catch (error) {
    console.error("Error during getting data", error.message);
  }
}
