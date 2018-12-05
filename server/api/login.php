<?php

session_start();
require_once("../src/data.php");
require_once("../src/functions.php");

try {
    $email = $_POST["email"];
    $password = $_POST["password"];
    $db = new PDO("mysql:dbname=ChatApp;host=localhost", username, password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $db->prepare("SELECT UserID, HashedPwd, Active FROM Users WHERE Email = :email;");
    if (!$stmt->execute([":email" => $email])) {
        throw new Exception("Could not execute query.");
    } else {
        if (!($row = $stmt->fetch())) {
            throw new Exception("Could not fetch data.");
        } else {
            if ($row["Active"] !== "active") {
                throw new Exception("The account it's not active. Please click on the activation link sent to your email.");
            } else {
                if (!password_verify($password, $row["HashedPwd"])) {
                    throw new Exception("Paswords don't match!");
                } else {
                    $_SESSION["userID"] = $row["UserID"];
                    sendJSON(["success" => true], 200);
                }
            }
        }
    }
} catch (Exception $e) {
    sendJSON(["errorMessage" => $e->getMessage()], 500);
}

?>