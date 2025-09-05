// test.js
var timeModule = require("./TimeOutput.js");

// 模拟 MPV 输入对象
var MPV = {
	Input: {
		Pos1: { SignalValue: true }, // 模拟 trig1 = true
	},
	PrivateInfo: {},
};

// 每 200ms 调用一次 call(MPV)，模拟系统周期调用
setInterval(function () {
	var MRV = timeModule.call(MPV);

	if (MRV.Output.Pos1) {
		console.log("out1:", MRV.Output.Pos1);
	}

	// 继承 PrivateInfo，保持状态
	MPV.PrivateInfo = MRV.PrivateInfo;
}, 200);
