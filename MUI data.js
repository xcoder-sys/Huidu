function makeDigitalPacket(id, value) {
	// 协议格式: [帧头][功能码][类型][ID][值][帧尾]
	const packet = [
		0xaa, // 帧头
		0x01, // 功能码：数字量
		0xd0, // 类型: digital
		id & 0xff, // 信号ID (0-1999)
		value ? 0x01 : 0x00, // 1=触发, 0=取消
		0x55, // 帧尾
	];
	return Buffer.from(packet);
}

// 例子：触发 <d10>=1
let buf = makeDigitalPacket(10, 1);
console.log("发送数据包:", buf);
