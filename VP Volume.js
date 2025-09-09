/*
文件名称: Volume Control with Tick Debounce.js
功能: 接收模拟量，通过稳定计数器防抖后，输出带校验码的指令和音量百分比。
描述: 仅当音量稳定超过指定调用次数后，才发送指令。不依赖系统时间。
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
	var checksumBase = sum & 0xff;
	var finalChecksum = checksumBase - 1;
	return finalChecksum & 0xff;
}

exports.call = function (MPV) {
	// 稳定阈值：当音量连续保持不变的调用次数超过这个值，就发送指令。
	// 这个值越大，延迟越高。
	var STABILITY_THRESHOLD = 10;

	// 1. 初始化MRV对象
	var mrv = {
		Output: { Pos1: null, Pos2: null },
		PrivateInfo: {
			OutputPreviousValue:
				(MPV.PrivateInfo && MPV.PrivateInfo.OutputPreviousValue) || {},
			// 使用计数器替代时间戳
			lastVolumeInput:
				MPV.PrivateInfo && MPV.PrivateInfo.lastVolumeInput !== undefined
					? MPV.PrivateInfo.lastVolumeInput
					: -1,
			stableTicksCounter:
				(MPV.PrivateInfo && MPV.PrivateInfo.stableTicksCounter) || 0,
			commandPending:
				MPV.PrivateInfo && MPV.PrivateInfo.commandPending !== undefined
					? MPV.PrivateInfo.commandPending
					: false,
		},
		Refresh: [],
		Token: MPV.Token,
	};

	var volInput = MPV.Input["Pos1"];
	var command = null;
	var volumePercent = null;

	// 2. 处理模拟量输入
	if (
		volInput &&
		volInput.SignalValue !== null &&
		volInput.SignalValue !== undefined
	) {
		var rawValue = volInput.SignalValue;
		var currentVolumePercent = Math.round(
			(Math.max(0, Math.min(65535, rawValue)) / 65535) * 100
		);

		// a. 检测音量是否发生变化
		if (currentVolumePercent !== mrv.PrivateInfo.lastVolumeInput) {
			// 音量变了，更新记录值，并重置稳定计数器
			mrv.PrivateInfo.lastVolumeInput = currentVolumePercent;
			mrv.PrivateInfo.stableTicksCounter = 0;
			mrv.PrivateInfo.commandPending = true; // 标记有指令等待发送
		} else {
			// 音量没变，稳定计数器加1
			mrv.PrivateInfo.stableTicksCounter++;
		}
	}

	// 3. 检查是否可以发送待处理的指令
	// 条件：有待处理指令 && 稳定计数器已超过阈值
	if (
		mrv.PrivateInfo.commandPending &&
		mrv.PrivateInfo.stableTicksCounter > STABILITY_THRESHOLD
	) {
		var finalVolume = mrv.PrivateInfo.lastVolumeInput;

		// a. 生成指令 (Pos1 输出)
		var commandTemplate = [
			0x56,
			0x50,
			0x00,
			0x08,
			0x00,
			0x20,
			0x00,
			0x03,
			0x03,
			0x01,
			finalVolume,
			0x01,
			0x00,
			0xaa,
		];
		var dataForChecksum = commandTemplate.slice(0, 12);
		var checksum = calculateChecksum(dataForChecksum);
		commandTemplate[12] = checksum;
		command = new Uint8Array(commandTemplate);

		// b. 准备百分比数值 (Pos2 输出)
		volumePercent = finalVolume;

		// c. 标记两个输出都有刷新
		mrv.Refresh.push("Pos1", "Pos2");

		// d. 重置待处理标记，防止重复发送
		mrv.PrivateInfo.commandPending = false;
	}

	// 4. 设置最终的输出值
	mrv.Output.Pos1 =
		command !== null ? command : mrv.PrivateInfo.OutputPreviousValue.Pos1;
	mrv.Output.Pos2 =
		volumePercent !== null
			? volumePercent
			: mrv.PrivateInfo.OutputPreviousValue.Pos2;

	mrv.PrivateInfo.OutputPreviousValue = {
		Pos1: mrv.Output.Pos1,
		Pos2: mrv.Output.Pos2,
	};

	return mrv;
};
