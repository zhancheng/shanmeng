/**
@name echo.js
@descibe 图片延迟加载插件
@lastmodify by zhancheng  新增wrapper参数 ，可以将外层滚动元素设置成具体dom
*/
var lazyload = (function(window, document, undefined) {
	'use strict';
	var store = [],
		offset, throttle, poll, wrapper;
	var _inView = function(el) {
			var coords = el.getBoundingClientRect();
			return ((coords.top >= 0 && coords.left >= 0 && coords.top) <= (window.innerHeight || document.documentElement.clientHeight) + parseInt(offset));
		};
	var _pollImages = function() {
			for (var i = store.length; i--;) {
				var self = store[i];
				if (_inView(self)) {
					self.src = self.getAttribute('data-echo');
					store.splice(i, 1);
				}
			}
		};
	var _throttle = function() {
			clearTimeout(poll);
			poll = setTimeout(_pollImages, throttle);
		};
	var init = function(obj) {
			var nodes = document.querySelectorAll('[data-echo]');
			var opts = obj || {};
			offset = opts.offset || 0;
			throttle = opts.throttle || 250;
			wrapper = opts.wrapper || null;
			for (var i = 0; i < nodes.length; i++) {
				store.push(nodes[i]);
			}
			_throttle();
			if (document.addEventListener) {
				if(wrapper){
					wrapper.addEventListener('scroll', _throttle, false);
				}else{
					window.addEventListener('scroll', _throttle, false);
				}
			} else {
				window.attachEvent('onscroll', _throttle);
			}
		};
	return {
		init: init,
		render: _throttle
	};
})(window, document);

module.exports = lazyload;
