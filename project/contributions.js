/* ===== Contributions Page Logic ===== */

import { requireAuth, renderLayout, ICONS, api, escapeHtml, formatCurrency, formatDate, todayISO, notifySuccess, notifyError, notifyWarning, renderLoading, renderEmpty, renderError, showModal, closeModal, createModal, createConfirmModal } from "./script.js";

if (!requireAuth()) throw new Error("Not authenticated");

renderLayout("contributions", "Contributions");

const content = document.getElementById("content");

content.innerHTML = `
  <div class="page-header">
    <div class="page-header-text">
      <h2>Contributions</h2>
      <p>Track member contributions to the savings fund.</p>
    </div>
    <button class="btn btn-primary" id="add-contrib-btn">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" style="width:18px;height:18px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
      Add Contribution
    </button>
  </div>

  <div class="card">
    <div class="card-header">
      <h3>All Contributions</h3>
      <div class="search-box">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input type="text" id="search-input" placeholder="Search contributions..." />
      </div>
    </div>
    <div class="card-body no-pad" id="contrib-table-container"></div>
  </div>
`;

const tableContainer = document.getElementById("contrib-table-container");
const addBtn = document.getElementById("add-contrib-btn");
const searchInput = document.getElementById("search-input");

let contributions = [];
let members = [];

async function loadMembers() {
  try {
    const data = await api.get("/members");
    members = Array.isArray(data) ? data : [];
  } catch (err) {
    members = [];
  }
}

async function loadContributions() {
  renderLoading(tableContainer);
  try {
    const data = await api.get("/contributions");
    contributions = Array.isArray(data) ? data : [];
    renderTable();
  } catch (err) {
    renderError(tableContainer, err.message);
    notifyError("Failed to load contributions", err.message);
  }
}

function getMemberName(id) {
  const m = members.find(x => x.memberId === id);
  return m ? m.memberName : "Member #" + id;
}

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = query
    ? contributions.filter(c => {
        const name = getMemberName(c.member ? c.member.memberId : c.memberId).toLowerCase();
        return name.includes(query) || String(c.amount).includes(query) || formatDate(c.contributionDate).toLowerCase().includes(query);
      })
    : contributions;

  if (filtered.length === 0) {
    renderEmpty(tableContainer, query ? "No contributions match your search." : "No contributions have been recorded yet. Click 'Add Contribution' to get started.");
    return;
  }

  tableContainer.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr><th>Contribution ID</th><th>Member</th><th>Amount</th><th>Contribution Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${filtered.map(c => {
            const mid = c.member ? c.member.memberId : c.memberId;
            return `
            <tr>
              <td class="table-id">#${c.contributionId}</td>
              <td>${escapeHtml(getMemberName(mid))}</td>
              <td class="table-amount">${formatCurrency(c.amount)}</td>
              <td>${formatDate(c.contributionDate)}</td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn" onclick="editContribution(${c.contributionId})" title="Edit">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button class="icon-btn delete" onclick="deleteContribution(${c.contributionId})" title="Delete">
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

function openContributionModal(existing) {
  const isEdit = !!existing;
  const amount = isEdit ? (existing.amount || "") : "";
  const date = isEdit ? (existing.contributionDate || "").split("T")[0] : todayISO();
  const mid = isEdit ? (existing.member ? existing.member.memberId : "") : "";

  if (members.length === 0) {
    notifyWarning("No members available", "Please add a member first before recording contributions.");
    return;
  }

  const bodyHtml = `
    <div class="form-group">
      <label for="contrib-member-select">Member</label>
      <select id="contrib-member-select" class="form-select" required>
        <option value="">Select a member</option>
        ${members.map(m => `<option value="${m.memberId}" ${String(mid) === String(m.memberId) ? "selected" : ""}>${escapeHtml(m.memberName)}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label for="contrib-amount-input">Amount (₹)</label>
      <input type="number" id="contrib-amount-input" class="form-input no-icon" placeholder="e.g. 1000" value="${escapeHtml(amount)}" min="1" required />
    </div>
    <div class="form-group">
      <label for="contrib-date-input">Contribution Date</label>
      <input type="date" id="contrib-date-input" class="form-input no-icon" value="${escapeHtml(date)}" required />
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-secondary" data-close="true">Cancel</button>
    <button class="btn btn-primary" id="contrib-save-btn">${isEdit ? "Update" : "Create"}</button>
  `;

  const modal = createModal("contrib-modal", isEdit ? "Edit Contribution" : "Add Contribution", bodyHtml, footerHtml);
  showModal(modal);

  document.getElementById("contrib-member-select").focus();

  document.getElementById("contrib-save-btn").addEventListener("click", async () => {
    const memberId = document.getElementById("contrib-member-select").value;
    const amountVal = document.getElementById("contrib-amount-input").value;
    const dateVal = document.getElementById("contrib-date-input").value;

    if (!memberId) { notifyWarning("Validation error", "Please select a member."); return; }
    if (!amountVal || Number(amountVal) <= 0) { notifyWarning("Validation error", "Please enter a valid amount."); return; }
    if (!dateVal) { notifyWarning("Validation error", "Please select a date."); return; }

    const saveBtn = document.getElementById("contrib-save-btn");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    const payload = {
      amount: Number(amountVal),
      contributionDate: dateVal,
      member: { memberId: Number(memberId) },
    };

    try {
      if (isEdit) {
        await api.put(`/contributions/${existing.contributionId}`, payload);
        notifySuccess("Contribution updated successfully");
      } else {
        await api.post("/contributions", payload);
        notifySuccess("Contribution created successfully");
      }
      closeModal(modal);
      await loadContributions();
    } catch (err) {
      saveBtn.disabled = false;
      saveBtn.textContent = isEdit ? "Update" : "Create";
      notifyError(isEdit ? "Unable to update contribution" : "Unable to create contribution", err.message);
    }
  });
}

window.editContribution = function(id) {
  const c = contributions.find(x => x.contributionId === id);
  if (c) openContributionModal(c);
};

window.deleteContribution = function(id) {
  createConfirmModal("Delete Contribution", "Are you sure you want to delete this contribution? This action cannot be undone.", async () => {
    try {
      await api.del(`/contributions/${id}`);
      notifySuccess("Contribution deleted successfully");
      await loadContributions();
    } catch (err) {
      notifyError("Unable to delete contribution", err.message);
    }
  });
};

addBtn.addEventListener("click", () => openContributionModal(null));
searchInput.addEventListener("input", renderTable);

(async () => {
  await loadMembers();
  await loadContributions();
})();
