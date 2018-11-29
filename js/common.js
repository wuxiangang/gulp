var origin = location.origin;
var onLine = origin.indexOf('localhost') === -1 && origin.indexOf('172') === -1 && origin.indexOf('192') === -1;
var base_url, base_file, image_url;

$.ajax({
   url: onLine ? 'config/onlineConfig.json' : 'config/config.json',//json文件位置
   type: "GET",//请求方式为get
   dataType: "json", //返回数据格式为json
   async: false,
   success: function(data) {//请求成功完成后要执行的方法 
   	base_url = data.url;
   	base_file = data.fileUrl;
   	image_url = data.img;
   }
});

var GLOBAL = {
	Message: {
		timer: null,
		boxes: [],
		toast(text, cls) {
			if (!this.popver) {
				this.popver = document.createElement('div');
				this.popver.className = 'v-coast';
				this.popver.id = 'toast';
				document.body.appendChild(this.popver)
			}
			this.content(text, cls);
		},
		content(text, cls) {
			var content = document.createElement('div');
			var box = content.cloneNode();
			var span = document.createElement('span');
			var icon = span.cloneNode();
			var _this = this;
			var n = this.boxes.length;
			icon.className = 'iconfont ' + cls;
			span.innerHTML = text;
			content.appendChild(icon);
			content.appendChild(span);
			box.appendChild(content);
			this.boxes.push(box);
			this.popver.appendChild(box);
			box.className = 'move-up-enter-active';

			setTimeout(function(argument) {
				var time = 500 + n*300;
				setTimeout(function() {
					box.className = 'move-up-leave-active';
				}, n*300);
				setTimeout(function() {
					_this.popver.removeChild(_this.boxes.shift());
					if (!_this.boxes.length) _this.destory();
				}, time)
			}, 1500);
		},
		error(text) {
			this.toast(text, 'icon-error')
		},
		success(text) {
			this.toast(text, 'icon-success')
		},
		destory() {
			document.body.removeChild(this.popver);
			this.popver = null;
		}
	},
	loading: {
		show () {
			this.loading = document.createElement('div');
			this.loading.className = 'loading-wrapper';
			this.loading.innerHTML = '<div class="loading-box">'+
				'<img src="image/oval.svg" width="50" alt="">'+
			'</div>';
			document.body.appendChild(this.loading);
		},
		hide () {
			if (!this.loading) return;
			document.body.removeChild(this.loading);
			this.loading = null;
		}
	},
	ajax(options) {
		var _this = this;
		var isGet = options.method.toLowerCase() === 'get';
		// var token = this.getCookie('token');
		var url = base_url + options.url;

		if (isGet) url+= (url.indexOf('?')>=0 ? '&time=' : '?time=')+new Date().getTime();
		//var data = isGet ? options.data : JSON.stringify(options.data)

		$.ajax({
		  headers: {
		  	Session: this.getCookie('session')
		  },
		  type: options.method,
		  url: url,
		  // data to be added to query string:
		  data: isGet ? options.data : JSON.stringify(options.data),
		  // type of data we are expecting in return:
		  dataType: 'json',
		  timeout: 10000,
		  context: $('body'),
          contentType: 'application/json',
		  success: function(data){
		  	options.success && options.success(data)
		  },
		  error: function(xhr, type){
		  }
		})
	},
	files (data, success) {

		$.ajax({
            url: base_file+'/common/upload', //上传地址
            type: 'POST',
            cache: false,　　
            data: data,　　　　　　　　　　　　　//表单数据
            processData: false,
            contentType: false,
            success:function(data){
                success(data);
            }
        });
	},
	fragmentList (data) {
		var fragment = document.createDocumentFragment();
		var li = document.createElement('li');
		data.forEach(function(v, i) {
			var cls, pay_name, pay_id, account, last;
			switch(v.otc_ad_account_type) {
				case 1:
					cls = 'aly-pay';
					pay_name = '支付宝';
					pay_id = v.user_account_alipay_id;
					account = v.otc_account_info.alipay_account_name;
					last = v.otc_account_info.alipay_qrcode ? '<img class="qrcode" data-src=' + v.otc_account_info.alipay_qrcode + ' src="image/erweima.png" />' : ''
					break;
				case 2:
					cls = 'wx-pay';
					pay_name = '微信支付';
					pay_id = v.user_account_wechatpay_id;
					account = v.otc_account_info.wechatpay_account;
					last = v.otc_account_info.wechatpay_qrcode ? '<img class="qrcode" data-src=' + v.otc_account_info.wechatpay_qrcode + ' src="image/erweima.png" />' : ''
					break;
				case 3:
					cls = 'yh-pay';
					pay_name = '银行卡';
					pay_id = v.user_account_bank_id;
					account = v.otc_account_info.bank_code;
					last = v.otc_account_info.bank_name + v.otc_account_info.bank_branch;
					break;
				default:
					cls = 'pay-pay';
					pay_name = 'PayPal'
					pay_id = v.user_account_paypal_id;
					account = v.otc_account_info.paypal_account;
					last = '';
			}
			var li_clone = $(li).clone()
			li_clone.html('<div class="label"><label>' +
                    '<input type="radio" name="payment" typeid='+ v.otc_ad_account_type +' value=' + i + ' id="" class="a-radio">'+
                    '<span class="b-radio"></span></label>' +
                    '<div class="pay-way-box"><i class="icon ' + cls +'"></i>' +
                    '<span class="pay-way">'+ pay_name +'</span></div>' +
                    (v.otc_ad_account_type === 3 ?'<div class="bank"><div><div class="bottom-line">': '') + 
                    '<span class="pay-name">'+v.otc_account_info.otc_ader_name+'</span>' +
                    '<span class="pay-tel">' + account + '</span>' +
                    (v.otc_ad_account_type === 3 ?'</div>': '') + 
                    '<span >'+last+'</span>' +
                    (v.otc_ad_account_type === 3 ?'</div></div>': '') + 
					'</div>'
			)
			$(fragment).append(li_clone);
		})

		return fragment;
	},
	query(name) {
	     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	     var r = decodeURI(window.location.search).substr(1).match(reg);//search,查询？后面的参数，并匹配正则
	     if(r!=null)return  unescape(r[2]); return null;
	},
	setCookie(name, value) {  
	    var d = new Date();
	    d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
	    var expires = "expires=" + d.toUTCString();
	    document.cookie = name + "=" + value + "; " + expires;
	},
	getCookie(cname) {
	    let name = cname + "=";
	    let ca = document.cookie.split(';');
	    for (let i = 0; i < ca.length; i++) {
	      let c = ca[i].trim();
	      if (c.indexOf(name) == 0) return unescape(c.substring(name.length, c.length));
	    }
	    return "";
	}
}
