
import { startFocusGame } from "./games/focus.js";
import { startMemoryGame } from "./games/memory.js";
import { startInhibitionGame } from "./games/inhibition.js";
import { startFlexibilityGame } from "./games/flexibility.js";
import { startLogicGame } from "./games/logic.js";
import { showRecords } from "./utils/record.js";

// 统一管理训练项目
function startTraining(type) {
  const games = {
    focus: startFocusGame,
    memory: startMemoryGame,
    inhibition: startInhibitionGame,
    flexibility: startFlexibilityGame,
    logic: startLogicGame,
    records: showRecords
  };

  if (games[type]) {
    games[type]();
  } else {
    alert("暂时没有找到这个训练项目");
  }
}

// 兼容首页 HTML 中的 onclick
window.startTraining = startTraining;

console.log("前额叶训练中心已启动");