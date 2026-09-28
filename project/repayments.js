/* ===== Repayments Page Logic ===== */

import { requireAuth, renderLayout, ICONS, api, escapeHtml, formatCurrency, formatDate, todayISO, notifySuccess, notifyError, notifyWarning, renderLoading, renderEmpty, renderError, showModal, closeModal, createModal, createConfirmModal } from "./script.js";

if (!requireAuth()) throw new Error("Not authenticated");

renderLayout("repayments", "Repayments");

const content = document.getElementById("content");

content.innerHTML = `
  <div class="page-header">
    <div class="page-header-text">
      <h2>Repayments</h2>
      <p>Track loan repayments from members.</p>
    </div>
    <button class="btn btn-primary" id="add-repay-btn">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" style="width:18px;height:18px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
      Add Repayment
    </button>
  </div>

  <div class="card">
    <div class="card-header">
      <h3>All Repayments</h3>
      <div class="search-box">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input type="text" id="search-input" placeholder="Search repayments..." />
      </div>
    </div>
    <div class="card-body no-pad" id="repay-table-container"></div>
  </div>
`;

const tableContainer = document.getElementById("repay-table-container");
const addBtn = document.getElementById("add-repay-btn");
const searchInput = document.getElementById("search-input");

let repayments = [];
let loans = [];
let members = [];

async function loadLoans() {
  try {
    const data = await api.get("/loans");
    loans = Array.isArray(data) ? data : [];
  } catch (err) {
    loans = [];
  }
}

async function loadMembers() {
  try {
    const data = await api.get("/members");
    members = Array.isArray(data) ? data : [];
  } catch (err) {
    members = [];
  }
}

async function loadRepayments() {
  renderLoading(tableContainer);
  try {
    const data = await api.get("/repayments");
    repayments = Array.isArray(data) ? data : [];
    renderTable();
  } catch (err) {
    renderError(tableContainer, err.message);
    notifyError("Failed to load repayments", err.message);
  }
}

function getMemberName(loanId) {
  const loan = loans.find(l => l.loanId === loanId);
  if (!loan) return "—";
  const mid = loan.member ? loan.member.memberId : loan.memberId;
  const m = members.find(x => x.memberId === mid);
  return m ? m.memberName : "Member #" + mid;
}

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = query
    ? repayments.filter(r => {
        const name = getMemberName(r.loan ? r.loan.loanId : r.loanId).toLowerCase();
        return name.includes(query) || String(r.amount).includes(query) || String(r.loan ? r.loan.loanId : r.loanId).includes(query) || formatDate(r.repaymentDate).toLowerCase().includes(query);
      })
    : repayments;

  if (filtered.length === 0) {
    renderEmpty(tableContainer, query ? "No repayments match your search." : "No repayments have been recorded yet. Click 'Add Repayment' to get started.");
    return;
  }

  tableContainer.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr><th>Repayment ID</th><th>Loan ID</th><th>Member</th><th>Amount</th><th>Repayment Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${filtered.map(r => {
            const lid = r.loan ? r.loan.loanId : r.loanId;
            return `
            <tr>
              <td class="table-id">#${r.repaymentId}</td>
              <td>#${lid}</td>
              <td>${escapeHtml(getMemberName(lid))}</td>
              <td class="table-amount">${formatCurrency(r.amount)}</td>
              <td>${formatDate(r.repaymentDate)}</td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn" onclick="editRepayment(${r.repaymentId})" title="Edit">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button class="icon-btn delete" onclick="deleteRepayment(${r.repaymentId})" title="Delete">
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

function openRepaymentModal(existing) {
  const isEdit = !!existing;
  const amount = isEdit ? (existing.amount || "") : "";
  const date = isEdit ? (existing.repaymentDate || "").split("T")[0] : todayISO();
  const lid = isEdit ? (existing.loan ? existing.loan.loanId : "") : "";

  if (loans.length === 0) {
    notifyWarning("No loans available", "Please create a loan first before recording repayments.");
    return;
  }

  const bodyHtml = `
    <div class="form-group">
      <label for="repay-loan-select">Loan</label>
      <select id="repay-loan-select" class="form-select" required>
        <option value="">Select a loan</option>
        ${loans.map(l => {
          const mid = l.member ? l.member.memberId : l.memberId;
          const m = members.find(x => x.memberId === mid);
          const mName = m ? m.memberName : "Member #" + mid;
          return `<option value="${l.loanId}" ${String(lid) === String(l.loanId) ? "selected" : ""}>Loan #${l.loanId} — ${escapeHtml(mName)} (${formatCurrency(l.amount)})</option>`;
        }).join("")}
      </select>
    </div>
    <div class="form-group">
      <label for="repay-amount-input">Amount (₹)</label>
      <input type="number" id="repay-amount-input" class="form-input no-icon" placeholder="e.g. 200" value="${escapeHtml(amount)}" min="1" required />
    </div>
    <div class="form-group">
      <label for="repay-date-input">Repayment Date</label>
      <input type="date" id="repay-date-input" class="form-input no-icon" value="${escapeHtml(date)}" required />
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-secondary" data-close="true">Cancel</button>
    <button class="btn btn-primary" id="repay-save-btn">${isEdit ? "Update" : "Create"}</button>
  `;

  const modal = createModal("repay-modal", isEdit ? "Edit Repayment" : "Add Repayment", bodyHtml, footerHtml);
  showModal(modal);

  document.getElementById("repay-loan-select").focus();

  document.getElementById("repay-save-btn").addEventListener("click", async () => {
    const loanId = document.getElementById("repay-loan-select").value;
    const amountVal = document.getElementById("repay-amount-input").value;
    const dateVal = document.getElementById("repay-date-input").value;

    if (!loanId) { notifyWarning("Validation error", "Please select a loan."); return; }
    if (!amountVal || Number(amountVal) <= 0) { notifyWarning("Validation error", "Please enter a valid amount."); return; }
    if (!dateVal) { notifyWarning("Validation error", "Please select a date."); return; }

    const saveBtn = document.getElementById("repay-save-btn");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    const payload = {
      amount: Number(amountVal),
      repaymentDate: dateVal,
      loan: { loanId: Number(loanId) },
    };

    try {
      if (isEdit) {
        await api.put(`/repayments/${existing.repaymentId}`, payload);
        notifySuccess("Repayment updated successfully");
      } else {
        await api.post("/repayments", payload);
        notifySuccess("Repayment created successfully");
      }
      closeModal(modal);
      await loadRepayments();
    } catch (err) {
      saveBtn.disabled = false;
      saveBtn.textContent = isEdit ? "Update" : "Create";
      notifyError(isEdit ? "Unable to update repayment" : "Unable to create repayment", err.message);
    }
  });
}

window.editRepayment = function(id) {
  const r = repayments.find(x => x.repaymentId === id);
  if (r) openRepaymentModal(r);
};

window.deleteRepayment = function(id) {
  createConfirmModal("Delete Repayment", "Are you sure you want to delete this repayment? This action cannot be undone.", async () => {
    try {
      await api.del(`/repayments/${id}`);
      notifySuccess("Repayment deleted successfully");
      await loadRepayments();
    } catch (err) {
      notifyError("Unable to delete repayment", err.message);
    }
  });
};

addBtn.addEventListener("click", () => openRepaymentModal(null));
searchInput.addEventListener("input", renderTable);

(async () => {
  await Promise.all([loadLoans(), loadMembers()]);
  await loadRepayments();
})();
