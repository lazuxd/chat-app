<?php

require_once("../src/data.php");
require_once("../src/functions.php");
require_once("../src/checkToken.php");

try {
    $userId = checkToken($_POST["token"], true);
    $type = $_POST["type"];
    $name = $type === "group" ? $_POST["name"] : null;
    $adminId = $type === "group" ? $userId : null;
    $image = $type === "group" ? $_FILES["groupImage"] : null;
    $membersIds = json_decode($_POST["membersIds"]);
    array_push($membersIds, $userId);
    
    $imageURL = $type === "group" ? "../server/images/groupImages/groups.png" : null;

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

        if ($image) {
            mkdir("../images/groupImages/$convId");
            $extension = strtolower(pathinfo($image["name"], PATHINFO_EXTENSION));
            if (!getimagesize($image["tmp_name"])) {
                throw new Exception("File not an image.");
            }
            if (!move_uploaded_file($image["tmp_name"], "../images/groupImages/$convId/groupImg.$extension")) {
                throw new Exception("Could not upload file.");
            }
            $imageURL = "../server/images/groupImages/$convId/groupImg.$extension";
            $filesInDir = scandir("../images/groupImages/$convId/");
            foreach ($filesInDir as $key => $val ) {
                if (strpos($val, "groupImg.$extension") !== 0 && $val !== "." && $val !== "..") {
                    unlink("../images/groupImages/$convId/$val");
                }
            }
        }

        $stmt = $db->prepare("UPDATE Conversations SET ImageURL = :imgURL WHERE ConvID = :convId;");
        if (!$stmt->execute([":imgURL" => $imageURL, ":convId" => $convId])) {
            throw new Exception("Could not execute query.");
        }

        sendJSON(["success" => true], 200);
    }
} catch (Exception $e) {
    sendJSON(["errorMessage" => $e->getMessage()], 500);
}

?>