MPV = {
	Input: {
		//�����źż���,�ź�λ��"Pos*"�� LN ģ����ͼ����źŶ�Ӧ
		Pos1: {
			//�ź�λ��"Pos*"
			SignalName: "trig1", //�ź���
			SignalType: "digital", //�ź����ͣ����ͷ�Ϊ���֣�digital��analog��serial
			SignalValue: true, //�ź�ֵ
		},
		//����
	},
	Output: {
		//����źż���,�ź�λ��"Pos*"�� LN ģ����ͼ�Ҳ��źŶ�Ӧ
		Pos1: {
			//�ź�λ��"Pos*"
			SignalName: "out1", //�ź���
			SignalType: "serial", //�ź����ͣ����ͷ�Ϊ���֣�digital��analog��serial
		},
		// ����
	},
	StaticParameter: {
		//��������, ����λ��"Pos*"�� LN ģ����ͼ�м�Ĳ�����Ӧ
		Pos1: {
			//����λ��"Pos*"
			SignalName: "string1", //������
			SignalType: "serial", //�������ͣ����ͷ�Ϊ���֣�digital��analog��serial
			SignalValue: "123", //����ֵ
		},
		// ����
	},
	SignalNameVSPos: {
		//�ź������ź�λ��ӳ���ϵ
		Input: {
			//������ź������ź�λ��ӳ���ϵ
			trig1: "Pos1", //�����ź���"trig1"��Ӧ�ź�λ��"Pos1" ����
		},
		Output: {
			//������ź������ź�λ��ӳ���ϵ
			out1: "Pos1", //����ź���"out1"��Ӧ�ź�λ��"Pos1" ����
		},
		StaticParameter: {
			//�������Ͳ���λ��ӳ���ϵ
			string1: "Pos1", //������"string1"��Ӧ�ź�λ��"Pos1" ����
		},
	},
	PrivateInfo: {
		//ģ���ڲ�˽�����ݴ洢�Ľṹ��ģ���һ������ʱ�޴�����
		InputPreviousValue: {
			//�ϴ������źŵ�״̬
			Pos1: false, //����"Pos1"�ϴε�ֵΪ false ����
		},
		OutputPreviousValue: {
			//�ϴ�����źŵ�״̬
			Pos1: "", //���"Pos1"�ϴε�ֵΪ��
			// ����
		},
	},
	Refresh: ["Pos1", "Pos2"], //����ĸ��ź���ˢ��(���ݴ���)��"Pos1","Pos2"��ˢ��
	Token: "",
};

MRV = {
	Output: {
		//����źż���,�ź�λ��"Pos*"�� LN ģ����ͼ�Ҳ��źŶ�Ӧ
		Pos1: "123", //����ź�λ��"Pos1"��ֵΪ"123" ����
	},
	PrivateInfo: {
		//ģ���ڲ�˽�����ݴ洢�Ľṹ
		InputPreviousValue: {
			//��¼���������źŵ�״̬
			Pos1: true, //����"Pos1"��ֵΪ true ����
		},
		OutputPreviousValue: {
			//��¼��������źŵ�״̬
			Pos1: "123", //���"Pos1"��ֵΪ"123" ����
		},
	},
	Refresh: ["Pos1"], //����ĸ��ź���ˢ�£�"Pos1"��ˢ��
	Token: "",
};
