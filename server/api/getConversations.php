<?php

require_once("../src/data.php");
require_once("../src/functions.php");
require_once("../src/checkToken.php");

try {
    // $userId = checkToken($_POST["token"], true);
    $userId = 1;
    $db = new PDO("mysql:dbname=ChatApp;host=localhost", username, password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $db->prepare("SELECT * FROM (SELECT * FROM (SELECT i.ConvID, c.Name, c.AdminID, c.ImageURL FROM Conversations c JOIN (SELECT ConvID FROM ConvUsers WHERE UserID = :userId) i ON i.ConvID = c.ConvID) wN WHERE Name <> 'NULL') woN UNION (SELECT * FROM wN WHERE Name = 'NULL');");
    if (!$stmt->execute([":userId" => $userId])) {
        throw new Exception("Could not execute query.");
    } else if (!($ConvIDs = $stmt->fetchAll(PDO::FETCH_ASSOC))) {
        throw new Exception("Could not fetch data.");
    } else {
        sendJSON($ConvIDs, 200);
    }
} catch (Exception $e) {
    sendJSON(["errorMessage" => $e->getMessage()], 500);
}

?>