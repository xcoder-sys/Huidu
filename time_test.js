// test.js
var timeModule = require("./TimeOutput.js");

// ģ�� MPV �������
var MPV = {
	Input: {
		Pos1: { SignalValue: true }, // ģ�� trig1 = true
	},
	PrivateInfo: {},
};

// ÿ 200ms ����һ�� call(MPV)��ģ��ϵͳ���ڵ���
setInterval(function () {
	var MRV = timeModule.call(MPV);

	if (MRV.Output.Pos1) {
		console.log("out1:", MRV.Output.Pos1);
	}

	// �̳� PrivateInfo������״̬
	MPV.PrivateInfo = MRV.PrivateInfo;
}, 200);
