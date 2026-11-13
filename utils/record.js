const STORAGE_KEY = "brainRecords";

// 训练项目
const CATEGORIES = [
  { id: "all", name: "全部训练", icon: "📊" },
  { id: "focus", name: "专注力训练", icon: "🎯" },
  { id: "memory", name: "工作记忆训练", icon: "🧠" },
  { id: "inhibition", name: "注意力抑制训练", icon: "🎨" },
  { id: "flexibility", name: "认知灵活性训练", icon: "🔄" },
  { id: "logic", name: "逻辑推理训练", icon: "💡" }
];

// 判断成绩属于哪个训练项目
function getCategory(record) {
  if (record.category) {
    return record.category;
  }

  // 兼容旧记录
  const type = String(record.type || "");

  if (
    type.includes("舒尔特") ||
    type.includes("专注力")
  ) {
    return "focus";
  }

  if (
    type.includes("记忆") ||
    type.includes("工作记忆")
  ) {
    return "memory";
  }

  if (type.includes("抑制")) {
    return "inhibition";
  }

  if (
    type.includes("灵活性") ||
    type.includes("认知灵活")
  ) {
    return "flexibility";
  }

  if (
    type.includes("逻辑") ||
    type.includes("推理")
  ) {
    return "logic";
  }

  return "other";
}

// 获取训练项目名称
function getCategoryName(category) {
  const item = CATEGORIES.find(
    item => item.id === category
  );

  return item ? item.name : "其他训练";
}

// 获取所有记录
export function getRecords() {
  try {
    const data = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("读取成绩失败", error);
    return [];
  }
}

// 保存记录
export function saveRecord(record) {
  const records = getRecords();

  records.push({
    ...record,
    savedAt: Date.now()
  });

  // 最多保留500条
  if (records.length > 500) {
    records.splice(0, records.length - 500);
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(records)
    );
  } catch (error) {
    console.error("保存成绩失败", error);
    alert("成绩保存失败，请检查浏览器存储空间。");
  }
}

// 防止HTML注入
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// 安全转换数字
function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

// 计算模式统计
function getModeStats(records, mode) {
  const list = records.filter(
    item => item.mode === mode
  );

  const completed = list.filter(
    item => item.completed === true
  );

  const bestScore = list.length
    ? Math.max(
        ...list.map(item => toNumber(item.score))
      )
    : 0;

  const accuracyList = list.filter(
    item => item.accuracy != null
  );

  const avgAccuracy = accuracyList.length
    ? Math.round(
        accuracyList.reduce(
          (sum, item) => sum + toNumber(item.accuracy),
          0
        ) / accuracyList.length
      )
    : 0;

  return {
    count: list.length,
    completed: completed.length,
    bestScore,
    avgAccuracy
  };
}

// 显示成绩
export function showRecords(category = "all") {
  const allRecords = getRecords();

  // 当前项目记录
  const records = category === "all"
    ? allRecords
    : allRecords.filter(
        item => getCategory(item) === category
      );

  const total = records.length;

  const successCount = records.filter(
    item => item.completed === true
  ).length;

  const successRate = total
    ? Math.round(successCount / total * 100)
    : 0;

  const titleMap = {
    focus: "🎯 专注力训练成绩",
    memory: "🧠 工作记忆训练成绩",
    inhibition: "🎨 注意力抑制训练成绩",
    flexibility: "🔄 认知灵活性训练成绩",
    logic: "💡 逻辑推理训练成绩",
    all: "📊 全部训练成绩"
  };

  const title = titleMap[category] || "📊 全部训练成绩";

  // 获取当前项目实际出现过的模式
  const modes = [
    ...new Set(
      records
        .map(item => item.mode)
        .filter(Boolean)
    )
  ];

  // 模式统计卡片
  const modeHTML = category !== "all" && modes.length
    ? `
      <h3 class="records-section-title">
        📈 各模式训练统计
      </h3>

      <div class="record-mode-list">
        ${modes.map(mode => {
          const stats = getModeStats(records, mode);

          return `
            <div class="record-mode-card">
              <h3>${escapeHTML(mode)}</h3>

              <div class="record-stat-row">
                <span>训练次数</span>
                <strong>${stats.count}</strong>
              </div>

              <div class="record-stat-row">
                <span>成功通关</span>
                <strong>${stats.completed}</strong>
              </div>

              <div class="record-stat-row">
                <span>最高得分</span>
                <strong>${stats.bestScore}</strong>
              </div>

              <div class="record-stat-row">
                <span>平均正确率</span>
                <strong>${stats.avgAccuracy}%</strong>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `
    : "";

  // 最新记录优先
  const history = records
    .slice()
    .sort((a, b) => {
      return (
        Number(b.savedAt || 0) -
        Number(a.savedAt || 0)
      );
    });

  // 历史记录
  const historyHTML = history.length
    ? history.map(item => {
        const itemCategory = getCategory(item);

        const categoryName = getCategoryName(
          itemCategory
        );

        const statusText =
          item.completed === true
            ? "已通关"
            : item.completed === false
              ? "未通关"
              : "训练记录";

        const statusClass =
          item.completed === true
            ? "status-success"
            : item.completed === false
              ? "status-fail"
              : "";

        return `
          <div class="history-card">

            <div class="history-heading">
              <strong>
                ${escapeHTML(categoryName)}
              </strong>

              <span class="${statusClass}">
                ${statusText}
              </span>
            </div>

            <div style="
              margin:6px 0 10px;
              font-size:13px;
              color:#718096;
            ">
              训练模式：
              <strong style="color:#40536b;">
                ${escapeHTML(item.mode || "未记录")}
              </strong>
            </div>

            <div class="history-details">
              <span>得分：${toNumber(item.score)}</span>

              <span>
                正确率：
                ${item.accuracy == null
                  ? "--"
                  : toNumber(item.accuracy) + "%"}
              </span>

              <span>
                正确：
                ${item.correct == null
                  ? "--"
                  : toNumber(item.correct) + "次"}
              </span>

              <span>
                错误：
                ${item.wrong == null
                  ? "--"
                  : toNumber(item.wrong) + "次"}
              </span>

              <span>
                用时：
                ${item.time == null
                  ? "--"
                  : toNumber(item.time) + "秒"}
              </span>

              <span>
                平均反应：
                ${item.avgReaction == null
                  ? "--"
                  : toNumber(item.avgReaction)}
              </span>
            </div>

            <small>
              ${escapeHTML(item.date || "日期未记录")}
            </small>

          </div>
        `;
      }).join("")
    : `
      <p class="empty-records">
        暂无${category === "all"
          ? ""
          : escapeHTML(getCategoryName(category))}成绩记录，
        快去完成第一次挑战吧！
      </p>
    `;

  // 创建记录窗口
  const overlay = document.createElement("div");
  overlay.className = "game-overlay";

  overlay.innerHTML = `
    <div class="game-box records-box">

      <button class="close-game" id="closeRecords">×</button>

      <h2>${title}</h2>

      <p>记录每一次训练进步</p>

      <!-- 训练项目筛选 -->
      <div style="
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:7px;
        margin:18px 0;
      ">
        ${CATEGORIES.map(item => `
          <button
            class="record-filter-btn"
            data-category="${item.id}"
            style="
              padding:9px 4px;
              border:0;
              border-radius:9px;
              font-size:12px;
              cursor:pointer;
              background:${category === item.id
                ? "#dceaff"
                : "#f0f3f8"};
              color:${category === item.id
                ? "#2863a5"
                : "#52647b"};
              font-weight:${category === item.id
                ? "bold"
                : "normal"};
            "
          >
            ${item.icon} ${item.name}
          </button>
        `).join("")}
      </div>

      <!-- 总体统计 -->
      <div class="records-overview">

        <div>
          <small>累计训练</small>
          <strong>${total}</strong>
        </div>

        <div>
          <small>成功通关</small>
          <strong>${successCount}</strong>
        </div>

        <div>
          <small>通关率</small>
          <strong>${successRate}%</strong>
        </div>

      </div>

      ${modeHTML}

      <h3 class="records-section-title">
        📅 历史训练记录
      </h3>

      <div class="records-history">
        ${historyHTML}
      </div>

      <button class="clear-records-btn" id="clearRecords">
        清空${category === "all"
          ? "全部"
          : escapeHTML(getCategoryName(category))}记录
      </button>

    </div>
  `;

  document.body.appendChild(overlay);

  // 关闭窗口
  overlay.querySelector("#closeRecords").onclick = () => {
    overlay.remove();
  };

  // 切换训练项目
  overlay.querySelectorAll(".record-filter-btn").forEach(button => {
    button.onclick = () => {
      const selectedCategory = button.dataset.category;

      overlay.remove();
      showRecords(selectedCategory);
    };
  });

  // 清空当前项目记录
  overlay.querySelector("#clearRecords").onclick = () => {
    const message = category === "all"
      ? "确定清空全部训练记录吗？此操作无法恢复。"
      : `确定只清空${getCategoryName(category)}记录吗？`;

    if (!confirm(message)) return;

    const remaining = category === "all"
      ? []
      : allRecords.filter(
          item => getCategory(item) !== category
        );

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(remaining)
      );

      overlay.remove();
      showRecords(category);

    } catch (error) {
      console.error("清空记录失败", error);
      alert("清空记录失败，请重试。");
    }
  };
}
