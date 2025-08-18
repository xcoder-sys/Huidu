// TimeOutput.js
exports.call = function (MPV) {
	var MRV = {
		Output: {},
		PrivateInfo: {
			LastTime: 0,
			InputPreviousValue: {},
		},
		Refresh: [],
		Token: "",
	};

	var trigPos = "Pos1"; // 输入信号 trig1
	var outPos = "Pos1"; // 输出信号 out1

	// 恢复上次状态
	if ("PrivateInfo" in MPV) {
		MRV.PrivateInfo = MPV.PrivateInfo;
	}

	var trigActive =
		MPV.Input[trigPos] && MPV.Input[trigPos].SignalValue === true;

	if (trigActive) {
		var now = new Date();
		var nowMs = now.getTime();

		// 只在 1 秒间隔时输出
		if (nowMs - (MRV.PrivateInfo.LastTime || 0) >= 1000) {
			var timeStr =
				now.getFullYear() +
				"-" +
				("0" + (now.getMonth() + 1)).slice(-2) +
				"-" +
				("0" + now.getDate()).slice(-2) +
				" " +
				("0" + now.getHours()).slice(-2) +
				":" +
				("0" + now.getMinutes()).slice(-2) +
				":" +
				("0" + now.getSeconds()).slice(-2);

			MRV.Output[outPos] = timeStr;
			MRV.Refresh.push(outPos);

			MRV.PrivateInfo.LastTime = nowMs;
		}
	}

	// 保存输入状态
	/* for (var inputPos in MPV.Input) {
		MRV.PrivateInfo.InputPreviousValue[inputPos] =
			MPV.Input[inputPos].SignalValue;
	} */

	return MRV;
};
