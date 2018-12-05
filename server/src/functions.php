<?php

function sendJSON($arr, $code) {
    header('Content-Type: application/json', true, $code);
    echo json_encode($arr);
    exit(0);
}

?>