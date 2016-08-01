$(document).ready(function () {
   
	$('#authform').validate({
        rules: {
        	txtmobno: {
                minlength: 12,
                required: true
            },
            txtemail: {
                required: true,
                email: true
            },
            txtpass: {
                minlength: 2,
                required: true
            },
            txtrepass: {
                minlength: 2,
                required: true
            }
        },
        highlight: function (element) {
            $(element).closest('.control-group').removeClass('success').addClass('error');
        },
        success: function (element) {
            element.text('OK!').addClass('valid')
                .closest('.control-group').removeClass('error').addClass('success');
        }
	})
})