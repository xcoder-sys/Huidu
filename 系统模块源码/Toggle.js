/*

 文件名称: Toggle.js
 功能:
 信号：
 一个数字量输入: <clock>
 两个可选的数字量输入: <set>和<reset>
 一个数字量输出: <out>
 一个可选的数字量输出: <out*>
 描述：
 互转模块锁定在<clock>输入的每一个上升沿输出信号为高或者为低，即第一次<clock>上升沿到来时，<out>将被置为高；
 第二次<clock>上升沿到来时，<out>将被置为低；第三次<clock>上升沿到来时，<out>将被置为高，依此类推。
 当<set>为高时，<out>将被置为高，<out*>被置为低；当<reset>为高时，<out>被置为低，<out*>被置为高。
 当三个输入信号同时持续为高时，<out>置低，按照<reset>-<set>-<clock>抬起的顺序<out>信号变化为高-低-低，
 此顺序代表了三个信号的优先级，如果按照<clock>-<set>-<reset>的顺序那么<out>还是置低状态。
 任何时候输出<out>与输出<out*>都为相反的状态。
 

 版本说明: M3后台1.0正式发行版
 修改描述:
 */

exports.call = function (MPV) {
    /* 返回数据MRV基本数据格式定义 */
    var MRV = {
        "Output": {},   // 返回数据MRV基本数据格式定义
        "PrivateInfo": {    //私有数据
            "InputPreviousValue": {},   //记录输入信号状态
            "OutputPreviousValue": {}   //记录输出信号状态
        },
        "Refresh": [],  //输出刷新信号位置
        "Token": ""
    };
    /* 临时变量，用于运算 */
    var inputName, outputName;
    var i, j, setPos, resetPos, clockPos, outPos;
    var out1Pos = "";
    var change = false;

    /* 获取set，reset，clock的位置 */
    for (inputName in MPV["SignalNameVSPos"]["Input"]) {
        if (inputName === "[set]") {
            setPos = MPV["SignalNameVSPos"]["Input"]["[set]"];
        }
        if (inputName === "[reset]") {
            resetPos = MPV["SignalNameVSPos"]["Input"]["[reset]"];
        }
        if (inputName === "clock") {
            clockPos = MPV["SignalNameVSPos"]["Input"]["clock"];
        }
    }
    /* 获取out，out*的位置 */
    for (outputName in MPV["SignalNameVSPos"]["Output"]) {
        if (outputName === "out") {
            outPos = MPV["SignalNameVSPos"]["Output"]["out"];
        }
        if (outputName === "[out*]") {
            out1Pos = MPV["SignalNameVSPos"]["Output"]["[out*]"];
        }
    }

    /* 第一次执行没有PrivateInfo信息，需要进行判断 */
    if ("PrivateInfo" in MPV) {
        if ("[reset]" in MPV["SignalNameVSPos"]["Input"]) {
            /* reset 为true，out直接输出false */
            if (MPV["Input"][resetPos]["SignalValue"] === true) {
                MRV["Output"][outPos] = false;
                if (out1Pos !== "") {
                    MRV["Output"][out1Pos] = true;
                }
                /* 判断是否需要输出刷新 */
                if (MPV["PrivateInfo"]["OutputPreviousValue"][outPos] !== MRV["Output"][outPos]) {
                    MRV["Refresh"][0] = outPos;
                    if (out1Pos !== "") {
                        MRV["Refresh"][1] = out1Pos;
                    }
                }
                /* 记录此次状态input, output用于下一次调用使用 */
                for (inputPos in MPV["Input"]) {
                    MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
                }
                MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];

                return MRV;
            } else if (MPV["Input"][resetPos]["SignalValue"] === false && MPV["PrivateInfo"]["InputPreviousValue"][resetPos] === true){
                /* reset 下降沿，如果clock为高，则out输出相反状态 */
                if (MPV["Input"][clockPos]["SignalValue"] === true) {
                    MRV["Output"][outPos] = !(MPV["PrivateInfo"]["OutputPreviousValue"][outPos]);
                    if (out1Pos !== "") {
                        MRV["Output"][out1Pos] = !(MRV["Output"][outPos]);
                    }
                    /* 输出刷新 */
                    MRV["Refresh"][0] = outPos;
                    MRV["Refresh"][1] = out1Pos;
                    /* 记录此次状态input, output用于下一次调用使用 */
                    for (inputPos in MPV["Input"]) {
                        MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
                    }
                    MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];

                    return MRV;
                }
            }
        }
        if ("[set]" in MPV["SignalNameVSPos"]["Input"]) {
            /* set 为true，out直接输出true */
            if (MPV["Input"][setPos]["SignalValue"] === true) {
                MRV["Output"][outPos] = true;
                if (out1Pos !== "") {
                    MRV["Output"][out1Pos] = false;
                }
                /* 判断是否需要输出刷新 */
                if (MPV["PrivateInfo"]["OutputPreviousValue"][outPos] !== MRV["Output"][outPos]) {
                    MRV["Refresh"][0] = outPos;
                    if (out1Pos !== "") {
                        MRV["Refresh"][1] = out1Pos;
                    }
                }
                /* 记录此次状态input, output用于下一次调用使用 */
                for (inputPos in MPV["Input"]) {
                    MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
                }
                MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];

                return MRV;
            } else if (MPV["Input"][setPos]["SignalValue"] === false && MPV["PrivateInfo"]["InputPreviousValue"][setPos] === true){
                /* set 下降沿，如果clock为高，则out输出相反状态 */
                if (MPV["Input"][clockPos]["SignalValue"] === true) {
                    MRV["Output"][outPos] = !(MPV["PrivateInfo"]["OutputPreviousValue"][outPos]);
                    if (out1Pos !== "") {
                        MRV["Output"][out1Pos] = !(MRV["Output"][outPos]);
                    }
                    /* 输出刷新 */
                    MRV["Refresh"][0] = outPos;
                    MRV["Refresh"][1] = out1Pos;
                    /* 记录此次状态input, output用于下一次调用使用 */
                    for (inputPos in MPV["Input"]) {
                        MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
                    }
                    MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];

                    return MRV;
                }
            }
        }
        /* 刷新的个数大于0 */
        if (MPV["Refresh"].length > 0) {
            for (i = 0; i < MPV["Refresh"].length; i++) {
                /* 如果刷新的是clock */
                if (MPV["Refresh"][i] === clockPos) {
                    /* clock上升沿,输出取反 */
                    if (MPV["Input"][clockPos]["SignalValue"] === true && MPV["PrivateInfo"]["InputPreviousValue"][clockPos] === false) {
                        MRV["Output"][outPos] = !(MPV["PrivateInfo"]["OutputPreviousValue"][outPos]);
                        MRV["Refresh"][0] = outPos;
                        if (out1Pos !== "") {
                            MRV["Output"][out1Pos] = !(MRV["Output"][outPos]);
                            MRV["Refresh"][1] = out1Pos;
                        }
                        change = true;
                    }
                }
            }
        }
        /* 其他情况，输出上一次的值 */
        if (change === false) {
            MRV["Output"] = MPV["PrivateInfo"]["OutputPreviousValue"];
        }
        /* 记录此次状态input, output用于下一次调用使用 */
        for (inputPos in MPV["Input"]) {
            MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
        }
        MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];
        return MRV;
    } else { /* 第一次执行 */
        if ("[reset]" in MPV["SignalNameVSPos"]["Input"]) {
            /* reset 为true，out直接输出false */
            if (MPV["Input"][resetPos]["SignalValue"] === true) {
                MRV["Output"][outPos] = false;
                if (out1Pos !== "") {
                    MRV["Output"][out1Pos] = true;
                    /* 输出刷新 */
                    MRV["Refresh"][0] = out1Pos;
                }
                /* 记录此次状态input, output用于下一次调用使用 */
                for (inputPos in MPV["Input"]) {
                    MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
                }
                MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];

                return MRV;
            }
        }
        if ("[set]" in MPV["SignalNameVSPos"]["Input"]) {
            /* reset 为true，out直接输出true */
            if (MPV["Input"][setPos]["SignalValue"] === true) {
                MRV["Output"][outPos] = true;
                if (out1Pos !== "") {
                    MRV["Output"][out1Pos] = false;
                }
                /* 输出刷新 */
                MRV["Refresh"][0] = outPos;
                /* 记录此次状态input, output用于下一次调用使用 */
                for (inputPos in MPV["Input"]) {
                    MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
                }
                MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];

                return MRV;
            }
        }
        /* 刷新的个数大于0 */
        if (MPV["Refresh"].length > 0) {
            for (i = 0; i < MPV["Refresh"].length; i++) {
                /* 如果刷新的是clock */
                if (MPV["Refresh"][i] === clockPos) {
                    /* clock上升沿,输出取反 */
                    if (MPV["Input"][clockPos]["SignalValue"] === true) {
                        MRV["Output"][outPos] = true;
                        if (out1Pos !== "") {
                            MRV["Output"][out1Pos] = !(MRV["Output"][outPos]);
                        }
                        MRV["Refresh"][0] = outPos;
                        change = true;
                    }
                }
            }
        }
        /* 其他情况，输出false */
        if (change === false) {
            MRV["Output"][outPos] = false;
            if (out1Pos !== "") {
                MRV["Output"][out1Pos] = true;
                MRV["Refresh"][0] = out1Pos;
            }
        }
        /* 记录此次状态input, output用于下一次调用使用 */
        for (inputPos in MPV["Input"]) {
            MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
        }
        MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];
        return MRV;
    }
};

