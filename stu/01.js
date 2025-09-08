/* var obj = {};
Object.defineProperty(obj, "name", {
    value: "xuxu",
    writable: false, // 设置为不可写
    enumerable: true,
    configurable: false // 设置为不可配置
});

console.log('' + obj.name); // 输出: xuxu
obj.name = "xuxu2";//不可修改
console.log('' + obj.name); // 输出: xuxu
 */



/* function playVedio(name) {
    console.log("playVedio" + name);
    
}
playVedio("xuxu"); */


//闭包
var MPVModule = (function () {
    var volume = 50; // 模块私有变量
    return {
        setVolume: function (newVolume) {
            if (newVolume >= 0 && newVolume <= 100) {
                volume = newVolume; // 修改私有变量
                console.log('Volume set to: ' + volume);
                
            }
        },

        getVolume: function () {
            return volume; // 访问私有变量
        }
    }
})();

MPVModule.setVolume(80); // 设置音量
console.log('Current volume: ' + MPVModule.getVolume()); // 获取音量