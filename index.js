const Koa = require('koa')
const app = new Koa()
const debug = require('debug')('koa-weapp-demo')
//const logger = require('koa-logger');
const response = require('./middlewares/response')
const bodyParser = require('koa-bodyparser')
const config = require('./config/config.js')
const path = require('path')
var serve = require('koa-static');
var cors = require('koa2-cors');
app.on('error', function(err, ctx) {
    console.log('server error', err);
});
// 跨域中间件
app.use(cors());
// 设置静态服务器
app.use(serve(path.resolve('dist')));
app.use(response)
console.log(process.env.NODE_ENV)
// 解析请求体
app.use(bodyParser({
    enableTypes: ['json', 'form', 'text']
}))
//app.use(logger())
app.use(async function(ctx, next) {
    let start = new Date;
    await next();
    let ms = new Date - start;
    console.log('%s %s - %s', ctx.method, ctx.url, ms);
});
// 引入路由分发
const router = require('./router')
app.use(router.routes())

// 启动程序，监听端口
app.listen(config.port, () => {
    console.log('server start');
});