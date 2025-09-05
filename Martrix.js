exports.call = function (MPV) {
	var MRV = {
		Output: {},
		PrivateInfo: {
			InputPreviousValue: {},
		},
		Refresh: [],
		Token: "",
	};

	// 上一次状态
	if ("PrivateInfo" in MPV && MPV.PrivateInfo) {
		MRV.PrivateInfo = MPV.PrivateInfo;
	}

	var inChannel = 0;
	var outChannel = 0;

	// 输入通道触发 (Pos1~Pos16 -> 1V, 2V, ...)
	for (var i = 1; i <= 4; i++) {
		var name = "Pos" + i;
		var curr = MPV.Input[name] && MPV.Input[name].SignalValue === true;
		var prev = MRV.PrivateInfo.InputPreviousValue[name] || false;

		if (!prev && curr) {
			// 上升沿
			inChannel = i;
		}

		MRV.PrivateInfo.InputPreviousValue[name] = curr;
	}

	// 输出通道触发 (Pos17~Pos32 -> 1., 2., ...)
	for (var j = 5; j <= 8; j++) {
		var name2 = "Pos" + j;
		var curr2 = MPV.Input[name2] && MPV.Input[name2].SignalValue === true;
		var prev2 = MRV.PrivateInfo.InputPreviousValue[name2] || false;

		if (!prev2 && curr2) {
			// 上升沿
			outChannel = j - 16;
		}

		MRV.PrivateInfo.InputPreviousValue[name2] = curr2;
	}

	// 如果有选择输入和输出，则组合成矩阵指令
	if (inChannel > 0 && outChannel > 0) {
		var cmd = inChannel + "V" + outChannel + ".";
		MRV.Output["Pos1"] = cmd;
		MRV.Refresh.push("Pos1");
	}

	return MRV;
};
