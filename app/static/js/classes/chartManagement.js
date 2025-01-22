export function getAllStudentGrades(studentId) {
  const studentRowMap = window.studentRowMap || {};
  const row = studentRowMap[studentId];
  let gradesArray = [];

  Array.from(row.cells).forEach((cell, index) => {
    console.log(`Cell ${index}:`, cell.textContent);
    if (index > 3) {
      gradesArray.push({ grade: cell.textContent });
    }
  });

  const filtetedArray = gradesArray.filter((element) => element.grade !== "");
  console.log(`======= TABLICA ==== ${filtetedArray}`);
  return filtetedArray;
  //==========zamienic pozniej cos????========!!!!!NWM
}

export async function fetchGradesForCharts(studentId) {
  const allGrades = getAllStudentGrades(studentId);
  const row = studentRowMap[studentId];
  const firstName = row.cells[1].textContent;
  const lastName = row.cells[2].textContent;
  const fullName = `${firstName} ${lastName}`;

  try {
    const response = await fetch("/api/charts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grades: allGrades, name: fullName }),
    });

    if (!response.ok) {
      throw new Error("Failed to send grades");
    }

    const imageBlob = await response.blob();
    const imgUrl = URL.createObjectURL(imageBlob);

    displayPopupImage(imgUrl, fullName);
  } catch (error) {
    console.error("Error sending grades", error.message);
  }
}

export function displayPopupImage(imgUrl, fullName) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  overlay.style.zIndex = "1000";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";

  const container = document.createElement("div");
  container.style.position = "relative";
  container.style.textAlign = "center";

  const imgElement = document.createElement("img");
  imgElement.src = imgUrl;
  imgElement.alt = `Wykres studenta: ${fullName}`;
  imgElement.style.maxWidth = "80%";
  imgElement.style.maxHeight = "80%";
  container.appendChild(imgElement);

  const closeButton = document.createElement("button");
  closeButton.textContent = "X";
  closeButton.style.position = "absolute";
  closeButton.style.top = "10px";
  closeButton.style.right = "10px";
  closeButton.style.backgroundColor = "red";
  closeButton.style.color = "white";
  closeButton.style.border = "none";
  closeButton.style.padding = "10px 15px";
  closeButton.style.cursor = "pointer";
  closeButton.style.fontSize = "16px";
  closeButton.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });
  container.appendChild(closeButton);

  const downloadButton = document.createElement("a");
  downloadButton.href = imgUrl;
  downloadButton.download = `Wykres_${fullName}.png`;
  downloadButton.textContent = "Pobierz";
  downloadButton.style.position = "absolute";
  downloadButton.style.bottom = "-35px";
  downloadButton.style.left = "50%";
  downloadButton.style.transform = "translateX(-50%)";
  downloadButton.style.backgroundColor = "green";
  downloadButton.style.color = "white";
  downloadButton.style.textDecoration = "none";
  downloadButton.style.padding = "10px 15px";
  downloadButton.style.cursor = "pointer";
  downloadButton.style.fontSize = "16px";
  container.appendChild(downloadButton);

  overlay.appendChild(container);

  document.body.appendChild(overlay);
}
