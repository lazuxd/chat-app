<?php

ini_set("display_errors", "Off");

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use ChatApp\Chat;

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/src/Chat.php';

if (php_sapi_name() == "cli") {
    $server = IoServer::factory(
        new HttpServer(
            new WsServer(
                new Chat()
            )
        ),
        8080
    );
    $server->run();
} else {
    echo "You are not allowed to run this script.";
}
//
?>
