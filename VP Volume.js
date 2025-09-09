/*
�ļ�����: Volume Control with Tick Debounce.js
����: ����ģ������ͨ���ȶ������������������У�����ָ��������ٷֱȡ�
����: ���������ȶ�����ָ�����ô����󣬲ŷ���ָ�������ϵͳʱ�䡣
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
	var checksumBase = sum & 0xff;
	var finalChecksum = checksumBase - 1;
	return finalChecksum & 0xff;
}

exports.call = function (MPV) {
	// �ȶ���ֵ���������������ֲ���ĵ��ô����������ֵ���ͷ���ָ�
	// ���ֵԽ���ӳ�Խ�ߡ�
	var STABILITY_THRESHOLD = 10;

	// 1. ��ʼ��MRV����
	var mrv = {
		Output: { Pos1: null, Pos2: null },
		PrivateInfo: {
			OutputPreviousValue:
				(MPV.PrivateInfo && MPV.PrivateInfo.OutputPreviousValue) || {},
			// ʹ�ü��������ʱ���
			lastVolumeInput:
				MPV.PrivateInfo && MPV.PrivateInfo.lastVolumeInput !== undefined
					? MPV.PrivateInfo.lastVolumeInput
					: -1,
			stableTicksCounter:
				(MPV.PrivateInfo && MPV.PrivateInfo.stableTicksCounter) || 0,
			commandPending:
				MPV.PrivateInfo && MPV.PrivateInfo.commandPending !== undefined
					? MPV.PrivateInfo.commandPending
					: false,
		},
		Refresh: [],
		Token: MPV.Token,
	};

	var volInput = MPV.Input["Pos1"];
	var command = null;
	var volumePercent = null;

	// 2. ����ģ��������
	if (
		volInput &&
		volInput.SignalValue !== null &&
		volInput.SignalValue !== undefined
	) {
		var rawValue = volInput.SignalValue;
		var currentVolumePercent = Math.round(
			(Math.max(0, Math.min(65535, rawValue)) / 65535) * 100
		);

		// a. ��������Ƿ����仯
		if (currentVolumePercent !== mrv.PrivateInfo.lastVolumeInput) {
			// �������ˣ����¼�¼ֵ���������ȶ�������
			mrv.PrivateInfo.lastVolumeInput = currentVolumePercent;
			mrv.PrivateInfo.stableTicksCounter = 0;
			mrv.PrivateInfo.commandPending = true; // �����ָ��ȴ�����
		} else {
			// ����û�䣬�ȶ���������1
			mrv.PrivateInfo.stableTicksCounter++;
		}
	}

	// 3. ����Ƿ���Է��ʹ������ָ��
	// �������д�����ָ�� && �ȶ��������ѳ�����ֵ
	if (
		mrv.PrivateInfo.commandPending &&
		mrv.PrivateInfo.stableTicksCounter > STABILITY_THRESHOLD
	) {
		var finalVolume = mrv.PrivateInfo.lastVolumeInput;

		// a. ����ָ�� (Pos1 ���)
		var commandTemplate = [
			0x56,
			0x50,
			0x00,
			0x08,
			0x00,
			0x20,
			0x00,
			0x03,
			0x03,
			0x01,
			finalVolume,
			0x01,
			0x00,
			0xaa,
		];
		var dataForChecksum = commandTemplate.slice(0, 12);
		var checksum = calculateChecksum(dataForChecksum);
		commandTemplate[12] = checksum;
		command = new Uint8Array(commandTemplate);

		// b. ׼���ٷֱ���ֵ (Pos2 ���)
		volumePercent = finalVolume;

		// c. ��������������ˢ��
		mrv.Refresh.push("Pos1", "Pos2");

		// d. ���ô������ǣ���ֹ�ظ�����
		mrv.PrivateInfo.commandPending = false;
	}

	// 4. �������յ����ֵ
	mrv.Output.Pos1 =
		command !== null ? command : mrv.PrivateInfo.OutputPreviousValue.Pos1;
	mrv.Output.Pos2 =
		volumePercent !== null
			? volumePercent
			: mrv.PrivateInfo.OutputPreviousValue.Pos2;

	mrv.PrivateInfo.OutputPreviousValue = {
		Pos1: mrv.Output.Pos1,
		Pos2: mrv.Output.Pos2,
	};

	return mrv;
};
