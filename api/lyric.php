<?php
header('Content-Type: application/json');

require dirname(__FILE__) . '/v2/MusicAPI.php';

$api = new MusicAPI();

$id = $_GET['id'];

if (!empty($id)) {
	$result = $api->lyric($id);
	print_r($result);
}