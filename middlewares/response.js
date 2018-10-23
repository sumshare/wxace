const debug = require('debug')('koa-weapp-demo')

/**
 * 响应处理模块
 */
module.exports = async function (ctx, next) {
    try {
        // 调用下一个 middleware
        // sumshare:全app第一个中间件，进入之后马上将控制权移交给下一个中间件
        // 等后面的中间件一个个返回之后就会执行接下来的内容
        // 从逻辑上讲就是请求的最后一步：响应
        // 这里请再次回顾koa中间件的流转次序
        await next()

        // 处理响应结果
        // 如果直接写入在 body 中，则不作处理
        // 如果写在 ctx.body 为空，则使用 state 作为响应
        ctx.body = ctx.body ? ctx.body : {
            code: ctx.state.code !== undefined ? ctx.state.code : 0  
        }
        if (ctx.state.message !== undefined) {
            ctx.body.message = ctx.state.message;
        }
        if (ctx.state.data !== undefined) {
            ctx.body.data = ctx.state.data
        }
    } catch (e) {
        // catch 住全局的错误信息
        debug('Catch Error: %o', e)

        // 设置状态码为 200 - 服务端错误
        ctx.status = 200

        // 输出详细的错误信息
        ctx.body = {
            code: -1,
            error: e && e.message ? e.message : e.toString()
        }
    }
}
