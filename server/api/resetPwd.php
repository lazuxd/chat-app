<?php

use Ratchet\Wamp\Exception;

require_once("../src/data.php");
require_once("../src/functions.php");

try {
    $token = explode('$', $_POST["token"]);
    $password = $_POST["password"];
    $ResetId = $token[0];
    $VerifyResetId = $token[1];
    $nowTimestamp = time();
    
    $db = new PDO("mysql:dbname=ChatApp;host=localhost", username, password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $db->prepare("SELECT ResetId, UserId, VerifyResetId, Expires FROM ForgotPwd WHERE ResetId = :resetId;");
    if (!$stmt->execute([":resetId" => $ResetId])) {
        throw new Exception("Could not execute query.");
    } else if (!($row = $stmt->fetch())) {
        throw new Exception("Could not fetch data.");
    } else if ($row["Expires"] < $nowTimestamp) {
        throw new Exception("Expired token.");
    } else if (hash("sha512", $VerifyResetId) !== $row["VerifyResetId"]) {
        throw new Exception("Invalid token.");
    } else if (!$row["UserId"]) {
        throw new Exception("Could not identify user.");
    } else {
        $UserId = $row["UserId"];
        $hashedPwd = password_hash($password, PASSWORD_DEFAULT);
        $db->exec("UPDATE Users SET HashedPwd = '$hashedPwd' WHERE UserID = $UserId;");
        try {
            $db->exec("DELETE FROM ForgotPwd WHERE UserId = $UserId;");
        } catch (Exception $e) {
            // DO NOTHING
        }
        sendJSON(["success" => true], 200);
    }
} catch (Exception $e) {
    sendJSON(["errorMessage" => $e->getMessage()], 500);
}

?>