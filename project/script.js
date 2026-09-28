/* ===== MicroSave Shared Script ===== */

export const API_BASE_URL = "http://localhost:8080";

/* ----- Auth Guard ----- */
export function requireAuth() {
  const loggedIn = localStorage.getItem("microsave_logged_in");
  if (!loggedIn) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

export function logout() {
  localStorage.removeItem("microsave_logged_in");
  localStorage.removeItem("microsave_username");
  window.location.href = "login.html";
}

export function getLoggedInUser() {
  return localStorage.getItem("microsave_username") || "admin";
}

/* ----- API Helper ----- */
async function apiRequest(path, options = {}) {
  const url = API_BASE_URL + path;
  let config = {
    headers: { "Content-Type": "application/json" },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) return null;

    let data = null;
    const text = await response.text();
    if (text) {
      try { data = JSON.parse(text); } catch (e) { data = text; }
    }

    if (!response.ok) {
      const message = (data && data.message) ? data.message : `Request failed (${response.status})`;
      throw new Error(message);
    }

    return data;
  } catch (err) {
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new Error("Unable to connect to MicroSave server. Please make sure the Spring Boot backend is running.");
    }
    throw err;
  }
}

export const api = {
  get: (path) => apiRequest(path, { method: "GET" }),
  post: (path, body) => apiRequest(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => apiRequest(path, { method: "PUT", body: JSON.stringify(body) }),
  del: (path) => apiRequest(path, { method: "DELETE" }),
};

/* ----- Notifications ----- */
function ensureNotificationContainer() {
  let container = document.querySelector(".notification-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "notification-container";
    document.body.appendChild(container);
  }
  return container;
}

export function showNotification(type, title, message, duration = 4000) {
  const container = ensureNotificationContainer();
  const notif = document.createElement("div");
  notif.className = "notification " + type;

  const icons = {
    success: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
    error: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>',
    warning: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"/></svg>',
    info: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  };

  notif.innerHTML = `
    <div class="notification-icon">${icons[type] || icons.info}</div>
    <div class="notification-content">
      <div class="notification-title">${escapeHtml(title)}</div>
      ${message ? `<div class="notification-message">${escapeHtml(message)}</div>` : ""}
    </div>
    <button class="notification-close" onclick="this.parentElement.classList.add('removing'); setTimeout(()=>this.parentElement.remove(),300)">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  `;
  container.appendChild(notif);

  if (duration > 0) {
    setTimeout(() => {
      notif.classList.add("removing");
      setTimeout(() => notif.remove(), 300);
    }, duration);
  }
}

export function notifySuccess(title, message) { showNotification("success", title, message); }
export function notifyError(title, message) { showNotification("error", title, message, 6000); }
export function notifyWarning(title, message) { showNotification("warning", title, message); }

/* ----- Utilities ----- */
export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return "₹" + num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return escapeHtml(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

/* ----- Layout (Sidebar + Topbar) ----- */
export const ICONS = {
  dashboard: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
  groups: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a3 3 0 10-3-3 3 3 0 003 3zm-12 0a3 3 0 10-3-3 3 3 0 003 3z"/></svg>',
  members: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>',
  contributions: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>',
  loans: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  repayments: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
  logout: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>',
  wallet: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15v4.5h3.75A2.25 2.25 0 0021 12zm-18 0a2.25 2.25 0 012.25-2.25H9v4.5H5.25A2.25 2.25 0 013 12zm9-7.5a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25h6a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0018 4.5h-6z"/></svg>',
};

export const NAV_ITEMS = [
  { page: "dashboard", label: "Dashboard", icon: ICONS.dashboard, href: "index.html" },
  { page: "groups", label: "Groups", icon: ICONS.groups, href: "groups.html" },
  { page: "members", label: "Members", icon: ICONS.members, href: "members.html" },
  { page: "contributions", label: "Contributions", icon: ICONS.contributions, href: "contributions.html" },
  { page: "loans", label: "Loans", icon: ICONS.loans, href: "loans.html" },
  { page: "repayments", label: "Repayments", icon: ICONS.repayments, href: "repayments.html" },
];

export function renderLayout(activePage, pageTitle) {
  const user = getLoggedInUser();
  const initial = user.charAt(0).toUpperCase();

  const navHtml = NAV_ITEMS.map(item =>
    `<a href="${item.href}" class="nav-item ${item.page === activePage ? "active" : ""}">${item.icon}<span>${item.label}</span></a>`
  ).join("");

  document.body.innerHTML = `
    <div class="app-layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="logo-icon">${ICONS.wallet}</div>
          <span class="brand-name">MicroSave</span>
        </div>
        <nav class="sidebar-nav">
          ${navHtml}
        </nav>
        <div class="sidebar-footer">
          <a href="#" class="nav-item" id="logout-btn">${ICONS.logout}<span>Logout</span></a>
        </div>
      </aside>
      <div class="backdrop" id="backdrop"></div>
      <div class="main-area">
        <header class="topbar">
          <div class="topbar-left">
            <button class="hamburger" id="hamburger">${ICONS.dashboard}</button>
            <h1>${escapeHtml(pageTitle)}</h1>
          </div>
          <div class="topbar-right">
            <div class="profile">
              <div class="profile-avatar">${initial}</div>
              <div class="profile-info">
                <div class="name">${escapeHtml(user)}</div>
                <div class="role">Administrator</div>
              </div>
            </div>
          </div>
        </header>
        <main class="content" id="content"></main>
      </div>
    </div>
    <div class="notification-container"></div>
  `;

  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  const hamburger = document.getElementById("hamburger");
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("backdrop");

  function openSidebar() { sidebar.classList.add("open"); backdrop.classList.add("show"); }
  function closeSidebar() { sidebar.classList.remove("open"); backdrop.classList.remove("show"); }

  hamburger.addEventListener("click", openSidebar);
  backdrop.addEventListener("click", closeSidebar);

  // Use a proper menu icon for hamburger
  hamburger.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>';
}

/* ----- Modal Helpers ----- */
export function showModal(modalEl) {
  modalEl.classList.add("show");
  document.body.style.overflow = "hidden";
}

export function closeModal(modalEl) {
  modalEl.classList.remove("show");
  document.body.style.overflow = "";
}

export function createModal(id, title, bodyHtml, footerHtml) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = id;
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${escapeHtml(title)}</h3>
        <button class="modal-close" data-close="true">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
      ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ""}
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-close]")) {
      closeModal(modal);
    }
  });

  return modal;
}

export function createConfirmModal(title, message, onConfirm) {
  const modal = createModal(
    "confirm-modal-" + Date.now(),
    title,
    `<p style="color:var(--neutral-600); line-height:1.6;">${escapeHtml(message)}</p>`,
    `<button class="btn btn-secondary" data-close="true">Cancel</button><button class="btn btn-danger" id="confirm-yes">Delete</button>`
  );
  showModal(modal);
  document.getElementById("confirm-yes").addEventListener("click", () => {
    closeModal(modal);
    onConfirm();
  });
  return modal;
}

/* ----- State Helpers ----- */
export function renderLoading(container) {
  container.innerHTML = `<div class="loading-state"><div class="spinner"></div><p style="color:var(--neutral-500)">Loading...</p></div>`;
}

export function renderEmpty(container, message) {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon-circle">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
      </div>
      <h4>No records found</h4>
      <p>${escapeHtml(message || "There are no records to display yet.")}</p>
    </div>
  `;
}

export function renderError(container, message) {
  container.innerHTML = `
    <div class="error-state">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"/></svg>
      <h4>Something went wrong</h4>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}
