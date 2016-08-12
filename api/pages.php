<?php

require dirname(__FILE__) . '/v2/MusicAPI.php';

$api = new MusicAPI();

$p = $_GET['p'];
$s = $_GET['s'];
if (!empty($s)) {
  if ($p && $p === 0) {
    $result = $api->search($s, 30);
    print_r($result);
	}
	$result = $api->search($s, 30, $p);
	print_r($result);
}