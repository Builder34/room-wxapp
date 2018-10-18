// pages/publish/base.js
const app = getApp();
const zimApiUrl = app.globalData.apiUrl;
const publishUrl = zimApiUrl + '/ziroom/publish';
const uploadUrl = zimApiUrl + '/ziroom/upload';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    content: '',
    floor: '',
    topFloor: '',
    area: '',
    price: '',
    chooseType: 0,
    communityName: '',
    communityAddress: '',
    communityLatitude: 0,
    communityLongitude: 0,
    dictDataMap: {},
    fileTempArray: [],
    afterUploadArray: [],
    supportArray: [],
    roomType: '',
    feature: '',
    decorate: '',
    layout: '',
    orientation: '',
    renter: '',
    paytype: '',
    areaTown: '',
    areaMetro: '',
    apiVersion: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    that.setData({
      apiVersion: app.globalData.apiVersion
    });
    wx.setNavigationBarTitle({
      title: '发布',
    });
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: zimApiUrl +'/dictdata/dictDataMap', 
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: { versionNum: app.globalData.apiVersion},
      success: function (res) {
        var supports = res.data.data.room_support;
        for(var i in supports){  //让每个字典数据具有是否选中的状态
          supports[i].checked=false;
        }
        that.setData({
          dictDataMap: res.data.data,
          supportArray: supports
        });
        wx.hideLoading();
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  bindChooseType: function (e) {
    const that = this;
    wx.showActionSheet({
      itemList: ['照片', '视频'],
      success: function (res) {
        that.setData({
          chooseType: res.tapIndex
        });
        that.bindChooseMedia();
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },

  bindChooseMedia: function(e){
    const upType = this.data.chooseType;
    var tempArray = this.data.fileTempArray;
    const canUploadCount = 9 - tempArray.size;
    const that = this;
    if (upType === 0){
      wx.chooseImage({
        count: canUploadCount,
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          for (var i in res.tempFilePaths){
            tempArray.push({
              type: 0,
              url: res.tempFilePaths[i]
            });
          }
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          that.setData({
            fileTempArray: tempArray
          });
        }
      })
    }else if(upType === 1){
      wx.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 60, //最长60s
        camera: 'back',
        success: function(res){
          console.log(res);
          var thumbUrl = res.thumbTempFilePath || "";
          tempArray.push({
            type: 1,
            url: res.tempFilePath,
            thumbImgUrl: thumbUrl
          });
          that.setData({
            fileTempArray: tempArray
          });
        }
      })
    }
  },
  bindChooseLocation:function(){
    const that = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res);
        that.setData({
          communityName: res.name,
          communityAddress: res.address,
          communityLatitude: res.latitude,
          communityLongitude: res.longitude
        });
      }
    });
  },
  bindPreviewImage: function(e){
    console.log(e);
    const currentData = e.currentTarget.dataset;
    var urlGroup=[];
    for (var i in currentData.group){
      const item = currentData.group[i];
      if(item.type==0){
        urlGroup.push(item.url);
      }
    }
    wx.previewImage({
      current: currentData.current,
      urls: urlGroup,
    })
  },
  bindDeleteMedia: function(e){
    const thisIndex = e.currentTarget.dataset.index;
    var allFileTemps = this.data.fileTempArray;
    allFileTemps.splice(thisIndex,1);
    this.setData({
      fileTempArray: allFileTemps
    });
  },
  bindPlayVideo: function(e){
    var videoUrl = e.currentTarget.dataset.videourl;
    wx.navigateTo({
      url: '/pages/media/video?url=' + videoUrl
    })
  },
  bindCheckboxSupport: function(e){
    var supports = this.data.supportArray;
    var sIndex = e.currentTarget.dataset.index;
    supports[sIndex].checked = supports[sIndex].checked ? false : true;
    this.setData({
      supportArray: supports
    });
  },
  bindRadioRoomFeature: function(e){
    var name = e.currentTarget.dataset.name;
    this.setData({
      feature: name
    });
  },
  bindRadioDecorate: function (e) {
    var name = e.currentTarget.dataset.name;
    this.setData({
      decorate: name
    });
  },
  bindRadioLayout: function (e) {
    var name = e.currentTarget.dataset.name;
    this.setData({
      layout: name
    });
  },
  bindRadioOrientation: function (e) {
    var name = e.currentTarget.dataset.name;
    this.setData({
      orientation: name
    });
  },
  bindRadioRenter: function (e) {
    var name = e.currentTarget.dataset.name;
    this.setData({
      renter: name
    });
  },
  bindRadioPaytype: function (e) {
    var name = e.currentTarget.dataset.name;
    this.setData({
      paytype: name
    });
  },
  bindTitleInput: function(e) {
    this.setData({
      title: e.detail.value
    });
  },
  bindContentInput: function(e) {
    this.setData({
      content: e.detail.value
    });
  },
  bindFloorInput: function (e) {
    this.setData({
      floor: e.detail.value
    });
  },
  bindTopFloorInput: function (e) {
    this.setData({
      topFloor: e.detail.value
    });
  },
  bindAreaInput: function (e) {
    this.setData({
      area: e.detail.value
    });
  },
  bindPriceInput: function (e) {
    this.setData({
      price: e.detail.value
    });
  },
  bindTownInput: function (e) {
    this.setData({
      areaTown: e.detail.value
    });
  },
  bindMetroInput: function (e) {
    this.setData({
      areaMetro: e.detail.value
    });
  },
  uploadMoreFile: function (data) {
    console.log(data);
    const that = this;
    var i = data.i ? data.i : 0;
    var success = data.success ? data.success : 0;
    var fail = data.fail ? data.fail : 0;
    wx.uploadFile({
      url: data.url,
      filePath: data.path[i].url,
      name: 'file',
      success: function(res){
        console.log(res);
        var resData = JSON.parse(res.data);//注意wx.uploadFile响应返回是JSON字符串时，需要手动转换成JSON对象
        if (resData.code == 0){
          success++;
          console.log('num:' + i + ' uploadFile success count: ' + success);
          var tempArray = that.data.afterUploadArray;
          tempArray.push(resData.url);
          that.setData({
            afterUploadArray: tempArray
          });
        }else{
          fail++;
          console.log('num:' + i + ' uploadFile fail count: ' + fail);
        }
      },
      fail: function(res){
        fail++;
        console.log('num:'+i+' uploadFile fail count: '+fail+',error msg:'+res);
      },
      complete: function(){
        console.log('num '+i+' complete...');
        i++;
        if(i === data.path.length){
          console.log(i + '个文件已上传完毕,成功：' + success+'个，失败：'+fail+'个');
          wx.hideLoading();
          wx.showLoading({
            title: '正在发布房源...',
          });
          that.submitToPublish();
        }else{ 
          data.i = i;
          data.success = success;
          data.fail = fail;
          that.uploadMoreFile(data); //递归
        }
      }
    })
  },
  submitToPublish: function(){
    const that = this;
    var checkedSupport = [];
    var supportArray = that.data.supportArray
    for (var s in supportArray) {
      if (supportArray[s].checked) {
        checkedSupport.push(supportArray[s].dictDataCode);
      }
    }
    var params = {
      postTitle: that.data.title,
      postContent: that.data.content,
      community: that.data.communityName + '|' + that.data.communityAddress,
      longitude: that.data.communityLongitude,
      latitude: that.data.communityLatitude,
      rentType: 0,
      roomLayout: that.data.layout,
      roomFeature: that.data.feature,
      roomArea: that.data.area,
      roomFloor: that.data.floor + '|' + that.data.topFloor,
      roomOrientation: that.data.orientation,
      roomDecorate: that.data.decorate,
      roomRenter: that.data.renter,
      roomPaytype: that.data.paytype,
      rentalPrice: that.data.price,
      areaTown: that.data.areaTown,
      areaMetro: that.data.areaMetro,
      phone: "18688416400",
      wechat: "ziroomoonlight",
      createBy: "ziroomoonlight",
      status: 0,
      mediaList: that.data.afterUploadArray,
      supportList: checkedSupport,
      versionNum: that.data.apiVersion
    };
    console.log(params);
    wx.request({
      url: publishUrl,
      header: {
        'content-type': 'application/json' 
      },
      method: 'POST',
      data: params,
      success: function(res){
        wx.hideLoading();
        if(res.data.code == 0){
          wx.showToast({
            title: '发布成功',
            icon: 'success',
            duration: 3000
          });
          wx.navigateBack({
            delta: 1
          });
        }else{
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 5000
          });
        }
      },
      fail: function(res){
        console.log(res);
      }
    })
  },
  bindToPublish: function(){
    wx.showLoading({
      title: '文件上传中...',
    })
    //清空数据
    this.setData({
      afterUploadArray: []
    });
    this.uploadMoreFile({
      url: uploadUrl,
      path: this.data.fileTempArray
    });
    
  }
})