<?php

require_once("../src/functions.php");
require_once("../src/checkToken.php");

try {
    checkToken($_POST["token"], true);
    sendJSON(["success" => true], 200);
} catch(Exception $e) {
    sendJSON(["errorMessage" => $e->getMessage()], 500);
}

?>