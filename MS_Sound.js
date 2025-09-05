exports.call = function (MPV) {
	var MRV = {
		Output: {},
		PrivateInfo: {
			PrevValues: {},
		},
		Refresh: [],
		Token: "",
	};

	// 恢复上一次状态
	if ("PrivateInfo" in MPV && MPV.PrivateInfo) {
		MRV.PrivateInfo = MPV.PrivateInfo;
	}

	var maxInput = 8; // 假设有 8 个模拟量输入 Pos1 ~ Pos8

	for (var i = 1; i <= maxInput; i++) {
		var posName = "Pos" + i;
		var v = MPV.Input[posName] && MPV.Input[posName].SignalValue;

		if (typeof v === "number") {
			// 归一化到 0~1，保留 2 位小数
			var norm = Math.max(0, Math.min(65535, v)) / 65535;
			var fixed = norm.toFixed(2);

			// 上次值
			var prev = MRV.PrivateInfo.PrevValues[posName];

			if (prev !== fixed) {
				var cmd = "set input value:V" + i + "," + fixed + ";";

				MRV.Output["Pos1"] = cmd;
				MRV.Refresh.push("Pos1");

				// 保存当前值
				MRV.PrivateInfo.PrevValues[posName] = fixed;

				// 只输出一个变化 → 直接跳出循环
				break;
			}
		}
	}

	return MRV;
};
