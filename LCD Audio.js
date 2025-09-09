/*
�ļ�����: LCD Volume Control.js
����: ����ģ�������������ָ��������ٷֱȡ�
�źţ�
  ���� Pos1 (Analog): ԭʼ����ֵ (0-65535)
  ��� Pos1 (Serial): ��������ָ�� (Uint8Array)
  ��� Pos2 (Analog): �����ٷֱ� (0-100)
*/

exports.call = function (MPV) {
	// 1. ��ʼ��MRV����
	var mrv = {
		Output: {
			Pos1: null, // ָ�����
			Pos2: null, // �ٷֱ����
		},
		PrivateInfo: {
			// ��MPV�ָ���һ�ε�״̬
			OutputPreviousValue:
				(MPV.PrivateInfo && MPV.PrivateInfo.OutputPreviousValue) || {},
			PrevVolume:
				MPV.PrivateInfo && MPV.PrivateInfo.PrevVolume !== undefined
					? MPV.PrivateInfo.PrevVolume
					: -1, // ʹ��-1��Ϊ��ʼֵ��ȷ���״αش���
		},
		Refresh: [],
		Token: MPV.Token,
	};

	// 2. ��ȡģ��������
	var volInput = MPV.Input["Pos1"];
	var command = null;
	var volumePercent = null;

	// ��������Ƿ���Ч
	if (
		volInput &&
		volInput.SignalValue !== null &&
		volInput.SignalValue !== undefined
	) {
		var rawValue = volInput.SignalValue;

		// 3. �� 0-65535 ��ԭʼֵת��Ϊ 0-100 �İٷֱ�
		var normalized = Math.max(0, Math.min(65535, rawValue)) / 65535;
		var currentVolumePercent = Math.round(normalized * 100);

		// 4. �仯��⣺ֻ�е���������������ϴβ�ͬʱ����������ָ��
		if (currentVolumePercent !== mrv.PrivateInfo.PrevVolume) {
			// 5. ������·���
			// ���1: ����ָ�� (�ֽ�����)
			command = new Uint8Array([0x05, 0x00, 0x08, 0x00, currentVolumePercent]);

			// ���2: �����ٷֱ� (��ֵ)
			volumePercent = currentVolumePercent + "%";

			// ��������������ˢ��
			mrv.Refresh.push("Pos1", "Pos2");
		}

		// 6. ����״̬�������Ƿ���ָ������¡��ϴ��������ļ���
		mrv.PrivateInfo.PrevVolume = currentVolumePercent;
	}

	// 7. �������յ����ֵ
	// �������ָ���ʹ����ֵ������ά����һ�ε����ֵ
	mrv.Output.Pos1 =
		command !== null ? command : mrv.PrivateInfo.OutputPreviousValue.Pos1;
	// �ٷֱ����Ҳһ������
	mrv.Output.Pos2 =
		volumePercent !== null
			? volumePercent
			: mrv.PrivateInfo.OutputPreviousValue.Pos2;

	// �����ε����ֵ����PrivateInfo�����´�ά��״̬ʹ��
	mrv.PrivateInfo.OutputPreviousValue = {
		Pos1: mrv.Output.Pos1,
		Pos2: mrv.Output.Pos2,
	};

	// 8. ���ؽ��
	return mrv;
};
