exports.call = function (MPV) {
	/* 返回数据MRV基本数据格式定义 */
	var MRV = {
		Output: {},
		// 返回数据 MRV 基本数据格式定义
		PrivateInfo: {
			//私有数据
			InputPreviousValue: {}, //记录输入信号状态
		},
		Refresh: [], //输出刷新信号位置
		Token: "",
	};
	/* 临时变量，用于运算 */
	var i, inPos, outPos, delimiterPos, lengthPos;
	var inputSerial, formatSerial, subSerial;
	var strlength;
	var returnSerial;

	/* 获取位置 */
	inPos = MPV["SignalNameVSPos"]["Input"]["in$"];
	outPos = MPV["SignalNameVSPos"]["Output"]["out$"];
	delimiterPos = MPV["SignalNameVSPos"]["StaticParameter"]["delimiter"];
	lengthPos = MPV["SignalNameVSPos"]["StaticParameter"]["length"];
	/* 获取匹配参数的值 */
	formatSerial = MPV["StaticParameter"][delimiterPos]["SignalValue"];
	/* 获取匹配参数的长度 */
	strlength = MPV["StaticParameter"][lengthPos]["SignalValue"];

	/* 第一次执行没有PrivateInfo信息，需要进行判断  */
	if ("PrivateInfo" in MPV) {
		/* 将上次的输出和这次的输出进行连接  */
		inputSerial =
			MPV["PrivateInfo"]["InputPreviousValue"][inPos] +
			MPV["Input"][inPos]["SignalValue"];
	} else {
		inputSerial = MPV["Input"][inPos]["SignalValue"];
	}
	/* 参 数 字 符 串  是否 匹配 */
	var indexPos = inputSerial.indexOf(formatSerial);
	/* 参数字符串匹配成功 */
	if (indexPos !== -1) {
		/*                                匹配的参数长度大于等于要提取的长度,将匹配的数据读出至subSerial，并将剩余的存入                         returnSerial  */
		if (inputSerial.length >= indexPos + strlength) {
			subSerial = inputSerial.substr(indexPos, strlength);
			returnSerial = inputSerial.substr(
				indexPos + strlength,
				inputSerial.length - (indexPos + strlength)
			);
			MRV["Refresh"][0] = outPos;
		} else {
			/*  匹配的参数长度小于要提取的长度,先将将匹配的数据存入returnSerial，用于下次比对提取   */
			subSerial = "";
			returnSerial = inputSerial.substr(indexPos);
		}
	} else {
		/*  参数字符串没有匹配成功，将最后strlength个数据进行返回 */
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

	/* 返回数据 */
	MRV["Output"][outPos] = subSerial;
	/* 将需要继续比对的串行量数据返回用于下一次调用使用 */
	MRV["PrivateInfo"]["InputPreviousValue"][inPos] = returnSerial;

	return MRV;
};
