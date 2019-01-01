<?php

    ini_set("display_errors", "On");

    require_once("../src/data.php");
    require_once("../src/functions.php");
    require_once("../src/sendMail.php");

    $email = htmlspecialchars($_POST['email']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $displayName = strstr($email, '@', true);
    $active = bin2hex(random_bytes(64));

    try {
        $db = new PDO('mysql:dbname=ChatApp;host=localhost', username, password);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $stmt = $db->prepare('INSERT INTO
            Users ( Email, HashedPwd, DisplayName, Active, ImageURL )
            VALUES ( :email, :pwd, :dName, :active, :imgURL );')
        ;
        $stmt->execute(array(
            ':email' => $email,
            ':pwd' => $password,
            ':dName' => $displayName,
            ':active' => $active,
            ':imgURL' => "../server/images/$userId/profile.png"
        ));

        $stmt->closeCursor();
        $userId = $db->lastInsertId();
        mkdir("../images/$userId");
        copy("../images/profile.png", "../images/$userId/profile.png");

        $url = $_SERVER['HTTP_REFERER'] . 'index.html?scope=activation&email=' . urlencode(htmlspecialchars_decode($email)) . '&key=' . $active;
        sendMail('contact@ldxdev.com', 'LdxDev', array(htmlspecialchars_decode($email)), 'Activate your account', 'Please click on the following link to activate your account: ' . $url);

        sendJSON(array('success' => true), 200);
    } catch (Exception $e) {
        sendJSON(array('errorMessage' => $e->getMessage()), 500);
    }

?>