/* MultiTriggerSerialSenderES5.js - ES5 ��׼ʵ�� */

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

	// ���������������λ���ǹ̶��� "serialOut" ��Ӧ�� Pos
	// ͨ�� SignalNameVSPos ����ȡ��� "serialOut" ��Ӧ�� Pos (���� "Pos1")
	var serialOutPos = "";
	if (
		MPV.SignalNameVSPos &&
		MPV.SignalNameVSPos.Output &&
		MPV.SignalNameVSPos.Output.serialOut
	) {
		serialOutPos = MPV.SignalNameVSPos.Output.serialOut;
	} else {
		// ����һ�����ף���� SignalNameVSPos û�ṩ serialOut ��λ�ã�
		// ��ٶ����λ���� "Pos1" �����ģ����ͼĬ�ϵĵ�һ�����λ
		// ��ʵ��Ӧ���У�����淶ǿ���ṩ SignalNameVSPos��������� else ��֧
		serialOutPos = "Pos1";
	}

	var valueToSend = ""; // �洢����Ҫ���͵��ַ���
	var outputTriggered = false; // ����Ƿ����κδ������������

	// 2. �������п��ܵ������ź� (trigger1, trigger2, ...)
	// ʹ�� for...in ѭ������ SignalNameVSPos.Input ����ȡ���������źŵ����ƺ�λ��
	var inputSignalsMap = MPV.SignalNameVSPos.Input;

	// ȷ�� inputSignalsMap �������Ƕ���
	if (inputSignalsMap && typeof inputSignalsMap === "object") {
		for (var signalName in inputSignalsMap) {
			// ȷ���Ƕ�����������ԣ�������ԭ�����ϵ�����
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
				// �״�ִ�л�û���ϴ�����ʱ��Ĭ���ϴ�Ϊ false
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
						// �����ˣ���ȡ��Ӧ�ľ�̬�����ַ���
						// ���� "trigger1" ��Ӧ "string1"
						var paramName = signalName.replace("trigger", "string");
						var paramPos = "";
						if (
							MPV.SignalNameVSPos &&
							MPV.SignalNameVSPos.StaticParameter &&
							MPV.SignalNameVSPos.StaticParameter[paramName]
						) {
							paramPos = MPV.SignalNameVSPos.StaticParameter[paramName];
						}

						var currentParamValue = "";
						if (
							MPV.StaticParameter &&
							MPV.StaticParameter[paramPos] &&
							typeof MPV.StaticParameter[paramPos].SignalValue !== "undefined"
						) {
							currentParamValue = MPV.StaticParameter[paramPos].SignalValue;
						}

						// ����ж������������ֻ���͵�һ���������ַ���
						if (!outputTriggered) {
							// ȷ��ֻ����һ��Ҫ���͵�ֵ
							valueToSend = currentParamValue;
							outputTriggered = true;
						}
					}
				}

				// 3. ��¼���������źŵ�״̬�� PrivateInfo�����´ε���ʹ��
				// �����Ƿ񴥷���ÿ�������źŵĵ�ǰ״̬����Ҫ����
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
		// ���û���κδ������������Ĭ�ϻ�գ��Ҳ����ˢ��
		MRV.Output[serialOutPos] = "";
	}

	// 5. ���� MRV
	return MRV;
};




