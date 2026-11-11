
import {
  saveRecord,
  getRecords,
  showRecords
} from "../utils/record.js";

// ===============================
// 注意力抑制训练
// ===============================

// 两种难度，保留原有参数
const MODES = {
  normal: {
    name: "普通",
    duration: 60,
    mismatch: 0.3,
    points: 10
  },
  advanced: {
    name: "进阶",
    duration: 60,
    mismatch: 0.65,
    points: 15
  }
};

// 颜色配置
const COLORS = [
  { name: "红色", value: "#ef4444" },
  { name: "蓝色", value: "#3b82f6" },
  { name: "绿色", value: "#22a06b" },
  { name: "黄色", value: "#eab308" }
];

let overlay = null;
let currentMode = null;
let timer = null;
let gameStarted = false;

let timeLeft = 60;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let totalCount = 0;
let reactionTimes = [];
let questionStartTime = 0;
let currentQuestion = null;
let locked = false;
let gameStartTime = 0;

// ===============================
// 入口
// ===============================

export function startInhibitionGame() {
  if (overlay) {
    overlay.remove();
  }

  overlay = document.createElement("div");
  overlay.id = "inhibitionOverlay";

  document.body.appendChild(overlay);

  addStyles();
  showModeMenu();
}

// ===============================
// 样式
// ===============================

function addStyles() {
  if (document.getElementById("inhibitionStyles")) return;

  const style = document.createElement("style");
  style.id = "inhibitionStyles";

  style.textContent = `
    #inhibitionOverlay {
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

    #inhibitionOverlay * {
      box-sizing: border-box;
    }

    .inhibition-container {
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
    }

    .inhibition-back {
      border: none;
      background: #e4eaf2;
      color: #40536b;
      border-radius: 9px;
      padding: 8px 13px;
      font-size: 14px;
      cursor: pointer;
    }

    .inhibition-header {
      text-align: center;
      margin: 12px 0 18px;
    }

    .inhibition-icon {
      font-size: 38px;
      margin-bottom: 5px;
    }

    .inhibition-title {
      font-size: 23px;
      font-weight: bold;
      margin: 5px 0;
    }

    .inhibition-desc {
      font-size: 13px;
      color: #8290a2;
      margin-top: 7px;
    }

    .inhibition-card {
      background: white;
      border-radius: 15px;
      padding: 16px;
      margin-bottom: 13px;
      box-shadow: 0 3px 12px rgba(40,60,90,0.05);
    }

    .inhibition-card-title {
      font-size: 15px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .inhibition-rule {
      font-size: 13px;
      color: #66758a;
      line-height: 1.8;
    }

    .inhibition-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .inhibition-stat {
      background: #f6f8fc;
      border-radius: 10px;
      padding: 12px 5px;
      text-align: center;
    }

    .inhibition-stat-value {
      font-size: 21px;
      font-weight: bold;
      color: #344b68;
    }

    .inhibition-stat-label {
      color: #8995a5;
      font-size: 12px;
      margin-top: 5px;
    }

    .inhibition-mode {
      width: 100%;
      border: none;
      border-radius: 11px;
      padding: 14px;
      margin-top: 10px;
      font-size: 15px;
      font-weight: bold;
      cursor: pointer;
    }

    .inhibition-normal {
      background: #e3efff;
      color: #3478c9;
    }

    .inhibition-advanced {
      background: #fff0df;
      color: #d88735;
    }

    .inhibition-record-btn {
      width: 100%;
      border: none;
      background: #e9eafc;
      color: #6669bd;
      padding: 13px;
      border-radius: 10px;
      margin-top: 12px;
      font-size: 14px;
      cursor: pointer;
    }

    .inhibition-game-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 15px 0;
    }

    .inhibition-time {
      font-size: 19px;
      font-weight: bold;
      color: #e36c55;
    }

    .inhibition-score {
      font-size: 15px;
      font-weight: bold;
      color: #456b9a;
    }

    .inhibition-progress {
      height: 8px;
      border-radius: 10px;
      background: #e4eaf2;
      overflow: hidden;
      margin-bottom: 20px;
    }

    .inhibition-progress-fill {
      height: 100%;
      width: 100%;
      background: #6b9de0;
      transition: width 0.3s;
    }

    .inhibition-question-card {
      background: white;
      border-radius: 16px;
      padding: 25px 12px;
      text-align: center;
      margin-bottom: 17px;
      box-shadow: 0 3px 12px rgba(40,60,90,0.05);
    }

    .inhibition-tip {
      color: #8793a3;
      font-size: 13px;
      margin-bottom: 22px;
    }

    .inhibition-word {
      font-size: 43px;
      font-weight: bold;
      min-height: 60px;
    }

    .inhibition-question {
      font-size: 13px;
      color: #8491a2;
      margin-top: 20px;
    }

    .inhibition-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .inhibition-option {
      border: none;
      border-radius: 12px;
      padding: 17px 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      background: white;
      box-shadow: 0 3px 10px rgba(40,60,90,0.06);
    }

    .inhibition-option:active {
      transform: scale(0.97);
    }

    .inhibition-result-title {
      text-align: center;
      font-size: 23px;
      font-weight: bold;
      margin: 15px 0;
    }

    .inhibition-result-score {
      text-align: center;
      font-size: 38px;
      color: #4b82c5;
      font-weight: bold;
      margin: 15px 0;
    }

    .inhibition-result-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .inhibition-result-item {
      background: #f5f7fb;
      border-radius: 10px;
      padding: 12px 5px;
      text-align: center;
    }

    .inhibition-result-value {
      font-size: 19px;
      font-weight: bold;
      color: #405b7d;
    }

    .inhibition-result-label {
      font-size: 12px;
      color: #8793a3;
      margin-top: 5px;
    }

    .inhibition-action {
      width: 100%;
      border: none;
      border-radius: 10px;
      padding: 13px;
      margin-top: 10px;
      font-size: 14px;
      cursor: pointer;
      background: #e3efff;
      color: #3478c9;
      font-weight: bold;
    }

    .inhibition-action.secondary {
      background: #eef0f5;
      color: #58677a;
    }

    .inhibition-feedback {
      text-align: center;
      min-height: 22px;
      font-size: 14px;
      margin-top: 12px;
      font-weight: bold;
    }
  `;

  document.head.appendChild(style);
}

// ===============================
// 历史成绩
// ===============================

function getInhibitionRecords() {
  const records = getRecords();

  if (!Array.isArray(records)) return [];

  return records.filter(item => item.category === "inhibition");
}

function getStats() {
  const records = getInhibitionRecords();

  const count = records.length;

  const best = records.length
    ? Math.max(...records.map(item => Number(item.score) || 0))
    : 0;

  const completed = records.filter(item => item.completed).length;

  const rate = count
    ? Math.round(completed / count * 100)
    : 0;

  return {
    count,
    best,
    completed,
    rate
  };
}

// ===============================
// 首页
// ===============================

function showModeMenu() {
  const stats = getStats();

  overlay.innerHTML = `
    <div class="inhibition-container">

      <button class="inhibition-back" id="closeInhibition">
        ← 返回
      </button>

      <div class="inhibition-header">
        <div class="inhibition-icon">🎨</div>
        <div class="inhibition-title">注意力抑制训练</div>
        <div class="inhibition-desc">
          抵抗颜色干扰，训练专注与抑制能力
        </div>
      </div>

      <div class="inhibition-card">
        <div class="inhibition-card-title">📖 训练规则</div>
        <div class="inhibition-rule">
          1. 屏幕会显示不同颜色的文字。<br>
          2. 你需要判断文字实际显示的颜色。<br>
          3. 不要被文字本身的意思干扰。<br>
          4. 在60秒内尽可能答对更多题目。<br>
          5. 选择答案后自动进入下一题。
        </div>
      </div>

      <div class="inhibition-card">
        <div class="inhibition-card-title">📊 历史训练统计</div>

        <div class="inhibition-stats">
          <div class="inhibition-stat">
            <div class="inhibition-stat-value">${stats.count}</div>
            <div class="inhibition-stat-label">历史训练次数</div>
          </div>

          <div class="inhibition-stat">
            <div class="inhibition-stat-value">${stats.best}</div>
            <div class="inhibition-stat-label">历史最佳成绩</div>
          </div>

          <div class="inhibition-stat">
            <div class="inhibition-stat-value">${stats.completed}</div>
            <div class="inhibition-stat-label">累计通关次数</div>
          </div>

          <div class="inhibition-stat">
            <div class="inhibition-stat-value">${stats.rate}%</div>
            <div class="inhibition-stat-label">历史通关率</div>
          </div>
        </div>
      </div>

      <div class="inhibition-card">
        <div class="inhibition-card-title">🎯 选择训练难度</div>

        <button class="inhibition-mode inhibition-normal"
          data-mode="normal">
          普通模式
          <span> · 颜色干扰较少</span>
        </button>

        <button class="inhibition-mode inhibition-advanced"
          data-mode="advanced">
          进阶模式
          <span> · 颜色干扰较多</span>
        </button>

        <button class="inhibition-record-btn" id="viewInhibitionRecords">
          查看历史成绩
        </button>
      </div>

    </div>
  `;

  document.getElementById("closeInhibition").onclick = closeGame;

  overlay.querySelectorAll("[data-mode]").forEach(button => {
    button.onclick = () => {
      startMode(button.dataset.mode);
    };
  });

  document.getElementById("viewInhibitionRecords").onclick = () => {
    closeGame();
    showRecords("inhibition");
  };
}

// ===============================
// 开始模式
// ===============================

function startMode(key) {
  currentMode = MODES[key];

  if (!currentMode) return;

  timeLeft = currentMode.duration;
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  totalCount = 0;
  reactionTimes = [];
  gameStarted = false;
  locked = false;

  showGamePage();
}

// ===============================
// 训练页面
// ===============================

function showGamePage() {
  overlay.innerHTML = `
    <div class="inhibition-container">

      <button class="inhibition-back" id="backToMenu">
        ← 返回
      </button>

      <div class="inhibition-header">
        <div class="inhibition-icon">🎨</div>
        <div class="inhibition-title">注意力抑制训练</div>
        <div class="inhibition-desc">
          ${currentMode.name}模式
        </div>
      </div>

      <div class="inhibition-game-top">
        <div class="inhibition-time">
          剩余时间：<span id="inhibitionTime">${timeLeft}</span>s
        </div>

        <div class="inhibition-score">
          得分：<span id="inhibitionScore">0</span>
        </div>
      </div>

      <div class="inhibition-progress">
        <div class="inhibition-progress-fill"
          id="inhibitionProgress"></div>
      </div>

      <div class="inhibition-question-card">
        <div class="inhibition-tip">
          请忽略文字意思，只判断字体的实际颜色
        </div>

        <div class="inhibition-word" id="inhibitionWord">
          准备开始
        </div>

        <div class="inhibition-question">
          这个文字实际是什么颜色？
        </div>
      </div>

      <div class="inhibition-options" id="inhibitionOptions">
        ${COLORS.map((color, index) => `
          <button class="inhibition-option"
            data-index="${index}"
            style="color:${color.value}">
            ${color.name}
          </button>
        `).join("")}
      </div>

      <div class="inhibition-feedback" id="inhibitionFeedback">
        点击下方按钮开始挑战
      </div>

      <button class="inhibition-action" id="startInhibition">
        开始挑战
      </button>

    </div>
  `;

  document.getElementById("backToMenu").onclick = () => {
    clearGameTimers();
    showModeMenu();
  };

  overlay.querySelectorAll(".inhibition-option").forEach(button => {
    button.onclick = () => {
      chooseAnswer(Number(button.dataset.index));
    };
  });

  document.getElementById("startInhibition").onclick = beginGame;
}

// ===============================
// 开始计时
// ===============================

function beginGame() {
  if (gameStarted) return;

  gameStarted = true;
  gameStartTime = Date.now();

  document.getElementById("startInhibition").style.display = "none";

  document.getElementById("inhibitionFeedback").textContent =
    "开始！判断文字的实际颜色";

  nextQuestion();

  timer = setInterval(() => {
    timeLeft--;

    const timeElement = document.getElementById("inhibitionTime");
    const progressElement = document.getElementById("inhibitionProgress");

    if (timeElement) {
      timeElement.textContent = timeLeft;
    }

    if (progressElement) {
      progressElement.style.width =
        Math.max(0, timeLeft / currentMode.duration * 100) + "%";
    }

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// ===============================
// 生成题目
// ===============================

function nextQuestion() {
  if (!gameStarted || timeLeft <= 0) return;

  locked = false;

  const wordIndex = Math.floor(Math.random() * COLORS.length);

  let colorIndex = wordIndex;

  // 根据模式概率生成颜色干扰
  if (Math.random() < currentMode.mismatch) {
    const otherColors = COLORS
      .map((color, index) => index)
      .filter(index => index !== wordIndex);

    colorIndex = otherColors[
      Math.floor(Math.random() * otherColors.length)
    ];
  }

  currentQuestion = {
    wordIndex,
    colorIndex
  };

  const wordElement = document.getElementById("inhibitionWord");

  wordElement.textContent = COLORS[wordIndex].name;
  wordElement.style.color = COLORS[colorIndex].value;

  questionStartTime = Date.now();

  document.getElementById("inhibitionFeedback").textContent = "";
}

// ===============================
// 判断答案
// ===============================

function chooseAnswer(index) {
  if (!gameStarted || locked || !currentQuestion) return;

  locked = true;

  const reactionTime = Date.now() - questionStartTime;
  reactionTimes.push(reactionTime);

  totalCount++;

  const isCorrect = index === currentQuestion.colorIndex;

  const feedback = document.getElementById("inhibitionFeedback");

  if (isCorrect) {
    correctCount++;
    score += currentMode.points;

    feedback.style.color = "#22a06b";
    feedback.textContent = "✓ 回答正确！";
  } else {
    wrongCount++;

    feedback.style.color = "#e36c55";
    feedback.textContent =
      "✗ 回答错误，正确颜色是：" +
      COLORS[currentQuestion.colorIndex].name;
  }

  document.getElementById("inhibitionScore").textContent = score;

  // 短暂显示反馈，然后自动下一题
  setTimeout(() => {
    if (gameStarted && timeLeft > 0) {
      nextQuestion();
    }
  }, 350);
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

function endGame() {
  if (!gameStarted) return;

  clearGameTimers();

  const accuracy = totalCount
    ? Math.round(correctCount / totalCount * 100)
    : 0;

  const avgReaction = reactionTimes.length
    ? Math.round(
        reactionTimes.reduce((sum, value) => sum + value, 0) /
        reactionTimes.length
      )
    : 0;

  const usedTime = currentMode.duration - timeLeft;

  const completed = totalCount >= 5 && accuracy >= 80;

  const record = {
    category: "inhibition",
    type: "注意力抑制训练",
    mode: currentMode.name,
    score,
    accuracy,
    correct: correctCount,
    wrong: wrongCount,
    rounds: totalCount,
    time: usedTime,
    avgReaction,
    completed,
    date: new Date().toLocaleString()
  };

  saveRecord(record);

  showResult({
    score,
    accuracy,
    correctCount,
    wrongCount,
    totalCount,
    avgReaction,
    usedTime,
    completed
  });
}

// ===============================
// 结果页面
// ===============================

function showResult(result) {
  const stats = getStats();

  overlay.innerHTML = `
    <div class="inhibition-container">

      <button class="inhibition-back" id="resultBack">
        ← 返回
      </button>

      <div class="inhibition-header">
        <div class="inhibition-icon">
          ${result.completed ? "🏆" : "🎯"}
        </div>

        <div class="inhibition-title">
          ${result.completed ? "训练完成！" : "本轮训练结束"}
        </div>

        <div class="inhibition-desc">
          ${currentMode.name}模式
        </div>
      </div>

      <div class="inhibition-card">
        <div class="inhibition-result-title">本轮得分</div>

        <div class="inhibition-result-score">
          ${result.score}
        </div>

        <div class="inhibition-result-grid">

          <div class="inhibition-result-item">
            <div class="inhibition-result-value">
              ${result.accuracy}%
            </div>
            <div class="inhibition-result-label">正确率</div>
          </div>

          <div class="inhibition-result-item">
            <div class="inhibition-result-value">
              ${result.correctCount}
            </div>
            <div class="inhibition-result-label">正确次数</div>
          </div>

          <div class="inhibition-result-item">
            <div class="inhibition-result-value">
              ${result.wrongCount}
            </div>
            <div class="inhibition-result-label">错误次数</div>
          </div>

          <div class="inhibition-result-item">
            <div class="inhibition-result-value">
              ${result.avgReaction}ms
            </div>
            <div class="inhibition-result-label">平均反应时间</div>
          </div>

          <div class="inhibition-result-item">
            <div class="inhibition-result-value">
              ${result.totalCount}
            </div>
            <div class="inhibition-result-label">完成题目</div>
          </div>

          <div class="inhibition-result-item">
            <div class="inhibition-result-value">
              ${result.usedTime}s
            </div>
            <div class="inhibition-result-label">训练用时</div>
          </div>

        </div>
      </div>

      <div class="inhibition-card">
        <div class="inhibition-card-title">📊 历史训练统计</div>

        <div class="inhibition-stats">

          <div class="inhibition-stat">
            <div class="inhibition-stat-value">
              ${stats.count}
            </div>
            <div class="inhibition-stat-label">历史训练次数</div>
          </div>

          <div class="inhibition-stat">
            <div class="inhibition-stat-value">
              ${stats.best}
            </div>
            <div class="inhibition-stat-label">历史最佳成绩</div>
          </div>

          <div class="inhibition-stat">
            <div class="inhibition-stat-value">
              ${stats.completed}
            </div>
            <div class="inhibition-stat-label">累计通关次数</div>
          </div>

          <div class="inhibition-stat">
            <div class="inhibition-stat-value">
              ${stats.rate}%
            </div>
            <div class="inhibition-stat-label">历史通关率</div>
          </div>

        </div>
      </div>

      <button class="inhibition-action" id="retryInhibition">
        重新挑战
      </button>

      <button class="inhibition-action secondary" id="backModeInhibition">
        返回模式选择
      </button>

      <button class="inhibition-action secondary" id="viewResultRecords">
        查看历史成绩
      </button>

    </div>
  `;

  document.getElementById("resultBack").onclick = () => {
    showModeMenu();
  };

  document.getElementById("retryInhibition").onclick = () => {
    startMode(
      currentMode === MODES.advanced ? "advanced" : "normal"
    );
  };

  document.getElementById("backModeInhibition").onclick = showModeMenu;

  document.getElementById("viewResultRecords").onclick = () => {
    closeGame();
    showRecords("inhibition");
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
