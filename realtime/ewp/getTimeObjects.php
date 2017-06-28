<?php

require_once("pip.php");

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

// init vars
date_default_timezone_set('UTC');
$objID = isset($_GET["objID"]) ? $_GET["objID"] : "0000004";
$now = isset($_GET["now"]) ? $_GET["now"] : "1430091000";
$type = isset($_GET["type"]) ? $_GET["type"] : "probSevere";
$archive = isset($_GET["archive"]) ? $_GET["archive"] : "20150426";
$site = isset($_GET["site"]) ? $_GET["site"] : "KFWS";
$maxlimit = isset($_GET["maxlimit"]) ? $_GET["maxlimit"] : "5";
$x = isset($_GET["x"]) ? $_GET["x"] : "-97.20172";
$y = isset($_GET["y"]) ? $_GET["y"] : "31.924457";

// determine path to object files
$path = getcwd();
if($archive == 0){
	$sPath = "floater/humanObjects/legacy";
	$a = 0;
}
else{
	$sPath = "../../archive/".$archive."/".$site."/humanObjects/legacy";
	$a = 1;
}

// determine type info
if($type == "probSevere"){
	$t1 = "severe";
}
elseif($type == "tornado"){
	$t1 = "tornado";
}
elseif($type == "lightning"){
	$t1 = "lightning";
}

// get swath generation times for pinging swath data
// get last hour of data
$fTimes = array();
$files = array_reverse(array_diff(scandir($sPath), array('..', '.')));
foreach($files as $f){
	$e = explode("_",$f);
	if($type == "probSevere" && $e[0] != "severe"){
		continue;
	}
	elseif($type == "tornado" && $e[0] != "tornado"){
		continue;
	}
	elseif($type == "lightning" && $e[0] != "lightning"){
		continue;
	}
	$fTime = strtotime(substr($e[1],0,4)."-".substr($e[1],4,2)."-".substr($e[1],6,2)." ".substr($e[1],9,2).":".substr($e[1],11,2).":".substr($e[1],13,2)." UTC");
	if(($now - $fTime) < 0 || ($now - $fTime) > 3600){
		continue;
	}
	$fTimes[] = $fTime;
}

//print_r($fTimes);
//die();

// get swaths and use for filtering
$pl = new pointLocation;
$lTimes = array();
foreach($fTimes as $fTime){
        $pnt = $x." ".$y;
        $txt = exec("php ".$path."/combineLegacy.php d=".$fTime." type=".$t1." archive=".$archive." site=".$site." wType=all auto=2");
        $legacy = json_decode($txt,true);
        foreach($legacy["features"] as $leg){
		if(sprintf('%07d',$leg["properties"]["data"]["ID"]) != sprintf('%07d',$objID)){
			continue;
		}
                $poly = array();
               	foreach($leg["geometry"]["coordinates"][0] as $coord){
                       	$poly[] = $coord[0]." ".$coord[1];
                }
               	if($pl->pointInPolygon($pnt, $poly) == 1){
                        $lTimes[] = $fTime;
			break;
                }
        }
	if(count($lTimes) == $maxlimit){
		break;
	}
}

$lTimes = array_reverse($lTimes);

//print_r($lTimes);
//die();

// get raw objects
$json = array();
$json["type"] = "FeatureCollection";
$json["features"] = array();
foreach($lTimes as $lTime){
	$txt = exec("php ".$path."/ewpProbs.php d=".date("YmdHis",$lTime)." fcstr=test type=".$t1." archive=".$a." block=1 automated=1");
	$feats = json_decode($txt,true);
	foreach($feats["features"] as $feat){
		if(sprintf('%07d',$feat["properties"]["data"]["id"]) == sprintf('%07d',$objID) && !in_array($feat,$json["features"])){
			$json["features"][] = $feat;
			break;
		}
	}
}

$out = json_encode($json);
echo $out;

?>
