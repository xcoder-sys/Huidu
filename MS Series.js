/* 信号定义参考: 
   数字量输入: Pos1-Pos27 (指令)
   串行量输出: Pos1 (指令)
   移除调节声音，声音调节单独做一个模块
*/
exports.call = function (MPV) {
	var i;
	var command = null;
	var outputValue = null;

	// 1. 定义指令映射表 (Pos1 - Pos27)，已替换为您的真实指令
	var hardcodedCommands = {
		Pos1: "close computer:;", // 关机
		Pos2: "ppt up:;", // PPT up；
		Pos3: "ppt down:;", // PPT down；
		Pos4: "play current act:1;", // 播放节目页1当前节目
		Pos5: "pause current act:1;", // 暂停节目页1当前节目
		Pos6: "play current act:2;", // 播放节目页2当前节目
		Pos7: "pause current act:2;", // 暂停节目页2当前节目
		Pos8: "play act:1,1;", // 播放节目页1的第1个节目
		Pos9: "play act:1,2;",
		Pos10: "play act:1,3;",
		Pos11: "play act:1,4;",
		Pos12: "play act:1,5;",
		Pos13: "play act:1,6;",
		Pos14: "play act:1,7;",
		Pos15: "play act:1,8;",
		Pos16: "play act:1,9;",
		Pos17: "play act:1,10;",
		Pos18: "play act:2,1;",
		Pos19: "play act:2,2;",
		Pos20: "play act:2,3;",
		Pos21: "play act:2,4;",
		Pos22: "play act:2,5;",
		Pos23: "play act:2,6;",
		Pos24: "play act:2,7;",
		Pos25: "play act:2,8;",
		Pos26: "play act:2,9;",
		Pos27: "play act:2,10;",
	};

	// 2. 从MPV中获取上次的状态
	var previousInputValues =
		(MPV.PrivateInfo && MPV.PrivateInfo.InputPreviousValue) || {};
	var previousOutputValue =
		MPV.PrivateInfo &&
		MPV.PrivateInfo.OutputPreviousValue &&
		MPV.PrivateInfo.OutputPreviousValue.Pos1;

	// 3. 处理数字量输入 (Pos1 - Pos27)
	// 从最高位 Pos27 向下检查到 Pos1，以实现“高位优先”
	for (i = 27; i >= 1; i--) {
		var pos = "Pos" + i;
		var hardcodedCommand = hardcodedCommands[pos];

		// 只有在指令表中定义的端口才进行检查
		if (hardcodedCommand) {
			var currentInput = MPV.Input[pos];
			var isRisingEdge =
				currentInput &&
				currentInput.SignalValue === true &&
				!previousInputValues[pos]; // !undefined 或 !false 都为 true

			if (isRisingEdge) {
				command = hardcodedCommand;
				break; // 找到第一个触发的指令后，立即跳出循环
			}
		}
	}

	// 4. 根据指令更新本次输出值
	if (command !== null) {
		outputValue = command;
	} else if (previousOutputValue) {
		// 如果没有新指令，保持上一次的输出
		outputValue = previousOutputValue;
	}

	// 5. 构建并返回MRV对象
	var mrv = {
		Output: { Pos1: outputValue },
		PrivateInfo: {
			InputPreviousValue: {},
			OutputPreviousValue: { Pos1: outputValue },
		},
		Refresh: command !== null ? ["Pos1"] : [],
		Token: MPV.Token,
	};

	// 6. 记录本次所有输入状态，用于下一次调用
	for (var inputPos in MPV.Input) {
		if (MPV.Input.hasOwnProperty(inputPos)) {
			mrv.PrivateInfo.InputPreviousValue[inputPos] =
				MPV.Input[inputPos].SignalValue;
		}
	}

	return mrv;
};
