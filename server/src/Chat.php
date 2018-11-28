<?php

namespace ChatApp;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Chat implements MessageComponentInterface {
    protected $clients;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "New Connection: $conn->resourceId\n";
    }
    public function onMessage(ConnectionInterface $from, $msg) {
        $othersCount = count($this->clients)-1;
        echo "Connection $from->resourceId sending message $msg to $othersCount other connection(s)\n";
        foreach ($this->clients as $client) {
            if ($from !== $client) {
                $client->send($msg);
            }
        }
    }
    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        echo "Connection $conn->resourceId has disconnected\n";
    }
    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: $e->getMessage()\n";
        $this->clients->detach($conn);
        $conn->close();
    }
}

?>