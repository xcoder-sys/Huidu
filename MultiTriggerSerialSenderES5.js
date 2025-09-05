/* MultiTriggerSerialSenderES5.js - ES5 标准实现 */

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

	// 假设输出串行量的位置是固定的 "serialOut" 对应的 Pos
	// 通过 SignalNameVSPos 来获取输出 "serialOut" 对应的 Pos (例如 "Pos1")
	var serialOutPos = "";
	if (
		MPV.SignalNameVSPos &&
		MPV.SignalNameVSPos.Output &&
		MPV.SignalNameVSPos.Output.serialOut
	) {
		serialOutPos = MPV.SignalNameVSPos.Output.serialOut;
	} else {
		// 这是一个兜底，如果 SignalNameVSPos 没提供 serialOut 的位置，
		// 则假定输出位置是 "Pos1" 或根据模块视图默认的第一个输出位
		// 在实际应用中，如果规范强制提供 SignalNameVSPos，则无需此 else 分支
		serialOutPos = "Pos1";
	}

	var valueToSend = ""; // 存储最终要发送的字符串
	var outputTriggered = false; // 标记是否有任何触发导致了输出

	// 2. 遍历所有可能的输入信号 (trigger1, trigger2, ...)
	// 使用 for...in 循环遍历 SignalNameVSPos.Input 来获取所有输入信号的名称和位置
	var inputSignalsMap = MPV.SignalNameVSPos.Input;

	// 确保 inputSignalsMap 存在且是对象
	if (inputSignalsMap && typeof inputSignalsMap === "object") {
		for (var signalName in inputSignalsMap) {
			// 确保是对象的自有属性，而不是原型链上的属性
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
				// 首次执行或没有上次数据时，默认上次为 false
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
						// 触发了！获取对应的静态参数字符串
						// 例如 "trigger1" 对应 "string1"
						var paramName = signalName.replace("trigger", "string");
						var paramPos = "";
						if (
							MPV.SignalNameVSPos &&
							MPV.SignalNameVSPos.StaticParameter &&
							MPV.SignalNameVSPos.StaticParameter[paramName]
						) {
							paramPos = MPV.SignalNameVSPos.StaticParameter[paramName];
						}

						var currentParamValue = "";
						if (
							MPV.StaticParameter &&
							MPV.StaticParameter[paramPos] &&
							typeof MPV.StaticParameter[paramPos].SignalValue !== "undefined"
						) {
							currentParamValue = MPV.StaticParameter[paramPos].SignalValue;
						}

						// 如果有多个触发，我们只发送第一个触发的字符串
						if (!outputTriggered) {
							// 确保只设置一次要发送的值
							valueToSend = currentParamValue;
							outputTriggered = true;
						}
					}
				}

				// 3. 记录本次输入信号的状态到 PrivateInfo，供下次调用使用
				// 无论是否触发，每个输入信号的当前状态都需要保存
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
		// 如果没有任何触发，输出保持默认或空，且不标记刷新
		MRV.Output[serialOutPos] = "";
	}

	// 5. 返回 MRV
	return MRV;
};




