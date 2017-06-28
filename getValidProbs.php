<?php

date_default_timezone_set('UTC');

$user = isset($_GET["user"]) ? $_GET["user"] : "Karstens";
$apType = isset($_GET["apType"]) ? $_GET["apType"] : "severe";
$now = isset($_GET["now"]) ? $_GET["now"] : "";

if(empty($now)){
	$now = strtotime(date("Y-m-d H:i:s"));
}

// need to do something for archived events

if(substr($user,0,3) == "ewp"){
	$user = "ewp";
}


$validPath = "validProbs/range";

$files = array_reverse(array_diff(scandir($validPath), array('..', '.')));
$notFound = true;;
foreach($files as $f){
	// Karstens-severe_20170331-134838.txt
	$e = explode("_",$f);
	$e2 = explode("-",$e[0]);
	$t = substr($e[1],0,4)."-".substr($e[1],4,2)."-".substr($e[1],6,2)." ".substr($e[1],9,2).":".substr($e[1],11,2).":".substr($e[1],13,2)." UTC";
       	$fTime = strtotime($t);
	if($e2[0] == $user && $e2[1] == $apType && ($now - $fTime) < 10800 && ($now - $fTime) > 0){
		$log = $validPath."/".$f;
		$data = @file($log) or die("0,100,-1,-1");
		echo $data[0];
		$notFound = false;
		break;
	}
}
if($notFound){
	echo "0,100,-1,-1";
}

?>
