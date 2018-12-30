<?php

require_once("../src/data.php");
require_once("../src/functions.php");
require_once("../src/checkToken.php");

try {
    $userId = checkToken($_POST["token"], true);
    $search = $_POST["search"];
    $db = new PDO("mysql:dbname=ChatApp;host=localhost", username, password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $db->prepare("SELECT UserID, DisplayName AS Name, ImageURL FROM Users WHERE UserID <> :userId AND DisplayName LIKE :search;");
    if (!$stmt->execute([":userId" => $userId, ":search" => '%'.$search.'%'])) {
        throw new Exception("Could not execute query.");
    } else if (!($Users = $stmt->fetchAll(PDO::FETCH_ASSOC))) {
        throw new Exception("Could not fetch data.");
    } else {
        sendJSON(["Users" => $Users], 200);
    }
} catch (Exception $e) {
    sendJSON(["errorMessage" => $e->getMessage()], 500);
}

?>