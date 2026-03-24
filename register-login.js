document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const showRegisterForm = document.getElementById("show-register-form");
  const showLoginForm = document.getElementById("show-login-form");

  // Dummy credentials
  const dummyUser = {
    username: "testuser",
    password: "123456",
  };

  // Show the Register Form
  showRegisterForm.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
  });

  // Show the Login Form
  showLoginForm.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
  });

  // Login functionality
  const loginSubmitBtn = loginForm.querySelector(".login-submit-btn");
  loginSubmitBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Get user input
    const usernameInput = loginForm.querySelector("input[type='text']").value;
    const passwordInput = loginForm.querySelector(
      "input[type='password']"
    ).value;

    // Validate credentials
    if (
      usernameInput === dummyUser.username &&
      passwordInput === dummyUser.password
    ) {
      alert("Login successful!");
      window.location.href = "main.html"; // Redirect to dashboard
    } else {
      alert("Invalid username or password. Please try again.");
    }
  });
});
