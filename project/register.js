/* ===== Member Registration Logic ===== */

const API_BASE_URL = "http://localhost:8080";

const registerForm =
  document.getElementById("register-form");

const memberIdInput =
  document.getElementById("memberId");

const memberNameInput =
  document.getElementById("memberName");

const phoneInput =
  document.getElementById("phone");

const usernameInput =
  document.getElementById("username");

const passwordInput =
  document.getElementById("password");

const confirmPasswordInput =
  document.getElementById("confirmPassword");

const registerMessage =
  document.getElementById("register-message");

const registerMessageText =
  document.getElementById("register-message-text");

const registerBtn =
  document.getElementById("register-btn");


function showMessage(message) {

  registerMessageText.textContent = message;

  registerMessage.classList.add("show");
}


function hideMessage() {

  registerMessage.classList.remove("show");

  registerMessageText.textContent = "";
}


registerForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  hideMessage();


  const memberId =
    memberIdInput.value.trim();

  const memberName =
    memberNameInput.value.trim();

  const phone =
    phoneInput.value.trim();

  const username =
    usernameInput.value.trim();

  const password =
    passwordInput.value;

  const confirmPassword =
    confirmPasswordInput.value;


  // Check passwords
  if (password !== confirmPassword) {

    showMessage(
      "Passwords do not match."
    );

    return;
  }


  // Check password length
  if (password.length < 4) {

    showMessage(
      "Password must contain at least 4 characters."
    );

    return;
  }


  registerBtn.disabled = true;

  registerBtn.textContent =
    "Creating account...";


  try {

    const response = await fetch(
      `${API_BASE_URL}/auth/register`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          memberId: memberId,

          memberName: memberName,

          phone: phone,

          username: username,

          password: password

        })
      }
    );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Registration failed"
      );
    }


    // Registration successful
    showMessage(
      "Registration successful! Redirecting to login..."
    );


    registerForm.reset();


    setTimeout(() => {

      window.location.href =
        "login.html";

    }, 1500);


  } catch (error) {

    showMessage(
      error.message ||
      "Unable to register. Please try again."
    );


    registerBtn.disabled = false;

    registerBtn.textContent =
      "Create Account";
  }

});