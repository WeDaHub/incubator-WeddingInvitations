Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow: {
      type: Boolean,
      value: false
    }
  },
  data: {
    lineHeight: 24,
    emojiShow: false,
    comment: '',
    name: '',
    focus: false,
    cursor: 0,
    _keyboardShow: false,
    emojiSource: 'https://xxxxxx/emoji-sprite.png',
    wishComment: [],
    isAuthorizeUserInfo: false,
    isShowWishInput: false,
    userInfo: {}
  },

  ready() {
    const emojiInstance = this.selectComponent('.mp-emoji')
    this.emojiNames = emojiInstance.getEmojiNames()
    this.parseEmoji = emojiInstance.parseEmoji

    wx.showLoading({
      title: '祝福传送中',
    })
    this.fetchAllWishes().then(wishes => {
      const parseWishes = this.transWishData(wishes);
      this.setData({
        wishComment: parseWishes
      })
      wx.hideLoading();
    })
    this.fetchUserInfo();
    this.watchDb();
  },

  lifetimes: {
    detached() {
      this.watcher.close();
    }, 
  },

  methods: {
    transWishData(wishes) {
      const parseWishes = wishes.map(wish => {
        const { content, avatarUrl, nickName, ...rest } = wish;
        const parsedCommnet = this.parseEmoji(content)
        return {
          ...rest,
          parsedCommnet,
          avatarUrl,
          isWxUser: !!avatarUrl,
          nickName,
          firstChartNicKName: nickName.slice(0, 1)
        }
      })
      return parseWishes;
    },
    watchDb() {
      const _self = this;
      const db = wx.cloud.database()
      _self.watcher = db.collection('wish')
        .where({ status: 1 })
        .orderBy('time', 'desc')
        // 取按 orderBy 排序之后的前 20 个
        .limit(20)
        .watch({
          onChange: function (snapshot) {
            console.log(snapshot);
            const { type, docChanges, docs } = snapshot;
            // 非初始化数据
            if(type !== 'init') {
              /* const wishs = docChanges.map(({ doc }) => doc)
              const newWishData = _self.transWishData(wishs);
              _self.setData({
                wishComment: newWishData.concat(_self.data.wishComment)
              }); */
              const newWishData = _self.transWishData(docs);
              _self.setData({
                wishComment: newWishData
              });
            }
          },
          onError: function (err) {
            console.error('the watch closed because of error', err)
          }
        })
    },
    showInputWish() {
      this.setData({
        isShowWishInput: true
      })
    },
    hideInputWish() {
      this.setData({
        isShowWishInput: false
      })
    },
    bindGetUserInfo(res) {
      const { detail } = res;
      const { userInfo } = detail;
      if (userInfo) {
        this.setData({
          isAuthorizeUserInfo: true,
          userInfo: userInfo || {}
        })
      }
      this.setData({
        isShowWishInput: true
      })
    },
    fetchUserInfo() {
      const self = this;
      // 查看是否授权
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.userInfo']) {
            self.setData({
              isAuthorizeUserInfo: true
            })
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称
            wx.getUserInfo({
              success: function (res) {
                console.log(res);
                self.setData({
                  userInfo: res.userInfo
                })
              },
              fail: function (res) {
                console.log(res);
              }
            })
          }
        }
      })
    },
    async fetchAllWishes() {
      // 获取所有祝福信息
      const resp = await wx.cloud.callFunction({
        // 云函数名称
        name: 'getAllWishes',
        // 传给云函数的参数
        data: {
        },
      });
      return resp?.result?.data || [];
    },
    onkeyboardHeightChange(e) {
      const { height } = e.detail
      this.setData({
        keyboardHeight: height
      })
    },

    hideAllPanel() {
      this.setData({
        emojiShow: false
      })
    },
    showEmoji() {
      this.setData({
        emojiShow: this.data._keyboardShow || !this.data.emojiShow
      })
    },
    showFunction() {
      this.setData({
        emojiShow: false
      })
    },
    chooseImage() { },
    onFocus() {
      this.data._keyboardShow = true
      this.hideAllPanel()
    },
    onBlur(e) {
      this.data._keyboardShow = false
      this.data.cursor = e.detail.cursor || 0
    },
    onNameInput(e) {
      const value = e.detail.value
      this.data.name = value
    },
    onInput(e) {
      const value = e.detail.value
      this.data.comment = value
    },
    onConfirm() {
      this.onsend()
    },
    insertEmoji(evt) {
      const emotionName = evt.detail.emotionName
      const { cursor, comment } = this.data
      const newComment =
        comment.slice(0, cursor) + emotionName + comment.slice(cursor)
      this.setData({
        comment: newComment,
        cursor: cursor + emotionName.length
      })
    },
    onsend() {
      const { comment, name, userInfo } = this.data
      const { nickName, avatarUrl } = userInfo || {};
      const wish = {
        nickName: name ? name : nickName,
        content: comment,
        avatarUrl
      }
      if(!wish.nickName || !wish.content) {
        wx.showToast({
          title: '请输入姓名和祝福语',
          icon: 'none',
        })
        return;
      }
      wx.showLoading({
        title: '祝福传送中...',
      })
      // 获取所有祝福信息
      wx.cloud.callFunction({
        // 云函数名称
        name: 'addWish',
        // 传给云函数的参数
        data: {
          wish
        },
      }).then(() => {
        this.hideAllPanel()
        this.hideInputWish()
        this.setData({
          comment: ''
        })
        wx.showToast({
          title: '收到，感谢',
          icon: 'success',
          duration: 2000
        })
      }).catch(() => {
        wx.showToast({
          title: '失败了，重发下',
          icon: 'error',
          duration: 2000
        })
      }).finally(() => {
        wx.hideLoading()
        this.hideInputWish()
      });
    },
    deleteEmoji: function () {
      const pos = this.data.cursor
      const comment = this.data.comment
      let result = '',
        cursor = 0

      let emojiLen = 6
      let startPos = pos - emojiLen
      if (startPos < 0) {
        startPos = 0
        emojiLen = pos
      }
      const str = comment.slice(startPos, pos)
      const matchs = str.match(/\[([\u4e00-\u9fa5\w]+)\]$/g)
      // 删除表情
      if (matchs) {
        const rawName = matchs[0]
        const left = emojiLen - rawName.length
        if (this.emojiNames.indexOf(rawName) >= 0) {
          const replace = str.replace(rawName, '')
          result = comment.slice(0, startPos) + replace + comment.slice(pos)
          cursor = startPos + left
        }
        // 删除字符
      } else {
        let endPos = pos - 1
        if (endPos < 0) endPos = 0
        const prefix = comment.slice(0, endPos)
        const suffix = comment.slice(pos)
        result = prefix + suffix
        cursor = endPos
      }
      this.setData({
        comment: result,
        cursor: cursor
      })
    }
  }
})
