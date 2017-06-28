<?php

date_default_timezone_set('UTC');

$gridTime = isset($_GET["gridTime"]) ? $_GET["gridTime"] : "";
$user = isset($_GET["user"]) ? $_GET["user"] : "Karstens";

$f = 'realtime/efp/geoJSON/'.$user.".json";
if(file_exists($f)){
	$grid = file($f) or die('no file');
	foreach($grid as $line){
		echo $line;
	}
	system('rm '.$f);
}
else{
	echo 'none';
}

?>
