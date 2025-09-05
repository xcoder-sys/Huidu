/*
Date: 2025.9.3

�ļ�����: Audio Mute.js
����: ������Ƶ���������ͨ������/ȡ������
�źţ�
  32�����������룺Pos1-Pos16 (����), Pos17-Pos32 (ȡ������)
  1�������������out$ (Pos1)

������
  ģ���������������������أ����;���ָ�
  Pos1-16��Ӧmute:true��Pos17-32��Ӧmute:false��
����: XuDaShuai

�汾˵��: ����M2��̨1.6.2��ʽ���а�
�޸�����: ʵ����Ƶ��������ģ��
*/

exports.call = function (MPV) {
	var i;
	var inputPos;
	var command = null;

	// 1. ��MPV�л�ȡ�ϴε�״̬
	var previousInputValues =
		(MPV.PrivateInfo && MPV.PrivateInfo.InputPreviousValue) || {};
	var previousOutputValue =
		MPV.PrivateInfo &&
		MPV.PrivateInfo.OutputPreviousValue &&
		MPV.PrivateInfo.OutputPreviousValue.Pos1;

	// 2. ����Ƿ������������뱻����
	// ���������ʵ�֡�λ�������󡱵����ȼ�
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
				// ��Ӧ����ָ��
				var channel = posNumber;
				command = "set|gain02|" + channel + "|mute:true;";
			} else if (posNumber >= 17 && posNumber <= 32) {
				// ��Ӧȡ������ָ��
				var channel = posNumber - 16;
				command = "set|gain02|" + channel + "|mute:false;";
			}

			// �ҵ������������˳�ѭ��
			break;
		}
	}

	// 3. ����ָ����±������ֵ
	var outputValue = command || previousOutputValue || null;

	// 4. ����������MRV����
	var mrv = {
		Output: { Pos1: outputValue },
		PrivateInfo: {
			InputPreviousValue: {},
			OutputPreviousValue: { Pos1: outputValue },
		},
		Refresh: command !== null ? ["Pos1"] : [],
		Token: MPV.Token,
	};

	// 5. ��¼��������״̬��������һ�ε���
	for (var inputPos in MPV.Input) {
		if (MPV.Input.hasOwnProperty(inputPos)) {
			mrv.PrivateInfo.InputPreviousValue[inputPos] =
				MPV.Input[inputPos].SignalValue;
		}
	}

	return mrv;
};
