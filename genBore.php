<?php

date_default_timezone_set('UTC');

$x1 = isset($_GET["x1"]) ? $_GET["x1"] : "";
$y1 = isset($_GET["y1"]) ? $_GET["y1"] : "";
$x2 = isset($_GET["x2"]) ? $_GET["x2"] : "";
$y2 = isset($_GET["y2"]) ? $_GET["y2"] : "";
$model = isset($_GET["model"]) ? $_GET["model"] : "";
$member = isset($_GET["member"]) ? $_GET["member"] : "";
$init = isset($_GET["member"]) ? $_GET["init"] : "";
$fHour = isset($_GET["fHour"]) ? $_GET["fHour"] : "";
$rTime = isset($_GET["rTime"]) ? $_GET["rTime"] : "";

$path = getcwd();

// INITTIME X(COLDPOOL) Y(COLDPOOL) X(AMBIENT) Y(AMBIENT) VALIDTIME ENSSIZE MEMBER INITDATE
// 12 140 190 135 190 2015-05-16_16:00:00 20 1 20150515

if($model == "ouMap" && $member != "ensmean"){
	$member = intval($member);
}
elseif($model == "ouMap" && $member == "ensmean"){
	$member =  0;
}
else{
	$member = 111;
}

$log = $path.'/bore/format.txt';
$str = $init.",".$x1.",".$y1.",".$x2.",".$y2.",".$member.",".$fHour.",".$rTime.",-1,-1,-1,-1";

$fh = fopen($log,'w');
fwrite($fh,$str);
fclose($fh);

?>
