/**
 * �̶������ź��л�����ģ�� (ES5 ���ݰ汾)
 * - ���� Pos1-16: HDMI�����ź�ѡ��
 * - ���� Pos17-32: HDMI���ͨ��ѡ��
 * - ��� Pos1 (out$): ��ʽ������л�ָ��, e.g., "(sw,1,1)"
 */
function call(MPV) {
    // 1. ��ʼ��MRV����
    var mrv = {
        Output: {
            Pos1: null
        },
        PrivateInfo: {
            // ��MPV�ָ���һ�ε�״̬�������������ʹ��Ĭ��ֵ
            InputPreviousValue: (MPV.PrivateInfo && MPV.PrivateInfo.InputPreviousValue) || {},
            status: (MPV.PrivateInfo && MPV.PrivateInfo.status) || 'waiting_for_input',
            selected_input: (MPV.PrivateInfo && MPV.PrivateInfo.selected_input) || null
        },
        Refresh: [],
        Token: MPV.Token
    };

    // ��־λ�������жϱ����Ƿ����в������
    var actionTaken = false;

    // 2. ������ͨ��ѡ�� (Pos17 - Pos32)����Ϊ�������ָ������һ��
    // ֻ������ѡ������Դ��״̬�£���������������
    if (mrv.PrivateInfo.status === 'waiting_for_output') {
        // �Ӹߵ��ͱ�����ʵ�ָ�λ����
        for (var i = 32; i >= 17; i--) {
            var outputPortName = "Pos" + i;
            var currentOutput = MPV.Input[outputPortName];

            if (currentOutput) {
                var isRisingEdge = currentOutput.SignalValue === true && !mrv.PrivateInfo.InputPreviousValue[outputPortName];
                if (isRisingEdge) {
                    // �����ɹ���׼������ָ��
                    var inputChannel = mrv.PrivateInfo.selected_input;
                    var outputChannel = i - 16; // Pos17 -> 1, Pos18 -> 2, ...

                    // ��ʽ��ָ��
                    mrv.Output.Pos1 = "(sw," + inputChannel + "," + outputChannel + ")";
                    mrv.Refresh.push("Pos1");

                    // ����״̬����Ϊ��һ�β�����׼��
                    mrv.PrivateInfo.status = 'waiting_for_input';
                    mrv.PrivateInfo.selected_input = null;
                    
                    actionTaken = true;
                    break; // ��ɲ���������ѭ��
                }
            }
        }
    }

    // 3. �������û�з���ָ����������ź�ѡ�� (Pos1 - Pos16)
    if (!actionTaken) {
        // �Ӹߵ��ͱ�����ʵ�ָ�λ����
        for (var j = 16; j >= 1; j--) {
            var inputPortName = "Pos" + j;
            var currentInput = MPV.Input[inputPortName];

            if (currentInput) {
                var isRisingEdge = currentInput.SignalValue === true && !mrv.PrivateInfo.InputPreviousValue[inputPortName];
                if (isRisingEdge) {
                    // ѡ�����µ�����Դ
                    mrv.PrivateInfo.status = 'waiting_for_output';
                    mrv.PrivateInfo.selected_input = j; // Pos1 -> 1, Pos2 -> 2, ...
                    
                    // ע�⣺�˲��費����ָ�ֻ�Ǹ���״̬
                    break; // ��ɲ���������ѭ��
                }
            }
        }
    }

    // 4. ״̬���棺�����Ƿ񴥷�������Ҫ���汾������32�������״̬�����´αȽ�
    for (var k = 1; k <= 32; k++) {
        var portName = "Pos" + k;
        var input = MPV.Input[portName];
        mrv.PrivateInfo.InputPreviousValue[portName] = input ? input.SignalValue : false;
    }

    // 5. ���ؽ��
    return mrv;
}