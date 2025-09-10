/*
文件名称: LCD Volume Control.js
功能: 接收模拟量，输出音量指令和音量百分比。
信号：
  输入 Pos1 (Analog): 原始音量值 (0-65535)
  输出 Pos1 (Serial): 音量控制指令 (Uint8Array)
  输出 Pos2 (Analog): 音量百分比 (0-100)
*/

exports.call = function (MPV) {
	// 1. 初始化MRV对象
	var mrv = {
		Output: {
			Pos1: null, // 指令输出
			Pos2: null, // 百分比输出
		},
		PrivateInfo: {
			// 从MPV恢复上一次的状态
			OutputPreviousValue:
				(MPV.PrivateInfo && MPV.PrivateInfo.OutputPreviousValue) || {},
			PrevVolume:
				MPV.PrivateInfo && MPV.PrivateInfo.PrevVolume !== undefined
					? MPV.PrivateInfo.PrevVolume
					: -1, // 使用-1作为初始值，确保首次必触发
		},
		Refresh: [],
		Token: MPV.Token,
	};

	// 2. 获取模拟量输入
	var volInput = MPV.Input["Pos1"];
	var command = null;
	var volumePercent = null;

	// 检查输入是否有效
	if (
		volInput &&
		volInput.SignalValue !== null &&
		volInput.SignalValue !== undefined
	) {
		var rawValue = volInput.SignalValue;

		// 3. 将 0-65535 的原始值转换为 0-100 的百分比
		var normalized = Math.max(0, Math.min(65535, rawValue)) / 65535;
		var currentVolumePercent = Math.round(normalized * 100);

		// 4. 变化检测：只有当计算出的音量与上次不同时，才生成新指令
		if (currentVolumePercent !== mrv.PrivateInfo.PrevVolume) {
			// 5. 生成两路输出
			// 输出1: 控制指令 (字节数组)
			command = new Uint8Array([0x05, 0x00, 0x08, 0x00, currentVolumePercent]);

			// 输出2: 音量百分比 (数值)
			volumePercent = currentVolumePercent + "%";

			// 标记两个输出都有刷新
			mrv.Refresh.push("Pos1", "Pos2");
		}

		// 6. 更新状态：无论是否发送指令，都更新“上次音量”的记忆
		mrv.PrivateInfo.PrevVolume = currentVolumePercent;
	}

	// 7. 设置最终的输出值
	// 如果有新指令，则使用新值；否则，维持上一次的输出值
	mrv.Output.Pos1 =
		command !== null ? command : mrv.PrivateInfo.OutputPreviousValue.Pos1;
	// 百分比输出也一样处理
	mrv.Output.Pos2 =
		volumePercent !== null
			? volumePercent
			: mrv.PrivateInfo.OutputPreviousValue.Pos2;

	// 将本次的输出值存入PrivateInfo，供下次维持状态使用
	mrv.PrivateInfo.OutputPreviousValue = {
		Pos1: mrv.Output.Pos1,
		Pos2: mrv.Output.Pos2,
	};

	// 8. 返回结果
	return mrv;
};
