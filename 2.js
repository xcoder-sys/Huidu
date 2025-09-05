/* HardcodedMultiTriggerSender.js - ES5 ��׼ʵ�� */

exports.call = function (MPV) {
	// 1. ��ʼ�� MRV ���ض���
	var MRV = {
		Output: {},
		PrivateInfo: {
			InputPreviousValue: {}, // ���ڴ洢���д����źŵ��ϴ�״̬
		},
		Refresh: [],
		Token: MPV.Token || "", // ȷ�� Token ���Ǳ����ݣ���� MPV.Token ������������ַ���
	};

	// --- �����ﶨ�����Ӳ�����ַ������� ---
	// ���������źŵ����� (���� "trigger1", "trigger2")
	// ֵ�ǵ����źŴ���ʱҪ���͵��ַ���
	var hardcodedStrings = {
		trigger1: "Hello from Button 1",
		trigger2: "Action confirmed!",
		trigger3: "Warning: Temperature High",
		trigger4: "System Reset Initiated",
		// �������������Ӹ��� "triggerX": "��Ӧ���ַ���"
		// ȷ����Щ��������ģ����ͼ�ж���������ź�����һ��
	};
	// ------------------------------------

	// ��ȡ��� "serialOut" ��Ӧ�� Pos (���� "Pos1")
	var serialOutPos = "";
	if (
		MPV.SignalNameVSPos &&
		MPV.SignalNameVSPos.Output &&
		MPV.SignalNameVSPos.Output.serialOut
	) {
		serialOutPos = MPV.SignalNameVSPos.Output.serialOut;
	} else {
		// ���׷�������� SignalNameVSPos û�ṩ���������λ���� "Pos1"
		serialOutPos = "Pos1";
	}

	var valueToSend = ""; // �洢����Ҫ���͵��ַ���
	var outputTriggered = false; // ����Ƿ����κδ������������

	// 2. �������п��ܵ������ź� (trigger1, trigger2, ...)
	var inputSignalsMap = MPV.SignalNameVSPos.Input;

	if (inputSignalsMap && typeof inputSignalsMap === "object") {
		for (var signalName in inputSignalsMap) {
			if (Object.prototype.hasOwnProperty.call(inputSignalsMap, signalName)) {
				var currentInputPos = inputSignalsMap[signalName]; // ��ǰ����� Pos ��ʶ�� (�� "Pos1")

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

				// ��鵱ǰ�����ź��Ƿ��ڱ���ˢ���б��� (ES5 ʵ�� includes)
				var isRefreshed = false;
				if (MPV.Refresh && Array.isArray(MPV.Refresh)) {
					for (var i = 0; i < MPV.Refresh.length; i++) {
						if (MPV.Refresh[i] === currentInputPos) {
							isRefreshed = true;
							break;
						}
					}
				}

				if (isRefreshed) {
					// �ж������أ���ǰΪ true ���ϴ�Ϊ false
					if (currentTriggerValue === true && previousTriggerValue === false) {
						// �����ˣ���Ӳ����� hardcodedStrings �����л�ȡ��Ӧ���ַ���
						// ֻ�е� hardcodedStrings �д������ signalName ��Ӧ���ַ���ʱ�Ÿ�ֵ
						if (hardcodedStrings.hasOwnProperty(signalName)) {
							// ����ж������������ֻ���͵�һ���������ַ���
							if (!outputTriggered) {
								// ȷ��ֻ����һ��Ҫ���͵�ֵ
								valueToSend = hardcodedStrings[signalName];
								outputTriggered = true;
							}
						}
					}
				}

				// 3. ��¼���������źŵ�״̬�� PrivateInfo�����´ε���ʹ��
				MRV.PrivateInfo.InputPreviousValue[currentInputPos] =
					currentTriggerValue;
			}
		}
	}

	// 4. �����Ƿ񴥷������������
	if (outputTriggered) {
		MRV.Output[serialOutPos] = valueToSend; // ���ռ������ַ�����������˿�
		MRV.Refresh.push(serialOutPos); // �������˿���ˢ��
	} else {
		MRV.Output[serialOutPos] = ""; // ���û���κδ��������Ϊ��
	}

	// 5. ���� MRV
	return MRV;
};
