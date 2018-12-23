<?php

require_once("data.php");

function checkToken(string $tk, bool $shouldThrow = false) {
    try {
        $token = explode('$', $tk);
        $IdToken = $token[0];
        $VerifyToken = $token[1];
        $nowTimestamp = time();
        
        $db = new PDO("mysql:dbname=ChatApp;host=localhost", username, password);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $stmt = $db->prepare("SELECT IdToken, UserId, VerifyToken, Expires FROM Tokens WHERE IdToken = :idToken;");
        if (!$stmt->execute([":idToken" => $IdToken])) {
            throw new Exception("Could not execute query.");
        } else if (!($row = $stmt->fetch())) {
            throw new Exception("Could not fetch data.");
        } else if ($row["Expires"] < $nowTimestamp) {
            throw new Exception("Expired token.");
        } else if (hash("sha512", $VerifyToken) !== $row["VerifyToken"]) {
            throw new Exception("Invalid token.");
        } else if (!$row["UserId"]) {
            throw new Exception("Could not identify user.");
        } else {
            return $row["UserId"];
        }
    } catch (Exception $e) {
        if ($shouldThrow) {
            throw $e;
        } else {
            return false;
        }
    }
}

?>