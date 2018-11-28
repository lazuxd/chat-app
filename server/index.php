<?php

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use Ratchet\App;
use ChatApp\Chat;

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/src/Chat.php';

$app = new App('localhost', 8080);
$app->route('/chat', new Chat(), array('*'));
//here add as many routes as you want.

$app->run();

?>