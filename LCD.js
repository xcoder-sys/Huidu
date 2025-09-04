// ���ߺ���������ͨ�ַ���ת��ΪUint8Array�ֽ�����
function stringToBytes(str) {
	var bytes = [];
	for (var i = 0; i < str.length; i++) {
		bytes.push(str.charCodeAt(i));
	}
	return new Uint8Array(bytes);
}

function call(MPV) {
	// 1. ����28���̶�ָ�ʹ�ÿ���ֱ�Ӹ�ֵ���ַ���
	// \x04������ʮ������ת���ַ�����Ч��
	var commands = [
		"\x04\x00\x01\x00", // Pos1: ����
		"\x04\x00\x02\x00", // Pos2: ����
		"\x04\x00\x03\x00", // Pos3: ����
		"\x04\x00\x04\x00", // Pos4: ��ͣ
		"\x04\x00\x06\x00", // Pos5: ��һ����Ŀ
		"\x04\x00\x07\x00", // Pos6: ��һ����Ŀ
		"\x04\x00\x09\x00", // Pos7: ����
		"\x04\x00\x0A\x00", // Pos8: ����+
		"\x04\x00\x0B\x00", // Pos9: ����-
		"\x04\x00\x0D\x00", // Pos10: ����+
		"\x04\x00\x0E\x00", // Pos11: ����-
		"\x05\x00\x0F\x00\x00", // Pos12: �б�ѭ��
		"\x05\x00\x0F\x00\x01", // Pos13: ����Ŀѭ��
		"\x05\x00\x05\x00\x00", // Pos14: ��Ŀ1
		"\x05\x00\x05\x00\x01", // Pos15: ��Ŀ2
		"\x05\x00\x05\x00\x02", // Pos16: ��Ŀ3
		"\x05\x00\x05\x00\x03", // Pos17: ��Ŀ4
		"\x05\x00\x05\x00\x04", // Pos18: ��Ŀ5
		"\x05\x00\x05\x00\x05", // Pos19: ��Ŀ6
		"\x05\x00\x05\x00\x06", // Pos20: ��Ŀ7
		"\x05\x00\x05\x00\x07", // Pos21: ��Ŀ8
		"\x05\x00\x05\x00\x08", // Pos22: ��Ŀ9
		"\x05\x00\x05\x00\x09", // Pos23: ��Ŀ10
		"\x05\x00\x05\x00\x0A", // Pos24: ��Ŀ11
		"\x05\x00\x05\x00\x0B", // Pos25: ��Ŀ12
		"\x05\x00\x05\x00\x0C", // Pos26: ��Ŀ13
		"\x05\x00\x05\x00\x0D", // Pos27: ��Ŀ14
		"\x05\x00\x05\x00\x0E", // Pos28: ��Ŀ15
	];

	// ��ʼ��MRV����
	var mrv = {
		Output: {
			Pos1: null, // ͳһ�����λ��
		},
		PrivateInfo: {
			// ��MPV�л�ȡ�ϴε�״̬�������������ʹ��Ĭ��ֵ
			OutputPreviousValue:
				(MPV.PrivateInfo && MPV.PrivateInfo.OutputPreviousValue) || {},
			PrevVolume: (MPV.PrivateInfo && MPV.PrivateInfo.PrevVolume) || -1, // ʹ��-1��Ϊ��ʼֵ��ȷ����һ�δ���ʱ�ܽ���
		},
		Refresh: [],
		Token: MPV.Token,
	};

	// 2. ���ȴ���ģ�������� (��Ϊ�������ڵ����ȼ����ܸ���)
	var volInput = MPV.Input["Pos29"];
	if (
		volInput &&
		volInput.SignalValue !== null &&
		volInput.SignalValue !== undefined
	) {
		var raw = volInput.SignalValue;
		var norm = Math.max(0, Math.min(65535, raw)) / 65535;
		var vol = Math.round(norm * 100);

		if (mrv.PrivateInfo.PrevVolume !== vol) {
			// ����Uint8Array�ֽ����飬�����ַ���
			var volumeCmd = new Uint8Array([0x05, 0x00, 0x08, 0x00, vol]);
			mrv.Output["Pos2"] = volumeCmd;
			mrv.Refresh.push("Pos2");
			mrv.PrivateInfo.PrevVolume = vol; // ��ȷ���汾�ε�����ֵ
			return mrv; // ģ����������ֱ�ӷ��أ��������������������ͻ
		}
	}

	// 3. �������������루ֻ�е�ģ����û�д���ʱ��ִ�У�
	// Ϊ��ʵ�֡�λ�������󡱵����ȼ������ǿ��Է������
	for (var i = commands.length - 1; i >= 0; i--) {
		var inputName = "Pos" + (i + 1);
		if (MPV.Input[inputName] && MPV.Input[inputName].SignalValue === true) {
			mrv.Output["Pos1"] = stringToBytes(commands[i]); // ת��Ϊ�ֽ�����
			mrv.Refresh.push("Pos1");
			return mrv; // �ҵ�����������
		}
	}

	// 4. ���û���κ��źŴ������򱣳��ϴε����
	// ���Ĵ�����û�б����ϴ�������߼����������������
	if (mrv.PrivateInfo.OutputPreviousValue.Pos1) {
		mrv.Output.Pos1 = mrv.PrivateInfo.OutputPreviousValue.Pos1;
	}
	mrv.PrivateInfo.OutputPreviousValue.Pos1 = mrv.Output.Pos1;

	return mrv;
}
