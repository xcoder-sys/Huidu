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
			SignalValue: "\xaa\xbb\xcc\xdd\xee\xff", //����ֵ
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
			srting1: "Pos1", //������"srting1"��Ӧ�ź�λ��"Pos1" ����
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
	Refresh: [], //����ĸ��ź���ˢ��(���ݴ���)��"Pos1","Pos2"��ˢ��
	Token: "",
};
function hexStrToBin(str) {
	// ÿ�����ַ�ת��һ���ֽ�
	return str.replace(/(..)/g, (m) => String.fromCharCode(parseInt(m, 16)));
}
function (MPV) {
    /* ��������MRV�������ݸ�ʽ���� */
    var MRV = {
        "Output": {},   // ��������MRV�������ݸ�ʽ����
        "PrivateInfo": { //˽������
            "InputPreviousValue": {} //��¼�����ź�״̬
        },
        "Refresh": [],  //���ˢ���ź�λ��
        "Token": ""
    };

    /* ��ʱ�������������� */
    var i, inputPos, refreshPos;

    /* ��һ��ִ��û��PrivateInfo��Ϣ����Ҫ�����ж� */
    if ("PrivateInfo" in MPV) {
        /* ��ʼ�����Ϊ�� */
        MRV["Output"]["Pos1"] = "";
        /* ѭ��ˢ�£������ֵ */
        for (i = 0; i < MPV["Refresh"].length; i++) {
            refreshPos = MPV["Refresh"][i];
            /* ��ˢ�£��Ҷ�Ӧ������Ϊ�����أ����������ֵ */
            if (MPV["Input"][refreshPos]["SignalValue"] === true && MPV["PrivateInfo"]["InputPreviousValue"][refreshPos] === false) {
                //MRV["Output"]["Pos1"] = MPV["StaticParameter"][refreshPos]["SignalValue"];

                var macStr = MPV["StaticParameter"][refreshPos]["SignalValue"]; // "aabbccddeeff"
		        var macBin = hexStrToBin(macStr);
		        MRV["Output"]["Pos1"] = "\xFF".repeat(6) + macBin.repeat(16);//����ħ����
                MRV["Refresh"][0] = "Pos1";

                
            }
        }
        /* ��¼�˴�״̬input��������һ�ε���ʹ�� */
        for (inputPos in MPV["Input"]) {
            MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
        }
        return MRV;
    } else { /* ��һ��ִ�� */
        /* ��ʼ�����Ϊ�� */
        MRV["Output"]["Pos1"] = "";
        /* ѭ��ˢ�£������ֵ */
        for (i = 0; i < MPV["Refresh"].length; i++) {
            refreshPos = MPV["Refresh"][i];
            /* ��ˢ�£��Ҷ�Ӧ������ֵΪtrue�����������ֵ */
            if (MPV["Input"][refreshPos]["SignalValue"] === true) {
                MRV["Output"]["Pos1"] = MPV["StaticParameter"][refreshPos]["SignalValue"];
                MRV["Refresh"][0] = "Pos1";
            }
        }
        /* ��¼�˴�״̬input��������һ�ε���ʹ�� */
        for (inputPos in MPV["Input"]) {
            MRV["PrivateInfo"]["InputPreviousValue"][inputPos] = MPV["Input"][inputPos]["SignalValue"];
        }
        return MRV;
    }
};

call(MPV);
// console.log(
//     Array.from(MRV["Output"]["Pos1"], c => ("0" + c.charCodeAt(0).toString(16)).slice(-2)).join(" ")
// );