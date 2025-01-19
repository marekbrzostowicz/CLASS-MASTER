document.addEventListener("DOMContentLoaded", () => {
  fetchPDF();
});

document.getElementById("question-range").addEventListener("input", (event) => {
  const rangeValue = event.target.value;
  document.getElementById("range-value").textContent = rangeValue; // Aktualizuje wartość w elemencie span
});

let idCounter = 0;

function reset() {
  const div = (document.getElementById("all-questions").innerHTML = "");
}

function questions() {
  const numberQuestions = document.getElementById("question-range").value;

  // document.getElementById('question-number').value=''

  const questionsWrapper = document.getElementById("all-questions"); //DIV Z HTML NA WSZYSTKIE DIVY Z PYTANIAMI

  for (let i = 0; i < parseInt(numberQuestions, 10); i++) {
    const questionDiv = document.createElement("div"); //DIV NA WSZYSTKIE INPUTY WSTEPNE
    questionDiv.id = "question-div";
    questionDiv.dataset.id = idCounter;
    idCounter++;

    //=======TEKST=============================
    const title = document.createElement("h2");
    title.classList.add("question-title");
    title.textContent = `PYTANIE ${i + 1}`;

    const desciprion = document.createElement("h3");
    desciprion.textContent = "Podaj tresc pytania";

    const points = document.createElement("h3");
    points.textContent = "Podaj licze punktow za pytanie";

    //=======PRZYCISKI==========================
    const openQuestionButton = document.createElement("button");
    openQuestionButton.classList.add("type-button");
    openQuestionButton.textContent = "pytanie otwarte";

    const abcQuestionButton = document.createElement("button");
    abcQuestionButton.textContent = "abc";
    abcQuestionButton.classList.add("type-button");

    const trueFalseQuestionButton = document.createElement("button");
    trueFalseQuestionButton.classList.add("type-button");
    trueFalseQuestionButton.textContent = "prawda falsz";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "USUN";

    openQuestionButton.onclick = (event) =>
      addOpenQuestion(event.target.parentNode);
    abcQuestionButton.onclick = (event) =>
      addAbcQuestion(event.target.parentNode);
    trueFalseQuestionButton.onclick = (event) =>
      addTrueFalseQuestion(event.target.parentNode);
    deleteButton.onclick = (event) => deleteQuestion(event.target.parentNode);

    //=======INPUTY==========================
    const questionTextInput = document.createElement("input"); //input z trescia pytania
    questionTextInput.id = "question-text";
    const pointsInput = document.createElement("input"); // input z liczba punktow
    pointsInput.id = "points-input";

    pointsInput.placeholder = "Podaj liczbe punktor za pytanie";

    questionDiv.appendChild(title);
    questionDiv.appendChild(desciprion);
    questionDiv.appendChild(questionTextInput);
    questionDiv.appendChild(points);
    questionDiv.appendChild(pointsInput);

    questionDiv.appendChild(openQuestionButton);
    questionDiv.appendChild(abcQuestionButton);
    questionDiv.appendChild(trueFalseQuestionButton);

    questionDiv.appendChild(deleteButton);

    questionsWrapper.appendChild(questionDiv);
  }
}

//FUNKCJA PYTANIE OTWARTE-------------------------------------------------------------------------------------
function addOpenQuestion(parentDiv) {
  const input = document.createElement("input");
  input.classList.add("lines-number");
  input.placeholder = "Podaj liczbe linii na odpowiedz";
  parentDiv.appendChild(input);
}

//FUNKCJA PYTANIE ABC------------------------------------------------------------------------------------------
function addAbcQuestion(parentDiv) {
  const div = document.createElement("div");

  const input = document.createElement("input");
  input.placeholder = "Podaj liczbe mozliwych odpowiedzi";
  div.appendChild(input);
  const button = document.createElement("button");
  button.textContent = "->";
  div.appendChild(button);

  button.onclick = () => {
    if (parseInt(input.value, 10) > 6) {
      alert("Max 6");
    } else {
      for (let i = 0; i < parseInt(input.value, 10); i++) {
        const input = document.createElement("input");
        input.classList.add("abc-input");
        input.placeholder = `Pytanie ${i + 1}`;
        div.appendChild(input);
      }
    }
  };
  parentDiv.appendChild(div);
}

function addTrueFalseQuestion(parentDiv) {}

function addPoints(parentDiv) {
  const input = document.createElement("input");
  input.placeholder = "Podaj liczbe punktow za pytania";
  parentDiv.appendChild(input);
}

//ROBIENIE STRUKTURY DO WYSLANIA----------------------------------------------
function getValues() {
  const div = document.getElementById("all-questions");
  const questionDivs = div.querySelectorAll("#question-div");
  const data = { o: [], a: [], t: [] }; 

  questionDivs.forEach((questionDiv) => {
    const order = parseInt(questionDiv.dataset.id, 10); 
    const title = questionDiv.querySelector("#question-text").value; 
    const points = parseInt(
      questionDiv.querySelector("#points-input").value,
      10
    ); // Liczba punktów

    // Sprawdź typ pytania
    const linesNumber = questionDiv.querySelector(".lines-number"); // Pytanie otwarte
    if (linesNumber) {
      data.o.push({
        question: title,
        points: points,
        lines: parseInt(linesNumber.value, 10),
        order: order,
      });
    }

    const abcOptions = questionDiv.querySelectorAll(".abc-input");
    if (abcOptions.length > 0) {
      const options = [];
      abcOptions.forEach((option) => options.push(option.value));
      data.a.push({
        question: title,
        points: points,
        options: options,
        order: order,
      });
    }

    if (!linesNumber && abcOptions.length === 0) {
      data.t.push({
        question: title,
        points: points,
        order: order,
      });
    }
  });

  console.log(data);
  return data;
}

function deleteQuestion(parentDiv) {
  const div = document.getElementById("all-questions");

  div.removeChild(parentDiv);
  updateQuestionNumber();
}

function updateQuestionNumber() {
  const questionWrapper = document.getElementById("all-questions");
  const titles = questionWrapper.querySelectorAll(".question-title");

  titles.forEach((title, index) => {
    title.textContent = `Pytanie ${index + 1}`;
  });
}

function dataTransformation(data) {
  const transformedData = {
    o: data.o.sort((a, b) => a.order - b.order),
    a: data.a.sort((a, b) => a.order - b.order),
    t: data.t.sort((a, b) => a.order - b.order),
  };

  console.log("Transformed Data: ", transformedData);

  return transformedData;
}
