/*
Date: 2025.9.3

文件名称: Audio Switcher (Simplified).js
功能: 音频处理器信号切换控制模块
信号：
  32个数字量输入：Pos1-Pos16 (音频输入信号), Pos17-Pos32 (输出通道)
  1个串行量输出：out$ (Pos1)

描述：
  模块按“选择音频输入 -> 选择输出通道”的顺序发送音频切换指令。
  指令格式为 "set|mixer03|输入通道.输出通道|mix:true;"
作者: XuDaShuai

版本说明: 基于M2后台1.6.2正式发行版
修改描述: 精简代码逻辑，将状态保存移至函数末尾
*/

exports.call = function (MPV) {
	var i;
	var inputPos;
	var command = null;

	// 1. 从MPV中获取上次的状态
	var lastSelectedInput =
		(MPV.PrivateInfo && MPV.PrivateInfo.lastSelectedInput) || null;
	var previousInputValues =
		(MPV.PrivateInfo && MPV.PrivateInfo.InputPreviousValue) || {};
	var previousOutputValue =
		MPV.PrivateInfo &&
		MPV.PrivateInfo.OutputPreviousValue &&
		MPV.PrivateInfo.OutputPreviousValue.Pos1;

	// 2. 检查是否选择了音频输入 (Pos1-Pos16)
	var inputSourceSelected = null;
	for (i = 1; i <= 16; i++) {
		inputPos = "Pos" + i;
		var isRisingEdge =
			MPV.Input[inputPos] &&
			MPV.Input[inputPos].SignalValue === true &&
			(previousInputValues[inputPos] === false ||
				previousInputValues[inputPos] === undefined);

		if (isRisingEdge) {
			inputSourceSelected = i; // 记录输入的编号
			break; // 只处理一个输入源
		}
	}

	// 3. 检查是否选择了输出通道 (Pos17-Pos32)
	var outputChannelSelected = null;
	for (i = 17; i <= 32; i++) {
		inputPos = "Pos" + i;
		var isRisingEdge =
			MPV.Input[inputPos] &&
			MPV.Input[inputPos].SignalValue === true &&
			(previousInputValues[inputPos] === false ||
				previousInputValues[inputPos] === undefined);

		if (isRisingEdge) {
			outputChannelSelected = i - 16; // 计算输出通道编号 (1-16)
			break;
		}
	}

	// 4. 根据输入状态生成指令
	if (lastSelectedInput !== null && outputChannelSelected !== null) {
		// 如果上次选择了输入，本次选择了输出，则生成指令
		command =
			"set|mixer03|" +
			lastSelectedInput +
			"." +
			outputChannelSelected +
			"|mix:true;";
		lastSelectedInput = null; // 重置状态
	} else if (inputSourceSelected !== null) {
		// 如果只选择了输入，则更新状态
		lastSelectedInput = inputSourceSelected;
	}

	// 5. 根据指令更新本次输出值
	var outputValue = command || previousOutputValue || null;

	// 6. 构建并返回MRV对象
	var mrv = {
		Output: { Pos1: outputValue },
		PrivateInfo: {
			InputPreviousValue: {},
			OutputPreviousValue: { Pos1: outputValue },
			lastSelectedInput: lastSelectedInput,
		},
		Refresh: command !== null ? ["Pos1"] : [],
		Token: MPV.Token,
	};

	// 7. 记录本次输入状态，用于下一次调用
	for (inputPos in MPV.Input) {
		if (MPV.Input.hasOwnProperty(inputPos)) {
			mrv.PrivateInfo.InputPreviousValue[inputPos] =
				MPV.Input[inputPos].SignalValue;
		}
	}

	return mrv;
};
