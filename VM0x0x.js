/**
 * 固定矩阵信号切换控制模块 (ES5 兼容版本)
 * - 输入 Pos1-16: HDMI输入信号选择
 * - 输入 Pos17-32: HDMI输出通道选择
 * - 输出 Pos1 (out$): 格式化后的切换指令, e.g., "(sw,1,1)"
 */
function call(MPV) {
    // 1. 初始化MRV对象
    var mrv = {
        Output: {
            Pos1: null
        },
        PrivateInfo: {
            // 从MPV恢复上一次的状态，如果不存在则使用默认值
            InputPreviousValue: (MPV.PrivateInfo && MPV.PrivateInfo.InputPreviousValue) || {},
            status: (MPV.PrivateInfo && MPV.PrivateInfo.status) || 'waiting_for_input',
            selected_input: (MPV.PrivateInfo && MPV.PrivateInfo.selected_input) || null
        },
        Refresh: [],
        Token: MPV.Token
    };

    // 标志位，用于判断本轮是否已有操作完成
    var actionTaken = false;

    // 2. 检查输出通道选择 (Pos17 - Pos32)，因为这是完成指令的最后一步
    // 只有在已选择输入源的状态下，检查输出才有意义
    if (mrv.PrivateInfo.status === 'waiting_for_output') {
        // 从高到低遍历，实现高位优先
        for (var i = 32; i >= 17; i--) {
            var outputPortName = "Pos" + i;
            var currentOutput = MPV.Input[outputPortName];

            if (currentOutput) {
                var isRisingEdge = currentOutput.SignalValue === true && !mrv.PrivateInfo.InputPreviousValue[outputPortName];
                if (isRisingEdge) {
                    // 触发成功！准备发送指令
                    var inputChannel = mrv.PrivateInfo.selected_input;
                    var outputChannel = i - 16; // Pos17 -> 1, Pos18 -> 2, ...

                    // 格式化指令
                    mrv.Output.Pos1 = "(sw," + inputChannel + "," + outputChannel + ")";
                    mrv.Refresh.push("Pos1");

                    // 重置状态机，为下一次操作做准备
                    mrv.PrivateInfo.status = 'waiting_for_input';
                    mrv.PrivateInfo.selected_input = null;
                    
                    actionTaken = true;
                    break; // 完成操作，跳出循环
                }
            }
        }
    }

    // 3. 如果本轮没有发送指令，则检查输入信号选择 (Pos1 - Pos16)
    if (!actionTaken) {
        // 从高到低遍历，实现高位优先
        for (var j = 16; j >= 1; j--) {
            var inputPortName = "Pos" + j;
            var currentInput = MPV.Input[inputPortName];

            if (currentInput) {
                var isRisingEdge = currentInput.SignalValue === true && !mrv.PrivateInfo.InputPreviousValue[inputPortName];
                if (isRisingEdge) {
                    // 选择了新的输入源
                    mrv.PrivateInfo.status = 'waiting_for_output';
                    mrv.PrivateInfo.selected_input = j; // Pos1 -> 1, Pos2 -> 2, ...
                    
                    // 注意：此步骤不发送指令，只是更新状态
                    break; // 完成操作，跳出循环
                }
            }
        }
    }

    // 4. 状态保存：无论是否触发，都需要保存本次所有32个输入的状态，供下次比较
    for (var k = 1; k <= 32; k++) {
        var portName = "Pos" + k;
        var input = MPV.Input[portName];
        mrv.PrivateInfo.InputPreviousValue[portName] = input ? input.SignalValue : false;
    }

    // 5. 返回结果
    return mrv;
}