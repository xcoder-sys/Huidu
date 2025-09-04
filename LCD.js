// 工具函数：将普通字符串转换为Uint8Array字节数组
function stringToBytes(str) {
	var bytes = [];
	for (var i = 0; i < str.length; i++) {
		bytes.push(str.charCodeAt(i));
	}
	return new Uint8Array(bytes);
}

function call(MPV) {
	// 1. 定义28条固定指令，使用可以直接赋值的字符串
	// \x04这样的十六进制转义字符是有效的
	var commands = [
		"\x04\x00\x01\x00", // Pos1: 开屏
		"\x04\x00\x02\x00", // Pos2: 关屏
		"\x04\x00\x03\x00", // Pos3: 播放
		"\x04\x00\x04\x00", // Pos4: 暂停
		"\x04\x00\x06\x00", // Pos5: 上一个节目
		"\x04\x00\x07\x00", // Pos6: 下一个节目
		"\x04\x00\x09\x00", // Pos7: 静音
		"\x04\x00\x0A\x00", // Pos8: 音量+
		"\x04\x00\x0B\x00", // Pos9: 音量-
		"\x04\x00\x0D\x00", // Pos10: 亮度+
		"\x04\x00\x0E\x00", // Pos11: 亮度-
		"\x05\x00\x0F\x00\x00", // Pos12: 列表循环
		"\x05\x00\x0F\x00\x01", // Pos13: 单节目循环
		"\x05\x00\x05\x00\x00", // Pos14: 节目1
		"\x05\x00\x05\x00\x01", // Pos15: 节目2
		"\x05\x00\x05\x00\x02", // Pos16: 节目3
		"\x05\x00\x05\x00\x03", // Pos17: 节目4
		"\x05\x00\x05\x00\x04", // Pos18: 节目5
		"\x05\x00\x05\x00\x05", // Pos19: 节目6
		"\x05\x00\x05\x00\x06", // Pos20: 节目7
		"\x05\x00\x05\x00\x07", // Pos21: 节目8
		"\x05\x00\x05\x00\x08", // Pos22: 节目9
		"\x05\x00\x05\x00\x09", // Pos23: 节目10
		"\x05\x00\x05\x00\x0A", // Pos24: 节目11
		"\x05\x00\x05\x00\x0B", // Pos25: 节目12
		"\x05\x00\x05\x00\x0C", // Pos26: 节目13
		"\x05\x00\x05\x00\x0D", // Pos27: 节目14
		"\x05\x00\x05\x00\x0E", // Pos28: 节目15
	];

	// 初始化MRV对象
	var mrv = {
		Output: {
			Pos1: null, // 统一的输出位置
		},
		PrivateInfo: {
			// 从MPV中获取上次的状态，如果不存在则使用默认值
			OutputPreviousValue:
				(MPV.PrivateInfo && MPV.PrivateInfo.OutputPreviousValue) || {},
			PrevVolume: (MPV.PrivateInfo && MPV.PrivateInfo.PrevVolume) || -1, // 使用-1作为初始值，确保第一次触发时能进入
		},
		Refresh: [],
		Token: MPV.Token,
	};

	// 2. 优先处理模拟量输入 (因为音量调节的优先级可能更高)
	var volInput = MPV.Input["Pos29"];
	if (
		volInput &&
		volInput.SignalValue !== null &&
		volInput.SignalValue !== undefined
	) {
		var raw = volInput.SignalValue;
		var norm = Math.max(0, Math.min(65535, raw)) / 65535;
		var vol = Math.round(norm * 100);

		if (mrv.PrivateInfo.PrevVolume !== vol) {
			// 构建Uint8Array字节数组，而非字符串
			var volumeCmd = new Uint8Array([0x05, 0x00, 0x08, 0x00, vol]);
			mrv.Output["Pos2"] = volumeCmd;
			mrv.Refresh.push("Pos2");
			mrv.PrivateInfo.PrevVolume = vol; // 正确保存本次的音量值
			return mrv; // 模拟量触发后，直接返回，不处理数字量，避免冲突
		}
	}

	// 3. 处理数字量输入（只有当模拟量没有触发时才执行）
	// 为了实现“位置序号最大”的优先级，我们可以反向遍历
	for (var i = commands.length - 1; i >= 0; i--) {
		var inputName = "Pos" + (i + 1);
		if (MPV.Input[inputName] && MPV.Input[inputName].SignalValue === true) {
			mrv.Output["Pos1"] = stringToBytes(commands[i]); // 转换为字节数组
			mrv.Refresh.push("Pos1");
			return mrv; // 找到后立即返回
		}
	}

	// 4. 如果没有任何信号触发，则保持上次的输出
	// 您的代码中没有保存上次输出的逻辑，这里我们添加它
	if (mrv.PrivateInfo.OutputPreviousValue.Pos1) {
		mrv.Output.Pos1 = mrv.PrivateInfo.OutputPreviousValue.Pos1;
	}
	mrv.PrivateInfo.OutputPreviousValue.Pos1 = mrv.Output.Pos1;

	return mrv;
}
