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
    alert("Questions already exist! Reset the form to add new ones.");
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
    <h2 class="question-title">QUESTION ${index + 1}</h2>
    <input type="text" placeholder="Enter question" id="question-text" autocomplete="off">
    <div id="points-div">
      <h3>NUMBER OF POINTS</h3>
      <input type="number" id="points-input" min="1">
    </div>
    <h3>TYPE</h3>
    <div id="type-div">
      <button class="type-button" onclick="addOpenQuestion(this.parentNode.parentNode)">Open question</button>
      <button class="type-button" onclick="addAbcQuestion(this.parentNode.parentNode)">ABC</button>
      <button class="type-button" onclick="addTrueFalseQuestion(this.parentNode.parentNode)">True/False</button>
    </div>
    <button onclick="deleteQuestion(this.parentNode)" class="delete-button">DELETE</button>
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
  input.placeholder = "Enter number of lines for answer";
  parentDiv.appendChild(input);
}

function addAbcQuestion(parentDiv) {
  clearExistingTypeElements(parentDiv);
  parentDiv.dataset.type = "a";
  const container = document.createElement("div");
  container.classList.add("type-specific");
  const numberInput = document.createElement("input");
  numberInput.placeholder = "Enter number of options (1-6)";
  numberInput.type = "number";
  numberInput.min = "1";
  numberInput.max = "6";

  const button = document.createElement("button");
  button.textContent = "Enter";
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
    alert("The number of options must be between 1 and 6");
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
    input.placeholder = `Option ${String.fromCharCode(65 + i)}`;
    input.classList.add("abc-input");
    container.appendChild(input);
  }
  parentDiv.appendChild(container);
}

function validateQuestions() {
  const questionDivs = document.querySelectorAll("#question-div");
  if (questionDivs.length === 0) {
    alert("Add at least one question.");
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
      alert(`Question ${index + 1}: The question text is required.`);
      questionDiv.querySelector("#question-text").classList.add("invalid");
      isValid = false;
    }

    if (!points || isNaN(points) || parseInt(points) <= 0) {
      alert(
        `Question ${
          index + 1
        }: Please enter a valid number of points (greater than 0).`
      );
      questionDiv.querySelector("#points-input").classList.add("invalid");
      isValid = false;
    }

    if (!type) {
      alert(`Question ${index + 1}: Select a question type.`);
      questionDiv.querySelector("#type-div").classList.add("invalid-border");
      isValid = false;
    }

    if (type === "o") {
      const lines = questionDiv.querySelector(".lines-number")?.value;
      if (!lines || isNaN(lines) || parseInt(lines) <= 0) {
        alert(
          `Question ${
            index + 1
          }: Please enter a valid number of lines (greater than 0).`
        );
        questionDiv.querySelector(".lines-number")?.classList.add("invalid");
        isValid = false;
      }
    } else if (type === "a") {
      const abcOptions = questionDiv.querySelectorAll(".abc-input");
      if (abcOptions.length === 0) {
        alert(`Question ${index + 1}: Generate ABC answer options.`);
        isValid = false;
      } else {
        abcOptions.forEach((option, optionIndex) => {
          if (!option.value.trim()) {
            alert(
              `Question ${index + 1}: Option ${String.fromCharCode(
                65 + optionIndex
              )} in the ABC question is empty.`
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
    alert("Enter test title.");
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
      throw new Error(errorData.error || "Server error");
    }

    const result = await response.json();
    alert(result.success);
    fetchPDF();
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert(`An error occurred: ${error.message}`);
  }
}

async function fetchPDF() {
  try {
    const response = await fetch("/api/get_all_pdf", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`Error: ${response.statusText}`);

    const pdfData = await response.json();
    const pdfDiv = document.getElementById("pdf-div");
    pdfDiv.innerHTML = "<h3>PDFs</h3><ul id='pdf-list'></ul>";

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
    console.error("Error fetching PDF list:", error);
    alert("Failed to fetch the PDF list.");
  }
}

async function deletePDF(filename) {
  if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

  try {
    const response = await fetch(`/api/delete_pdf/${filename}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Server error");
    }

    fetchPDF();
  } catch (error) {
    console.error("Error deleting PDF:", error);
    alert(`An error occurred while deleting: ${error.message}`);
  }
}

function deleteQuestion(parentDiv) {
  parentDiv.remove();
  updateQuestionNumbers();
}

function updateQuestionNumbers() {
  document.querySelectorAll(".question-title").forEach((title, index) => {
    title.textContent = `QUESTION ${index + 1}`;
  });
}

document.addEventListener("input", (e) => {
  if (e.target.classList.contains("invalid")) {
    e.target.classList.remove("invalid");
  }
});
