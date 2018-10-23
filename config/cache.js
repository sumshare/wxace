// 缓存对象
const config = require('./config.js');
let cache = [];
config.wx.forEach(item => {
    let temp = {
        code: item.code,
        access_token: null,
        atime: null, //access_token获取时间
        ticket: null,
        ttime: null // ticket获取时间
    };
    cache.push(temp)
});
module.exports = cache