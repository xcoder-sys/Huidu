function call(MPV) {
	var MRV = {
		Output: {},
		PrivateInfo: {
			OutputPreviousValue: {},
		},
		Refresh: [],
		Token: "",
	};

	// 定义29条指令，与数字量输入一一对应
	var commands = [
		"\xFF\xFF\xAA\x01\x10\x01\x00\x01", // 总开 (对应数字量输入1)
		"\xFF\xFF\xAA\x01\x10\x01\x00\x02", // 总关 (对应数字量输入2)
		"\xFF\xFF\xAA\x01\x11\x01\x00\x01", // 第一路开 (对应数字量输入3)
		"\xFF\xFF\xAA\x01\x11\x01\x00\x02", // 第二路开 (对应数字量输入4)
		"\xFF\xFF\xAA\x01\x11\x01\x00\x03", // 第三路开 (对应数字量输入5)
		"\xFF\xFF\xAA\x01\x11\x01\x00\x04", // 第四路开 (对应数字量输入6)
		"\xFF\xFF\xAA\x01\x11\x01\x00\x05", // 第五路开(对应数字量输入7)
		"\xFF\xFF\xAA\x01\x11\x01\x00\x06", // 第六路开 (对应数字量输入8)
		"\xFF\xFF\xAA\x01\x11\x01\x00\x07", // 第七路开 (对应数字量输入9)
		"\xFF\xFF\xAA\x01\x11\x01\x00\x08", // 第八路开 (对应数字量输入10)
		"\xFF\xFF\xAA\x01\x12\x01\x00\x01", // 第一路关 (对应数字量输入11)
		"\xFF\xFF\xAA\x01\x12\x01\x00\x02", // 第二路关 (对应数字量输入12)
		"\xFF\xFF\xAA\x01\x12\x01\x00\x03", // 第三路关 (对应数字量输入13)
		"\xFF\xFF\xAA\x01\x12\x01\x00\x04", // 第四路关 (对应数字量输入14)
		"\xFF\xFF\xAA\x01\x12\x01\x00\x05", // 第五路关 (对应数字量输入15)
		"\xFF\xFF\xAA\x01\x12\x01\x00\x06", // 第六路关 (对应数字量输入16)
		"\xFF\xFF\xAA\x01\x12\x01\x00\x07", // 第七路关 (对应数字量输入17)
		"\xFF\xFF\xAA\x01\x12\x01\x00\x08", // 第八路关 (对应数字量输入18)
	];

	// 检查每个数字量输入，当为true时输出对应指令
	for (var i = 0; i < 29; i++) {
		var inputName = "Pos" + (i + 1);
		// 检查该输入是否存在且值为true
		if (
			MPV["Input"][inputName] &&
			MPV["Input"][inputName]["SignalValue"] == true
		) {
			// 将对应的指令输出到串行量信号1
			MRV["Output"]["Pos1"] = commands[i];
			//console.log("输出指令: " + commands[i] + " (对应输入" + inputName + ")");
			MRV["Refresh"].push("Pos1");
			// 只处理第一个为true的输入，避免冲突
			break;
		}
	}

	return MRV;
}
