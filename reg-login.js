document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("form");
  
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const email = document.querySelector("#email").value;
      const password = document.querySelector("#password").value;
  
      // Ensure email and password are provided
      if (!email || !password) {
        alert("Both email and password are required.");
        return;
      }
  
      // Create an object to send to the backend
      const userCredentials = {
        Email: email,
        Password: password,
      };
  
      // Make the POST request to login
      fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userCredentials),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            // Handle successful login
            alert(data.message);
            window.location.href = "/dashboard"; // Redirect to a dashboard or another page
          } else {
            alert("Invalid email or password.");
          }
        })
        .catch((error) => {
          console.error("Error logging in:", error);
          alert("An error occurred. Please try again.");
        });
    });
  });
  