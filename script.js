const screens = document.querySelectorAll('.screen');
const navButtons = document.querySelectorAll('.nav-btn');
const navActions = document.querySelectorAll('.nav-action');
const backButtons = document.querySelectorAll('.back-btn');
const authTabs = document.querySelectorAll('[data-auth-tab]');
const authViews = document.querySelectorAll('.auth-view');
const amountPills = document.querySelectorAll('.amount-pill');
const amountSlider = document.getElementById('amount-slider');
const decisionCard = document.getElementById('decision-card');

const defaultProfile = {
  name: 'Nara Berry',
  studentId: 'UB20260091',
  school: 'University of Botswana',
  amount: 0,
  fee: 0,
  total: 0,
  dueDate: '—',
  status: 'none',
  walletBalance: 0,
  activity: []
};

const state = JSON.parse(localStorage.getItem('campusCashStudentDemo') || 'null') || defaultProfile;

function saveState() {
  localStorage.setItem('campusCashStudentDemo', JSON.stringify(state));
}

function switchScreen(id) {
  screens.forEach(screen => screen.classList.toggle('active', screen.id === id));
  const bottomNav = document.getElementById('bottom-nav');
  bottomNav.style.display = id === 'screen-auth' ? 'none' : 'grid';
  navButtons.forEach(btn => {
    const match = btn.dataset.target === id;
    btn.classList.toggle('active', match);
  });
  if (id === 'screen-status') updateTimeline();
  if (id === 'screen-wallet') renderActivity();
}

function setAuthTab(tab) {
  authTabs.forEach(btn => btn.classList.toggle('active', btn.dataset.authTab === tab));
  authViews.forEach(view => view.classList.toggle('active', view.id === `auth-${tab}`));
}

authTabs.forEach(btn => btn.addEventListener('click', () => setAuthTab(btn.dataset.authTab)));
navButtons.forEach(btn => btn.addEventListener('click', () => switchScreen(btn.dataset.target)));
navActions.forEach(btn => btn.addEventListener('click', () => switchScreen(btn.dataset.target)));
backButtons.forEach(btn => btn.addEventListener('click', () => switchScreen(btn.dataset.back)));

document.getElementById('login-btn').addEventListener('click', () => {
  const identifier = document.getElementById('login-identifier').value.trim();
  if (identifier) state.studentId = identifier;
  syncUI();
  switchScreen('screen-home');
});

document.getElementById('signup-btn').addEventListener('click', () => {
  state.name = document.getElementById('signup-name').value.trim() || 'New Student';
  state.school = document.getElementById('signup-school').value;
  state.studentId = document.getElementById('signup-student-id').value.trim() || `CC${Math.floor(100000 + Math.random() * 900000)}`;
  state.activity = [];
  state.amount = 0;
  state.fee = 0;
  state.total = 0;
  state.dueDate = '—';
  state.status = 'none';
  state.walletBalance = 0;
  saveState();
  syncUI();
  switchScreen('screen-home');
});

function currency(value) {
  return `P ${Number(value).toLocaleString()}`;
}

function getDueDateLabel() {
  const due = new Date();
  due.setDate(due.getDate() + 30);
  return due.toLocaleDateString('en-BW', { day: 'numeric', month: 'short', year: 'numeric' });
}

function updateCalculator(amount) {
  const fee = amount * 0.25;
  const total = amount + fee;
  document.getElementById('selected-amount').textContent = currency(amount);
  document.getElementById('selected-fee').textContent = currency(fee);
  document.getElementById('selected-total').textContent = currency(total);
  document.getElementById('selected-date').textContent = getDueDateLabel();
  amountSlider.value = amount;
  amountPills.forEach(p => p.classList.toggle('active', Number(p.dataset.amount) === Number(amount)));
}

amountPills.forEach(pill => pill.addEventListener('click', () => updateCalculator(Number(pill.dataset.amount))));
amountSlider.addEventListener('input', e => updateCalculator(Number(e.target.value)));

function syncUI() {
  document.getElementById('student-name-home').textContent = state.name;
  document.getElementById('profile-name').textContent = state.name;
  document.getElementById('profile-id').textContent = `@${state.studentId}`;
  document.getElementById('profile-avatar').textContent = (state.name || 'S').charAt(0).toUpperCase();
  document.getElementById('available-limit').textContent = state.status === 'active' ? 'P 0' : 'P 800';
  document.getElementById('current-loan-short').textContent = currency(state.amount || 0);
  document.getElementById('due-date-short').textContent = state.dueDate;
  document.getElementById('summary-status').textContent = state.status === 'none' ? 'No active loan' : (state.status === 'repaid' ? 'Loan repaid' : 'Loan active');
  document.getElementById('summary-repayment').textContent = currency(state.total || 0);
  document.getElementById('status-amount').textContent = currency(state.amount || 0);
  document.getElementById('status-fee').textContent = currency(state.fee || 0);
  document.getElementById('status-total').textContent = currency(state.total || 0);
  document.getElementById('status-date').textContent = state.dueDate;
  document.getElementById('repay-outstanding').textContent = currency(state.total || 0);
  document.getElementById('repay-date').textContent = state.dueDate;
  document.getElementById('wallet-balance').textContent = currency(state.walletBalance || 0);
  document.getElementById('decision-student-id').textContent = state.studentId;
  document.getElementById('wallet-state').textContent = state.status === 'active' ? 'Funds available' : (state.status === 'repaid' ? 'Loan settled' : 'No disbursement yet');

  if (state.status === 'none') {
    document.getElementById('status-badge').textContent = 'No active application';
    document.getElementById('status-headline').textContent = 'You have no active loan yet';
    document.getElementById('status-subtext').textContent = 'Apply to see your live journey here.';
  } else if (state.status === 'active') {
    document.getElementById('status-badge').textContent = 'Approved';
    document.getElementById('status-headline').textContent = `${currency(state.amount)} has been approved`;
    document.getElementById('status-subtext').textContent = `Repay ${currency(state.total)} by ${state.dueDate}.`;
  } else if (state.status === 'repaid') {
    document.getElementById('status-badge').textContent = 'Repaid';
    document.getElementById('status-headline').textContent = 'Your last loan was settled';
    document.getElementById('status-subtext').textContent = 'You can apply again when eligible.';
  }

  saveState();
}

function updateTimeline() {
  ['t1','t2','t3','t4'].forEach(id => document.getElementById(id).classList.remove('active'));
  if (state.status === 'none') return;
  document.getElementById('t1').classList.add('active');
  document.getElementById('t2').classList.add('active');
  document.getElementById('t3').classList.add('active');
  if (state.status === 'active' || state.status === 'repaid') {
    document.getElementById('t4').classList.add('active');
  }
}

function renderActivity() {
  const list = document.getElementById('activity-list');
  if (!state.activity.length) {
    list.innerHTML = '<div class="empty-state">No transactions yet.</div>';
    return;
  }
  list.innerHTML = state.activity.map(item => `
    <div class="activity-item">
      <div>
        <strong>${item.title}</strong>
        <small>${item.meta}</small>
      </div>
      <strong>${item.amount}</strong>
    </div>
  `).join('');
}

document.getElementById('submit-application').addEventListener('click', () => {
  const amount = Number(amountSlider.value);
  const fee = amount * 0.25;
  const total = amount + fee;
  state.amount = amount;
  state.fee = fee;
  state.total = total;
  state.dueDate = getDueDateLabel();
  state.status = 'active';
  state.school = document.getElementById('institution').value;
  decisionCard.classList.remove('hidden');
  document.getElementById('decision-amount').textContent = currency(amount);
  document.getElementById('decision-total').textContent = currency(total);
  document.getElementById('decision-text').textContent = `Your ${currency(amount)} demo loan is pre-approved for 30 days.`;
  state.activity.unshift({
    title: 'Application approved',
    meta: `${state.school} • ${new Date().toLocaleDateString('en-BW')}`,
    amount: currency(amount)
  });
  syncUI();
});

document.getElementById('simulate-disbursement').addEventListener('click', () => {
  if (!state.amount || state.status !== 'active') return;
  const alreadyDisbursed = state.activity.some(item => item.title === 'Wallet disbursement');
  if (alreadyDisbursed) return;
  state.walletBalance += state.amount;
  state.activity.unshift({
    title: 'Wallet disbursement',
    meta: 'Campus Cash transfer completed',
    amount: `+${currency(state.amount)}`
  });
  syncUI();
  renderActivity();
});

document.getElementById('repay-now-btn').addEventListener('click', () => {
  if (!state.total || state.status !== 'active') return;
  state.walletBalance = Math.max(0, state.walletBalance - state.total);
  state.activity.unshift({
    title: 'Loan repayment',
    meta: 'Demo repayment completed',
    amount: `-${currency(state.total)}`
  });
  state.status = 'repaid';
  syncUI();
  renderActivity();
  switchScreen('screen-status');
});

document.getElementById('notify-btn').addEventListener('click', () => {
  alert('Demo reminder: your next repayment alert would appear here.');
});

updateCalculator(200);
syncUI();
renderActivity();
switchScreen('screen-auth');
