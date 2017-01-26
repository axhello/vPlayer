<?php
header('Content-Type: application/json');

require dirname(__FILE__) . '/v2/MusicAPI.php';

$api = new MusicAPI();

$p = $_GET['p'];
$s = $_GET['s'];

if (!empty($s) && !empty($p)) {
  $result = $api->search($s, 30, $p);
  print_r($result);
} elseif ($p == 0 || empty($p)) {
  $result = $api->search($s, 30);
  print_r($result);
}