<?php
header('Content-Type: application/json');

require dirname(__FILE__) . '/v2/MusicAPI.php';

$api = new MusicAPI();

$id = $_GET['id'];

if (!empty($id)) {
  $detail = $api->detail($id);
  print_r($detail);
}