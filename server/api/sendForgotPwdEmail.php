<?php

require_once("../src/data.php");
require_once("../src/functions.php");
require_once("../src/sendMail.php");

try {
    $email = $_POST["email"];
    $db = new PDO("mysql:dbname=ChatApp;host=localhost", username, password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $db->prepare("SELECT UserID, Active FROM Users WHERE Email = :email;");
    if (!$stmt->execute([":email" => $email])) {
        throw new Exception("Could not execute query.");
    } else if (!($row = $stmt->fetch())) {
        throw new Exception("Could not fetch data.");
    } else if ($row["Active"] !== "active") {
        throw new Exception("The account it's not active. Please click on the activation link sent to your email.");
    } else {
        $ResetId = bin2hex(random_bytes(64));
        $UserId = $row["UserID"];
        $VerifyResetId = bin2hex(random_bytes(64));
        $hashedVerifyResetId = hash("sha512", $VerifyResetId);
        $Expires = time() + 24 * 60 * 60;
        $db->exec("INSERT INTO ForgotPwd VALUES ('$ResetId', $UserId, '$hashedVerifyResetId', $Expires);");
        $token = $ResetId . '$' . $VerifyResetId;
        $stmt->closeCursor();

        $url = explode("?", $_SERVER['HTTP_REFERER'])[0] . '?scope=reset-pwd&token=' . $token;
        sendMail("contact@ldxdev.com", "LdxDev", [$email], "Reset your password", "Please click on the following link to reset your password:<br/>$url");

        sendJSON(["success" => true], 200);
    }
} catch (Exception $e) {
    sendJSON(["errorMessage" => $e->getMessage()], 500);
}

?>