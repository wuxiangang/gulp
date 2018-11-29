$( document ).ajaxSuccess(function( event, request, settings ) {
	if (request.status === 200) {
	    switch(request.responseJSON.status_code) {
	    	case 8005:
	    		GLOBAL.Message.error('操作失败');
	    		break;
	    }
	}

	GLOBAL.loading.hide();

}).ajaxError(function( event, request, settings ) {
	var response = request.responseJSON;
	if (response && response.message) {
		GLOBAL.Message.error(response.message);
	} else if (response.error_msg) {
		GLOBAL.Message.error(response.error_msg);
	} else {
    	GLOBAL.Message.error('操作失败');
	}

});
