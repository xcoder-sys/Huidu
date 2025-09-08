exports.call = function (MPV) {
	/* ��������MRV�������ݸ�ʽ���� */
	var MRV = {
		Output: {},
		// �������� MRV �������ݸ�ʽ����
		PrivateInfo: {
			//˽������
			InputPreviousValue: {}, //��¼�����ź�״̬
		},
		Refresh: [], //���ˢ���ź�λ��
		Token: "",
	};
	/* ��ʱ�������������� */
	var i, inPos, outPos, delimiterPos, lengthPos;
	var inputSerial, formatSerial, subSerial;
	var strlength;
	var returnSerial;

	/* ��ȡλ�� */
	inPos = MPV["SignalNameVSPos"]["Input"]["in$"];
	outPos = MPV["SignalNameVSPos"]["Output"]["out$"];
	delimiterPos = MPV["SignalNameVSPos"]["StaticParameter"]["delimiter"];
	lengthPos = MPV["SignalNameVSPos"]["StaticParameter"]["length"];
	/* ��ȡƥ�������ֵ */
	formatSerial = MPV["StaticParameter"][delimiterPos]["SignalValue"];
	/* ��ȡƥ������ĳ��� */
	strlength = MPV["StaticParameter"][lengthPos]["SignalValue"];

	/* ��һ��ִ��û��PrivateInfo��Ϣ����Ҫ�����ж�  */
	if ("PrivateInfo" in MPV) {
		/* ���ϴε��������ε������������  */
		inputSerial =
			MPV["PrivateInfo"]["InputPreviousValue"][inPos] +
			MPV["Input"][inPos]["SignalValue"];
	} else {
		inputSerial = MPV["Input"][inPos]["SignalValue"];
	}
	/* �� �� �� �� ��  �Ƿ� ƥ�� */
	var indexPos = inputSerial.indexOf(formatSerial);
	/* �����ַ���ƥ��ɹ� */
	if (indexPos !== -1) {
		/*                                ƥ��Ĳ������ȴ��ڵ���Ҫ��ȡ�ĳ���,��ƥ������ݶ�����subSerial������ʣ��Ĵ���                         returnSerial  */
		if (inputSerial.length >= indexPos + strlength) {
			subSerial = inputSerial.substr(indexPos, strlength);
			returnSerial = inputSerial.substr(
				indexPos + strlength,
				inputSerial.length - (indexPos + strlength)
			);
			MRV["Refresh"][0] = outPos;
		} else {
			/*  ƥ��Ĳ�������С��Ҫ��ȡ�ĳ���,�Ƚ���ƥ������ݴ���returnSerial�������´αȶ���ȡ   */
			subSerial = "";
			returnSerial = inputSerial.substr(indexPos);
		}
	} else {
		/*  �����ַ���û��ƥ��ɹ��������strlength�����ݽ��з��� */
		subSerial = "";
		if (inputSerial.length > strlength) {
			returnSerial = inputSerial.substr(
				inputSerial.length - strlength,
				strlength
			);
		} else {
			returnSerial = inputSerial;
		}
	}

	/* �������� */
	MRV["Output"][outPos] = subSerial;
	/* ����Ҫ�����ȶԵĴ��������ݷ���������һ�ε���ʹ�� */
	MRV["PrivateInfo"]["InputPreviousValue"][inPos] = returnSerial;

	return MRV;
};
