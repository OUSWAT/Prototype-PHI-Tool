<?php

header("Content-Type: text/plain");
date_default_timezone_set('UTC');
require_once("pip.php");

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

$d = isset($_GET["d"]) ? $_GET["d"] : "1430091000";
$thresh = isset($_GET["thresh"]) ? $_GET["thresh"] : "0";
$type = isset($_GET["type"]) ? $_GET["type"] : "tornadosevere"; // severe or tornado or tornadosevere
$wType = isset($_GET["wType"]) ? $_GET["wType"] : "all"; // warn, adv, all
$auto = isset($_GET["auto"]) ? $_GET["auto"] : "2"; // 0=only forecaster created/modified, 1= pure automated, 2=human/machine mix, 3=all (same as 2)
$archive = isset($_GET["archive"]) ? $_GET["archive"] : "0";
$site = isset($_GET["site"]) ? $_GET["site"] : "KFWS";
$x = isset($_GET["x"]) ? $_GET["x"] : "";
$y = isset($_GET["y"]) ? $_GET["y"] : "";

$inTime = strtotime(date("Y-m-d H:i:s",$d)." UTC");
if(!empty($x) && !empty($y)){
	$pl = new pointLocation;
	$pnt = $x." ".$y;
}

$gFile1 = "";
$gFile2 = "";
if($archive == 0 || empty($archive)){
	$inPath = "floater/humanObjects/legacy/";
}
else{
	$inPath = "archive/".$archive."/".$site."/humanObjects/legacy/";
}
$files = array_diff(scandir($inPath), array('..', '.'));

// set paths based on inputs
if($type == "tornadosevere"){
	$t1 = "severe";
	$t2 = "tornado";
}
elseif($type == "tornado"){
	$t1 = $type;
	$t2 = "";
}
elseif($type == "severe"){
     	$t1 = $type;
        $t2 = "";
}
elseif($type == "lightning"){
        $t1 = $type;
        $t2 = "";
}

// get human-generated file closest to but not newer than input time
foreach($files as $f){
       	// severe_20160512-145032.json
        $e = explode("_",$f);
        if($e[0] != $t1){
                continue;
        }
	$fTime = strtotime(substr($e[1],0,4)."-".substr($e[1],4,2)."-".substr($e[1],6,2)." ".substr($e[1],9,2).":".substr($e[1],11,2).":".substr($e[1],13,2)." UTC");
	if($fTime > $inTime){
                break;
        }
        if($fTime > ($inTime - 500)){
                $gFile1 = $f;
	}
}

// get human-generated file closest to but not newer than input time for second type option
if(!empty($t2)){
	$files = array_diff(scandir($inPath), array('..', '.'));
	foreach($files as $f){
	        // severe_20160512-145032.json
	        $e = explode("_",$f);
	        if($e[0] != $t2){
	                continue;
	        }
		$fTime = strtotime(substr($e[1],0,4)."-".substr($e[1],4,2)."-".substr($e[1],6,2)." ".substr($e[1],9,2).":".substr($e[1],11,2).":".substr($e[1],13,2)." UTC");
		if($fTime > $inTime){
	                break;
	        }
	        if($fTime > ($inTime - 500)){
	                $gFile2 = $f;
	        }
	}
}

// build json
$json = array();
$json["type"] = "FeatureCollection";
$json["features"] = array();
$ids = array();

// populate json with entries from first file
if(!empty($gFile1)){
	$lines1 = file($inPath."/".$gFile1);
	$j1 = json_decode(trim($lines1[0]), true);
	foreach($j1["features"] as $feat){
		if($auto == 0 && $feat["properties"]["data"]["auto"] == 1){
                        continue;
                }
		elseif($auto == 1 && $feat["properties"]["data"]["auto"] != 1){
			continue;
		}
               	elseif($wType == "warn" && $feat["properties"]["data"]["alertLevel"] != "takeAction"){
			continue;
		}
		elseif($wType == "adv" && $feat["properties"]["data"]["alertLevel"] != "beAware"){
			continue;
		}
		if(!empty($x) && !empty($y)){
			$poly = array();
	                foreach($feat["geometry"]["coordinates"][0] as $coord){
	                        $poly[] = $coord[0]." ".$coord[1];
	                }
			if($pl->pointInPolygon($pnt, $poly) == 1){
				$json["features"][] = $feat;
	                       	$ids[] = $feat["properties"]["data"]["ID"];
	                }
		}
		else{
		        $json["features"][] = $feat;
			$ids[] = $feat["properties"]["data"]["ID"];
		}
	}
}

// populate json with entries from second file
if(!empty($gFile2)){
	$lines2 = file($inPath."/".$gFile2);
	$j2 = json_decode($lines2[0], true);
	foreach($j2["features"] as $feat){
		if($auto == 0 && $feat["properties"]["data"]["auto"] == 1){
                        continue;
                }
		elseif($auto == 1 && $feat["properties"]["data"]["auto"] != 1){
                       	continue;
               	}
               	elseif($wType == "warn" && $feat["properties"]["data"]["alertLevel"] != "takeAction"){
                       	continue;
                }
               	elseif($wType == "adv" && $feat["properties"]["data"]["alertLevel"] != "beAware"){
                       	continue;
               	}
		if(!empty($x) && !empty($y)){
                        $poly = array();
                        foreach($feat["geometry"]["coordinates"][0] as $coord){
                               	$poly[] = $coord[0]." ".$coord[1];
                       	}
                        if($pl->pointInPolygon($pnt, $poly) == 1){
                                $json["features"][] = $feat;
                                $ids[] = $feat["properties"]["data"]["ID"];
                       	}
               	}
                else{
                        $json["features"][] = $feat;
                       	$ids[] = $feat["properties"]["data"]["ID"];
               	}
	}
}

// dump json
$out = json_encode($json);
echo $out."\n";

?>
