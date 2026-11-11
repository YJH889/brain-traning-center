
import {
  saveRecord,
  getRecords,
  showRecords
} from "../utils/record.js";

// ===============================
// 专注力训练配置
// ===============================

const MODES = {
  normal: {
    name: "普通模式",
    maxNumber: 20,
    duration: 60,
    points: 10
  },

  hard: {
    name: "困难模式",
    maxNumber: 30,
    duration: 60,
    points: 10
  },

  extreme: {
    name: "突破极限",
    maxNumber: 30,
    duration: 30,
    points: 15
  }
};

let overlay = null;
let currentMode = null;

let timer = null;
let gameStarted = false;
let locked = false;

let timeLeft = 60;
let nextNumber = 1;
let score = 0;
let mistakes = 0;
let correctCount = 0;

let reactionTimes = [];
let questionStartTime = 0;
let gameStartTime = 0;

// ===============================
// 入口
// ===============================

export function startFocusGame() {
  if (overlay) {
    overlay.remove();
  }

  overlay = document.createElement("div");
  overlay.id = "focusOverlay";

  document.body.appendChild(overlay);

  addStyles();
  showModeMenu();
}

// ===============================
// 统一样式
// ===============================

function addStyles() {
  if (document.getElementById("focusStyles")) return;

  const style = document.createElement("style");
  style.id = "focusStyles";

  style.textContent = `
    #focusOverlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      overflow-y: auto;
      background: #f3f6fb;
      font-family: Arial, "Microsoft YaHei", sans-serif;
      color: #263445;
      padding: 20px 14px;
      box-sizing: border-box;
    }

    #focusOverlay * {
      box-sizing: border-box;
    }

    .focus-container {
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
    }

    .focus-back {
      border: 0;
      background: #e4eaf2;
      padding: 9px 14px;
      border-radius: 10px;
      color: #40536b;
      cursor: pointer;
      font-size: 14px;
      transition: background .2s ease;
    }

    .focus-back:hover {
      background: #cbd5e1;
    }

    .focus-header {
      text-align: center;
      margin: 13px 0 18px;
    }

    .focus-icon {
      font-size: 38px;
      margin-bottom: 5px;
    }

    .focus-title {
      font-size: 23px;
      font-weight: bold;
      margin: 5px 0;
    }

    .focus-desc {
      font-size: 13px;
      color: #8290a2;
      margin-top: 7px;
    }

    .focus-card {
      background: white;
      padding: 18px;
      border-radius: 16px;
      margin-bottom: 14px;
      box-shadow: 0 4px 14px rgba(40,60,90,.05);
    }

    .focus-card-title {
      font-size: 17px;
      font-weight: bold;
      margin: 0 0 13px;
    }

    .focus-rule {
      color: #66758a;
      font-size: 13px;
      line-height: 1.9;
    }

    .focus-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .focus-stat {
      background: #f6f8fc;
      padding: 13px 5px;
      border-radius: 11px;
      text-align: center;
    }

    .focus-stat-value {
      font-size: 22px;
      font-weight: bold;
      color: #344b68;
    }

    .focus-stat-label {
      color: #8995a5;
      font-size: 12px;
      margin-top: 5px;
    }

    .focus-mode {
      display: block;
      width: 100%;
      border: 0;
      border-radius: 13px;
      padding: 16px;
      text-align: left;
      cursor: pointer;
      margin-bottom: 11px;
      transition: background .2s ease, transform .2s ease;
    }

    .focus-normal {
      background: #e8f2ff;
      color: #3478d4;
    }

    .focus-normal:hover {
      background: #c9e0ff;
    }

    .focus-hard {
      background: #fff1df;
      color: #e58a35;
    }

    .focus-hard:hover {
      background: #ffdfb8;
    }

    .focus-extreme {
      background: #f0eaff;
      color: #8056bd;
    }

    .focus-extreme:hover {
      background: #dfd0ff;
    }

    .focus-mode:active {
      transform: scale(.98);
    }

    .focus-mode-name {
      font-size: 17px;
      font-weight: bold;
    }

    .focus-mode-desc {
      font-size: 13px;
      margin-top: 7px;
    }

    .focus-record-btn {
      width: 100%;
      border: 0;
      background: #e8f2ff;
      color: #3478d4;
      padding: 14px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: bold;
      cursor: pointer;
      transition: background .2s ease;
    }

    .focus-record-btn:hover {
      background: #c9e0ff;
    }

    .focus-game-top {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 9px;
      margin: 22px 0;
    }

    .focus-dashboard {
      background: white;
      padding: 12px 5px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 3px 10px rgba(40,60,90,.04);
    }

    .focus-dashboard-label {
      color: #8491a2;
      font-size: 12px;
      margin-bottom: 6px;
    }

    .focus-dashboard-value {
      font-size: 21px;
      font-weight: bold;
      color: #405b7d;
    }

    .focus-progress {
      height: 9px;
      background: #e1e7ef;
      border-radius: 20px;
      overflow: hidden;
      margin: 15px 0;
    }

    .focus-progress-fill {
      height: 100%;
      width: 0%;
      background: #27ae60;
      transition: width .2s;
    }

    .focus-game-card {
      background: white;
      border-radius: 18px;
      padding: 20px 14px;
      margin: 15px 0;
      text-align: center;
      box-shadow: 0 4px 14px rgba(40,60,90,.05);
    }

    .focus-message {
      color: #3478d4;
      min-height: 25px;
      font-size: 14px;
      margin: 0 0 15px;
    }

    .focus-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }

    .focus-cell {
      aspect-ratio: 1;
      border: 0;
      border-radius: 9px;
      background: #edf2fa;
      color: #203e6b;
      font-size: 21px;
      font-weight: bold;
      cursor: pointer;
      transition: background .2s ease, transform .2s ease;
    }

    #focusOverlay .focus-cell:hover {
      background: #c9dafa !important;
      transform: scale(1.04);
    }

    #focusOverlay .focus-cell:active {
      transform: scale(.96);
    }

    .focus-cell.done {
      background: #dcf5e7 !important;
      color: #26945a;
      cursor: default;
    }

    .focus-cell.wrong {
      background: #ffe2df !important;
      color: #df6559;
    }

    .focus-start-btn,
    .focus-action {
      width: 100%;
      border: 0;
      border-radius: 11px;
      padding: 14px;
      margin-top: 10px;
      font-size: 15px;
      font-weight: bold;
      cursor: pointer;
      background: #e8f2ff;
      color: #3478d4;
      transition: background .2s ease, transform .2s ease;
    }

    .focus-start-btn:hover,
    .focus-action:hover {
      background: #c9e0ff;
    }

    .focus-start-btn:active,
    .focus-action:active {
      transform: scale(.98);
    }

    .focus-action.secondary {
      background: #eef0f5;
      color: #58677a;
    }

    .focus-action.secondary:hover {
      background: #d9dee8;
    }

    .focus-result-title {
      text-align: center;
      font-size: 23px;
      font-weight: bold;
      margin: 15px 0;
    }

    .focus-result-score {
      text-align: center;
      font-size: 38px;
      font-weight: bold;
      color: #4b82c5;
      margin: 15px 0;
    }

    .focus-result-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .focus-result-item {
      background: #f5f7fb;
      border-radius: 10px;
      padding: 12px 5px;
      text-align: center;
    }

    .focus-result-value {
      font-size: 19px;
      font-weight: bold;
      color: #405b7d;
    }

    .focus-result-label {
      font-size: 12px;
      color: #8793a3;
      margin-top: 5px;
    }
  `;

  document.head.appendChild(style);
}

// ===============================
// 历史统计
// ===============================

function getFocusRecords() {
  const records = getRecords();

  if (!Array.isArray(records)) return [];

  return records.filter(item => item.category === "focus");
}

function getStats() {
  const records = getFocusRecords();

  const count = records.length;

  const best = count
    ? Math.max(...records.map(item => Number(item.score) || 0))
    : 0;

  const passed = records.filter(item => item.completed).length;

  const rate = count
    ? Math.round(passed / count * 100)
    : 0;

  return {
    count,
    best,
    passed,
    rate
  };
}

// ===============================
// 首页
// ===============================

function showModeMenu() {
  const stats = getStats();

  overlay.innerHTML = `
    <div class="focus-container">

      <button class="focus-back" id="closeFocus">
        ← 返回
      </button>

      <div class="focus-header">
        <div class="focus-icon">🎯</div>
        <div class="focus-title">专注力训练</div>
        <div class="focus-desc">
          训练注意力集中与快速反应能力
        </div>
      </div>

      <div class="focus-card">
        <h3 class="focus-card-title">📖 训练规则</h3>

        <div class="focus-rule">
          1. 页面会随机排列一组数字。<br>
          2. 按照从小到大的顺序依次点击。<br>
          3. 点击正确数字后自动进入下一个数字。<br>
          4. 点击错误数字会增加错误次数。<br>
          5. 在规定时间内完成所有数字挑战。
        </div>
      </div>

      <div class="focus-card">
        <h3 class="focus-card-title">🎯 选择训练模式</h3>

        <button class="focus-mode focus-normal" data-mode="normal">
          <div class="focus-mode-name">普通模式</div>
          <div class="focus-mode-desc">数字1—20 · 限时60秒</div>
        </button>

        <button class="focus-mode focus-hard" data-mode="hard">
          <div class="focus-mode-name">困难模式</div>
          <div class="focus-mode-desc">数字1—30 · 限时60秒</div>
        </button>

        <button class="focus-mode focus-extreme" data-mode="extreme">
          <div class="focus-mode-name">🔥 突破极限挑战</div>
          <div class="focus-mode-desc">数字1—30 · 限时30秒</div>
        </button>
      </div>

      <div class="focus-card">
        <h3 class="focus-card-title">📊 我的训练成绩</h3>

        <div class="focus-stats">

          <div class="focus-stat">
            <div class="focus-stat-value">${stats.count}</div>
            <div class="focus-stat-label">历史训练次数</div>
          </div>

          <div class="focus-stat">
            <div class="focus-stat-value">${stats.best}</div>
            <div class="focus-stat-label">最佳成绩</div>
          </div>

          <div class="focus-stat">
            <div class="focus-stat-value">${stats.passed}</div>
            <div class="focus-stat-label">通关次数</div>
          </div>

          <div class="focus-stat">
            <div class="focus-stat-value">${stats.rate}%</div>
            <div class="focus-stat-label">通关率</div>
          </div>

        </div>
      </div>

      <button class="focus-record-btn" id="viewRecords">
        查看历史成绩
      </button>

    </div>
  `;

  document.getElementById("closeFocus").onclick = closeGame;

  overlay.querySelectorAll("[data-mode]").forEach(button => {
    button.onclick = () => {
      startMode(button.dataset.mode);
    };
  });

  document.getElementById("viewRecords").onclick = () => {
    closeGame();
    showRecords("focus");
  };
}

// ===============================
// 开始模式
// ===============================

function startMode(key) {
  currentMode = MODES[key];

  if (!currentMode) return;

  timeLeft = currentMode.duration;
  nextNumber = 1;
  score = 0;
  mistakes = 0;
  correctCount = 0;

  reactionTimes = [];

  gameStarted = false;
  locked = false;

  showGamePage();
}

// ===============================
// 训练页面
// ===============================

function showGamePage() {
  const numbers = Array.from(
    { length: currentMode.maxNumber },
    (_, index) => index + 1
  );

  // 随机打乱数字
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  overlay.innerHTML = `
    <div class="focus-container">

      <div style="display:flex;justify-content:space-between;align-items:center;">
        <button class="focus-back" id="quitGame">
          ← 退出
        </button>

        <b style="color:#526176;">${currentMode.name}</b>
      </div>

      <div class="focus-game-top">

        <div class="focus-dashboard">
          <div class="focus-dashboard-label">下一个数字</div>
          <div class="focus-dashboard-value" id="nextNumber">1</div>
        </div>

        <div class="focus-dashboard">
          <div class="focus-dashboard-label">剩余时间</div>
          <div class="focus-dashboard-value" id="timeLeft">${timeLeft}</div>
        </div>

        <div class="focus-dashboard">
          <div class="focus-dashboard-label">错误次数</div>
          <div class="focus-dashboard-value" id="mistakes">0</div>
        </div>

      </div>

      <div class="focus-progress">
        <div class="focus-progress-fill" id="progressBar"></div>
      </div>

      <div class="focus-game-card">

        <p class="focus-message" id="gameMessage">
          请从数字1开始！
        </p>

        <div class="focus-grid">
          ${numbers.map(n => `
            <button class="focus-cell" data-number="${n}">
              ${n}
            </button>
          `).join("")}
        </div>

      </div>

    </div>
  `;

  document.getElementById("quitGame").onclick = () => {
    clearGameTimers();
    showModeMenu();
  };

  overlay.querySelectorAll(".focus-cell").forEach(button => {
    button.onclick = () => {
      chooseNumber(Number(button.dataset.number), button);
    };
  });

  beginGame();
}

// ===============================
// 开始计时
// ===============================

function beginGame() {
  if (gameStarted) return;

  gameStarted = true;
  locked = false;

  gameStartTime = Date.now();
  questionStartTime = Date.now();

  timer = setInterval(() => {
    if (!gameStarted) return;

    timeLeft--;

    const timeElement = document.getElementById("timeLeft");
    const progressElement = document.getElementById("progressBar");

    if (timeElement) {
      timeElement.textContent = timeLeft;
    }

    if (progressElement) {
      progressElement.style.width =
        Math.max(0, timeLeft / currentMode.duration * 100) + "%";
    }

    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);
}

// ===============================
// 点击数字
// ===============================

function chooseNumber(number, button) {
  if (!gameStarted || locked) return;

  if (number !== nextNumber) {
    mistakes++;

    document.getElementById("mistakes").textContent = mistakes;

    const message = document.getElementById("gameMessage");

    message.textContent = "✗ 顺序错误，请找到下一个数字！";
    message.style.color = "#e36c55";

    button.classList.add("wrong");

    setTimeout(() => {
      button.classList.remove("wrong");
    }, 350);

    return;
  }

  const reactionTime = Date.now() - questionStartTime;
  reactionTimes.push(reactionTime);

  correctCount++;
  score += currentMode.points;

  button.classList.add("done");
  button.disabled = true;

  nextNumber++;

  const nextElement = document.getElementById("nextNumber");
  const message = document.getElementById("gameMessage");

  if (nextElement) {
    nextElement.textContent =
      nextNumber > currentMode.maxNumber ? "完成" : nextNumber;
  }

  if (message) {
    message.textContent = "✓ 正确！继续寻找下一个数字";
    message.style.color = "#22a06b";
  }

  questionStartTime = Date.now();

  // 全部完成
  if (nextNumber > currentMode.maxNumber) {
    endGame(true);
  }
}

// ===============================
// 清理计时器
// ===============================

function clearGameTimers() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  gameStarted = false;
  locked = true;
}

// ===============================
// 结束训练
// ===============================

function endGame(passed) {
  if (!gameStarted) return;

  clearGameTimers();

  const accuracy = correctCount + mistakes > 0
    ? Math.round(
        correctCount / (correctCount + mistakes) * 100
      )
    : 0;

  const avgReaction = reactionTimes.length
    ? Math.round(
        reactionTimes.reduce((sum, value) => sum + value, 0) /
        reactionTimes.length
      )
    : 0;

  const usedTime = currentMode.duration - timeLeft;

  const record = {
    category: "focus",
    type: "专注力训练",
    mode: currentMode.name,
    score,
    accuracy,
    correct: correctCount,
    wrong: mistakes,
    rounds: correctCount,
    time: usedTime,
    avgReaction,
    completed: passed,
    date: new Date().toLocaleString()
  };

  saveRecord(record);

  showResult({
    passed,
    score,
    accuracy,
    correctCount,
    mistakes,
    avgReaction,
    usedTime
  });
}

// ===============================
// 结果页面
// ===============================

function showResult(result) {
  const stats = getStats();

  overlay.innerHTML = `
    <div class="focus-container">

      <button class="focus-back" id="resultBack">
        ← 返回
      </button>

      <div class="focus-header">
        <div class="focus-icon">
          ${result.passed ? "🏆" : "🎯"}
        </div>

        <div class="focus-title">
          ${result.passed ? "挑战成功！" : "本轮训练结束"}
        </div>

        <div class="focus-desc">
          ${currentMode.name}
        </div>
      </div>

      <div class="focus-card">

        <div class="focus-result-title">本轮得分</div>

        <div class="focus-result-score">
          ${result.score}
        </div>

        <div class="focus-result-grid">

          <div class="focus-result-item">
            <div class="focus-result-value">${result.accuracy}%</div>
            <div class="focus-result-label">正确率</div>
          </div>

          <div class="focus-result-item">
            <div class="focus-result-value">${result.correctCount}</div>
            <div class="focus-result-label">正确次数</div>
          </div>

          <div class="focus-result-item">
            <div class="focus-result-value">${result.mistakes}</div>
            <div class="focus-result-label">错误次数</div>
          </div>

          <div class="focus-result-item">
            <div class="focus-result-value">${result.avgReaction}ms</div>
            <div class="focus-result-label">平均反应时间</div>
          </div>

          <div class="focus-result-item">
            <div class="focus-result-value">${result.usedTime}s</div>
            <div class="focus-result-label">训练用时</div>
          </div>

          <div class="focus-result-item">
            <div class="focus-result-value">${currentMode.maxNumber}</div>
            <div class="focus-result-label">目标数字数量</div>
          </div>

        </div>
      </div>

      <div class="focus-card">
        <h3 class="focus-card-title">📊 历史训练统计</h3>

        <div class="focus-stats">

          <div class="focus-stat">
            <div class="focus-stat-value">${stats.count}</div>
            <div class="focus-stat-label">历史训练次数</div>
          </div>

          <div class="focus-stat">
            <div class="focus-stat-value">${stats.best}</div>
            <div class="focus-stat-label">历史最佳成绩</div>
          </div>

          <div class="focus-stat">
            <div class="focus-stat-value">${stats.passed}</div>
            <div class="focus-stat-label">累计通关次数</div>
          </div>

          <div class="focus-stat">
            <div class="focus-stat-value">${stats.rate}%</div>
            <div class="focus-stat-label">历史通关率</div>
          </div>

        </div>
      </div>

      <button class="focus-action" id="retryFocus">
        重新挑战
      </button>

      <button class="focus-action secondary" id="backModeFocus">
        返回模式选择
      </button>

      <button class="focus-action secondary" id="viewResultRecords">
        查看历史成绩
      </button>

    </div>
  `;

  document.getElementById("resultBack").onclick = showModeMenu;

  document.getElementById("retryFocus").onclick = () => {
    const key = Object.keys(MODES).find(
      item => MODES[item] === currentMode
    );

    startMode(key);
  };

  document.getElementById("backModeFocus").onclick = showModeMenu;

  document.getElementById("viewResultRecords").onclick = () => {
    closeGame();
    showRecords("focus");
  };
}

// ===============================
// 关闭训练
// ===============================

function closeGame() {
  clearGameTimers();

  if (overlay) {
    overlay.remove();
    overlay = null;
  }
}
