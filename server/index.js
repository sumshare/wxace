const config = require('../config/config.js');
const request = require('request-promise')
const CryptoJS = require('crypto-js') // 也可用node 自带crypto模块
var fs = require('fs');
var path = require('path')
let util = require('../util/index.js')
console.log(util)
// 生成缓存变量
let cache = require('../config/cache.js');
/**
 * 1. 启动时根据规则生成缓存变量，等待触发
 * 2. 获取签名时寻求ticket，如果内存中没有尝试从文件读取更新内存，依然没有则去重新获取
 * 3. 如果内存中有但是过期了则去重新获取
 * 4. 获取token
 */

// 获取并存储tiket
const get_jsapi_ticket = async (code) => {
    code = code || 'dev';
    let ca = util.findCache(cache, code);
    // 不在内存或者超时都重新获取tiket,设置一个比7200秒略小的值
    if (!ca.ticket || ((new Date()).getTime() - ca.ttime) > 7000000) {
        console.log('重新获取ticket')
        let link;
        await get_access_token(code).then(res => {
            let re = JSON.parse(res)
            link = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${re.access_token}&type=jsapi`;
        });
        let apromise = await request(link).then((res) => {
            /*
            {
        		"errcode":0,
        		"errmsg":"ok",
        		"ticket":"bxLdikRXVbTPdHSM05e5u5sUoXNKd8-41ZO3MhKoyN5OfkWITDGgnr2fwJ0m9E8NYzWKVZvdVtaUgWvsdshFKA",
        		"expires_in":7200
        	}
            */

            let rr = JSON.parse(res);
            return new Promise((resolve, reject) => {
                if (rr.errcode != undefined && rr.errcode == 0) {
                    cache.forEach(item => {
                        if (item.code == code) {
                            item.ticket = rr.ticket;
                            item.ttime = (new Date()).getTime()
                        }
                    });
                    resolve(res)
                } else {
                    reject(res)
                }
            }).catch(e => {
                throw new Error(e)
            });
        });
        return apromise;
    } else {
        console.log('从内存获取tiket')
        return Promise.resolve(JSON.stringify({
            "ticket": ca.ticket,
            "expires_in": 7200
        }));
    }
}

/**
 * privite获取普通的 access_token
 * @prams code 公众平台代码
 * @return promise
 */
const get_access_token = async (code) => {
    // 获取对应内存缓存
    let ca = util.findCache(cache, code);
    // 不在内存或超时都重新从接口获取
    if (!ca.access_token || ((new Date().getTime()) - ca.atime) > 7000000) {
        console.log('重新获取access_token')
        // 获取对应配置
        let wx = util.findCfg(config.wx, code);
        let link = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appId=${wx.appId}&secret=${wx.appSecret}`;
        // 异步操作处理
        let prom = await request(link).then((res) => {
            let rr = JSON.parse(res);
            return new Promise((resolve, reject) => {
                // 返回示例{"access_token":"ACCESS_TOKEN","expires_in":7200}
                if (!!rr.access_token) {
                    // 存入缓存
                    cache.forEach(item => {
                        if (item.code == code) {
                            item.access_token = rr.access_token;
                            item.atime = (new Date()).getTime()
                        }
                    });
                    resolve(res);
                    // {"errcode":40013,"errmsg":"invalid appid"}
                } else {
                    reject(res);
                }
            });
        }).catch(e => {
            throw new Error(e);
        });
        return prom;
    } else {
        // 否则从内存获取
        console.log('从内存获取access_token');
        return Promise.resolve(JSON.stringify({
            "access_token": ca.access_token,
            "expires_in": 7200
        }));
    }
}

// 获取JS签名方法
/**
 * @params {string} code 选择公众平台自定义代码
 * @params {string} url 完整的链接地址
 *
 */
const get_signature = async (code, url) => {
    // 字段名和字段值都采用原始值，URL不用encode
    let go = await get_jsapi_ticket(code).then(res => {
        let re = JSON.parse(res);
        let noncestr = util.getNonceStr();
        let timestamp = util.getTimesTamp();
        // 参数按照字段名的ASCII 码从小到大排序（字典序）
        let str = `jsapi_ticket=${re.ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`;
        let signature = CryptoJS.SHA1(str).toString();
        console.log(str)
        console.log(signature)
        let wx = util.findCfg(config.wx, code);
        let to = {
            appId: wx.appId,
            timestamp: timestamp,
            nonceStr: noncestr,
            signature: signature
        };
        return Promise.resolve(to)
    }).catch(e => {
        throw new Error(e)
    });
    return go
}

/*****---------------------------------******/

/**
 * API 获取普通的 access_token
 * 中间件
 */
let getAccessToken = async (ctx, next) => {
    if (ctx.request.body.code) {
        if (util.findCfg(config.wx, ctx.request.body.code)) {
            return get_access_token(ctx.request.body.code).then(res => {
                // 一般不会调用此接口，一旦调用更新缓存与缓存文件
                ctx.state.code = 'success';
                ctx.state.data = JSON.parse(res);
            }).catch(e => {
                throw new Error(e)
            });
        } else {
            ctx.state.code = -1002;
            ctx.state.message = '平台code错误';
        }
    } else {
        ctx.state.code = -1001;
        ctx.state.message = '请输入平台code';
    }
}

// 获取JS签名接口
/**
 * @params {string} code 选择公众平台自定义代码
 * @params {string} url 完整的链接地址
 *
 */
const getSignature = async (ctx, next) => {
    if (!ctx.request.body.code) {
        ctx.state.code = -1002;
        ctx.state.message = '平台code错误';
    }
    if (!ctx.request.body.url) {
        ctx.state.code = -1002;
        ctx.state.message = '缺少url';
    }
    if (ctx.request.body.code && ctx.request.body.url) {
        return get_signature(ctx.request.body.code, ctx.request.body.url).then(res => {
            ctx.state.code = 'success';
            ctx.state.data = res;
        });
    }
}

const getTicket = async (ctx, next) => {
    if (ctx.request.body.code) {
        if (util.findCfg(config.wx, ctx.request.body.code)) {
            return get_jsapi_ticket(ctx.request.body.code).then(res => {
                ctx.state.code = 'success';
                ctx.state.data = JSON.parse(res);
            }).catch(e => {
                throw new Error(e)
            })
        } else {
            ctx.state.code = -1002;
            ctx.state.message = '平台code错误';
        }
    } else {
        ctx.state.code = -1001;
        ctx.state.message = '请输入平台code';
    }
}
module.exports = {
    getAccessToken,
    getTicket,
    getSignature
}