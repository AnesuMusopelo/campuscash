const defaultApplications = [
  {
    name: 'Keabetswe Dintle', omang: '32900871', studentId: 'UB20260091', institution: 'University of Botswana',
    phone: '71 111 222', income: 1200, amount: 500, term: '21 days', purpose: 'Food and transport',
    status: 'approved', score: 78, wallet: 500, repaid: 0, createdAt: 'Today · 09:12', dueDate: futureDate(21)
  },
  {
    name: 'Mpho K.', omang: '45892110', studentId: 'BAC20260119', institution: 'Botswana Accountancy College',
    phone: '73 876 122', income: 900, amount: 350, term: '14 days', purpose: 'Study materials',
    status: 'review', score: 59, wallet: 0, repaid: 0, createdAt: 'Today · 10:04', dueDate: futureDate(14)
  },
  {
    name: 'Neo Tshepang', omang: '11223990', studentId: 'BOTHO20260077', institution: 'Botho University',
    phone: '74 000 981', income: 1600, amount: 800, term: '30 days', purpose: 'Accommodation balance',
    status: 'approved', score: 84, wallet: 800, repaid: 200, createdAt: 'Yesterday · 16:20', dueDate: futureDate(30)
  }
];

const STORAGE_KEY = 'campus-cash-investor-demo-v2';

function futureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-BW', { day: 'numeric', month: 'short', year: 'numeric' });
}

function computeRepayment(amount) {
  return Math.round(amount * 1.25 * 100) / 100;
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return { applications: defaultApplications };
  try { return JSON.parse(saved); } catch { return { applications: defaultApplications }; }
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

let state = loadState();
let currentPortalStudentId = state.applications[0]?.studentId || '';

const screens = document.querySelectorAll('.screen');
const navBtns = document.querySelectorAll('.nav-btn');
const amountInput = document.querySelector('input[name="amount"]');
const amountValue = document.getElementById('amountValue');
const repaymentValue = document.getElementById('repaymentValue');
const applicationForm = document.getElementById('applicationForm');
const decisionCard = document.getElementById('decisionCard');
const adminList = document.getElementById('adminList');

function showScreen(screen) {
  screens.forEach(el => el.classList.toggle('active', el.id === `screen-${screen}`));
  navBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.screen === screen));
}

document.querySelectorAll('[data-screen]').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.screen));
});
document.querySelectorAll('[data-target]').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.target));
});

function updateSlider() {
  const amount = Number(amountInput.value);
  amountValue.textContent = `P${amount}`;
  repaymentValue.textContent = `Repay P${computeRepayment(amount)}`;
}
amountInput?.addEventListener('input', updateSlider);
updateSlider();

applicationForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(applicationForm);
  const amount = Number(form.get('amount'));
  const income = Number(form.get('income'));
  const score = Math.max(45, Math.min(91, Math.round((income / Math.max(amount, 1)) * 28 + (amount <= 650 ? 38 : 20))));
  const approved = score >= 62 && amount <= Math.max(350, income * 0.75);
  const app = {
    name: form.get('name'),
    omang: form.get('omang'),
    studentId: String(form.get('studentId')).trim(),
    institution: form.get('institution'),
    phone: form.get('phone'),
    income,
    amount,
    term: form.get('term'),
    purpose: form.get('purpose'),
    status: approved ? 'approved' : 'review',
    score,
    wallet: approved ? amount : 0,
    repaid: 0,
    createdAt: 'Just now',
    dueDate: futureDate(parseInt(String(form.get('term')), 10) || 21)
  };

  const existingIndex = state.applications.findIndex(x => x.studentId.toLowerCase() === app.studentId.toLowerCase());
  if (existingIndex >= 0) state.applications[existingIndex] = app;
  else state.applications.unshift(app);
  currentPortalStudentId = app.studentId;
  saveState();
  renderDecision(app);
  renderAdmin();
  renderPortal();
});

function renderDecision(app) {
  decisionCard.classList.remove('hidden');
  const approved = app.status === 'approved';
  document.getElementById('decisionBadge').textContent = approved ? 'Approved' : 'Manual review';
  document.getElementById('decisionBadge').className = `tag ${approved ? 'approved' : 'neutral'}`;
  document.getElementById('decisionName').textContent = app.name;
  document.getElementById('decisionStudentId').textContent = app.studentId;
  document.getElementById('decisionAmount').textContent = `P${app.amount}`;
  document.getElementById('decisionRepayment').textContent = `P${computeRepayment(app.amount)}`;
  document.getElementById('decisionScore').textContent = `${app.score}/100`;
  document.getElementById('decisionReason').textContent = approved
    ? 'Profile passed demo checks for affordability, amount requested, and verification completeness.'
    : 'Profile has been sent to manual review to validate affordability and repayment readiness.';
}

function formatStatus(status) {
  return status === 'approved' ? 'Approved' : status === 'repaid' ? 'Repaid' : status === 'rejected' ? 'Rejected' : 'In review';
}

function renderAdmin() {
  const apps = state.applications;
  const approved = apps.filter(a => a.status === 'approved');
  const outstanding = approved.reduce((sum, a) => sum + Math.max(0, a.amount - (a.repaid || 0)), 0);
  const expected = approved.reduce((sum, a) => sum + computeRepayment(a.amount), 0);

  document.getElementById('metricApplications').textContent = apps.length;
  document.getElementById('metricApproved').textContent = approved.length;
  document.getElementById('metricOutstanding').textContent = `P${outstanding}`;
  document.getElementById('metricExpected').textContent = `P${expected}`;

  adminList.innerHTML = apps.map(app => `
    <article class="admin-item">
      <div class="admin-item-top">
        <div>
          <strong>${app.name}</strong>
          <small>${app.studentId} · ${app.institution}</small>
        </div>
        <span class="tag ${app.status === 'approved' ? 'approved' : 'neutral'}">${formatStatus(app.status)}</span>
      </div>
      <div class="admin-meta">
        <div><span class="mini-label">Amount</span><strong>P${app.amount}</strong></div>
        <div><span class="mini-label">Repayment</span><strong>P${computeRepayment(app.amount)}</strong></div>
        <div><span class="mini-label">Risk score</span><strong>${app.score}/100</strong></div>
        <div><span class="mini-label">Due date</span><strong>${app.dueDate}</strong></div>
      </div>
      <div class="admin-actions">
        <button class="btn-success" onclick="updateApplication('${app.studentId}', 'approved')">Approve</button>
        <button class="btn-warning" onclick="updateApplication('${app.studentId}', 'review')">Review</button>
        <button class="btn-danger" onclick="markRepaid('${app.studentId}')">Mark repaid</button>
      </div>
    </article>
  `).join('');
}

window.updateApplication = function(studentId, status) {
  state.applications = state.applications.map(app => app.studentId === studentId ? { ...app, status, wallet: status === 'approved' ? app.amount : 0 } : app);
  saveState();
  renderAdmin();
  renderPortal();
};

window.markRepaid = function(studentId) {
  state.applications = state.applications.map(app => app.studentId === studentId ? { ...app, status: 'repaid', repaid: app.amount, wallet: 0 } : app);
  saveState();
  renderAdmin();
  renderPortal();
};

function renderPortal() {
  const input = document.getElementById('portalLookup');
  if (input && !input.value) input.value = currentPortalStudentId;
  const studentId = (input?.value || currentPortalStudentId || '').trim().toLowerCase();
  const app = state.applications.find(x => x.studentId.toLowerCase() === studentId) || state.applications[0];
  if (!app) return;
  currentPortalStudentId = app.studentId;
  document.getElementById('portalName').textContent = app.name;
  document.getElementById('portalHandle').textContent = `@${app.studentId.toLowerCase()}`;
  document.getElementById('walletBalance').textContent = `P${app.wallet || 0}`;
  document.getElementById('currentLoan').textContent = `P${app.status === 'approved' ? app.amount : 0}`;
  document.getElementById('amountDue').textContent = `P${app.status === 'approved' ? computeRepayment(app.amount) - (app.repaid || 0) : 0}`;
  document.getElementById('portalStatus').textContent = formatStatus(app.status);
  document.getElementById('dueDate').textContent = app.dueDate;

  let progress = 0;
  if (app.status === 'approved') progress = Math.min(100, Math.round(((app.repaid || 0) / computeRepayment(app.amount)) * 100));
  if (app.status === 'repaid') progress = 100;
  document.getElementById('progressFill').style.width = `${progress}%`;
  document.getElementById('collectionStage').textContent = app.status === 'repaid' ? 'Closed' : app.status === 'approved' ? 'Pre-due reminder' : app.status === 'review' ? 'Awaiting review' : 'Closed';

  document.getElementById('portalTimeline').innerHTML = [
    `Application submitted · ${app.createdAt}`,
    `KYC checks completed for ${app.institution}`,
    app.status === 'approved' ? `Loan approved and P${app.amount} moved to Campus Wallet` : `Application flagged for manual review`,
    `Repayment target: P${computeRepayment(app.amount)} by ${app.dueDate}`
  ].map(item => `<li>${item}</li>`).join('');
}

document.getElementById('lookupBtn')?.addEventListener('click', renderPortal);
document.getElementById('portalLookup')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); renderPortal(); }
});

const tourBtn = document.getElementById('tourBtn');
const tourModal = document.getElementById('tourModal');
const closeTour = document.getElementById('closeTour');
tourBtn?.addEventListener('click', () => tourModal.classList.remove('hidden'));
closeTour?.addEventListener('click', () => tourModal.classList.add('hidden'));
tourModal?.addEventListener('click', (e) => { if (e.target === tourModal) tourModal.classList.add('hidden'); });

renderAdmin();
renderPortal();
showScreen('home');
