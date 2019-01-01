<?php

require_once("../src/data.php");
require_once("../src/functions.php");
require_once("../src/checkToken.php");

try {
    $userId = checkToken($_POST["token"], true);
    $db = new PDO("mysql:dbname=ChatApp;host=localhost", username, password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $db->prepare("SELECT c.ConvID, c.Name, c.AdminID, c.ImageURL FROM Conversations c JOIN ConvUsers cv ON c.ConvID = cv.ConvID WHERE cv.UserID = :userId AND c.Name IS NOT NULL;");
    if (!$stmt->execute([":userId" => $userId])) {
        throw new Exception("Could not execute query.");
    } else if (false === ($GroupsConv = $stmt->fetchAll(PDO::FETCH_ASSOC))) {
        throw new Exception("Could not fetch data.");
    } else {
        $stmt = $db->prepare("SELECT t1.ConvID, t2.UserID AS OtherUserID, u.DisplayName AS Name, u.ImageURL FROM (SELECT c.ConvID FROM Conversations c JOIN ConvUsers cv ON c.ConvID = cv.ConvID WHERE cv.UserID = :userId AND c.Name IS NULL) t1 JOIN ConvUsers t2 ON t1.ConvID = t2.ConvID JOIN Users u ON t2.UserID = u.UserID WHERE t2.UserID <> :userId;");
        if (!$stmt->execute([":userId" => $userId])) {
            throw new Exception("Could not execute query.");
        } else if (false === ($PrivateConv = $stmt->fetchAll(PDO::FETCH_ASSOC))) {
            throw new Exception("Could not fetch data.");
        }
        sendJSON(["GroupsConv" => $GroupsConv, "PrivateConv" => $PrivateConv], 200);
    }
} catch (Exception $e) {
    sendJSON(["errorMessage" => $e->getMessage()], 500);
}

?>