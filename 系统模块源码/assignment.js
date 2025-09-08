/*assignment.js; */
function call(MPV) {
      /* 返回数据MRV基本数据格式定义 */
      var MRV = {
            /*输出数据，包含输出的信号位置和值*/
            "Output": {},
            /* 模块内部私有数据存储结构 */
            "PrivateInfo": {
                  "OutputPreviousValue": {}
            },
            /* 输出刷新信号位置 */
            "Refresh": [],
            "Token": ""
      };
      /* 临时变量，用于运算 */
      var i, refreshPos = 0;
      for (i = 0; i < MPV["Refresh"].length; i++) {
            refreshPos = MPV["Refresh"][i];
            /* 输入有刷新，将输入对应的输出信号赋值为Pos9的值并进行输出 */
            MRV["Output"][refreshPos] = MPV["Input"]["Pos9"]["SignalValue"];
            /* 刷新输出 */
            MRV["Refresh"][i] = refreshPos;
      }
      return MRV;
};