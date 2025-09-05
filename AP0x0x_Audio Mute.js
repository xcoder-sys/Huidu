/*
Date: 2025.9.3

文件名称: Audio Mute.js
功能: 控制音频处理器输出通道静音/取消静音
信号：
  32个数字量输入：Pos1-Pos16 (静音), Pos17-Pos32 (取消静音)
  1个串行量输出：out$ (Pos1)

描述：
  模块根据数字量输入的上升沿，发送静音指令。
  Pos1-16对应mute:true；Pos17-32对应mute:false。
作者: XuDaShuai

版本说明: 基于M2后台1.6.2正式发行版
修改描述: 实现音频静音控制模块
*/

exports.call = function (MPV) {
	var i;
	var inputPos;
	var command = null;

	// 1. 从MPV中获取上次的状态
	var previousInputValues =
		(MPV.PrivateInfo && MPV.PrivateInfo.InputPreviousValue) || {};
	var previousOutputValue =
		MPV.PrivateInfo &&
		MPV.PrivateInfo.OutputPreviousValue &&
		MPV.PrivateInfo.OutputPreviousValue.Pos1;

	// 2. 检查是否有数字量输入被触发
	// 反向遍历以实现“位置序号最大”的优先级
	var orderedPositions = Object.keys(MPV.Input).sort(function (a, b) {
		return parseInt(b.substring(3)) - parseInt(a.substring(3));
	});

	for (i = 0; i < orderedPositions.length; i++) {
		var pos = orderedPositions[i];
		var posNumber = parseInt(pos.substring(3));

		var isRisingEdge =
			MPV.Input[pos] &&
			MPV.Input[pos].SignalValue === true &&
			(previousInputValues[pos] === false ||
				previousInputValues[pos] === undefined);

		if (isRisingEdge) {
			if (posNumber >= 1 && posNumber <= 16) {
				// 对应静音指令
				var channel = posNumber;
				command = "set|gain02|" + channel + "|mute:true;";
			} else if (posNumber >= 17 && posNumber <= 32) {
				// 对应取消静音指令
				var channel = posNumber - 16;
				command = "set|gain02|" + channel + "|mute:false;";
			}

			// 找到触发后，立即退出循环
			break;
		}
	}

	// 3. 根据指令更新本次输出值
	var outputValue = command || previousOutputValue || null;

	// 4. 构建并返回MRV对象
	var mrv = {
		Output: { Pos1: outputValue },
		PrivateInfo: {
			InputPreviousValue: {},
			OutputPreviousValue: { Pos1: outputValue },
		},
		Refresh: command !== null ? ["Pos1"] : [],
		Token: MPV.Token,
	};

	// 5. 记录本次输入状态，用于下一次调用
	for (var inputPos in MPV.Input) {
		if (MPV.Input.hasOwnProperty(inputPos)) {
			mrv.PrivateInfo.InputPreviousValue[inputPos] =
				MPV.Input[inputPos].SignalValue;
		}
	}

	return mrv;
};
