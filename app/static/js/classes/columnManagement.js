import { getClassIdFromUrl } from "./studentManagement.js";
import { showStudents } from "./studentManagement.js";
import { displayPopupImage } from "./chartManagement.js";
import { createTable, fetchColumnId } from "./average.js";

//Pobieranie kolumn
export async function fetchColumns() {
  console.log("Fetching columns for class ID");
  try {
    const response = await fetch("/api/assesments", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const columns = await response.json();
    console.log("Fetched columns", columns);
    return columns;
  } catch (error) {
    console.error("Error fetching columns", error.message);
    return [];
  }
}

// Wysyłanie kolumny do backendu
export async function addColumnToBackend(classId, columnName) {
  try {
    const response = await fetch("/api/assesments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        column_name: columnName,
        class_id: classId,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add column name");
    }
    const result = await response.json();
    console.log("Column added succesfully", result);
    showStudents(classId);
  } catch (error) {
    console.error("Error adding new column", error.message);
  }
}

// Dodawanie kolumny
export function addGradesColumn() {
  const container = document.getElementById("grades-column");
  container.innerHTML = "";

  const columnInput = document.createElement("input");
  columnInput.id = "grades-input";
  columnInput.placeholder = "Wpisz nazwę kolumny";
  columnInput.style.marginRight = "10px";

  const addButton = document.createElement("button");
  addButton.textContent = "ADD";
  addButton.onclick = () => {
    const value = columnInput.value.trim();
    if (!value) {
      alert("Wpisz nazwę kolumny!");
      return;
    }
    addColumnToBackend(getClassIdFromUrl(), value);
    container.innerHTML = "";
  };

  container.appendChild(columnInput);
  container.appendChild(addButton);
}

export function addContextMenuListeners() {
  const headers = document.querySelectorAll("table th");
  const excludedHeaders = ["NAME", "LAST NAME", "EMAIL", "AVERAGE", "ID"];

  headers.forEach((header) => {
    if (excludedHeaders.includes(header.textContent.trim())) return;

    header.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      

      const columnId = header.dataset.columnId;
      console.log("Kliknięto na kolumnę:", columnId);
      

      // Usuń stare menu, jeśli istnieje
      let contextMenu = document.getElementById("context-menu");
      if (contextMenu) {
        contextMenu.remove();
      }

      // Tworzenie nowego menu kontekstowego
      contextMenu = document.createElement("div");
      contextMenu.id = "context-menu";
      contextMenu.classList.add("custom-context-menu");
      contextMenu.style.position = "absolute";
      contextMenu.style.left = `${event.clientX}px`;
      contextMenu.style.top = `${event.clientY}px`;
      contextMenu.style.display = "block";
      document.body.appendChild(contextMenu);

      // Zawartość menu kontekstowego
      contextMenu.innerHTML = `
        <p class="context-menu-title">Opcje dla kolumny: ${header.textContent.trim()}</p>
        <button class="context-menu-btn" id="edit-column">Edytuj</button>
        <button class="context-menu-btn" id="delete-column">Usuń</button>
        <button class="context-menu-btn" id="weight">Waga</button>
        <button class="context-menu-btn" id="chart">Wykres</button>
      `;

      // Obsługa przycisków w menu
      document.getElementById("edit-column").onclick = () => {
        console.log(`Edytowanie kolumny ${columnId}`);
        contextMenu.style.display = "none";
      };

      document.getElementById("delete-column").onclick = async () => {
        await deleteColum(columnId);
        await showStudents(getClassIdFromUrl()); // Odświeżenie tabeli
        console.log(`Usuwanie kolumny ${columnId}`);
        contextMenu.style.display = "none";
      };

      document.getElementById("weight").onclick = (event) => {
        console.log("Button 'waga' clicked!");

        // Usuń stare menu wag, jeśli istnieje
        let weightMenu = document.getElementById("weight-menu");
        if (weightMenu) {
          console.log("Removing old weight menu...");
          weightMenu.remove();
        }

        // Tworzenie nowego menu wag
        console.log("Creating weight menu...");
        weightMenu = document.createElement("div");
        weightMenu.id = "weight-menu";
        weightMenu.classList.add("custom-weight-menu");
        weightMenu.style.position = "absolute";
        weightMenu.style.left = `${event.clientX}px`;
        weightMenu.style.top = `${event.clientY}px`;
        weightMenu.style.display = "block";

        // Dodanie menu do DOM
        document.body.appendChild(weightMenu);
        console.log("Weight menu created and added to DOM");

        // Zatrzymaj propagację zdarzenia kliknięcia w menu
        weightMenu.addEventListener("click", (e) => e.stopPropagation());

        // Zawartość menu wag
        weightMenu.innerHTML = `
          <button class="weight-btn" data-weight="1">1</button>
          <button class="weight-btn" data-weight="2">2</button>
          <button class="weight-btn" data-weight="3">3</button>
          <button class="weight-btn" data-weight="4">4</button>
          <button class="weight-btn" data-weight="5">5</button>
        `;

        // Obsługa kliknięcia przycisków
        const weightButtons = weightMenu.querySelectorAll(".weight-btn");
        weightButtons.forEach((button) => {
          button.addEventListener("click", () => {
            const weight = button.dataset.weight;
            console.log(`Selected weight: ${weight}`);

            //TUTAJ !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            weightMenu.remove();
            contextMenu.remove();
            fetchWeight(weight, columnId);
            fetchColumnId(getClassIdFromUrl);
            createTable();
          });
        });

        // Zamykanie menu wag po kliknięciu poza nim
        const closeWeightMenu = (event) => {
          if (!weightMenu.contains(event.target)) {
            console.log("Closing weight menu");
            weightMenu.remove();
            document.removeEventListener("click", closeWeightMenu);
          }
        };

        document.addEventListener("click", closeWeightMenu);

        // Zatrzymaj propagację kliknięcia na przycisku "waga"
        event.stopPropagation();
      };

      document.getElementById("chart").onclick = async () => {
        console.log(`ID DO WYKRESU ${columnId}`);
        try {
          const response = await fetch(
            `/api/assesments/img?colId=${encodeURIComponent(columnId)}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const imageBlob = await response.blob();
          console.log(imageBlob);
          const imageURL = URL.createObjectURL(imageBlob);

          displayPopupImage(imageURL, "test");
        } catch (error) {
          console.error("Error sending column id", error.message);
        }
      };

      // Zamykanie menu kontekstowego po kliknięciu poza nim
      const closeContextMenu = (event) => {
        if (!contextMenu.contains(event.target)) {
          contextMenu.remove();
          document.removeEventListener("click", closeContextMenu);
        }
      };

      document.addEventListener("click", closeContextMenu);
    });
  });
}

async function deleteColum(columnId) {
  try {
    const response = await fetch(
      `/api/students?column_id=${encodeURIComponent(columnId)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    console.log(`Column ${columnId} deleted successfully`);
  } catch (error) {
    console.error("Error deleting column:", error.message);
  }
}

async function fetchWeight(weight, columnId) {
  try {
    const response = await fetch(
      `/api/assesments?weight=${encodeURIComponent(
        weight
      )}&column_id=${encodeURIComponent(columnId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    // displayPopupImage()
  } catch (error) {
    console.error("Error updating waight", error.message);
  }
}
