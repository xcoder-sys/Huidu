
function call(MPV) {
	/* 返回数据MRV基本数据格式定义 */
	var MRV = {
		/*输出数据，包含输出的信号位置和值*/
		Output: {},
		/* 模块内部私有数据存储结构 */
		PrivateInfo: {
			OutputPreviousValue: {},
		},
		/* 输出刷新信号位置 */
		Refresh: [],
		Token: "",
	};

	// --- 在这里定义你的硬编码指令字符串 ---
	// 键是输入信号的名称 (例如 "trigger1", "trigger2")
	// 值是当该信号触发时要发送的字符串指令
	var hardcodedCommands = {
		trigger1: "START_PROCESS_A",
		trigger2: "STOP_PROCESS_B",
		trigger3: "RESET_SYSTEM",
		// 你可以在这里添加更多 "triggerX": "对应的指令"
	};
	// ------------------------------------

	// 获取输出 "commandOut" 对应的 Pos (例如 "Pos1")
	var commandOutPos = "";
	if (
		MPV.SignalNameVSPos &&
		MPV.SignalNameVSPos.Output &&
		MPV.SignalNameVSPos.Output.commandOut
	) {
		commandOutPos = MPV.SignalNameVSPos.Output.commandOut;
	} else {
		commandOutPos = "Pos1";
	}

	var commandToSend = ""; // 存储最终要发送的指令字符串
	var outputTriggered = false; // 标记是否有任何触发导致了输出

	// 2. 遍历所有可能的输入信号
	var inputSignalsMap = MPV.SignalNameVSPos.Input;

	if (inputSignalsMap && typeof inputSignalsMap === "object") {
		for (var signalName in inputSignalsMap) {
			if (Object.prototype.hasOwnProperty.call(inputSignalsMap, signalName)) {
				var currentInputPos = inputSignalsMap[signalName];

				// 健壮地获取当前输入信号的值
				var currentTriggerValue = false;
				if (
					MPV.Input &&
					MPV.Input[currentInputPos] &&
					typeof MPV.Input[currentInputPos].SignalValue !== "undefined"
				) {
					currentTriggerValue = MPV.Input[currentInputPos].SignalValue;
				}

				// 健壮地获取上次输入信号的值
				var previousTriggerValue = false;
				if (
					MPV.PrivateInfo &&
					MPV.PrivateInfo.InputPreviousValue &&
					typeof MPV.PrivateInfo.InputPreviousValue[currentInputPos] !==
						"undefined"
				) {
					previousTriggerValue =
						MPV.PrivateInfo.InputPreviousValue[currentInputPos];
				}

				// 检查当前输入信号是否在本次刷新列表中
				var isRefreshed = false;
				if (MPV.Refresh && Array.isArray(MPV.Refresh)) {
					for (var i = 0; i < MPV.Refresh.length; i++) {
						if (MPV.Refresh[i] === currentInputPos) {
							isRefreshed = true;
							break;
						}
					}
				}

				// 3. 判断上升沿并获取指令
				if (isRefreshed) {
					if (currentTriggerValue === true && previousTriggerValue === false) {
						// 检测到上升沿，从硬编码对象中获取指令
						if (hardcodedCommands.hasOwnProperty(signalName)) {
							// 如果有多个触发，只发送第一个发现的指令
							if (!outputTriggered) {
								commandToSend = hardcodedCommands[signalName];
								outputTriggered = true;
							}
						}
					}
				}

				// 4. 记录本次输入信号的状态到 PrivateInfo，供下次调用使用
				MRV.PrivateInfo.InputPreviousValue[currentInputPos] =
					currentTriggerValue;
			}
		}
	}

	// 5. 根据是否触发设置最终输出
	if (outputTriggered) {
		MRV.Output[commandOutPos] = commandToSend;
		MRV.Refresh.push(commandOutPos);
	} else {
		MRV.Output[commandOutPos] = "";
	}

	// 6. 返回 MRV
	return MRV;
}
