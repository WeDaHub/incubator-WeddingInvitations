// 云函数入口文件
const cloud = require('wx-server-sdk')
const moment = require('moment')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV || 'xxxxxxxxx'
})

// 云函数入口函数
const db = cloud.database()
exports.main = async (event, context) => {
  const { danmu } = event;
  const createTime = moment().format('YYYY-MM-DD HH:mm:ss');
  Object.assign(danmu, { createTime, status: 0 });
  // collection 上的 get 方法会返回一个 Promise，因此云函数会在数据库异步取完数据后返回结果
  return db.collection('danmu').add({ data: danmu });
}