<?php

namespace ChatApp;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

require_once("data.php");
require_once("functions.php");
require_once("checkToken.php");


class Chat implements MessageComponentInterface {
    protected $conversations;
    protected $userIds;

    public function __construct() {
        $this->conversations = [];
        $this->connInfo = [];
    }

    public function onOpen(ConnectionInterface $conn) {
    }
    public function onMessage(ConnectionInterface $from, $msg) {
        $data = \json_decode($msg);
        switch ($data->type) {
            /**
             *          SCHEMA:
             *      $data->token,
             *      $data->convId
            */
            case "open":
                if (!isset($this->conversations[$data->convId])) {
                    $this->conversations[$data->convId] = new \SplObjectStorage;
                }
                $this->conversations[$data->convId]->attach($from);
                try {
                    $userId = \checkToken($data->token, true);
                    $db = new \PDO("mysql:dbname=ChatApp;host=localhost", username, password);
                    $db->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
                    $stmt = $db->prepare("SELECT DisplayName FROM Users WHERE UserID = :userId;");
                    if (!$stmt->execute([":userId" => $userId])) {
                        throw new Exception("Could not execute query.");
                    } else if (!($row = $stmt->fetch())) {
                        throw new Exception("Could not fetch data.");
                    } else {
                        $this->connInfo[$from->resourceId] = ["userId" => $userId, "convId" => $data->convId, "name" => $row["DisplayName"]];
                    }
                } catch (Exception $e) {
                    $this->connInfo[$from->resourceId] = ["userId" => -1, "convId" => $data->convId, "name" => ""];
                }
                break;
            /**
             *          SCHEMA:
             *      $data->token,
             *      $data->msg
            */
            case "message":
                try {
                    $userId = checkToken($data->token, true);
                    $convId = $this->connInfo[$from->resourceId]["convId"];
                    $db = new \PDO("mysql:dbname=ChatApp;host=localhost", username, password);
                    $db->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
                    $stmt = $db->prepare("INSERT INTO Messages (Message, ConvID, UserID) VALUES (:msg, :convId, :userId);");
                    if (!$stmt->execute([":msg" => $data->msg, ":convId" => $convId, ":userId" => $userId])) {
                        throw new Exception("Could not execute query.");
                    } else if (!($msgId = $db->lastInsertId())) {
                        throw new Exception("Could not fetch data.");
                    } else {
                        $dataToSend = [
                            "status" => "success",
                            "MsgID" => $msgId,
                            "Message" => $data->msg,
                            "Name" => $this->connInfo[$from->resourceId]["name"],
                            "Me" => 0
                        ];
                        foreach ($this->conversations[$convId] as $client) {
                            if ($from !== $client) {
                                $client->send(json_encode($dataToSend));
                            } else {
                                $dataToSend["Me"] = 1;
                                $client->send(json_encode($dataToSend));
                                $dataToSend["Me"] = 0;
                            }
                        }
                    }
                } catch (Exception $e) {
                    $from->send(json_encode(["status" => "failure", "errorMessage" => $e->getMessage()]));
                }
                break;
        }
    }
    public function onClose(ConnectionInterface $conn) {
        $convId = $this->connInfo[$conn->resourceId]["convId"];
        if ($convId && $this->conversations[$convId]) {
            $this->conversations[$convId]->detach($conn);
        }
        unset($this->connInfo[$conn->resourceId]);
    }
    public function onError(ConnectionInterface $conn, \Exception $e) {
        $convId = $this->connInfo[$conn->resourceId]["convId"];
        if ($convId && $this->conversations[$convId]) {
            $this->conversations[$convId]->detach($conn);
        }
        unset($this->connInfo[$conn->resourceId]);
        $conn->close();
    }
}

?>