/* var obj = {};
Object.defineProperty(obj, "name", {
    value: "xuxu",
    writable: false, // ����Ϊ����д
    enumerable: true,
    configurable: false // ����Ϊ��������
});

console.log('' + obj.name); // ���: xuxu
obj.name = "xuxu2";//�����޸�
console.log('' + obj.name); // ���: xuxu
 */



/* function playVedio(name) {
    console.log("playVedio" + name);
    
}
playVedio("xuxu"); */


//�հ�
var MPVModule = (function () {
    var volume = 50; // ģ��˽�б���
    return {
        setVolume: function (newVolume) {
            if (newVolume >= 0 && newVolume <= 100) {
                volume = newVolume; // �޸�˽�б���
                console.log('Volume set to: ' + volume);
                
            }
        },

        getVolume: function () {
            return volume; // ����˽�б���
        }
    }
})();

MPVModule.setVolume(80); // ��������
console.log('Current volume: ' + MPVModule.getVolume()); // ��ȡ����