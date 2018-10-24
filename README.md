# wxace

微信JS-JDK配置中控服务器，通过内存缓存access_token和ticket，支持跨域访问。


### 配置流程
1. 
```
git clone https://github.com/sumshare/wxace.git

```
2.
```
npm i
```
3. 配置config文件，端口号与公众号
```
	port: '8099',
    // 微信配置，支持配置多个公众号
    // 示例是测试公众号，可以免费申请
    wx: [{
        code: 'dev',
        appId: 'wxc91b62feab11b585',
        appSecret: 'your appSecret'
    },{
    	code: 'project',
        appId: 'wxc91b62feab11b585',
        appSecret: 'your appSecret'
    }]
```
4. 使用pm2启动服务
5. nginx相关配置
6. 测试
```
$.ajax({
   url: '/getSignature',
   type: 'post',
   data: {
      code: 'dev',
      url: location.href.split('#')[0] 
   },
   success:function(r) {}  
})
```


7. API
#### 请求URL：
```
/getSignature
```

#### 示例：
[https://wx.sumshare.cn/api/index.html](https://wx.sumshare.cn/api/index.html)

#### 请求方式：
```
POST
```

#### 参数

|参数|是否必选|类型|说明|
|:-----|:-------:|:-----|:-----|
|code      |Y       |string  |公众号自定义代码|
|url      |Y       |string  |一般用location.href.split('#')[0] |



#### 返回示例：

```
{
    "code":"success",
    "data":{
        "appId":"wxc91b62feab11b585",
        "timestamp":"1540350904",
        "nonceStr":"bhkplt1zph4",
        "signature":"f0d6db46c20f5af7a7640556164def1b68c4d0be"
    }
}
```



### 注意事项
- 虽然接口支持跨域访问，但如果配置微信自定义分享功能，链接必须是设置好的JS接口安全域名下
- 部署的服务器需要配置到公众号IP白名单才能正常获取access_token
  ![IP白名单](http://qn.sumshare.cn/18-10-24/7755544.jpg)
- 生产环境公众号和测试号都需要配置安全域名
 ![安全域名](http://qn.sumshare.cn/18-10-24/21150422.jpg)
 ![安全域名](http://qn.sumshare.cn/18-10-24/27433378.jpg)
















