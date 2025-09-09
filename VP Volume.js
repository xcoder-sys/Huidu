/*
文件名称: Volume Control with Checksum (Dual Output).js
功能: 接收模拟量，输出带校验码的指令和音量百分比。
信号：
  输入 Pos1 (Analog): 原始音量值 (0-65535)
  输出 Pos1 (Serial): 完整的音量控制指令 (Uint8Array)
  输出 Pos2 (Analog): 音量百分比 (0-100)
*/

/**
 * 辅助函数：根据指令数据计算校验码
 * @param {Array<number>} commandData - 指令的前12个字节
 * @returns {number} - 计算出的校验码
 */
function calculateChecksum(commandData) {
	var sum = 0;
	for (var i = 0; i < commandData.length; i++) {
		sum += commandData[i];
	}
	// 取和的最低8位 (等同于 sum % 256)
	var checksumBase = sum & 0xff;
	// 最后减 1
	var finalChecksum = checksumBase - 1;
	// 确保结果在0-255之间 (处理-1变成255的情况)
	return finalChecksum & 0xff;
}

exports.call = function (MPV) {
	// 1. 初始化MRV对象
	var mrv = {
		Output: {
			Pos1: null, // 指令输出
			Pos2: null, // 百分比输出
		},
		PrivateInfo: {
			OutputPreviousValue:
				(MPV.PrivateInfo && MPV.PrivateInfo.OutputPreviousValue) || {},
			PrevVolume:
				MPV.PrivateInfo && MPV.PrivateInfo.PrevVolume !== undefined
					? MPV.PrivateInfo.PrevVolume
					: -1,
		},
		Refresh: [],
		Token: MPV.Token,
	};

	// 2. 获取模拟量输入
	var volInput = MPV.Input["Pos1"];
	var command = null;
	var volumePercent = null;

	if (
		volInput &&
		volInput.SignalValue !== null &&
		volInput.SignalValue !== undefined
	) {
		var rawValue = volInput.SignalValue;

		// 3. 将 0-65535 的原始值转换为 0-100 的百分比
		var normalized = Math.max(0, Math.min(65535, rawValue)) / 65535;
		var currentVolumePercent = Math.round(normalized * 100);

		// 4. 变化检测：只有当音量变化时才生成新指令
		if (currentVolumePercent !== mrv.PrivateInfo.PrevVolume) {
			// 5. 生成指令 (Pos1 输出)
			var commandTemplate = [
				0x56, 0x50, 0x00, 0x08, 0x00, 0x20, 0x00, 0x03, 0x03, 0x01, 0x00, 0x01,
				0x00, 0xaa,
			];
			commandTemplate[10] = currentVolumePercent; // 填入音量
			var dataForChecksum = commandTemplate.slice(0, 12);
			var checksum = calculateChecksum(dataForChecksum);
			commandTemplate[12] = checksum; // 填入校验码
			command = new Uint8Array(commandTemplate);

			// 6. 准备百分比数值 (Pos2 输出)
			volumePercent = currentVolumePercent+"%";

			// 7. 标记两个输出都有刷新
			mrv.Refresh.push("Pos1", "Pos2");
		}

		// 8. 更新状态
		mrv.PrivateInfo.PrevVolume = currentVolumePercent;
	}

	// 9. 设置最终的输出值
	mrv.Output.Pos1 =
		command !== null ? command : mrv.PrivateInfo.OutputPreviousValue.Pos1;
	mrv.Output.Pos2 =
		volumePercent !== null
			? volumePercent
			: mrv.PrivateInfo.OutputPreviousValue.Pos2;

	// 保存本次的两个输出值，供下次维持状态使用
	mrv.PrivateInfo.OutputPreviousValue = {
		Pos1: mrv.Output.Pos1,
		Pos2: mrv.Output.Pos2,
	};

	// 10. 返回结果
	return mrv;
};
