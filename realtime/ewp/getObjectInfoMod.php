<?php

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

// init vars
date_default_timezone_set('UTC');
$objID = isset($_GET["objID"]) ? $_GET["objID"] : "247390";
$now = isset($_GET["now"]) ? $_GET["now"] : "1461878400";
$type = isset($_GET["type"]) ? $_GET["type"] : "probSevere";
$archive = isset($_GET["archive"]) ? $_GET["archive"] : "0";
$site = isset($_GET["site"]) ? $_GET["site"] : "KABR";
$key = isset($_GET["key"]) ? $_GET["key"] : "wind1";
$user = isset($_GET["user"]) ? $_GET["user"] : "ewp12";
$inTimes = isset($_GET["inTimes"]) ? $_GET["inTimes"] : "";
$analysis = isset($_GET["analysis"]) ? $_GET["analysis"] : "false";
$probSevereKeys = array("cape","shear","mesh","growth","glaciation","flashRate","lightningJump");
$azShearKeys = array("3-6kmAGL");
$lightningKeys = array("totalLightning","nldnCG_count","eniIC_count");

$nowCheck = $now;
if($analysis == "true"){
	$nowCheck = 9999999999;
}
$inTimes = explode(",",$inTimes);
$outData = array();
for($i=0;$i<count($inTimes);$i++){
	$outData[] = "null";
}
// {"direction":1,"impacts":0,"object":0,"prediction":0,"actions":0,"duration":0,"speed":1,"probs":1,"confidence":1,"severity":1,"discussion":0,"warningThresh":1,"source":1,"warningType":0,"alertLevel":1}
if($key == "Direction"){
	$key = "dirs";
	$key2 = "direction";
}
elseif($key == "Speed"){
	$key = "speeds";
	$key2 = "speed";
}
elseif($key == "duration4"){
       	$key = "duration";
	$key2 = "duration";
}
elseif($key == "probability"){
       	$key = "probs";
	$key2 = "probs";
}

// determine path to object files
if($analysis == "true"){
	$path = "../../archive/".$archive."/".$site."/phiObjects/objects";
}
elseif($archive == 0){
	$path = "threats";
}
else{
	$path = "../../threats/".$archive;
}

// determine object file for reading attributes
$objFile = "";
$files = array_diff(scandir($path), array('..', '.'));
foreach($files as $f){
	$e = explode("_",$f);
	$e2 = explode(".",$e[2]);
	$e3 = explode("-",$e[0]);
	if($e2[0] == $objID && $e3[0] == $user){
		$objFile = $f;
		break;
	}
}

// extract discussion
$lines = file($path."/".$objFile) or die("|");
if($archive == 0){
	$lineCount = count($lines);
}
else{
	$lineCount = 0;
	foreach($lines as $line){
		$geojson = json_decode(trim($line), true);
	        if($geojson["properties"]["data"]["valid_start"] <= $nowCheck){
			$lineCount++;
		}
	}
	$lines = file($path."/".$objFile);
}
$times = array();
$data = array();
$c = 0;
foreach($lines as $line){
	$c++;
	$geojson = json_decode(trim($line), true);
	if($geojson["properties"]["data"]["valid_start"] <= $nowCheck && $geojson["properties"]["data"]["modified"][$key2] == 1){
		$min = ($geojson["properties"]["data"]["valid_start"] - $now) / 60;
		$max = (($geojson["properties"]["data"]["valid_start"] + ($geojson["properties"]["data"]["duration"] * 60)) - $now) / 60;
		for($i=0;$i<count($inTimes);$i++){
			if($inTimes[$i] >= $min && $inTimes[$i] <= $max){
				if($key == "duration"){
					$outData[$i] = $geojson["properties"]["data"][$key];
				}
				elseif($key == "probs"){
					if($geojson["properties"]["data"]["prediction"] == "explicit"){
						$idx = floor(($inTimes[$i] - $min) / 5);
						//echo $idx.",";
						try{
							$outData[$i] = $geojson["properties"]["data"][$key][0][$idx];
						}
						catch(Exception $e){
							$outData[$i] = "null";
						}
					}
					else{
						$outData[$i] = $geojson["properties"]["data"][$key][0][0];
					}
				}
				else{
					$outData[$i] = $geojson["properties"]["data"][$key][0];
				}
			}
		}
	}
}

// dump info
echo implode(",",$inTimes)."|".implode(",",$outData);

?>
