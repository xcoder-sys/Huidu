/**
 * Win关机、音量调节模块：支持上升沿触发关机和变化量触发的音量调节。
 * * 输入:
 * - Pos1 (digital): 关机触发信号。上升沿有效。
 * - Pos2 (analog): 音量调节信号，范围 0-65535。
 * * 输出:
 * - Pos1 (serial): 发送给LCD的控制指令字节数组。
 */
function call(MPV) {
    // 1. 初始化MRV（模块返回值）对象
    var mrv = {
        Output: {
            Pos1: null
        },
        PrivateInfo: {
            // 从MPV中恢复上一次的输入/输出状态，如果不存在则使用默认值
            InputPreviousValue: (MPV.PrivateInfo && MPV.PrivateInfo.InputPreviousValue) || {},
            OutputPreviousValue: (MPV.PrivateInfo && MPV.PrivateInfo.OutputPreviousValue) || {},
            // 自定义私有变量，用于存储上一次的音量值，-1代表初始状态
            PrevVolume: (MPV.PrivateInfo && MPV.PrivateInfo.PrevVolume !== undefined) ? MPV.PrivateInfo.PrevVolume : -1
        },
        Refresh: [],
        Token: MPV.Token,
    };

    // 2. 获取当前输入信号
    var shutdownInput = MPV.Input["Pos1"];
    var volumeInput = MPV.Input["Pos2"];

    // 3. 优先处理关机指令（数字量）
    if (shutdownInput) {
        var currentValue = shutdownInput.SignalValue;
        // !!确保即使上次的值是null或undefined，也能安全地转为false
        var previousValue = !!mrv.PrivateInfo.InputPreviousValue["Pos1"];

        // 上升沿检测：当前为true，且上一次为false
        if (currentValue === true && previousValue === false) {
            // 构建关机指令 (06 00 01 00 00 00)
            mrv.Output.Pos1 = new Uint8Array([0x06, 0x00, 0x01, 0x00, 0x00, 0x00]);
            mrv.Refresh.push("Pos1");
            
            // 更新本次输入状态到PrivateInfo，供下次使用
            mrv.PrivateInfo.InputPreviousValue["Pos1"] = currentValue;
            // 关机指令已发出，直接返回，不再处理音量
            return mrv;
        }
    }

    // 4. 如果没有触发关机，则处理音量调节（模拟量）
    if (volumeInput && volumeInput.SignalValue !== null && volumeInput.SignalValue !== undefined) {
        var rawValue = volumeInput.SignalValue;
        // 将 0-65535 的模拟量值转换为 0-100 的音量百分比
        var normalized = Math.max(0, Math.min(65535, rawValue)) / 65535;
        var currentVolume = Math.round(normalized * 100);

        // 仅当音量发生变化时才发送指令
        if (currentVolume !== mrv.PrivateInfo.PrevVolume) {
            // 构建音量指令 (06 00 02 00 [音量] 00)
            mrv.Output.Pos1 = new Uint8Array([0x06, 0x00, 0x02, 0x00, currentVolume, 0x00]);
            mrv.Refresh.push("Pos1");

            // 更新本次音量值到PrivateInfo，供下次比较
            mrv.PrivateInfo.PrevVolume = currentVolume;
        }
    }

    // 5. 在函数末尾，统一更新所有输入状态的“记忆”，为下一次运行做准备
    if (shutdownInput) {
        mrv.PrivateInfo.InputPreviousValue["Pos1"] = shutdownInput.SignalValue;
    }
    // 如果音量值也需要被记录（即使它没变），也可以在这里更新
    if (volumeInput && volumeInput.SignalValue !== null && volumeInput.SignalValue !== undefined) {
        var rawValueOnExit = volumeInput.SignalValue;
        var normalizedOnExit = Math.max(0, Math.min(65535, rawValueOnExit)) / 65535;
        mrv.PrivateInfo.PrevVolume = Math.round(normalizedOnExit * 100);
    }


    // 返回最终结果
    return mrv;
}
