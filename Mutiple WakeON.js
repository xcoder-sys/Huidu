MPV = {
	Input: {
		//输入信号集合,信号位置"Pos*"与 LN 模块视图左侧信号对应
		Pos1: {
			//信号位置"Pos*"
			SignalName: "trig1", //信号名
			SignalType: "digital", //信号类型，类型分为三种：digital，analog，serial
			SignalValue: true, //信号值
		},
		//……
	},
	Output: {
		//输出信号集合,信号位置"Pos*"与 LN 模块视图右侧信号对应
		Pos1: {
			//信号位置"Pos*"
			SignalName: "out1", //信号名
			SignalType: "serial", //信号类型，类型分为三种：digital，analog，serial
		},
		// ……
	},
	StaticParameter: {
		//参数集合, 参数位置"Pos*"与 LN 模块视图中间的参数对应
		Pos1: {
			//参数位置"Pos*"
			SignalName: "string1", //参数名
			SignalType: "serial", //参数类型，类型分为三种：digital，analog，serial
			SignalValue: "\xaa\xbb\xcc\xdd\xee\xff", //参数值
		},
		// ……
	},
	SignalNameVSPos: {
		//信号名和信号位置映射关系
		Input: {
			//输入的信号名和信号位置映射关系
			trig1: "Pos1", //输入信号名"trig1"对应信号位置"Pos1" ……
		},
		Output: {
			//输出的信号名和信号位置映射关系
			out1: "Pos1", //输出信号名"out1"对应信号位置"Pos1" ……
		},
		StaticParameter: {
			//参数名和参数位置映射关系
			srting1: "Pos1", //参数名"srting1"对应信号位置"Pos1" ……
		},
	},
	PrivateInfo: {
		//模块内部私有数据存储的结构，模块第一次运行时无此数据
		InputPreviousValue: {
			//上次输入信号的状态
			Pos1: false, //输入"Pos1"上次的值为 false ……
		},
		OutputPreviousValue: {
			//上次输出信号的状态
			Pos1: "", //输出"Pos1"上次的值为空
			// ……
		},
	},
	Refresh: [], //标记哪个信号有刷新(传递触发)，"Pos1","Pos2"有刷新
	Token: "",
};
function hexStrToBin(str) {
	// 每两个字符转成一个字节
	return str.replace(/(..)/g, (m) => String.fromCharCode(parseInt(m, 16)));
}
function (MPV) {
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
                //MRV["Output"]["Pos1"] = MPV["StaticParameter"][refreshPos]["SignalValue"];

                var macStr = MPV["StaticParameter"][refreshPos]["SignalValue"]; // "aabbccddeeff"
		        var macBin = hexStrToBin(macStr);
		        MRV["Output"]["Pos1"] = "\xFF".repeat(6) + macBin.repeat(16);//构建魔术包
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

call(MPV);
// console.log(
//     Array.from(MRV["Output"]["Pos1"], c => ("0" + c.charCodeAt(0).toString(16)).slice(-2)).join(" ")
// );