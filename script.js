const state = {
  user: JSON.parse(localStorage.getItem("campusCashUser")) || {
    name: "Neo Molefe",
    studentId: "UB20260091",
    school: "University of Botswana"
  },
  loan: JSON.parse(localStorage.getItem("campusCashLoan")) || {
    amount: 0,
    fee: 0,
    total: 0,
    days: 14,
    reason: "Food & groceries",
    income: 1500,
    status: "ready",
    dueDate: null,
    walletBalance: 0,
    outstanding: 0,
    repaidFraction: 0
  }
};

const screens = [...document.querySelectorAll(".screen")];
const nav = document.getElementById("bottomNav");
const toast = document.getElementById("toast");

function saveState() {
  localStorage.setItem("campusCashUser", JSON.stringify(state.user));
  localStorage.setItem("campusCashLoan", JSON.stringify(state.loan));
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString();
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function openScreen(id) {
  screens.forEach(s => s.classList.toggle("active", s.id === id));
  const authenticated = id !== "screen-auth";
  nav.classList.toggle("hidden", !authenticated);
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.open === id);
  });
  if (id === "screen-auth") nav.classList.add("hidden");
}

document.querySelectorAll("[data-open]").forEach(btn => {
  btn.addEventListener("click", () => openScreen(btn.dataset.open));
});

document.querySelectorAll("[data-auth-tab]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    const signup = btn.dataset.authTab === "signup";
    document.getElementById("signupForm").classList.toggle("active", signup);
    document.getElementById("loginForm").classList.toggle("active", !signup);
  });
});

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("loginStudentId").value.trim();
  if (id) state.user.studentId = id;
  saveState();
  hydrate();
  openScreen("screen-home");
  showToast("Logged in to demo account");
});

document.getElementById("signupForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("signupName").value.trim() || "New Student";
  const school = document.getElementById("signupSchool").value;
  const studentId = document.getElementById("signupStudentId").value.trim() || "UB20260111";
  state.user = { name, school, studentId };
  state.loan = {
    amount: 0, fee: 0, total: 0, days: 14, reason: "Food & groceries", income: 1500,
    status: "ready", dueDate: null, walletBalance: 0, outstanding: 0, repaidFraction: 0
  };
  saveState();
  hydrate();
  openScreen("screen-home");
  showToast("Demo account created");
});

const amountInput = document.getElementById("loanAmount");
const requestedValue = document.getElementById("requestedValue");
const feeValue = document.getElementById("feeValue");
const repaymentValue = document.getElementById("repaymentValue");
let selectedDays = 14;

function updateLoanPreview() {
  const amount = Number(amountInput.value);
  const fee = Math.round(amount * 0.25);
  const total = amount + fee;
  requestedValue.textContent = formatMoney(amount);
  feeValue.textContent = formatMoney(fee);
  repaymentValue.textContent = formatMoney(total);
}
amountInput.addEventListener("input", updateLoanPreview);
updateLoanPreview();

document.querySelectorAll(".term-chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".term-chip").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    selectedDays = Number(btn.dataset.days);
  });
});

document.getElementById("submitApplication").addEventListener("click", () => {
  const amount = Number(amountInput.value);
  const fee = Math.round(amount * 0.25);
  const total = amount + fee;
  const income = Number(document.getElementById("incomeValue").value || 0);
  const approved = income >= total * 1.2 && amount <= 800;
  const due = new Date();
  due.setDate(due.getDate() + selectedDays);

  state.loan.amount = amount;
  state.loan.fee = fee;
  state.loan.total = total;
  state.loan.days = selectedDays;
  state.loan.reason = document.getElementById("loanReason").value;
  state.loan.income = income;
  state.loan.dueDate = due.toISOString();
  state.loan.walletBalance = 0;
  state.loan.outstanding = approved ? total : 0;
  state.loan.repaidFraction = 0;
  state.loan.status = approved ? "approved" : "declined";
  saveState();
  hydrate();
  openScreen("screen-status");
  showToast(approved ? "Loan approved in demo" : "Loan declined in demo");
});

document.getElementById("simulateDisbursement").addEventListener("click", () => {
  if (state.loan.status !== "approved") {
    showToast("Approve a demo loan first");
    return;
  }
  if (state.loan.walletBalance >= state.loan.amount) {
    showToast("Funds already disbursed");
    return;
  }
  state.loan.walletBalance = state.loan.amount;
  state.loan.status = "funded";
  saveState();
  hydrate();
  showToast("Wallet funded");
});

document.querySelectorAll(".repay-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (!["approved", "funded", "partial"].includes(state.loan.status)) {
      showToast("No active loan to repay");
      return;
    }
    const fraction = Number(btn.dataset.pay);
    if (fraction === 1) {
      state.loan.repaidFraction = 1;
      state.loan.outstanding = 0;
      state.loan.status = "repaid";
    } else {
      state.loan.repaidFraction = Math.max(state.loan.repaidFraction, 0.5);
      state.loan.outstanding = Math.round(state.loan.total * 0.5);
      state.loan.status = "partial";
    }
    saveState();
    hydrate();
    openScreen("screen-status");
    showToast(state.loan.status === "repaid" ? "Loan fully repaid" : "50% repayment recorded");
  });
});

function hydrate() {
  const firstName = state.user.name.split(" ")[0] || state.user.name;
  document.getElementById("welcomeName").textContent = firstName;
  document.getElementById("profileName").textContent = state.user.name;
  document.getElementById("profileHandle").textContent = "@" + state.user.studentId;
  document.getElementById("avatarInitial").textContent = firstName.charAt(0).toUpperCase();
  document.getElementById("eligibleAmount").textContent = state.loan.status === "repaid" || state.loan.status === "ready" ? "800" : "0";

  const statusMap = {
    ready: "Ready",
    approved: "Approved",
    funded: "Funded",
    partial: "Part-paid",
    repaid: "Repaid",
    declined: "Declined"
  };

  const homeTitle = {
    ready: "No active loan",
    approved: `P${formatMoney(state.loan.total)} due`,
    funded: `P${formatMoney(state.loan.total)} due`,
    partial: `P${formatMoney(state.loan.outstanding)} left`,
    repaid: "Loan settled",
    declined: "Application declined"
  };
  document.getElementById("homeLoanState").textContent = homeTitle[state.loan.status];
  document.getElementById("loanStatusPill").textContent = statusMap[state.loan.status];

  const progressPct = state.loan.status === "repaid" ? 100 : state.loan.status === "partial" ? 50 : state.loan.status === "funded" || state.loan.status === "approved" ? 20 : 0;
  document.getElementById("homeProgress").style.width = progressPct + "%";
  document.getElementById("progressLeft").textContent = state.loan.status === "ready" ? "No repayment due"
    : state.loan.status === "declined" ? "Not approved"
    : state.loan.status === "repaid" ? "Loan completed"
    : `Outstanding P${formatMoney(state.loan.outstanding || state.loan.total)}`;
  document.getElementById("dueDateBadge").textContent = formatDate(state.loan.dueDate);

  document.getElementById("statusLabel").textContent = statusMap[state.loan.status];
  document.getElementById("statusAmount").textContent = "P" + formatMoney(state.loan.outstanding || 0);
  document.getElementById("statusDue").textContent = formatDate(state.loan.dueDate);

  const decisionStep = document.getElementById("stepDecision");
  const walletStep = document.getElementById("stepWallet");
  const repayStep = document.getElementById("stepRepay");
  [decisionStep, walletStep, repayStep].forEach(el => { el.classList.remove("done", "active"); });

  const decisionText = document.getElementById("decisionText");
  const walletText = document.getElementById("walletText");
  const repayText = document.getElementById("repayText");

  if (state.loan.status === "ready") {
    decisionText.textContent = "Pending until you submit an application.";
    walletText.textContent = "No funds disbursed yet.";
    repayText.textContent = "No repayment started.";
  } else if (state.loan.status === "declined") {
    decisionStep.classList.add("done");
    decisionText.textContent = "Application declined based on affordability in this demo.";
    walletText.textContent = "No disbursement.";
    repayText.textContent = "No repayment required.";
  } else {
    decisionStep.classList.add("done");
    decisionText.textContent = `Approved for P${formatMoney(state.loan.amount)} over ${state.loan.days} days.`;
    if (state.loan.status === "approved") {
      walletStep.classList.add("active");
      walletText.textContent = "Ready to move funds into wallet.";
      repayText.textContent = "Repayment opens after funding.";
    }
    if (state.loan.status === "funded") {
      walletStep.classList.add("done");
      walletText.textContent = `P${formatMoney(state.loan.walletBalance)} credited to wallet.`;
      repayStep.classList.add("active");
      repayText.textContent = `Outstanding balance P${formatMoney(state.loan.total)}.`;
    }
    if (state.loan.status === "partial") {
      walletStep.classList.add("done");
      repayStep.classList.add("done");
      walletText.textContent = `P${formatMoney(state.loan.walletBalance)} credited to wallet.`;
      repayText.textContent = `50% paid. Remaining P${formatMoney(state.loan.outstanding)}.`;
    }
    if (state.loan.status === "repaid") {
      walletStep.classList.add("done");
      repayStep.classList.add("done");
      walletText.textContent = `P${formatMoney(state.loan.walletBalance)} credited to wallet.`;
      repayText.textContent = "Loan fully repaid.";
    }
  }

  document.getElementById("walletBalance").textContent = formatMoney(state.loan.walletBalance);
  document.getElementById("lastTransfer").textContent = state.loan.walletBalance ? `P${formatMoney(state.loan.walletBalance)} received` : "No disbursement yet";
  document.getElementById("outstandingAmount").textContent = "P" + formatMoney(state.loan.outstanding || 0);
  const repayPct = Math.round((state.loan.repaidFraction || 0) * 100);
  document.getElementById("repayProgressText").textContent = repayPct + "%";
  document.getElementById("repayProgressBar").style.width = repayPct + "%";
}

hydrate();
openScreen("screen-auth");
