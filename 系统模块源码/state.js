/*state.js; */
function call(MPV) {
  /* 返回数据MRV基本数据格式定义 */
    var MRV = {
  /*输出数据，包含输出的信号位置和值*/
        "Output": {},
  /* 模块内部私有数据存储结构 */
        "PrivateInfo": {
        "OutputPreviousValue": {}
        },
  /* 输出刷新信号位置 */
        "Refresh": [],
        "Token": ""
    };
/* 定义in1、in2两个输入变量 */
    var in1 = MPV["Input"]["Pos1"]["SignalValue"];
    var in2 = MPV["Input"]["Pos2"]["SignalValue"];
/* 定义静态参数，将静态参数以字节分隔转化成数组*/
    var Arr = in2.split(""); 
    for(var i=0; i<Arr.length;i++){
/* 遍历数组，如果数组中的元素与变量“in1”相同则将对应元素位置的输出信号赋值为"true"*/
    if(Arr[i] == in1){   
    MRV["Output"]["Pos"+(i+1)] = true;
/* 数组中的元素与变量“in1”如果不相同则将对应元素位置的输出信号赋值为"false"*/
    }else{
    MRV["Output"]["Pos"+(i+1)] = false;
    };
/* 刷新输出 */
    MRV["Refresh"][i] = "Pos"+(i+1); 
       };
       return MRV;
};