function params(obj) {
    var arr = [];
    for (var i in obj) {
        arr.push(i + '=' + encodeURIComponent(obj[i]));
    }
    return '?' + arr.join('&');
}

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]); return null;
}

function callClientInterface(interfaceName, args){
    var ua = navigator.userAgent.toLowerCase();
    var method = '';
    if(ua.indexOf('iphone') > -1){
        var  args = JSON.stringify(args);
        method = 'window.webkit.messageHandlers.'+interfaceName+'.postMessage(args)';
    }else{
        method = 'window.JSInterface.'+interfaceName+'(args)';
    }
    try{
        eval(method);
    } catch(e){
        console.log(e);
    }
}

function ping(options){
    var img = document.createElement('img');
    img.src='https://ping.weshineapp.com/viewdetail.gif'+ params(options) +'&t=' + (new Date()).getTime();
}


export default {
    callClientInterface,
    getUrlParam,
    ping
}
