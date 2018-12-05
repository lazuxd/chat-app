<?php

require_once("../src/data.php");
require_once("../src/functions.php");

try {
    $email = $_POST['email'];
    $key = $_POST['key'];
    $db = new PDO('mysql:dbname=ChatApp;host=localhost', username, password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $db->prepare("SELECT Active FROM Users WHERE Email = :email;");
    if (!$stmt->execute(array(':email' => $email))) {
        throw new Exception("Error while executing query");
    } else {
        if (!($res = $stmt->fetch())) {
            throw new Exception("Error while fetching data");
        } else {
            if ($res['Active'] !== $key) {
                throw new Exception("The keys don't match!");
            } else {
                $stmt= $db->prepare("UPDATE Users SET Active = 'active' WHERE Email = :email;");
                if (!$stmt->execute(array(':email' => $email))) {
                    throw new Exception("Error while updating database");
                } else {
                    sendJSON(["success" => true], 200);
                }
            }
        }
    }

} catch (Exception $e) {
    sendJSON(array("errorMessage" => $e->getMessage()), 500);
}

?>