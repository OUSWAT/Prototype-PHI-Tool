<?php

$user = isset($_GET["user"]) ? $_GET["user"] : "Karstens";
$case = isset($_GET["case"]) ? $_GET["case"] : "20110524";
$site = isset($_GET["site"]) ? $_GET["site"] : "KTLX";
$inTime = isset($_GET["inTime"]) ? $_GET["inTime"] : "8888888";

$fh = fopen("time_logs/".$case."_".$site."_".$user.".txt","w");
fwrite($fh,$inTime);
fclose($fh);

?>
