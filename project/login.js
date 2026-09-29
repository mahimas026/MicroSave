/* ===== Login Page Logic ===== */

const API_BASE_URL = "http://localhost:8080";

// If already logged in, redirect to correct dashboard
if (localStorage.getItem("microsave_logged_in") === "true") {

  const role = localStorage.getItem("microsave_role");

  if (role === "MEMBER") {
    window.location.href = "member-dashboard.html";
  } else {
    window.location.href = "index.html";
  }
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

  usernameInput.value =
    localStorage.getItem("microsave_remembered_user");

  rememberInput.checked = true;
}


// Show error
function showLoginError(msg) {

  loginErrorMsg.textContent = msg;
  loginError.classList.add("show");
}


// Hide error
function hideLoginError() {

  loginError.classList.remove("show");
}


// Show / hide password
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


// Login
loginForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  hideLoginError();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;


  if (!username || !password) {

    showLoginError(
      "Please enter both username and password."
    );

    return;
  }


  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in...";


  try {

    const response = await fetch(
      `${API_BASE_URL}/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          username: username,
          password: password
        })
      }
    );


    const data = await response.json();


    if (!response.ok) {

      throw new Error(
        data.error || "Invalid username or password"
      );
    }


    // Save login information
    localStorage.setItem(
      "microsave_logged_in",
      "true"
    );

    localStorage.setItem(
      "microsave_username",
      data.username
    );

    localStorage.setItem(
      "microsave_role",
      data.role
    );


    // Save member information
    if (data.role === "MEMBER") {

      localStorage.setItem(
        "microsave_member_id",
        data.memberId
      );

      localStorage.setItem(
        "microsave_member_name",
        data.memberName
      );

      localStorage.setItem(
        "microsave_group_id",
        data.groupId
      );

      localStorage.setItem(
        "microsave_group_name",
        data.groupName
      );
    }


    // Remember username
    if (rememberInput.checked) {

      localStorage.setItem(
        "microsave_remembered_user",
        username
      );

    } else {

      localStorage.removeItem(
        "microsave_remembered_user"
      );
    }


    // Redirect based on role
    if (data.role === "MEMBER") {

      window.location.href =
        "member-dashboard.html";

    } else {

      window.location.href =
        "index.html";
    }


  } catch (error) {

    showLoginError(
      error.message ||
      "Unable to login. Please try again."
    );

    loginBtn.disabled = false;
    loginBtn.textContent = "Sign In";

    passwordInput.value = "";
  }

});