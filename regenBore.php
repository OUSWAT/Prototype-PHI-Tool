<?php

date_default_timezone_set('UTC');

$invHeight = isset($_GET["invHeight"]) ? $_GET["invHeight"] : "";
$invStrength = isset($_GET["invStrength"]) ? $_GET["invStrength"] : "";
$cpDepth = isset($_GET["cpDepth"]) ? $_GET["cpDepth"] : "";
$cpSpeed = isset($_GET["cpSpeed"]) ? $_GET["cpSpeed"] : "";
$reqTime = isset($_GET["reqTime"]) ? $_GET["reqTime"] : "";

$path = getcwd();

$data = file($path."/bore/".$reqTime.".txt");
$p = explode(",", trim($data[1]));
system("rm -rf ".$path."/bore/".$reqTime.".txt");

$log = $path.'/bore/format.txt';
$str = $p[0].",".$p[1].",".$p[2].",".$p[3].",".$p[4].",".$p[5].",".$p[6].",".$reqTime.",".$invHeight.",".$invStrength.",".$cpDepth.",".$cpSpeed;

$fh = fopen($log,'w');
fwrite($fh,$str);
fclose($fh);

?>
