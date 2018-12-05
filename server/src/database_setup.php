<?php

require_once('data.php');

$db = new PDO('mysql:host=localhost', username, password);
$db->exec("CREATE DATABASE ChatApp;");
$res = $db->exec("CREATE TABLE ChatApp.Users ("
    ."UserID BIGINT PRIMARY KEY AUTO_INCREMENT,"
    ."Email VARCHAR(50) NOT NULL UNIQUE,"
    ."HashedPwd VARCHAR(256) NOT NULL,"
    ."DisplayName VARCHAR(50) NOT NULL,"
    ."Active VARCHAR(256) NOT NULL"
    .");"
);

if ($res === false) {
    var_dump($db->errorInfo());
}

?>