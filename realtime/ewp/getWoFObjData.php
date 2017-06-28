<?php

require_once("pip.php");

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

// init vars
date_default_timezone_set('UTC');
$objID = isset($_GET["objID"]) ? $_GET["objID"] : "58902";
$now = isset($_GET["now"]) ? $_GET["now"] : "1430949610";
$nowData = isset($_GET["nowData"]) ? $_GET["nowData"] : "1430949610";
$type = isset($_GET["type"]) ? $_GET["type"] : "probSevere";
$archive = isset($_GET["archive"]) ? $_GET["archive"] : "20150506";
$site = isset($_GET["site"]) ? $_GET["site"] : "KTLX";
$key = isset($_GET["key"]) ? $_GET["key"] : "wofuh";

if($archive != 0){
	$path = "../../archive/".$archive."/".$site."/probSevereObjects/objects";
}
else{
	$path = "floater/probSevereObjects/objects";
}

// determine object file for reading attributes
$objFile = "";
$files = array_diff(scandir($path), array('..', '.'));
foreach($files as $f){
        $e = explode("_",$f);
        $e2 = explode(".",$e[2]);
        if($e2[0] == $objID){
                $objFile = $f;
                break;
        }
}

if(empty($objFile)){
	die("|");
}

// set time stamp
$tMinData = date("i",$nowData);
if($tMinData < 30){
	$tMinData = 0;
}
else{
	$tMinData = 30;
}

$tMin = date("i",$now);
if($tMin < 30){
        $tMin = 0;
}
else{
     	$tMin = 30;
}

$start = strtotime(date("Y-m-d H",$now).":".$tMin.":00 UTC");
$startData = strtotime(date("Y-m-d H",$nowData).":".$tMinData.":00 UTC");

// extract attributes
$lines = file($path."/".$objFile) or die("|");
$lineCount = count($lines);
$times = array();
$data = array();
$poly = array();
$c = 0;
foreach($lines as $line){
	$geojson = json_decode(trim($line), true);
        if($geojson["properties"]["data"]["valid_start"] > $startData){
		foreach($geojson["geometry"]["coordinates"][0] as $coord){
			$poly[] = $coord[0]." ".$coord[1];
		}
		break;
	}
}

if(empty($poly)){
	die("|");
}

// get WoF data path
$wofPath = "wof/".date("Ymd",$startData)."/".date("Hi",$startData);
if(!is_dir($wofPath)){
	$startData = $startData - 1800;
	$wofPath = "wof/".date("Ymd",$startData)."/".date("Hi",$startData);
	if(!is_dir($wofPath)){
		$startData = $startData - 1800;
	       	$wofPath = "wof/".date("Ymd",$startData)."/".date("Hi",$startData);
		if(!is_dir($wofPath)){
			die("|");
		}
	}
}
$files = array_diff(scandir($wofPath), array('..', '.'));

// Main data extraction loop
$pl = new pointLocation;
foreach($files as $f){
	$ids = array();
	// wof_201505062200_004_tracks1.json
        $e = explode("_",$f);
        $e2 = explode(".",$e[3]);
        if($key == "wofuh" && $e2[0] == "tracks2" || $key == "wofvor" && $e2[0] == "tracks1"){
		$lines = file($wofPath."/".$f);
		foreach($lines as $line){
			$geojson = json_decode(trim($line), true);
			$trackTime = $startData + ($geojson["properties"]["time"] * 60 * 5);
			if(in_array($geojson["properties"]["objID"],$ids)){
				$relTime = (($startData + ($geojson["properties"]["time"] * 60 * 5)) - $now) / 60;
				if($key == "wofuh"){
					if($geojson["geometry"]["type"] == "Point"){
						$times[] = $relTime;
	                                        $data[] = $geojson["properties"]["uh"];
					}
					else{
						for($i=0;$i<count($geojson["geometry"]["coordinates"]);$i++){
							$times[] = $relTime;
							$data[] = $geojson["properties"]["uh"][$i];
						}
					}
                                }
                                else{
					if($geojson["geometry"]["type"] == "Point"){
                                                $times[] = $relTime;
                                                $data[] = $geojson["properties"]["vor"] / 100;
                                        }
                                        else{
                                                for($i=0;$i<count($geojson["geometry"]["coordinates"]);$i++){
                                                        $times[] = $relTime;
                                                        $data[] = $geojson["properties"]["vor"][$i] / 1000;
	                                        }
	                                }
                                }
			}
			elseif(abs($trackTime - $startData) > (40 * 60)){
				continue;
			}
			elseif($geojson["geometry"]["type"] == "Point"){
				$p = $geojson["geometry"]["coordinates"][0]." ".$geojson["geometry"]["coordinates"][1];
				if($pl->pointInPolygon($p, $poly) == 1){
					$ids[] = $geojson["properties"]["objID"];
					$relTime = (($startData + ($geojson["properties"]["time"] * 60 * 5)) - $now) / 60;
					$times[] = $relTime;
					if($key == "wofuh"){
						$data[] = $geojson["properties"]["uh"];
					}
					else{
						$data[] = $geojson["properties"]["vor"] / 1000;
					}
				}
			}
			else{
				for($i=0;$i<count($geojson["geometry"]["coordinates"]);$i++){
					$p = $geojson["geometry"]["coordinates"][$i][0]." ".$geojson["geometry"]["coordinates"][$i][1];
	                                if($pl->pointInPolygon($p, $poly) == 1){
						$ids[] = $geojson["properties"]["objID"];
	                                        $relTime = (($startData + ($geojson["properties"]["time"] * 60 * 5)) - $now) / 60;
	                                        if($key == "wofuh"){
	                                                $data[] = $geojson["properties"]["uh"][$i];
							$times[] = $relTime;
	                                        }
	                                        else{
							$times[] = $relTime;
	                                                $data[] = $geojson["properties"]["vor"][$i] / 1000;
	                                        }
	                                }
				}
			}
		}
        }
}

// dump info
if(empty($times)){
        echo "|";
}
else{
        echo implode(",",$times)."|".implode(",",$data);
}

?>
