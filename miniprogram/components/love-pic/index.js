// components/love-pic/index.js
const computedBehavior = require('miniprogram-computed')

Component({
  behaviors: [computedBehavior],
  /**
   * 组件的属性列表
   */
  properties: {
    isShow: {
      type: Boolean,
      value: false
    }
  },

  ready: function() {
    wx.cloud.callFunction({
      // 云函数名称
      name: 'getAllSmallImg',
      // 传给云函数的参数
      data: {
      },
    })
    .then(res => {
      this.setData(
        {
          // 云开发的静态资源的地址
          smallImgUrls: res.result.map(pic => `cloud://xxxxxxxxxxx/marry_imgs/调片入册_小/${pic}`),
          bigImgUrls: res.result.map(pic => `cloud://xxxxxxxxxxx/marry_imgs/调片入册/${pic}`),
        }
      )
    })
    .catch(console.error)
  },

  /**
   * 组件的初始数据
   */
  data: {
    smallImgUrls: [],
    bigImgUrls: []
  },
  computed: {
    rols(data) {
      const len = Math.ceil(data.smallImgUrls.length / 3);
      const arr = [];
      for (let i = 0; i < len; i++) {
        arr.push(i);
      }
      return arr;
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showPreview: function(e) {
      const { currentTarget: { dataset: { index } } } = e;
      const bigImgUrls = this.data.bigImgUrls;
      wx.previewImage({
        current: bigImgUrls[index], // 当前显示图片的http链接
        urls: bigImgUrls, // 需要预览的图片http链接列表
        showmenu: true
      })
    }
  }
})
