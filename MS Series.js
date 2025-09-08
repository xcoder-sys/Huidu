/* �źŶ���ο�: 
   ����������: Pos1-Pos27 (ָ��)
   ���������: Pos1 (ָ��)
   �Ƴ������������������ڵ�����һ��ģ��
*/
exports.call = function (MPV) {
	var i;
	var command = null;
	var outputValue = null;

	// 1. ����ָ��ӳ��� (Pos1 - Pos27)�����滻Ϊ������ʵָ��
	var hardcodedCommands = {
		Pos1: "close computer:;", // �ػ�
		Pos2: "ppt up:;", // PPT up��
		Pos3: "ppt down:;", // PPT down��
		Pos4: "play current act:1;", // ���Ž�Ŀҳ1��ǰ��Ŀ
		Pos5: "pause current act:1;", // ��ͣ��Ŀҳ1��ǰ��Ŀ
		Pos6: "play current act:2;", // ���Ž�Ŀҳ2��ǰ��Ŀ
		Pos7: "pause current act:2;", // ��ͣ��Ŀҳ2��ǰ��Ŀ
		Pos8: "play act:1,1;", // ���Ž�Ŀҳ1�ĵ�1����Ŀ
		Pos9: "play act:1,2;",
		Pos10: "play act:1,3;",
		Pos11: "play act:1,4;",
		Pos12: "play act:1,5;",
		Pos13: "play act:1,6;",
		Pos14: "play act:1,7;",
		Pos15: "play act:1,8;",
		Pos16: "play act:1,9;",
		Pos17: "play act:1,10;",
		Pos18: "play act:2,1;",
		Pos19: "play act:2,2;",
		Pos20: "play act:2,3;",
		Pos21: "play act:2,4;",
		Pos22: "play act:2,5;",
		Pos23: "play act:2,6;",
		Pos24: "play act:2,7;",
		Pos25: "play act:2,8;",
		Pos26: "play act:2,9;",
		Pos27: "play act:2,10;",
	};

	// 2. ��MPV�л�ȡ�ϴε�״̬
	var previousInputValues =
		(MPV.PrivateInfo && MPV.PrivateInfo.InputPreviousValue) || {};
	var previousOutputValue =
		MPV.PrivateInfo &&
		MPV.PrivateInfo.OutputPreviousValue &&
		MPV.PrivateInfo.OutputPreviousValue.Pos1;

	// 3. �������������� (Pos1 - Pos27)
	// �����λ Pos27 ���¼�鵽 Pos1����ʵ�֡���λ���ȡ�
	for (i = 27; i >= 1; i--) {
		var pos = "Pos" + i;
		var hardcodedCommand = hardcodedCommands[pos];

		// ֻ����ָ����ж���Ķ˿ڲŽ��м��
		if (hardcodedCommand) {
			var currentInput = MPV.Input[pos];
			var isRisingEdge =
				currentInput &&
				currentInput.SignalValue === true &&
				!previousInputValues[pos]; // !undefined �� !false ��Ϊ true

			if (isRisingEdge) {
				command = hardcodedCommand;
				break; // �ҵ���һ��������ָ�����������ѭ��
			}
		}
	}

	// 4. ����ָ����±������ֵ
	if (command !== null) {
		outputValue = command;
	} else if (previousOutputValue) {
		// ���û����ָ�������һ�ε����
		outputValue = previousOutputValue;
	}

	// 5. ����������MRV����
	var mrv = {
		Output: { Pos1: outputValue },
		PrivateInfo: {
			InputPreviousValue: {},
			OutputPreviousValue: { Pos1: outputValue },
		},
		Refresh: command !== null ? ["Pos1"] : [],
		Token: MPV.Token,
	};

	// 6. ��¼������������״̬��������һ�ε���
	for (var inputPos in MPV.Input) {
		if (MPV.Input.hasOwnProperty(inputPos)) {
			mrv.PrivateInfo.InputPreviousValue[inputPos] =
				MPV.Input[inputPos].SignalValue;
		}
	}

	return mrv;
};
