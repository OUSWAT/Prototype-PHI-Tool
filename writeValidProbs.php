<?php

date_default_timezone_set('UTC');

$user = isset($_GET["user"]) ? $_GET["user"] : "Karstens";
$type = isset($_GET["type"]) ? $_GET["type"] : "range";
$id = isset($_GET["id"]) ? $_GET["id"] : "1";
$inputTime = isset($_GET["inputTime"]) ? $_GET["inputTime"] : "1369079981";
$min = isset($_GET["min"]) ? $_GET["min"] : "0";
$max = isset($_GET["max"]) ? $_GET["max"] : "100";
$apType = isset($_GET["apType"]) ? $_GET["apType"] : "severe";
$spd = isset($_GET["spd"]) ? $_GET["spd"] : "-1";
$dir = isset($_GET["dir"]) ? $_GET["dir"] : "-1";

if(substr($user,0,3) == "ewp"){
	$user2 = "ewp";
	$imgType = "ewp";
}
else{
	$user2 = $user;
	$imgType = "blobert";
}

// try to override input time with latest PHI image time
$imgPath = "realtime/ewp/floater/PHI";
$files = array_reverse(array_diff(scandir($imgPath), array('..', '.')));
foreach($files as $f){
	if($type == "range" && strpos($f,$imgType) === false || $type == "range" && strpos($f,$apType) === false){
		continue;
	}
	elseif(strpos($f,$imgType) === false || strpos($f,$apType) === false){
                continue;
	}
	$e = explode("_",$f);
	$t = substr($e[1],0,4)."-".substr($e[1],4,2)."-".substr($e[1],6,2)." ".substr($e[1],9,2).":".substr($e[1],11,2).":".substr($e[1],13,2)." UTC";
	if(abs($inputTime - strtotime($t)) < 86400){
		$inputTime = strtotime($t);
	}
	break;
}

if($type == "range"){
	$tStamp = date("Ymd-His", $inputTime);
	$log = "validProbs/range/".$user2."-".$apType."_".$tStamp.".txt";
	$fh = fopen($log,'w');
	fwrite($fh,$min.",".$max.",".$spd.",".$dir);
	fclose($fh);
}
elseif($type == "allow"){
	$tStamp = date("Ymd-His", $inputTime);
	$log = "validProbs/allow/".$user2."_".$tStamp."_".sprintf("%06d", $id).".txt";
	$fh = fopen($log,'w');
        fwrite($fh,"allow");
        fclose($fh);
}
elseif($type == "block"){
	$tStamp = date("Ymd-His", $inputTime);
        $log = "validProbs/block/".$user2."_".$tStamp."_".sprintf("%06d", $id).".txt";
        $fh = fopen($log,'w');
        fwrite($fh,"block");
       	fclose($fh);
}

?>
