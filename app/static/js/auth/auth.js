function addUser() {
  const email = document.getElementById("email").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const password2 = document.getElementById("confirm-password").value;

  const userData = {
    email: email,
    first_name: username,
    password: password,
    password2: password2,
  };

  if (!email || !username || !password || !password2) {
    alert("All fields must be filled");
    return;
  }
  if (password !== password2) {
    alert("Passwords do not match");
    return;
  }
  if (password.length < 5) {
    alert("Password must be at least 5 characters long");
    return;
  }

  fetch(`/api/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          alert(`Error: ${data.message}`);
          throw new Error(data.message);
        });
      }
      return response.json();
    })
    .then((data) => {
      alert("User registered successfully!");
      console.log(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function login() {
  console.log("Logowanie...");

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const data = {
    email: email,
    password: password,
  };

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.error || "Wystąpił błąd podczas logowania");
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Odpowiedź serwera:", data);
      if (data.redirect) {
        window.location.href = data.redirect;
      }
    })
    .catch((error) => {
      console.error("Wystąpił błąd:", error.message);
      alert(error.message);
    });
}

function logout() {
  fetch("/logout", {
    method: "POST",
    headers: {
      "Conteny-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to log out");
      }
      return response.json();
    })
    .then((data) => {
      if (data.redirect) {
        window.location.href = data.redirect;
      }
    })
    .catch((error) => {
      alert("Failed to log out. Please try again");
    });
}

// function add() {
//     const name = document.getElementById("name").value

//     fetch(`api/classes`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//             name:name
//         })
//     })

// }
