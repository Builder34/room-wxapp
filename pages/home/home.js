// pages/home/home.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js');
const homeUrl = app.globalData.apiUrl + '/ziroom/home';
const powerUrl = app.globalData.apiUrl + '/ziroom/power';
const versionUrl = app.globalData.apiUrl + '/version/current';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    downmenu: [],
    queryParams: {},
    userUnionId: '',
    windowHeight: app.systemInfo.windowHeight,
    windowWidth: app.systemInfo.windowWidth,
    searchValue: '',
    roomList:[],
    isAppendData: true,
    isLoading: false,
    isNoMore: false,
    nextPage: 1,
    hasPublishPower: app.globalData.hasPublishPower,
    apiVersion: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    var unionId = wx.getStorageSync('wx-unionid');
    console.log('unionId: ' + unionId);
    this.setData({
      userUnionId: unionId,
      downmenu: app.globalData.filterMenuJson,
      apiVersion: app.globalData.apiVersion
    });
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("onReady...");
    console.log(this.data.downmenu);
    console.log(app.globalData.apiVersion);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("onShow...");
    const that = this;
    var unionId = that.userUnionId;
    if(unionId == undefined){
      unionId = wx.getStorageSync('wx-unionid');
    }
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
    });
    this.bindQueryHandler();
  },
  /**
     * 用户点击右上角分享
     */
  onShareAppMessage: function () {
    console.log("onShareAppMessage...");
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("onHide...");
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("onUnload...");
  },
  bindLocation: function(){
    wx.showToast({
      title: '目前暂时只支持广州地区',
      icon: 'none',
      duration: 3000
    });
  },
  bindGotoMyPage: function(){
    wx.navigateTo({
      url: '/pages/my/my?title=我的',
    });
  },
  bindRoomDetail: function(e){
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/home/detail?id='+id
    })
  },
  bindFilterChoose: function(e){
    const index = e.currentTarget.dataset.index;
    console.log(index);
    var downmenuData = this.data.downmenu;
    for(var i in downmenuData){
      if( i == index){
        downmenuData[i].active = !downmenuData[i].active;
      }else{
        downmenuData[i].active = false;
      }
    }
    this.setData({
      downmenu: downmenuData
    });

  },
  bindFilterSearch: function(e){
    const index = e.currentTarget.dataset.index;
    const checkedValue = e.currentTarget.dataset.value;
    var queryParams = this.data.queryParams;
    var downmenuData = this.data.downmenu;
    for (var i in downmenuData) {
      if (i == index) {
        downmenuData[i].checkedValue = checkedValue;
      }
      switch(i){
        case '0':
          if(this.data.apiVersion == 'v.final'){
            queryParams.areaTown = downmenuData[i].checkedValue;
          }else{
            queryParams.roomDecorate = downmenuData[i].checkedValue;
          }
          break;
        case '1':
          queryParams.roomFeature = downmenuData[i].checkedValue;
          break;
        case '2':
          queryParams.roomRenter = downmenuData[i].checkedValue;
          break;
        case '3':
          var prices = downmenuData[i].checkedValue.split('-');
          queryParams.startPrice = prices[0];
          queryParams.endPrice = prices[1];
          break;
        case '4':
          var orderBys = downmenuData[i].checkedValue.split('-');
          queryParams.sidx = orderBys[0];
          queryParams.order = orderBys[1];
          break;
      } 
    }
    this.setData({
      downmenu: downmenuData,
      queryParams: queryParams,
      isAppendData: false
    });
    this.bindFilterChoose(e);
    this.bindQueryRoom();
  },
  bindQueryHandler: function(){
    const that = this;
    that.setData({
      isAppendData: false
    });
    if (app.globalData.apiVersion == '') {
      wx.request({
        url: versionUrl,
        success: function (res) {
          that.setData({
            downmenu: JSON.parse(res.data.data.menuJson),
            apiVersion: res.data.data.versionNum
          });
          that.bindQueryRoom();
        }
      })
    }else{
      that.bindQueryRoom();
    }
  },
  bindQueryInput: function (e) {
    const params = this.data.queryParams;
    params.keyword = e.detail.value;
    this.setData({
      queryParams: params
    });
  },
  bindQueryRoom: function(){
    const that = this;
    const queryParams = that.data.queryParams;
    queryParams.versionNum = that.data.apiVersion;
    wx.showLoading({
      title: that.data.apiVersion == "v.final" ? '正在加载房源...': '正在加载...',
    });
    wx.request({
      url: homeUrl,
      method: 'POST',
      data: queryParams,
      success: function (res) {
        wx.hideLoading();
        if(res.data.code == 0){
          wx.showToast({
            title: '共' + res.data.page.totalCount + (that.data.apiVersion == "v.final" ? '个房源':'个记录'),
          })
          if (res.data.code == 0) {
            let newList = res.data.page.list;
            if (that.data.isAppendData) {
              newList = that.data.roomList.concat(newList);
            }
            var isNoMore = res.data.page.currPage == res.data.page.totalPage;
            if (res.data.page.totalPage == 0) {
              isNoMore = true;
            }
            that.setData({
              roomList: newList,
              isNoMore: isNoMore,
              nextPage: isNoMore ? res.data.page.currPage : res.data.page.currPage + 1
            });
            console.log(that.data);
          } else {
            wx.showToast({
              title: '' + res.data.msg,
              icon: 'none',
              duration: 3000
            })
          }
        }else{
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 4000
          })
        }
      },
      fail: function (res) {
        console.log(res);
        wx.showToast({
          title: '后台服务出错，请稍后再试',
          icon: 'none',
          duration: 3000
        })
      }
    });
  },
  bindRefreshFirstPage: function(){
    console.log('下拉刷新');
  },
  bindLoadMore: function(){
    console.log('上拉加载');
    const that = this;
    const isLoading = that.data.isLoading;
    const queryParams = that.data.queryParams;
    if (isLoading) {
      return;
    }
    that.setData({
      isLoading: true,
    });
    wx.request({
      url: homeUrl,
      method: 'POST',
      data: queryParams,
      success: function(res){
        that.setData({
          isLoading: false,
        });
      }
    })
  }
})