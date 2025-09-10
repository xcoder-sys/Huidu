/*
 

 文件名称: Serial Send 1.js
 功能:
 信号：
 多个数字量输入：<trig1>到<trig999>
 多个串行量输出：<out1>到<out999>
 多个参数：<string1>到<string999>
 描述：
 串行发送模块在每一个输入数字量信号<trigN>的上升沿发送<stringN>参数定义的字符串到对应输出<outN>。
 如果多个定义的输出<outN>为相同变量名，并且有同时的多个<trigN>触发，不会造成阻塞，系统会自动赋<outN>为当前值。
 

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
    var i, j, inputPos, outputPos, refreshPos;

    /* 第一次执行没有PrivateInfo信息，需要进行判断 */
    if ("PrivateInfo" in MPV) {
        /* 初始化所有输出为空 */
        for (outputPos in MPV["Output"]) {
            MRV["Output"][outputPos] = "";
        }
        j = 0;
        /* 循环刷新数据进行运算 */
        for (i = 0; i < MPV["Refresh"].length; i++) {
            refreshPos = MPV["Refresh"][i];
            /* 有刷新，且对应的输入为上升沿，则输出参数值 */
            if (MPV["Input"][refreshPos]["SignalValue"] === true && MPV["PrivateInfo"]["InputPreviousValue"][refreshPos] === false) {
                /* 输出信号赋值 */
                MRV["Output"][refreshPos] = MPV["StaticParameter"][refreshPos]["SignalValue"];
                /* 刷新输出 */
                MRV["Refresh"][j] = refreshPos;
                j++;
            }
        }
        /* 记录此次状态input，用于下一次调用使用 */
        for (inputPos in MPV["Input"]) {
            MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
        }
        return MRV;
    } else { /* 第一次执行 */
        /* 初始化所有输出为空 */
        for (outputPos in MPV["Output"]) {
            MRV["Output"][outputPos] = "";
        }
        j = 0;
        /* 循环刷新数据进行运算 */
        for (i = 0; i < MPV["Refresh"].length; i++) {
            refreshPos = MPV["Refresh"][i];
            /* 有刷新，且对应的输入值为true，则输出参数值 */
            if (MPV["Input"][refreshPos]["SignalValue"] === true) {
                /* 输出信号赋值 */
                MRV["Output"][refreshPos] = MPV["StaticParameter"][refreshPos]["SignalValue"];
                /* 刷新输出 */
                MRV["Refresh"][j] = refreshPos;
                j++;
            }
        }
        /* 记录此次状态input，用于下一次调用使用 */
        for (inputPos in MPV["Input"]) {
            MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
        }
        return MRV;
    }
};

