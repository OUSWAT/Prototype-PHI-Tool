<?php

date_default_timezone_set('UTC');

$threat = isset($_GET["threat"]) ? $_GET["threat"] : "";
$case = isset($_GET["case"]) ? $_GET["case"] : "";
$user = isset($_GET["user"]) ? $_GET["user"] : "";

if(!empty($case)){
	$fname = 'threats/'.$case.'/'.$threat;
	$data = file($fname);
	foreach($data as $line){
		$d = explode(",",$line);
		foreach($d as $part){
			if(strstr($part,'issue')){
				$d2 = explode(":",$part);
				$issue = $d2[1];
				break;
			}
		}
		$fname = 'threats/json/'.$user.'/'.$issue.'.json';
		system('rm -r '.$fname);
	}
	$fname = 'threats/'.$case.'/'.$threat;
        system('rm -r '.$fname);
	echo "Threat Deleted";
}
else{
	echo "Sum Ting Wong";
}

?>
