//简易版实现 8个场景 + 5个音频场景（拼控也只支持5个音频场景）
function call(MPV) {
	var MRV = {
		Output: {},
		PrivateInfo: {
			OutputPreviousValue: {},
		},
		Refresh: [],
		Token: "",
	};
	/* 
参考处理器协议V1.9版本

*/
	// 定义29条指令，与数字量输入一一对应
	var commands = [
		"(scene,call,1)\r\n", // 场景1 (对应数字量输入1)
		"(scene,call,2)\r\n", // 2 (对应数字量输入2)
		"(scene,call,3)\r\n", // 3 (对应数字量输入3)
		"(scene,call,4)\r\n", // 4 (对应数字量输入4)
		"(scene,call,5)\r\n", // 5 (对应数字量输入5)
		"(scene,call,6)\r\n", // 6 (对应数字量输入6)
		"(scene,call,7)\r\n", // 7 (对应数字量输入7)
		"(scene,call,8)\r\n", // 8 (对应数字量输入8)
		"(audsce,call,1)", // 音频场景1 (对应数字量输入9)
		"(audsce,call,2)", // 2 (对应数字量输入10)
		"(audsce,call,3)", // 3 (对应数字量输入11)
		"(audsce,call,4)", // 4 (对应数字量输入12)
		"(audsce,call,5)", // 5 (对应数字量输入13)
	];

	// 检查每个数字量输入，当为true时输出对应指令
	for (var i = 0; i < 17; i++) {
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
