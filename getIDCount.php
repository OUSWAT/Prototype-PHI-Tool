<?php

$user = isset($_GET["user"]) ? $_GET["user"] : "Karstens";
$case = isset($_GET["case"]) ? $_GET["case"] : "";

$path = getcwd();

if(is_numeric($case)){
	$issuePath = $path."/threats/threats";
}
else{
	$issuePath = $path."/realtime/ewp/threats";
}

$files = array_diff(scandir($issuePath), array('..', '.'));
$ids = array(0);
foreach($files as $f){
	// Karstens2-severe_20150428-010326_000002.json
	$e = explode("_", $f);
	$e2 = explode(".",$e[2]);
	$e3 = explode("-",$e[0]);
	if($e3[0] == $user && intval($e2[0]) < 500){
		$ids[] = intval($e2[0]);
	}
}

echo max($ids);

?>
