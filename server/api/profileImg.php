<?php

require_once("../src/data.php");
require_once("../src/functions.php");
require_once("../src/checkToken.php");

if ($_POST["token"] && !$_FILES["profileImg"]) {
    try {
        $userId = checkToken($_POST["token"], true);
        $filesInDir = scandir("../images/$userId/");
        $imgURL = "";
        foreach ($filesInDir as $key => $val ) {
            if (strpos($val, "profile") === 0) {
                $imgURL = "../server/images/$userId/$val";
                break;
            }
        }
        sendJSON(["imgURL" => $imgURL], 200);
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
        if (!move_uploaded_file($_FILES["profileImg"]["tmp_name"], "../images/$userId/profile.$extension")) {
            throw new Exception("Could not upload file.");
        }
        $imgURL = "../server/images/$userId/profile.$extension";
        $filesInDir = scandir("../images/$userId/");
        foreach ($filesInDir as $key => $val ) {
            if (strpos($val, "profile.$extension") !== 0 && $val !== "." && $val !== "..") {
                unlink("../images/$userId/$val");
            }
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