<?php
header('Content-Type: application/json');

require dirname(__FILE__) . '/v2/MusicAPI.php';

$api = new MusicAPI();

$song_id = $_GET['id'];

if (!empty($song_id)) {
  $mp3url = $api->mp3url($song_id);
  print_r($mp3url);
} else {
	return;
}