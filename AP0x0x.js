/*
Date: 2025.9.8 (�޸İ�)

�ļ�����: Audio Switcher (Advanced).js
����: ��Ƶ�������ź��л�����ģ�飬֧���л����Զ��������ͨ����
�źţ�
? 32�����������룺Pos1-Pos16 (��Ƶ�����ź�), Pos17-Pos32 (���ͨ��)
? 1�������������out$ (Pos1)

������
? 1. ����ѡ����Ƶ���� -> ѡ�����ͨ������˳���� "mix:true" ָ�
? 2. ���ͳɹ���ģ����Զ��������״̬��ÿ��Լ0.1�뷢��һ�� "mix:false" ָ�
? ?  �Թرո����ͨ���ϵ��������������źš�
	issue:�ӳٷ��Ͳ���Ч

����: XuDaShuai 
�汾˵��: ����M2��̨1.6.2��ʽ���а�
*/

exports.call = function (MPV) {
	var i;
	var inputPos;
	var command = null;

	// 1. ��MPV�л�ȡ�ϴε�״̬
	var previousInputValues =
		(MPV.PrivateInfo && MPV.PrivateInfo.InputPreviousValue) || {};
	var mrv = {
		Output: { Pos1: null },
		PrivateInfo: {
			InputPreviousValue: {},
			OutputPreviousValue: (MPV.PrivateInfo &&
				MPV.PrivateInfo.OutputPreviousValue) || { Pos1: null },
			// �����µ�״̬�����ֶ�
			status: (MPV.PrivateInfo && MPV.PrivateInfo.status) || "idle", // idle, input_selected, clearing_output
			selectedInput: (MPV.PrivateInfo && MPV.PrivateInfo.selectedInput) || null,
			clearInfo: (MPV.PrivateInfo && MPV.PrivateInfo.clearInfo) || null, // { activatedInput, outputChannel, nextToClear }
		},
		Refresh: [],
		Token: MPV.Token,
	};

	// ==============================================================================
	//  �����߼�: ״̬������
	// ==============================================================================

	// ���� A: �����ǰ״̬�ǡ�����������������ȴ����������
	if (mrv.PrivateInfo.status === "clearing_output") {
		var info = mrv.PrivateInfo.clearInfo;
		var nextToClear = info.nextToClear;

		// �����Ǹ��ոձ����������ͨ��
		if (nextToClear === info.activatedInput) {
			nextToClear++;
		}

		if (nextToClear <= 16) {
			// ���� "mix:false" ָ��
			command =
				"set|mixer03|" + nextToClear + "." + info.outputChannel + "|mix:false;";

			// ����״̬��׼�������һ��
			info.nextToClear = nextToClear + 1;
			mrv.PrivateInfo.clearInfo = info;

			// ���ؼ�������������100ms���ٴε��ñ�ģ��
			mrv.RequestDelayedExecution = { delay_ms: 100 };
		} else {
			// ����ͨ�����������ϣ�����״̬��
			mrv.PrivateInfo.status = "idle";
			mrv.PrivateInfo.clearInfo = null;
		}
	} else {
		// ���� B: ���򣬴����û���ʵʱ����
		// ����Ƿ������ͨ����ѡ�� (Pos17-Pos32)
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

		// ����Ƿ�������Դ��ѡ�� (Pos1-Pos16)
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

		// �����û�����������������Ϊ
		if (
			mrv.PrivateInfo.status === "input_selected" &&
			outputChannelSelected !== null
		) {
			// ���1: ��ѡ�����룬������ѡ������� -> ���� "mix:true" ָ���ʼ�������
			var selectedInput = mrv.PrivateInfo.selectedInput;
			command =
				"set|mixer03|" +
				selectedInput +
				"." +
				outputChannelSelected +
				"|mix:true;";

			// ��ʼ���������
			mrv.PrivateInfo.status = "clearing_output";
			mrv.PrivateInfo.clearInfo = {
				activatedInput: selectedInput,
				outputChannel: outputChannelSelected,
				nextToClear: 1, // �ӵ�һ�����뿪ʼ���
			};
			mrv.PrivateInfo.selectedInput = null;

			// ���ؼ�������������100ms����ã��Է��͵�һ�� "mix:false" ָ��
			mrv.RequestDelayedExecution = { delay_ms: 100 };
		} else if (inputSourceSelected !== null) {
			// ���2: �û�ѡ����һ���µ����� -> ����״̬
			mrv.PrivateInfo.status = "input_selected";
			mrv.PrivateInfo.selectedInput = inputSourceSelected;
		}
	}

	// �������ֵ��Refresh״̬
	if (command !== null) {
		mrv.Output.Pos1 = command;
		mrv.Refresh.push("Pos1");
	} else {
		mrv.Output.Pos1 = mrv.PrivateInfo.OutputPreviousValue.Pos1;
	}
	mrv.PrivateInfo.OutputPreviousValue.Pos1 = mrv.Output.Pos1;

	// ��¼������������״̬��������һ�ε���
	for (inputPos in MPV.Input) {
		if (MPV.Input.hasOwnProperty(inputPos)) {
			mrv.PrivateInfo.InputPreviousValue[inputPos] =
				MPV.Input[inputPos].SignalValue;
		}
	}

	return mrv;
};
