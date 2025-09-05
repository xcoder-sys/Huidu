/**
 * Win�ػ�����������ģ�飺֧�������ش����ػ��ͱ仯���������������ڡ�
 * * ����:
 * - Pos1 (digital): �ػ������źš���������Ч��
 * - Pos2 (analog): ���������źţ���Χ 0-65535��
 * * ���:
 * - Pos1 (serial): ���͸�LCD�Ŀ���ָ���ֽ����顣
 */
function call(MPV) {
    // 1. ��ʼ��MRV��ģ�鷵��ֵ������
    var mrv = {
        Output: {
            Pos1: null
        },
        PrivateInfo: {
            // ��MPV�лָ���һ�ε�����/���״̬�������������ʹ��Ĭ��ֵ
            InputPreviousValue: (MPV.PrivateInfo && MPV.PrivateInfo.InputPreviousValue) || {},
            OutputPreviousValue: (MPV.PrivateInfo && MPV.PrivateInfo.OutputPreviousValue) || {},
            // �Զ���˽�б��������ڴ洢��һ�ε�����ֵ��-1�����ʼ״̬
            PrevVolume: (MPV.PrivateInfo && MPV.PrivateInfo.PrevVolume !== undefined) ? MPV.PrivateInfo.PrevVolume : -1
        },
        Refresh: [],
        Token: MPV.Token,
    };

    // 2. ��ȡ��ǰ�����ź�
    var shutdownInput = MPV.Input["Pos1"];
    var volumeInput = MPV.Input["Pos2"];

    // 3. ���ȴ���ػ�ָ���������
    if (shutdownInput) {
        var currentValue = shutdownInput.SignalValue;
        // !!ȷ����ʹ�ϴε�ֵ��null��undefined��Ҳ�ܰ�ȫ��תΪfalse
        var previousValue = !!mrv.PrivateInfo.InputPreviousValue["Pos1"];

        // �����ؼ�⣺��ǰΪtrue������һ��Ϊfalse
        if (currentValue === true && previousValue === false) {
            // �����ػ�ָ�� (06 00 01 00 00 00)
            mrv.Output.Pos1 = new Uint8Array([0x06, 0x00, 0x01, 0x00, 0x00, 0x00]);
            mrv.Refresh.push("Pos1");
            
            // ���±�������״̬��PrivateInfo�����´�ʹ��
            mrv.PrivateInfo.InputPreviousValue["Pos1"] = currentValue;
            // �ػ�ָ���ѷ�����ֱ�ӷ��أ����ٴ�������
            return mrv;
        }
    }

    // 4. ���û�д����ػ��������������ڣ�ģ������
    if (volumeInput && volumeInput.SignalValue !== null && volumeInput.SignalValue !== undefined) {
        var rawValue = volumeInput.SignalValue;
        // �� 0-65535 ��ģ����ֵת��Ϊ 0-100 �������ٷֱ�
        var normalized = Math.max(0, Math.min(65535, rawValue)) / 65535;
        var currentVolume = Math.round(normalized * 100);

        // �������������仯ʱ�ŷ���ָ��
        if (currentVolume !== mrv.PrivateInfo.PrevVolume) {
            // ��������ָ�� (06 00 02 00 [����] 00)
            mrv.Output.Pos1 = new Uint8Array([0x06, 0x00, 0x02, 0x00, currentVolume, 0x00]);
            mrv.Refresh.push("Pos1");

            // ���±�������ֵ��PrivateInfo�����´αȽ�
            mrv.PrivateInfo.PrevVolume = currentVolume;
        }
    }

    // 5. �ں���ĩβ��ͳһ������������״̬�ġ����䡱��Ϊ��һ��������׼��
    if (shutdownInput) {
        mrv.PrivateInfo.InputPreviousValue["Pos1"] = shutdownInput.SignalValue;
    }
    // �������ֵҲ��Ҫ����¼����ʹ��û�䣩��Ҳ�������������
    if (volumeInput && volumeInput.SignalValue !== null && volumeInput.SignalValue !== undefined) {
        var rawValueOnExit = volumeInput.SignalValue;
        var normalizedOnExit = Math.max(0, Math.min(65535, rawValueOnExit)) / 65535;
        mrv.PrivateInfo.PrevVolume = Math.round(normalizedOnExit * 100);
    }


    // �������ս��
    return mrv;
}
