/* HardcodedMultiTriggerSender.js - ES5 标准实现 */

exports.call = function (MPV) {
	// 1. 初始化 MRV 返回对象
	var MRV = {
		Output: {},
		PrivateInfo: {
			InputPreviousValue: {}, // 用于存储所有触发信号的上次状态
		},
		Refresh: [],
		Token: MPV.Token || "", // 确保 Token 总是被传递，如果 MPV.Token 不存在则给空字符串
	};

	// --- 在这里定义你的硬编码字符串参数 ---
	// 键是输入信号的名称 (例如 "trigger1", "trigger2")
	// 值是当该信号触发时要发送的字符串
	var hardcodedStrings = {
		trigger1: "Hello from Button 1",
		trigger2: "Action confirmed!",
		trigger3: "Warning: Temperature High",
		trigger4: "System Reset Initiated",
		// 你可以在这里添加更多 "triggerX": "对应的字符串"
		// 确保这些键与你在模块视图中定义的输入信号名称一致
	};
	// ------------------------------------

	// 获取输出 "serialOut" 对应的 Pos (例如 "Pos1")
	var serialOutPos = "";
	if (
		MPV.SignalNameVSPos &&
		MPV.SignalNameVSPos.Output &&
		MPV.SignalNameVSPos.Output.serialOut
	) {
		serialOutPos = MPV.SignalNameVSPos.Output.serialOut;
	} else {
		// 兜底方案：如果 SignalNameVSPos 没提供，假设输出位置是 "Pos1"
		serialOutPos = "Pos1";
	}

	var valueToSend = ""; // 存储最终要发送的字符串
	var outputTriggered = false; // 标记是否有任何触发导致了输出

	// 2. 遍历所有可能的输入信号 (trigger1, trigger2, ...)
	var inputSignalsMap = MPV.SignalNameVSPos.Input;

	if (inputSignalsMap && typeof inputSignalsMap === "object") {
		for (var signalName in inputSignalsMap) {
			if (Object.prototype.hasOwnProperty.call(inputSignalsMap, signalName)) {
				var currentInputPos = inputSignalsMap[signalName]; // 当前输入的 Pos 标识符 (如 "Pos1")

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

				// 检查当前输入信号是否在本次刷新列表中 (ES5 实现 includes)
				var isRefreshed = false;
				if (MPV.Refresh && Array.isArray(MPV.Refresh)) {
					for (var i = 0; i < MPV.Refresh.length; i++) {
						if (MPV.Refresh[i] === currentInputPos) {
							isRefreshed = true;
							break;
						}
					}
				}

				if (isRefreshed) {
					// 判断上升沿：当前为 true 且上次为 false
					if (currentTriggerValue === true && previousTriggerValue === false) {
						// 触发了！从硬编码的 hardcodedStrings 对象中获取对应的字符串
						// 只有当 hardcodedStrings 中存在这个 signalName 对应的字符串时才赋值
						if (hardcodedStrings.hasOwnProperty(signalName)) {
							// 如果有多个触发，我们只发送第一个触发的字符串
							if (!outputTriggered) {
								// 确保只设置一次要发送的值
								valueToSend = hardcodedStrings[signalName];
								outputTriggered = true;
							}
						}
					}
				}

				// 3. 记录本次输入信号的状态到 PrivateInfo，供下次调用使用
				MRV.PrivateInfo.InputPreviousValue[currentInputPos] =
					currentTriggerValue;
			}
		}
	}

	// 4. 根据是否触发设置最终输出
	if (outputTriggered) {
		MRV.Output[serialOutPos] = valueToSend; // 将收集到的字符串赋给输出端口
		MRV.Refresh.push(serialOutPos); // 标记输出端口有刷新
	} else {
		MRV.Output[serialOutPos] = ""; // 如果没有任何触发，输出为空
	}

	// 5. 返回 MRV
	return MRV;
};
