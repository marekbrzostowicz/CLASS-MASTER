async function sendDataAndDownloadPDF() {
  try {

    const data = getValues();
    const transformedData = dataTransformation(data);
    const div = document.getElementById("pdf-div");

    // const title = "Test PDF";
    const title = document.getElementById("title-input").value;

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

    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'C:\Users\Pan Marek\OneDrive\Pulpit\EDU-SPARK\generated_test.pdf';
    // document.body.appendChild(a);
    // a.click();
    // a.remove();
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
      icon.style.marginRight = '5px';


      link.href = `/${pdf.filepath}`;
      link.textContent = pdf.filename;
      link.target = "_blank";
      listItem.appendChild(icon)
      listItem.appendChild(link);
      div.appendChild(listItem);
    });
  } catch (error) {
    console.error("Failed to fetch pdf data", error);
  }
}
