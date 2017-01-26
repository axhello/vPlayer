<?php
header('Content-Type: application/json');

require dirname(__FILE__) . '/v2/MusicAPI.php';

$api = new MusicAPI();

$s = $_GET['s'];

if (!empty($s)) {
  $result = $api->search($s, 30);
  print_r($result);
}
