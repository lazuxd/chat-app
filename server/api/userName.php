<?php

require_once("../src/data.php");
require_once("../src/functions.php");
require_once("../src/checkToken.php");

if ($_POST["token"] && !$_POST["DisplayName"]) {
    try {
        $userId = checkToken($_POST["token"], true);

        $db = new PDO("mysql:dbname=ChatApp;host=localhost", username, password);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $stmt = $db->query("SELECT DisplayName FROM Users WHERE UserID = $userId;");
        if (!($row = $stmt->fetch())) {
            throw new Exception("Could not fetch data.");
        }
        sendJSON(["displayName" => $row["DisplayName"]], 200);
    } catch (Exception $e) {
        sendJSON(["errorMessage" => $e->getMessage()], 500);
    }
} else if ($_POST["token"] && $_POST["DisplayName"]) {
    try {
        $userId = checkToken($_POST["token"], true);
        $newName = $_POST["DisplayName"];

        $db = new PDO("mysql:dbname=ChatApp;host=localhost", username, password);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $stmt = $db->prepare("UPDATE Users SET DisplayName = :newName;");
        if (!$stmt->execute([":newName" => $newName])) {
            throw new Exception("Error updating name.");
        }
        sendJSON(["success" => true, "displayName" => $newName], 200);
    } catch (Exception $e) {
        sendJSON(["errorMessage" => $e->getMessage()], 500);
    }
} else {
    sendJSON([], 404);
}

?>