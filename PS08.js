function call(MPV) {
	var MRV = {
		Output: {},
		PrivateInfo: {
			OutputPreviousValue: {},
		},
		Refresh: [],
		Token: "",
	};

	// ����29��ָ�������������һһ��Ӧ
	var commands = [
		"\xFF\xFF\xAA\x01\x10\x01\x00\x01", // �ܿ� (��Ӧ����������1)
		"\xFF\xFF\xAA\x01\x10\x01\x00\x02", // �ܹ� (��Ӧ����������2)
		"\xFF\xFF\xAA\x01\x11\x01\x00\x01", // ��һ·�� (��Ӧ����������3)
		"\xFF\xFF\xAA\x01\x11\x01\x00\x02", // �ڶ�·�� (��Ӧ����������4)
		"\xFF\xFF\xAA\x01\x11\x01\x00\x03", // ����·�� (��Ӧ����������5)
		"\xFF\xFF\xAA\x01\x11\x01\x00\x04", // ����·�� (��Ӧ����������6)
		"\xFF\xFF\xAA\x01\x11\x01\x00\x05", // ����·��(��Ӧ����������7)
		"\xFF\xFF\xAA\x01\x11\x01\x00\x06", // ����·�� (��Ӧ����������8)
		"\xFF\xFF\xAA\x01\x11\x01\x00\x07", // ����·�� (��Ӧ����������9)
		"\xFF\xFF\xAA\x01\x11\x01\x00\x08", // �ڰ�·�� (��Ӧ����������10)
		"\xFF\xFF\xAA\x01\x12\x01\x00\x01", // ��һ·�� (��Ӧ����������11)
		"\xFF\xFF\xAA\x01\x12\x01\x00\x02", // �ڶ�·�� (��Ӧ����������12)
		"\xFF\xFF\xAA\x01\x12\x01\x00\x03", // ����·�� (��Ӧ����������13)
		"\xFF\xFF\xAA\x01\x12\x01\x00\x04", // ����·�� (��Ӧ����������14)
		"\xFF\xFF\xAA\x01\x12\x01\x00\x05", // ����·�� (��Ӧ����������15)
		"\xFF\xFF\xAA\x01\x12\x01\x00\x06", // ����·�� (��Ӧ����������16)
		"\xFF\xFF\xAA\x01\x12\x01\x00\x07", // ����·�� (��Ӧ����������17)
		"\xFF\xFF\xAA\x01\x12\x01\x00\x08", // �ڰ�·�� (��Ӧ����������18)
	];

	// ���ÿ�����������룬��Ϊtrueʱ�����Ӧָ��
	for (var i = 0; i < 29; i++) {
		var inputName = "Pos" + (i + 1);
		// ���������Ƿ������ֵΪtrue
		if (
			MPV["Input"][inputName] &&
			MPV["Input"][inputName]["SignalValue"] == true
		) {
			// ����Ӧ��ָ��������������ź�1
			MRV["Output"]["Pos1"] = commands[i];
			//console.log("���ָ��: " + commands[i] + " (��Ӧ����" + inputName + ")");
			MRV["Refresh"].push("Pos1");
			// ֻ�����һ��Ϊtrue�����룬�����ͻ
			break;
		}
	}

	return MRV;
}
