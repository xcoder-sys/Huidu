
function call(MPV) {
	/* ��������MRV�������ݸ�ʽ���� */
	var MRV = {
		/*������ݣ�����������ź�λ�ú�ֵ*/
		Output: {},
		/* ģ���ڲ�˽�����ݴ洢�ṹ */
		PrivateInfo: {
			OutputPreviousValue: {},
		},
		/* ���ˢ���ź�λ�� */
		Refresh: [],
		Token: "",
	};

	// --- �����ﶨ�����Ӳ����ָ���ַ��� ---
	// ���������źŵ����� (���� "trigger1", "trigger2")
	// ֵ�ǵ����źŴ���ʱҪ���͵��ַ���ָ��
	var hardcodedCommands = {
		trigger1: "START_PROCESS_A",
		trigger2: "STOP_PROCESS_B",
		trigger3: "RESET_SYSTEM",
		// �������������Ӹ��� "triggerX": "��Ӧ��ָ��"
	};
	// ------------------------------------

	// ��ȡ��� "commandOut" ��Ӧ�� Pos (���� "Pos1")
	var commandOutPos = "";
	if (
		MPV.SignalNameVSPos &&
		MPV.SignalNameVSPos.Output &&
		MPV.SignalNameVSPos.Output.commandOut
	) {
		commandOutPos = MPV.SignalNameVSPos.Output.commandOut;
	} else {
		commandOutPos = "Pos1";
	}

	var commandToSend = ""; // �洢����Ҫ���͵�ָ���ַ���
	var outputTriggered = false; // ����Ƿ����κδ������������

	// 2. �������п��ܵ������ź�
	var inputSignalsMap = MPV.SignalNameVSPos.Input;

	if (inputSignalsMap && typeof inputSignalsMap === "object") {
		for (var signalName in inputSignalsMap) {
			if (Object.prototype.hasOwnProperty.call(inputSignalsMap, signalName)) {
				var currentInputPos = inputSignalsMap[signalName];

				// ��׳�ػ�ȡ��ǰ�����źŵ�ֵ
				var currentTriggerValue = false;
				if (
					MPV.Input &&
					MPV.Input[currentInputPos] &&
					typeof MPV.Input[currentInputPos].SignalValue !== "undefined"
				) {
					currentTriggerValue = MPV.Input[currentInputPos].SignalValue;
				}

				// ��׳�ػ�ȡ�ϴ������źŵ�ֵ
				var previousTriggerValue = false;
				if (
					MPV.PrivateInfo &&
					MPV.PrivateInfo.InputPreviousValue &&
					typeof MPV.PrivateInfo.InputPreviousValue[currentInputPos] !==
						"undefined"
				) {
					previousTriggerValue =
						MPV.PrivateInfo.InputPreviousValue[currentInputPos];
				}

				// ��鵱ǰ�����ź��Ƿ��ڱ���ˢ���б���
				var isRefreshed = false;
				if (MPV.Refresh && Array.isArray(MPV.Refresh)) {
					for (var i = 0; i < MPV.Refresh.length; i++) {
						if (MPV.Refresh[i] === currentInputPos) {
							isRefreshed = true;
							break;
						}
					}
				}

				// 3. �ж������ز���ȡָ��
				if (isRefreshed) {
					if (currentTriggerValue === true && previousTriggerValue === false) {
						// ��⵽�����أ���Ӳ��������л�ȡָ��
						if (hardcodedCommands.hasOwnProperty(signalName)) {
							// ����ж��������ֻ���͵�һ�����ֵ�ָ��
							if (!outputTriggered) {
								commandToSend = hardcodedCommands[signalName];
								outputTriggered = true;
							}
						}
					}
				}

				// 4. ��¼���������źŵ�״̬�� PrivateInfo�����´ε���ʹ��
				MRV.PrivateInfo.InputPreviousValue[currentInputPos] =
					currentTriggerValue;
			}
		}
	}

	// 5. �����Ƿ񴥷������������
	if (outputTriggered) {
		MRV.Output[commandOutPos] = commandToSend;
		MRV.Refresh.push(commandOutPos);
	} else {
		MRV.Output[commandOutPos] = "";
	}

	// 6. ���� MRV
	return MRV;
}
