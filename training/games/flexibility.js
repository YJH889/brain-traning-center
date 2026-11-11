
import { saveRecord, getRecords, showRecords } from "../utils/record.js";

const GAME_TIME = 60;
const NEXT_DELAY = 450;

const MODES = {
  normal: {
    name: "普通模式",
    switchEvery: 5,
    points: 10
  },
  advanced: {
    name: "进阶模式",
    switchEvery: 2,
    points: 15
  }
};

const COLORS = [
  { name: "红色", value: "#ef4444" },
  { name: "蓝色", value: "#3b82f6" },
  { name: "绿色", value: "#22a06b" },
  { name: "黄色", value: "#eab308" }
];

const SHAPES = [
  { name: "圆形", symbol: "●" },
  { name: "方形", symbol: "■" },
  { name: "三角形", symbol: "▲" },
  { name: "星形", symbol: "★" }
];

let overlay = null;
let currentMode = null;
let currentModeKey = "normal";

let timer = null;
let nextTimer = null;

let timeLeft = GAME_TIME;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let totalCount = 0;

let switchCount = 0;
let switchErrors = 0;
let reactionTimes = [];

let currentRule = "color";
let currentColor = null;
let currentShape = null;
let questionStartTime = 0;
let firstQuestionAfterSwitch = false;
let locked = false;
let gameRunning = false;
let gameStartTime = 0;

function addStyles() {
  if (document.getElementById("flexibilityStyles")) return;

  const style = document.createElement("style");
  style.id = "flexibilityStyles";

  style.textContent = `
    #flexibilityOverlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: #f3f6fb;
      overflow-y: auto;
      font-family: Arial, "Microsoft YaHei", sans-serif;
      color: #263449;
    }

    #flexibilityOverlay * {
      box-sizing: border-box;
    }

    .flex-page {
      width: 100%;
      min-height: 100%;
      padding: 24px 16px 35px;
    }

    .flex-container {
      max-width: 650px;
      margin: 0 auto;
    }

    .flex-back {
      border: none;
      background: #e4eaf2;
      color: #40536b;
      padding: 9px 15px;
      border-radius: 9px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 18px;
      transition: .2s;
    }

    .flex-back:hover {
      background: #d2dce9;
    }

    .flex-header {
      text-align: center;
      margin-bottom: 22px;
    }

    .flex-icon {
      font-size: 42px;
      margin-bottom: 8px;
    }

    .flex-title {
      font-size: 27px;
      font-weight: 800;
      margin-bottom: 8px;
    }

    .flex-desc {
      color: #718096;
      font-size: 14px;
      line-height: 1.7;
    }

    .flex-card {
      background: white;
      border-radius: 17px;
      padding: 22px;
      margin-bottom: 17px;
      box-shadow: 0 5px 20px rgba(40, 60, 90, .06);
    }

    .flex-card-title {
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 13px;
    }

    .flex-rules {
      color: #58677c;
      font-size: 14px;
      line-height: 2;
    }

    .flex-mode-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .flex-mode {
      border: 2px solid transparent;
      border-radius: 14px;
      padding: 19px 12px;
      cursor: pointer;
      text-align: center;
      transition: .2s;
    }

    .flex-mode.normal {
      background: #eaf3ff;
      border-color: #c8ddfa;
      color: #2762a8;
    }

    .flex-mode.normal:hover {
      background: #d8e9ff;
    }

    .flex-mode.advanced {
      background: #fff1df;
      border-color: #f8d6a9;
      color: #a65a12;
    }

    .flex-mode.advanced:hover {
      background: #ffe4c2;
    }

    .flex-mode-name {
      font-size: 19px;
      font-weight: 800;
      margin-bottom: 9px;
    }

    .flex-mode-info {
      font-size: 13px;
      line-height: 1.8;
    }

    .flex-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .flex-stat {
      background: #f5f8fc;
      border-radius: 11px;
      padding: 13px 5px;
      text-align: center;
    }

    .flex-stat-value {
      font-size: 21px;
      font-weight: 800;
      color: #345f9c;
    }

    .flex-stat-label {
      color: #8290a3;
      font-size: 12px;
      margin-top: 5px;
    }

    .flex-main-btn {
      width: 100%;
      border: none;
      border-radius: 11px;
      background: #477fca;
      color: white;
      padding: 13px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: .2s;
      margin-top: 13px;
    }

    .flex-main-btn:hover {
      background: #3268b1;
    }

    .flex-secondary-btn {
      width: 100%;
      border: none;
      border-radius: 11px;
      background: #e9eef5;
      color: #52647c;
      padding: 12px;
      font-size: 14px;
      cursor: pointer;
      transition: .2s;
      margin-top: 10px;
    }

    .flex-secondary-btn:hover {
      background: #d8e1ec;
    }

    /* 正式训练页：紧凑布局 */
    .flex-game-page {
      min-height: 100%;
      padding: 12px 12px 18px;
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }

    .flex-game-container {
      width: 100%;
      max-width: 540px;
      margin: 0 auto;
    }

    .flex-game-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .flex-game-label {
      font-size: 13px;
      color: #718096;
    }

    .flex-game-time {
      font-size: 20px;
      font-weight: 800;
      color: #315f9c;
    }

    .flex-progress {
      width: 100%;
      height: 7px;
      background: #e3eaf3;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 12px;
    }

    .flex-progress-fill {
      height: 100%;
      width: 100%;
      background: #5790d6;
      transition: width .3s linear;
    }

    .flex-game-card {
      background: white;
      border-radius: 16px;
      padding: 16px 14px;
      text-align: center;
      box-shadow: 0 5px 20px rgba(40, 60, 90, .06);
    }

    .flex-rule-tag {
      display: inline-block;
      padding: 7px 15px;
      border-radius: 20px;
      background: #eaf2ff;
      color: #3569a8;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .flex-question {
      font-size: 15px;
      color: #52647c;
      margin-bottom: 8px;
    }

    .flex-symbol {
      height: 105px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 78px;
      font-weight: 900;
      line-height: 1;
      margin: 3px 0 12px;
    }

    .flex-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .flex-option {
      min-height: 53px;
      border: 2px solid #e3eaf3;
      background: #f7f9fc;
      color: #40536b;
      border-radius: 11px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: .18s;
    }

    .flex-option:hover {
      background: #eaf2ff;
      border-color: #8db5e8;
    }

    .flex-option:disabled {
      cursor: default;
      opacity: .75;
    }

    .flex-feedback {
      min-height: 24px;
      margin-top: 10px;
      font-size: 14px;
      font-weight: 700;
    }

    .flex-game-tip {
      color: #8794a6;
      font-size: 12px;
      margin-top: 8px;
    }

    .flex-result-score {
      font-size: 42px;
      color: #3977c2;
      font-weight: 900;
      text-align: center;
      margin: 10px 0 5px;
    }

    .flex-result-sub {
      text-align: center;
      color: #8290a3;
      font-size: 13px;
      margin-bottom: 18px;
    }

    .flex-result-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .flex-result-item {
      background: #f5f8fc;
      padding: 13px;
      border-radius: 10px;
    }

    .flex-result-label {
      color: #8290a3;
      font-size: 12px;
      margin-bottom: 6px;
    }

    .flex-result-value {
      font-size: 19px;
      color: #344f72;
      font-weight: 800;
    }

    @media (max-width: 480px) {
      .flex-page {
        padding: 17px 12px 25px;
      }

      .flex-title {
        font-size: 24px;
      }

      .flex-card {
        padding: 17px;
      }

      .flex-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .flex-game-page {
        padding: 8px 9px 12px;
      }

      .flex-game-card {
        padding: 13px 11px;
      }

      .flex-symbol {
        height: 88px;
        font-size: 66px;
        margin: 0 0 8px;
      }

      .flex-option {
        min-height: 47px;
      }
    }

    @media (max-height: 650px) {
      .flex-game-page {
        padding-top: 5px;
      }

      .flex-game-card {
        padding: 9px 10px;
      }

      .flex-symbol {
        height: 70px;
        font-size: 56px;
        margin: 0 0 5px;
      }

      .flex-rule-tag {
        margin-bottom: 5px;
        padding: 5px 12px;
      }

      .flex-question {
        margin-bottom: 4px;
      }

      .flex-option {
        min-height: 42px;
      }

      .flex-feedback {
        margin-top: 5px;
      }
    }
  `;

  document.head.appendChild(style);
}

function getHistoryStats() {
  const records = getRecords() || [];
  const list = records.filter(item => item.category === "flexibility");

  const bestScore = list.length
    ? Math.max(...list.map(item => Number(item.score) || 0))
    : 0;

  const completedCount = list.filter(item => item.completed).length;
  const passRate = list.length
    ? Math.round(completedCount / list.length * 100)
    : 0;

  return {
    count: list.length,
    bestScore,
    completedCount,
    passRate
  };
}

function showHome() {
  clearTimers();

  const stats = getHistoryStats();

  overlay.innerHTML = `
    <div class="flex-page">
      <div class="flex-container">
        <button class="flex-back" data-action="close">← 返回</button>

        <div class="flex-header">
          <div class="flex-icon">🔄</div>
          <div class="flex-title">认知灵活性训练</div>
          <div class="flex-desc">
            灵活切换判断规则，训练大脑适应变化的能力
          </div>
        </div>

        <div class="flex-card">
          <div class="flex-card-title">📖 训练规则</div>
          <div class="flex-rules">
            1. 屏幕中会出现不同颜色和形状的图案。<br>
            2. 根据屏幕提示，判断图案的颜色或形状。<br>
            3. 规则会自动切换，需要及时调整判断方式。<br>
            4. 每轮训练60秒，答题后自动进入下一题。
          </div>
        </div>

        <div class="flex-card">
          <div class="flex-card-title">🎮 选择训练难度</div>
          <div class="flex-mode-grid">
            <button class="flex-mode normal" data-mode="normal">
              <div class="flex-mode-name">普通模式</div>
              <div class="flex-mode-info">
                每5题切换规则<br>
                每题10分<br>
                训练60秒
              </div>
            </button>

            <button class="flex-mode advanced" data-mode="advanced">
              <div class="flex-mode-name">进阶模式</div>
              <div class="flex-mode-info">
                每2题切换规则<br>
                每题15分<br>
                训练60秒
              </div>
            </button>
          </div>
        </div>

        <div class="flex-card">
          <div class="flex-card-title">📊 我的训练成绩</div>
          <div class="flex-stats">
            <div class="flex-stat">
              <div class="flex-stat-value">${stats.count}</div>
              <div class="flex-stat-label">训练次数</div>
            </div>
            <div class="flex-stat">
              <div class="flex-stat-value">${stats.bestScore}</div>
              <div class="flex-stat-label">最佳成绩</div>
            </div>
            <div class="flex-stat">
              <div class="flex-stat-value">${stats.completedCount}</div>
              <div class="flex-stat-label">通关次数</div>
            </div>
            <div class="flex-stat">
              <div class="flex-stat-value">${stats.passRate}%</div>
              <div class="flex-stat-label">通关率</div>
            </div>
          </div>

          <button class="flex-main-btn" data-action="records">
            查看历史成绩
          </button>
        </div>
      </div>
    </div>
  `;
}

function startMode(modeKey) {
  currentModeKey = modeKey;
  currentMode = MODES[modeKey];

  clearTimers();

  timeLeft = GAME_TIME;
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  totalCount = 0;
  switchCount = 0;
  switchErrors = 0;
  reactionTimes = [];

  currentRule = Math.random() < 0.5 ? "color" : "shape";
  firstQuestionAfterSwitch = false;
  locked = false;
  gameRunning = true;
  gameStartTime = Date.now();

  showGame();
  showQuestion();
  updateGameStats();

  timer = setInterval(() => {
    if (!gameRunning) return;

    timeLeft--;
    updateGameStats();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function showGame() {
  overlay.innerHTML = `
    <div class="flex-game-page">
      <div class="flex-game-container">
        <div class="flex-game-top">
          <div>
            <div class="flex-game-label">${currentMode.name}</div>
            <div class="flex-game-label" id="flexQuestionCount">已答 0 题</div>
          </div>
          <div class="flex-game-time" id="flexTime">60秒</div>
        </div>

        <div class="flex-progress">
          <div class="flex-progress-fill" id="flexProgress"></div>
        </div>

        <div class="flex-game-card">
          <div class="flex-rule-tag" id="flexRule">判断颜色</div>
          <div class="flex-question" id="flexQuestion">
            请根据提示选择正确答案
          </div>

          <div class="flex-symbol" id="flexSymbol">●</div>

          <div class="flex-options" id="flexOptions"></div>

          <div class="flex-feedback" id="flexFeedback"></div>
          <div class="flex-game-tip">
            注意观察规则变化，不要沿用上一题的判断方式
          </div>
        </div>
      </div>
    </div>
  `;
}

function showQuestion() {
  if (!gameRunning) return;

  locked = false;

  currentColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  currentShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

  const ruleEl = document.getElementById("flexRule");
  const questionEl = document.getElementById("flexQuestion");
  const symbolEl = document.getElementById("flexSymbol");
  const optionsEl = document.getElementById("flexOptions");
  const feedbackEl = document.getElementById("flexFeedback");

  if (!ruleEl || !questionEl || !symbolEl || !optionsEl) return;

  if (currentRule === "color") {
    ruleEl.textContent = "🎨 判断颜色";
    questionEl.textContent = "请问这个图案是什么颜色？";

    optionsEl.innerHTML = COLORS.map(color => `
      <button class="flex-option"
        data-answer="${color.name}">
        ${color.name}
      </button>
    `).join("");
  } else {
    ruleEl.textContent = "🔷 判断形状";
    questionEl.textContent = "请问这个图案是什么形状？";

    optionsEl.innerHTML = SHAPES.map(shape => `
      <button class="flex-option"
        data-answer="${shape.name}">
        ${shape.symbol} ${shape.name}
      </button>
    `).join("");
  }

  symbolEl.textContent = currentShape.symbol;
  symbolEl.style.color = currentColor.value;

  if (feedbackEl) feedbackEl.textContent = "";

  questionStartTime = Date.now();
}

function answerQuestion(answer) {
  if (!gameRunning || locked) return;

  locked = true;

  const reaction = (Date.now() - questionStartTime) / 1000;
  reactionTimes.push(reaction);

  totalCount++;

  const correctAnswer = currentRule === "color"
    ? currentColor.name
    : currentShape.name;

  const isCorrect = answer === correctAnswer;

  const feedbackEl = document.getElementById("flexFeedback");
  const optionButtons = overlay.querySelectorAll(".flex-option");

  optionButtons.forEach(button => {
    button.disabled = true;
  });

  if (isCorrect) {
    correctCount++;
    score += currentMode.points;

    if (feedbackEl) {
      feedbackEl.textContent = `✓ 回答正确 +${currentMode.points}分`;
      feedbackEl.style.color = "#23966a";
    }
  } else {
    wrongCount++;

    if (firstQuestionAfterSwitch) {
      switchErrors++;
    }

    if (feedbackEl) {
      feedbackEl.textContent = `✕ 回答错误，正确答案是：${correctAnswer}`;
      feedbackEl.style.color = "#df5a5a";
    }
  }

  firstQuestionAfterSwitch = false;

  updateGameStats();

  if (totalCount % currentMode.switchEvery === 0) {
    currentRule = currentRule === "color" ? "shape" : "color";
    switchCount++;
    firstQuestionAfterSwitch = true;
  }

  nextTimer = setTimeout(() => {
    if (gameRunning) {
      showQuestion();
    }
  }, NEXT_DELAY);
}

function updateGameStats() {
  const timeEl = document.getElementById("flexTime");
  const countEl = document.getElementById("flexQuestionCount");
  const progressEl = document.getElementById("flexProgress");

  if (timeEl) {
    timeEl.textContent = `${timeLeft}秒`;
    timeEl.style.color = timeLeft <= 10 ? "#e05252" : "#315f9c";
  }

  if (countEl) {
    countEl.textContent = `已答 ${totalCount} 题`;
  }

  if (progressEl) {
    progressEl.style.width = `${Math.max(0, timeLeft / GAME_TIME * 100)}%`;
  }
}

function clearTimers() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  if (nextTimer) {
    clearTimeout(nextTimer);
    nextTimer = null;
  }
}

function endGame() {
  if (!gameRunning) return;

  gameRunning = false;
  clearTimers();

  const usedTime = Math.min(
    GAME_TIME,
    Math.floor((Date.now() - gameStartTime) / 1000)
  );

  const accuracy = totalCount
    ? Math.round(correctCount / totalCount * 100)
    : 0;

  const avgReaction = reactionTimes.length
    ? Number(
        reactionTimes.reduce((sum, value) => sum + value, 0) /
        reactionTimes.length
      ).toFixed(2)
    : 0;

  const completed = totalCount >= 5 && accuracy >= 80;

  saveRecord({
    category: "flexibility",
    type: "认知灵活性训练",
    mode: currentMode.name,
    score,
    accuracy,
    correct: correctCount,
    wrong: wrongCount,
    rounds: totalCount,
    time: usedTime,
    avgReaction,
    switchCount,
    switchErrors,
    completed,
    date: new Date().toLocaleString()
  });

  showResult({
    usedTime,
    accuracy,
    avgReaction,
    completed
  });
}

function showResult(result) {
  const stats = getHistoryStats();

  overlay.innerHTML = `
    <div class="flex-page">
      <div class="flex-container">
        <div class="flex-header">
          <div class="flex-icon">🏆</div>
          <div class="flex-title">本轮训练结束</div>
          <div class="flex-desc">
            ${result.completed ? "表现出色，继续保持！" : "训练完成，继续练习会越来越熟练。"}
          </div>
        </div>

        <div class="flex-card">
          <div class="flex-result-score">${score}分</div>
          <div class="flex-result-sub">${currentMode.name} · 本轮得分</div>

          <div class="flex-result-grid">
            <div class="flex-result-item">
              <div class="flex-result-label">正确率</div>
              <div class="flex-result-value">${result.accuracy}%</div>
            </div>
            <div class="flex-result-item">
              <div class="flex-result-label">答题数量</div>
              <div class="flex-result-value">${totalCount}</div>
            </div>
            <div class="flex-result-item">
              <div class="flex-result-label">正确次数</div>
              <div class="flex-result-value">${correctCount}</div>
            </div>
            <div class="flex-result-item">
              <div class="flex-result-label">错误次数</div>
              <div class="flex-result-value">${wrongCount}</div>
            </div>
            <div class="flex-result-item">
              <div class="flex-result-label">规则切换次数</div>
              <div class="flex-result-value">${switchCount}</div>
            </div>
            <div class="flex-result-item">
              <div class="flex-result-label">切换后错误次数</div>
              <div class="flex-result-value">${switchErrors}</div>
            </div>
            <div class="flex-result-item">
              <div class="flex-result-label">平均反应时间</div>
              <div class="flex-result-value">${result.avgReaction}秒</div>
            </div>
            <div class="flex-result-item">
              <div class="flex-result-label">训练用时</div>
              <div class="flex-result-value">${result.usedTime}秒</div>
            </div>
          </div>
        </div>

        <div class="flex-card">
          <div class="flex-card-title">📊 历史训练统计</div>
          <div class="flex-stats">
            <div class="flex-stat">
              <div class="flex-stat-value">${stats.count}</div>
              <div class="flex-stat-label">训练次数</div>
            </div>
            <div class="flex-stat">
              <div class="flex-stat-value">${stats.bestScore}</div>
              <div class="flex-stat-label">历史最佳</div>
            </div>
            <div class="flex-stat">
              <div class="flex-stat-value">${stats.completedCount}</div>
              <div class="flex-stat-label">通关次数</div>
            </div>
            <div class="flex-stat">
              <div class="flex-stat-value">${stats.passRate}%</div>
              <div class="flex-stat-label">历史通关率</div>
            </div>
          </div>
        </div>

        <button class="flex-main-btn" data-action="retry">
          重新挑战
        </button>
        <button class="flex-secondary-btn" data-action="home">
          返回模式选择
        </button>
        <button class="flex-secondary-btn" data-action="records">
          查看历史成绩
        </button>
      </div>
    </div>
  `;
}

function handleClick(event) {
  const modeButton = event.target.closest("[data-mode]");
  if (modeButton) {
    startMode(modeButton.dataset.mode);
    return;
  }

  const answerButton = event.target.closest("[data-answer]");
  if (answerButton) {
    answerQuestion(answerButton.dataset.answer);
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const action = actionButton.dataset.action;

  if (action === "close") {
    clearTimers();
    gameRunning = false;
    overlay.remove();
    overlay = null;
  } else if (action === "home") {
    showHome();
  } else if (action === "retry") {
    startMode(currentModeKey);
  } else if (action === "records") {
    clearTimers();
    gameRunning = false;
    overlay.remove();
    overlay = null;
    showRecords("flexibility");
  }
}

export function startFlexibilityGame() {
  addStyles();

  if (overlay) {
    clearTimers();
    overlay.remove();
  }

  overlay = document.createElement("div");
  overlay.id = "flexibilityOverlay";
  document.body.appendChild(overlay);

  overlay.addEventListener("click", handleClick);

  showHome();
}
