const router = require('koa-router')()
const ser = require('../server');
/*--POST--*/
router.post('/getAccessToken', ser.getAccessToken)
router.post('/getTicket', ser.getTicket)
router.post('/getSignature', ser.getSignature)
module.exports = router