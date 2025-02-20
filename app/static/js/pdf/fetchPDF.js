function validateQuestions() {
  const questionDivs = document.querySelectorAll("#question-div");
  let isValid = true;

  questionDivs.forEach((questionDiv, index) => {
    const questionText = questionDiv
      .querySelector("#question-text")
      .value.trim();
    const points = questionDiv.querySelector("#points-input").value.trim();

    if (!questionText || !points) {
      alert(
        `Pytanie ${index + 1}: Treść pytania i liczba punktów są wymagane.`
      );
      isValid = false;
      return;
    }

    const linesNumber = questionDiv.querySelector(".lines-number");
    const abcOptions = questionDiv.querySelectorAll(".abc-input");
    const trueFalseOptions = questionDiv.querySelector(".true-false-input");

    if (!linesNumber && abcOptions.length === 0 && !trueFalseOptions) {
      alert(
        `Pytanie ${
          index + 1
        }: Wybierz typ pytania (otwarte, ABC lub prawda/fałsz).`
      );
      isValid = false;
      return;
    }

    if (abcOptions.length > 0) {
      abcOptions.forEach((option, optionIndex) => {
        if (!option.value.trim()) {
          alert(
            `Pytanie ${index + 1}: Opcja ${
              optionIndex + 1
            } w pytaniu ABC jest pusta.`
          );
          isValid = false;
          return;
        }
      });
    }
  });

  return isValid;
}

async function sendDataAndDownloadPDF() {
  try {
    if (!validateQuestions()) {
      return;
    }

    const data = getValues();
    const transformedData = dataTransformation(data);
    const div = document.getElementById("pdf-div");

    // const title = "Test PDF";
    const title = document.getElementById("title-input").value;
    if (title === "") {
      alert("Enter title");
      return;
    }

    console.log("Title sent to Flask:", title);
    console.log("Data sent to Flask:", transformedData);

    const response = await fetch("/api/generate_pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        questions_data: transformedData,
      }),
    });
    div.innerHTML = "";
    fetchPDF();

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error generating or downloading PDF:", error);
  }
}

async function fetchPDF() {
  try {
    const response = await fetch("/api/get_all_pdf", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const pdfData = await response.json();
    console.log(pdfData);

    const div = document.getElementById("pdf-div");

    pdfData.forEach((pdf) => {
      const link = document.createElement("a");
      const listItem = document.createElement("li");
      const icon = document.createElement("i");
      icon.className = "fas fa-file-pdf";
      icon.style.marginRight = "5px";

      link.href = `/${pdf.filepath}`;
      link.textContent = pdf.filename;
      link.target = "_blank";
      listItem.appendChild(icon);
      listItem.appendChild(link);
      div.appendChild(listItem);
    });
  } catch (error) {
    console.error("Failed to fetch pdf data", error);
  }
}
