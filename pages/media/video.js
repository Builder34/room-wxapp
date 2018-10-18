// pages/media/video.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: app.systemInfo.windowHeight,
    windowWidth: app.systemInfo.windowWidth,
    videoUrl:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      videoUrl: options.url
    });
    this.videoContext = wx.createVideoContext('prew_video');
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var videoContext = this.videoContext;
    videoContext.seek(0);
    videoContext.play();
  },

})