document.addEventListener("DOMContentLoaded", () => {
  fetchPDF();
});

document.getElementById("question-range").addEventListener("input", (event) => {
  const rangeValue = event.target.value;
  document.getElementById("range-value").textContent = rangeValue;
});

let idCounter = 0;

function reset() {
  document.getElementById("all-questions").innerHTML = "";
  document.getElementById("title-input").value = "";
}

function questions() {
  const questionsWrapper = document.getElementById("all-questions");
  if (questionsWrapper.children.length > 0) {
    alert("Pytania już istnieją! Zresetuj formularz, aby dodać nowe.");
    return;
  }

  const numberQuestions = document.getElementById("question-range").value;
  for (let i = 0; i < parseInt(numberQuestions, 10); i++) {
    createQuestionElement(i);
  }
}

function createQuestionElement(index) {
  const questionsWrapper = document.getElementById("all-questions");
  const questionDiv = document.createElement("div");
  questionDiv.id = "question-div";
  questionDiv.dataset.id = idCounter++;

  questionDiv.innerHTML = `
    <h2 class="question-title">PYTANIE ${index + 1}</h2>
    <input type="text" placeholder="Wpisz pytanie" id="question-text" autocomplete="off">
    <div id="points-div">
      <h3>LICZBA PUNKTÓW</h3>
      <input type="number" id="points-input" min="1">
    </div>
    <h3>TYP</h3>
    <div id="type-div">
      <button class="type-button" onclick="addOpenQuestion(this.parentNode.parentNode)">Pytanie otwarte</button>
      <button class="type-button" onclick="addAbcQuestion(this.parentNode.parentNode)">ABC</button>
      <button class="type-button" onclick="addTrueFalseQuestion(this.parentNode.parentNode)">Prawda/Fałsz</button>
    </div>
    <button onclick="deleteQuestion(this.parentNode)" class="delete-button">USUŃ</button>
  `;
  questionsWrapper.appendChild(questionDiv);
}

function addOpenQuestion(parentDiv) {
  clearExistingTypeElements(parentDiv);
  parentDiv.dataset.type = "o";
  const input = document.createElement("input");
  input.classList.add("lines-number", "type-specific");
  input.type = "number";
  input.min = "1";
  input.placeholder = "Podaj liczbę linii na odpowiedź";
  parentDiv.appendChild(input);
}

function addAbcQuestion(parentDiv) {
  clearExistingTypeElements(parentDiv);
  parentDiv.dataset.type = "a";
  const container = document.createElement("div");
  container.classList.add("type-specific");
  const numberInput = document.createElement("input");
  numberInput.placeholder = "Podaj liczbę opcji (1-6)";
  numberInput.type = "number";
  numberInput.min = "1";
  numberInput.max = "6";

  const button = document.createElement("button");
  button.textContent = "Generuj opcje";
  button.onclick = () => generateABCInputs(parentDiv, numberInput.value);

  container.append(numberInput, button);
  parentDiv.appendChild(container);
}

function addTrueFalseQuestion(parentDiv) {
  clearExistingTypeElements(parentDiv);
  parentDiv.dataset.type = "t";
}

function clearExistingTypeElements(parentDiv) {
  parentDiv.querySelectorAll(".type-specific").forEach((el) => el.remove());
}

function generateABCInputs(parentDiv, number) {
  const num = parseInt(number, 10);
  if (isNaN(num) || num < 1 || num > 6) {
    alert("Liczba opcji musi być między 1 a 6");
    return;
  }

  const existingContainer = parentDiv.querySelector(".abc-container");
  if (existingContainer) {
    existingContainer.remove();
  }

  const container = document.createElement("div");
  container.classList.add("abc-container", "type-specific");
  for (let i = 0; i < num; i++) {
    const input = document.createElement("input");
    input.placeholder = `Opcja ${String.fromCharCode(65 + i)}`;
    input.classList.add("abc-input");
    container.appendChild(input);
  }
  parentDiv.appendChild(container);
}

function validateQuestions() {
  const questionDivs = document.querySelectorAll("#question-div");
  if (questionDivs.length === 0) {
    alert("Dodaj przynajmniej jedno pytanie.");
    return false;
  }

  let isValid = true;
  questionDivs.forEach((questionDiv, index) => {
    const questionText = questionDiv
      .querySelector("#question-text")
      .value.trim();
    const points = questionDiv.querySelector("#points-input").value.trim();
    const type = questionDiv.dataset.type;

    if (!questionText) {
      alert(`Pytanie ${index + 1}: Treść pytania jest wymagana.`);
      questionDiv.querySelector("#question-text").classList.add("invalid");
      isValid = false;
    }

    if (!points || isNaN(points) || parseInt(points) <= 0) {
      alert(
        `Pytanie ${index + 1}: Podaj poprawną liczbę punktów (większą od 0).`
      );
      questionDiv.querySelector("#points-input").classList.add("invalid");
      isValid = false;
    }

    if (!type) {
      alert(`Pytanie ${index + 1}: Wybierz typ pytania.`);
      questionDiv.querySelector("#type-div").classList.add("invalid-border");
      isValid = false;
    }

    if (type === "o") {
      const lines = questionDiv.querySelector(".lines-number")?.value;
      if (!lines || isNaN(lines) || parseInt(lines) <= 0) {
        alert(
          `Pytanie ${index + 1}: Podaj poprawną liczbę linii (większą od 0).`
        );
        questionDiv.querySelector(".lines-number")?.classList.add("invalid");
        isValid = false;
      }
    } else if (type === "a") {
      const abcOptions = questionDiv.querySelectorAll(".abc-input");
      if (abcOptions.length === 0) {
        alert(`Pytanie ${index + 1}: Wygeneruj opcje odpowiedzi ABC.`);
        isValid = false;
      } else {
        abcOptions.forEach((option, optionIndex) => {
          if (!option.value.trim()) {
            alert(
              `Pytanie ${index + 1}: Opcja ${String.fromCharCode(
                65 + optionIndex
              )} w pytaniu ABC jest pusta.`
            );
            option.classList.add("invalid");
            isValid = false;
          }
        });
      }
    }
  });
  return isValid;
}

function getValues() {
  const questions = [];
  document.querySelectorAll("#question-div").forEach((questionDiv, index) => {
    const questionData = {
      question: questionDiv.querySelector("#question-text").value.trim(),
      points: parseInt(questionDiv.querySelector("#points-input").value),
      type: questionDiv.dataset.type,
      order: index + 1,
    };

    if (questionData.type === "o") {
      questionData.lines = parseInt(
        questionDiv.querySelector(".lines-number").value
      );
    } else if (questionData.type === "a") {
      questionData.options = [
        ...questionDiv.querySelectorAll(".abc-input"),
      ].map((input) => input.value.trim());
    }
    questions.push(questionData);
  });
  return questions;
}

function dataTransformation(data) {
  return {
    o: data
      .filter((q) => q.type === "o")
      .map((q) => ({
        question: q.question,
        points: q.points,
        lines: q.lines,
        order: q.order,
      })),
    a: data
      .filter((q) => q.type === "a")
      .map((q) => ({
        question: q.question,
        points: q.points,
        options: q.options,
        order: q.order,
      })),
    t: data
      .filter((q) => q.type === "t")
      .map((q) => ({ question: q.question, points: q.points, order: q.order })),
  };
}

async function sendDataAndDownloadPDF() {
  if (!validateQuestions()) return;

  const title = document.getElementById("title-input").value.trim();
  if (!title) {
    alert("Wpisz tytuł testu.");
    document.getElementById("title-input").classList.add("invalid");
    return;
  }

  const data = getValues();
  const transformedData = dataTransformation(data);

  try {
    const response = await fetch("/api/generate_pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, questions_data: transformedData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Błąd serwera");
    }

    const result = await response.json();
    alert(result.success); 
    fetchPDF(); 
  } catch (error) {
    console.error("Błąd generowania PDF:", error);
    alert(`Wystąpił błąd: ${error.message}`);
  }
}

async function fetchPDF() {
  try {
    const response = await fetch("/api/get_all_pdf", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`Błąd: ${response.statusText}`);

    const pdfData = await response.json();
    const pdfDiv = document.getElementById("pdf-div");
    pdfDiv.innerHTML = "<h3>Wygenerowane PDF-y</h3><ul id='pdf-list'></ul>";

    const pdfList = document.getElementById("pdf-list");
    pdfData.forEach((pdf) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <i class="fas fa-file-pdf" style="margin-right: 5px;"></i>
        <a href="/${pdf.filepath}" target="_blank">${pdf.filename}</a>
        <i class="fas fa-trash delete-pdf" data-pdf="${pdf.filename}" style="display: none; cursor: pointer; margin-left: 10px; color: red;"></i>
      `;
      listItem.addEventListener(
        "mouseenter",
        () => (listItem.querySelector(".delete-pdf").style.display = "inline")
      );
      listItem.addEventListener(
        "mouseleave",
        () => (listItem.querySelector(".delete-pdf").style.display = "none")
      );
      listItem
        .querySelector(".delete-pdf")
        .addEventListener("click", () => deletePDF(pdf.filename));
      pdfList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Błąd pobierania listy PDF-ów:", error);
    alert("Nie udało się pobrać listy PDF-ów.");
  }
}

async function deletePDF(filename) {
  if (!confirm(`Czy na pewno chcesz usunąć ${filename}?`)) return;

  try {
    const response = await fetch(`/api/delete_pdf/${filename}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Błąd serwera");
    }

    fetchPDF();
  } catch (error) {
    console.error("Błąd usuwania PDF:", error);
    alert(`Wystąpił błąd podczas usuwania: ${error.message}`);
  }
}

function deleteQuestion(parentDiv) {
  parentDiv.remove();
  updateQuestionNumbers();
}

function updateQuestionNumbers() {
  document.querySelectorAll(".question-title").forEach((title, index) => {
    title.textContent = `PYTANIE ${index + 1}`;
  });
}

document.addEventListener("input", (e) => {
  if (e.target.classList.contains("invalid")) {
    e.target.classList.remove("invalid");
  }
});
