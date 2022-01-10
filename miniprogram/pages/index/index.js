//index.js
const app = getApp()
const tabs = ['welcome', 'pic', 'video', 'wish']

Page({
  data: {
    currentTab: 'welcome',
    list: [
      {
        "text": "我们结婚啦",
        "iconPath": '../../../images/hi.png',
        "selectedIconPath": "../../../images/hi_on.png"
      },
      {
        "text": "我们的照片",
        "iconPath": "../../../images/pic.png",
        "selectedIconPath": "../../../images/pic_on.png"
      },
      {
        "text": "我们的视频",
        "iconPath": "../../../images/video.png",
        "selectedIconPath": "../../../images/video_on.png"
      },
      {
        "text": "大家的祝福",
        "iconPath": "../../../images/wish.png",
        "selectedIconPath": "../../../images/wish_on.png"
      }
    ],
    musicIcon: {
      play: '../../images/play.png',
      pause: '../../images/pause.png'
    },
    musicIconAnim: '',
    musicPaused: false
  },

  tabChange(e) {
    const { detail: { index } } = e;
    this.setData({ currentTab: tabs[index] });
    // 获取音乐当前播放的状态
    const musicPaused = this.audioMusic.paused;
    // 切换到视频的时候暂停
    if (index === 2) {
      !musicPaused && this.audioMusic.pause();
    } else {
      musicPaused && !this.data.musicPaused && this.audioMusic.play();
    }
  },

  swtichPlay() {
    if (this.data.musicPaused) {
      this.setData({
        musicPaused: false
      })
      this.audioMusic.play();
    } else {
      this.setData({
        musicPaused: true
      })
      this.audioMusic.pause();
    }
  },

  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    // 播放音乐
    this.audioMusic = wx.createInnerAudioContext();
    this.audioMusic.src = 'https://xxxx/bgMusic.mp3';
    this.audioMusic.loop = true;
    this.audioMusic.play()

    // 显示分享页面
    wx.showShareMenu({ menus: ['shareAppMessage'] })
  },

  onShow: function () {
    if (!this.data.musicPaused && this.audioMusic.paused) {
      this.audioMusic.play();
    }
  }
})
