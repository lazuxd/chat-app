<?php

require_once("../src/data.php");
require_once("../src/functions.php");
require_once("../src/checkToken.php");

try {
    $userId = checkToken($_POST["token"], true);
    $type = $_POST["type"];
    $name = $type === "group" ? $_POST["name"] : null;
    $adminId = $type === "group" ? $userId : null;
    $imageURL = $type === "group" ? $_POST["imageURL"] : null;
    $membersIds = json_decode($_POST["membersIds"]);
    array_push($membersIds, $userId);

    $db = new PDO("mysql:dbname=ChatApp;host=localhost", username, password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $sql1 = "INSERT INTO Conversations (Name, AdminID, ImageURL) VALUES (:name, :adminId, :imageURL);";
    $sql2 = "INSERT INTO ConvUsers (ConvID, UserID) VALUES (:convId, :userId);";
    $stmt = $db->prepare($sql1);
    if (!$stmt->execute([":name" => $name, ":adminId" => $adminId, ":imageURL" => $imageURL])) {
        throw new Exception("Could not execute query.");
    } else if (!($convId = $db->lastInsertId())) {
        throw new Exception("Could not fetch data.");
    } else {
        $stmt = $db->prepare($sql2);
        foreach ($membersIds as $memberId) {
            if (!$stmt->execute([":convId" => $convId, ":userId" => $memberId])) {
                throw new Exception("Could not execute query.");
            }
        }
        sendJSON(["success" => true], 200);
    }
} catch (Exception $e) {
    sendJSON(["errorMessage" => $e->getMessage()], 500);
}

?>