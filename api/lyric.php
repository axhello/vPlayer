<?php

require dirname(__FILE__) . '/MusicAPI.php';

$api = new MusicAPI();

$id = $_GET['id'];
if (!empty($id)) {
	$result = $api->lyric($id);
	print_r($result);
}