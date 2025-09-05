/* �źŶ���ο�: 
? ?ģ��������: Pos1 (����ֵ, 0-65535) 
? ?
? ?����������: Pos2-PosN (��Ŀָ��)
   
   �����⣬��Ҫ�ֶ���������������ָ��Ż���Ч
*/
exports.call = function (MPV) {
	var i;
	var command = null;
	var outputValue = null;

	// 1. ������ȫӲ�����ָ��ӳ���
	var hardcodedCommands = {
		//��Ŀ���ͽ�Ŀҳ����Ҫ������
		Pos2: "close computer:;", //�ػ�
		Pos3: "ppt up:;", //PPT up��
		Pos4: "ppt down:;", //PPT down��
		Pos5: "play current act:1;", //���Ž�Ŀҳ1��ǰ��Ŀ
		Pos6: "pause current act:1;", //��ͣ��Ŀҳ1��ǰ��Ŀ
		Pos7: "play current act:2;", //���Ž�Ŀҳ2��ǰ��Ŀ
		Pos8: "pause current act:2;", //��ͣ��Ŀҳ2��ǰ��Ŀ
		Pos9: "play act:1,1;", //���Ž�Ŀҳ1�ĵ�1����Ŀ
		Pos10: "play act:1,2;",
		Pos11: "play act:1,3;",
		Pos12: "play act:1,4;",
		Pos13: "play act:1,5;",
		Pos14: "play act:1,6;",
		Pos15: "play act:1,7;",
		Pos16: "play act:1,8;",
		Pos17: "play act:1,9;",
		Pos18: "play act:1,10;",
		Pos19: "play act:2,1;",
		Pos20: "play act:2,2;",
		Pos21: "play act:2,3;",
		Pos22: "play act:2,4;",
		Pos23: "play act:2,5;",
		Pos24: "play act:2,6;",
		Pos25: "play act:2,7;",
		Pos26: "play act:2,8;",
		Pos27: "play act:2,9;",
		Pos28: "play act:2,10;",
	};

	// 2. ��MPV�л�ȡ�ϴε�״̬
	var previousInputValues =
		(MPV.PrivateInfo && MPV.PrivateInfo.InputPreviousValue) || {};
	var prevVolume = (MPV.PrivateInfo && MPV.PrivateInfo.PrevVolume) || -1;
	var previousOutputValue =
		MPV.PrivateInfo &&
		MPV.PrivateInfo.OutputPreviousValue &&
		MPV.PrivateInfo.OutputPreviousValue.Pos1;

	// 3. ���ȴ���ģ�������� (��������)����λ��������Pos1
	var volInput = MPV.Input["Pos1"];
	if (
		volInput &&
		volInput.SignalValue !== null &&
		volInput.SignalValue !== undefined
	) {
		var raw = volInput.SignalValue;
		var norm = Math.max(0, Math.min(65535, raw)) / 65535;
		var vol = Math.round(norm * 100);

		if (prevVolume !== vol) {
			command = "set volume:" + vol + ";";
			prevVolume = vol; // ���±��ε�����ֵ
		}
	}

	// 4. ��������������
	// ֻ����ģ����û�д���ʱ���ż������������
	if (command === null) {
		// ���������ʵ�֡�λ�������󡱵����ȼ�
		var orderedPositions = Object.keys(MPV.Input).sort(function (a, b) {
			return parseInt(b.substring(3)) - parseInt(a.substring(3));
		});

		for (i = 0; i < orderedPositions.length; i++) {
			var pos = orderedPositions[i];
			var hardcodedCommand = hardcodedCommands[pos];

			if (hardcodedCommand) {
				var isRisingEdge =
					MPV.Input[pos] &&
					MPV.Input[pos].SignalValue === true &&
					(previousInputValues[pos] === false ||
						previousInputValues[pos] === undefined);

				if (isRisingEdge) {
					command = hardcodedCommand;
					break;
				}
			}
		}
	}

	// 5. ����ָ����±������ֵ
	if (command !== null) {
		outputValue = command;
	} else if (previousOutputValue) {
		outputValue = previousOutputValue;
	}

	// 6. ����������MRV����
	var mrv = {
		Output: { Pos1: outputValue },
		PrivateInfo: {
			InputPreviousValue: {},
			OutputPreviousValue: { Pos1: outputValue },
			PrevVolume: prevVolume,
		},
		Refresh: command !== null ? ["Pos1"] : [],
		Token: MPV.Token,
	};

	// 7. ��¼��������״̬��������һ�ε���
	for (var inputPos in MPV.Input) {
		if (MPV.Input.hasOwnProperty(inputPos)) {
			mrv.PrivateInfo.InputPreviousValue[inputPos] =
				MPV.Input[inputPos].SignalValue;
		}
	}

	return mrv;
};
