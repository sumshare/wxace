# wxace
micro messenge(wx) jssdk middle server, JS-SDK config information API




```
port: '8099',
    // 微信配置，支持配置多个公众号
    // 示例是测试公众号，可以免费申请
    wx: [{
        code: 'dev',
        appId: 'wxc91b62feab11b585',
        appSecret: 'your appSecret'
    }]
```


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
![ss](http://qn.sumshare.cn/18-10-24/69187799.jpg)
![ssss](http://qn.sumshare.cn/18-10-24/21150422.jpg)
![ssd](http://qn.sumshare.cn/18-10-24/27433378.jpg)
![ddd](http://qn.sumshare.cn/18-10-24/7755544.jpg)
```
$.ajax({
   url: '/api/getSignature',
   type: 'post',
   data: {
      code: 'dev',
      url: location.href.split('#')[0] 
   },
   success:function(r) {}  
})
```


