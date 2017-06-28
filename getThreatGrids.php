<?php

date_default_timezone_set('UTC');

$gridTime = isset($_GET["gridTime"]) ? $_GET["gridTime"] : "";
$user = isset($_GET["user"]) ? $_GET["user"] : "";

if(!empty($gridTime)){
	$grid = file('threats/json/'.$user.'/'.$gridTime.'.json') or die('none');
	foreach($grid as $line){
		echo $line;
	}
}

?>
