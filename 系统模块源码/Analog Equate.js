/*

 文件名称: Analog Equate.js
 功能:
 信号：
 一个模拟量输入： <ain>
 一个可选的数字量输入<enable>
 多个数字量输出：<out1>到<out999>
 对于每一个输出，有一个对应的参数：从<value1>到<value999>
 描述：
 当对应的<value>参数的值同模拟量输入的值相等时，模拟量比对模块使对应的输出信号为高，输出支持先破后立。
 仅当可选的<enable>输入为高或空置时，模拟量比对模块才起作用；<enable>输入为低时，所有的输出为低。
 每当<enable>由低变为高时，模块都会重新比对参数与输入，如果相等则对应的输出为高。
 作者: 路艳芳

 版本说明: M3后台1.0正式发行版
 修改描述:
 */

exports.call = function (MPV) {
    /* 返回数据MRV基本数据格式定义 */
    var MRV = {
        "Output": {},   // 返回数据MRV基本数据格式定义
        "PrivateInfo": {    //私有数据
            "OutputPreviousValue": {},  //记录输出信号状态
            "InputPreviousValue": {}    //记录输入信号状态
        },
        "Refresh": [],  //输出刷新信号位置
        "Token": ""
    };
    /* 临时变量，用于运算 */
    var i, j, inputPos, outputPos, refreshPos, enablePos, ainPos;
    var analogValue;

    /* 第一次执行没有PrivateInfo信息，需要进行判断 */
    if ("PrivateInfo" in MPV) {
        if ("[enable]" in MPV["SignalNameVSPos"]["Input"]) {
            /* enable 的值为false，则直接输出false */
            enablePos = MPV["SignalNameVSPos"]["Input"]["[enable]"];
            if (MPV["Input"][enablePos]["SignalValue"] === false) {
                j = 0;
                /* 循环判断输出 */
                for (outputPos in MPV["Output"]) {
                    MRV["Output"][outputPos] = false;
                    if (MRV["Output"][outputPos] !== MPV["PrivateInfo"]["OutputPreviousValue"][outputPos]) {
                        MRV["Refresh"][j] = outputPos;
                        j++;
                    }
                }
                /* 记录输入，输出等状态，用于下一次调用使用 */
                for (inputPos in MPV["Input"]) {
                    MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
                }
                MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];
                return MRV;
            }
        }
        for (i = 0; i < MPV["Refresh"].length; i++) {
            refreshPos = MPV["Refresh"][i];
            /* 如果刷新的为ain，则进行比对输出 */
            if (MPV["Input"][refreshPos]["SignalName"] === "ain") {
                analogValue = MPV["Input"][refreshPos]["SignalValue"];
                j = 0;
                /* 循环判断输出 */
                for (outputPos in MPV["Output"]) {
                    /* 输入模拟量和参数是否相等 */
                    if (analogValue === MPV["StaticParameter"][outputPos]["SignalValue"]) {
                        /* 如果上一次也是true，需要先破后立，否则直接输出true */
                        if (MPV["PrivateInfo"]["OutputPreviousValue"][outputPos] === false) {
                            MRV["Output"][outputPos] = true;
                        } else {
                            MRV["Output"][outputPos] = "RisingEdge";
                        }
                        /* 标记刷新 */
                        MRV["Refresh"][j] = outputPos;
                        j++;
                    } else {
                        MRV["Output"][outputPos] = false;
                        if (MRV["Output"][outputPos] !== MPV["PrivateInfo"]["OutputPreviousValue"][outputPos]) {
                            /* 标记刷新 */
                            MRV["Refresh"][j] = outputPos;
                            j++;
                        }
                    }
                }
                /* 记录输入，输出等状态，用于下一次调用使用 */
                for (inputPos in MPV["Input"]) {
                    MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
                }
                MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];
                return MRV;
            } else if (MPV["Input"][refreshPos]["SignalName"] === "[enable]") {
                /* enable的上升沿重新对比输出 */
                if (MPV["Input"][refreshPos]["SignalValue"] === true && MPV["PrivateInfo"]["InputPreviousValue"][refreshPos] === false) {
                    ainPos = MPV["SignalNameVSPos"]["Input"]["ain"];
                    analogValue = MPV["Input"][ainPos]["SignalValue"];
                    /* 获取ain的信号值 */
                    j = 0;
                    /* 循环判断输出 */
                    for (outputPos in MPV["Output"]) {
                        /* 输入模拟量和参数是否相等 */
                        if (analogValue === MPV["StaticParameter"][outputPos]["SignalValue"]) {
                            /* 如果上一次也是true，需要先破后立，否则直接输出true */
                            if (MPV["PrivateInfo"]["OutputPreviousValue"][outputPos] === false) {
                                MRV["Output"][outputPos] = true;
                            } else {
                                MRV["Output"][outputPos] = "RisingEdge";
                            }
                            /* 标记刷新 */
                            MRV["Refresh"][j] = outputPos;
                            j++;
                        } else {
                            MRV["Output"][outputPos] = false;
                            if (MRV["Output"][outputPos] !== MPV["PrivateInfo"]["OutputPreviousValue"][outputPos]) {
                                /* 标记刷新 */
                                MRV["Refresh"][j] = outputPos;
                                j++;
                            }
                        }
                    }
                    /* 记录输入，输出等状态，用于下一次调用使用 */
                    for (inputPos in MPV["Input"]) {
                        MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
                    }
                    MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];
                    return MRV;
                }
            }
        }

        /* 其他情况的输出 */
        j = 0;
        /* 循环判断输出 */
        for (outputPos in MPV["Output"]) {
            MRV["Output"][outputPos] = false;
            if (MRV["Output"][outputPos] !== MPV["PrivateInfo"]["OutputPreviousValue"][outputPos]) {
                MRV["Refresh"][j] = outputPos;
                j++;
            }
        }
        /* 记录输入，输出等状态，用于下一次调用使用 */
        for (inputPos in MPV["Input"]) {
            MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
        }
        MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];
        return MRV;
    } else {    /* 第一次调用 */
        if ("[enable]" in MPV["SignalNameVSPos"]["Input"]) {
            /* enable 的值为false，则直接输出false */
            enablePos = MPV["SignalNameVSPos"]["Input"]["[enable]"];
            if (MPV["Input"][enablePos]["SignalValue"] === false) {
                /* 循环判断输出 */
                for (outputPos in MPV["Output"]) {
                    MRV["Output"][outputPos] = false;
                }
                /* 记录输入，输出等状态，用于下一次调用使用 */
                for (inputPos in MPV["Input"]) {
                    MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
                }
                MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];
                return MRV;
            }
        }
        for (i = 0; i < MPV["Refresh"].length; i++) {
            refreshPos = MPV["Refresh"][i];
            /* 如果刷新的为ain，则进行比对输出 */
            if (MPV["Input"][refreshPos]["SignalName"] === "ain") {
                analogValue = MPV["Input"][refreshPos]["SignalValue"];
                j = 0;
                /* 循环判断输出 */
                for (outputPos in MPV["Output"]) {
                    /* 输入模拟量和参数是否相等，相等置true，并刷新输出 */
                    if (analogValue === MPV["StaticParameter"][outputPos]["SignalValue"]) {
                        MRV["Output"][outputPos] = true;
                        MRV["Refresh"][j] = outputPos;
                        j++;
                    } else {
                        MRV["Output"][outputPos] = false;
                    }
                }
                /* 记录输入，输出等状态，用于下一次调用使用 */
                for (inputPos in MPV["Input"]) {
                    MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
                }
                MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];
                return MRV;
            } else if (MPV["Input"][refreshPos]["SignalName"] === "[enable]") {
                /* enable的上升沿对比输出 */
                if (MPV["Input"][refreshPos]["SignalValue"] === true) {
                    ainPos = MPV["SignalNameVSPos"]["Input"]["ain"];
                    analogValue = MPV["Input"][ainPos]["SignalValue"];
                    /* 获取ain的信号值 */
                    j = 0;
                    /* 循环判断输出 */
                    for (outputPos in MPV["Output"]) {
                        /* 输入模拟量和参数是否相等，相等则刷新输出 */
                        if (analogValue === MPV["StaticParameter"][outputPos]["SignalValue"]) {
                            MRV["Output"][outputPos] = true;
                            MRV["Refresh"][j] = outputPos;
                            j++;
                        } else {
                            MRV["Output"][outputPos] = false;
                        }
                    }
                    /* 记录输入，输出等状态，用于下一次调用使用 */
                    for (inputPos in MPV["Input"]) {
                        MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
                    }
                    MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];
                    return MRV;
                }
            }
        }

        /* 其他情况的输出 */
        for (outputPos in MPV["Output"]) {
            MRV["Output"][outputPos] = false;
        }
        /* 记录输入，输出等状态，用于下一次调用使用 */
        for (inputPos in MPV["Input"]) {
            MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
        }
        MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];
        return MRV;
    }
};

