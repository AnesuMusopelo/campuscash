const STORAGE_KEY = 'campus_cash_demo_v2';
const FEE_RATE = 0.25;
const TERM_DAYS = 30;

const sampleData = () => ({
  applications: [
    {
      id: crypto.randomUUID(),
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
      notes: 'Needs help before allowance date.',
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
      id: crypto.randomUUID(),
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
      decisionReason: '',
      repaidAt: null
    },
    {
      id: crypto.randomUUID(),
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
});

function addDaysISO(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function currency(n) {
  return new Intl.NumberFormat('en-BW', { style: 'currency', currency: 'BWP', maximumFractionDigits: 0 }).format(Number(n || 0));
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

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let db = loadData();

const els = {
  navLinks: document.querySelectorAll('.nav-link'),
  views: document.querySelectorAll('.view'),
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
  loadStudentBtn: document.getElementById('loadStudentBtn'),
  lookupStudentId: document.getElementById('lookupStudentId'),
  studentEmpty: document.getElementById('studentEmpty'),
  studentDashboard: document.getElementById('studentDashboard'),
  studentSummaryCards: document.getElementById('studentSummaryCards'),
  activeLoanDetails: document.getElementById('activeLoanDetails'),
  studentProfileDetails: document.getElementById('studentProfileDetails'),
  studentHistoryBody: document.getElementById('studentHistoryBody'),
  simulateRepaymentBtn: document.getElementById('simulateRepaymentBtn'),
  adminMetrics: document.getElementById('adminMetrics'),
  portfolioBreakdown: document.getElementById('portfolioBreakdown'),
  recentActivity: document.getElementById('recentActivity'),
  applicationTableBody: document.getElementById('applicationTableBody'),
  adminSearch: document.getElementById('adminSearch'),
  seedDemoDataBtn: document.getElementById('seedDemoDataBtn'),
  clearDataBtn: document.getElementById('clearDataBtn'),
  toast: document.getElementById('toast')
};

function showToast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.add('hidden'), 2800);
}

function switchView(name) {
  els.views.forEach(v => v.classList.toggle('active', v.id === name));
  els.navLinks.forEach(btn => btn.classList.toggle('active', btn.dataset.view === name));
}

els.navLinks.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
document.querySelectorAll('[data-jump]').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.jump)));

function updateCalculator(amount) {
  const { principal, fee, total } = computeTotals(amount);
  els.calcAmountValue.textContent = currency(principal);
  els.principalValue.textContent = currency(principal);
  els.feeValue.textContent = currency(fee);
  els.repaymentValue.textContent = currency(total);
}

els.calcAmount.addEventListener('input', e => updateCalculator(e.target.value));
updateCalculator(els.calcAmount.value);

function updatePreview() {
  const amount = document.getElementById('amount').value || 0;
  const { principal, fee, total } = computeTotals(amount);
  els.previewPrincipal.textContent = currency(principal);
  els.previewFee.textContent = currency(fee);
  els.previewTotal.textContent = currency(total);
  els.previewDueDate.textContent = formatDate(addDaysISO(new Date(), TERM_DAYS));
}
['amount'].forEach(id => document.getElementById(id).addEventListener('input', updatePreview));
updatePreview();

els.prefillSample.addEventListener('click', () => {
  const sample = {
    fullName: 'Tshepiso Ndlovu', studentId: 'BAC20260201', campus: 'Botswana Accountancy College', yearOfStudy: '4',
    phone: '71112233', email: 'tshepiso@example.com', amount: '1200', purpose: 'Registration fees', incomeSource: 'Allowance',
    monthlyIncome: '2500', guardianName: 'Lindiwe Ndlovu', guardianPhone: '72223344', notes: 'Needs a quick short-term advance.'
  };
  Object.entries(sample).forEach(([id, value]) => document.getElementById(id).value = value);
  document.getElementById('consent').checked = true;
  updatePreview();
  showToast('Sample application filled.');
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

els.applicationForm.addEventListener('submit', e => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(els.applicationForm).entries());
  const { principal, fee, total } = computeTotals(formData.amount);
  const app = {
    id: crypto.randomUUID(),
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
  els.applicationForm.reset();
  updatePreview();
  renderAdmin();
  renderStudent(app.studentId);
  switchView('student');
  showToast(`Application submitted. Status: ${app.status}. Student ID: ${app.studentId}`);
});

function badge(status) {
  return `<span class="badge ${status}">${status}</span>`;
}

function metricCard(label, value) {
  return `<div class="metric-card"><strong>${value}</strong><span>${label}</span></div>`;
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
  const totalDisbursed = approved.concat(repaid).reduce((s, a) => s + a.amount, 0);
  const expectedRepayments = approved.concat(repaid).reduce((s, a) => s + a.repaymentTotal, 0);

  els.adminMetrics.innerHTML = [
    metricCard('Total applications', db.applications.length),
    metricCard('Pending review', pending.length),
    metricCard('Approved / active', approved.length),
    metricCard('Expected repayments', currency(expectedRepayments))
  ].join('');

  els.portfolioBreakdown.innerHTML = [
    { label: 'Total principal issued', value: currency(totalDisbursed) },
    { label: 'Projected fee income', value: currency(expectedRepayments - totalDisbursed) },
    { label: 'Repaid loans', value: repaid.length },
    { label: 'Rejected applications', value: rejected.length }
  ].map(item => `<div class="stack-item"><strong>${item.label}</strong><div>${item.value}</div></div>`).join('');

  const recent = [...db.applications].slice(0, 5);
  els.recentActivity.innerHTML = recent.map(app => `
    <div class="stack-item">
      <strong>${app.fullName}</strong>
      <div>${app.studentId} • ${badge(app.status)}</div>
      <div>${currency(app.amount)} requested on ${formatDate(app.submittedAt)}</div>
    </div>`).join('');

  els.applicationTableBody.innerHTML = apps.map(app => `
    <tr>
      <td><strong>${app.fullName}</strong><br><span class="helper-text">${app.studentId}</span></td>
      <td>${app.campus}</td>
      <td>${currency(app.amount)}</td>
      <td>${currency(app.repaymentTotal)}</td>
      <td>${badge(app.status)}</td>
      <td>${formatDate(app.submittedAt)}</td>
      <td>
        <div class="action-buttons">
          ${app.status === 'pending' ? `<button class="small-btn approve" data-action="approve" data-id="${app.id}">Approve</button>
          <button class="small-btn reject" data-action="reject" data-id="${app.id}">Reject</button>` : ''}
          ${app.status === 'approved' ? `<button class="small-btn repay" data-action="repaid" data-id="${app.id}">Mark Repaid</button>` : ''}
          <button class="small-btn" data-action="viewStudent" data-id="${app.studentId}">Open Student</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderStudent(studentId) {
  const apps = db.applications.filter(app => app.studentId.toUpperCase() === studentId.toUpperCase());
  if (!apps.length) {
    els.studentEmpty.classList.remove('hidden');
    els.studentDashboard.classList.add('hidden');
    return;
  }

  const latest = apps[0];
  const activeLoan = apps.find(a => a.status === 'approved');
  const totalBorrowed = apps.filter(a => ['approved', 'repaid'].includes(a.status)).reduce((sum, a) => sum + a.amount, 0);
  const totalDue = apps.filter(a => a.status === 'approved').reduce((sum, a) => sum + a.repaymentTotal, 0);

  els.studentEmpty.classList.add('hidden');
  els.studentDashboard.classList.remove('hidden');

  els.studentSummaryCards.innerHTML = [
    metricCard('Applications', apps.length),
    metricCard('Total borrowed', currency(totalBorrowed)),
    metricCard('Outstanding due', currency(totalDue)),
    metricCard('Current status', activeLoan ? 'Active loan' : latest.status)
  ].join('');

  els.studentProfileDetails.innerHTML = [
    ['Name', latest.fullName],
    ['Student ID', latest.studentId],
    ['Institution', latest.campus],
    ['Phone', latest.phone],
    ['Email', latest.email],
    ['Year', latest.yearOfStudy]
  ].map(([k, v]) => `<div class="detail-row"><span>${k}</span><strong>${v || '—'}</strong></div>`).join('');

  if (activeLoan) {
    els.activeLoanDetails.innerHTML = [
      ['Principal', currency(activeLoan.amount)],
      ['Fee', currency(activeLoan.feeAmount)],
      ['Total due', currency(activeLoan.repaymentTotal)],
      ['Due date', formatDate(activeLoan.dueDate)],
      ['Purpose', activeLoan.purpose],
      ['Status', badge(activeLoan.status)]
    ].map(([k, v]) => `<div class="detail-row"><span>${k}</span><strong>${v}</strong></div>`).join('');
    els.simulateRepaymentBtn.dataset.id = activeLoan.id;
    els.simulateRepaymentBtn.disabled = false;
  } else {
    els.activeLoanDetails.innerHTML = `<p class="helper-text">No active approved loan found for this student.</p>`;
    els.simulateRepaymentBtn.dataset.id = '';
    els.simulateRepaymentBtn.disabled = true;
  }

  els.studentHistoryBody.innerHTML = apps.map(app => `
    <tr>
      <td>${formatDate(app.submittedAt)}</td>
      <td>${currency(app.amount)}</td>
      <td>${currency(app.repaymentTotal)}</td>
      <td>${badge(app.status)}</td>
      <td>${app.purpose}</td>
    </tr>
  `).join('');
}

els.loadStudentBtn.addEventListener('click', () => {
  const id = els.lookupStudentId.value.trim();
  if (!id) return showToast('Enter a student ID first.');
  renderStudent(id);
});

els.simulateRepaymentBtn.addEventListener('click', () => {
  const id = els.simulateRepaymentBtn.dataset.id;
  if (!id) return;
  updateApplicationStatus(id, 'repaid');
  const app = db.applications.find(a => a.id === id);
  renderStudent(app.studentId);
  renderAdmin(els.adminSearch.value);
  showToast('Repayment recorded in demo mode.');
});

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

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if (action === 'viewStudent') {
    els.lookupStudentId.value = id;
    renderStudent(id);
    switchView('student');
    return;
  }
  updateApplicationStatus(id, action);
  renderAdmin(els.adminSearch.value);
  const app = db.applications.find(a => a.id === id);
  if (app) renderStudent(app.studentId);
  showToast(`Application updated: ${action}.`);
});

els.adminSearch.addEventListener('input', e => renderAdmin(e.target.value));
els.seedDemoDataBtn.addEventListener('click', () => {
  db = sampleData();
  saveData(db);
  renderAdmin();
  renderStudent('UB20260091');
  showToast('Demo data reset.');
});
els.clearDataBtn.addEventListener('click', () => {
  db = { applications: [] };
  saveData(db);
  renderAdmin();
  els.studentEmpty.classList.remove('hidden');
  els.studentDashboard.classList.add('hidden');
  showToast('All demo data cleared.');
});

renderAdmin();
renderStudent('UB20260091');
