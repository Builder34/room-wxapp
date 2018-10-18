// pages/home/detail.js
const app = getApp();
const util = require('../../utils/util.js');
const detailUrl = app.globalData.apiUrl+'/ziroom/info';
const starUrl = app.globalData.apiUrl + '/ziroom/star';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 1,
    windowWidth: app.systemInfo.windowWidth,
    vedioPoster: '',
    room: {},
    markers: [],
    yourDistance: '',
    apiVersion: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      apiVersion: app.globalData.apiVersion
    });
    if(this.data.apiVersion == 'v.final'){
      wx.setNavigationBarTitle({
        title: '房源详情',
      });
    }
    
    const that = this;
    wx.showLoading({
      title: '房间详情加载中...',
    })
    const unionId = wx.getStorageSync('wx-unionid');
    wx.request({
      url: detailUrl,
      data: { 
        id: options.id,
        unionId: unionId
      },
      method: 'POST',
      success: function(res){
        wx.hideLoading();
        if(res.data.code == 0){
          that.setData({
            room: res.data.data,
            markers: [{
              id: 0,
              iconPath: "/images/location.png",
              latitude: res.data.data.latitude,
              longitude: res.data.data.longitude,
              width: 36,
              height: 36,
              callout: {
                content: res.data.data.community,
                color: '#ffffff',
                fontSize: 12,
                borderRadius: 10,
                bgColor: '#f6d048',
                padding: 10,
                display: 'ALWAYS',
                textAlign: 'center'
              }
            }]
          });
          that.computeDistance();
        }else{
          wx.showToast({
            title: '房间详情加载出错',
            icon: 'none',
            duration: 4000
          })
        }
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

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  bindSwiperChange: function(e){
    this.setData({
      currentTab: e.detail.current+1
    });
  },
  bindPlayVideo: function (e) {
    var videoUrl = e.currentTarget.dataset.videourl;
    wx.navigateTo({
      url: '/pages/media/video?url=' + videoUrl
    })
  },
  bindPreviewImage: function (e) {
    const currentData = e.currentTarget.dataset;
    var urlGroup = [];
    for (var i in currentData.group) {
      const item = currentData.group[i];
      if (item.mediaType == 0) {
        urlGroup.push(item.mediaUrl);
      }
    }
    wx.previewImage({
      current: currentData.current,
      urls: urlGroup,
    })
  },
  bindCallPhone: function(e){
    const phoneNum = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phoneNum
    });
  },
  bindStar: function(e){
    const that = this;
    var roomDetail = that.data.room;
    var starType = roomDetail.star ? 1 : 0; //如果是已经收藏的，设置starType=1会移除收藏
    var unionId = wx.getStorageSync('wx-unionid');
    wx.showLoading({
      title: roomDetail.star? "取消收藏中..." : "加入收藏中..."
    })
    wx.request({
      url: starUrl,
      method: "POST",
      data: {
        starType: starType,
        wxUnionId: unionId,
        postId: roomDetail.id
      },
      success: function(res){
        wx.hideLoading();
        if(res.data.code == 0){
          if (starType == 0){
            roomDetail.star = true;
          }else{
            roomDetail.star = false;
          }
          that.setData({
            room: roomDetail
          });
          var toastTitle = (starType == 0 ? '加入收藏成功' : '取消收藏成功')
          wx.showToast({
            title: toastTitle,
            icon: 'success',
            duration: 3000
          })
        }else{
          wx.showToast({
            title: '系统错误',
            icon: 'none',
            duration: 3000
          })
        }
      },
      fail: function(res){
        wx.showToast({
          title: '请求出错',
          icon: 'none',
          duration: 3000
        })
      }
    })
  },
  bindWechatNumToClipboard: function(e){
    const wechatNum = e.currentTarget.dataset.wechat;
    wx.showModal({
      title: '请微信号添加好友联系',
      content: wechatNum,
      confirmText: '复制',
      success: function (res) {
        if (res.confirm) {
          wx.setClipboardData({
            data: wechatNum,
            success: function (res) {
              console.log(res);
            }
          })
        } else if (res.cancel) {
        }
      }
    })
  },
  bindOpenLocation: function(e){
    const latitude = e.currentTarget.dataset.latitude;
    const longitude = e.currentTarget.dataset.longitude;
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
    });
  },
  computeDistance: function(){
    const that = this;
    wx.getLocation({
      success: function(res) {
        var lat1 = res.latitude;
        var lng1 = res.longitude;
        var lat2 = that.data.room.latitude;
        var lng2 = that.data.room.longitude;
        console.log("lat1: "+lat1);
        console.log("lng1: " + lng1);
        console.log("lat2: " + lat2);
        console.log("lng2: " + lng2);
        var distance = util.getDistance(lat1, lng1, lat2, lng2);
        that.setData({ yourDistance: distance });
      },
    })
  }
})