<?php

date_default_timezone_set('UTC');

$gridTime = isset($_GET["gridTime"]) ? $_GET["gridTime"] : "";
$user = isset($_GET["user"]) ? $_GET["user"] : "";

$f = 'realtime/efp/logs/errorLog_'.$user.".txt";
if(file_exists($f)){
	$grid = file($f) or die('none');
	echo "Processing Notes:\n\n";
	foreach($grid as $line){
		echo $line;
	}
	system('rm '.$f);
}
else{
	echo 'none';
}

?>
