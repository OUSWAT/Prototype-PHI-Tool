<?php

ob_start('ob_gzhandler');

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

date_default_timezone_set('UTC');

// input variables
$d = isset($_GET["d"]) ? $_GET["d"] : "20170507210635";
$type = isset($_GET["type"]) ? $_GET["type"] : "vor";
$layer = isset($_GET["layer"]) ? $_GET["layer"] : "points";

// Opacity interpolation
function getOpacity($rTime){
	$leadTime = $rTime / 60;
	if($leadTime < 5){
		$o = 1;
	}
	elseif($leadTime < 10){
		$o = 0.9;
	}
       	elseif($leadTime < 15){
               	$o = 0.75;
       	}
       	elseif($leadTime < 30){
               	$o = 0.6;
       	}
	elseif($leadTime < 45){
                $o = 0.5;
        }
	elseif($leadTime < 60){
                $o = 0.4;
        }
	elseif($leadTime < 90){
                $o = 0.3;
        }
	else{
               	$o = 0.2;
       	}
	return $o;
}



// initialize json to return
$json = array();
$json["type"] = "FeatureCollection";
$json["features"] = array();

// define variables, determine if path exists
$wofFile = "";
$t = substr($d,0,4)."-".substr($d,4,2)."-".substr($d,6,2)." ".substr($d,8,2).":".substr($d,10,2).":".substr($d,12,2)." UTC";
$inTime = strtotime($t);
$inTime2 = strtotime($t);
$inHour = substr($d,8,2);
$inMinute = substr($d,10,2);

// figure out init time for directory structure
if($inMinute < 30){
	$inMinute = "00";
}
else{
	$inMinute = "30";
}

// figure out tracks type
/*
if($type == "uh"){
        $type2 = "tracks2";
}
else{
        $type2 = "tracks1";
}
*/
$type2 = $type;

$init = $inHour.$inMinute;
$now = date("Ymd",$inTime);
$path = "realtime/ewp/wof/".$now."/".$init;
if(!is_dir($path)){
	$inTime2 = $inTime - 1800; // subtract 30 minutes
	$now = date("Ymd",$inTime2);
	$inMinute = date("i",$inTime2);
	$inHour = date("H",$inTime2);
	if($inMinute < 30){
	       	$inMinute = "00";
	}
	else{
	     	$inMinute = "30";
	}
	$init = $inHour.$inMinute;
	$path = "realtime/ewp/wof/".$now."/".$init;
	if(!is_dir($path)){
		$inTime2 = $inTime2 - 1800; // subtract 30 minutes
		$now = date("Ymd",$inTime2);
	        $inMinute = date("i",$inTime2);
	        $inHour = date("H",$inTime2);
		if($inMinute < 30){
	                $inMinute = "00";
	        }
		else{
	             	$inMinute = "30";
	        }
		$init = $inHour.$inMinute;
	       	$path = "realtime/ewp/wof/".$now."/".$init;
	        if(!is_dir($path)){
			// checked an hour back, nothin, give up
			$out = json_encode($json);
			echo $out."\n";
			die();
		}
	}
}
$initTime = strtotime(date("Y-m-d",$inTime2)." ".$inHour.":".$inMinute.":00 UTC");

// get list of files
$files = scandir($path);
unset($files[array_search(".",$files)]);
unset($files[array_search("..",$files)]);
rsort($files);

// iterate through files
foreach($files as $f){
	$s = explode("_",$f);
	$t = substr($s[1],0,4)."-".substr($s[1],4,2)."-".substr($s[1],6,2)." ".substr($s[1],8,2).":".substr($s[1],10,2).":00 UTC";
	$fTime = strtotime($t);
	if($fTime > $inTime){
		continue; // file is from the future, skip
	}
	elseif(strpos($f,$type2) === false){
		continue; // looking for UH or Vertical Vorticity, not both
	}
	elseif($type2 == "vor" && strpos($f,"vorml") !== false){
                continue; // looking for UH or Vertical Vorticity, not both
        }
	elseif($fTime < ($inTime - 7200)){
		// file is too old, return
		$out = json_encode($json);
                echo $out."\n";
                die();
	}
	else{
		// money file
		$wofFile = $path."/".$f;

		// extract contents of WoF file, apply thresholds
		$data = file($wofFile);
		foreach($data as $line){
			$geojson = json_decode(trim($line));
			$geojson->properties->time = $geojson->properties->time * 5;
			$eTime = $fTime + ($geojson->properties->time * 60);
			//if($eTime < $inTime){
			//	continue; // option to block old data
			//}
			//$relTime = $eTime - $inTime;
			//$geojson->properties->relTime = $relTime;
			$geojson->properties->epoch = $eTime;
			$geojson->properties->member = (int)$s[2];
			if($s[2] != 111){
				//continue; // testing purposes with single object
			}
			$json["features"][] = $geojson;
		}
	}
}

// sort tracks
if($type2 == "vor" || $type2 == "vorml"){
	$json2 = array();
	$json2["type"] = "FeatureCollection";
	$json2["features"] = array();
	$lines = array();
	$vals = array();
	foreach($json["features"] as $geo){
		if(!array_key_exists($geo->properties->member,$lines)){
			$lines[$geo->properties->member] = array();
		}
		if(!array_key_exists($geo->properties->objID,$lines[$geo->properties->member])){
                        $lines[$geo->properties->member][$geo->properties->objID] = array();
                }
		if(!array_key_exists($geo->properties->time,$lines[$geo->properties->member][$geo->properties->objID])){
                       	$lines[$geo->properties->member][$geo->properties->objID][$geo->properties->time] = array();
               	}
		if($geo->geometry->type == "Point"){
			$lines[$geo->properties->member][$geo->properties->objID][$geo->properties->time][] = $geo->geometry->coordinates;
		}
		else{
			foreach($geo->geometry->coordinates as $coord){
				$lines[$geo->properties->member][$geo->properties->objID][$geo->properties->time][] = $coord;
			}
		}
	}
	if($type == "vorml"){
		foreach($json["features"] as $geo){
	                if(!array_key_exists($geo->properties->member,$vals)){
	                        $vals[$geo->properties->member] = array();
	                }
	                if(!array_key_exists($geo->properties->objID,$vals[$geo->properties->member])){
	                        $vals[$geo->properties->member][$geo->properties->objID] = array();
	                }
	                if(!array_key_exists($geo->properties->time,$vals[$geo->properties->member][$geo->properties->objID])){
	                        $vals[$geo->properties->member][$geo->properties->objID][$geo->properties->time] = array();
	                }
	                if($geo->geometry->type == "Point"){
	                        $vals[$geo->properties->member][$geo->properties->objID][$geo->properties->time][] = $geo->properties->vorml[0];
	                }
	                else{
	                        foreach($geo->properties->vorml as $vorml){
	                                $vals[$geo->properties->member][$geo->properties->objID][$geo->properties->time][] = $vorml;
	                        }
	                }
		}
        }
	else{
		foreach($json["features"] as $geo){
                        if(!array_key_exists($geo->properties->member,$vals)){
                                $vals[$geo->properties->member] = array();
                        }
                        if(!array_key_exists($geo->properties->objID,$vals[$geo->properties->member])){
                                $vals[$geo->properties->member][$geo->properties->objID] = array();
                        }
                        if(!array_key_exists($geo->properties->time,$vals[$geo->properties->member][$geo->properties->objID])){
                                $vals[$geo->properties->member][$geo->properties->objID][$geo->properties->time] = array();
                        }
                        if($geo->geometry->type == "Point"){
                                $vals[$geo->properties->member][$geo->properties->objID][$geo->properties->time][] = $geo->properties->vorml[0];
                        }
                        else{
                                foreach($geo->properties->vorml as $vor){
                                        $vals[$geo->properties->member][$geo->properties->objID][$geo->properties->time][] = $vor;
                                }
                        }
                }
	}
	//print_r($lines);
	$mems = array_keys($lines);
	foreach($mems as $mem){
		$ids = array_keys($lines[$mem]);
		foreach($ids as $objID){
			//echo $objID."\n";
			$times = array_keys($lines[$mem][$objID]);
			$coords = array();
			$vals2 = array();
                        $tLast = -1;
			foreach($times as $t){
				$eTime = $fTime + ($t * 60);
                                $relTime = $eTime - $inTime;
				if($layer == "points"){
					for($i=0;$i<count($lines[$mem][$objID][$t]);$i++){
						$feat = array();
			                       	$feat["geometry"] = array();
			                        $feat["geometry"]["type"] = "Point";
			                        $feat["geometry"]["coordinates"] = $lines[$mem][$objID][$t][$i];
			                        $feat["properties"] = array();
			                       	$feat["properties"]["color"] = "rgb(0,0,0)";
			                       	$feat["properties"]["member"] = $mem;
			                       	//$feat["properties"]["objID"] = $mem."\n".$objID."\n".(int) ($relTime/60);
						$feat["properties"]["objID"] = $objID;
						//$feat["properties"]["objID"] = '';
						$feat["properties"]["opacity"] = 1;
						//$feat["properties"]["thickness"] = (0.9 - getOpacity($relTime)) / 0.01;
						$feat["properties"]["leadTime"] = $eTime;
						$feat["properties"]["initTime"] = $initTime;
						$feat["properties"]["maxTime"] = $eTime;
						$feat["properties"]["count"] = 1;
						$feat["properties"]["max"] = floatval($vals[$mem][$objID][$t][$i]) * 1000;
						$feat["properties"]["val"] = floatval($vals[$mem][$objID][$t][$i]) * 1000;
			                        $json2["features"][] = $feat;
						break;
					}
				}
				else{
					if($tLast > 0 && ($t-$tLast) > 5){
	                                        $coords = array();
						$vals2 = array();
	                                }
	                                for($i=0;$i<count($lines[$mem][$objID][$t]);$i++){
	                                        $coords[] = $lines[$mem][$objID][$t][$i];
						$vals2[] = floatval($vals[$mem][$objID][$t][$i]) * 1000;
	                                }
	                                //print_r($coords);
	                                if(count($coords) >= 2){
	                                        $feat = array();
	                                        $feat["geometry"] = array();
	                                        $feat["geometry"]["type"] = "LineString";
	                                        $feat["geometry"]["coordinates"] = $coords;
	                                        $feat["properties"] = array();
	                                        $feat["properties"]["color"] = "rgb(0,0,0)";
	                                        $feat["properties"]["member"] = $mem;
	                                        //$feat["properties"]["objID"] = $mem."\n".$objID."\n".(int) ($relTime/60);
	                                        $feat["properties"]["objID"] = $objID;
	                                        //$feat["properties"]["objID"] = '';
	                                        $feat["properties"]["opacity"] = getOpacity($relTime);
	                                        //$feat["properties"]["thickness"] = (0.9 - getOpacity($relTime)) / 0.01;
	                                        $feat["properties"]["leadTime"] = $eTime;
						$feat["properties"]["initTime"] = $initTime;
						$feat["properties"]["maxTime"] = $eTime;
						$feat["properties"]["max"] = max($vals2);
						$feat["properties"]["val"] = max($vals2);
						$json2["features"][] = $feat;
	                                        $lastCoord = $coords[count($coords)-1];
	                                        $coords = array();
	                                        $coords[] = $lastCoord;
						$lastVal = $vals2[count($vals2)-1];
                                                $vals2 = array();
                                                $vals2[] = $lastVal;
	                                }
	                                $tLast = $t;
				}
			}
		}
	}
	$out = json_encode($json2);
	echo $out."\n";
	die();
}

// return json
$out = json_encode($json);
echo $out."\n";

?>
