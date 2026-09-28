/* ===== Groups Page Logic ===== */

import { requireAuth, renderLayout, ICONS, api, escapeHtml, notifySuccess, notifyError, notifyWarning, renderLoading, renderEmpty, renderError, showModal, closeModal, createModal, createConfirmModal } from "./script.js";

if (!requireAuth()) throw new Error("Not authenticated");

renderLayout("groups", "Groups");

const content = document.getElementById("content");

content.innerHTML = `
  <div class="page-header">
    <div class="page-header-text">
      <h2>Groups</h2>
      <p>Manage your self help groups.</p>
    </div>
    <button class="btn btn-primary" id="add-group-btn">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" style="width:18px;height:18px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
      Add Group
    </button>
  </div>

  <div class="card">
    <div class="card-body no-pad" id="groups-table-container"></div>
  </div>
`;

const tableContainer = document.getElementById("groups-table-container");
const addBtn = document.getElementById("add-group-btn");

let groups = [];

async function loadGroups() {
  renderLoading(tableContainer);
  try {
    const data = await api.get("/groups");
    groups = Array.isArray(data) ? data : [];
    renderTable();
  } catch (err) {
    renderError(tableContainer, err.message);
    notifyError("Failed to load groups", err.message);
  }
}

function renderTable() {
  if (groups.length === 0) {
    renderEmpty(tableContainer, "No groups have been created yet. Click 'Add Group' to get started.");
    return;
  }

  tableContainer.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr><th>Group ID</th><th>Group Name</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${groups.map(g => `
            <tr>
              <td class="table-id">#${g.groupId}</td>
              <td>${escapeHtml(g.groupName)}</td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn" onclick="viewGroup(${g.groupId})" title="View">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </button>
                  <button class="icon-btn" onclick="editGroup(${g.groupId})" title="Edit">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button class="icon-btn delete" onclick="deleteGroup(${g.groupId})" title="Delete">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function openGroupModal(existing) {
  const isEdit = !!existing;
  const name = isEdit ? existing.groupName : "";

  const bodyHtml = `
    <div class="form-group">
      <label for="group-name-input">Group Name</label>
      <input type="text" id="group-name-input" class="form-input no-icon" placeholder="e.g. ABC Self Help Group" value="${escapeHtml(name)}" required />
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-secondary" data-close="true">Cancel</button>
    <button class="btn btn-primary" id="group-save-btn">${isEdit ? "Update" : "Create"}</button>
  `;

  const modal = createModal("group-modal", isEdit ? "Edit Group" : "Add Group", bodyHtml, footerHtml);
  showModal(modal);

  const nameInput = document.getElementById("group-name-input");
  nameInput.focus();

  document.getElementById("group-save-btn").addEventListener("click", async () => {
    const groupName = nameInput.value.trim();
    if (!groupName) {
      notifyWarning("Validation error", "Group name is required.");
      nameInput.focus();
      return;
    }

    const saveBtn = document.getElementById("group-save-btn");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      if (isEdit) {
        await api.put(`/groups/${existing.groupId}`, { groupName });
        notifySuccess("Group updated successfully");
      } else {
        await api.post("/groups", { groupName });
        notifySuccess("Group created successfully");
      }
      closeModal(modal);
      await loadGroups();
    } catch (err) {
      saveBtn.disabled = false;
      saveBtn.textContent = isEdit ? "Update" : "Create";
      notifyError(isEdit ? "Unable to update group" : "Unable to create group", err.message);
    }
  });
}

window.viewGroup = function(id) {
  const g = groups.find(x => x.groupId === id);
  if (!g) return;
  const body = `
    <div style="text-align:center; padding:12px 0;">
      <div class="empty-icon-circle" style="margin:0 auto 16px">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" style="color:var(--primary)"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a3 3 0 10-3-3 3 3 0 003 3zm-12 0a3 3 0 10-3-3 3 3 0 003 3z"/></svg>
      </div>
      <h3 style="font-size:1.2rem; font-weight:700; color:var(--neutral-900); margin-bottom:4px">${escapeHtml(g.groupName)}</h3>
      <p style="color:var(--neutral-500)">Group ID: #${g.groupId}</p>
    </div>
  `;
  const modal = createModal("view-group-modal", "Group Details", body, `<button class="btn btn-secondary" data-close="true">Close</button>`);
  showModal(modal);
};

window.editGroup = function(id) {
  const g = groups.find(x => x.groupId === id);
  if (g) openGroupModal(g);
};

window.deleteGroup = function(id) {
  const g = groups.find(x => x.groupId === id);
  if (!g) return;
  createConfirmModal("Delete Group", `Are you sure you want to delete "${g.groupName}"? This action cannot be undone.`, async () => {
    try {
      await api.del(`/groups/${id}`);
      notifySuccess("Group deleted successfully");
      await loadGroups();
    } catch (err) {
      notifyError("Unable to delete group", err.message);
    }
  });
};

addBtn.addEventListener("click", () => openGroupModal(null));

loadGroups();
