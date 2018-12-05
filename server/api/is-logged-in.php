<?php

session_start();
require_once("../src/functions.php");

if ($_SESSION["userID"]) {
    sendJSON(["isLoggedIn" => true], 200);
} else {
    sendJSON(["isLoggedIn" => false], 200);
}

?>