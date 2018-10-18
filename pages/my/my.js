const app = getApp();
const checkLoginUrl = app.globalData.apiUrl + '/wechat/user/checkLogin';
const loginUrl = app.globalData.apiUrl+'/wechat/user/login2';
const myStarUrl = app.globalData.apiUrl + '/ziroom/myStar';
const powerUrl = app.globalData.apiUrl + '/ziroom/power';
const starUrl = app.globalData.apiUrl + '/ziroom/star';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: app.systemInfo.windowHeight,
    windowWidth: app.systemInfo.windowWidth,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    currentTab: 0,
    hasPublishPower: false,
    starData: [],
    publishData: [],
    wxUnionId: '',
    startX: 0,
    removeStarBtnWidth: 58,
    apiVersion: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      apiVersion: app.globalData.apiVersion
    });
    wx.setNavigationBarTitle({
      title: '我的'
    });
    const that = this;
    var wxUnionId = wx.getStorageSync('wx-unionid');
    console.log('=======wxUnionId: ' + wxUnionId);
    if ('' != wxUnionId){
      const storeUserInfo = wx.getStorageSync(wxUnionId);
      console.log(storeUserInfo);
      wx.request({
        url: checkLoginUrl,
        data:{
          unionId: wxUnionId
        },
        success: function (res) {
          console.log('checkLoginUrl:');
          console.log(res);
          if (res.data.code == 0) {
            that.setData({
              hasUserInfo: true,
              userInfo: storeUserInfo,
              wxUnionId: wxUnionId
            });
            that.getMyStarData(wxUnionId,true);
          } else {
            wx.clearStorageSync('wx-unionid');
            wx.clearStorageSync(wxUnionId);
          }
        }
      });
      that.checkPower(wxUnionId);
    }else{
      if (app.globalData.userInfo) {
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true
        })
      } else if (this.data.canIUse) {
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        app.userInfoReadyCallback = res => {
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      } else {
        // 在没有 open-type=getUserInfo 版本的兼容处理
        wx.getUserInfo({
          success: res => {
            app.globalData.userInfo = res.userInfo
            this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            })
          }
        })
      }
    }
  },
  onShow: function() {
    this.getMyStarData(this.data.wxUnionId, true);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  getMyStarData: function(wxUnionId,needRefresh){
    const that = this;
    wx.request({
      url: myStarUrl,
      method: "POST",
      data: { wxUnionId: wxUnionId, versionNum: that.data.apiVersion},
      success: function (res) {
        var newList = res.data.page.list;
        if (!needRefresh){
          newList = that.data.starData.concat(newList);
        }
        console.log(newList);
        that.setData({
          starData: newList
        });
      }
    })
  },
  getUserInfo: function (e) {
    console.log(e)
    const that = this;
    wx.login({
      success: function (res) {
        var code = res.code;
        if (code) {
          console.log('获取用户登录凭证：' + code);
          console.log('---------------发送凭证--------------');
          wx.request({
            url: loginUrl,
            header: {
              'content-type': 'application/json'
            },
            method: 'POST', 
            data: { 
              code: code,
              signature: e.detail.signature,
              rawData: e.detail.rawData,
              encryptedData: e.detail.encryptedData,
              iv: e.detail.iv
            },
            success: function (res) {
              console.log(res);
              if(res.data.code == 0){
                wx.setStorageSync('wx-unionid', res.data.unionid);
                wx.setStorageSync(res.data.unionid, e.detail.userInfo);
                app.globalData.userInfo = e.detail.userInfo
                that.setData({
                  userInfo: e.detail.userInfo,
                  hasUserInfo: true
                });
                that.getMyStarData(res.data.unionid,true);
              }else{
                wx.showToast({
                  title: res.data.msg+',请再次点击登录.',
                  icon: 'none',
                  duration: 5000
                })
                console.log(res.data.msg);
              }
            }
          })
          console.log('------------------------------------');
        } else {
          console.log('获取用户登录态失败：' + res.errMsg);
        }
      }
    });
  },
  checkSwiperTab: function(e){
    console.log(e);
    var checkId = e.currentTarget.dataset.current;
    if (this.data.currentTab == checkId){
      return false;
    }
    this.setData({
      currentTab: checkId
    });
  },
   //手指刚放到屏幕触发
  bindLeftScrollStart: function(e){
    console.log(e);
    if(e.touches.length == 1){
      this.setData({
        //记录触摸起始位置的X坐标
        startX: e.touches[0].clientX
      });
    }
  },
  //触摸时触发，手指在屏幕上每移动一次，触发一次
  bindLeftScrollMove: function (e) {
    const that = this;
    if(e.touches.length == 1){
      var nowMoveX = e.touches[0].clientX;
      //计算手指起始点的X坐标与当前触摸点的X坐标的差值
      var disX = that.data.startX - nowMoveX;
      var btnWidth = that.data.removeStarBtnWidth;
      var itemStyle = "";
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，文本层位置不变
        itemStyle = "left:0px";
      } else if (disX > 0) {//移动距离大于0，文本层left值等于手指移动距离
        itemStyle = "left:-" + disX + "px";
        if (disX >= btnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度
          itemStyle = "left:-" + btnWidth + "px";
        }
      }
      //获取手指触摸的是哪一个item
      var index = e.currentTarget.dataset.index;
      console.log(index);
      var list = that.data.starData;
      //将拼接好的样式设置到当前item中
      list[index].itemStyle = itemStyle;
      //更新列表的状态
      this.setData({
        starData: list
      });
    }
  },
  bindLeftScrollEnd: function (e) {
    const that = this;
    if (e.changedTouches.length == 1){
      //手指移动结束后触摸点位置的X坐标
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = that.data.startX - endX;
      var btnWidth = that.data.removeStarBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var itemStyle = disX > btnWidth / 2 ? "left:-" + btnWidth + "px" : "left:0px";
      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index;
      var list = that.data.starData;
      list[index].itemStyle = itemStyle;
      //更新列表的状态
      that.setData({
        starData: list
      });
    }
  },
  bindRoomDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/home/detail?id=' + id
    })
  },
  checkPower: function (unionId){
    const that = this;
    wx.request({
      url: powerUrl,
      method: 'POST',
      data: { unionId: unionId },
      success: function (res) {
        var hasPower = false;
        if (res.data.code == 0) {
          if (res.data.authStatus != undefined && res.data.authStatus == 1) {
            hasPower = true;
          }
        }
        app.globalData.hasPublishPower = hasPower;
        that.setData({
          hasPublishPower: hasPower
        });
        console.log(that.data.hasPublishPower);
      }
    })
  },
  catchRemoveStar: function(e){
    const that = this;
    const postId = e.currentTarget.dataset.id;
    const wxUnionId = this.data.wxUnionId;
    wx.request({
      url: starUrl,
      method: "POST",
      data: {
        starType: 1,  //1-移除收藏
        wxUnionId: wxUnionId,
        postId: postId
      },
      success: function(res){
        if(res.data.code == 0){
          wx.showToast({
            title: "取消收藏成功.",
            icon: 'success',
            duration: 3000
          })
          that.getMyStarData(wxUnionId,true);
        }else{
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 5000
          })
        }
        
      }
    })
  }
})