/* 信号定义参考: 
? ?模拟量输入: Pos1 (音量值, 0-65535) 
? ?
? ?数字量输入: Pos2-PosN (节目指令)
   
   有问题，需要手动调节音量，后续指令才会生效
*/
exports.call = function (MPV) {
	var i;
	var command = null;
	var outputValue = null;

	// 1. 定义完全硬编码的指令映射表
	var hardcodedCommands = {
		//节目名和节目页命需要纯数字
		Pos2: "close computer:;", //关机
		Pos3: "ppt up:;", //PPT up；
		Pos4: "ppt down:;", //PPT down；
		Pos5: "play current act:1;", //播放节目页1当前节目
		Pos6: "pause current act:1;", //暂停节目页1当前节目
		Pos7: "play current act:2;", //播放节目页2当前节目
		Pos8: "pause current act:2;", //暂停节目页2当前节目
		Pos9: "play act:1,1;", //播放节目页1的第1个节目
		Pos10: "play act:1,2;",
		Pos11: "play act:1,3;",
		Pos12: "play act:1,4;",
		Pos13: "play act:1,5;",
		Pos14: "play act:1,6;",
		Pos15: "play act:1,7;",
		Pos16: "play act:1,8;",
		Pos17: "play act:1,9;",
		Pos18: "play act:1,10;",
		Pos19: "play act:2,1;",
		Pos20: "play act:2,2;",
		Pos21: "play act:2,3;",
		Pos22: "play act:2,4;",
		Pos23: "play act:2,5;",
		Pos24: "play act:2,6;",
		Pos25: "play act:2,7;",
		Pos26: "play act:2,8;",
		Pos27: "play act:2,9;",
		Pos28: "play act:2,10;",
	};

	// 2. 从MPV中获取上次的状态
	var previousInputValues =
		(MPV.PrivateInfo && MPV.PrivateInfo.InputPreviousValue) || {};
	var prevVolume = (MPV.PrivateInfo && MPV.PrivateInfo.PrevVolume) || -1;
	var previousOutputValue =
		MPV.PrivateInfo &&
		MPV.PrivateInfo.OutputPreviousValue &&
		MPV.PrivateInfo.OutputPreviousValue.Pos1;

	// 3. 优先处理模拟量输入 (音量设置)，其位置现在是Pos1
	var volInput = MPV.Input["Pos1"];
	if (
		volInput &&
		volInput.SignalValue !== null &&
		volInput.SignalValue !== undefined
	) {
		var raw = volInput.SignalValue;
		var norm = Math.max(0, Math.min(65535, raw)) / 65535;
		var vol = Math.round(norm * 100);

		if (prevVolume !== vol) {
			command = "set volume:" + vol + ";";
			prevVolume = vol; // 更新本次的音量值
		}
	}

	// 4. 处理数字量输入
	// 只有在模拟量没有触发时，才检查数字量输入
	if (command === null) {
		// 反向遍历以实现“位置序号最大”的优先级
		var orderedPositions = Object.keys(MPV.Input).sort(function (a, b) {
			return parseInt(b.substring(3)) - parseInt(a.substring(3));
		});

		for (i = 0; i < orderedPositions.length; i++) {
			var pos = orderedPositions[i];
			var hardcodedCommand = hardcodedCommands[pos];

			if (hardcodedCommand) {
				var isRisingEdge =
					MPV.Input[pos] &&
					MPV.Input[pos].SignalValue === true &&
					(previousInputValues[pos] === false ||
						previousInputValues[pos] === undefined);

				if (isRisingEdge) {
					command = hardcodedCommand;
					break;
				}
			}
		}
	}

	// 5. 根据指令更新本次输出值
	if (command !== null) {
		outputValue = command;
	} else if (previousOutputValue) {
		outputValue = previousOutputValue;
	}

	// 6. 构建并返回MRV对象
	var mrv = {
		Output: { Pos1: outputValue },
		PrivateInfo: {
			InputPreviousValue: {},
			OutputPreviousValue: { Pos1: outputValue },
			PrevVolume: prevVolume,
		},
		Refresh: command !== null ? ["Pos1"] : [],
		Token: MPV.Token,
	};

	// 7. 记录本次输入状态，用于下一次调用
	for (var inputPos in MPV.Input) {
		if (MPV.Input.hasOwnProperty(inputPos)) {
			mrv.PrivateInfo.InputPreviousValue[inputPos] =
				MPV.Input[inputPos].SignalValue;
		}
	}

	return mrv;
};
