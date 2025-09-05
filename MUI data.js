function makeDigitalPacket(id, value) {
	// Э���ʽ: [֡ͷ][������][����][ID][ֵ][֡β]
	const packet = [
		0xaa, // ֡ͷ
		0x01, // �����룺������
		0xd0, // ����: digital
		id & 0xff, // �ź�ID (0-1999)
		value ? 0x01 : 0x00, // 1=����, 0=ȡ��
		0x55, // ֡β
	];
	return Buffer.from(packet);
}

// ���ӣ����� <d10>=1
let buf = makeDigitalPacket(10, 1);
console.log("�������ݰ�:", buf);
