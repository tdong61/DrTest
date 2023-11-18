
(function ($) {
    "use strict";

    /*==================================================================
    [ Focus input ]*/
    $('.input100').each(function(){
        $(this).on('blur', function(){
            if($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        });
    })

    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    function CheckLogin(input){
        // Get the values entered by the user
        var enteredUsername = document.getElementById('username').value;
        var enteredPassword = document.getElementById('password').value;

        // Replace 'your_username' and 'your_password' with your actual username and password
        var validUsername = 'admin';
        var validPassword = '123';
        
        // Check if the entered username and password are valid
        if (enteredUsername === validUsername && enteredPassword === validPassword) {
            // Redirect to another HTML page upon successful validation
            window.open('staff.html')
        }

        return false;
    }

    $('.validate-form').on('submit',function(){
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }

        CheckLogin(input);

        return check;
    });

    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
            hideValidate(this);
        });
    });

    function validate(input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }


})(jQuery);
