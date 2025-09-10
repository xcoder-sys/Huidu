/*

 文件名称:  AND.js
 功能:
 信号：
 多个数字量输入： 从<in1>到<in999>
 一个数字量输出：<out>
 描述：
 当且仅当所有输入都为高时，“与”模块的输出信号为高，其他情况下输出为低。
 

 版本说明: M3后台1.0正式发行版
 修改描述:
 */

exports.call = function (MPV) {
    /* 返回数据MRV基本数据格式定义 */
    var MRV = {
        "Output": {},	// 返回数据MRV基本数据格式定义
        "PrivateInfo": {	//私有数据
            "OutputPreviousValue": {}	//记录输出信号状态
        },
        "Refresh": [],	//输出刷新信号位置
        "Token": ""
    };
    /* 临时变量，用于运算 */
    var inputPos;
    var outValue = true;

    /* 所有输入与 */
    for (inputPos in MPV["Input"]) {
        outValue = outValue && MPV["Input"][inputPos]["SignalValue"];
    }
    /* 输出数据 */
    MRV["Output"]["Pos1"] = outValue;
    /* 如果不是第一次执行需要判断PrivateInfo的输出值信息 */
    if ("PrivateInfo" in MPV) {
        /* 上一次的值和这一次的值不相等才刷新 */
        if (MPV["PrivateInfo"]["OutputPreviousValue"]["Pos1"] != MRV["Output"]["Pos1"]) {
            MRV["Refresh"][0] = "Pos1";
        }
    } else {
        MRV["Refresh"][0] = "Pos1";
    }
    /* 记录此次状态output用于下一次调用使用 */
    MRV["PrivateInfo"]["OutputPreviousValue"] = MRV["Output"];

    return MRV;
};

