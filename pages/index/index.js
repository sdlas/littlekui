//index.js
//获取应用实例
const app = getApp()
//悬浮球的开始
var startPoint;
Page({
  data: {
    //悬浮球的数据
    x:30,
    y:60,
    //设备数据
    windowHeight: [],
    windowWidth: [],

    //蓝牙数据
    device: [],
    deviceId: [],
    services: [],
    deviceName: 'linxi',
    connectedDeviceId: [],
    notifyServicweId: [],
    notifyCharacteristicsId: [],
    beginreceive: false,//是否开始接收数据
    blueteethconnect:false,//蓝牙是否已连接

    //显示哪一个页面
    stack: 2,
    currenttab: 1,//导航栏

    //聊天气泡信息
    chatStyle: [],//动画切换效果
    chatmessage: "欢迎！连接蓝牙后才能使用哦",//首次进入页面的欢迎
    chatmessagegroup: ['今天天气真不错，我们去哪玩?',
      //'枫叶街新开了一家纸浆店，要不要一起去尝尝？',
      '小葵最喜欢阳光了！',
      '你猜猜小葵身体里装了什么？满满都是阳光哦~~',
      '我玩捉迷藏总是输，因为我迈不开腿。',
      '你猜猜我的胳膊有几个关节。',
      '小葵很厉害的哦，小葵可以跟着紫外线走！',
      '哇，这光好强啊，我要晒黑了！',
      '主人你喜欢听什么音乐呢？哦，对了我没有耳朵！',
      '主人快来做游戏吧'],

    //各种动画效果
    turnleftStyle: [],//向左移动消失动画
    rippleStyle: [],//变大效果
    showStyle: [],//显示动画

    //加载页面的数据
    twoline: false,//是否按两行显示
    rad: 73,
    loadingmessage: "初始化中...",

    //信息展示
    lightstrong:1000,//当前光强
    lightmessage:'光电流好强啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',//audriuno传来的光电流数据

    //画布数据
    fontweight:0.6,//字体大小
    myCanvas:false,//是否隐藏画布
    ctx1:[],//画布名称
    Canvusheight: 300,//画布大小
    Canvuswidth: 300,
      //示波器
      pointarr:[80,90,78,12,32],//示波器点集
    
    //3D画布数据
    allDrawWorksPath: [],//之前画布的数据存储
    imagedata: [],
    ctx: [],
    sqrtof33: [],//3D画布数据算子
    sqrtof32: [],
    ox: 150,//3D坐标原点
    oy: 150,
    degx: 45,//水平偏角
    degy: 35,//竖直偏角
    visual: 2,//视觉参数，用于调整视角

    //2D画布数据
    x0: 0,//坐标原点
    y0:200,
    multiblex:1,
    multibley:100,
    ynum:1,
    xnum:1,

  },
  //获取用户输入的蓝牙名
  getbluename:function(e){
    var that = this
    that.setData({
      deviceName: e.detail.value.bluename
    })
    that.start()
  },
  //显示蓝牙连接页面
  showblueconnect:function(e){
    var that = this
    if(!that.data.blueteethconnect){
      that.setData({
        stack: 0
      })
    }
  },
  //轨迹记录,首次点击事件
  pacerecord:function(){
    var that = this
    var height = that.data.Canvusheight
    var width = that.data.Canvuswidth
    var ox = that.data.ox
    var oy = that.data.oy
    var visual = that.data.visual
    var degx = (that.data.degx) / 180 * Math.PI
    var degy = (that.data.degy) / 180 * Math.PI
    const ctx = wx.createCanvasContext('myCanvas')
    ctx.setLineWidth(that.data.fontweight)//字体粗细
    that.setData({
      ctx: ctx,
      sqrtof33: Math.sqrt(3) / 3,
      sqrtof32: Math.sqrt(3) / 2
    })
    //绘制坐标系
    that.drawcuboid(80,80,80,'green')
    ctx.moveTo(10,10);
    ctx.lineTo(30,10)
    ctx.strokeStyle = "green"
    ctx.stroke()
    ctx.draw(true)
    ctx.moveTo(10,25)
    ctx.lineTo(30, 25)
    ctx.strokeStyle = "red"
    ctx.stroke()
    ctx.draw(true)

    ctx.strokeStyle = "#4A4E63"
    ctx.font = "9px Microsoft YaHei"
    ctx.strokeText("最大光强方向", 40, 10, 100)
    ctx.strokeText("机械手臂方向", 40, 25, 100)
    that.drawaxes()
    var length = 100
    var x = length * Math.cos(degy) * Math.cos(degx)
    var y = length * Math.cos(degy) * Math.sin(degx)
    var z = length * Math.sin(degy)
    that.drawcircle(0, 0, 0, 80)
    ctx.draw(true)
    //将现在的图像存储
    ctx.draw(true, function () {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        destWidth: 0,
        destHeight: 0,
        canvasId: 'myCanvas',
        success: function (res) {
          var imgPath = res.tempFilePath;
          var allDrawWorksPath = that.data.allDrawWorksPath;
          allDrawWorksPath.push(imgPath);
          that.setData({
            allDrawWorksPath: allDrawWorksPath,
          })
        },
        fail: res => {
          console.log('获取画布图片失败', res);
        }
      })
    })
    var degx = (that.data.degx) / 180 * Math.PI
    var degy = (that.data.degy) / 180 * Math.PI
    var length = 100
    var x = length * Math.cos(degy) * Math.cos(degx)
    var y = length * Math.cos(degy) * Math.sin(degx)
    var z = length * Math.sin(degy)
    //绘制立方体
    //that.drawcuboid(x, y, z)
  },
  //日光强记录（2D绘图）
  dayrecord:function(){
    var that = this
    const ctx = wx.createCanvasContext('myCanvas')
    ctx.setLineWidth(that.data.fontweight)
    console.log(ctx)
    var ox = 10
    var oy = 260
    ctx.moveTo(ox,20)
    ctx.lineTo(ox,265)
    ctx.moveTo(5,oy)
    ctx.lineTo(290,oy)
    ctx.font = "9px Microsoft YaHei"//设置字体大小和字体
    ctx.strokeText(0, ox+1, oy + 15, 100)//绘制字体
    var p = new Array()
    p=[20,30,50,60,80,90,120,150,180,190,200,210,240,240,250,240,220,200,180,160,130,70,60,40]
    ctx.moveTo(ox,oy-p[0])
    for(let i=1;i<24;i++){
      ctx.lineTo(ox+i*12,oy-p[i])
      ctx.strokeText(`${i}`, ox + i*12, oy + 15, 100)//绘制字体
    }
    for(let i=1;i<24;i++){
      ctx.moveTo(ox + i * 12, oy)
      ctx.lineTo(ox + i * 12, oy - 5)
    }
    ctx.strokeText('/h', ox + 275, oy+30, 100)
    ctx.strokeText('/ vW',ox+5,oy-230,100)
    ctx.stroke()
    ctx.draw()
  },
  //示波器
  beginlisten:function(){
    var that = this
    const ctx = that.data.ctx1
    var length = that.data.pointarr.length
    var pointarr = that.data.pointarr
    var m=1;//纵坐标缩减倍数
    ctx.moveTo(0,pointarr[0]/m);
    for(let i=1;i<length;i++){
      ctx.lineTo(i*10,pointarr[i]/m);
    }
    ctx.stroke();
    ctx.draw();
  },
  //tabbar功能切换
  changebar:function(e){
    var that = this
    that.setData({
      currenttab:e.currentTarget.dataset.id
    })
    if (parseInt(e.currentTarget.dataset.id) != 1 && parseInt(e.currentTarget.dataset.id) != 3){
      that.setData({
        myCanvas:true
      })
    }else{
      that.setData({
        myCanvas:false
      })
    }
    if (parseInt(e.currentTarget.dataset.id) == 3) {
      setTimeout(function () {
        that.dayrecord()
      }, 10)}
    if (parseInt(e.currentTarget.dataset.id) == 1) {
      setTimeout(function () {
        that.pacerecord()
      }, 10)
    }
  },

  //角度表单提交
  formsubmit: function (e) {
    var that = this
    if (e.detail.value.deg1 != '') { that.setData({ degx: parseFloat(e.detail.value.deg1), }) }
    if (e.detail.value.deg2 != '') { that.setData({ degy: parseFloat(e.detail.value.deg2), }) }
    const ctx = that.data.ctx
    ctx.setLineWidth(that.data.fontweight)
    //按时间间隔不断触发事件
    const interval = setInterval(function () {
      that.setData({
        degx: (that.data.degx + 1) % 360,
        degy: (that.data.degy) % 360
      })
      //将之前存储的画布图像恢复
      var privWorksPath = that.data.allDrawWorksPath[0];
      ctx.drawImage(privWorksPath, 0, 0, 300, 300);
      var degx = (that.data.degx) / 180 * Math.PI
      var degy = (that.data.degy) / 180 * Math.PI
      var length = 100
      var x = length * Math.cos(degy) * Math.cos(degx)
      var y = length * Math.cos(degy) * Math.sin(degx)
      var z = length * Math.sin(degy)
      that.drawcuboid(x, y, z,'red')
      if(that.data.currenttab!=1){
        clearInterval(interval);
      }
    }, 10)
  },

  onLoad: function () {
    var that = this
    that.setData({
      ctx1:wx.createCanvasContext('myCanvas')
    })

    

    //获取设备的数据
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
        })
      },
    })

    //记录轨迹
    setTimeout(function () {
      that.pacerecord()
    }, 10)
  },
  
  drawaxes: function () {//绘制坐标系
    var that = this
    var width = that.data.Canvuswidth
    var height = that.data.Canvusheight
    const ctx = that.data.ctx
    ctx.strokeStyle = '#4A4E63';
    ctx.setLineWidth(that.data.fontweight)
    var sqrtof33 = that.data.sqrtof33
    var sqrtof32 = that.data.sqrtof32
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, height)
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.moveTo(0, height / 2 + width / 2 * sqrtof33)
    ctx.lineTo(width, height / 2 - width / 2 * sqrtof33)
    ctx.stroke()
    ctx.draw(true)
  },
  drawcircle: function (x, y, z, radius) {//绘制一个平行于xy的圆
    var that = this
    var height = that.data.Canvusheight
    var width = that.data.Canvuswidth
    var ox = that.data.ox
    var oy = that.data.oy
    var visual = that.data.visual
    //三分之根号三
    var sqrtof33 = Math.sqrt(3) / 3
    var sqrtof32 = Math.sqrt(3) / 2
    const ctx = that.data.ctx
    ctx.setLineWidth(that.data.fontweight)
    //绘制圆
    ctx.strokeStyle = '#4A4E63';
    var deg = 0;
    that.canmoveTo(x + radius * Math.cos(deg), y + radius * Math.sin(deg), z)
    for (let i = 0; i < 361; i++) {
      var deg = i / 180 * Math.PI
      that.canlineTo(x + radius * Math.cos(deg), y + radius * Math.sin(deg), z)
    }
    ctx.closePath()
    ctx.stroke()
    ctx.draw(true)
  },
  drawcuboid: function (lengthx, lengthy, lengthz,color) {//绘制立方体
    var that = this
    var height = that.data.Canvusheight
    var width = that.data.Canvuswidth
    var ox = that.data.ox
    var oy = that.data.oy
    var visual = that.data.visual
    var degx = that.data.degx
    var degy = that.data.degy
    //三分之根号三
    var sqrtof33 = Math.sqrt(3) / 3
    var sqrtof32 = Math.sqrt(3) / 2
    const ctx = that.data.ctx
    ctx.setLineWidth(that.data.fontweight)
    //绘制长方体
    var px = 150;
    var py = 150;
    ctx.strokeStyle = '#4A4E63';
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - lengthz)
    ctx.lineTo(px + lengthx, py - lengthz)
    ctx.lineTo(px + lengthx, py)
    ctx.lineTo(px, py)
    ctx.closePath()
    var px2 = px + lengthy / visual * sqrtof32
    var py2 = py - lengthy / visual / 2
    ctx.moveTo(px2, py2)
    ctx.lineTo(px2, py2 - lengthz)
    ctx.lineTo(px2 + lengthx, py2 - lengthz)
    ctx.lineTo(px2 + lengthx, py2)
    ctx.lineTo(px2, py2)
    ctx.closePath()
    ctx.lineTo(px, py)
    ctx.moveTo(px, py - lengthz)
    ctx.lineTo(px2, py2 - lengthz)
    ctx.moveTo(px + lengthx, py - lengthz)
    ctx.lineTo(px2 + lengthx, py2 - lengthz)
    ctx.moveTo(px + lengthx, py)
    ctx.lineTo(px2 + lengthx, py2)
    //绘制对角线
    ctx.stroke()
    ctx.draw()
    ctx.strokeStyle = color
    ctx.moveTo(px, py)
    ctx.lineTo(px2 + lengthx, py2 - lengthz)
    ctx.stroke()
    ctx.draw(true)
  },
  canmoveTo: function (x, y, z) {//移动到我想去的坐标点
    var that = this
    var height = that.data.Canvusheight
    var width = that.data.Canvuswidth
    var ox = that.data.ox
    var oy = that.data.oy
    var visual = that.data.visual
    //三分之根号三
    var sqrtof33 = Math.sqrt(3) / 3
    var sqrtof32 = Math.sqrt(3) / 2
    const ctx = that.data.ctx
    ctx.setLineWidth(that.data.fontweight)
    //绘制长方体
    var px = 150;
    var py = 150;
    var px2 = px + y / visual * sqrtof32
    var py2 = py - y / visual / 2
    //绘制对角线
    ctx.moveTo(px2 + x, py2 - z)
  },
  canlineTo: function (x, y, z) {
    var that = this
    var height = that.data.Canvusheight
    var width = that.data.Canvuswidth
    var ox = that.data.ox
    var oy = that.data.oy
    var visual = that.data.visual
    //三分之根号三
    var sqrtof33 = Math.sqrt(3) / 3
    var sqrtof32 = Math.sqrt(3) / 2
    const ctx = that.data.ctx
    ctx.setLineWidth(that.data.fontweight)
    //绘制长方体
    var px = 150;
    var py = 150;
    var px2 = px + y / visual * sqrtof32
    var py2 = py - y / visual / 2
    //绘制对角线
    ctx.lineTo(px2 + x, py2 - z)
  },
  drawline: function (lengthx, lengthy, lengthz) {
    //绘制坐标为0,0,0到x,y,z的直线
    var that = this
    var height = that.data.Canvusheight
    var width = that.data.Canvuswidth
    var ox = that.data.ox
    var oy = that.data.oy
    var visual = that.data.visual
    var degx = that.data.degx
    var degy = that.data.degy
    //三分之根号三
    var sqrtof33 = Math.sqrt(3) / 3
    var sqrtof32 = Math.sqrt(3) / 2
    const ctx = that.data.ctx
    ctx.setLineWidth(that.data.fontweight)
    //绘制长方体
    var px = 150;
    var py = 150;
    var px2 = px + lengthy / visual * sqrtof32
    var py2 = py - lengthy / visual / 2
    //绘制对角线
    ctx.strokeStyle = 'blue'
    ctx.lineTo(px2 + lengthx, py2 - lengthz)
  },

//--------------------以下是蓝牙连接模块-----------------------
  //开始连接蓝牙调用的函数
  start: function () {
    var that = this
    that.setData({
      rippleStyle: '-webkit-animation: ripple 1s linear;animation:ripple 1s linear'
    })
    setTimeout(function () {
      that.setData({
        stack: 1,
        showStyle: '-webkit-animation: show 0.25s linear;animation:show 0.25s linear'
      })
       console.log("ojbk");
      //对话气泡
      setInterval(function () {
        var i = parseInt(Math.random() * 10)
        that.setData({
          chatStyle: '-webkit-animation: chat 0.6s linear;animation:chat 0.6s linear',
          chatmessage: that.data.chatmessagegroup[i]
        })
        setTimeout(function () {
          that.setData({
            chatStyle: ''
          })
        }, 600)
      }, 5000)
      // if (wx.openBluetoothAdapter) {
      //   wx.openBluetoothAdapter({
      //     success: function (res) {
      //       /* 获取本机的蓝牙状态 */
      //       setTimeout(() => {
      //         that.getBluetoothAdapterState()
      //       }, 1000)
      //     },
      //     fail: function (err) {
      //       // 初始化失败
      //     }
      //   })
      // } else {

      // }
    }, 1000
    )
    setTimeout(function(){
      that.setData({
        blueteethconnect:true,
        stack:2
      })
    },2000)
  },
  //发送信息
  sendmessage: function () {
    var that = this
    console.log("printfssss", that.data.connectedDeviceId)
    console.log("adsdas", that.data.services)
  },


  //各种蓝牙函数
  getBluetoothAdapterState() {
    var that = this;
    that.setData({
      loadingmessage: "检查蓝牙状态中"
    })
    wx.getBluetoothAdapterState({
      success: function (res) {
        that.setData({
          loadingmessage: "蓝牙状态ok"
        })
        that.startBluetoothDevicesDiscovery()
      },
      fail(res) {
        console.log("检查状态失败")
      }
    })
  },

  startBluetoothDevicesDiscovery() {//开始搜索蓝牙设备
    var that = this;
    setTimeout(() => {
      wx.startBluetoothDevicesDiscovery({
        success: function (res) {
          /* 获取蓝牙设备列表 */
          that.setData({
            twoline: true,
            loadingmessage: "开始获取蓝牙设备列表"
          })
          that.getBluetoothDevices()
        },
        fail(res) {
          console.log("搜索蓝牙设备失败", res)
        }
      })
    }, 1000)
  },

  getBluetoothDevices() {//获取蓝牙设备列表
    var that = this;
    setTimeout(() => {
      wx.getBluetoothDevices({
        services: [],
        allowDuplicatesKey: false,
        interval: 0,
        success: function (res) {
          console.log(res.devices)
          if (res.devices.length > 0) {
            if (JSON.stringify(res.devices).indexOf(that.data.deviceName) !== -1) {
              for (let i = 0; i < res.devices.length; i++) {
                if (that.data.deviceName === res.devices[i].name) {
                  /* 根据指定的蓝牙设备名称匹配到deviceId */
                  var deviceName = that.data.deviceName
                  that.setData({
                    loadingmessage: "已找到对应设备" + `$deviceName`,
                    deviceId: res.devices[i].deviceId
                  })
                  setTimeout(() => {
                    that.setData({
                      loadingmessage: "匹配蓝牙设备成功"
                    })
                    that.connectTO();
                  }, 2000);
                };
              };
            } else {
            }
          } else {
          }
        },
        fail(res) {
          console.log(res, '获取蓝牙设备列表失败=====')
        }
      })
    }, 2000)
  },

  connectTO() {//连接你想连接的设备
    var that = this
    wx.createBLEConnection({
      deviceId: that.data.deviceId,
      success: function (res) {
        that.setData({
          connectedDeviceId: that.data.deviceId
        })
        /* 4.获取连接设备的service服务 */
        console.log("连接成功")
        that.getBLEDeviceServices();
        wx.stopBluetoothDevicesDiscovery({
          success: function (res) {
            console.log("停止搜索")
          },
          fail(res) {
          }
        })
      },
      fail: function (res) {
        console.log("连接失败")
      }
    })
  },

  getBLEDeviceServices() {//获取设备信息
    var that = this
    setTimeout(() => {
      wx.getBLEDeviceServices({
        deviceId: that.data.connectedDeviceId,
        success: function (res) {
          that.setData({
            loadingmessage: "获取设备信息成功"
          })
          that.setData({
            services: res.services
          })
          /* 获取连接设备的所有特征值 */
          that.getBLEDeviceCharacteristics()
        },
        fail: (res) => {
          console.log("获取设备信息失败")
        }
      })
    }, 2000)
  },

  getBLEDeviceCharacteristics() {//获取设备的所有特征值
    var that = this
    setTimeout(() => {
      wx.getBLEDeviceCharacteristics({
        deviceId: that.data.connectedDeviceId,
        serviceId: that.data.services[2].uuid,
        success: function (res) {
          for (var i = 0; i < res.characteristics.length; i++) {
            if ((res.characteristics[i].properties.notify || res.characteristics[i].properties.indicate) &&
              (res.characteristics[i].properties.read && res.characteristics[i].properties.write)) {
              that.setData({
                loadingmessage: "已获取蓝牙特征值"
              })
              /* 获取蓝牙特征值 */
              that.setData({
                notifyCharacteristicsId: res.characteristics[i].uuid
              })
              // 启用低功耗蓝牙设备特征值变化时的 notify 功能
              that.notifyBLECharacteristicValueChange()
            }
          }
        },
        fail: function (res) {
          console.log("获取特征值失败")
        }
      })
    }, 1000)
  },

  notifyBLECharacteristicValueChange() { // 启用低功耗蓝牙设备特征值变化时的 notify 功能，并开始接受数据
    var that = this;
    that.setData({
      loadingmessage: "启用蓝牙notify功能"
    })
    wx.notifyBLECharacteristicValueChange({
      state: true,
      deviceId: that.data.connectedDeviceId,
      serviceId: that.data.services[2].uuid,
      characteristicId: that.data.notifyCharacteristicsId,
      complete(res) {
        that.setData({
          loadingmessage: "开始监听蓝牙数据变化"
        })
        setTimeout(function () {
          that.setData({
            turnleftStyle: '-webkit-animation: turnleft 0.6s linear;animation:turnleft 0.6s linear'
          })
          setTimeout(function () {
            that.setData({
              stack: 2
            })
          }, 1000)
        }, 1000)
        /*用来监听手机蓝牙设备的数据变化*/
        wx.onBLECharacteristicValueChange(function (res) {
          var returns = that.buf2string(res.value)
          console.log("sommm")
          console.log(returns)
          if (returns.indexOf("startlistern") !== -1) {
            console.log("开始接收信息")
            that.setData({
              beginreceive: true
            })
          }
          if (that.data.beginreceive) {//收到信息执行的函数
            console.log("收到信息: ", that.buf2string(res.value))
            that.data.pointarr.splice(1, that.buf2string(res.value))
            that.beginlisten()
          }
        })
      },
      fail(res) {
        console.log(res, '启用低功耗蓝牙设备监听失败')
        that.measuringTip(res)
      }
    })
  },


  buf2string(buffer) {
    var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
    return arr.map((char, i) => {
      return String.fromCharCode(char);
    }).join('');
  },
  receiveData(buf) {
    return this.hexCharCodeToStr(this.ab2hex(buf))
  },
  ab2hex(buffer) {/*转成二进制*/
    var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer), function (bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('')
  },

  hexCharCodeToStr(hexCharCodeStr) {/*转成可展会的文字*/
    var trimedStr = hexCharCodeStr.trim();
    var rawStr = trimedStr.substr(0, 2).toLowerCase() === '0x' ? trimedStr.substr(2) : trimedStr;
    var len = rawStr.length;
    var curCharCode;
    var resultStr = [];
    for (var i = 0; i < len; i = i + 2) {
      curCharCode = parseInt(rawStr.substr(i, 2), 16);
      resultStr.push(String.fromCharCode(curCharCode));
    }
    return resultStr.join('');
  },

  //发送信息
  sendData: function () {
    var str = '1'
    let that = this;
    let dataBuffer = new ArrayBuffer(str.length)
    let dataView = new DataView(dataBuffer)
    for (var i = 0; i < str.length; i++) {
      dataView.setUint8(i, str.charAt(i).charCodeAt())
    }
    let dataHex = that.ab2hex(dataBuffer);
    this.writeDatas = that.hexCharCodeToStr(dataHex);
    wx.writeBLECharacteristicValue({
      deviceId: that.data.connectedDeviceId,
      serviceId: that.data.services[2].uuid,
      characteristicId: that.data.notifyCharacteristicsId,
      value: dataBuffer,
      success: function (res) {
        console.log('发送的数据：' + that.writeDatas)
        console.log('message发送成功')
      },
      fail: function (res) {
      },
      complete: function (res) {
      }
    })
  },
  sendData2: function () {
    var str = '0'
    let that = this;
    let dataBuffer = new ArrayBuffer(str.length)
    let dataView = new DataView(dataBuffer)
    for (var i = 0; i < str.length; i++) {
      dataView.setUint8(i, str.charAt(i).charCodeAt())
    }
    let dataHex = that.ab2hex(dataBuffer);
    this.writeDatas = that.hexCharCodeToStr(dataHex);
    wx.writeBLECharacteristicValue({
      deviceId: that.data.connectedDeviceId,
      serviceId: that.data.services[2].uuid,
      characteristicId: that.data.notifyCharacteristicsId,
      value: dataBuffer,
      success: function (res) {
        console.log('发送的数据：' + that.writeDatas)
        console.log('message发送成功')
      },
      fail: function (res) {
      },
      complete: function (res) {
      }
    })
  },
  buttonStart: function (e) {
    startPoint = e.touches[0]
  },
  buttonMove: function (e) {
    var endPoint = e.touches[e.touches.length - 1]
    var translateX = endPoint.clientX - startPoint.clientX
    var translateY = endPoint.clientY - startPoint.clientY
    startPoint = endPoint
    var buttonTop = this.data.y - translateY
    var buttonLeft = this.data.x - translateX
    //判断是移动否超出屏幕
    if (buttonLeft + 50 >= this.data.windowWidth) {
      buttonLeft = this.data.windowWidth - 50;
    }
    if (buttonLeft <= 0) {
      buttonLeft = 0;
    }
    if (buttonTop <= 0) {
      buttonTop = 0
    }
    if (buttonTop + 50 >= this.data.windowHeight) {
      buttonTop = this.data.windowHeight - 50;
    }
    this.setData({
      y: buttonTop,
      x: buttonLeft
    })
  },
  buttonEnd: function (e) {
  },
})

