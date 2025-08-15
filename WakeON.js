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
function call(MPV) {
	var MRV = {
		Output: {},
		PrivateInfo: {
			OutputPreviousValue: {},
		},
		Refresh: [],
		Token: "",
	};

	if (MPV["Input"]["Pos1"] && MPV["Input"]["Pos1"]["SignalValue"] == true) {
		// 将对应的指令输出到串行量信号1
		/* MRV["Output"]["Pos1"] =
			"\xFF".repeat(6) +
			MPV["StaticParameter"]["Pos1"]["SignalValue"].repeat(16); */
		var macStr = MPV["StaticParameter"]["Pos1"]["SignalValue"]; // "aabbccddeeff"
		var macBin = hexStrToBin(macStr);
		MRV["Output"]["Pos1"] = "\xFF".repeat(6) + macBin.repeat(16);

		MRV["Refresh"].push("Pos1");
		// 只处理第一个为true的输入，避免冲突
	}
	/* console.log(
		Array.from(MRV["Output"]["Pos1"], c => ("0" + c.charCodeAt(0).toString(16)).slice(-2)).join(" ")
	); */
	return MRV;
}

call(MPV);
