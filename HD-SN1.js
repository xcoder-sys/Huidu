/*
文件名称: Negative Ion Minimal Parser.js
功能: 被动接收并解析来自任意地址的HD-SN1传感器数据，仅输出数值。
*/

exports.call = function (MPV) {
	// 1. 初始化MRV对象
	var mrv = {
		Output: { Pos1: null },
		PrivateInfo: {
			OutputPreviousValue:
				(MPV.PrivateInfo && MPV.PrivateInfo.OutputPreviousValue) || {},
		},
		Refresh: [],
		Token: MPV.Token,
	};

	// 2. 获取输入
	var dataInput = MPV.Input["Pos1"];
	var newValue = null;

	// 3. 检查并处理传入的数据
	if (dataInput && dataInput.SignalValue) {
		var responseData = dataInput.SignalValue; // 应该是 Uint8Array

		// a. 验证数据帧的基本格式 (功能码为0x03，长度至少9字节)
		if (responseData && responseData.length >= 9 && responseData[1] === 0x03) {
			// b. 验证通过，解析数据
			// 数据区从第4个字节(索引3)开始，共4个字节
			var high1 = responseData[3];
			var high2 = responseData[4];
			var low1 = responseData[5];
			var low2 = responseData[6];

			// c. 组合成32位无符号整数，计算最终值
			var finalValue = (high1 << 24) | (high2 << 16) | (low1 << 8) | low2;

			newValue = finalValue;
		}
		// 如果数据格式不正确，则忽略，newValue 将保持 null
	}

	// 4. 设置输出
	if (newValue !== null) {
		mrv.Output.Pos1 = newValue;
		m.Refresh.push("Pos1");
	} else {
		// 如果没有新数据或数据无效，则维持上一次的输出值
		mrv.Output.Pos1 = mrv.PrivateInfo.OutputPreviousValue.Pos1;
	}

	// 5. 保存本次的输出状态，供下次维持
	mrv.PrivateInfo.OutputPreviousValue = {
		Pos1: mrv.Output.Pos1,
	};

	return mrv;
};
