/* ===== Dashboard Page Logic ===== */

import { requireAuth, renderLayout, ICONS, api, formatCurrency, formatDate, escapeHtml, renderEmpty, notifyError } from "./script.js";

if (!requireAuth()) throw new Error("Not authenticated");

renderLayout("dashboard", "Dashboard");

const content = document.getElementById("content");

content.innerHTML = `
  <div class="page-header">
    <div class="page-header-text">
      <h2>Dashboard</h2>
      <p>Manage your savings, members and loans in one place.</p>
    </div>
  </div>

  <div class="summary-cards" id="summary-cards">
    <div class="stat-card"><div class="stat-card-top"><div class="stat-icon blue">${ICONS.groups}</div></div><div class="stat-value" id="stat-groups">—</div><div class="stat-label">Total Groups</div></div>
    <div class="stat-card"><div class="stat-card-top"><div class="stat-icon teal">${ICONS.members}</div></div><div class="stat-value" id="stat-members">—</div><div class="stat-label">Total Members</div></div>
    <div class="stat-card"><div class="stat-card-top"><div class="stat-icon green">${ICONS.contributions}</div></div><div class="stat-value" id="stat-contributions">—</div><div class="stat-label">Total Contributions</div></div>
    <div class="stat-card"><div class="stat-card-top"><div class="stat-icon amber">${ICONS.loans}</div></div><div class="stat-value" id="stat-active-loans">—</div><div class="stat-label">Active Loans</div></div>
    <div class="stat-card"><div class="stat-card-top"><div class="stat-icon red">${ICONS.repayments}</div></div><div class="stat-value" id="stat-repayments">—</div><div class="stat-label">Total Repayments</div></div>
    <div class="stat-card"><div class="stat-card-top"><div class="stat-icon indigo">${ICONS.wallet}</div></div><div class="stat-value" id="stat-balance">—</div><div class="stat-label">Available Balance</div></div>
  </div>

  <div class="dashboard-grid">
    <div class="card">
      <div class="card-header"><h3>Recent Contributions</h3></div>
      <div class="card-body no-pad" id="recent-contributions"></div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Recent Loans</h3></div>
      <div class="card-body no-pad" id="recent-loans"></div>
    </div>
  </div>

  <div class="section-title">Quick Actions</div>
  <div class="quick-actions">
    <a href="groups.html" class="quick-action-btn">${ICONS.groups} Add Group</a>
    <a href="members.html" class="quick-action-btn">${ICONS.members} Add Member</a>
    <a href="contributions.html" class="quick-action-btn">${ICONS.contributions} Add Contribution</a>
    <a href="loans.html" class="quick-action-btn">${ICONS.loans} Create Loan</a>
    <a href="repayments.html" class="quick-action-btn">${ICONS.repayments} Add Repayment</a>
  </div>
`;

async function loadDashboard() {
  try {
    const [groups, members, contributions, loans, repayments] = await Promise.all([
      api.get("/groups").catch(() => []),
      api.get("/members").catch(() => []),
      api.get("/contributions").catch(() => []),
      api.get("/loans").catch(() => []),
      api.get("/repayments").catch(() => []),
    ]);

    const groupList = Array.isArray(groups) ? groups : [];
    const memberList = Array.isArray(members) ? members : [];
    const contribList = Array.isArray(contributions) ? contributions : [];
    const loanList = Array.isArray(loans) ? loans : [];
    const repayList = Array.isArray(repayments) ? repayments : [];

    // Summary stats
    document.getElementById("stat-groups").textContent = groupList.length;
    document.getElementById("stat-members").textContent = memberList.length;

    const totalContrib = contribList.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    document.getElementById("stat-contributions").textContent = formatCurrency(totalContrib);

    const activeLoans = loanList.filter(l => (l.status || "").toUpperCase() === "ACTIVE");
    document.getElementById("stat-active-loans").textContent = activeLoans.length;

    const totalRepay = repayList.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    document.getElementById("stat-repayments").textContent = formatCurrency(totalRepay);

    // Available balance (group 1)
    try {
      const balance = await api.get("/loans/group/1/balance");
      const balNum = typeof balance === "number" ? balance : (balance !== null && typeof balance === "object" ? (balance.balance || balance.availableBalance || 0) : Number(balance) || 0);
      document.getElementById("stat-balance").textContent = formatCurrency(balNum);
    } catch (e) {
      document.getElementById("stat-balance").textContent = "—";
    }

    // Recent contributions table
    renderRecentContributions(contribList.slice(-5).reverse(), memberList);

    // Recent loans table
    renderRecentLoans(loanList.slice(-5).reverse(), memberList);

  } catch (err) {
    notifyError("Failed to load dashboard", err.message);
  }
}

function renderRecentContributions(contribs, members) {
  const container = document.getElementById("recent-contributions");

  if (!contribs || contribs.length === 0) {
    renderEmpty(container, "No contributions have been made yet.");
    return;
  }

  const memberName = (id) => {
    const m = members.find(m => m.memberId === id);
    return m ? m.memberName : "Member #" + id;
  };

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Member</th><th>Amount</th><th>Date</th></tr></thead>
        <tbody>
          ${contribs.map(c => `
            <tr>
              <td>${escapeHtml(memberName(c.member ? c.member.memberId : c.memberId))}</td>
              <td class="table-amount">${formatCurrency(c.amount)}</td>
              <td>${formatDate(c.contributionDate)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderRecentLoans(loans, members) {
  const container = document.getElementById("recent-loans");

  if (!loans || loans.length === 0) {
    renderEmpty(container, "No loans have been created yet.");
    return;
  }

  const memberName = (id) => {
    const m = members.find(m => m.memberId === id);
    return m ? m.memberName : "Member #" + id;
  };

  const statusBadge = (status) => {
    const s = (status || "ACTIVE").toUpperCase();
    const cls = s === "ACTIVE" ? "badge-active" : s === "COMPLETED" ? "badge-completed" : s === "CANCELLED" ? "badge-cancelled" : "badge-warning";
    return `<span class="badge ${cls}">${escapeHtml(s)}</span>`;
  };

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Member</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>
          ${loans.map(l => `
            <tr>
              <td>${escapeHtml(memberName(l.member ? l.member.memberId : l.memberId))}</td>
              <td class="table-amount">${formatCurrency(l.amount)}</td>
              <td>${formatDate(l.loanDate)}</td>
              <td>${statusBadge(l.status)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

loadDashboard();
