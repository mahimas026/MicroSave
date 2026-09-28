/* ===== Login Page Logic ===== */

const VALID_USERNAME = "admin";
const VALID_PASSWORD = "admin123";

// If already logged in, redirect to dashboard
if (localStorage.getItem("microsave_logged_in") === "true") {
  window.location.href = "index.html";
}

const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const rememberInput = document.getElementById("remember");
const loginError = document.getElementById("login-error");
const loginErrorMsg = document.getElementById("login-error-msg");
const loginBtn = document.getElementById("login-btn");
const pwToggle = document.getElementById("pw-toggle");

// Restore remembered username
if (localStorage.getItem("microsave_remembered_user")) {
  usernameInput.value = localStorage.getItem("microsave_remembered_user");
  rememberInput.checked = true;
}

function showLoginError(msg) {
  loginErrorMsg.textContent = msg;
  loginError.classList.add("show");
}

function hideLoginError() {
  loginError.classList.remove("show");
}

// Show/hide password
pwToggle.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    pwToggle.textContent = "Hide";
  } else {
    passwordInput.type = "password";
    pwToggle.textContent = "Show";
  }
});

usernameInput.addEventListener("input", hideLoginError);
passwordInput.addEventListener("input", hideLoginError);

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  hideLoginError();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showLoginError("Please enter both username and password.");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in...";

  setTimeout(() => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      localStorage.setItem("microsave_logged_in", "true");
      localStorage.setItem("microsave_username", username);

      if (rememberInput.checked) {
        localStorage.setItem("microsave_remembered_user", username);
      } else {
        localStorage.removeItem("microsave_remembered_user");
      }

      window.location.href = "index.html";
    } else {
      showLoginError("Invalid username or password");
      loginBtn.disabled = false;
      loginBtn.textContent = "Sign In";
      passwordInput.value = "";
    }
  }, 500);
});
