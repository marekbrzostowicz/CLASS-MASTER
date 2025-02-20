import { updateClassData, deleteClass, fetchClasses } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const classes = await fetchClasses();
  showClasses(classes);
});

document.addEventListener("DOMContentLoaded", () => {
  const addButton = document.getElementById("add-class");
  if (addButton) {
    addButton.addEventListener("click", () => {
      showIcons("add");
    });
  }
  const icons = document.querySelectorAll("#icon-modal .class-icon");
  console.log(icons);
  icons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const iconName = icon.getAttribute("data-icon");
      showSave(iconName);
    });
  });
});

function showSave(iconName) {
  selectedIcon = iconName;
}

document.addEventListener("click", (event) => {
  const field = document.getElementById("class-input");
  const bin = document.getElementById("bin");

  if (
    field.style.display === "block" &&
    !field.contains(event.target) &&
    !event.target.closest(".options")
  ) {
    hideIcons();
  }

  if (isBinShown(bin) && !bin.contains(event.target)) {
    hideBin(bin);
  }
});

document.addEventListener("keydown", (event) => {
  const bin = document.getElementById("bin");
  if (event.key === "Escape") {
    hideIcons();

    bin.classList.remove("bin-shown");
    bin.classList.add("bin-hidden");
  }
});

function showIcons(mode) {
  const field = document.getElementById("class-input");
  const bin = document.getElementById("bin");
  const button = document.getElementById("save-button");

  if (mode === "add") {
    button.textContent = "SAVE";
  } else {
    button.textContent = "UPTADE";
  }

  if (field.style.display === "none" || !field.style.display) {
    field.style.display = "block";
    hideBin(bin);
  } else {
    field.style.display = "none";
  }

  button.onclick = async () => {
    const nameInput = document.getElementById("name");
    const name = nameInput.value.trim();
    console.log(name);
    const icon = selectedIcon;
    console.log(icon);

    if (mode === "add") {
      addClass();
    } else {
      const classId = bin.dataset.classId;
      const changes = {};

      if (name.length > 60) {
        alert("Too many letters. Max 60");
        restartClassInput();
        return;
      }

      if (name) {
        changes.name = name;
      }

      if (icon) {
        changes.icon = icon;
      }
      if (Object.keys(changes).length.length === 0) {
        alert("No changes detected.");
        return;
      }

      await updateClassData(classId, changes);
      const classes = await fetchClasses();
      showClasses(classes);
      hideIcons();
      nameInput.value = "";
    }
  };
}

function hideIcons() {
  const field = document.getElementById("class-input");
  field.style.display = "none";
}

let selectedIcon = null; // zmienna globalna ---------------------------

async function addClass() {
  const name = document.getElementById("name").value.trim();

  if (!selectedIcon && !name) {
    alert("Wpisz nazwę klasy i wybierz ikonę");
  } else if (!name) {
    alert("Wpisz nazwę klasy");
  } else if (!selectedIcon) {
    alert("Wybierz ikonę");
  } else if (name.length > 60) {
    alert("Too many letters. Max 60");
    restartClassInput();
    return;
  } else {
    fetch(`api/classes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        icon: selectedIcon,
      }),
    });

    const classes = await fetchClasses();
    showClasses(classes);
    restartClassInput();
    hideIcons();
  }
}

function showClasses(classes) {
  const container = document.getElementById("class-container");
  container.innerHTML = "";

  classes.forEach((obj, index) => {
    const classWrapper = createClassElement(obj, index);
    container.appendChild(classWrapper);
  });
}

function createClassElement(obj, index) {
  const classWrapper = document.createElement("div");
  const bin = document.getElementById("bin");
  const confirmation = document.getElementById("delete-confirmation");

  classWrapper.classList.add("class-wrapper");

  classWrapper.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (confirmation.style.display === "block") {
      return;
    }
    showBin(bin, event.clientX, event.clientY);
    bin.dataset.classId = obj.id;
  });

  classWrapper.addEventListener("click", (event) => {
    const bin = document.getElementById("bin");
    const field = document.getElementById("class-input");

    if (isBinShown(bin)) {
      hideBin(bin);
      return;
    }

    if (field.style.display === "block") {
      hideIcons();
      return;
    }

    window.location.href = `/class/${obj.id}`;
  });

  if (obj.name.length > 15) {
    classElement.style.fontSize = "15px";
    classElement.style.whiteSpace = "normal";
    classElement.style.wordWrap = "break-word";
  }

  const classIcon = document.createElement("div");
  classIcon.id = "classId";
  classIcon.innerHTML = `<i class="fas ${obj.icon} class-icon"></i>`;
  classIcon.style.fontSize = "45px";

  const classElement = document.createElement("div");
  classElement.textContent = `${obj.name}`;

  classWrapper.appendChild(classIcon);
  classWrapper.appendChild(classElement);

  return classWrapper;
}

function restartClassInput() {
  document.getElementById("name").value = "";
  selectedIcon = null;
}

function showBin(bin, x, y) {
  bin.style.left = x - 65 + "px";
  bin.style.top = y + "px";
  bin.classList.remove("bin-hidden");
  bin.classList.add("bin-shown");
}

function hideBin(bin) {
  bin.classList.remove("bin-shown");
  bin.classList.add("bin-hidden");
}

function isBinShown(bin) {
  return bin.classList.contains("bin-shown");
}

document.addEventListener("DOMContentLoaded", () => {
  const trashIcon = document.querySelector(".fa-trash-alt");
  const yesButton = document.getElementById("yes-confirm");
  const noButton = document.getElementById("no-confirm");
  const bin = document.getElementById("bin");
  const confirmation = document.getElementById("delete-confirmation");
  const information = document.getElementById("information-icon");
  const informationDiv = document.getElementById("information");

  const rotateIcon = document.querySelector(".fa-rotate");

  if (rotateIcon) {
    rotateIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      showIcons("_");
    });
  }

  if (information) {
    information.addEventListener("mouseenter", () => {
      informationDiv.style.display = "block";
    });
  }
  information.addEventListener("mouseleave", () => {
    informationDiv.style.display = "none";
  });
  if (trashIcon) {
    trashIcon.addEventListener("click", () => {
      const classIdToDelete = bin.dataset.classId;
      if (!classIdToDelete) {
        console.warn("No class ID stored in bin");
        return;
      }
      showDeleteConfirm();
    });
  }

  if (yesButton) {
    yesButton.addEventListener("click", async () => {
      const classIdToDelete = bin.dataset.classId;
      if (!classIdToDelete) {
        console.warn("No class ID to delete");
        return;
      }

      await deleteClass(classIdToDelete);
      const classes = await fetchClasses();
      showClasses(classes);
      hideBin(bin);
      confirmation.style.display = "none";
    });
  }

  if (noButton) {
    noButton.addEventListener("click", () => {
      confirmation.style.display = "none";
    });
  }
});

///--------------------------------------------------------------
function showDeleteConfirm() {
  const confirmation = document.getElementById("delete-confirmation");
  if (confirmation) {
    confirmation.style.display = "block";

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
  }

  function handleEscape(event) {
    if (event.key === "Escape") {
      confirmation.style.display = "none";
      cleanupListeners();
    }
  }

  function handleOutsideClick(event) {
    if (
      !confirmation.contains(event.target) &&
      !event.target.closest(".fa-trash-alt")
    ) {
      confirmation.style.display = "none";
      cleanupListeners();
    }
  }

  function cleanupListeners() {
    document.removeEventListener("keydown", handleEscape);
    document.removeEventListener("click", handleOutsideClick);
  }
}
