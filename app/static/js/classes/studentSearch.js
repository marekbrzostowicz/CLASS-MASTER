import { fetchColumns } from "./columnManagement.js";

export async function fetchStudent(searchQuery, tbody, headers, classId) {
  try {
    const response = await fetch(
      `/api/students?search=${encodeURIComponent(searchQuery)}&class_id=${classId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    console.log(fetchColumns());
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

  const baseHeaders = ["Imie", "Nazwisko", "Email"];
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
    const column_ = document.createElement("th");
    column_.textContent = column.column_name;
    headers.appendChild(column_);
  });


  const existingRows = tbody.querySelectorAll("tr");
  students.forEach((student, index) => {
    let row;
    if (existingRows[index]) {
      row = existingRows[index]; 
    } else {
      row = document.createElement("tr"); 
      tbody.appendChild(row);
    }


    row.innerHTML = ""; 

    const name = document.createElement("td");
    const lastName = document.createElement("td");
    const email = document.createElement("td");

    name.textContent = student.first_name;
    lastName.textContent = student.last_name;
    email.textContent = student.email;

    row.appendChild(name);
    row.appendChild(lastName);
    row.appendChild(email);
  });

  if (existingRows.length > students.length) {
    for (let i = students.length; i < existingRows.length; i++) {
      existingRows[i].remove();
    }
  }
}
