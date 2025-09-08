/*

 文件名称:  Analog Scaler.js
 功能:
 信号：
 一个模拟量输入: <ain>
 一个模拟量输出: <aout>
 两个参数: <span>和<offset>
 一个可选参数：<divisor>
 描述：
 模拟量伸缩模块依照<span>、<offset>、<divisor>参数计算或转换模拟量输入信号的值后输出，
 其公式为：<aout> = <ain> * <span> / <divisor> + <offset>
 当中间结果<ain> * <span> / <divisor>大于或等于65535时，输出立即等于65535而忽略<offset>。
 其中<span>代表放大倍数，<offset>代表最小值或偏移值，可选的<divisor>参数被用来配合<span>计算放大或缩小倍数，其缺省值为1，
 <ain> * <span> / <divisor>除不尽时四舍五入。
 如果输入为<ain>为0，不管<span> 、<divisor>值为多少，输出为<offset>。
 其中参数<span>、<offset>、<divisor>的取值范围均为0-65535，精度为1。
 作者: 路艳芳

 版本说明: M3后台1.0正式发行版
 修改描述:
 */

exports.call = function (MPV) {
    /* 返回数据MRV基本数据格式定义 */
    var MRV = {
        "Output": {},   // 返回数据MRV基本数据格式定义
        "Refresh": [],  //输出刷新信号位置
        "Token": ""
    };
    /* 临时变量，用于运算 */
    var ainPos, aoutPos, spanPos, divisorPos, offsetPos;
    var ainValue, spanValue, offsetValue, aoutValue;
    var divisorValue = 1;
    var MAXPERCENTI = 65535;

    /* 获取ain，span, divisor， offset, aout位置 */
    ainPos = MPV["SignalNameVSPos"]["Input"]["ain"];
    ainValue = MPV["Input"][ainPos]["SignalValue"];
    /* 获取ain的值 */
    spanPos = MPV["SignalNameVSPos"]["StaticParameter"]["span"];
    spanValue = MPV["StaticParameter"][spanPos]["SignalValue"];
    /* 获取span的值 */
    offsetPos = MPV["SignalNameVSPos"]["StaticParameter"]["offset"];
    /* 获取offset的值 */
    offsetValue = MPV["StaticParameter"][offsetPos]["SignalValue"];

    /* 获取获取[divisor]的位置 */
    divisorPos = MPV["SignalNameVSPos"]["StaticParameter"]["[divisor]"];
    /* 获取[divisor]的值 */
    divisorValue = MPV["StaticParameter"][divisorPos]["SignalValue"];

    /* 输出信号位置 */
    outPos = MPV["SignalNameVSPos"]["Output"]["aout"];

    /* divisor参数为0，直接返回 */
    if (divisorValue === 0) {
        MRV["Output"][outPos] = 0;
        MRV["Refresh"][0] = outPos;
        return MRV;
    } else if (divisorValue === "") { //除数值为空，默认为1
        divisorValue = 1
    }
    /* 进行运算 */
    aoutValue = Math.round(ainValue * spanValue / divisorValue);

    /* 返回数据 */
    if (aoutValue >= MAXPERCENTI) {
        MRV["Output"][outPos] = MAXPERCENTI;
    } else {
        aoutValue = aoutValue + offsetValue;
        if (aoutValue >= MAXPERCENTI) {
            MRV["Output"][outPos] = MAXPERCENTI;
        } else {
            MRV["Output"][outPos] = aoutValue;
        }
    }

    MRV["Refresh"][0] = outPos;

    return MRV;
};

