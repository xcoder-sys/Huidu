/*

 文件名称: Multiple Toggle.js
 功能:
 信号：
 多个可选的数字量输入: <set1>至<set1999>、<reset1>至<reset1999>、<clock1>至<clock1999>
 多个数字量输出: <out1>至<out1999>
 多个可选的数字量输出: <out1*>-<out1999*>
 描述：
 多通道互转模块锁定在<clockN>输入的每一个上升沿输出信号为高或者为低，即第一次<clockN>上升沿到来时，<outN>将被置为高；
 第二次<clockN>上升沿到来时，<outN>将被置为低；第三次<clockN>上升沿到来时，<outN>将被置为高，依此类推。
 当<setN>为高时，<outN>将被置为高，<outN*>被置为低；当<resetN>为高时，<outN>被置为低，<outN*>被置为高。
 当<setN>-<resetN>-<clockN>信号同时持续为高时，<outN>置低，按照<resetN>-<setN>-<clockN>抬起的顺序<outN>信号变化为高-低-低，
 此顺序代表了三个信号的优先级，如果按照<clockN>-<setN>-<resetN>的顺序那么<outN>还是置低状态。
 任何时候输出<outN>与输出<outN*>都为相反的状态。
 

 版本说明: M3后台1.5.8正式发行版
 修改描述:
 */

exports.call = function (MPV) {
    /* 返回数据MRV基本数据格式定义 */
    let MRV = {
        "Output": {}, // 返回数据MRV基本数据格式定义
        "PrivateInfo": { //私有数据
            "InputPreviousValue": {}, //记录输入信号状态
            "OutputPreviousValue": {} //记录输出信号状态
        },
        "Refresh": [], //输出刷新信号位置
        "Token": ""
    };
    for (let i = 0; i < MPV.Refresh.length; i++) {
        let posx = MPV.Refresh[i];  //刷新位置
        //通过刷新位置查找信号名
        let namex = MPV.Input[posx].SignalName;  //刷新信号名称
        if (namex.indexOf("reset") > -1) {  //信号reset刷新，优先级 reset > set > clock
            let index = namex.replace("[reset", "").replace("]", "");  //获取信号索引值
            let resetVal = MPV.Input[posx].SignalValue;  //reset信号值
            let nameOutX = "out" + index;  //对应out信号名称
            let nameOutXR = "[out" + index + "*]";  //对应out*信号名称
            if ("PrivateInfo" in MPV) {  //模块运行过
                MRV.PrivateInfo.InputPreviousValue = MPV.PrivateInfo.InputPreviousValue;  //存储输入信号值
                MRV.PrivateInfo.OutputPreviousValue = MPV.PrivateInfo.OutputPreviousValue;  //存储输出信号值
                let prevResetVal = MPV.PrivateInfo.InputPreviousValue[posx];  //reset信号上一次值
                if (resetVal == true) {  //reset为高out为低，out*为高
                    if (nameOutX in MPV.SignalNameVSPos.Output) {  //判断是否有out信号
                        let outXR = "";
                        let outX = MPV.SignalNameVSPos.Output[nameOutX];  //out信号位置  
                        MRV.Output[outX] = false;  //out输出低
                        if (nameOutXR in MPV.SignalNameVSPos.Output) {  //判断是否有out*信号
                            outXR = MPV.SignalNameVSPos.Output[nameOutXR];  //out*信号位置
                            MRV.Output[outXR] = true;  //out输出高
                        }
                        if(outX in MPV.PrivateInfo.OutputPreviousValue){  //
                            if (MPV.PrivateInfo.OutputPreviousValue[outX] === true) {//上次为true需要刷新
                                MRV["Refresh"].push(outX);
                                if (outXR) {
                                    MRV["Refresh"].push(outXR);
                                }
                            }
                        }else{  //该位置第一次执行
                            MRV["Refresh"].push(outX);
                            if (outXR) {
                                MRV["Refresh"].push(outXR);
                            }
                        }
                        MRV.PrivateInfo.OutputPreviousValue[outX] = MRV["Output"][outX];  //存储本次out信号值
                    }
                } else if (resetVal === false && prevResetVal === true) {  //reset下降沿
                    //获取当前的set的值和clock的值，当set为高时out输出为高，当set为低时判断clock的值，当clock为高时改变out的值
                    let nameSetX = "[set" + index + "]";
                    let clockFlag = false;
                    if (nameSetX in MPV.SignalNameVSPos.Input) {  //set信号存在
                        let setX = MPV.SignalNameVSPos.Input[nameSetX];  //set信号名称
                        let setVal = MPV.Input[setX].SignalValue;  //set信号值
                        if (setVal) {  //set信号值为高
                            if (nameOutX in MPV.SignalNameVSPos.Output) {
                                let outX = MPV.SignalNameVSPos.Output[nameOutX];
                                MRV.Output[outX] = true;  //out输出高
                                MRV["Refresh"].push(outX);
                                if (nameOutXR in MPV.SignalNameVSPos.Output) {
                                    let outXR = MPV.SignalNameVSPos.Output[nameOutXR];
                                    MRV.Output[outXR] = false;  //out*输出低
                                    MRV["Refresh"].push(outXR);
                                }
                                MRV.PrivateInfo.OutputPreviousValue[outX] = MRV["Output"][outX];
                            }
                        } else {  //判断clock
                            clockFlag = true;
                        }
                    } else {  //判断clock
                        clockFlag = true;
                    }
                    if (clockFlag) {  //clock为高时，out的值取反
                        let nameClockX = "[clock" + index + "]";
                        if (nameClockX in MPV.SignalNameVSPos.Input) {  //set存在
                            let clockX = MPV.SignalNameVSPos.Input[nameClockX];  //clock信号位置
                            let clockVal = MPV.Input[clockX].SignalValue;  //clock信号值
                            if (clockVal) {
                                if (nameOutX in MPV.SignalNameVSPos.Output) {
                                    let outX = MPV.SignalNameVSPos.Output[nameOutX];  //out信号位置
                                    let prevVal = MPV.PrivateInfo.OutputPreviousValue[outX];  //out上一次输出值
                                    MRV.Output[outX] = !prevVal;  //out输出值取反
                                    MRV["Refresh"].push(outX);
                                    MRV.PrivateInfo.OutputPreviousValue[outX] = MRV["Output"][outX];  //存储输出值
                                    if (nameOutXR in MPV.SignalNameVSPos.Output) {
                                        let outXR = MPV.SignalNameVSPos.Output[nameOutXR];  //out*信号名称
                                        MRV.Output[outXR] = !MRV.Output[outX];  //out*取反out的值
                                        MRV["Refresh"].push(outXR);
                                    }
                                }
                            }
                        }
                    }
                }  
            } else {  //所有节点都没有运行过
                if (resetVal == true) {
                    if (nameOutX in MPV.SignalNameVSPos.Output) {
                        let outX = MPV.SignalNameVSPos.Output[nameOutX];  //out信号名称
                        MRV.Output[outX] = false;  //out输出为高
                        MRV["Refresh"].push(outX);
                        if (nameOutXR in MPV.SignalNameVSPos.Output) {
                            let outXR = MPV.SignalNameVSPos.Output[nameOutXR];
                            MRV.Output[outXR] = true;  //out*输出为低
                            MRV["Refresh"].push(outXR);
                        }
                        MRV.PrivateInfo.OutputPreviousValue[outX] = MRV["Output"][outX];
                    }
                }
            }
            MRV.PrivateInfo.InputPreviousValue[posx] = resetVal;
        } else if (namex.indexOf("set") > -1) {  //set信号刷新
            //找到reset的位置看是否有高，如果为高set不刷新
            let index = namex.replace("[set", "").replace("]", "");  //信号索引值
            let setVal = MPV.Input[posx].SignalValue;  //set信号值
            let nameOutX = "out" + index;  //out信号名称
            let nameReset = "[reset" + index + "]";  //out信号名称
            let nameOutXR = "[out" + index + "*]";  //out*信号名称
            if ("PrivateInfo" in MPV) {
                let setFlag = true;
                if (nameReset in MPV.SignalNameVSPos.Input) {  //当存在reset时且reset为高set不起作用
                    let resetX = MPV.SignalNameVSPos.Input[nameReset];
                    if (MPV.Input[resetX].SignalValue) {
                        setFlag = false;
                    }
                }
                MRV.PrivateInfo.InputPreviousValue = MPV.PrivateInfo.InputPreviousValue;  //存储输入值
                MRV.PrivateInfo.OutputPreviousValue = MPV.PrivateInfo.OutputPreviousValue;  //存储输出值
                let prevSetVal = MPV.PrivateInfo.InputPreviousValue[posx];  //set上一次值
                if (setFlag===true && setVal === true) {  //set为高out为高，out*为低
                    if (nameOutX in MPV.SignalNameVSPos.Output) {
                        let outXR = "";
                        let outX = MPV.SignalNameVSPos.Output[nameOutX];  //out信号位置
                        MRV.Output[outX] = true;  //out输出为高
                        if (nameOutXR in MPV.SignalNameVSPos.Output) {
                            outXR = MPV.SignalNameVSPos.Output[nameOutXR];  //out*信号位置
                            MRV.Output[outXR] = false;  //out*输出为低
                        }
                        if (!MPV.PrivateInfo.OutputPreviousValue[outX]) {//上次为false需要刷新
                            MRV["Refresh"].push(outX);
                            if (outXR) {
                                MRV["Refresh"].push(outXR);
                            }
                        }
                        MRV.PrivateInfo.OutputPreviousValue[outX] = MRV["Output"][outX];  //存储out的值
                    }
                } else if (setFlag === true && setVal === false && prevSetVal === true) {  //set信号下降沿
                    let nameClockX = "[clock" + index + "]";
                    if (nameClockX in MPV.SignalNameVSPos.Input) {  //clock信号存在
                        let clockX = MPV.SignalNameVSPos.Input[nameClockX];  //clock信号位置
                        let clockVal = MPV.Input[clockX].SignalValue;  //clock信号值
                        if (clockVal) {
                            if (nameOutX in MPV.SignalNameVSPos.Output) {
                                let outX = MPV.SignalNameVSPos.Output[nameOutX];  //out信号位置
                                let prevVal = MPV.PrivateInfo.OutputPreviousValue[outX];  //out信号上一次值
                                MRV.Output[outX] = !prevVal;  //out信号值翻转
                                MRV["Refresh"].push(outX);
                                MRV.PrivateInfo.OutputPreviousValue[outX] = MRV["Output"][outX];  //存储输出值
                                if (nameOutXR in MPV.SignalNameVSPos.Output) {
                                    let outXR = MPV.SignalNameVSPos.Output[nameOutXR];  //out*信号位置
                                    MRV.Output[outXR] = !MRV.Output[outX];  //out*输出相反
                                    MRV["Refresh"].push(outXR);
                                }
                            }
                        }
                    }
                }
                //获取当前的clock的值，当clock为高时改变out的值
                MRV.PrivateInfo.InputPreviousValue[posx] = setVal;
            } else {  //所有节点都没有运行过
                if (setVal == true) {
                    if (nameOutX in MPV.SignalNameVSPos.Output) {
                        let outX = MPV.SignalNameVSPos.Output[nameOutX];  //out信号位置
                        MRV.Output[outX] = true;  //out输出为高
                        MRV["Refresh"].push(outX);
                        if (nameOutXR in MPV.SignalNameVSPos.Output) {
                            let outXR = MPV.SignalNameVSPos.Output[nameOutXR];
                            MRV.Output[outXR] = false;  //out*输出为低
                            MRV["Refresh"].push(outXR);
                        }
                        MRV.PrivateInfo.OutputPreviousValue[outX] = MRV["Output"][outX];  //存储out信号值
                    }
                }
            }
            MRV.PrivateInfo.InputPreviousValue[posx] = setVal;  //存储set信号值
        } else if (namex.indexOf("clock") > -1) {
            let index = namex.replace("[clock", "").replace("]", "");  //信号索引值
            let nameOutX = "out" + index;  //out信号名称
            let nameOutXR = "[out" + index + "*]";  //out*信号名称
            let nameReset = "[reset" + index + "]";  //reset信号名称
            let nameSet = "[set" + index + "]";  //set信号名称
            let clockVal = MPV.Input[posx].SignalValue;  //clock信号值
            //找到reset或set的位置看是否有高，如果为高clock不运行
            if ("PrivateInfo" in MPV) {  //模块非第一次运行
                let clockFlag = true;
                let clockPrevVal = false;
                //获取clockPrevVal值
                if (MPV.PrivateInfo.InputPreviousValue[posx]) {
                    clockPrevVal = MPV.PrivateInfo.InputPreviousValue[posx];
                }
                MRV.PrivateInfo.InputPreviousValue = MPV.PrivateInfo.InputPreviousValue;  //存储输入信号值
                MRV.PrivateInfo.OutputPreviousValue = MPV.PrivateInfo.OutputPreviousValue;  //存储输出信号值
                if (nameReset in MPV.SignalNameVSPos.Input) {  //reset信号存在且reset电平为高
                    let resetX = MPV.SignalNameVSPos.Input[nameReset];
                    if (MPV.Input[resetX].SignalValue) {
                        clockFlag = false;
                    }
                }
                if (nameSet in MPV.SignalNameVSPos.Input) {  //set信号存在且set电平为高
                    let setX = MPV.SignalNameVSPos.Input[nameSet];
                    if (MPV.Input[setX].SignalValue) {
                        clockFlag = false;
                    }
                }
                if (clockFlag==true && clockVal == true && clockPrevVal == false) {  //clock信号上升沿
                    if (nameOutX in MPV.SignalNameVSPos.Output) {
                        let outX = MPV.SignalNameVSPos.Output[nameOutX];  //out信号位置
                        let prevVal = MPV.PrivateInfo.OutputPreviousValue[outX];  //out*信号位置
                        MRV.Output[outX] = !prevVal;  //out输出值取反
                        MRV["Refresh"].push(outX);
                        MRV.PrivateInfo.OutputPreviousValue[outX] = MRV["Output"][outX];  //存储out信号值位置
                        if (nameOutXR in MPV.SignalNameVSPos.Output) {
                            let outXR = MPV.SignalNameVSPos.Output[nameOutXR];  //out*信号位置
                            MRV.Output[outXR] = !MRV.Output[outX];  //out*信号值和out相反
                            MRV["Refresh"].push(outXR);
                        }
                    }
                }
            } else {  //模块没有运行过
                if (clockVal == true) {
                    if (nameOutX in MPV.SignalNameVSPos.Output) {
                        let outX = MPV.SignalNameVSPos.Output[nameOutX];  //out信号位置
                        MRV.Output[outX] = true;  //out输出为高
                        MRV["Refresh"].push(outX);
                        MRV.PrivateInfo.OutputPreviousValue[outX] = MRV["Output"][outX];  //存储out输出信号值
                    }
                    if (nameOutXR in MPV.SignalNameVSPos.Output) {
                        let outXR = MPV.SignalNameVSPos.Output[nameOutXR];  //out*信号位置
                        MRV.Output[outXR] = false;  //out*输出低
                        MRV["Refresh"].push(outXR);
                    }

                }
               
            }
            MRV.PrivateInfo.InputPreviousValue[posx] = clockVal;  //存储clock信号值
        }
    }
    return MRV;
};
