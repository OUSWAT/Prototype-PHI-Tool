<?php

date_default_timezone_set('UTC');

// input ids to write out
$child = isset($_GET["child"]) ? $_GET["child"] : "6";
$adult = isset($_GET["adult"]) ? $_GET["adult"] : "4";
$type = isset($_GET["type"]) ? $_GET["type"] : "probSevere";

// read data from log
$log = "realtime/ewp/objectPairs_".$type.".json";
//$log = "realtime/ewp/objectPairs.json";
$data = file($log);
$json = json_decode(trim($data[0]), true);

// add child/adult to list
$found = false;
$keys = array_keys($json);
foreach($json as $key => $arr){
	if($key == $adult && in_array($child, $arr)){
		$found = true;
		break;
	}
	elseif(in_array($adult, $arr) && !in_array($child, $arr)){
		$json[$key][] = $child;
		$found = true;
		break;
	}
}
if(!$found){
	$json[$adult][] = $child;
}

// write data to log
$out = json_encode($json);
$fh = fopen($log,'w');
fwrite($fh,$out);
fclose($fh);

// scp to other machines

?>
