/*
�ļ�����: Volume Control with Checksum (Dual Output).js
����: ����ģ�����������У�����ָ��������ٷֱȡ�
�źţ�
  ���� Pos1 (Analog): ԭʼ����ֵ (0-65535)
  ��� Pos1 (Serial): ��������������ָ�� (Uint8Array)
  ��� Pos2 (Analog): �����ٷֱ� (0-100)
*/

/**
 * ��������������ָ�����ݼ���У����
 * @param {Array<number>} commandData - ָ���ǰ12���ֽ�
 * @returns {number} - �������У����
 */
function calculateChecksum(commandData) {
	var sum = 0;
	for (var i = 0; i < commandData.length; i++) {
		sum += commandData[i];
	}
	// ȡ�͵����8λ (��ͬ�� sum % 256)
	var checksumBase = sum & 0xff;
	// ���� 1
	var finalChecksum = checksumBase - 1;
	// ȷ�������0-255֮�� (����-1���255�����)
	return finalChecksum & 0xff;
}

exports.call = function (MPV) {
	// 1. ��ʼ��MRV����
	var mrv = {
		Output: {
			Pos1: null, // ָ�����
			Pos2: null, // �ٷֱ����
		},
		PrivateInfo: {
			OutputPreviousValue:
				(MPV.PrivateInfo && MPV.PrivateInfo.OutputPreviousValue) || {},
			PrevVolume:
				MPV.PrivateInfo && MPV.PrivateInfo.PrevVolume !== undefined
					? MPV.PrivateInfo.PrevVolume
					: -1,
		},
		Refresh: [],
		Token: MPV.Token,
	};

	// 2. ��ȡģ��������
	var volInput = MPV.Input["Pos1"];
	var command = null;
	var volumePercent = null;

	if (
		volInput &&
		volInput.SignalValue !== null &&
		volInput.SignalValue !== undefined
	) {
		var rawValue = volInput.SignalValue;

		// 3. �� 0-65535 ��ԭʼֵת��Ϊ 0-100 �İٷֱ�
		var normalized = Math.max(0, Math.min(65535, rawValue)) / 65535;
		var currentVolumePercent = Math.round(normalized * 100);

		// 4. �仯��⣺ֻ�е������仯ʱ��������ָ��
		if (currentVolumePercent !== mrv.PrivateInfo.PrevVolume) {
			// 5. ����ָ�� (Pos1 ���)
			var commandTemplate = [
				0x56, 0x50, 0x00, 0x08, 0x00, 0x20, 0x00, 0x03, 0x03, 0x01, 0x00, 0x01,
				0x00, 0xaa,
			];
			commandTemplate[10] = currentVolumePercent; // ��������
			var dataForChecksum = commandTemplate.slice(0, 12);
			var checksum = calculateChecksum(dataForChecksum);
			commandTemplate[12] = checksum; // ����У����
			command = new Uint8Array(commandTemplate);

			// 6. ׼���ٷֱ���ֵ (Pos2 ���)
			volumePercent = currentVolumePercent+"%";

			// 7. ��������������ˢ��
			mrv.Refresh.push("Pos1", "Pos2");
		}

		// 8. ����״̬
		mrv.PrivateInfo.PrevVolume = currentVolumePercent;
	}

	// 9. �������յ����ֵ
	mrv.Output.Pos1 =
		command !== null ? command : mrv.PrivateInfo.OutputPreviousValue.Pos1;
	mrv.Output.Pos2 =
		volumePercent !== null
			? volumePercent
			: mrv.PrivateInfo.OutputPreviousValue.Pos2;

	// ���汾�ε��������ֵ�����´�ά��״̬ʹ��
	mrv.PrivateInfo.OutputPreviousValue = {
		Pos1: mrv.Output.Pos1,
		Pos2: mrv.Output.Pos2,
	};

	// 10. ���ؽ��
	return mrv;
};
