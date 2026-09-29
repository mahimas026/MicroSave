/* ===== Dashboard Page Logic ===== */

import {
  requireAuth,
  renderLayout,
  ICONS,
  api,
  formatCurrency,
  formatDate,
  escapeHtml,
  renderEmpty,
  notifyError
} from "./script.js";

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

    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-icon blue">${ICONS.groups}</div>
      </div>
      <div class="stat-value" id="stat-groups">—</div>
      <div class="stat-label">Total Groups</div>
    </div>

    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-icon teal">${ICONS.members}</div>
      </div>
      <div class="stat-value" id="stat-members">—</div>
      <div class="stat-label">Total Members</div>
    </div>

    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-icon green">${ICONS.contributions}</div>
      </div>
      <div class="stat-value" id="stat-contributions">—</div>
      <div class="stat-label">Total Contributions</div>
    </div>

    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-icon amber">${ICONS.loans}</div>
      </div>
      <div class="stat-value" id="stat-active-loans">—</div>
      <div class="stat-label">Active Loans</div>
    </div>

    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-icon red">${ICONS.repayments}</div>
      </div>
      <div class="stat-value" id="stat-repayments">—</div>
      <div class="stat-label">Total Repayments</div>
    </div>

    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-icon indigo">${ICONS.wallet}</div>
      </div>
      <div class="stat-value" id="stat-balance">—</div>
      <div class="stat-label">Available Balance</div>
    </div>

  </div>

  <div class="dashboard-grid">

    <div class="card">
      <div class="card-header">
        <h3>Recent Contributions</h3>
      </div>

      <div class="card-body no-pad" id="recent-contributions"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Recent Loans</h3>
      </div>

      <div class="card-body no-pad" id="recent-loans"></div>
    </div>

  </div>

  <div class="section-title">Quick Actions</div>

  <div class="quick-actions">

    <a href="groups.html" class="quick-action-btn">
      ${ICONS.groups} Add Group
    </a>

    <a href="members.html" class="quick-action-btn">
      ${ICONS.members} Add Member
    </a>

    <a href="contributions.html" class="quick-action-btn">
      ${ICONS.contributions} Add Contribution
    </a>

    <a href="loans.html" class="quick-action-btn">
      ${ICONS.loans} Create Loan
    </a>

    <a href="repayments.html" class="quick-action-btn">
      ${ICONS.repayments} Add Repayment
    </a>

  </div>
`;


async function loadDashboard() {

  try {

    const [
      groups,
      members,
      contributions,
      loans,
      repayments
    ] = await Promise.all([

      api.get("/groups").catch(() => []),

      api.get("/members").catch(() => []),

      api.get("/contributions").catch(() => []),

      api.get("/loans").catch(() => []),

      api.get("/repayments").catch(() => [])

    ]);


    const groupList =
      Array.isArray(groups) ? groups : [];

    const memberList =
      Array.isArray(members) ? members : [];

    const contribList =
      Array.isArray(contributions) ? contributions : [];

    const loanList =
      Array.isArray(loans) ? loans : [];

    const repayList =
      Array.isArray(repayments) ? repayments : [];


    /* =========================
       SUMMARY STATS
       ========================= */

    // Total Groups
    document.getElementById("stat-groups").textContent =
      groupList.length;


    // Total Members
    document.getElementById("stat-members").textContent =
      memberList.length;


    // Total Contributions
    const totalContrib = contribList.reduce(
      (sum, contribution) =>
        sum + (Number(contribution.amount) || 0),
      0
    );

    document.getElementById("stat-contributions").textContent =
      formatCurrency(totalContrib);


    // Active Loans
    const activeLoans = loanList.filter(
      loan =>
        (loan.status || "").toUpperCase() === "ACTIVE"
    );

    document.getElementById("stat-active-loans").textContent =
      activeLoans.length;


    // Total Repayments
    const totalRepay = repayList.reduce(
      (sum, repayment) =>
        sum + (Number(repayment.amount) || 0),
      0
    );

    document.getElementById("stat-repayments").textContent =
      formatCurrency(totalRepay);


    /* =========================
       AVAILABLE BALANCE
       =========================

       Available Balance =
       Total Contributions
       -
       Outstanding Active Loans
    */

    const outstandingLoans = activeLoans.reduce(
      (sum, loan) =>
        sum + (Number(loan.amount) || 0),
      0
    );

    const availableBalance =
      totalContrib - outstandingLoans;


    document.getElementById("stat-balance").textContent =
      formatCurrency(availableBalance);


    /* =========================
       RECENT CONTRIBUTIONS
       ========================= */

    renderRecentContributions(
      contribList.slice(-5).reverse(),
      memberList
    );


    /* =========================
       RECENT LOANS
       ========================= */

    renderRecentLoans(
      loanList.slice(-5).reverse(),
      memberList
    );


  } catch (err) {

    notifyError(
      "Failed to load dashboard",
      err.message
    );

  }
}


/* =================================
   RECENT CONTRIBUTIONS
   ================================= */

function renderRecentContributions(
  contribs,
  members
) {

  const container =
    document.getElementById("recent-contributions");


  if (!contribs || contribs.length === 0) {

    renderEmpty(
      container,
      "No contributions have been made yet."
    );

    return;
  }


  const memberName = (id) => {

    const member =
      members.find(
        member => member.memberId === id
      );

    return member
      ? member.memberName
      : "Member #" + id;
  };


  container.innerHTML = `

    <div class="table-wrapper">

      <table>

        <thead>

          <tr>
            <th>Member</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>

        </thead>

        <tbody>

          ${contribs.map(contribution => `

            <tr>

              <td>
                ${escapeHtml(
                  memberName(
                    contribution.member
                      ? contribution.member.memberId
                      : contribution.memberId
                  )
                )}
              </td>

              <td class="table-amount">
                ${formatCurrency(
                  contribution.amount
                )}
              </td>

              <td>
                ${formatDate(
                  contribution.contributionDate
                )}
              </td>

            </tr>

          `).join("")}

        </tbody>

      </table>

    </div>

  `;
}


/* =================================
   RECENT LOANS
   ================================= */

function renderRecentLoans(
  loans,
  members
) {

  const container =
    document.getElementById("recent-loans");


  if (!loans || loans.length === 0) {

    renderEmpty(
      container,
      "No loans have been created yet."
    );

    return;
  }


  const memberName = (id) => {

    const member =
      members.find(
        member => member.memberId === id
      );

    return member
      ? member.memberName
      : "Member #" + id;
  };


  const statusBadge = (status) => {

    const s =
      (status || "ACTIVE").toUpperCase();


    const cls =
      s === "ACTIVE"
        ? "badge-active"
        : s === "COMPLETED"
          ? "badge-completed"
          : s === "CANCELLED"
            ? "badge-cancelled"
            : "badge-warning";


    return `
      <span class="badge ${cls}">
        ${escapeHtml(s)}
      </span>
    `;
  };


  container.innerHTML = `

    <div class="table-wrapper">

      <table>

        <thead>

          <tr>
            <th>Member</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
          </tr>

        </thead>

        <tbody>

          ${loans.map(loan => `

            <tr>

              <td>
                ${escapeHtml(
                  memberName(
                    loan.member
                      ? loan.member.memberId
                      : loan.memberId
                  )
                )}
              </td>

              <td class="table-amount">
                ${formatCurrency(
                  loan.amount
                )}
              </td>

              <td>
                ${formatDate(
                  loan.loanDate
                )}
              </td>

              <td>
                ${statusBadge(
                  loan.status
                )}
              </td>

            </tr>

          `).join("")}

        </tbody>

      </table>

    </div>

  `;
}


/* =================================
   LOAD DASHBOARD
   ================================= */

loadDashboard();