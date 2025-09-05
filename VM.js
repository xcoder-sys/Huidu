var MPV = {
	Input: {
		Pos1: { SignalValue: false },
		Pos2: { SignalValue: false },
		Pos3: { SignalValue: true }, // ģ��� 3 ·����Ϊ true
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
		"1v", // in1 (��Ӧ����������1)
		"2v", // in2 (��Ӧ����������2)
		"3v", // in3 (��Ӧ����������3)
		"4v", // in4 (��Ӧ����������4)
		"5v", // in5 (��Ӧ����������5)
		"6v", // in6 (��Ӧ����������6)
		"7v", // in7 (��Ӧ����������7)
		"8v", // in8 (��Ӧ����������8)
	];
	var Outputs = [
		"1.", // out1 (��Ӧ����������1)
		"2.", // out2 (��Ӧ����������2)
		"3.", // out3 (��Ӧ����������3)
		"4.", // out4 (��Ӧ����������4)
		"5.", // out5 (��Ӧ����������5)
		"6.", // out6 (��Ӧ����������6)
		"7.", // out7 (��Ӧ����������7)
		"8.", // out8 (��Ӧ����������8)
	];
	var input_;
	var output_;

	// ���ÿ�����������룬��Ϊtrueʱ�����Ӧָ��
	for (var i = 0; i < 8; i++) {
		var inputName1 = "Pos" + (i + 1);
		var inputName2 = "Pos" + (i + 9);
		// ���������Ƿ������ֵΪtrue
		if (
			(MPV["Input"][inputName1] &&
				MPV["Input"][inputName1]["SignalValue"] == true) ||
			(MPV["Input"][inputName2] &&
				MPV["Input"][inputName2]["SignalValue"] == true)
		) {
			// ����Ӧ��ָ��������������ź�1
			input_ = Inputs[i];
			output_ = Outputs[i];
			MRV["Output"]["Pos1"] = input_ + output_;
			//console.log("���ָ��: " + commands[i] + " (��Ӧ����" + inputName + ")");

			if (
				MPV["Input"][inputName2] &&
				MPV["Input"][inputName2]["SignalValue"] == true
			) {
				MRV["Refresh"].push("Pos1");
			}
			// ֻ�����һ��Ϊtrue�����룬�����ͻ
			break;
		}
	}
	console.log(MRV);
	return MRV;
}
