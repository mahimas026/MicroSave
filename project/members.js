/* ===== Members Page Logic ===== */

import { requireAuth, renderLayout, ICONS, api, escapeHtml, notifySuccess, notifyError, notifyWarning, renderLoading, renderEmpty, renderError, showModal, closeModal, createModal, createConfirmModal } from "./script.js";

if (!requireAuth()) throw new Error("Not authenticated");

renderLayout("members", "Members");

const content = document.getElementById("content");

content.innerHTML = `
  <div class="page-header">
    <div class="page-header-text">
      <h2>Members</h2>
      <p>Manage group members and their information.</p>
    </div>
    <button class="btn btn-primary" id="add-member-btn">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" style="width:18px;height:18px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
      Add Member
    </button>
  </div>

  <div class="card">
    <div class="card-header">
      <h3>All Members</h3>
      <div class="search-box">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input type="text" id="search-input" placeholder="Search members..." />
      </div>
    </div>
    <div class="card-body no-pad" id="members-table-container"></div>
  </div>
`;

const tableContainer = document.getElementById("members-table-container");
const addBtn = document.getElementById("add-member-btn");
const searchInput = document.getElementById("search-input");

let members = [];
let groups = [];

async function loadGroups() {
  try {
    const data = await api.get("/groups");
    groups = Array.isArray(data) ? data : [];
  } catch (err) {
    groups = [];
  }
}

async function loadMembers() {
  renderLoading(tableContainer);
  try {
    const data = await api.get("/members");
    members = Array.isArray(data) ? data : [];
    renderTable();
  } catch (err) {
    renderError(tableContainer, err.message);
    notifyError("Failed to load members", err.message);
  }
}

function getGroupName(id) {
  const g = groups.find(x => x.groupId === id);
  return g ? g.groupName : "—";
}

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = query
    ? members.filter(m =>
        (m.memberName || "").toLowerCase().includes(query) ||
        (m.phone || "").toLowerCase().includes(query) ||
        getGroupName(m.group ? m.group.groupId : m.groupId).toLowerCase().includes(query)
      )
    : members;

  if (filtered.length === 0) {
    renderEmpty(tableContainer, query ? "No members match your search." : "No members have been added yet. Click 'Add Member' to get started.");
    return;
  }

  tableContainer.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr><th>Member ID</th><th>Member Name</th><th>Phone</th><th>Group</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${filtered.map(m => {
            const gid = m.group ? m.group.groupId : m.groupId;
            return `
            <tr>
              <td class="table-id">#${m.memberId}</td>
              <td>${escapeHtml(m.memberName)}</td>
              <td>${escapeHtml(m.phone || "—")}</td>
              <td>${escapeHtml(getGroupName(gid))}</td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn" onclick="editMember(${m.memberId})" title="Edit">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button class="icon-btn delete" onclick="deleteMember(${m.memberId})" title="Delete">
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

function openMemberModal(existing) {
  const isEdit = !!existing;
  const mName = isEdit ? existing.memberName : "";
  const phone = isEdit ? (existing.phone || "") : "";
  const gid = isEdit ? (existing.group ? existing.group.groupId : "") : "";

  if (groups.length === 0) {
    notifyWarning("No groups available", "Please create a group first before adding members.");
    return;
  }

  const bodyHtml = `
    <div class="form-group">
      <label for="member-name-input">Member Name</label>
      <input type="text" id="member-name-input" class="form-input no-icon" placeholder="e.g. Mahima" value="${escapeHtml(mName)}" required />
    </div>
    <div class="form-group">
      <label for="member-phone-input">Phone</label>
      <input type="text" id="member-phone-input" class="form-input no-icon" placeholder="e.g. 9876543210" value="${escapeHtml(phone)}" />
    </div>
    <div class="form-group">
      <label for="member-group-select">Group</label>
      <select id="member-group-select" class="form-select" required>
        <option value="">Select a group</option>
        ${groups.map(g => `<option value="${g.groupId}" ${String(gid) === String(g.groupId) ? "selected" : ""}>${escapeHtml(g.groupName)}</option>`).join("")}
      </select>
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-secondary" data-close="true">Cancel</button>
    <button class="btn btn-primary" id="member-save-btn">${isEdit ? "Update" : "Create"}</button>
  `;

  const modal = createModal("member-modal", isEdit ? "Edit Member" : "Add Member", bodyHtml, footerHtml);
  showModal(modal);

  document.getElementById("member-name-input").focus();

  document.getElementById("member-save-btn").addEventListener("click", async () => {
    const memberName = document.getElementById("member-name-input").value.trim();
    const phoneVal = document.getElementById("member-phone-input").value.trim();
    const groupId = document.getElementById("member-group-select").value;

    if (!memberName) {
      notifyWarning("Validation error", "Member name is required.");
      return;
    }
    if (!groupId) {
      notifyWarning("Validation error", "Please select a group.");
      return;
    }

    const saveBtn = document.getElementById("member-save-btn");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    const payload = {
      memberName,
      phone: phoneVal,
      group: { groupId: Number(groupId) },
    };

    try {
      if (isEdit) {
        await api.put(`/members/${existing.memberId}`, payload);
        notifySuccess("Member updated successfully");
      } else {
        await api.post("/members", payload);
        notifySuccess("Member created successfully");
      }
      closeModal(modal);
      await loadMembers();
    } catch (err) {
      saveBtn.disabled = false;
      saveBtn.textContent = isEdit ? "Update" : "Create";
      notifyError(isEdit ? "Unable to update member" : "Unable to create member", err.message);
    }
  });
}

window.editMember = function(id) {
  const m = members.find(x => x.memberId === id);
  if (m) openMemberModal(m);
};

window.deleteMember = function(id) {
  const m = members.find(x => x.memberId === id);
  if (!m) return;
  createConfirmModal("Delete Member", `Are you sure you want to delete "${m.memberName}"? This action cannot be undone.`, async () => {
    try {
      await api.del(`/members/${id}`);
      notifySuccess("Member deleted successfully");
      await loadMembers();
    } catch (err) {
      notifyError("Unable to delete member", err.message);
    }
  });
};

addBtn.addEventListener("click", () => openMemberModal(null));
searchInput.addEventListener("input", renderTable);

(async () => {
  await loadGroups();
  await loadMembers();
})();
