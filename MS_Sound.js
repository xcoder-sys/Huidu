exports.call = function (MPV) {
	var MRV = {
		Output: {},
		PrivateInfo: {
			PrevValues: {},
		},
		Refresh: [],
		Token: "",
	};

	// �ָ���һ��״̬
	if ("PrivateInfo" in MPV && MPV.PrivateInfo) {
		MRV.PrivateInfo = MPV.PrivateInfo;
	}

	var maxInput = 8; // ������ 8 ��ģ�������� Pos1 ~ Pos8

	for (var i = 1; i <= maxInput; i++) {
		var posName = "Pos" + i;
		var v = MPV.Input[posName] && MPV.Input[posName].SignalValue;

		if (typeof v === "number") {
			// ��һ���� 0~1������ 2 λС��
			var norm = Math.max(0, Math.min(65535, v)) / 65535;
			var fixed = norm.toFixed(2);

			// �ϴ�ֵ
			var prev = MRV.PrivateInfo.PrevValues[posName];

			if (prev !== fixed) {
				var cmd = "set input value:V" + i + "," + fixed + ";";

				MRV.Output["Pos1"] = cmd;
				MRV.Refresh.push("Pos1");

				// ���浱ǰֵ
				MRV.PrivateInfo.PrevValues[posName] = fixed;

				// ֻ���һ���仯 �� ֱ������ѭ��
				break;
			}
		}
	}

	return MRV;
};
