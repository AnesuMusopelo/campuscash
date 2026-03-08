const STORAGE_KEY = 'campus_cash_demo_v3';
const FEE_RATE = 0.25;
const TERM_DAYS = 30;

const el = {
  screens: document.querySelectorAll('.screen'),
  navButtons: document.querySelectorAll('[data-view]'),
  jumpButtons: document.querySelectorAll('[data-jump]'),
  calcAmount: document.getElementById('calcAmount'),
  calcAmountValue: document.getElementById('calcAmountValue'),
  principalValue: document.getElementById('principalValue'),
  feeValue: document.getElementById('feeValue'),
  repaymentValue: document.getElementById('repaymentValue'),
  applicationForm: document.getElementById('applicationForm'),
  previewPrincipal: document.getElementById('previewPrincipal'),
  previewFee: document.getElementById('previewFee'),
  previewTotal: document.getElementById('previewTotal'),
  previewDueDate: document.getElementById('previewDueDate'),
  prefillSample: document.getElementById('prefillSample'),
  lookupStudentId: document.getElementById('lookupStudentId'),
  loadStudentBtn: document.getElementById('loadStudentBtn'),
  studentEmpty: document.getElementById('studentEmpty'),
  studentDashboard: document.getElementById('studentDashboard'),
  studentSummaryCards: document.getElementById('studentSummaryCards'),
  studentProfileDetails: document.getElementById('studentProfileDetails'),
  activeLoanDetails: document.getElementById('activeLoanDetails'),
  simulateRepaymentBtn: document.getElementById('simulateRepaymentBtn'),
  studentHistoryBody: document.getElementById('studentHistoryBody'),
  adminMetrics: document.getElementById('adminMetrics'),
  portfolioBreakdown: document.getElementById('portfolioBreakdown'),
  recentActivity: document.getElementById('recentActivity'),
  applicationCards: document.getElementById('applicationCards'),
  adminSearch: document.getElementById('adminSearch'),
  seedDemoDataBtn: document.getElementById('seedDemoDataBtn'),
  clearDataBtn: document.getElementById('clearDataBtn'),
  toast: document.getElementById('toast'),
  openMenuBtn: document.getElementById('openMenuBtn'),
  closeMenuBtn: document.getElementById('closeMenuBtn'),
  quickSheet: document.getElementById('quickSheet')
};

function safeId() {
  return (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

function addDaysISO(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function currency(n) {
  return new Intl.NumberFormat('en-BW', {
    style: 'currency',
    currency: 'BWP',
    maximumFractionDigits: 0
  }).format(Number(n || 0));
}

function formatDate(v) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-BW', { year: 'numeric', month: 'short', day: 'numeric' });
}

function computeTotals(amount) {
  const principal = Number(amount || 0);
  const fee = Math.round(principal * FEE_RATE);
  return { principal, fee, total: principal + fee };
}

function sampleData() {
  return {
    applications: [
      {
        id: safeId(),
        fullName: 'Kabelo Dube',
        studentId: 'UB20260091',
        campus: 'University of Botswana',
        yearOfStudy: '3',
        phone: '71234567',
        email: 'kabelo@example.com',
        amount: 1000,
        purpose: 'Transport',
        incomeSource: 'Allowance',
        monthlyIncome: 2200,
        guardianName: 'Neo Dube',
        guardianPhone: '72123456',
        notes: 'Needs support before allowance date.',
        status: 'approved',
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        dueDate: addDaysISO(new Date(), 28),
        repaymentTotal: 1250,
        feeAmount: 250,
        decisionReason: 'Affordable against stated support level.',
        repaidAt: null
      },
      {
        id: safeId(),
        fullName: 'Mpho K.',
        studentId: 'BAC20260119',
        campus: 'Botswana Accountancy College',
        yearOfStudy: '2',
        phone: '73334445',
        email: 'mpho@example.com',
        amount: 600,
        purpose: 'Food & essentials',
        incomeSource: 'Parent/guardian support',
        monthlyIncome: 1000,
        guardianName: 'Kgomotso K.',
        guardianPhone: '74441122',
        notes: '',
        status: 'pending',
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
        approvedAt: null,
        dueDate: null,
        repaymentTotal: 750,
        feeAmount: 150,
        decisionReason: 'Awaiting demo review.',
        repaidAt: null
      },
      {
        id: safeId(),
        fullName: 'Thato M.',
        studentId: 'BOTHO20260077',
        campus: 'Botho University',
        yearOfStudy: '1',
        phone: '75556667',
        email: 'thato@example.com',
        amount: 2000,
        purpose: 'Accommodation shortfall',
        incomeSource: 'Part-time work',
        monthlyIncome: 1500,
        guardianName: 'Pako M.',
        guardianPhone: '76667788',
        notes: 'High request relative to support.',
        status: 'rejected',
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        approvedAt: null,
        dueDate: null,
        repaymentTotal: 2500,
        feeAmount: 500,
        decisionReason: 'Requested amount appears too high relative to declared support.',
        repaidAt: null
      }
    ]
  };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = sampleData();
    saveData(seeded);
    return seeded;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const seeded = sampleData();
    saveData(seeded);
    return seeded;
  }
}

let db = loadData();

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => el.toast.classList.add('hidden'), 2600);
}

function badge(status) {
  return `<span class="badge ${status}">${status}</span>`;
}

function metricCard(label, value) {
  return `<div class="metric-card"><strong>${value}</strong><span>${label}</span></div>`;
}

function switchView(view) {
  el.screens.forEach(screen => screen.classList.toggle('active', screen.id === view));
  el.navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
  closeSheet();
}

function openSheet() { el.quickSheet.classList.remove('hidden'); }
function closeSheet() { el.quickSheet.classList.add('hidden'); }

el.navButtons.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
el.jumpButtons.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.jump)));
el.openMenuBtn.addEventListener('click', openSheet);
el.closeMenuBtn.addEventListener('click', closeSheet);
el.quickSheet.addEventListener('click', (e) => { if (e.target === el.quickSheet) closeSheet(); });
document.querySelectorAll('.sheet-action').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.jump)));

function updateCalculator(amount) {
  const { principal, fee, total } = computeTotals(amount);
  el.calcAmountValue.textContent = currency(principal);
  el.principalValue.textContent = currency(principal);
  el.feeValue.textContent = currency(fee);
  el.repaymentValue.textContent = currency(total);
}

function updatePreview() {
  const amount = document.getElementById('amount').value || 0;
  const { principal, fee, total } = computeTotals(amount);
  el.previewPrincipal.textContent = currency(principal);
  el.previewFee.textContent = currency(fee);
  el.previewTotal.textContent = currency(total);
  el.previewDueDate.textContent = formatDate(addDaysISO(new Date(), TERM_DAYS));
}

el.calcAmount.addEventListener('input', (e) => updateCalculator(e.target.value));
document.getElementById('amount').addEventListener('input', updatePreview);
updateCalculator(el.calcAmount.value);
updatePreview();

el.prefillSample.addEventListener('click', () => {
  const demo = {
    fullName: 'Tshepiso Ndlovu',
    studentId: 'BAC20260201',
    campus: 'Botswana Accountancy College',
    yearOfStudy: '4',
    phone: '71112233',
    email: 'tshepiso@example.com',
    amount: '1200',
    purpose: 'Registration fees',
    incomeSource: 'Allowance',
    monthlyIncome: '2500',
    guardianName: 'Lindiwe Ndlovu',
    guardianPhone: '72223344',
    notes: 'Needs a quick short-term advance.'
  };
  Object.entries(demo).forEach(([id, value]) => { document.getElementById(id).value = value; });
  document.getElementById('consent').checked = true;
  updatePreview();
  showToast('Demo application filled.');
});

function scoreApplication(app) {
  let score = 0;
  if (app.amount >= 300 && app.amount <= 2500) score += 30;
  if (app.monthlyIncome >= app.repaymentTotal) score += 35;
  if (app.monthlyIncome >= app.amount * 1.2) score += 15;
  if (app.guardianPhone && app.guardianName) score += 10;
  if (app.campus && app.studentId) score += 10;
  return score;
}

function autoDecision(app) {
  const score = scoreApplication(app);
  if (score >= 70) {
    return {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      dueDate: addDaysISO(new Date(), TERM_DAYS),
      decisionReason: 'Meets demo affordability and completeness checks.'
    };
  }
  return {
    status: 'pending',
    approvedAt: null,
    dueDate: null,
    decisionReason: 'Requires manual review in the admin dashboard.'
  };
}

el.applicationForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(el.applicationForm).entries());
  const { principal, fee, total } = computeTotals(formData.amount);

  const app = {
    id: safeId(),
    fullName: formData.fullName.trim(),
    studentId: formData.studentId.trim().toUpperCase(),
    campus: formData.campus,
    yearOfStudy: formData.yearOfStudy,
    phone: formData.phone.trim(),
    email: formData.email.trim(),
    amount: principal,
    purpose: formData.purpose,
    incomeSource: formData.incomeSource,
    monthlyIncome: Number(formData.monthlyIncome),
    guardianName: formData.guardianName.trim(),
    guardianPhone: formData.guardianPhone.trim(),
    notes: formData.notes.trim(),
    submittedAt: new Date().toISOString(),
    repaymentTotal: total,
    feeAmount: fee,
    repaidAt: null
  };

  Object.assign(app, autoDecision(app));
  db.applications.unshift(app);
  saveData(db);
  el.applicationForm.reset();
  updatePreview();
  renderAdmin(el.adminSearch.value);
  renderStudent(app.studentId);
  el.lookupStudentId.value = app.studentId;
  switchView('student');
  showToast(`Application submitted. Status: ${app.status}.`);
});

function renderStudent(studentId) {
  const apps = db.applications.filter(app => app.studentId.toUpperCase() === studentId.toUpperCase());
  if (!apps.length) {
    el.studentEmpty.classList.remove('hidden');
    el.studentDashboard.classList.add('hidden');
    return;
  }

  const latest = apps[0];
  const activeLoan = apps.find(a => a.status === 'approved');
  const totalBorrowed = apps.filter(a => ['approved', 'repaid'].includes(a.status)).reduce((sum, a) => sum + a.amount, 0);
  const totalDue = apps.filter(a => a.status === 'approved').reduce((sum, a) => sum + a.repaymentTotal, 0);

  el.studentEmpty.classList.add('hidden');
  el.studentDashboard.classList.remove('hidden');

  el.studentSummaryCards.innerHTML = [
    metricCard('Applications', apps.length),
    metricCard('Total borrowed', currency(totalBorrowed)),
    metricCard('Outstanding due', currency(totalDue)),
    metricCard('Latest status', latest.status)
  ].join('');

  el.studentProfileDetails.innerHTML = [
    ['Name', latest.fullName],
    ['Student ID', latest.studentId],
    ['Institution', latest.campus],
    ['Year of study', latest.yearOfStudy],
    ['Phone', latest.phone],
    ['Email', latest.email]
  ].map(([k, v]) => `<div class="detail-row"><span>${k}</span><strong>${v || '—'}</strong></div>`).join('');

  if (activeLoan) {
    el.activeLoanDetails.innerHTML = [
      ['Principal', currency(activeLoan.amount)],
      ['Fee', currency(activeLoan.feeAmount)],
      ['Total due', currency(activeLoan.repaymentTotal)],
      ['Due date', formatDate(activeLoan.dueDate)],
      ['Purpose', activeLoan.purpose],
      ['Status', badge(activeLoan.status)]
    ].map(([k, v]) => `<div class="detail-row"><span>${k}</span><strong>${v}</strong></div>`).join('');
    el.simulateRepaymentBtn.dataset.id = activeLoan.id;
    el.simulateRepaymentBtn.disabled = false;
  } else {
    el.activeLoanDetails.innerHTML = `<div class="detail-row"><span>Active loan</span><strong>No current approved loan</strong></div>`;
    el.simulateRepaymentBtn.dataset.id = '';
    el.simulateRepaymentBtn.disabled = true;
  }

  el.studentHistoryBody.innerHTML = apps.map(app => `
    <div class="history-card">
      <strong>${currency(app.amount)}</strong>
      <span>${app.purpose}</span>
      <div>${badge(app.status)}</div>
      <span>${formatDate(app.submittedAt)} · Repayment ${currency(app.repaymentTotal)}</span>
    </div>
  `).join('');
}

function updateApplicationStatus(id, action) {
  const app = db.applications.find(a => a.id === id);
  if (!app) return;

  if (action === 'approve') {
    app.status = 'approved';
    app.approvedAt = new Date().toISOString();
    app.dueDate = addDaysISO(new Date(), TERM_DAYS);
    app.decisionReason = 'Approved manually by admin demo.';
  }
  if (action === 'reject') {
    app.status = 'rejected';
    app.approvedAt = null;
    app.dueDate = null;
    app.decisionReason = 'Rejected manually by admin demo.';
  }
  if (action === 'repaid') {
    app.status = 'repaid';
    app.repaidAt = new Date().toISOString();
    app.decisionReason = 'Marked repaid in demo.';
  }
  saveData(db);
}

function renderAdmin(search = '') {
  const apps = db.applications.filter(app => {
    const hay = `${app.fullName} ${app.studentId} ${app.campus}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  const approved = db.applications.filter(a => a.status === 'approved');
  const pending = db.applications.filter(a => a.status === 'pending');
  const rejected = db.applications.filter(a => a.status === 'rejected');
  const repaid = db.applications.filter(a => a.status === 'repaid');
  const totalDisbursed = approved.concat(repaid).reduce((sum, a) => sum + a.amount, 0);
  const expectedRepayments = approved.concat(repaid).reduce((sum, a) => sum + a.repaymentTotal, 0);

  el.adminMetrics.innerHTML = [
    metricCard('Total applications', db.applications.length),
    metricCard('Pending review', pending.length),
    metricCard('Active approved', approved.length),
    metricCard('Expected repayments', currency(expectedRepayments))
  ].join('');

  el.portfolioBreakdown.innerHTML = [
    ['Total principal issued', currency(totalDisbursed)],
    ['Projected fee income', currency(expectedRepayments - totalDisbursed)],
    ['Repaid loans', repaid.length],
    ['Rejected applications', rejected.length]
  ].map(([k, v]) => `<div class="stack-item"><strong>${k}</strong><div>${v}</div></div>`).join('');

  el.recentActivity.innerHTML = [...db.applications].slice(0, 5).map(app => `
    <div class="stack-item">
      <strong>${app.fullName}</strong>
      <div>${app.studentId} · ${currency(app.amount)}</div>
      <div>${formatDate(app.submittedAt)} · ${app.status}</div>
    </div>
  `).join('');

  el.applicationCards.innerHTML = apps.map(app => `
    <article class="app-card">
      <div class="app-card-head">
        <div>
          <strong>${app.fullName}</strong>
          <p>${app.studentId} · ${app.campus}</p>
        </div>
        ${badge(app.status)}
      </div>
      <div class="app-card-body">
        <div class="detail-row"><span>Requested</span><strong>${currency(app.amount)}</strong></div>
        <div class="detail-row"><span>Total repayment</span><strong>${currency(app.repaymentTotal)}</strong></div>
        <div class="detail-row"><span>Submitted</span><strong>${formatDate(app.submittedAt)}</strong></div>
        <div class="detail-row"><span>Decision note</span><strong>${app.decisionReason || '—'}</strong></div>
      </div>
      <div class="app-card-foot">
        <div class="actions-row">
          ${app.status === 'pending' ? `
            <button class="small-btn approve" data-action="approve" data-id="${app.id}">Approve</button>
            <button class="small-btn reject" data-action="reject" data-id="${app.id}">Reject</button>
          ` : ''}
          ${app.status === 'approved' ? `<button class="small-btn repay" data-action="repaid" data-id="${app.id}">Mark repaid</button>` : ''}
        </div>
        <button class="small-btn" data-action="viewStudent" data-id="${app.studentId}">Open student</button>
      </div>
    </article>
  `).join('');
}

el.loadStudentBtn.addEventListener('click', () => {
  const id = el.lookupStudentId.value.trim();
  if (!id) return showToast('Enter a student ID first.');
  renderStudent(id);
});

el.simulateRepaymentBtn.addEventListener('click', () => {
  const id = el.simulateRepaymentBtn.dataset.id;
  if (!id) return;
  updateApplicationStatus(id, 'repaid');
  const app = db.applications.find(a => a.id === id);
  renderStudent(app.studentId);
  renderAdmin(el.adminSearch.value);
  showToast('Repayment recorded in demo mode.');
});

el.adminSearch.addEventListener('input', (e) => renderAdmin(e.target.value));
el.seedDemoDataBtn.addEventListener('click', () => {
  db = sampleData();
  saveData(db);
  renderAdmin();
  renderStudent('UB20260091');
  el.lookupStudentId.value = 'UB20260091';
  showToast('Demo data reset.');
});
el.clearDataBtn.addEventListener('click', () => {
  db = { applications: [] };
  saveData(db);
  renderAdmin();
  el.studentEmpty.classList.remove('hidden');
  el.studentDashboard.classList.add('hidden');
  showToast('All demo data cleared.');
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if (action === 'viewStudent') {
    el.lookupStudentId.value = id;
    renderStudent(id);
    switchView('student');
    return;
  }

  updateApplicationStatus(id, action);
  renderAdmin(el.adminSearch.value);
  const app = db.applications.find(a => a.id === id);
  if (app) renderStudent(app.studentId);
  showToast(`Application updated: ${action}.`);
});

renderAdmin();
renderStudent('UB20260091');
el.lookupStudentId.value = 'UB20260091';
switchView('home');
