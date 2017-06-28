<?php

$user = isset($_GET["user"]) ? $_GET["user"] : "Karstens";
$case = isset($_GET["case"]) ? $_GET["case"] : "20110524";
$site = isset($_GET["site"]) ? $_GET["site"] : "KTLX";

$logs = scandir("time_logs");
unset($logs[array_search('.',$logs)]);
unset($logs[array_search('..',$logs)]);

$val = "none";
foreach($logs as $log){
	$split = explode("_",$log);
	if($split[0] == $case && $split[1] == $site && $split[2] == $user.".txt"){
		$data = file("time_logs/".$log);
		$val = $data[0];
	}
}

echo $val;

?>
