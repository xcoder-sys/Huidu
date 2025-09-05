// ���ߺ���������ͨ�ַ���ת��ΪUint8Array�ֽ�����
function stringToBytes(str) {
	var bytes = [];
	for (var i = 0; i < str.length; i++) {
		bytes.push(str.charCodeAt(i));
	}
	return new Uint8Array(bytes);
}

function call(MPV) {
	// 1. ����28���̶�ָ��
	var commands = [
		"\x04\x00\x01\x00", // ���� (��Ӧ����������1)
		"\x04\x00\x02\x00", // ���� (��Ӧ����������2)
		"\x04\x00\x03\x00", // ���� (��Ӧ����������3)
		"\x04\x00\x04\x00", // ��ͣ (��Ӧ����������4)
		"\x04\x00\x06\x00", // ��һ����Ŀ (��Ӧ����������5)
		"\x04\x00\x07\x00", // ��һ����Ŀ (��Ӧ����������6)
		"\x04\x00\x09\x00", // ���� (��Ӧ����������7)
		"\x04\x00\x0A\x00", // ����+ (��Ӧ����������8)
		"\x04\x00\x0B\x00", // ����- (��Ӧ����������9)
		"\x04\x00\x0D\x00", // ����+ (��Ӧ����������10)
		"\x04\x00\x0E\x00", // ����- (��Ӧ����������11)
		"\x04\x00\x0F\x00", // �б�ѭ�� (��Ӧ����������12)
		"\x04\x00\x0F\x01", // ����Ŀѭ�� (��Ӧ����������13)
		"\x05\x00\x05\x00\x00", // ��Ŀ1 (��Ӧ����������14)
		"\x05\x00\x05\x00\x01", // ��Ŀ2 (��Ӧ����������15)
		"\x05\x00\x05\x00\x02", // ��Ŀ3 (��Ӧ����������16)
		"\x05\x00\x05\x00\x03", // ��Ŀ4 (��Ӧ����������17)
		"\x05\x00\x05\x00\x04", // ��Ŀ5 (��Ӧ����������18)
		"\x05\x00\x05\x00\x05", // ��Ŀ6 (��Ӧ����������19)
		"\x05\x00\x05\x00\x06", // ��Ŀ7 (��Ӧ����������20)
		"\x05\x00\x05\x00\x07", // ��Ŀ8 (��Ӧ����������21)
		"\x05\x00\x05\x00\x08", // ��Ŀ9 (��Ӧ����������22)
		"\x05\x00\x05\x00\x09", // ��Ŀ10 (��Ӧ����������23)
		"\x05\x00\x05\x00\x0A", // ��Ŀ11 (��Ӧ����������24)
		"\x05\x00\x05\x00\x0B", // ��Ŀ12 (��Ӧ����������25)
		"\x05\x00\x05\x00\x0C", // ��Ŀ13 (��Ӧ����������26)
		"\x05\x00\x05\x00\x0D", // ��Ŀ14 (��Ӧ����������27)
		"\x05\x00\x05\x00\x0E", // ��Ŀ15 (��Ӧ����������28)
	]; // ��ʼ��MRV����

	var mrv = {
		Output: {
			Pos1: null, // ���������
			Pos2: null, // ģ�������
		},
		PrivateInfo: {
			// Ϊ������ȷ���汾��״̬���´�ʹ�ã�������Ҫ�������ش�MPV�лָ��ϴε�״̬
			InputPreviousValue: {}, // �������в���Ҫ��ȡ������Ҫ��ȷ�ش�
			OutputPreviousValue:
				(MPV.PrivateInfo && MPV.PrivateInfo.OutputPreviousValue) || {},
			PrevVolume:
				MPV.PrivateInfo && MPV.PrivateInfo.PrevVolume !== undefined
					? MPV.PrivateInfo.PrevVolume
					: -1,
		},
		Refresh: [],
		Token: MPV.Token,
	}; // 2. ��鲢����ģ�������� (Pos29)

	var volInput = MPV.Input["Pos29"];
	// ���Pos29�Ƿ�������кϷ����ź�ֵ
	if (
		volInput &&
		volInput.SignalValue !== null &&
		volInput.SignalValue !== undefined
	) {
		// --- ��ʼģ���������߼� ---
		// ֻҪģ����������Ч������Ϊ�������ȼ���ߣ�����������ֱ�ӷ��ء�

		var raw = volInput.SignalValue;
		var norm = Math.max(0, Math.min(65535, raw)) / 65535;
		var vol = Math.round(norm * 100); // ֻ�е������������ֵ���ϴμ�¼��ֵ��ͬʱ���ŷ���ָ��

		if (mrv.PrivateInfo.PrevVolume !== vol) {
			var volumeCmd = new Uint8Array([0x05, 0x00, 0x08, 0x00, vol]);
			mrv.Output["Pos2"] = volumeCmd; // �����ģ������Ӧ��Pos2
			mrv.Refresh.push("Pos2");
		}

		// �����Ƿ�����ָ�����Ҫ���¡���һ���������ļ��䣬Ϊ��һ�αȽ���׼��
		mrv.PrivateInfo.PrevVolume = vol;

		// ���ؼ��޸���������ģ�����߼���ֱ�ӷ��أ����ټ���ִ���������߼�
		return mrv;
	} else {
		// --- ��ʼ�����������߼� ---
		// ֻ�е�ģ����������Чʱ���Ž��������֧����������������

		// Ϊ��ʵ�֡�λ�������󡱵����ȼ����������
		for (var i = commands.length - 1; i >= 0; i--) {
			var inputName = "Pos" + (i + 1);
			if (MPV.Input[inputName] && MPV.Input[inputName].SignalValue === true) {
				mrv.Output["Pos1"] = stringToBytes(commands[i]); // �������������Ӧ��Pos1
				mrv.Refresh.push("Pos1");

				// ���ؼ��޸����ҵ�һ��������ҲҪ�������أ������ϵ�ǰ��״̬
				// �ڷ���ǰ����Ҫ����PrivateInfo�Ա��汾�ε�״̬
				mrv.PrivateInfo.OutputPreviousValue.Pos1 = mrv.Output.Pos1;
				mrv.PrivateInfo.OutputPreviousValue.Pos2 = mrv.Output.Pos2;
				return mrv;
			}
		}
	}

	// 4. ���û���κ��źŴ�����ҲҪ��ȷ�ط���MRV����ά��ס��һ�ε�״̬
	// (ͨ������������£�OutputΪ�գ�RefreshΪ��)
	if (mrv.PrivateInfo.OutputPreviousValue) {
		mrv.Output.Pos1 = mrv.PrivateInfo.OutputPreviousValue.Pos1;
		mrv.Output.Pos2 = mrv.PrivateInfo.OutputPreviousValue.Pos2;
	}

	return mrv;
}
