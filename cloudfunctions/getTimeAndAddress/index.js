// 云函数入口函数
exports.main = async (event, context) => {
  return {
    time: '2021年05月01日12时00分',
    chineseTime: '农历:三月二十(周六)',
    hotel: '南昌前胡迎宾馆',
    address: '江西省南昌市红谷滩区红角洲学府大道888号(前胡迎宾馆抚河厅)',
    latitude: 28.660664,//要去的纬度-地址
    longitude: 115.817318,//要去的经度-地址
    remark: '黄亚伟和谭彤云 诚邀您前往参加婚礼'
  }
}