/*
Date: 2025.9.8 (修改版)

文件名称: Audio Switcher (Advanced).js
功能: 音频处理器信号切换控制模块，支持切换后自动清除其他通道。
信号：
? 32个数字量输入：Pos1-Pos16 (音频输入信号), Pos17-Pos32 (输出通道)
? 1个串行量输出：out$ (Pos1)

描述：
? 1. 按“选择音频输入 -> 选择输出通道”的顺序发送 "mix:true" 指令。
? 2. 发送成功后，模块会自动进入清除状态，每隔约0.1秒发送一条 "mix:false" 指令，
? ?  以关闭该输出通道上的其他所有输入信号。
	issue:延迟发送不生效

作者: XuDaShuai 
版本说明: 基于M2后台1.6.2正式发行版
*/

exports.call = function (MPV) {
	var i;
	var inputPos;
	var command = null;

	// 1. 从MPV中获取上次的状态
	var previousInputValues =
		(MPV.PrivateInfo && MPV.PrivateInfo.InputPreviousValue) || {};
	var mrv = {
		Output: { Pos1: null },
		PrivateInfo: {
			InputPreviousValue: {},
			OutputPreviousValue: (MPV.PrivateInfo &&
				MPV.PrivateInfo.OutputPreviousValue) || { Pos1: null },
			// 引入新的状态管理字段
			status: (MPV.PrivateInfo && MPV.PrivateInfo.status) || "idle", // idle, input_selected, clearing_output
			selectedInput: (MPV.PrivateInfo && MPV.PrivateInfo.selectedInput) || null,
			clearInfo: (MPV.PrivateInfo && MPV.PrivateInfo.clearInfo) || null, // { activatedInput, outputChannel, nextToClear }
		},
		Refresh: [],
		Token: MPV.Token,
	};

	// ==============================================================================
	//  核心逻辑: 状态机处理
	// ==============================================================================

	// 步骤 A: 如果当前状态是“正在清除”，则优先处理清除任务
	if (mrv.PrivateInfo.status === "clearing_output") {
		var info = mrv.PrivateInfo.clearInfo;
		var nextToClear = info.nextToClear;

		// 跳过那个刚刚被激活的输入通道
		if (nextToClear === info.activatedInput) {
			nextToClear++;
		}

		if (nextToClear <= 16) {
			// 生成 "mix:false" 指令
			command =
				"set|mixer03|" + nextToClear + "." + info.outputChannel + "|mix:false;";

			// 更新状态，准备清除下一个
			info.nextToClear = nextToClear + 1;
			mrv.PrivateInfo.clearInfo = info;

			// 【关键】请求宿主在100ms后再次调用本模块
			mrv.RequestDelayedExecution = { delay_ms: 100 };
		} else {
			// 所有通道都已清除完毕，重置状态机
			mrv.PrivateInfo.status = "idle";
			mrv.PrivateInfo.clearInfo = null;
		}
	} else {
		// 步骤 B: 否则，处理用户的实时输入
		// 检查是否有输出通道被选择 (Pos17-Pos32)
		var outputChannelSelected = null;
		for (i = 17; i <= 32; i++) {
			inputPos = "Pos" + i;
			if (
				MPV.Input[inputPos] &&
				MPV.Input[inputPos].SignalValue === true &&
				!previousInputValues[inputPos]
			) {
				outputChannelSelected = i - 16;
				break;
			}
		}

		// 检查是否有输入源被选择 (Pos1-Pos16)
		var inputSourceSelected = null;
		for (i = 1; i <= 16; i++) {
			inputPos = "Pos" + i;
			if (
				MPV.Input[inputPos] &&
				MPV.Input[inputPos].SignalValue === true &&
				!previousInputValues[inputPos]
			) {
				inputSourceSelected = i;
				break;
			}
		}

		// 根据用户的两步操作决定行为
		if (
			mrv.PrivateInfo.status === "input_selected" &&
			outputChannelSelected !== null
		) {
			// 情况1: 已选择输入，现在又选择了输出 -> 发送 "mix:true" 指令并开始清除流程
			var selectedInput = mrv.PrivateInfo.selectedInput;
			command =
				"set|mixer03|" +
				selectedInput +
				"." +
				outputChannelSelected +
				"|mix:true;";

			// 初始化清除流程
			mrv.PrivateInfo.status = "clearing_output";
			mrv.PrivateInfo.clearInfo = {
				activatedInput: selectedInput,
				outputChannel: outputChannelSelected,
				nextToClear: 1, // 从第一个输入开始检查
			};
			mrv.PrivateInfo.selectedInput = null;

			// 【关键】请求宿主在100ms后调用，以发送第一条 "mix:false" 指令
			mrv.RequestDelayedExecution = { delay_ms: 100 };
		} else if (inputSourceSelected !== null) {
			// 情况2: 用户选择了一个新的输入 -> 更新状态
			mrv.PrivateInfo.status = "input_selected";
			mrv.PrivateInfo.selectedInput = inputSourceSelected;
		}
	}

	// 更新输出值和Refresh状态
	if (command !== null) {
		mrv.Output.Pos1 = command;
		mrv.Refresh.push("Pos1");
	} else {
		mrv.Output.Pos1 = mrv.PrivateInfo.OutputPreviousValue.Pos1;
	}
	mrv.PrivateInfo.OutputPreviousValue.Pos1 = mrv.Output.Pos1;

	// 记录本次所有输入状态，用于下一次调用
	for (inputPos in MPV.Input) {
		if (MPV.Input.hasOwnProperty(inputPos)) {
			mrv.PrivateInfo.InputPreviousValue[inputPos] =
				MPV.Input[inputPos].SignalValue;
		}
	}

	return mrv;
};
