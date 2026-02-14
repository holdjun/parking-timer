const nowEl = document.getElementById('now');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const saveBtn = document.getElementById('saveBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

const startTimeEl = document.getElementById('startTime');
const endTimeEl = document.getElementById('endTime');
const durationEl = document.getElementById('duration');
const historyList = document.getElementById('historyList');

let timer = null;
let startTime = null;
let endTime = null;

function pad(n) { return String(n).padStart(2, '0'); }

function fmtTime(d) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function fmtDateTime(d) {
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${y}-${m}-${day} ${fmtTime(d)}`;
}

function fmtDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function tick() {
  const now = new Date();
  nowEl.textContent = fmtTime(now);
  if (startTime && !endTime) {
    durationEl.textContent = fmtDuration(now - startTime);
  }
}

function setButtons() {
  startBtn.disabled = !!startTime && !endTime;
  stopBtn.disabled = !startTime || !!endTime;
  saveBtn.disabled = !(startTime && endTime);
}

function renderHistory() {
  const list = loadHistory();
  historyList.innerHTML = '';
  if (list.length === 0) {
    historyList.innerHTML = '<div class="item" style="color:#9ca3af;">暂无记录</div>';
    clearHistoryBtn.disabled = true;
    return;
  }
  clearHistoryBtn.disabled = false;
  list.forEach((it, idx) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.textContent = `#${idx + 1}  开始：${it.start}  结束：${it.end}  用时：${it.duration}`;
    historyList.appendChild(div);
  });
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem('parkingHistory') || '[]');
  } catch {
    return [];
  }
}

function saveHistory(item) {
  const list = loadHistory();
  list.unshift(item);
  localStorage.setItem('parkingHistory', JSON.stringify(list.slice(0, 200)));
}

startBtn.addEventListener('click', () => {
  startTime = new Date();
  endTime = null;
  startTimeEl.textContent = fmtDateTime(startTime);
  endTimeEl.textContent = '未结束';
  durationEl.textContent = '00:00:00';
  setButtons();
});

stopBtn.addEventListener('click', () => {
  endTime = new Date();
  endTimeEl.textContent = fmtDateTime(endTime);
  durationEl.textContent = fmtDuration(endTime - startTime);
  setButtons();
});

resetBtn.addEventListener('click', () => {
  startTime = null;
  endTime = null;
  startTimeEl.textContent = '未开始';
  endTimeEl.textContent = '未结束';
  durationEl.textContent = '00:00:00';
  setButtons();
});

saveBtn.addEventListener('click', () => {
  if (!startTime || !endTime) return;
  saveHistory({
    start: fmtDateTime(startTime),
    end: fmtDateTime(endTime),
    duration: fmtDuration(endTime - startTime),
  });
  renderHistory();
});

clearHistoryBtn.addEventListener('click', () => {
  localStorage.removeItem('parkingHistory');
  renderHistory();
});

setInterval(tick, 1000);

renderHistory();
setButtons();
tick();
