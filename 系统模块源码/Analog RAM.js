/*

 文件名称: Analog Ram.js
 功能:
 信号：
 两个数字量输入: <store>和<recall>
 多个模拟量输入: 从<ain1>到<ain999>
 多个模拟量输出: 从<aout1>到<aout999>
 多个数字量输入: 从<select1>到<select999>
 描述：
 模拟量存储器的存储：
 当某一路或某几路<select>为高，并且<store>输入由低变为高时，保存此刻某组或某些组所有输入信号的状态信息于系统存储器中，不刷新输出。
 存储的状态在下面情况下调出，并刷新输出：
 1. 当<recall>为高并且<select>由低变为高时。
 2. 当<select>为高<store>为低，并且<recall>由低变为高时。
 每一个输入有一个对应的输出，每一个输入/输出组合独立于其他的输入/输出组合。
 注意：当<recall>为高时，应该仅有一个<select>为高，即在同一时刻仅应该有一组数值可以被取回。
 （如有两个或两个以上的select为高，不调出输出）
 如果仅有一个<select>输入信号被定义了，此输入信号可以为系统常高信号“1”。
 此状态下，<store>持续为高时，<recall>的上升沿将没有作用；<recall>持续为高时，<store>的上升沿可以进行存储。
 如果<store>为低（false），<recall>输入信号为高（true），那么每次<select>的上升沿到来时将立刻进行模拟量调出。
 如果<store>与<recall>输入均为高（true）时，不存储也不调出。
 <store>与<recall>输入均不能为系统常高信号（true）
 模拟量存储器存储的数据在掉电后不会消失。
 作者: 路艳芳

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
    var jsonBuf = {};
    /* 临时变量，用于运算 */
    var inputName, ainName, selectName, aoutName, refreshName;
    var i, storePos, recallPos, ainPos, selectPos, aoutPos, refreshPos;
    var storeValue, recallValue;
    var selectNum = 0;
    var outputIndex;
    var fs = require("fs");
    var execSync = require('child_process').execSync;
    var buf;
    var selectIndex = "";
    var m_fStore = false;
    var path;

    /* 用“ANALOGRAM_+模块ID”作为模块存储名称 */
    if ("ID" in MPV) {
        path = "/etc/tsingli/ln/project/build/ANALOGRAM_" + MPV["ID"];
    } else {
        path = "/etc/tsingli/ln/project/build/" + "ANALOGRAM";
    }
    /* 获取store，recall位置 */
    for (inputName in MPV["SignalNameVSPos"]["Input"]) {
        if (inputName === "store") {
            storePos = MPV["SignalNameVSPos"]["Input"]["store"];
            storeValue = MPV["Input"][storePos]["SignalValue"];
        } else if (inputName === "recall") {
            recallPos = MPV["SignalNameVSPos"]["Input"]["recall"];
            recallValue = MPV["Input"][recallPos]["SignalValue"];
        }
    }

    /* 第一次执行没有PrivateInfo信息，需要进行判断 */
    if ("PrivateInfo" in MPV) {
        /* 循环刷新信号 */
        for (i = 0; i < MPV["Refresh"].length; i++) {
            refreshPos = MPV["Refresh"][i];
            /* store有刷新，且对应的输入值为上升沿,则将select为true的分组进行存储 */
            if (refreshPos === storePos && MPV["PrivateInfo"]["InputPreviousValue"][refreshPos] === false && MPV["Input"][refreshPos]["SignalValue"] === true) {
                /* 判断文件是否存在 */
                if (fs.existsSync(path)) {
                    /* 先读取文件，获取已经存储的数值，再次基础上进行修改 */
                    buf = fs.readFileSync(path);
                    /* 转换为JSON格式 */
                    jsonBuf = JSON.parse(buf.toString());
                }
                for (inputName in MPV["SignalNameVSPos"]["Input"]) {
                    if (inputName.indexOf("select") >= 0) {
                        selectPos = MPV["SignalNameVSPos"]["Input"][inputName];
                        if (MPV["Input"][selectPos]["SignalValue"] === true) {
                            jsonBuf[selectPos] = {};
                            for (aoutPos in MPV["Output"]) {
                                aoutName = MPV["Output"][aoutPos]["SignalName"];
                                outputIndex = aoutName.match(/[1-9]\d*/)[0];
                                ainName = "ain" + outputIndex;
                                ainPos = MPV["SignalNameVSPos"]["Input"][ainName];
                                jsonBuf[selectPos][aoutPos] = MPV["Input"][ainPos]["SignalValue"];
                            }
                            m_fStore = true;
                        }
                    }
                }
                if (m_fStore === true) {
                    /* store */
                    fs.writeFileSync(path, JSON.stringify(jsonBuf), {flag: "w+"});
                    execSync("sync");
                }

                break;
            } else if (refreshPos === recallPos && MPV["PrivateInfo"]["InputPreviousValue"][refreshPos] === false && MPV["Input"][refreshPos]["SignalValue"] === true && storeValue === false) {
                /* recall有刷新，且对应的输入值为上升沿，且store为false，则进行调出 */
                selectNum = 0;
                for (inputName in MPV["SignalNameVSPos"]["Input"]) {
                    /* 找到select为true的分组 */
                    if (inputName.indexOf("select") >= 0) {
                        selectPos = MPV["SignalNameVSPos"]["Input"][inputName];
                        if (MPV["Input"][selectPos]["SignalValue"] === true) {
                            selectIndex = inputName.match(/[1-9]\d*/)[0];
                            selectNum++;
                        }
                    }
                }
                break;
            } else {
                /* 判断刷新的是否为select信号 */
                refreshName = MPV["Input"][refreshPos]["SignalName"];
                if (refreshName.indexOf("select") >= 0) {
                    selectPos = MPV["SignalNameVSPos"]["Input"][refreshName];
                    /* recall为true，select上升沿 */
                    if (recallValue === true && MPV["Input"][selectPos]["SignalValue"] === true && MPV["PrivateInfo"]["InputPreviousValue"][selectPos] === false) {
                        selectIndex = refreshName.match(/[1-9]\d*/)[0];
                        /* 查找有几个select信号为true */
                        for (inputName in MPV["SignalNameVSPos"]["Input"]) {
                            /* 找到select为true的分组 */
                            if (inputName.indexOf("select") >= 0) {
                                selectPos = MPV["SignalNameVSPos"]["Input"][inputName];
                                if (MPV["Input"][selectPos]["SignalValue"] === true) {
                                    selectNum++;
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }
        /* 调出时只有1路select为true,进行调出，否则不调出 */
        if (selectNum === 1) {
            selectName = "select" + selectIndex;
            selectPos = MPV["SignalNameVSPos"]["Input"][selectName];
            /* 判断文件是否存在 */
            if (fs.existsSync(path)) {
                /* 读取文件 */
                buf = fs.readFileSync(path);
                /* 转换为JSON格式 */
                jsonBuf = JSON.parse(buf.toString());
                if (selectPos in jsonBuf) {
                    MRV["Output"] = jsonBuf[selectPos];
                    /* 刷新输出 */
                    refreshPos = 0;
                    for (aoutPos in MPV["Output"]) {
                        MRV["Refresh"][refreshPos] = aoutPos;
                        refreshPos++;
                    }
                } else {
                    MRV["Output"] = MPV["PrivateInfo"]["OutputPreviousValue"];
                }
            } else {
                MRV["Output"] = MPV["PrivateInfo"]["OutputPreviousValue"];
            }
        } else {
            MRV["Output"] = MPV["PrivateInfo"]["OutputPreviousValue"];
        }

        /* 记录此次状态input，output，用于下一次调用使用 */
        for (inputPos in MPV["Input"]) {
            MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
        }
        MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];

        return MRV;
    } else { /* 第一次执行 */
        /* 初始化MRV中Output值 */
        for (aoutPos in MPV["Output"]) {
            MRV["Output"][aoutPos] = 0;
        }
        /* 记录此次状态input，output，用于下一次调用使用 */
        for (inputPos in MPV["Input"]) {
            MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
        }
        MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];

        return MRV;
    }
};