//app.js
App({
  systemInfo: null,
  onLaunch: function () {
    const self = this;
    wx.getSystemInfo({
      success: function (res) {
        self.systemInfo = res;
        console.log(self.systemInfo);
      },
    })
    this.getApiCurrentVersion();
    console.log("App onLaunch...");
  },
  getApiCurrentVersion: function(){
    const self = this;
    wx.request({
      url: self.globalData.apiUrl+'/version/current',
      success: function(res){
        self.globalData.apiVersion = res.data.data.versionNum;
        self.globalData.filterMenuJson = JSON.parse(res.data.data.menuJson);
      }
    })
  },
  globalData: {
    userInfo: null,
    userDetail: null,
    apiVersion: '',
    filterMenuJson: [],
    hasPublishPower: false,
    apiUrl: 'https://www.monbuilder.top/api'
    //apiUrl: 'https://monbuilder.natappvip.cc/api'
  }
})