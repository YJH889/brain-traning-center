
import {
  saveRecord,
  getRecords,
  showRecords
} from "../utils/record.js";

// ===============================
// 工作记忆训练配置
// ===============================

const GAME_TIME = 60;
const NEXT_DELAY = 2000;
const ANSWER_REVEAL_TIME = 3000;

// 保留两种难度
const MODES = {
  normal: {
    name: "普通模式",
    startLength: 3
  },

  advanced: {
    name: "进阶模式",
    startLength: 6
  }
};

let overlay = null;
let currentMode = null;

let timer = null;
let timeLeft = GAME_TIME;

let currentLength = 3;
let currentSequence = "";
let currentInput = "";

let correctRounds = 0;
let failedRounds = 0;
let wrongAttempts = 0;
let totalRounds = 0;
let maxLength = 0;

let score = 0;
let gameStarted = false;
let locked = false;
let retryUsed = false;

let reactionTimes = [];
let questionStartTime = 0;
let gameStartTime = 0;

let timeoutIds = [];

// ===============================
// 入口
// ===============================

export function startMemoryGame() {
  if (overlay) {
    clearGameTimers();
    overlay.remove();
  }

  overlay = document.createElement("div");
  overlay.id = "memoryOverlay";

  document.body.appendChild(overlay);

  addStyles();
  showModeMenu();
}

// ===============================
// 页面样式
// ===============================

function addStyles() {
  if (document.getElementById("memoryStyles")) return;

  const style = document.createElement("style");
  style.id = "memoryStyles";

  style.textContent = `
    #memoryOverlay {
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

    #memoryOverlay * {
      box-sizing: border-box;
    }

    .memory-container {
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
    }

    .memory-back {
      border: 0;
      background: #e4eaf2;
      padding: 9px 14px;
      border-radius: 10px;
      color: #40536b;
      cursor: pointer;
      font-size: 14px;
      transition: background .2s ease;
    }

    .memory-back:hover {
      background: #cbd5e1;
    }

    .memory-header {
      text-align: center;
      margin: 15px 0 20px;
    }

    .memory-icon {
      font-size: 40px;
      margin-bottom: 6px;
    }

    .memory-title {
      font-size: 24px;
      font-weight: bold;
      margin: 5px 0;
    }

    .memory-desc {
      font-size: 13px;
      color: #8290a2;
      margin-top: 7px;
    }

    .memory-card {
      background: white;
      padding: 19px;
      border-radius: 16px;
      margin-bottom: 15px;
      box-shadow: 0 4px 14px rgba(40,60,90,.05);
    }

    .memory-card-title {
      font-size: 17px;
      font-weight: bold;
      margin: 0 0 13px;
    }

    .memory-rule {
      color: #66758a;
      font-size: 13px;
      line-height: 1.9;
    }

    .memory-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .memory-stat {
      background: #f6f8fc;
      padding: 13px 5px;
      border-radius: 11px;
      text-align: center;
    }

    .memory-stat-value {
      font-size: 22px;
      font-weight: bold;
      color: #344b68;
    }

    .memory-stat-label {
      color: #8995a5;
      font-size: 12px;
      margin-top: 5px;
    }

    .memory-mode {
      display: block;
      width: 100%;
      border: 0;
      border-radius: 13px;
      padding: 17px;
      text-align: left;
      cursor: pointer;
      margin-bottom: 12px;
      transition: background .2s ease, transform .2s ease;
    }

    .memory-normal {
      background: #e8f2ff;
      color: #3478d4;
    }

    .memory-normal:hover {
      background: #c9e0ff;
    }

    .memory-advanced {
      background: #fff1df;
      color: #e58a35;
    }

    .memory-advanced:hover {
      background: #ffdfb8;
    }

    .memory-mode:active {
      transform: scale(.98);
    }

    .memory-mode-name {
      font-size: 17px;
      font-weight: bold;
    }

    .memory-mode-desc {
      font-size: 13px;
      margin-top: 7px;
    }

    .memory-record-btn {
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

    .memory-record-btn:hover {
      background: #c9e0ff;
    }

    /* =========================
       正式训练页面：紧凑布局
    ========================= */

    .memory-game-container {
      width: 100%;
      max-width: 460px;
      margin: 0 auto;
    }

    .memory-game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .memory-game-mode {
      color: #526176;
      font-size: 14px;
      font-weight: bold;
    }

    .memory-game-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin: 10px 0;
    }

    .memory-game-stat {
      background: white;
      border-radius: 11px;
      padding: 9px 4px;
      text-align: center;
      box-shadow: 0 3px 10px rgba(40,60,90,.04);
    }

    .memory-game-stat-label {
      color: #8491a2;
      font-size: 11px;
      margin-bottom: 4px;
    }

    .memory-game-stat-value {
      font-size: 19px;
      font-weight: bold;
      color: #405b7d;
    }

    .memory-progress {
      height: 7px;
      background: #e1e7ef;
      border-radius: 20px;
      overflow: hidden;
      margin: 10px 0;
    }

    .memory-progress-fill {
      height: 100%;
      width: 100%;
      background: #27ae60;
      transition: width .2s;
    }

    .memory-game-card {
      background: white;
      border-radius: 15px;
      padding: 13px 12px;
      margin: 10px 0;
      text-align: center;
      box-shadow: 0 4px 14px rgba(40,60,90,.05);
    }

    .memory-game-tip {
      font-size: 12px;
      color: #8491a2;
      margin-bottom: 9px;
    }

    .memory-sequence {
      min-height: 43px;
      font-size: 30px;
      font-weight: bold;
      color: #3478d4;
      letter-spacing: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow-wrap: anywhere;
    }

    .memory-message {
      min-height: 20px;
      margin: 7px 0 0;
      font-size: 12px;
      color: #8290a2;
    }

    .memory-input-box {
      background: #f5f8fc;
      border: 1px solid #dce5f0;
      border-radius: 10px;
      padding: 9px;
      margin-bottom: 9px;
    }

    .memory-input-label {
      color: #8491a2;
      font-size: 11px;
      margin-bottom: 5px;
    }

    .memory-input-display {
      min-height: 32px;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #344b68;
      overflow-wrap: anywhere;
    }

    .memory-keyboard {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 7px;
    }

    .memory-key {
      height: 43px;
      border: 0;
      border-radius: 9px;
      background: #edf2fa;
      color: #29476d;
      font-size: 19px;
      font-weight: bold;
      cursor: pointer;
      transition: background .2s ease, transform .2s ease;
    }

    .memory-key:hover {
      background: #c9dafa;
    }

    .memory-key:active {
      transform: scale(.96);
    }

    .memory-key.delete {
      background: #fff1df;
      color: #d88735;
    }

    .memory-key.delete:hover {
      background: #ffdfb8;
    }

    .memory-key.confirm {
      background: #e3efff;
      color: #3478d4;
    }

    .memory-key.confirm:hover {
      background: #c9e0ff;
    }

    .memory-key:disabled {
      opacity: .45;
      cursor: not-allowed;
    }

    .memory-start-btn {
      width: 100%;
      border: 0;
      border-radius: 10px;
      padding: 12px;
      margin-top: 9px;
      background: #e3efff;
      color: #3478d4;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      transition: background .2s ease;
    }

    .memory-start-btn:hover {
      background: #c9e0ff;
    }

    .memory-action {
      width: 100%;
      border: 0;
      border-radius: 11px;
      padding: 13px;
      margin-top: 10px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      background: #e8f2ff;
      color: #3478d4;
      transition: background .2s ease, transform .2s ease;
    }

    .memory-action:hover {
      background: #c9e0ff;
    }

    .memory-action.secondary {
      background: #eef0f5;
      color: #58677a;
    }

    .memory-action.secondary:hover {
      background: #d9dee8;
    }

    .memory-result-title {
      text-align: center;
      font-size: 23px;
      font-weight: bold;
      margin: 15px 0;
    }

    .memory-result-score {
      text-align: center;
      font-size: 38px;
      font-weight: bold;
      color: #4b82c5;
      margin: 15px 0;
    }

    .memory-result-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .memory-result-item {
      background: #f5f7fb;
      border-radius: 10px;
      padding: 12px 5px;
      text-align: center;
    }

    .memory-result-value {
      font-size: 19px;
      font-weight: bold;
      color: #405b7d;
    }

    .memory-result-label {
      font-size: 12px;
      color: #8793a3;
      margin-top: 5px;
    }

    @media (max-height: 700px) {
      #memoryOverlay {
        padding-top: 7px;
        padding-bottom: 7px;
      }

      .memory-game-card {
        padding: 9px;
        margin: 6px 0;
      }

      .memory-game-stats {
        margin: 6px 0;
      }

      .memory-key {
        height: 37px;
      }

      .memory-sequence {
        min-height: 35px;
        font-size: 26px;
      }

      .memory-input-display {
        min-height: 26px;
        font-size: 21px;
      }
    }
  `;

  document.head.appendChild(style);
}

// ===============================
// 历史统计
// ===============================

function getMemoryRecords() {
  const records = getRecords();

  if (!Array.isArray(records)) return [];

  return records.filter(item => item.category === "memory");
}

function getStats() {
  const records = getMemoryRecords();

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
// 选择模式页面
// ===============================

function showModeMenu() {
  const stats = getStats();

  overlay.innerHTML = `
    <div class="memory-container">

      <button class="memory-back" id="closeMemory">
        ← 返回
      </button>

      <div class="memory-header">
        <div class="memory-icon">🧠</div>
        <div class="memory-title">工作记忆训练</div>
        <div class="memory-desc">
          记住数字顺序，提升短时记忆与信息保持能力
        </div>
      </div>

      <div class="memory-card">
        <h3 class="memory-card-title">📖 训练规则</h3>

        <div class="memory-rule">
          1. 屏幕会显示一串数字，请认真记住。<br>
          2. 数字消失后，使用下方数字键盘输入。<br>
          3. 输入过程中可以看到已经输入的数字。<br>
          4. 第一次输入错误，会显示正确答案3秒，再给一次机会。<br>
          5. 第二次输入错误，本关失败，2秒后自动进入下一关。<br>
          6. 每通过一关，下一关增加一个数字。
        </div>
      </div>

      <div class="memory-card">
        <h3 class="memory-card-title">🎯 选择训练难度</h3>

        <button class="memory-mode memory-normal" data-mode="normal">
          <div class="memory-mode-name">普通模式</div>
          <div class="memory-mode-desc">
            3个数字起步 · 每关增加1个 · 限时60秒
          </div>
        </button>

        <button class="memory-mode memory-advanced" data-mode="advanced">
          <div class="memory-mode-name">进阶模式</div>
          <div class="memory-mode-desc">
            6个数字起步 · 每关增加1个 · 限时60秒
          </div>
        </button>
      </div>

      <div class="memory-card">
        <h3 class="memory-card-title">📊 我的训练成绩</h3>

        <div class="memory-stats">

          <div class="memory-stat">
            <div class="memory-stat-value">${stats.count}</div>
            <div class="memory-stat-label">历史训练次数</div>
          </div>

          <div class="memory-stat">
            <div class="memory-stat-value">${stats.best}</div>
            <div class="memory-stat-label">最佳成绩</div>
          </div>

          <div class="memory-stat">
            <div class="memory-stat-value">${stats.passed}</div>
            <div class="memory-stat-label">通关次数</div>
          </div>

          <div class="memory-stat">
            <div class="memory-stat-value">${stats.rate}%</div>
            <div class="memory-stat-label">通关率</div>
          </div>

        </div>
      </div>

      <button class="memory-record-btn" id="viewMemoryRecords">
        查看历史成绩
      </button>

    </div>
  `;

  document.getElementById("closeMemory").onclick = closeGame;

  overlay.querySelectorAll("[data-mode]").forEach(button => {
    button.onclick = () => {
      startMode(button.dataset.mode);
    };
  });

  document.getElementById("viewMemoryRecords").onclick = () => {
    closeGame();
    showRecords("memory");
  };
}

// ===============================
// 开始模式
// ===============================

function startMode(key) {
  currentMode = MODES[key];

  if (!currentMode) return;

  clearGameTimers();

  timeLeft = GAME_TIME;
  currentLength = currentMode.startLength;

  correctRounds = 0;
  failedRounds = 0;
  wrongAttempts = 0;
  totalRounds = 0;
  maxLength = 0;

  score = 0;
  reactionTimes = [];

  currentSequence = "";
  currentInput = "";

  retryUsed = false;
  gameStarted = false;
  locked = false;

  showGamePage();
}

// ===============================
// 正式训练页面
// ===============================

function showGamePage() {
  overlay.innerHTML = `
    <div class="memory-game-container">

      <div class="memory-game-header">

        <button class="memory-back" id="quitMemory">
          ← 退出
        </button>

        <b class="memory-game-mode">
          ${currentMode.name}
        </b>

      </div>

      <div class="memory-game-stats">

        <div class="memory-game-stat">
          <div class="memory-game-stat-label">当前关卡</div>
          <div class="memory-game-stat-value" id="memoryRound">
            1
          </div>
        </div>

        <div class="memory-game-stat">
          <div class="memory-game-stat-label">剩余时间</div>
          <div class="memory-game-stat-value" id="memoryTime">
            ${GAME_TIME}
          </div>
        </div>

        <div class="memory-game-stat">
          <div class="memory-game-stat-label">记忆长度</div>
          <div class="memory-game-stat-value" id="memoryLength">
            ${currentLength}
          </div>
        </div>

      </div>

      <div class="memory-progress">
        <div class="memory-progress-fill" id="memoryProgress"></div>
      </div>

      <div class="memory-game-card">

        <div class="memory-game-tip" id="memoryTip">
          点击开始挑战，准备记忆数字
        </div>

        <div class="memory-sequence" id="memorySequence">
          准备开始
        </div>

        <div class="memory-message" id="memoryMessage">
          请集中注意力
        </div>

      </div>

      <div class="memory-game-card">

        <div class="memory-input-box">

          <div class="memory-input-label">
            你的输入（实时显示）
          </div>

          <div class="memory-input-display" id="memoryInput">
            —
          </div>

        </div>

        <div class="memory-keyboard" id="memoryKeyboard">

          ${[1,2,3,4,5,6,7,8,9].map(n => `
            <button class="memory-key"
              data-key="${n}" disabled>
              ${n}
            </button>
          `).join("")}

          <button class="memory-key delete" data-action="delete" disabled>
            删除
          </button>

          <button class="memory-key" data-key="0" disabled>
            0
          </button>

          <button class="memory-key confirm" data-action="confirm" disabled>
            确认
          </button>

        </div>

        <button class="memory-start-btn" id="startMemory">
          开始挑战
        </button>

      </div>

    </div>
  `;

  document.getElementById("quitMemory").onclick = () => {
    clearGameTimers();
    showModeMenu();
  };

  overlay.querySelectorAll("[data-key]").forEach(button => {
    button.onclick = () => {
      inputNumber(button.dataset.key);
    };
  });

  document.querySelector("#memoryOverlay [data-action='delete']").onclick =
    deleteNumber;

  document.querySelector("#memoryOverlay [data-action='confirm']").onclick =
    checkAnswer;

  document.getElementById("startMemory").onclick = beginGame;
}

// ===============================
// 定时器管理
// ===============================

function addTimeout(callback, delay) {
  const id = setTimeout(() => {
    timeoutIds = timeoutIds.filter(item => item !== id);
    callback();
  }, delay);

  timeoutIds.push(id);

  return id;
}

function clearGameTimers() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  timeoutIds.forEach(id => clearTimeout(id));
  timeoutIds = [];

  gameStarted = false;
  locked = true;
}

// ===============================
// 开始训练
// ===============================

function beginGame() {
  if (gameStarted) return;

  gameStarted = true;
  locked = false;

  gameStartTime = Date.now();

  document.getElementById("startMemory").style.display = "none";

  timer = setInterval(() => {
    if (!gameStarted) return;

    timeLeft--;

    const timeElement = document.getElementById("memoryTime");
    const progressElement = document.getElementById("memoryProgress");

    if (timeElement) {
      timeElement.textContent = timeLeft;
    }

    if (progressElement) {
      progressElement.style.width =
        Math.max(0, timeLeft / GAME_TIME * 100) + "%";
    }

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  nextRound();
}

// ===============================
// 生成数字
// ===============================

function randomSequence(length) {
  let result = "";

  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }

  return result;
}

// ===============================
// 下一关
// ===============================

function nextRound() {
  if (!gameStarted || timeLeft <= 0) return;

  locked = true;
  retryUsed = false;
  currentInput = "";

  currentSequence = randomSequence(currentLength);

  maxLength = Math.max(maxLength, currentLength);

  const roundElement = document.getElementById("memoryRound");
  const lengthElement = document.getElementById("memoryLength");
  const sequenceElement = document.getElementById("memorySequence");
  const tipElement = document.getElementById("memoryTip");
  const messageElement = document.getElementById("memoryMessage");

  if (!sequenceElement) return;

  roundElement.textContent = totalRounds + 1;
  lengthElement.textContent = currentLength;

  updateInputDisplay();

  setKeyboardEnabled(false);

  sequenceElement.textContent = currentSequence;
  tipElement.textContent = "请记住下面这串数字";
  messageElement.textContent = "数字正在显示……";
  messageElement.style.color = "#8290a2";

  // 展示时间随数字长度增加
  const displayTime = 1500 + currentLength * 450;

  addTimeout(() => {
    if (!gameStarted) return;

    sequenceElement.textContent = "？";
    tipElement.textContent = "请按顺序输入刚才的数字";
    messageElement.textContent = "现在开始输入";

    currentInput = "";
    updateInputDisplay();

    locked = false;
    questionStartTime = Date.now();

    setKeyboardEnabled(true);
  }, displayTime);
}

// ===============================
// 键盘状态
// ===============================

function setKeyboardEnabled(enabled) {
  const buttons = overlay.querySelectorAll(".memory-key");

  buttons.forEach(button => {
    button.disabled = !enabled;
  });
}

// ===============================
// 输入数字
// ===============================

function inputNumber(number) {
  if (!gameStarted || locked) return;

  if (currentInput.length >= currentLength) return;

  currentInput += String(number);

  updateInputDisplay();
}

// ===============================
// 删除数字
// ===============================

function deleteNumber() {
  if (!gameStarted || locked) return;

  currentInput = currentInput.slice(0, -1);

  updateInputDisplay();
}

// ===============================
// 更新输入显示
// ===============================

function updateInputDisplay() {
  const inputElement = document.getElementById("memoryInput");

  if (!inputElement) return;

  inputElement.textContent = currentInput || "—";
}

// ===============================
// 确认答案
// ===============================

function checkAnswer() {
  if (!gameStarted || locked) return;

  if (currentInput.length !== currentLength) {
    const messageElement = document.getElementById("memoryMessage");

    messageElement.textContent =
      `还需要输入 ${currentLength - currentInput.length} 位数字`;

    messageElement.style.color = "#e58a35";

    return;
  }

  const reactionTime = Date.now() - questionStartTime;
  reactionTimes.push(reactionTime);

  locked = true;
  setKeyboardEnabled(false);

  if (currentInput === currentSequence) {
    correctRounds++;
    totalRounds++;

    score += 200;

    const messageElement = document.getElementById("memoryMessage");

    messageElement.textContent = "✓ 回答正确！下一关数字增加1位";
    messageElement.style.color = "#22a06b";

    currentLength++;

    addTimeout(() => {
      if (gameStarted && timeLeft > 0) {
        nextRound();
      }
    }, NEXT_DELAY);

    return;
  }

  // 输入错误
  wrongAttempts++;

  if (!retryUsed) {
    retryUsed = true;

    const sequenceElement = document.getElementById("memorySequence");
    const tipElement = document.getElementById("memoryTip");
    const messageElement = document.getElementById("memoryMessage");

    sequenceElement.textContent = currentSequence;
    tipElement.textContent = "正确答案";
    messageElement.textContent = "第一次错误，再看一遍，3秒后重新输入";
    messageElement.style.color = "#e58a35";

    currentInput = "";
    updateInputDisplay();

    addTimeout(() => {
      if (!gameStarted || timeLeft <= 0) return;

      sequenceElement.textContent = "？";
      tipElement.textContent = "请再次输入刚才的数字";
      messageElement.textContent = "这是最后一次机会";

      currentInput = "";
      updateInputDisplay();

      locked = false;
      questionStartTime = Date.now();

      setKeyboardEnabled(true);
    }, ANSWER_REVEAL_TIME);

    return;
  }

  // 第二次错误，本关失败
  failedRounds++;
  totalRounds++;

  score = Math.max(0, score - 20);

  const sequenceElement = document.getElementById("memorySequence");
  const tipElement = document.getElementById("memoryTip");
  const messageElement = document.getElementById("memoryMessage");

  sequenceElement.textContent = currentSequence;
  tipElement.textContent = "本关正确答案";
  messageElement.textContent = "本关失败，2秒后自动进入下一关";
  messageElement.style.color = "#e36c55";

  addTimeout(() => {
    if (gameStarted && timeLeft > 0) {
      nextRound();
    }
  }, NEXT_DELAY);
}

// ===============================
// 结束训练
// ===============================

function endGame() {
  if (!gameStarted) return;

  clearGameTimers();

  const accuracy = totalRounds
    ? Math.round(correctRounds / totalRounds * 100)
    : 0;

  const avgReaction = reactionTimes.length
    ? Math.round(
        reactionTimes.reduce((sum, value) => sum + value, 0) /
        reactionTimes.length
      )
    : 0;

  const usedTime = GAME_TIME - timeLeft;

  const completed = totalRounds >= 5 && accuracy >= 80;

  const record = {
    category: "memory",
    type: "工作记忆训练",
    mode: currentMode.name,
    score,
    accuracy,
    correct: correctRounds,
    wrong: wrongAttempts,
    rounds: totalRounds,
    time: usedTime,
    avgReaction,
    maxLength,
    completed,
    date: new Date().toLocaleString()
  };

  saveRecord(record);

  showResult({
    score,
    accuracy,
    correctRounds,
    failedRounds,
    wrongAttempts,
    totalRounds,
    avgReaction,
    usedTime,
    maxLength,
    completed
  });
}

// ===============================
// 结果页面
// ===============================

function showResult(result) {
  const stats = getStats();

  overlay.innerHTML = `
    <div class="memory-container">

      <button class="memory-back" id="resultBack">
        ← 返回
      </button>

      <div class="memory-header">

        <div class="memory-icon">
          ${result.completed ? "🏆" : "🧠"}
        </div>

        <div class="memory-title">
          ${result.completed ? "训练完成！" : "本轮训练结束"}
        </div>

        <div class="memory-desc">
          ${currentMode.name}
        </div>

      </div>

      <div class="memory-card">

        <div class="memory-result-title">本轮得分</div>

        <div class="memory-result-score">
          ${result.score}
        </div>

        <div class="memory-result-grid">

          <div class="memory-result-item">
            <div class="memory-result-value">${result.accuracy}%</div>
            <div class="memory-result-label">正确率</div>
          </div>

          <div class="memory-result-item">
            <div class="memory-result-value">${result.correctRounds}</div>
            <div class="memory-result-label">正确关数</div>
          </div>

          <div class="memory-result-item">
            <div class="memory-result-value">${result.wrongAttempts}</div>
            <div class="memory-result-label">错误次数</div>
          </div>

          <div class="memory-result-item">
            <div class="memory-result-value">${result.failedRounds}</div>
            <div class="memory-result-label">失败关数</div>
          </div>

          <div class="memory-result-item">
            <div class="memory-result-value">${result.avgReaction}ms</div>
            <div class="memory-result-label">平均反应时间</div>
          </div>

          <div class="memory-result-item">
            <div class="memory-result-value">${result.usedTime}s</div>
            <div class="memory-result-label">训练用时</div>
          </div>

          <div class="memory-result-item" style="grid-column:1 / -1;">
            <div class="memory-result-value">${result.maxLength}位</div>
            <div class="memory-result-label">最高记忆长度</div>
          </div>

        </div>
      </div>

      <div class="memory-card">

        <h3 class="memory-card-title">📊 历史训练统计</h3>

        <div class="memory-stats">

          <div class="memory-stat">
            <div class="memory-stat-value">${stats.count}</div>
            <div class="memory-stat-label">历史训练次数</div>
          </div>

          <div class="memory-stat">
            <div class="memory-stat-value">${stats.best}</div>
            <div class="memory-stat-label">历史最佳成绩</div>
          </div>

          <div class="memory-stat">
            <div class="memory-stat-value">${stats.passed}</div>
            <div class="memory-stat-label">累计通关次数</div>
          </div>

          <div class="memory-stat">
            <div class="memory-stat-value">${stats.rate}%</div>
            <div class="memory-stat-label">历史通关率</div>
          </div>

        </div>
      </div>

      <button class="memory-action" id="retryMemory">
        重新挑战
      </button>

      <button class="memory-action secondary" id="backModeMemory">
        返回模式选择
      </button>

      <button class="memory-action secondary" id="viewResultRecords">
        查看历史成绩
      </button>

    </div>
  `;

  document.getElementById("resultBack").onclick = showModeMenu;

  document.getElementById("retryMemory").onclick = () => {
    const key = Object.keys(MODES).find(
      item => MODES[item] === currentMode
    );

    startMode(key);
  };

  document.getElementById("backModeMemory").onclick = showModeMenu;

  document.getElementById("viewResultRecords").onclick = () => {
    closeGame();
    showRecords("memory");
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
