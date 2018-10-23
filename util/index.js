function getTimesTamp() {
    return parseInt((new Date()).getTime() / 1000) + '';
}

function getNonceStr() {
    return Math.random().toString(36).substr(2, 15);
}

let findCfg = (ar, code) => {
    return ar.find((n) => n.code == code)
}
let findCache = (ar, code) => {
    return ar.find((n) => n.code == code)
}

module.exports = {
    getTimesTamp,
    getNonceStr,
    findCache,
    findCfg
}