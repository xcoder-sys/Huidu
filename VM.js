var MPV = {
	Input: {
		Pos1: { SignalValue: false },
		Pos2: { SignalValue: false },
		Pos3: { SignalValue: true }, // 模拟第 3 路输入为 true
		Pos4: { SignalValue: false },
		Pos5: { SignalValue: false },
		Pos6: { SignalValue: false },
		Pos7: { SignalValue: false },
		Pos8: { SignalValue: false },
		Pos9: { SignalValue: false },
		Pos10: { SignalValue: false },
		Pos11: { SignalValue: false },
		Pos12: { SignalValue: false },
		Pos13: { SignalValue: false },
		Pos14: { SignalValue: false },
		Pos15: { SignalValue: false },
		Pos16: { SignalValue: false },
	},
};

function call(MPV) {
	var MRV = {
		Output: {},
		PrivateInfo: {
			OutputPreviousValue: {},
		},
		Refresh: [],
		Token: "",
	};

	//
	var Inputs = [
		"1v", // in1 (对应数字量输入1)
		"2v", // in2 (对应数字量输入2)
		"3v", // in3 (对应数字量输入3)
		"4v", // in4 (对应数字量输入4)
		"5v", // in5 (对应数字量输入5)
		"6v", // in6 (对应数字量输入6)
		"7v", // in7 (对应数字量输入7)
		"8v", // in8 (对应数字量输入8)
	];
	var Outputs = [
		"1.", // out1 (对应数字量输入1)
		"2.", // out2 (对应数字量输入2)
		"3.", // out3 (对应数字量输入3)
		"4.", // out4 (对应数字量输入4)
		"5.", // out5 (对应数字量输入5)
		"6.", // out6 (对应数字量输入6)
		"7.", // out7 (对应数字量输入7)
		"8.", // out8 (对应数字量输入8)
	];
	var input_;
	var output_;

	// 检查每个数字量输入，当为true时输出对应指令
	for (var i = 0; i < 8; i++) {
		var inputName1 = "Pos" + (i + 1);
		var inputName2 = "Pos" + (i + 9);
		// 检查该输入是否存在且值为true
		if (
			(MPV["Input"][inputName1] &&
				MPV["Input"][inputName1]["SignalValue"] == true) ||
			(MPV["Input"][inputName2] &&
				MPV["Input"][inputName2]["SignalValue"] == true)
		) {
			// 将对应的指令输出到串行量信号1
			input_ = Inputs[i];
			output_ = Outputs[i];
			MRV["Output"]["Pos1"] = input_ + output_;
			//console.log("输出指令: " + commands[i] + " (对应输入" + inputName + ")");

			if (
				MPV["Input"][inputName2] &&
				MPV["Input"][inputName2]["SignalValue"] == true
			) {
				MRV["Refresh"].push("Pos1");
			}
			// 只处理第一个为true的输入，避免冲突
			break;
		}
	}
	console.log(MRV);
	return MRV;
}
