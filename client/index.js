window.onload = function(event) {
    var scrollBox = document.getElementById('inside-msg-box');
    var messagesBox = document.getElementById('msg-area');
    var inputBox = document.getElementsByClassName('input-box')[0];
    var sendBtn = document.getElementById('send-btn');
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
    var msgModalBackdrop = document.getElementById('msg-modal-backdrop');
    var msgModal = document.getElementById('msg-modal');
    var msgModalTitle = document.getElementById('msg-modal-title');
    var msgModalBody = document.getElementById('msg-modal-body');
    var loginEmailInput = document.getElementById('login-email-input');
    var loginPwdInput = document.getElementById('login-pwd-input');
    var rememberMe = document.getElementById('remember-me');
    var loginSrvResponse = document.getElementById('login-srv-response');
    var notLoggedIn = document.getElementById('not-logged-in');
    var loggedIn = document.getElementById('logged-in');
    var profileMenuBtn = document.getElementById('profile-menu-btn');

    var canCreateConv, canCreateGroup, groupNameNotEmpty;
    var chatSocket;


    function newMessage(msg) {
        if (msg.status === "failure") {
            console.log(msg.errorMessage);
            return;
        }
        var el = document.createElement('div');
        var align = Number(msg.Me) === 1 ? 'right-align' : 'left-align';
        el.className = Number(msg.Me) === 1 ? 'own-message' : 'message';
        el.innerHTML = "<p class='msg-name "+align+"'>"+msg.Name+"</p><p class='msg-text'>"+msg.Message+"</p>";
        messagesBox.appendChild(el);
        scrollToBottom();
    }

    function scrollToBottom() {
        scrollBox.scrollTop = scrollBox.scrollHeight;
    }

    function postUpload(url, files, successCB, errorCB) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.onreadystatechange = function(ev) {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                successCB && successCB(this.response);
            }
            if (this.readyState === XMLHttpRequest.DONE && this.status !== 200) {
                errorCB && errorCB(this.response);
            }
        }

        var formData = new FormData();
        Object.keys(files).forEach(function(key) {
            formData.append(key, files[key]);
        });

        xhr.send(formData);
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
                errorCB && errorCB(this.response);
            }
        }
        var strData = Object.entries(data).reduce(function(str, arr) {
            str += arr[0] + '=' + arr[1] + '&';
            return str;
        }, '');
        
        xhr.send(encodeURI(strData.slice(0, -1)));
    }
    
    function get(url, successCB, errorCB) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function(ev) {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                successCB && successCB(this.response);
            }
            if (this.readyState === XMLHttpRequest.DONE && this.status !== 200) {
                errorCB && errorCB(this.response);
            }
        }
        
        xhr.send();
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
        el.insertBefore(elToInsert, null);
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

    function nrOfMatches(str) {
        var n = 0;
        if (lowerCaseRE.test(str)) ++n;
        if (upperCaseRE.test(str)) ++n;
        if (digitsRE.test(str)) ++n;
        if (symbolsRE.test(str)) ++n;
        return n;
    }

    var emailValidRE = /([a-zA-Z0-9]|\.|_)+@[a-zA-Z]+\.[a-zA-Z]+/,
        lowerCaseRE = /.*[a-z]+.*/,
        upperCaseRE = /.*[A-Z]+.*/,
        digitsRE = /.*[0-9]+.*/,
        symbolsRE = /.*[^a-zA-Z0-9 \t\n]+.*/
    ;

    var emailErr = !emailValidRE.test(signupEmailInput.value),
        pwdErr = (signupPwdInput.value.length <= 5 || nrOfMatches(signupPwdInput.value) <= 1),
        pwdMatchErr = signupPwdInput.value !== rePwdInput.value
    ;
    
    var pwdResetErr, pwdMatchResetErr;
    (function() {
        var input1 = document.querySelector("#reset-pwd-pwd-input");
        var input2 = document.querySelector("#reset-pwd-re-pwd-input");
        pwdResetErr = (input1.value.length <= 5 || nrOfMatches(input1.value) <= 1);
        pwdMatchResetErr = input1.value !== input2.value;
    })()

    function checkEmail(input, output) {
        var val = input.value;
        if (val.length === 0) {
            output.className = "hide";
            return true;
        }
        if (!emailValidRE.test(val)) {
            output.innerHTML = "Invalid email address";
            output.className = "danger";
            return true;
        } else {
            output.innerHTML = "";
            output.className = "";
            return false;
        }
    }

    function checkPwd(input, output) {
        var val = input.value;
        if (val.length === 0) {
            output.className = "hide";
            return true;
        }
        if (val.length <= 5 || nrOfMatches(val) <= 1) { // weak
            output.firstElementChild.innerHTML = "Weak password";
            output.className = "pwd-secure weak";
            return true;
        } else if (val.length <= 8 || nrOfMatches(val) <= 2) { // medium
            output.firstElementChild.innerHTML = "Medium password";
            output.className = "pwd-secure medium";
            return false;
        } else if (val.length < 10 || nrOfMatches(val) <= 3) { // good
            output.firstElementChild.innerHTML = "Good password";
            output.className = "pwd-secure good";
            return false;
        } else { // strong
            output.firstElementChild.innerHTML = "Strong password";
            output.className = "pwd-secure strong";
            return false;
        }
    }

    function checkMatchPwd(input1, input2, output) {
        var pwd1 = input1.value,
            pwd2 = input2.value
        ;
        if (pwd2.length === 0) {
            output.className = "hide";
            return true;
        }
        if (pwd1 !== pwd2) {
            output.innerHTML = "Passwords don't match"
            output.className = "danger"
            return true;
        } else {
            output.innerHTML = "";
            output.className = "";
            return false;
        }
    }

    function showImgPreview(input, img) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                img.setAttribute("src", e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    function showChatRoom(convId) {
        if (chatSocket && typeof chatSocket === "object") {
            chatSocket.close();
        } 
        chatSocket = new WebSocket('ws://localhost:8080/chat');
        chatSocket.onopen = function(event) {
            chatSocket.send(JSON.stringify({
                type: "open",
                token: sessionStorage.getItem("token") || localStorage.getItem("token"),
                convId: convId
            }));
        }
        chatSocket.onmessage = function(event) {
            newMessage(JSON.parse(event.data));
        }
        chatSocket.onclose = function(event) {
        }
        chatSocket.onerror = function(event) {
        }
        var hides = ["#edit-profile", "#conv-list"];
        hideNewConvModal();
        for (var hide of hides) {
            document.querySelector(hide).className = "hide";
        }
        document.querySelector("#chat-box").className = "chat-box";
        post(
            "../server/api/getMessages.php",
            {
                token: sessionStorage.getItem("token") || localStorage.getItem("token"),
                convId: convId
            },
            function(res) {
                var messages = JSON.parse(res).Messages;
                var msgArea = document.querySelector("#msg-area");
                msgArea.innerHTML = "";
                for (var msg of messages) {
                    newMessage(msg);
                    // append(msgArea, "<p>"+msg.Message+"</p>");
                }
            },
            function(err) {
                console.log(err);
            }
        );
    }

    function showConversations() {
        var hides = ["#edit-profile", "#chat-box"];
        hideNewConvModal();
        for (var hide of hides) {
            document.querySelector(hide).className = "hide";
        }
        document.querySelector("#conv-ul").innerHTML = "";
        document.querySelector("#conv-list").className = "conv-list-container";
        document.querySelector("#conv-toolbar-item").className = "active-toolbar-tab";
        post(
            "../server/api/getConversations.php",
            {
                token: sessionStorage.getItem("token") || localStorage.getItem("token")
            },
            function(res) {
                var convList = JSON.parse(res);
                var list = document.querySelector("#conv-ul");
                list.innerHTML = "";
                if (convList.GroupsConv.length === 0 && convList.PrivateConv.length === 0) {
                    append(list, "<p style='margin-left: 30px'>Nu există convorbiri.</p>");
                } else {
                    for (var conv of convList.GroupsConv) {
                        var li =
                            "<li class='conv-li' conv-id='"+conv.ConvID+"'>" +
                                "<img src='"+conv.ImageURL+"'/>" +
                                "<h3>"+conv.Name+"</h3>" +
                            "</li>"
                        ;
                        append(list, li);
                    }
                    for (var conv of convList.PrivateConv) {
                        var li =
                            "<li class='conv-li' conv-id='"+conv.ConvID+"'>" +
                                "<img src='"+conv.ImageURL+"'/>" +
                                "<h3>"+conv.Name+"</h3>" +
                            "</li>"
                        ;
                        append(list, li);
                    }
                }
                var lis = document.querySelectorAll("#conv-ul li");
                for (var li of lis) {
                    li.onclick = showChatRoom.bind(null, li.getAttribute("conv-id"));
                }
            },
            function(err) {
                console.log(JSON.parses(err));
            }
        );
    }

    function checkConvValid() {
        document.querySelector("#new-conv-btn").className = canCreateConv ? "conv-start submit-btn" : "conv-start submit-btn disabled";
    }
    
    function checkGroupValid() {
        document.querySelector("#new-group-btn").className = canCreateGroup && groupNameNotEmpty ? "conv-start submit-btn" : "conv-start submit-btn disabled";
    }

    function login(res) {
        var token = sessionStorage.getItem('token') || localStorage.getItem('token');
        var profileImgs = document.getElementsByClassName("update-profile-img");
        post("../server/api/profileImg.php", 
            {
                token: token
            },
            function(res) {
                var imgURL = JSON.parse(res).imgURL;
                for (var item of profileImgs) {
                    item.setAttribute("src", imgURL);
                }
            },
            function(err) {
                profileImgs.forEach(function(item) {
                    item.setAttribute("src", "../server/images/profile.png");
                });
            }
        );
        post("../server/api/userName.php",
                {
                    token: token
                },
                function(res) {
                    var nameText = htmlentities(JSON.parse(res).displayName);
                    var names = document.getElementsByClassName("update-display-name");
                    for (var name of names) {
                        name.innerHTML = nameText;
                    }
                },
                function(err) {
                }
            );
        msgModal.className = "hide";
        notLoggedIn.className = "hide";
        loggedIn.className = "logged-in";
        showConversations();
    }

    function showAuthModal() {
        authModal.className = "auth-modal";
        setTimeout(function() {
            authBox.className = "auth-box slide-down";
        }, 100);
    }

    function hideAuthModal() {
        authBox.className = "auth-box";
        setTimeout(function() {
            authModal.className = "hide";
        }, 300);
    }
    
    function showForgotPwdModal() {
        var modal = document.querySelector("#forgot-pwd-modal");
        var dialog = document.querySelector("#forgot-pwd-form");
        modal.className = "modal";
        setTimeout(function() {
            dialog.className = "forgot-pwd-form modal-dialog slide-down";
        }, 100);
    }

    function hideForgotPwdModal() {
        var modal = document.querySelector("#forgot-pwd-modal");
        var dialog = document.querySelector("#forgot-pwd-form");
        dialog.className = "forgot-pwd-form modal-dialog";
        setTimeout(function() {
            modal.className = "hide";
        }, 300);
    }
    
    function showResetPwdModal() {
        var modal = document.querySelector("#reset-pwd-modal");
        var dialog = document.querySelector("#reset-pwd-form");
        modal.className = "modal";
        setTimeout(function() {
            dialog.className = "reset-pwd-form modal-dialog slide-down";
        }, 100);
    }

    function hideResetPwdModal() {
        var modal = document.querySelector("#reset-pwd-modal");
        var dialog = document.querySelector("#reset-pwd-form");
        dialog.className = "reset-pwd-form modal-dialog";
        setTimeout(function() {
            modal.className = "hide";
        }, 300);
    }

    function attachOneSelectClickEvents(ul) {
        var lis = ul.getElementsByTagName("li");
        function onOneSelectedClick() {
            if (!(/.*selected.*/.test(this.className))) {
                this.className = this.className + " selected";
                canCreateConv = true;
                checkConvValid();
                for (var li of lis) {
                    if (li !== this) {
                        li.className = li.className.replace('selected', '');
                    }
                }
            }
        }
        for (var li of lis) {
            li.onclick = onOneSelectedClick;
        }
    }
    
    function attachMultiSelectClickEvents(ul) {
        var lis = ul.getElementsByTagName("li");
        function onMultiSelectedClick() {
            if (!(/.*selected.*/.test(this.className))) {
                this.className = this.className + " selected";
                canCreateGroup++;
            } else {
                this.className = this.className.replace('selected', '');
                canCreateGroup--;
            }
            checkGroupValid();
        }
        for (var li of lis) {
            li.onclick = onMultiSelectedClick;
        }
    }

    function getUserList(search, list, after) {
        list.innerHTML = "";
        post(
            "../server/api/getUsers.php",
            {
                token: sessionStorage.getItem("token") || localStorage.getItem("token"),
                search: search.value
            },
            function(res) {
                users = JSON.parse(res).Users;
                for (var user of users) {
                    var li =
                        "<li user-id='"+user.UserID+"'>" +
                            "<img src='"+user.ImageURL+"'/>" +
                            "<p>"+user.Name+"</p>" +
                        "</li>"
                    ;
                    append(list, li);
                }
                after && after(list);
            },
            function(err) {
                // err = JSON.parse(err);
                // console.log(err);
            }
        );
    }

    function convTabActive() {
        var search = document.querySelector("#new-conv-search");
        var list = document.querySelector("#new-conv-user-list");
        getUserList(search, list, attachOneSelectClickEvents);
        search.onkeyup = function() {
            getUserList(search, list, attachOneSelectClickEvents);
        };
        canCreateConv = false;
        checkConvValid();
        document.querySelector("#new-group-form").className = "hide";
        document.querySelector("#new-group-tab-item").className = "";
        document.querySelector("#new-conv-tab-item").className = "active-tab";
        document.querySelector("#new-conv-form").className = "new-conv-form";
    }
    
    function groupTabActive() {
        var search = document.querySelector("#new-group-search");
        var list = document.querySelector("#new-group-user-list");
        getUserList(search, list, attachMultiSelectClickEvents);
        search.onkeyup = function() {
            getUserList(search, list, attachMultiSelectClickEvents);
        };
        canCreateGroup = 0;
        checkGroupValid();
        document.querySelector("#group-img-preview").setAttribute("src", "../server/images/groupImages/groups.png");
        document.querySelector("#new-conv-form").className = "hide";
        document.querySelector("#new-conv-tab-item").className = "";
        document.querySelector("#new-group-tab-item").className = "active-tab";
        document.querySelector("#new-group-form").className = "new-group-form";
    }

    function showNewConvModal() {
        convTabActive();
        document.querySelector("#new-conv-modal").className = "modal";
        setTimeout(function() {
            document.querySelector("#new-conv-dialog").className = "modal-dialog slide-down";
        }, 100);
    }

    function hideNewConvModal() {
        document.querySelector("#new-conv-search").onkeyup = null;
        document.querySelector("#new-group-search").onkeyup = null;
        document.querySelector("#new-conv-dialog").className = "modal-dialog";
        setTimeout(function() {
            document.querySelector("#new-conv-modal").className = "hide";
        }, 300);
    }

    function htmlentities(str) {
        return str.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
            return '&#'+i.charCodeAt(0)+';';
        });
    }


    msgModalBackdrop.onclick = function() {
        msgModal.className = "hide";
    }

    var searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('scope') === 'activation') {
        post('../server/api/activate.php',
            {
                email: searchParams.get('email'),
                key: searchParams.get('key')
            },
            function(res) {
                msgModalTitle.innerHTML = "Account activated successfully";
                msgModalBody.innerHTML = "Your account was successfully activated! Now you can log into your account.";
                msgModal.className = "msg-modal";
            },
            function(err) {
                msgModalTitle.innerHTML = "Activation failed";
                msgModalBody.innerHTML = "An error ocurred while activating your account! Error message: " + JSON.parse(err).errorMessage;
                msgModal.className = "msg-modal";
            }
        );
    } else if (searchParams.get('scope') === 'reset-pwd') {
        showResetPwdModal();
    }

    (function() {
        var token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (token) {
            post('../server/api/checkToken.php',
            {token: token},
            function(res) {
                login(JSON.parse(res));
            },
            function(err) {
            });
        }
    })();
    
    document.querySelector("#group-name-input").onkeyup = function() {
        groupNameNotEmpty = this.value.length > 0;
        checkGroupValid();
    }

    document.querySelector("#new-conv-tab-item").onclick = convTabActive;

    document.querySelector("#new-group-tab-item").onclick = groupTabActive;

    document.querySelector("#new-conv").onclick = showNewConvModal;

    document.querySelector("#conv-modal-backdrop").onclick = hideNewConvModal;

    document.querySelector("#conv-toolbar-item").onclick = showConversations;

    document.querySelector("#img-file-input").onchange = function() {
        showImgPreview(document.querySelector("#img-file-input"), document.querySelector("#edit-profile-img"));
    };
    
    document.querySelector("#group-file-input").onchange = function() {
        showImgPreview(document.querySelector("#group-file-input"), document.querySelector("#group-img-preview"));
    };

    document.querySelector("#new-conv-btn").onclick = function() {
        postUpload(
            "../server/api/newConversation.php",
            {
                token: sessionStorage.getItem("token") || localStorage.getItem("token"),
                type: "private",
                membersIds: JSON.stringify([document.querySelector("#new-conv-user-list li.selected").getAttribute("user-id")])
            },
            function(res) {
                // console.log(res);
                showConversations();
                hideNewConvModal();
            },
            function(err) {
                // console.log(err);
            }
        );
    };
    
    document.querySelector("#new-group-btn").onclick = function() {
        var fileInput = document.querySelector("#group-file-input");
        var selected = document.querySelectorAll("#new-group-user-list li.selected");
        var memIds = [];
        for (var item of selected) {
            memIds.push(item.getAttribute("user-id"));
        }
        postUpload(
            "../server/api/newConversation.php",
            {
                token: sessionStorage.getItem("token") || localStorage.getItem("token"),
                type: "group",
                name: document.querySelector("#group-name-input").value,
                groupImage: fileInput.files && fileInput.files[0],
                membersIds: JSON.stringify(memIds)
            },
            function(res) {
                // console.log(res);
                showConversations();
                hideNewConvModal();
            },
            function(err) {
                // console.log(err);
            }
        );
    };

    document.querySelector("#edit-profile-save").onclick = function() {
        var imgInput = document.querySelector("#img-file-input");
        var nameInput = document.querySelector("#edit-name-input");
        var token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (imgInput.files && imgInput.files[0]) {
            postUpload("../server/api/profileImg.php",
                {
                    token: token,
                    profileImg: imgInput.files[0]
                },
                function(res) {
                    var profileImgs = document.getElementsByClassName("update-profile-img");
                    var imgURL = JSON.parse(res).imgURL+"?time="+Date.now();
                    for (var item of profileImgs) {
                        item.setAttribute("src", imgURL);
                    }
                },
                function(err) {
                }
            );
        }
        if (nameInput.value !== "") {
            post("../server/api/userName.php",
                {
                    token: token,
                    DisplayName: nameInput.value
                },
                function(res) {
                    var nameText = htmlentities(JSON.parse(res).displayName);
                    var names = document.getElementsByClassName("update-display-name");
                    for (var name of names) {
                        name.innerHTML = nameText;
                    }
                },
                function(err) {
                }
            );
        }
    }

    document.querySelector("#edit-profile-btn").onclick = function() {
        document.querySelector("#chat-box").className = "hide";
        document.querySelector("#conv-list").className = "hide";
        document.querySelector("#edit-profile").className = "edit-profile";
        var token = sessionStorage.getItem('token') || localStorage.getItem('token');
        post("../server/api/userName.php",
            {
                token: token
            },
            function(res) {
                document.querySelector("#edit-name-input").value = JSON.parse(res).displayName;
            },
            function(err) {
                document.querySelector("#edit-name-input").value = "";
            }
        );
    }

    document.querySelector("#logout-btn").onclick = function() {
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        loggedIn.className = "logged-in hide";
        notLoggedIn.className = "not-logged-in";
    }

    document.querySelector("#forgot-pwd").onclick = function() {
        hideAuthModal();
        showForgotPwdModal();
    }

    document.querySelector("#forgot-pwd-modal-backdrop").onclick = hideForgotPwdModal;

    document.querySelector("#reset-pwd-modal-backdrop").onclick = hideResetPwdModal;

    document.querySelector("#send-reset-pwd-email").onclick = function() {
        var email = document.querySelector("#forgot-pwd-email-input").value;
        post('../server/api/sendForgotPwdEmail.php',
            {
                email: document.querySelector("#forgot-pwd-email-input").value
            },
            function(res) {
                var resDiv = document.querySelector("#srv-response-forgot-pwd");
                resDiv.className = "success-msg";
                resDiv.innerHTML = "Email sent successfully!";
            },
            function(err) {
                var resDiv = document.querySelector("#srv-response-forgot-pwd");
                resDiv.className = "failure-msg";
                // resDiv.innerHTML = err;
                resDiv.innerHTML = "Error sending email!";
            }
        );
    }

    document.querySelector("#reset-pwd").onclick = function() {
        var resDiv = document.querySelector("#srv-response-reset-pwd");
        if (pwdResetErr || pwdMatchResetErr) {
            resDiv.innerHTML = "Completați corect câmpurile!";
            resDiv.className = "danger";
            return;
        }
        resDiv.innerHTML = "";
        resDiv.className = "hide";
        post('../server/api/resetPwd.php',
            {
                token: searchParams.get("token"),
                password: document.querySelector("#reset-pwd-pwd-input").value
            },
            function(res) {
                resDiv.className = "success-msg";
                resDiv.innerHTML = "The password has been successfully reset!";
            },
            function(err) {
                resDiv.className = "failure-msg";
                // resDiv.innerHTML = err;
                resDiv.innerHTML = "Could not reset password!!";
            }
        );
    }
    
    document.querySelector("#reset-pwd-pwd-input").onkeyup = function() {
        var input1 = document.querySelector("#reset-pwd-pwd-input");
        var input2 = document.querySelector("#reset-pwd-re-pwd-input");
        var output1 = document.querySelector("#check-reset-pwd");
        var output2 = document.querySelector("#check-reset-re-pwd");
        pwdResetErr = checkPwd(input1, output1);
        pwdMatchResetErr = checkMatchPwd(input1, input2, output2);
    }
    
    document.querySelector("#reset-pwd-re-pwd-input").onkeyup = function() {
        var input1 = document.querySelector("#reset-pwd-pwd-input");
        var input2 = document.querySelector("#reset-pwd-re-pwd-input");
        var output1 = document.querySelector("#check-reset-pwd");
        var output2 = document.querySelector("#check-reset-re-pwd");
        pwdResetErr = checkPwd(input1, output1);
        pwdMatchResetErr = checkMatchPwd(input1, input2, output2);
    }

    var profileDropdownOpened = false;
    profileMenuBtn.onclick = function() {
        var profileDropdown = document.getElementById("profile-dropdown");
        profileDropdown.className = !profileDropdownOpened ? "profile-dropdown show" : "profile-dropdown";
        profileDropdownOpened = !profileDropdownOpened;
    }

    sendBtn.onclick = function() {
        chatSocket.send(JSON.stringify({
            type: "message",
            token: sessionStorage.getItem("token") || localStorage.getItem("token"),
            msg: inputBox.value
        }));
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

    backdrop.onclick = hideAuthModal;

    signupBtn.onclick = function() {
        loginForm.className = "login-form";
        loginTabLink.className = "";
        signupForm.className = "signup-form active-form";
        signupTabLink.className = "active-tab";
        showAuthModal();
    }
    loginBtn.onclick = function() {
        signupForm.className = "signup-form";
        signupTabLink.className = "";
        loginForm.className = "login-form active-form";
        loginTabLink.className = "active-tab";
        showAuthModal();
    }
    
    signupEmailInput.onkeyup = function(ev) {
        emailErr = checkEmail(signupEmailInput, checkSignupEmail);
    }

    signupPwdInput.onkeyup = function(ev) {
        pwdErr = checkPwd(signupPwdInput, checkSignupPwd);
        pwdMatchErr = checkMatchPwd(signupPwdInput, rePwdInput, checkSignupRePwd);
    }
    rePwdInput.onkeyup = function(ev) {
        pwdErr = checkPwd(signupPwdInput, checkSignupPwd);
        pwdMatchErr = checkMatchPwd(signupPwdInput, rePwdInput, checkSignupRePwd);
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
            function(result) {
                srvResponse.className = "success-msg";
                srvResponse.innerHTML = "Signup succesfull! An activation email was sent to you.";
                setTimeout(function() {srvResponse.className = "hide";}, 3000);
            },
            function(error) {
                srvResponse.className = "failure-msg";
                srvResponse.innerHTML = "ERROR: "+JSON.parse(error).errorMessage;
                setTimeout(function() {srvResponse.className = "hide";}, 3000);
            }
        );
    }
    
    loginFormBtn.onclick = function(ev) {
        if (!loginEmailInput.value || !loginPwdInput.value) {
            loginSrvResponse.innerHTML = "Completați corect câmpurile!";
            loginSrvResponse.className = "danger";
            return;
        }

        loginSrvResponse.innerHTML = "";
        loginSrvResponse.className = "hide";
        post('../server/api/login.php',
            {
                email: loginEmailInput.value,
                password: loginPwdInput.value,
                rememberMe: rememberMe.checked
            },
            function(result) {
                if (rememberMe.checked) {
                    localStorage.setItem('token', JSON.parse(result).token);
                } else {
                    sessionStorage.setItem('token', JSON.parse(result).token);
                }
                loginSrvResponse.className = "success-msg";
                loginSrvResponse.innerHTML = "Login succesfull!";
                setTimeout(function() {
                    loginSrvResponse.className = "hide";
                    login();
                }, 3000);
            },
            function(error) {
                loginSrvResponse.className = "failure-msg";
                loginSrvResponse.innerHTML = "ERROR: "+JSON.parse(error).errorMessage;
                setTimeout(function() {loginSrvResponse.className = "hide";}, 3000);
            }
        );
    }

}