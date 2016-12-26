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
        method = 'window.JSInterface.'+interfaceName+'(args)';
    }else{
        method = 'window.webkit.messageHandlers.'+interfaceName+'.postMessage(args)';
    }
    try{
        eval(method);
    } catch(e){
        console.log(e);
    }
}


export default {
    callClientInterface,
    getUrlParam,
}
