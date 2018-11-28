window.onload = function(event) {
    var scrollBox = document.getElementsByClassName('inside-msg-box')[0];
    var messagesBox = document.getElementsByClassName('inner-box')[0];
    var inputBox = document.getElementsByClassName('input-box')[0];
    var sendBtn = document.getElementsByClassName('send-btn')[0];
    var signupBtn = document.getElementsByClassName('signup-btn')[0];
    var loginBtn = document.getElementsByClassName('login-btn')[0];
    var signupTabLink = document.getElementById('signup-tab-link');
    var loginTabLink = document.getElementById('login-tab-link');
    var signupForm = document.getElementById('signup-form');
    var loginForm = document.getElementById('login-form');
    var backdrop = document.getElementById('auth-modal-backdrop');
    var authModal = document.getElementById('auth-modal');
    var authBox = document.getElementById('auth-box');
    var signupEmailInput = document.getElementById('signup-email-input');
    var signupPwdInput = document.getElementById('signup-pwd-input');
    var rePwdInput = document.getElementById('re-pwd-input');
    var signupFormBtn = document.getElementById('signup-form-btn');
    var loginFormBtn = document.getElementById('login-form-btn');
    var checkSignupEmail = document.getElementById('check-signup-email');
    var checkSignupPwd = document.getElementById('check-signup-pwd');
    var checkSignupRePwd = document.getElementById('check-signup-re-pwd');
    var srvResponse = document.getElementById('srv-response');

    var chatSocket = new WebSocket('ws://localhost:8080/chat');

    // who = 0 => My own message
    // who = 1 => Others message
    function newMessage(data, who) {
        var el = document.createElement('div');
        el.className = who === 0 ? 'own-message' : 'message';
        el.innerHTML = data;
        messagesBox.appendChild(el);
        scrollToBottom()
    }

    function scrollToBottom() {
        scrollBox.scrollTop = scrollBox.scrollHeight;
    }

    function post(url, data, successCB, errorCB) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function(ev) {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                successCB && successCB(this.response);
            }
            if (this.readyState === XMLHttpRequest.DONE && this.status !== 200) {
                errorCB && errorCB(this.statusText);
            }
        }
        var strData = Object.entries(data).reduce(function(str, arr) {
            str += arr[0] + '=' + arr[1] + '&';
            return str;
        }, '');
        
        xhr.send(encodeURI(strData.slice(0, -1)));
    }

    chatSocket.onopen = function(event) {
        console.log("OPEN", event);
    }
    chatSocket.onmessage = function(event) {
        newMessage(event.data, 1);
        console.log("MESSAGE", event);
    }
    chatSocket.onclose = function(event) {
        console.log("CLOSE", event);
    }
    chatSocket.onerror = function(event) {
        console.log("ERROR", event);
    }
    
    sendBtn.onclick = function() {
        chatSocket.send(inputBox.value);
        newMessage(inputBox.value, 0);
        inputBox.value = '';
    }

    signupTabLink.onclick = function(ev) {
        loginForm.className = "login-form";
        loginTabLink.className = "";
        signupForm.className = "signup-form active-form";
        signupTabLink.className = "active-tab";
    }

    loginTabLink.onclick = function() {
        signupForm.className = "signup-form";
        signupTabLink.className = "";
        loginForm.className = "login-form active-form";
        loginTabLink.className = "active-tab";
    }

    backdrop.onclick = function() {
        authBox.className = "auth-box";
        setTimeout(function() {
            authModal.className = "hide";
        }, 300);
    }

    signupBtn.onclick = function() {
        loginForm.className = "login-form";
        loginTabLink.className = "";
        signupForm.className = "signup-form active-form";
        signupTabLink.className = "active-tab";
        authModal.className = "auth-modal";
        setTimeout(function() {
            authBox.className = "auth-box slide-down";
        }, 100);
    }
    loginBtn.onclick = function() {
        signupForm.className = "signup-form";
        signupTabLink.className = "";
        loginForm.className = "login-form active-form";
        loginTabLink.className = "active-tab";
        authModal.className = "auth-modal";
        setTimeout(function() {
            authBox.className = "auth-box slide-down";
        }, 100);
    }

    function prepend(el, htmlContent) {
        var tmpEl = document.createElement('div');
        tmpEl.innerHTML = htmlContent.trim();
        var elToInsert = tmpEl.firstChild;
        el.insertBefore(elToInsert, el.firstElementChild);
    }
    function append(el, htmlContent) {
        var tmpEl = document.createElement('div');
        tmpEl.innerHTML = htmlContent.trim();
        var elToInsert = tmpEl.firstChild;
        el.insertBefore(elToInsert);
    }
    function before(el, htmlContent) {
        var tmpEl = document.createElement('div');
        tmpEl.innerHTML = htmlContent.trim();
        var elToInsert = tmpEl.firstChild;
        el.parentElement.insertBefore(elToInsert, el);
    }
    function after(el, htmlContent) {
        var tmpEl = document.createElement('div');
        tmpEl.innerHTML = htmlContent.trim();
        var elToInsert = tmpEl.firstChild;
        el.parentElement.insertBefore(elToInsert, el.nextElementSibling);
    }

    var emailValidRE = /([a-zA-Z0-9]|\.|_)+@[a-zA-Z]+\.[a-zA-Z]+/,
        lowerCaseRE = /.*[a-z]+.*/,
        upperCaseRE = /.*[A-Z]+.*/,
        digitsRE = /.*[0-9]+.*/,
        symbolsRE = /.*[^a-zA-Z0-9 \t\n]+.*/
    ;

    function nrOfMatches(str) {
        var n = 0;
        if (lowerCaseRE.test(str)) ++n;
        if (upperCaseRE.test(str)) ++n;
        if (digitsRE.test(str)) ++n;
        if (symbolsRE.test(str)) ++n;
        return n;
    }

    var emailErr = !emailValidRE.test(signupEmailInput.value),
        pwdErr = (signupPwdInput.value.length <= 5 || nrOfMatches(signupPwdInput.value) <= 1),
        pwdMatchErr = signupPwdInput.value !== rePwdInput.value;
    
    signupEmailInput.onkeyup = function(ev) {
        var val = signupEmailInput.value;
        if (val.length === 0) {
            emailErr = true;
            checkSignupEmail.className = "hide";
            return;
        }
        if (!emailValidRE.test(val)) {
            emailErr = true;
            checkSignupEmail.innerHTML = "Invalid email address"
            checkSignupEmail.className = "danger"
        } else {
            emailErr = false;
            checkSignupEmail.innerHTML = "";
            checkSignupEmail.className = "";
        }
    }

    function checkPwd() {
        var val = signupPwdInput.value;
        if (val.length === 0) {
            pwdErr = true;
            checkSignupPwd.className = "hide";
            return;
        }
        if (val.length <= 5 || nrOfMatches(val) <= 1) { // weak
            pwdErr = true;
            checkSignupPwd.firstElementChild.innerHTML = "Weak password";
            checkSignupPwd.className = "pwd-secure weak";
        } else if (val.length <= 8 || nrOfMatches(val) <= 2) { // medium
            pwdErr = false;
            checkSignupPwd.firstElementChild.innerHTML = "Medium password";
            checkSignupPwd.className = "pwd-secure medium";
        } else if (val.length < 10 || nrOfMatches(val) <= 3) { // good
            pwdErr = false;
            checkSignupPwd.firstElementChild.innerHTML = "Good password";
            checkSignupPwd.className = "pwd-secure good";
        } else { // strong
            pwdErr = false;
            checkSignupPwd.firstElementChild.innerHTML = "Strong password";
            checkSignupPwd.className = "pwd-secure strong";
        }
    }
    function checkMatchPwd() {
        var pwd1 = signupPwdInput.value,
            pwd2 = rePwdInput.value
        ;
        if (pwd2.length === 0) {
            pwdMatchErr = true;
            checkSignupRePwd.className = "hide";
            return;
        }
        if (pwd1 !== pwd2) {
            pwdMatchErr = true;
            checkSignupRePwd.innerHTML = "Passwords don't match"
            checkSignupRePwd.className = "danger"
        } else {
            pwdMatchErr = false;
            checkSignupRePwd.innerHTML = "";
            checkSignupRePwd.className = "";
        }
    }

    signupPwdInput.onkeyup = function(ev) {
        checkPwd();
        checkMatchPwd();
    }
    rePwdInput.onkeyup = function(ev) {
        checkPwd();
        checkMatchPwd();
    }

    signupFormBtn.onclick = function(ev) {
        if (emailErr || pwdErr || pwdMatchErr) {
            srvResponse.innerHTML = "Completați corect câmpurile!";
            srvResponse.className = "danger";
            return;
        }
        srvResponse.innerHTML = "";
        srvResponse.className = "hide";
        post('../server/api/signup.php',
            {
                email: signupEmailInput.value,
                password: signupPwdInput.value
            },
            function(ev) {
                console.log(ev);
            },
            function(ev) {
                console.log(ev);
            }
        );
    }
    
    loginFormBtn.onclick = function(ev) {
        alert("qwerty");
    }

}