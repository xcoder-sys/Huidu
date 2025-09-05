/*
Date: 2025.9.3

�ļ�����: Audio Switcher (Simplified).js
����: ��Ƶ�������ź��л�����ģ��
�źţ�
  32�����������룺Pos1-Pos16 (��Ƶ�����ź�), Pos17-Pos32 (���ͨ��)
  1�������������out$ (Pos1)

������
  ģ�鰴��ѡ����Ƶ���� -> ѡ�����ͨ������˳������Ƶ�л�ָ�
  ָ���ʽΪ "set|mixer03|����ͨ��.���ͨ��|mix:true;"
����: XuDaShuai

�汾˵��: ����M2��̨1.6.2��ʽ���а�
�޸�����: ��������߼�����״̬������������ĩβ
*/

exports.call = function (MPV) {
	var i;
	var inputPos;
	var command = null;

	// 1. ��MPV�л�ȡ�ϴε�״̬
	var lastSelectedInput =
		(MPV.PrivateInfo && MPV.PrivateInfo.lastSelectedInput) || null;
	var previousInputValues =
		(MPV.PrivateInfo && MPV.PrivateInfo.InputPreviousValue) || {};
	var previousOutputValue =
		MPV.PrivateInfo &&
		MPV.PrivateInfo.OutputPreviousValue &&
		MPV.PrivateInfo.OutputPreviousValue.Pos1;

	// 2. ����Ƿ�ѡ������Ƶ���� (Pos1-Pos16)
	var inputSourceSelected = null;
	for (i = 1; i <= 16; i++) {
		inputPos = "Pos" + i;
		var isRisingEdge =
			MPV.Input[inputPos] &&
			MPV.Input[inputPos].SignalValue === true &&
			(previousInputValues[inputPos] === false ||
				previousInputValues[inputPos] === undefined);

		if (isRisingEdge) {
			inputSourceSelected = i; // ��¼����ı��
			break; // ֻ����һ������Դ
		}
	}

	// 3. ����Ƿ�ѡ�������ͨ�� (Pos17-Pos32)
	var outputChannelSelected = null;
	for (i = 17; i <= 32; i++) {
		inputPos = "Pos" + i;
		var isRisingEdge =
			MPV.Input[inputPos] &&
			MPV.Input[inputPos].SignalValue === true &&
			(previousInputValues[inputPos] === false ||
				previousInputValues[inputPos] === undefined);

		if (isRisingEdge) {
			outputChannelSelected = i - 16; // �������ͨ����� (1-16)
			break;
		}
	}

	// 4. ��������״̬����ָ��
	if (lastSelectedInput !== null && outputChannelSelected !== null) {
		// ����ϴ�ѡ�������룬����ѡ���������������ָ��
		command =
			"set|mixer03|" +
			lastSelectedInput +
			"." +
			outputChannelSelected +
			"|mix:true;";
		lastSelectedInput = null; // ����״̬
	} else if (inputSourceSelected !== null) {
		// ���ֻѡ�������룬�����״̬
		lastSelectedInput = inputSourceSelected;
	}

	// 5. ����ָ����±������ֵ
	var outputValue = command || previousOutputValue || null;

	// 6. ����������MRV����
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

	// 7. ��¼��������״̬��������һ�ε���
	for (inputPos in MPV.Input) {
		if (MPV.Input.hasOwnProperty(inputPos)) {
			mrv.PrivateInfo.InputPreviousValue[inputPos] =
				MPV.Input[inputPos].SignalValue;
		}
	}

	return mrv;
};
