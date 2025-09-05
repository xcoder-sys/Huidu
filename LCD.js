// 工具函数：将普通字符串转换为Uint8Array字节数组
function stringToBytes(str) {
	var bytes = [];
	for (var i = 0; i < str.length; i++) {
		bytes.push(str.charCodeAt(i));
	}
	return new Uint8Array(bytes);
}

function call(MPV) {
	// 1. 定义28条固定指令
	var commands = [
		"\x04\x00\x01\x00", // 开屏 (对应数字量输入1)
		"\x04\x00\x02\x00", // 关屏 (对应数字量输入2)
		"\x04\x00\x03\x00", // 播放 (对应数字量输入3)
		"\x04\x00\x04\x00", // 暂停 (对应数字量输入4)
		"\x04\x00\x06\x00", // 上一个节目 (对应数字量输入5)
		"\x04\x00\x07\x00", // 下一个节目 (对应数字量输入6)
		"\x04\x00\x09\x00", // 静音 (对应数字量输入7)
		"\x04\x00\x0A\x00", // 音量+ (对应数字量输入8)
		"\x04\x00\x0B\x00", // 音量- (对应数字量输入9)
		"\x04\x00\x0D\x00", // 亮度+ (对应数字量输入10)
		"\x04\x00\x0E\x00", // 亮度- (对应数字量输入11)
		"\x04\x00\x0F\x00", // 列表循环 (对应数字量输入12)
		"\x04\x00\x0F\x01", // 单节目循环 (对应数字量输入13)
		"\x05\x00\x05\x00\x00", // 节目1 (对应数字量输入14)
		"\x05\x00\x05\x00\x01", // 节目2 (对应数字量输入15)
		"\x05\x00\x05\x00\x02", // 节目3 (对应数字量输入16)
		"\x05\x00\x05\x00\x03", // 节目4 (对应数字量输入17)
		"\x05\x00\x05\x00\x04", // 节目5 (对应数字量输入18)
		"\x05\x00\x05\x00\x05", // 节目6 (对应数字量输入19)
		"\x05\x00\x05\x00\x06", // 节目7 (对应数字量输入20)
		"\x05\x00\x05\x00\x07", // 节目8 (对应数字量输入21)
		"\x05\x00\x05\x00\x08", // 节目9 (对应数字量输入22)
		"\x05\x00\x05\x00\x09", // 节目10 (对应数字量输入23)
		"\x05\x00\x05\x00\x0A", // 节目11 (对应数字量输入24)
		"\x05\x00\x05\x00\x0B", // 节目12 (对应数字量输入25)
		"\x05\x00\x05\x00\x0C", // 节目13 (对应数字量输入26)
		"\x05\x00\x05\x00\x0D", // 节目14 (对应数字量输入27)
		"\x05\x00\x05\x00\x0E", // 节目15 (对应数字量输入28)
	]; // 初始化MRV对象

	var mrv = {
		Output: {
			Pos1: null, // 数字量输出
			Pos2: null, // 模拟量输出
		},
		PrivateInfo: {
			// 为了能正确保存本次状态供下次使用，我们需要先完整地从MPV中恢复上次的状态
			InputPreviousValue: {}, // 本次运行不需要读取，但需要正确回传
			OutputPreviousValue:
				(MPV.PrivateInfo && MPV.PrivateInfo.OutputPreviousValue) || {},
			PrevVolume:
				MPV.PrivateInfo && MPV.PrivateInfo.PrevVolume !== undefined
					? MPV.PrivateInfo.PrevVolume
					: -1,
		},
		Refresh: [],
		Token: MPV.Token,
	}; // 2. 检查并处理模拟量输入 (Pos29)

	var volInput = MPV.Input["Pos29"];
	// 检查Pos29是否存在且有合法的信号值
	if (
		volInput &&
		volInput.SignalValue !== null &&
		volInput.SignalValue !== undefined
	) {
		// --- 开始模拟量处理逻辑 ---
		// 只要模拟量输入有效，就认为它的优先级最高，处理完后必须直接返回。

		var raw = volInput.SignalValue;
		var norm = Math.max(0, Math.min(65535, raw)) / 65535;
		var vol = Math.round(norm * 100); // 只有当计算出的音量值与上次记录的值不同时，才发送指令

		if (mrv.PrivateInfo.PrevVolume !== vol) {
			var volumeCmd = new Uint8Array([0x05, 0x00, 0x08, 0x00, vol]);
			mrv.Output["Pos2"] = volumeCmd; // 输出到模拟量对应的Pos2
			mrv.Refresh.push("Pos2");
		}

		// 无论是否发送了指令，都需要更新“上一次音量”的记忆，为下一次比较做准备
		mrv.PrivateInfo.PrevVolume = vol;

		// 【关键修复】处理完模拟量逻辑后，直接返回，不再继续执行数字量逻辑
		return mrv;
	} else {
		// --- 开始数字量处理逻辑 ---
		// 只有当模拟量输入无效时，才进入这个分支来处理数字量输入

		// 为了实现“位置序号最大”的优先级，反向遍历
		for (var i = commands.length - 1; i >= 0; i--) {
			var inputName = "Pos" + (i + 1);
			if (MPV.Input[inputName] && MPV.Input[inputName].SignalValue === true) {
				mrv.Output["Pos1"] = stringToBytes(commands[i]); // 输出到数字量对应的Pos1
				mrv.Refresh.push("Pos1");

				// 【关键修复】找到一个触发后，也要立即返回，并带上当前的状态
				// 在返回前，需要更新PrivateInfo以保存本次的状态
				mrv.PrivateInfo.OutputPreviousValue.Pos1 = mrv.Output.Pos1;
				mrv.PrivateInfo.OutputPreviousValue.Pos2 = mrv.Output.Pos2;
				return mrv;
			}
		}
	}

	// 4. 如果没有任何信号触发，也要正确地返回MRV，并维持住上一次的状态
	// (通常在这种情况下，Output为空，Refresh为空)
	if (mrv.PrivateInfo.OutputPreviousValue) {
		mrv.Output.Pos1 = mrv.PrivateInfo.OutputPreviousValue.Pos1;
		mrv.Output.Pos2 = mrv.PrivateInfo.OutputPreviousValue.Pos2;
	}

	return mrv;
}
