/*
�ļ�����: Volume Control with Checksum.js
����: ����ģ���������ɴ���̬У���������ָ�
�źţ�
  ���� Pos1 (Analog): ԭʼ����ֵ (0-65535)
  ��� Pos1 (Serial): ��������������ָ�� (Uint8Array)
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
		Output: { Pos1: null },
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
			// 5. ����ָ��
			// a. ����ָ��ģ�壬������У��λ��ʱΪ0
			var commandTemplate = [
				0x56, 0x50, 0x00, 0x08, 0x00, 0x20, 0x00, 0x03, 0x03, 0x01, 0x00, 0x01,
				0x00, 0xaa,
			];

			// b. ��������ֵ (��11���ֽڣ�����Ϊ10)
			commandTemplate[10] = currentVolumePercent;

			// c. ��ȡ��Ҫ����У������ݲ��� (ǰ12���ֽ�)
			var dataForChecksum = commandTemplate.slice(0, 12);

			// d. ����У����
			var checksum = calculateChecksum(dataForChecksum);

			// e. ����У���� (��13���ֽڣ�����Ϊ12)
			commandTemplate[12] = checksum;

			// f. �������յ�Uint8Arrayָ��
			command = new Uint8Array(commandTemplate);

			mrv.Refresh.push("Pos1");
		}

		// 6. ����״̬
		mrv.PrivateInfo.PrevVolume = currentVolumePercent;
	}

	// 7. �������յ����ֵ
	mrv.Output.Pos1 =
		command !== null ? command : mrv.PrivateInfo.OutputPreviousValue.Pos1;
	mrv.PrivateInfo.OutputPreviousValue.Pos1 = mrv.Output.Pos1;

	// 8. ���ؽ��
	return mrv;
};
