
import { saveRecord, getRecords, showRecords } from "../utils/record.js";

const GAME_TIME = 60;
const NEXT_DELAY = 900;

const MODES = {
  normal: {
    name: "普通模式",
    questionCount: 10,
    points: 10
  },
  advanced: {
    name: "进阶模式",
    questionCount: 8,
    points: 15
  }
};

// 数字规律题
const NUMBER_QUESTIONS = [
  {
    question: "找规律：2、4、6、8、？",
    options: ["9", "10", "11", "12"],
    answer: "10",
    explanation: "每次增加2，所以下一个数字是10。"
  },
  {
    question: "找规律：3、6、12、24、？",
    options: ["36", "42", "48", "54"],
    answer: "48",
    explanation: "每个数字都是前一个数字的2倍。"
  },
  {
    question: "找规律：1、4、9、16、？",
    options: ["20", "24", "25", "36"],
    answer: "25",
    explanation: "这些数字依次是1²、2²、3²、4²，下一个是5²。"
  },
  {
    question: "找规律：20、17、14、11、？",
    options: ["6", "7", "8", "9"],
    answer: "8",
    explanation: "每次减少3，11减去3等于8。"
  },
  {
    question: "找规律：2、5、10、17、？",
    options: ["24", "25", "26", "27"],
    answer: "26",
    explanation: "依次增加3、5、7、9，下一个是26。"
  },
  {
    question: "找规律：1、1、2、3、5、？",
    options: ["6", "7", "8", "9"],
    answer: "8",
    explanation: "从第三项开始，每项等于前两项之和。"
  },
  {
    question: "找规律：5、10、20、40、？",
    options: ["60", "70", "80", "90"],
    answer: "80",
    explanation: "每次乘以2，40乘以2等于80。"
  },
  {
    question: "找规律：30、25、20、15、？",
    options: ["5", "8", "10", "12"],
    answer: "10",
    explanation: "每次减少5，所以下一个数字是10。"
  },
  {
    question: "找规律：2、6、12、20、30、？",
    options: ["36", "40", "42", "44"],
    answer: "42",
    explanation: "依次增加4、6、8、10、12，下一个是42。"
  },
  {
    question: "找规律：81、27、9、3、？",
    options: ["0", "1", "2", "3"],
    answer: "1",
    explanation: "每次除以3，3除以3等于1。"
  },
  {
    question: "找规律：4、9、19、39、？",
    options: ["59", "69", "79", "89"],
    answer: "79",
    explanation: "每次乘以2再加1，39乘以2再加1等于79"
  },
  {
    question: "找规律：1、2、6、24、？",
    options: ["48", "96", "100", "120"],
    answer: "120",
    explanation: "依次乘以2、3、4、5，24乘以5等于120。"
  }
];

// 图形规律题
const SYMBOL_QUESTIONS = [
  {
    question: "找规律：○、△、○、△、○、？",
    options: ["○", "△", "□", "◇"],
    answer: "△",
    explanation: "圆形和三角形交替出现。"
  },
  {
    question: "找规律：★、☆、☆、★、☆、☆、？",
    options: ["○", "☆", "★", "□"],
    answer: "★",
    explanation: "每组三个图形，顺序是实心星、空心星、空心星。"
  },
  {
    question: "找规律：□、□、○、□、□、○、？",
    options: ["△", "○", "□", "◇"],
    answer: "□",
    explanation: "每组三个图形，前两个是方形，第三个是圆形。"
  },
  {
    question: "找规律：△、○、□、△、○、□、？",
    options: ["○", "□", "△", "◇"],
    answer: "△",
    explanation: "三角形、圆形、方形依次循环。"
  },
  {
    question: "找规律：●、○、●、○、●、？",
    options: ["●", "○", "■", "□"],
    answer: "○",
    explanation: "实心圆和空心圆交替出现。"
  },
  {
    question: "找规律：▲、▲、■、▲、▲、■、？",
    options: ["■", "○", "▲", "★"],
    answer: "▲",
    explanation: "每组三个图形，前两个是三角形，第三个是方形。"
  },
  {
    question: "找规律：◇、□、◇、□、◇、？",
    options: ["◇", "□", "○", "△"],
    answer: "□",
    explanation: "菱形和方形交替出现。"
  },
  {
    question: "找规律：○、○、△、△、○、○、？",
    options: ["○", "□", "△", "◇"],
    answer: "△",
    explanation: "两个圆形后接两个三角形，循环重复。"
  }
];

// 逻辑判断题
const LOGIC_QUESTIONS = [
  {
    question: "所有猫都是动物，所有动物都需要水。下面哪项一定正确？",
    options: [
      "所有猫都需要水",
      "所有动物都是猫",
      "所有需要水的都是猫",
      "猫不是动物"
    ],
    answer: "所有猫都需要水",
    explanation: "猫属于动物，而所有动物都需要水，因此猫也需要水。"
  },
  {
    question: "小明比小华高，小华比小亮高。三个人中谁最矮？",
    options: ["小明", "小华", "小亮", "无法判断"],
    answer: "小亮",
    explanation: "身高顺序是小明、小华、小亮，所以小亮最矮。"
  },
  {
    question: "如果下雨，地面就会湿。现在地面湿了，能否确定下过雨？",
    options: [
      "一定下过雨",
      "一定没有下雨",
      "无法确定",
      "地面一定是干的"
    ],
    answer: "无法确定",
    explanation: "地面湿也可能有其他原因，不能仅凭地面湿就确定下雨。"
  },
  {
    question: "所有苹果都是水果，没有水果是金属。下面哪项一定正确？",
    options: [
      "有些苹果是金属",
      "苹果不是金属",
      "所有金属都是苹果",
      "所有水果都是苹果"
    ],
    answer: "苹果不是金属",
    explanation: "苹果属于水果，而水果不属于金属，所以苹果不是金属。"
  },
  {
    question: "红盒比蓝盒重，蓝盒比绿盒重。哪个盒子最轻？",
    options: ["红盒", "蓝盒", "绿盒", "无法判断"],
    answer: "绿盒",
    explanation: "重量关系是红盒大于蓝盒，蓝盒大于绿盒，因此绿盒最轻。"
  },
  {
    question: "只有完成任务才能领取奖励。小刚已经领取了奖励，可以确定什么？",
    options: [
      "小刚没有完成任务",
      "小刚完成了任务",
      "所有人都完成了任务",
      "小刚完成了两项任务"
    ],
    answer: "小刚完成了任务",
    explanation: "领取奖励的前提是完成任务，已经领奖就说明完成了任务。"
  },
  {
    question: "甲、乙、丙三人中，甲不是最高的，丙比乙高。谁可能最高？",
    options: ["甲", "乙", "丙", "无法判断"],
    answer: "丙",
    explanation: "丙比乙高，甲又不是最高，因此丙可能且必然是三人中最高的。"
  },
  {
    question: "所有参加比赛的人都需要报名。小李没有报名。能确定什么？",
    options: [
      "小李参加了比赛",
      "小李没有参加比赛",
      "小李获得了名次",
      "所有人都没有报名"
    ],
    answer: "小李没有参加比赛",
    explanation: "参加比赛必须报名，小李没有报名，因此没有参加比赛。"
  },
  {
    question: "A比B大，B比C大，C比D大。四个数中哪个最大？",
    options: ["A", "B", "C", "D"],
    answer: "A",
    explanation: "大小关系为A大于B、B大于C、C大于D，因此A最大。"
  },
  {
    question: "如果一个数字能被10整除，那么它的个位数是0。数字35的个位数不是0，可以确定什么？",
    options: [
      "35能被10整除",
      "35不能被10整除",
      "35一定是偶数",
      "35一定是质数"
    ],
    answer: "35不能被10整除",
    explanation: "能被10整除的整数个位必须是0，35的个位是5。"
  }
];

let overlay = null;
let currentModeKey = "normal";
let currentMode = null;

let questionSet = [];
let currentQuestionIndex = 0;
let currentQuestion = null;

let timer = null;
let nextTimer = null;

let timeLeft = GAME_TIME;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let reactionTimes = [];

let questionStartTime = 0;
let locked = false;
let gameRunning = false;
let gameStartTime = 0;

function addStyles() {
  if (document.getElementById("logicStyles")) return;

  const style = document.createElement("style");
  style.id = "logicStyles";

  style.textContent = `
    #logicOverlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: #f3f6fb;
      overflow-y: auto;
      font-family: Arial, "Microsoft YaHei", sans-serif;
      color: #263449;
    }

    #logicOverlay * {
      box-sizing: border-box;
    }

    .logic-page {
      width: 100%;
      min-height: 100%;
      padding: 24px 16px 35px;
    }

    .logic-container {
      max-width: 650px;
      margin: 0 auto;
    }

    .logic-back {
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

    .logic-back:hover {
      background: #d2dce9;
    }

    .logic-header {
      text-align: center;
      margin-bottom: 22px;
    }

    .logic-icon {
      font-size: 42px;
      margin-bottom: 8px;
    }

    .logic-title {
      font-size: 27px;
      font-weight: 800;
      margin-bottom: 8px;
    }

    .logic-desc {
      color: #718096;
      font-size: 14px;
      line-height: 1.7;
    }

    .logic-card {
      background: white;
      border-radius: 17px;
      padding: 22px;
      margin-bottom: 17px;
      box-shadow: 0 5px 20px rgba(40, 60, 90, .06);
    }

    .logic-card-title {
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 13px;
    }

    .logic-rules {
      color: #58677c;
      font-size: 14px;
      line-height: 2;
    }

    .logic-mode-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .logic-mode {
      border: 2px solid transparent;
      border-radius: 14px;
      padding: 19px 12px;
      cursor: pointer;
      text-align: center;
      transition: .2s;
    }

    .logic-mode.normal {
      background: #eaf3ff;
      border-color: #c8ddfa;
      color: #2762a8;
    }

    .logic-mode.normal:hover {
      background: #d8e9ff;
    }

    .logic-mode.advanced {
      background: #fff1df;
      border-color: #f8d6a9;
      color: #a65a12;
    }

    .logic-mode.advanced:hover {
      background: #ffe4c2;
    }

    .logic-mode-name {
      font-size: 19px;
      font-weight: 800;
      margin-bottom: 9px;
    }

    .logic-mode-info {
      font-size: 13px;
      line-height: 1.8;
    }

    .logic-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .logic-stat {
      background: #f5f8fc;
      border-radius: 11px;
      padding: 13px 5px;
      text-align: center;
    }

    .logic-stat-value {
      font-size: 21px;
      font-weight: 800;
      color: #345f9c;
    }

    .logic-stat-label {
      color: #8290a3;
      font-size: 12px;
      margin-top: 5px;
    }

    .logic-main-btn {
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

    .logic-main-btn:hover {
      background: #3268b1;
    }

    .logic-secondary-btn {
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

    .logic-secondary-btn:hover {
      background: #d8e1ec;
    }

    /* 正式训练页面：紧凑布局 */
    .logic-game-page {
      min-height: 100%;
      padding: 12px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .logic-game-container {
      width: 100%;
      max-width: 540px;
      margin: 0 auto;
    }

    .logic-game-container .logic-back {
      padding: 7px 13px;
      font-size: 13px;
      margin-bottom: 10px;
    }

    .logic-game-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .logic-game-label {
      font-size: 13px;
      color: #718096;
    }

    .logic-game-time {
      font-size: 20px;
      font-weight: 800;
      color: #315f9c;
    }

    .logic-progress {
      width: 100%;
      height: 7px;
      background: #e3eaf3;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 12px;
    }

    .logic-progress-fill {
      height: 100%;
      width: 100%;
      background: #5790d6;
      transition: width .3s linear;
    }

    .logic-question-card {
      background: white;
      border-radius: 16px;
      padding: 19px 16px;
      box-shadow: 0 5px 20px rgba(40, 60, 90, .06);
    }

    .logic-type {
      display: inline-block;
      padding: 6px 13px;
      border-radius: 20px;
      background: #eaf2ff;
      color: #3569a8;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 13px;
    }

    .logic-question {
      font-size: 18px;
      font-weight: 700;
      line-height: 1.65;
      color: #34445a;
      margin-bottom: 18px;
      min-height: 55px;
    }

    .logic-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 11px;
    }

    .logic-option {
      min-height: 55px;
      padding: 10px 8px;
      border: 2px solid #e3eaf3;
      background: #f7f9fc;
      color: #40536b;
      border-radius: 11px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: .18s;
      line-height: 1.5;
    }

    .logic-option:hover {
      background: #eaf2ff;
      border-color: #8db5e8;
    }

    .logic-option:disabled {
      cursor: default;
      opacity: .75;
    }

    .logic-feedback {
      min-height: 43px;
      margin-top: 13px;
      font-size: 14px;
      line-height: 1.6;
      font-weight: 700;
    }

    .logic-result-score {
      font-size: 42px;
      color: #3977c2;
      font-weight: 900;
      text-align: center;
      margin: 10px 0 5px;
    }

    .logic-result-sub {
      text-align: center;
      color: #8290a3;
      font-size: 13px;
      margin-bottom: 18px;
    }

    .logic-result-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .logic-result-item {
      background: #f5f8fc;
      padding: 13px;
      border-radius: 10px;
    }

    .logic-result-label {
      color: #8290a3;
      font-size: 12px;
      margin-bottom: 6px;
    }

    .logic-result-value {
      font-size: 19px;
      color: #344f72;
      font-weight: 800;
    }

    @media (max-width: 480px) {
      .logic-page {
        padding: 17px 12px 25px;
      }

      .logic-title {
        font-size: 24px;
      }

      .logic-card {
        padding: 17px;
      }

      .logic-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .logic-game-page {
        padding: 8px 9px 12px;
      }

      .logic-question-card {
        padding: 15px 12px;
      }

      .logic-question {
        font-size: 16px;
        margin-bottom: 13px;
      }

      .logic-option {
        min-height: 49px;
        font-size: 14px;
      }
    }

    @media (max-height: 650px) {
      .logic-game-page {
        padding-top: 5px;
      }

      .logic-question-card {
        padding: 11px 12px;
      }

      .logic-question {
        min-height: 0;
        margin-bottom: 9px;
        font-size: 16px;
      }

      .logic-type {
        margin-bottom: 7px;
      }

      .logic-option {
        min-height: 43px;
        padding: 7px;
      }

      .logic-feedback {
        margin-top: 6px;
        min-height: 30px;
      }
    }
  `;

  document.head.appendChild(style);
}

function shuffleArray(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function createQuestionSet(mode) {
  const numberCount = mode === "normal" ? 4 : 3;
  const symbolCount = mode === "normal" ? 3 : 3;
  const logicCount = mode === "normal" ? 3 : 2;

  const numberQuestions = shuffleArray(NUMBER_QUESTIONS)
    .slice(0, numberCount)
    .map(item => ({ ...item, type: "数字规律" }));

  const symbolQuestions = shuffleArray(SYMBOL_QUESTIONS)
    .slice(0, symbolCount)
    .map(item => ({ ...item, type: "图形规律" }));

  const logicQuestions = shuffleArray(LOGIC_QUESTIONS)
    .slice(0, logicCount)
    .map(item => ({ ...item, type: "逻辑判断" }));

  return shuffleArray([
    ...numberQuestions,
    ...symbolQuestions,
    ...logicQuestions
  ]);
}

function getHistoryStats() {
  const records = getRecords() || [];
  const list = records.filter(item => item.category === "logic");

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
    <div class="logic-page">
      <div class="logic-container">
        <button class="logic-back" data-action="close">← 返回</button>

        <div class="logic-header">
          <div class="logic-icon">💡</div>
          <div class="logic-title">逻辑推理训练</div>
          <div class="logic-desc">
            发现规律、分析信息、训练逻辑思考能力
          </div>
        </div>

        <div class="logic-card">
          <div class="logic-card-title">📖 训练规则</div>
          <div class="logic-rules">
            1. 题目分为数字规律、图形规律和逻辑判断。<br>
            2. 仔细观察题目，选择你认为正确的答案。<br>
            3. 每题答完后，系统会自动进入下一题。<br>
            4. 在规定时间内完成挑战，答对即可获得积分。
          </div>
        </div>

        <div class="logic-card">
          <div class="logic-card-title">🎮 选择训练难度</div>
          <div class="logic-mode-grid">
            <button class="logic-mode normal" data-mode="normal">
              <div class="logic-mode-name">普通模式</div>
              <div class="logic-mode-info">
                10道题<br>
                每题10分<br>
                训练60秒
              </div>
            </button>

            <button class="logic-mode advanced" data-mode="advanced">
              <div class="logic-mode-name">进阶模式</div>
              <div class="logic-mode-info">
                8道题<br>
                每题15分<br>
                训练60秒
              </div>
            </button>
          </div>
        </div>

        <div class="logic-card">
          <div class="logic-card-title">📊 我的训练成绩</div>
          <div class="logic-stats">
            <div class="logic-stat">
              <div class="logic-stat-value">${stats.count}</div>
              <div class="logic-stat-label">训练次数</div>
            </div>
            <div class="logic-stat">
              <div class="logic-stat-value">${stats.bestScore}</div>
              <div class="logic-stat-label">最佳成绩</div>
            </div>
            <div class="logic-stat">
              <div class="logic-stat-value">${stats.completedCount}</div>
              <div class="logic-stat-label">通关次数</div>
            </div>
            <div class="logic-stat">
              <div class="logic-stat-value">${stats.passRate}%</div>
              <div class="logic-stat-label">通关率</div>
            </div>
          </div>

          <button class="logic-main-btn" data-action="records">
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

  questionSet = createQuestionSet(modeKey);
  currentQuestionIndex = 0;
  currentQuestion = null;

  timeLeft = GAME_TIME;
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  reactionTimes = [];

  locked = false;
  gameRunning = true;
  gameStartTime = Date.now();

  showGame();
  showQuestion();

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
    <div class="logic-game-page">
      <div class="logic-game-container">
        <button class="logic-back" data-action="quit">← 返回</button>

        <div class="logic-game-top">
          <div>
            <div class="logic-game-label">${currentMode.name}</div>
            <div class="logic-game-label" id="logicQuestionCount">
              第1题 / 共${currentMode.questionCount}题
            </div>
          </div>
          <div class="logic-game-time" id="logicTime">60秒</div>
        </div>

        <div class="logic-progress">
          <div class="logic-progress-fill" id="logicProgress"></div>
        </div>

        <div class="logic-question-card">
          <div class="logic-type" id="logicType">数字规律</div>
          <div class="logic-question" id="logicQuestion"></div>
          <div class="logic-options" id="logicOptions"></div>
          <div class="logic-feedback" id="logicFeedback"></div>
        </div>
      </div>
    </div>
  `;
}

function showQuestion() {
  if (!gameRunning) return;

  if (currentQuestionIndex >= questionSet.length) {
    endGame();
    return;
  }

  locked = false;
  currentQuestion = questionSet[currentQuestionIndex];

  const typeEl = document.getElementById("logicType");
  const questionEl = document.getElementById("logicQuestion");
  const optionsEl = document.getElementById("logicOptions");
  const feedbackEl = document.getElementById("logicFeedback");
  const countEl = document.getElementById("logicQuestionCount");

  if (!typeEl || !questionEl || !optionsEl) return;

  typeEl.textContent = currentQuestion.type;
  questionEl.textContent = currentQuestion.question;

  optionsEl.innerHTML = currentQuestion.options.map(option => `
    <button class="logic-option" data-answer="${option.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}">
      ${option}
    </button>
  `).join("");

  if (feedbackEl) {
    feedbackEl.textContent = "";
  }

  if (countEl) {
    countEl.textContent =
      `第${currentQuestionIndex + 1}题 / 共${currentMode.questionCount}题`;
  }

  questionStartTime = Date.now();
}

function answerQuestion(answer) {
  if (!gameRunning || locked || !currentQuestion) return;

  locked = true;

  const reaction = (Date.now() - questionStartTime) / 1000;
  reactionTimes.push(reaction);

  const isCorrect = answer === currentQuestion.answer;

  if (isCorrect) {
    correctCount++;
    score += currentMode.points;
  } else {
    wrongCount++;
  }

  const feedbackEl = document.getElementById("logicFeedback");
  const optionButtons = overlay.querySelectorAll(".logic-option");

  optionButtons.forEach(button => {
    button.disabled = true;
  });

  if (feedbackEl) {
    feedbackEl.textContent = isCorrect
      ? `✓ 回答正确！${currentQuestion.explanation}`
      : `✕ 回答错误。正确答案：${currentQuestion.answer}。${currentQuestion.explanation}`;

    feedbackEl.style.color = isCorrect ? "#23966a" : "#df5a5a";
  }

  updateGameStats();

  nextTimer = setTimeout(() => {
    if (!gameRunning) return;

    currentQuestionIndex++;

    if (currentQuestionIndex >= questionSet.length) {
      endGame();
    } else {
      showQuestion();
    }
  }, NEXT_DELAY);
}

function updateGameStats() {
  const timeEl = document.getElementById("logicTime");
  const progressEl = document.getElementById("logicProgress");

  if (timeEl) {
    timeEl.textContent = `${timeLeft}秒`;
    timeEl.style.color = timeLeft <= 10 ? "#e05252" : "#315f9c";
  }

  if (progressEl) {
    progressEl.style.width =
      `${Math.max(0, timeLeft / GAME_TIME * 100)}%`;
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

  const totalCount = correctCount + wrongCount;

  const accuracy = totalCount
    ? Math.round(correctCount / totalCount * 100)
    : 0;

  const avgReaction = reactionTimes.length
    ? Number(
        reactionTimes.reduce((sum, value) => sum + value, 0) /
        reactionTimes.length
      ).toFixed(2)
    : 0;

  const completed =
    totalCount === currentMode.questionCount &&
    accuracy >= 80;

  saveRecord({
    category: "logic",
    type: "逻辑推理训练",
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
  });

  showResult({
    totalCount,
    usedTime,
    accuracy,
    avgReaction,
    completed
  });
}

function showResult(result) {
  const stats = getHistoryStats();

  overlay.innerHTML = `
    <div class="logic-page">
      <div class="logic-container">
        <div class="logic-header">
          <div class="logic-icon">🏆</div>
          <div class="logic-title">本轮训练结束</div>
          <div class="logic-desc">
            ${result.completed
              ? "表现出色，继续保持！"
              : "训练完成，继续练习会越来越熟练。"}
          </div>
        </div>

        <div class="logic-card">
          <div class="logic-result-score">${score}分</div>
          <div class="logic-result-sub">${currentMode.name} · 本轮得分</div>

          <div class="logic-result-grid">
            <div class="logic-result-item">
              <div class="logic-result-label">正确率</div>
              <div class="logic-result-value">${result.accuracy}%</div>
            </div>
            <div class="logic-result-item">
              <div class="logic-result-label">答题数量</div>
              <div class="logic-result-value">${result.totalCount}</div>
            </div>
            <div class="logic-result-item">
              <div class="logic-result-label">正确次数</div>
              <div class="logic-result-value">${correctCount}</div>
            </div>
            <div class="logic-result-item">
              <div class="logic-result-label">错误次数</div>
              <div class="logic-result-value">${wrongCount}</div>
            </div>
            <div class="logic-result-item">
              <div class="logic-result-label">平均反应时间</div>
              <div class="logic-result-value">${result.avgReaction}秒</div>
            </div>
            <div class="logic-result-item">
              <div class="logic-result-label">训练用时</div>
              <div class="logic-result-value">${result.usedTime}秒</div>
            </div>
          </div>
        </div>

        <div class="logic-card">
          <div class="logic-card-title">📊 历史训练统计</div>
          <div class="logic-stats">
            <div class="logic-stat">
              <div class="logic-stat-value">${stats.count}</div>
              <div class="logic-stat-label">训练次数</div>
            </div>
            <div class="logic-stat">
              <div class="logic-stat-value">${stats.bestScore}</div>
              <div class="logic-stat-label">历史最佳</div>
            </div>
            <div class="logic-stat">
              <div class="logic-stat-value">${stats.completedCount}</div>
              <div class="logic-stat-label">通关次数</div>
            </div>
            <div class="logic-stat">
              <div class="logic-stat-value">${stats.passRate}%</div>
              <div class="logic-stat-label">历史通关率</div>
            </div>
          </div>
        </div>

        <button class="logic-main-btn" data-action="retry">
          重新挑战
        </button>
        <button class="logic-secondary-btn" data-action="home">
          返回模式选择
        </button>
        <button class="logic-secondary-btn" data-action="records">
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
  } else if (action === "quit") {
    clearTimers();
    gameRunning = false;
    showHome();
  } else if (action === "home") {
    showHome();
  } else if (action === "retry") {
    startMode(currentModeKey);
  } else if (action === "records") {
    clearTimers();
    gameRunning = false;
    overlay.remove();
    overlay = null;
    showRecords("logic");
  }
}

export function startLogicGame() {
  addStyles();

  if (overlay) {
    clearTimers();
    overlay.remove();
  }

  overlay = document.createElement("div");
  overlay.id = "logicOverlay";
  document.body.appendChild(overlay);

  overlay.addEventListener("click", handleClick);

  showHome();
}
