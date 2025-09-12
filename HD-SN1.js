/*
�ļ�����: Negative Ion Minimal Parser.js
����: �������ղ��������������ַ��HD-SN1���������ݣ��������ֵ��
*/

exports.call = function (MPV) {
	// 1. ��ʼ��MRV����
	var mrv = {
		Output: { Pos1: null },
		PrivateInfo: {
			OutputPreviousValue:
				(MPV.PrivateInfo && MPV.PrivateInfo.OutputPreviousValue) || {},
		},
		Refresh: [],
		Token: MPV.Token,
	};

	// 2. ��ȡ����
	var dataInput = MPV.Input["Pos1"];
	var newValue = null;

	// 3. ��鲢�����������
	if (dataInput && dataInput.SignalValue) {
		var responseData = dataInput.SignalValue; // Ӧ���� Uint8Array

		// a. ��֤����֡�Ļ�����ʽ (������Ϊ0x03����������9�ֽ�)
		if (responseData && responseData.length >= 9 && responseData[1] === 0x03) {
			// b. ��֤ͨ������������
			// �������ӵ�4���ֽ�(����3)��ʼ����4���ֽ�
			var high1 = responseData[3];
			var high2 = responseData[4];
			var low1 = responseData[5];
			var low2 = responseData[6];

			// c. ��ϳ�32λ�޷�����������������ֵ
			var finalValue = (high1 << 24) | (high2 << 16) | (low1 << 8) | low2;

			newValue = finalValue;
		}
		// ������ݸ�ʽ����ȷ������ԣ�newValue ������ null
	}

	// 4. �������
	if (newValue !== null) {
		mrv.Output.Pos1 = newValue;
		m.Refresh.push("Pos1");
	} else {
		// ���û�������ݻ�������Ч����ά����һ�ε����ֵ
		mrv.Output.Pos1 = mrv.PrivateInfo.OutputPreviousValue.Pos1;
	}

	// 5. ���汾�ε����״̬�����´�ά��
	mrv.PrivateInfo.OutputPreviousValue = {
		Pos1: mrv.Output.Pos1,
	};

	return mrv;
};
