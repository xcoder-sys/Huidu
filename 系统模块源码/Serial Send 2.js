/*
 

 文件名称: Serial Send 2.js
 功能:
 信号：
 多个数字量输入：<trig1>到<trig999>
 一个串行量输出：<out$>
 多个参数：<string1>到<string999>

 描述：
 串行发送模块在每一个输入数字量信号<trigN>的上升沿发送<stringN>参数定义的字符串到输出<out$>。
 如果同时有多个<trigN>触发时，将输出最后一个。。
 

 版本说明: M3后台1.0正式发行版
 修改描述:
 */

exports.call = function (MPV) {
    /* 返回数据MRV基本数据格式定义 */
    var MRV = {
        "Output": {},   // 返回数据MRV基本数据格式定义
        "PrivateInfo": { //私有数据
            "InputPreviousValue": {} //记录输入信号状态
        },
        "Refresh": [],  //输出刷新信号位置
        "Token": ""
    };

    /* 临时变量，用于运算 */
    var i, inputPos, refreshPos;

    /* 第一次执行没有PrivateInfo信息，需要进行判断 */
    if ("PrivateInfo" in MPV) {
        /* 初始化输出为空 */
        MRV["Output"]["Pos1"] = "";
        /* 循环刷新，输出赋值 */
        for (i = 0; i < MPV["Refresh"].length; i++) {
            refreshPos = MPV["Refresh"][i];
            /* 有刷新，且对应的输入为上升沿，则输出参数值 */
            if (MPV["Input"][refreshPos]["SignalValue"] === true && MPV["PrivateInfo"]["InputPreviousValue"][refreshPos] === false) {
                MRV["Output"]["Pos1"] = MPV["StaticParameter"][refreshPos]["SignalValue"];
                MRV["Refresh"][0] = "Pos1";
            }
        }
        /* 记录此次状态input，用于下一次调用使用 */
        for (inputPos in MPV["Input"]) {
            MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
        }
        return MRV;
    } else { /* 第一次执行 */
        /* 初始化输出为空 */
        MRV["Output"]["Pos1"] = "";
        /* 循环刷新，输出赋值 */
        for (i = 0; i < MPV["Refresh"].length; i++) {
            refreshPos = MPV["Refresh"][i];
            /* 有刷新，且对应的输入值为true，则输出参数值 */
            if (MPV["Input"][refreshPos]["SignalValue"] === true) {
                MRV["Output"]["Pos1"] = MPV["StaticParameter"][refreshPos]["SignalValue"];
                MRV["Refresh"][0] = "Pos1";
            }
        }
        /* 记录此次状态input，用于下一次调用使用 */
        for (inputPos in MPV["Input"]) {
            MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
        }
        return MRV;
    }
};
