<?php

require_once("../src/data.php");
require_once("../src/functions.php");
require_once("../src/checkToken.php");

try {
    $userId = checkToken($_POST["token"], true);
    $convId = $_POST["convId"];
    $db = new PDO("mysql:dbname=ChatApp;host=localhost", username, password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $db->prepare("SELECT m.MsgID, m.Message, u.DisplayName AS Name, CASE WHEN m.UserID = :userId THEN 1 ELSE 0 END AS Me FROM Messages m JOIN Users u ON m.UserID = u.UserID WHERE m.ConvID = :convId;");
    if (!$stmt->execute([":userId" => $userId, ":convId" => $convId])) {
        throw new Exception("Could not execute query.");
    } else if (false === ($Messages = $stmt->fetchAll(PDO::FETCH_ASSOC))) {
        throw new Exception("Could not fetch data.");
    } else {
        sendJSON(["Messages" => $Messages], 200);
    }
} catch (Exception $e) {
    sendJSON(["errorMessage" => $e->getMessage()], 500);
}

?>