<?php

require_once("../src/data.php");
require_once("../src/functions.php");
require_once("../src/checkToken.php");

if ($_POST["token"] && !$_FILES["profileImg"]) {
    try {
        $userId = checkToken($_POST["token"], true);
        $db = new PDO("mysql:dbname=ChatApp;host=localhost", username, password);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $stmt = $db->prepare("SELECT ImageURL FROM Users WHERE UserID = :userId;");
        if (!$stmt->execute([":userId" => $userId])) {
            throw new Exception("Could not execute query.");
        } else if (false === ($row = $stmt->fetch())) {
            throw new Exception("Could not fetch data.");
        }
        sendJSON(["imgURL" => $row["ImageURL"]], 200);
    } catch (Exception $e) {
        sendJSON(["errorMessage" => $e->getMessage()], 500);
    }
} else if ($_POST["token"] && $_FILES["profileImg"]) {
    try {
        $userId = checkToken($_POST["token"], true);
        $extension = strtolower(pathinfo($_FILES["profileImg"]["name"], PATHINFO_EXTENSION));
        if (!getimagesize($_FILES["profileImg"]["tmp_name"])) {
            throw new Exception("File not an image.");
        }
        if (!move_uploaded_file($_FILES["profileImg"]["tmp_name"], "../images/profileImages/$userId/profile.$extension")) {
            throw new Exception("Could not upload file.");
        }
        $imgURL = "../server/images/profileImages/$userId/profile.$extension";
        $filesInDir = scandir("../images/profileImages/$userId/");
        foreach ($filesInDir as $key => $val ) {
            if (strpos($val, "profile.$extension") !== 0 && $val !== "." && $val !== "..") {
                unlink("../images/profileImages/$userId/$val");
            }
        }
        $db = new PDO("mysql:dbname=ChatApp;host=localhost", username, password);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $stmt = $db->prepare("UPDATE Users SET ImageURL = :imgURL WHERE UserID = :userId;");
        if (!$stmt->execute([":imgURL" => $imgURL, ":userId" => $userId])) {
            throw new Exception("Could not execute query.");
        }
        sendJSON(["imgURL" => $imgURL], 200);
    } catch (Exception $e) {
        sendJSON(["errorMessage" => $e->getMessage()], 500);
    }
} else {
    sendJSON([
        "POST" => $_POST,
        "GET" => $_GET,
        "FILES" => $_FILES
    ], 404);
}

?>