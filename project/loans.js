/* ===== Loans Page Logic ===== */

import { requireAuth, renderLayout, ICONS, api, escapeHtml, formatCurrency, formatDate, todayISO, notifySuccess, notifyError, notifyWarning, renderLoading, renderEmpty, renderError, showModal, closeModal, createModal, createConfirmModal } from "./script.js";

if (!requireAuth()) throw new Error("Not authenticated");

renderLayout("loans", "Loans");

const content = document.getElementById("content");

content.innerHTML = `
  <div class="page-header">
    <div class="page-header-text">
      <h2>Loans</h2>
      <p>Manage member loans and track their status.</p>
    </div>
    <button class="btn btn-primary" id="add-loan-btn">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" style="width:18px;height:18px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
      Create Loan
    </button>
  </div>

  <div class="balance-card" id="balance-card">
    <div class="balance-icon">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" style="color:#fff"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15v4.5h3.75A2.25 2.25 0 0021 12zm-18 0a2.25 2.25 0 012.25-2.25H9v4.5H5.25A2.25 2.25 0 013 12zm9-7.5a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25h6a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0018 4.5h-6z"/></svg>
    </div>
    <div>
      <div class="balance-label">Available Group Balance</div>
      <div class="balance-value" id="balance-value">Loading...</div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <h3>All Loans</h3>
      <div class="search-box">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input type="text" id="search-input" placeholder="Search loans..." />
      </div>
    </div>
    <div class="card-body no-pad" id="loans-table-container"></div>
  </div>
`;

const tableContainer = document.getElementById("loans-table-container");
const addBtn = document.getElementById("add-loan-btn");
const searchInput = document.getElementById("search-input");
const balanceValue = document.getElementById("balance-value");

let loans = [];
let members = [];

async function loadMembers() {
  try {
    const data = await api.get("/members");
    members = Array.isArray(data) ? data : [];
  } catch (err) {
    members = [];
  }
}

async function loadLoans() {
  renderLoading(tableContainer);
  try {
    const data = await api.get("/loans");
    loans = Array.isArray(data) ? data : [];
    renderTable();
  } catch (err) {
    renderError(tableContainer, err.message);
    notifyError("Failed to load loans", err.message);
  }
}

async function loadBalance() {
  try {
    const balance = await api.get("/loans/group/1/balance");
    const balNum = typeof balance === "number" ? balance : (balance !== null && typeof balance === "object" ? (balance.balance || balance.availableBalance || 0) : Number(balance) || 0);
    balanceValue.textContent = formatCurrency(balNum);
  } catch (err) {
    balanceValue.textContent = "—";
  }
}

function getMemberName(id) {
  const m = members.find(x => x.memberId === id);
  return m ? m.memberName : "Member #" + id;
}

function statusBadge(status) {
  const s = (status || "ACTIVE").toUpperCase();
  const cls = s === "ACTIVE" ? "badge-active" : s === "COMPLETED" ? "badge-completed" : s === "CANCELLED" ? "badge-cancelled" : "badge-warning";
  return `<span class="badge ${cls}">${escapeHtml(s)}</span>`;
}

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = query
    ? loans.filter(l => {
        const name = getMemberName(l.member ? l.member.memberId : l.memberId).toLowerCase();
        return name.includes(query) || String(l.amount).includes(query) || (l.status || "").toLowerCase().includes(query) || formatDate(l.loanDate).toLowerCase().includes(query);
      })
    : loans;

  if (filtered.length === 0) {
    renderEmpty(tableContainer, query ? "No loans match your search." : "No loans have been created yet. Click 'Create Loan' to get started.");
    return;
  }

  tableContainer.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr><th>Loan ID</th><th>Member</th><th>Amount</th><th>Loan Date</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${filtered.map(l => {
            const mid = l.member ? l.member.memberId : l.memberId;
            return `
            <tr>
              <td class="table-id">#${l.loanId}</td>
              <td>${escapeHtml(getMemberName(mid))}</td>
              <td class="table-amount">${formatCurrency(l.amount)}</td>
              <td>${formatDate(l.loanDate)}</td>
              <td>${statusBadge(l.status)}</td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn" onclick="editLoan(${l.loanId})" title="Edit">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button class="icon-btn delete" onclick="deleteLoan(${l.loanId})" title="Delete">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function openLoanModal(existing) {
  const isEdit = !!existing;
  const amount = isEdit ? (existing.amount || "") : "";
  const date = isEdit ? (existing.loanDate || "").split("T")[0] : todayISO();
  const status = isEdit ? (existing.status || "ACTIVE") : "ACTIVE";
  const mid = isEdit ? (existing.member ? existing.member.memberId : "") : "";

  if (members.length === 0) {
    notifyWarning("No members available", "Please add a member first before creating a loan.");
    return;
  }

  const bodyHtml = `
    <div class="form-group">
      <label for="loan-member-select">Member</label>
      <select id="loan-member-select" class="form-select" required>
        <option value="">Select a member</option>
        ${members.map(m => `<option value="${m.memberId}" ${String(mid) === String(m.memberId) ? "selected" : ""}>${escapeHtml(m.memberName)}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label for="loan-amount-input">Amount (₹)</label>
      <input type="number" id="loan-amount-input" class="form-input no-icon" placeholder="e.g. 500" value="${escapeHtml(amount)}" min="1" required />
    </div>
    <div class="form-group">
      <label for="loan-date-input">Loan Date</label>
      <input type="date" id="loan-date-input" class="form-input no-icon" value="${escapeHtml(date)}" required />
    </div>
    <div class="form-group">
      <label for="loan-status-select">Status</label>
      <select id="loan-status-select" class="form-select" required>
        <option value="ACTIVE" ${status === "ACTIVE" ? "selected" : ""}>ACTIVE</option>
        <option value="COMPLETED" ${status === "COMPLETED" ? "selected" : ""}>COMPLETED</option>
        <option value="CANCELLED" ${status === "CANCELLED" ? "selected" : ""}>CANCELLED</option>
      </select>
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-secondary" data-close="true">Cancel</button>
    <button class="btn btn-primary" id="loan-save-btn">${isEdit ? "Update" : "Create"}</button>
  `;

  const modal = createModal("loan-modal", isEdit ? "Edit Loan" : "Create Loan", bodyHtml, footerHtml);
  showModal(modal);

  document.getElementById("loan-member-select").focus();

  document.getElementById("loan-save-btn").addEventListener("click", async () => {
    const memberId = document.getElementById("loan-member-select").value;
    const amountVal = document.getElementById("loan-amount-input").value;
    const dateVal = document.getElementById("loan-date-input").value;
    const statusVal = document.getElementById("loan-status-select").value;

    if (!memberId) { notifyWarning("Validation error", "Please select a member."); return; }
    if (!amountVal || Number(amountVal) <= 0) { notifyWarning("Validation error", "Please enter a valid amount."); return; }
    if (!dateVal) { notifyWarning("Validation error", "Please select a date."); return; }

    const saveBtn = document.getElementById("loan-save-btn");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    const payload = {
      amount: Number(amountVal),
      loanDate: dateVal,
      status: statusVal,
      member: { memberId: Number(memberId) },
    };

    try {
      if (isEdit) {
        await api.put(`/loans/${existing.loanId}`, payload);
        notifySuccess("Loan updated successfully");
      } else {
        await api.post("/loans", payload);
        notifySuccess("Loan created successfully");
      }
      closeModal(modal);
      await loadLoans();
      await loadBalance();
    } catch (err) {
      saveBtn.disabled = false;
      saveBtn.textContent = isEdit ? "Update" : "Create";
      notifyError(isEdit ? "Unable to update loan" : "Unable to create loan", err.message);
    }
  });
}

window.editLoan = function(id) {
  const l = loans.find(x => x.loanId === id);
  if (l) openLoanModal(l);
};

window.deleteLoan = function(id) {
  createConfirmModal("Delete Loan", "Are you sure you want to delete this loan? This action cannot be undone.", async () => {
    try {
      await api.del(`/loans/${id}`);
      notifySuccess("Loan deleted successfully");
      await loadLoans();
      await loadBalance();
    } catch (err) {
      notifyError("Unable to delete loan", err.message);
    }
  });
};

addBtn.addEventListener("click", () => openLoanModal(null));
searchInput.addEventListener("input", renderTable);

(async () => {
  await loadMembers();
  await loadLoans();
  await loadBalance();
})();
