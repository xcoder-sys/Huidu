/* command.js; */
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
      var i, sta = "", refreshPos = 0;
      for (i = 0; i < MPV["Refresh"].length; i++) {
            refreshPos = MPV["Refresh"][i];
            /* 输入有刷新将"sta"变量赋值为有刷新输入对应的静态参数*/
            sta = MPV["StaticParameter"][refreshPos]["SignalValue"];
            /* 输入有刷新，将赋值后的静态参数变量加上 转换后的音量值进行指令输出*/
            MRV["Output"]["Pos1"] = sta + (parseInt(MPV["Input"][refreshPos]["SignalValue"] / 780) - 72) * 100 + ".";
            /* 刷新输出 */
            MRV["Refresh"][0] = "Pos1";
      }
      return MRV;
}; 