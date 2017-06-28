<?php

ob_start('ob_gzhandler');
require_once("pip.php");

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

date_default_timezone_set('UTC');

$d = isset($_GET["d"]) ? $_GET["d"] : "20150424031832";
$fcstr = isset($_GET["fcstr"]) ? $_GET["fcstr"] : "Karstens";
$type = isset($_GET["type"]) ? $_GET["type"] : "severe";
$archive = isset($_GET["archive"]) ? $_GET["archive"] : "0";
$analysis = isset($_GET["analysis"]) ? $_GET["analysis"] : "0";
$automated = isset($_GET["automated"]) ? $_GET["automated"] : "1";
$block = isset($_GET["block"]) ? $_GET["block"] : "0";

$path = "/var/www/html/RadarQC/phi_new";

if(substr($fcstr,0,3) == "ewp"){
	$fcstr = "ewp";
}

$t = substr($d,0,4)."-".substr($d,4,2)."-".substr($d,6,2)." ".substr($d,8,2).":".substr($d,10,2).":".substr($d,12,2)." UTC";
$inTime = strtotime($t);

if($type == "tornado"){
	$dir = "azShearObjects";
	$objPairs = "objectPairs_azShear.json";
}
elseif($type == "lightning"){
        $dir = "lightningObjects";
	$objPairs = "objectPairs_lightning.json";
}
elseif($type == "all"){
	$dir1 = "azShearObjects";
	$dir2 = "probSevereObjects";
	$dir2 = "lightningObjects";
}
else{
	$dir = "probSevereObjects";
	$objPairs = "objectPairs_probSevere.json";
}

if($analysis == 1){
	$analysis = true;
}
else{
	$analysis = false;
}

if($archive == 1 || $analysis){
	if($archive == 1){
		$archive = true;
	}
	if(substr($d,0,4) == '2010'){
		$caseDir = '20100522';
		$site = 'KABR';
	}
	elseif(substr($d,0,4) == '2014'){
		$caseDir = '20140603';
		$site = 'KOAX';
	}
	elseif(substr($d,0,6) == '201504'){
               	$caseDir = '20150426';
                $site = 'KFWS';
        }
	elseif(substr($d,0,6) == '201505'){
                $caseDir = '20150506';
                $site = 'KTLX';
       	}
	elseif(substr($d,0,8) == '20150619' || substr($d,0,8) == '20150620'){
                $caseDir = '20150619';
                $site = 'KUDX';
        }
	elseif(substr($d,0,8) == '20150624' || substr($d,0,8) == '20150625'){
                $caseDir = '20150624';
                $site = 'KFFC';
        }
	elseif(substr($d,0,4) == '2016'){
		$caseDir = '20160901';
                $site = 'KMLB';
	}
	else{
		$caseDir = substr($d,0,8);
		$site = 'KUNK';
	}
}
elseif($archive != 1){
	$archive = false;
}

if($archive){
	$autoObjectsPath = $path."/archive/".$caseDir."/".$site."/".$dir."/objects";
	if($fcstr == "ewp"){
		$manualObjectsPath = $path."/realtime/ewp/threats";
	}
	else{
		$manualObjectsPath = $path."/threats/".$caseDir;
	}
	$allowPath = $path."/validProbs/allow";
	$blockPath = $path."/validProbs/block";
	$validPath = $path."/validProbs/range";
}
elseif($analysis){
	$autoObjectsPath = $path."/archive/".$caseDir."/".$site."/".$dir."/objects";
	$manualObjectsPath = $path."/archive/".$caseDir."/".$site."/phiObjects/objects";
	$allowPath = $path."/archive/".$caseDir."/".$site."/phiObjects/validProbs/allow";
        $blockPath = $path."/archive/".$caseDir."/".$site."/phiObjects/validProbs/block";
        $validPath = $path."/archive/".$caseDir."/".$site."/phiObjects/validProbs/range";
}
else{
	$autoObjectsPath = $path."/realtime/ewp/floater/".$dir."/objects";
	$manualObjectsPath = $path."/realtime/ewp/threats";
	$allowPath = $path."/validProbs/allow";
        $blockPath = $path."/validProbs/block";
        $validPath = $path."/validProbs/range";
}

// initialize json to return
$json = array();
$json["type"] = "FeatureCollection";
$json["features"] = array();

// get list of allowed objects within last 3 hour window
$files = array_reverse(array_diff(scandir($allowPath), array('..', '.')));
$allowIDs = array();
foreach($files as $f){
	$e = explode("_",$f);
	$e2 = explode(".",$e[2]);
	$t = substr($e[1],0,4)."-".substr($e[1],4,2)."-".substr($e[1],6,2)." ".substr($e[1],9,2).":".substr($e[1],11,2).":".substr($e[1],13,2)." UTC";
        $fTime = strtotime($t);
	if($inTime >= $fTime && ($inTime - $fTime) < 10800){
		$allowIDs[sprintf('%07d',$e2[0])][] = $fTime;
	}
}

// get list of blocked objects
$allowKeys = array_keys($allowIDs);
$files = array_reverse(array_diff(scandir($blockPath), array('..', '.')));
$blockIDs = array();
foreach($files as $f){
        $e = explode("_",$f);
	$e2 = explode(".",$e[2]);
	$t = substr($e[1],0,4)."-".substr($e[1],4,2)."-".substr($e[1],6,2)." ".substr($e[1],9,2).":".substr($e[1],11,2).":".substr($e[1],13,2)." UTC";
       	$fTime = strtotime($t);
	if($inTime >= $fTime && ($inTime - $fTime) < 10800){
		if(in_array(sprintf('%07d',$e2[0]),$allowKeys) && in_array($fTime,$allowIDs[sprintf('%07d',$e2[0])])){
			// user has allowed and blocked on same scan, check file mod times
			$modBlock = filemtime($blockPath."/".$f);
			$modAllow = filemtime($allowPath."/".$f);
			if($modBlock > $modAllow){
				// block is newest, delete from allow, add to block
				$idx = array_search($fTime,$allowIDs[sprintf('%07d',$e2[0])]);
				unset($allowIDs[sprintf('%07d',$e2[0])][$idx]);
				$blockIDs[sprintf('%07d',$e2[0])][] = $fTime;
			}
			else{
				// allow is newest, continue
				continue;
			}
		}
		elseif(in_array(sprintf('%07d',$e2[0]),$allowKeys)){
			// compare insertion times
                       	$modAllow = max($allowIDs[sprintf('%07d',$e2[0])]);
                       	$modBlock = $fTime;
			if($modBlock > $modAllow){
                                // block is newest, delete from allow, add to block
                               	$idx = array_search($modAllow,$allowIDs[sprintf('%07d',$e2[0])]);
                               	unset($allowIDs[sprintf('%07d',$e2[0])][$idx]);
                               	$blockIDs[sprintf('%07d',$e2[0])][] = $fTime;
                        }
                        else{
                       	        // allow is newest, continue
                               	continue;
                       	}
		}
		else{
	               	$blockIDs[sprintf('%07d',$e2[0])][] = $fTime;
		}
        }
}

//print_r($blockIDs);
//die();

// get valid prob range for user(s) within last 3 hour window
$files = array_diff(scandir($validPath), array('..', '.'));
$valid = array();
foreach($files as $f){
	$e = explode("_",$f);
	$e3 = explode("-",$e[0]);
	if($e3[1] == $type){
		$log = $validPath."/".$f;
		$data = file($log);
		$e2 = explode(",",trim($data[0]));
		$t = substr($e[1],0,4)."-".substr($e[1],4,2)."-".substr($e[1],6,2)." ".substr($e[1],9,2).":".substr($e[1],11,2).":".substr($e[1],13,2)." UTC";
		$fTime = strtotime($t);
		if(($inTime - $fTime) > 10800){
			continue;
		}
		$validMin = $e2[0];
		$validMax = $e2[1];
		$autoSpd = intval($e2[2]);
		$autoDir = intval($e2[3]);
		$valid[$fTime]["min"] = $validMin;
		$valid[$fTime]["max"] = $validMax;
		$valid[$fTime]["spd"] = $autoSpd;
                $valid[$fTime]["dir"] = $autoDir;
	}
}
if(empty($valid)){
	$valid[0]["min"] = 0;
	$valid[0]["max"] = 100;
	$valid[0]["spd"] = -1;
	$valid[0]["dir"] = -1;
}
krsort($valid);

// get object pairs
//$data = file($objPairs);
//$objectPairs = json_decode(trim($data[0]), true);
//$pairKeys = array_keys($objectPairs);

// get all manually-generated objects valid for input time
$humanObjects = array();
$modifiedObjects = array();
$scaleObjects = array();
$files = array_diff(scandir($manualObjectsPath), array('..', '.'));
foreach($files as $f){
	// Tornado1_ID0_Karstens.txt
	// Karstens-severe_20150418-145937_000002.json
	$s = explode("_",$f);
	$s2 = explode("-",$s[0]);
	$user = $s2[0];
	if(substr($s2[0],0,3) == "ewp"){
	        $user = "ewp";
	}
	if($s2[1] != $type){
		continue; // ignore other hazards
	}
	elseif($analysis && $user != $fcstr){
		continue; // ignore forecasts from other users
	}
	$id = substr($s[2],0,7);
       	$uName = $s2[0];
	$geojsons = array_reverse(file($manualObjectsPath."/".$f));
	$autoEnd = 999999999999999;
        foreach($geojsons as $line){
                $geojson = json_decode(trim($line));
		if($geojson->properties->data->automated == 0){
			if($geojson->properties->data->valid_start > $inTime){
				continue; // object is from the future, look for next oldest file
			}
			elseif($geojson->properties->data->valid_end < $inTime){
				break; // latest object has expired
			}
			$humanObjects[sprintf('%07d',$id)] = $geojson;
			$json["features"][] = $geojson; // purely human generated, just add and continue
		}
		elseif($geojson->properties->data->automated == 2){
			if($geojson->properties->data->valid_start > $inTime || $inTime >= $autoEnd){
                                continue; // object is from the future, look for next oldest file
                        }
			$geojson->properties->data->user = $uName;
			$modifiedObjects[sprintf('%07d',$id)] = $geojson; // add object to modified list and continue to next file
			if(sprintf('%07d',$geojson->properties->data->id) != sprintf('%07d',$geojson->properties->data->Scale)){
				$scaleObjects[sprintf('%07d',$geojson->properties->data->id)] = sprintf('%07d',$geojson->properties->data->Scale);
			}
		}
		elseif($geojson->properties->data->automated == 1){
			$autoEnd = $geojson->properties->data->valid_start;
			continue;
		}
		break;
	}
}

//print_r($scaleObjects);
//die();

$keys = array_keys($modifiedObjects);
$usedKeys = array();
$autoKeys = array();
$humanKeys = array_keys($humanObjects);
$validKeys = array_keys($valid);
$allowKeys = array_keys($allowIDs);
$blockKeys = array_keys($blockIDs);

// loop through automated objects
$autoObjects = array_reverse(array_diff(scandir($autoObjectsPath), array('..', '.')));
foreach($autoObjects as $f){
	$s = explode("_",$f);
	$ft = substr($s[1],0,4)."-".substr($s[1],4,2)."-".substr($s[1],6,2)." ".substr($s[1],9,2).":".substr($s[1],11,2).":".substr($s[1],13,2)." UTC";
	$fileTime = strtotime($ft);

	if($fileTime > $inTime){
		continue; // if file time is greater than input time, ignore the objects (in the the future)
	}
	//elseif(@$s[3] == "scale0.json"){
	//	continue; // scale 0 object from lightning, ignore
	//}

	$geojsons = array_reverse(file($autoObjectsPath."/".$f));
	foreach($geojsons as $line){
		$geojson = json_decode(trim($line));
		$id = sprintf('%07d',$geojson->properties->data->RowName);
		if($geojson->properties->data->valid_start > $inTime){
			continue; // object is from the future, look for next oldest file
		}
		elseif($geojson->properties->data->valid_end < $inTime){
                        break; // latest object has expired
                }
		elseif(in_array(sprintf('%07d',$id),$humanKeys)){
			break; // object has been taken over by human
		}
		if(!in_array($id,$autoKeys)){
                        $autoKeys[] = $id;
                }
		if(in_array($id,$keys)){
			$usedKeys[] = $id;
			if(in_array($id,$blockKeys) && $modifiedObjects[sprintf('%07d',$id)]->properties->data->valid_start < $blockIDs[sprintf('%07d',$id)][0]){
                               	$geojson->properties->data->allow = 0;
                               	$json["features"][] = $geojson;
                                break;
                        }
			// first override speed and/or direction, if applicable
			foreach($validKeys as $fTime){
                                if($geojson->properties->data->valid_start > $fTime){
					if($valid[$fTime]["spd"] >= 0){
                                                $newSpds = array();
                                                for($j=0;$j<count($geojson->properties->data->speeds);$j++){
                                                        $newSpds[] = $valid[$fTime]["spd"];
                                                }
                                                $geojson->properties->data->speeds = $newSpds;
                                                //$geojson->properties->data->Speed = $valid[$fTime]["spd"];
                                               	$geojson->properties->data->automated = 3;
                                                $geojson->properties->data->modified->speed = 1;
                                        }
                                        if($valid[$fTime]["dir"] >= 0){
                                                $newDirs = array();
                                                for($j=0;$j<count($geojson->properties->data->dirs);$j++){
                                                        $newDirs[] = $valid[$fTime]["dir"];
                                               	}
                                               	$geojson->properties->data->dirs = $newDirs;
                                               	$geojson->properties->data->dirs_orig = $newDirs;
                                       	        //$geojson->properties->data->Direction = $valid[$fTime]["dir"];
                                               	$geojson->properties->data->automated = 3;
                                                $geojson->properties->data->modified->direction = 1;
                                        }
					break;
				}
			}
			// perform numerous checks to figure out what the forecasters modified
			if($modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->direction == 1){
				$geojson->properties->data->dirs = $modifiedObjects[sprintf('%07d',$id)]->properties->data->dirs;
				$geojson->properties->data->dirs_orig = $modifiedObjects[sprintf('%07d',$id)]->properties->data->dirs_orig;
				$geojson->properties->data->Direction = $modifiedObjects[sprintf('%07d',$id)]->properties->data->dirs[0];
				$geojson->properties->data->automated = 2;
			}
			if($modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->speed == 1){
				$geojson->properties->data->speeds = $modifiedObjects[sprintf('%07d',$id)]->properties->data->speeds;
				$geojson->properties->data->Speed = $modifiedObjects[sprintf('%07d',$id)]->properties->data->speeds[0];
				$geojson->properties->data->automated = 2;
                        }
			if($modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->duration == 1){
				$geojson->properties->data->duration = $modifiedObjects[sprintf('%07d',$id)]->properties->data->duration;
				$geojson->properties->data->automated = 2;
                        }
			if($modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->prediction == 1){
                                $geojson->properties->data->prediction = $modifiedObjects[sprintf('%07d',$id)]->properties->data->prediction;
                               	$geojson->properties->data->automated = 2;
                        }
			if($modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->probs == 1){
				$geojson->properties->data->probs[0] = $modifiedObjects[sprintf('%07d',$id)]->properties->data->probs[0];
				if($geojson->properties->data->prediction == "explicit"){
					if(isset($modifiedObjects[sprintf('%07d',$id)]->properties->data->prob_start)){
						$geojson->properties->data->prob_start = $modifiedObjects[sprintf('%07d',$id)]->properties->data->prob_start;
					}
					else{
						$geojson->properties->data->prob_start = $modifiedObjects[sprintf('%07d',$id)]->properties->data->valid_start;
					}
				}
				$geojson->properties->data->automated = 2;
                        }
			if($modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->discussion == 1){
				$geojson->properties->data->discussion = $modifiedObjects[sprintf('%07d',$id)]->properties->data->discussion;
				$geojson->properties->data->automated = 2;
                        }
			if($modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->object == 1){
				$geojson->geometry = $modifiedObjects[sprintf('%07d',$id)]->geometry;
				$geojson->properties->data->automated = 0;
                        }
			else{
				// object shape/position adjustments only apply to automated objects
				if(@$modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->objShape == 1){
	                               	$geojson->properties->data->buffer = $modifiedObjects[sprintf('%07d',$id)]->properties->data->buffer;
	                                $geojson->properties->data->bufDir = $modifiedObjects[sprintf('%07d',$id)]->properties->data->bufDir;
	                                $geojson->properties->data->automated = 2;
	                        }
	                        if(@$modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->objPosition == 1){
	                                $geojson->properties->data->objOffsetX = $modifiedObjects[sprintf('%07d',$id)]->properties->data->objOffsetX;
	                                $geojson->properties->data->objOffsetY = $modifiedObjects[sprintf('%07d',$id)]->properties->data->objOffsetY;
	                               	$geojson->properties->data->automated = 2;
	                        }
			}
			if($modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->alertLevel == 1){
                                $geojson->properties->data->elements->alertLevel = $modifiedObjects[sprintf('%07d',$id)]->properties->data->elements->alertLevel;
                                $geojson->properties->data->automated = 2;
                        }
			if($modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->severity == 1){
                                $geojson->properties->data->elements->severity = $modifiedObjects[sprintf('%07d',$id)]->properties->data->elements->severity;
                                $geojson->properties->data->automated = 2;
                        }
			if($modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->warningType == 1){
                                $geojson->properties->data->elements->warningType = $modifiedObjects[sprintf('%07d',$id)]->properties->data->elements->warningType;
                                $geojson->properties->data->automated = 2;
                        }
			if($modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->warningThresh == 1){
                                $geojson->properties->data->elements->warningThresh = $modifiedObjects[sprintf('%07d',$id)]->properties->data->elements->warningThresh;
                                $geojson->properties->data->automated = 2;
                        }
			if($modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->confidence == 1){
                                $geojson->properties->data->elements->confidence = $modifiedObjects[sprintf('%07d',$id)]->properties->data->elements->confidence;
                                $geojson->properties->data->automated = 2;
                        }
			if($modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->source == 1){
                                $geojson->properties->data->elements->source = $modifiedObjects[sprintf('%07d',$id)]->properties->data->elements->source;
                                $geojson->properties->data->automated = 2;
                        }

			$geojson->properties->data->allow = 1;
			$geojson->properties->data->user = $modifiedObjects[sprintf('%07d',$id)]->properties->data->user;
			$geojson->properties->data->modified = $modifiedObjects[sprintf('%07d',$id)]->properties->data->modified;
			if($automated >= 1 || $automated == 0 && $geojson->properties->data->automated == 0){
				$json["features"][] = $geojson; // add object to list and continue to next file
			}
                        break;
		}
		else{
			$usedKeys[] = $id;
			$geojson->properties->data->allow = 1;
			foreach($validKeys as $fTime){
				// apply to objects
				if($geojson->properties->data->valid_start > $fTime){
					if($geojson->properties->data->probs[0][0] < $valid[$fTime]["min"] || $geojson->properties->data->probs[0][0] > $valid[$fTime]["max"]){
						$geojson->properties->data->allow = 0;
						if(in_array($id,$allowKeys)){
							$geojson->properties->data->automated = 2;
							if(in_array($id,$blockKeys) && $blockIDs[sprintf('%07d',$id)][0] > $allowIDs[sprintf('%07d',$id)][0]){
								break;
							}
							for($i=0;$i<count($allowIDs[sprintf('%07d',$id)]);$i++){
								if($geojson->properties->data->valid_start >= $allowIDs[sprintf('%07d',$id)][$i]){
									$geojson->properties->data->allow = 1;
									break;
								}
							}
						}
					}
					elseif(in_array($id,$blockKeys)){
						$geojson->properties->data->automated = 2;
						if(in_array($id,$allowKeys) && $allowIDs[sprintf('%07d',$id)][0] > $blockIDs[sprintf('%07d',$id)][0]){
							break;
						}
						for($i=0;$i<count($blockIDs[sprintf('%07d',$id)]);$i++){
							if($geojson->properties->data->valid_start >= $blockIDs[sprintf('%07d',$id)][$i]){
								$geojson->properties->data->allow = 0;
								break;
							}
						}
					}
					if($valid[$fTime]["spd"] >= 0){
						$newSpds = array();
                                               	for($j=0;$j<count($geojson->properties->data->speeds);$j++){
                                                        $newSpds[] = $valid[$fTime]["spd"];
                                                }
						$geojson->properties->data->speeds = $newSpds;
						//$geojson->properties->data->Speed = $valid[$fTime]["spd"];
						$geojson->properties->data->automated = 3;
						$geojson->properties->data->modified->speed = 1;
					}
					if($valid[$fTime]["dir"] >= 0){
						$newDirs = array();
						for($j=0;$j<count($geojson->properties->data->dirs);$j++){
							$newDirs[] = $valid[$fTime]["dir"];
						}
						$geojson->properties->data->dirs = $newDirs;
						$geojson->properties->data->dirs_orig = $newDirs;
						//$geojson->properties->data->Direction = $valid[$fTime]["dir"];
						$geojson->properties->data->automated = 3;
						$geojson->properties->data->modified->direction = 1;
					}
					break;
				}
			}
			if($automated == 1 || $automated == 0 && $geojson->properties->data->automated == 0){
				if($block == 0 && $geojson->properties->data->allow == 0){
					break;
				}
				$json["features"][] = $geojson; // add object to list and continue to next file
			}
			break;
		}
	}
}

// last check to add back in any modified objects that the automation dropped
$scaleKeys = array_keys($scaleObjects);
$pl = new pointLocation;
foreach($keys as $modID){
	if(!in_array($modID,$usedKeys)){
		// check if object has been linked to another...
		$found = false;
		foreach($scaleKeys as $key){
			if($modID == $scaleObjects[$key]){
				$found = true;
				break;
			}
		}
		if($found){
			continue;
		}

		// snag auto object file
		$found = false;
		$poly = array();
		$yMaxObj = 0;
                $yMinObj = 9999;
                $xMaxObj = -9999;
                $xMinObj = 0;
		$autoObjects = array_reverse(array_diff(scandir($autoObjectsPath), array('..', '.')));
		foreach($autoObjects as $f){
			// Karstens-severe_20150418-145937_000002.json
			$s = explode("_",$f);
			$s2 = explode(".",$s[2]);
			if(sprintf('%07d',$s2[0]) == $modID){
				$modFile = $f;
				$found = true;
				break;
			}
		}
		if(!$found){
			continue; // not sure if this would ever happen...
		}

		// snag most recent auto object shape and get object bounds
		$geojsons = array_reverse(file($autoObjectsPath."/".$modFile));
		$geojson = json_decode(trim($geojsons[0]));

		if(in_array($modID,$blockKeys) && $modifiedObjects[sprintf('%07d',$modID)]->properties->data->valid_start < $blockIDs[sprintf('%07d',$modID)][0]){
			// object was taken over by human, but then blocked, so add back to output but show as blocked if automation is still tracking it, otherwise, just move on
			if(in_array($modID,$autoKeys)){
                        	$geojson->properties->data->allow = 0;
                       		$json["features"][] = $geojson;
                       	}
			continue;
               	}

                foreach($geojson->geometry->coordinates[0] as $coord){
                        $poly[] = $coord[0]." ".$coord[1];
			if($coord[0] < $xMinObj){
                                $xMinObj = $coord[0];
                        }
                        if($coord[0] > $xMaxObj){
                               	$xMaxObj = $coord[0];
                       	}
                       	if($coord[1] < $yMinObj){
                                $yMinObj = $coord[1];
                       	}
                        if($coord[1] > $yMaxObj){
                                $yMaxObj = $coord[1];
                       	}
                }

		// first override speed and/or direction, if applicable
                foreach($validKeys as $fTime){
                       	if($geojson->properties->data->valid_start > $fTime){
                               	if($valid[$fTime]["spd"] >= 0){
                                        $newSpds = array();
                                       	for($j=0;$j<count($geojson->properties->data->speeds);$j++){
                                               	$newSpds[] = $valid[$fTime]["spd"];
                                       	}
                                       	$geojson->properties->data->speeds = $newSpds;
                                        //$geojson->properties->data->Speed = $valid[$fTime]["spd"];
                                       	$geojson->properties->data->automated = 3;
                                       	$geojson->properties->data->modified->speed = 1;
                                }
                               	if($valid[$fTime]["dir"] >= 0){
                                        $newDirs = array();
                                       	for($j=0;$j<count($geojson->properties->data->dirs);$j++){
                                               	$newDirs[] = $valid[$fTime]["dir"];
                                        }
                                       	$geojson->properties->data->dirs = $newDirs;
                                        $geojson->properties->data->dirs_orig = $newDirs;
                                        //$geojson->properties->data->Direction = $valid[$fTime]["dir"];
                                        $geojson->properties->data->automated = 3;
                                       	$geojson->properties->data->modified->direction = 1;
                                }
                                break;
                       	}
                }

		// override object attributes
		if(array_key_exists("buffer",$modifiedObjects[$modID]->properties->data) && $modifiedObjects[$modID]->properties->data->modified->objShape == 1){
			$geojson->properties->data->buffer = $modifiedObjects[$modID]->properties->data->buffer;
			$geojson->properties->data->bufDir = $modifiedObjects[$modID]->properties->data->bufDir;
			$geojson->properties->data->modified->objShape = 1;
		}
		if(array_key_exists("objOffsetX",$modifiedObjects[$modID]->properties->data) && $modifiedObjects[$modID]->properties->data->modified->objPosition == 1){
			$geojson->properties->data->objOffsetX = $modifiedObjects[$modID]->properties->data->objOffsetX;
			$geojson->properties->data->objOffsetY = $modifiedObjects[$modID]->properties->data->objOffsetY;
			$geojson->properties->data->modified->objPosition = 1;
		}
		if($modifiedObjects[$modID]->properties->data->modified->direction == 1){
                        $geojson->properties->data->dirs = $modifiedObjects[$modID]->properties->data->dirs;
                        $geojson->properties->data->dirs_orig = $modifiedObjects[$modID]->properties->data->dirs_orig;
                        $geojson->properties->data->Direction = $modifiedObjects[$modID]->properties->data->dirs[0];
                        $geojson->properties->data->automated = 2;
                }
                if($modifiedObjects[$modID]->properties->data->modified->speed == 1){
                        $geojson->properties->data->speeds = $modifiedObjects[$modID]->properties->data->speeds;
                        $geojson->properties->data->Speed = $modifiedObjects[$modID]->properties->data->speeds[0];
                        $geojson->properties->data->automated = 2;
                }
                if($modifiedObjects[$modID]->properties->data->modified->duration == 1){
                        $geojson->properties->data->duration = $modifiedObjects[$modID]->properties->data->duration;
                        $geojson->properties->data->automated = 2;
                }
		if($modifiedObjects[$modID]->properties->data->modified->prediction == 1){
                        $geojson->properties->data->prediction = $modifiedObjects[$modID]->properties->data->prediction;
                        $geojson->properties->data->automated = 2;
                }
                if($modifiedObjects[$modID]->properties->data->modified->probs == 1){
                        $geojson->properties->data->probs[0] = $modifiedObjects[$modID]->properties->data->probs[0];
			if($geojson->properties->data->prediction == "explicit"){
				if(isset($modifiedObjects[$modID]->properties->data->prob_start)){
                                       	$geojson->properties->data->prob_start = $modifiedObjects[$modID]->properties->data->prob_start;
                                }
                                else{
                                        $geojson->properties->data->prob_start = $modifiedObjects[$modID]->properties->data->valid_start;
                                }
                        }
                        $geojson->properties->data->automated = 2;
                }
                if($modifiedObjects[$modID]->properties->data->modified->discussion == 1){
                        $geojson->properties->data->discussion = $modifiedObjects[$modID]->properties->data->discussion;
                        $geojson->properties->data->automated = 2;
                }
                if($modifiedObjects[$modID]->properties->data->modified->object == 1){
                        $geojson->geometry = $modifiedObjects[$modID]->geometry;
                        $geojson->properties->data->automated = 0;
                }
		else{
			if($modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->objShape == 1){
	                        $geojson->properties->data->buffer = $modifiedObjects[sprintf('%07d',$id)]->properties->data->buffer;
	                       	$geojson->properties->data->bufDir = $modifiedObjects[sprintf('%07d',$id)]->properties->data->bufDir;
	                        $geojson->properties->data->automated = 2;
	                }
	                if($modifiedObjects[sprintf('%07d',$id)]->properties->data->modified->objPosition == 1){
	                        $geojson->properties->data->objOffsetX = $modifiedObjects[sprintf('%07d',$id)]->properties->data->objOffsetX;
	                        $geojson->properties->data->objOffsetY = $modifiedObjects[sprintf('%07d',$id)]->properties->data->objOffsetY;
	                        $geojson->properties->data->automated = 2;
	                }
		}
                if($modifiedObjects[$modID]->properties->data->modified->alertLevel == 1){
                        $geojson->properties->data->elements->alertLevel = $modifiedObjects[$modID]->properties->data->elements->alertLevel;
                        $geojson->properties->data->automated = 2;
                }
                if($modifiedObjects[$modID]->properties->data->modified->severity == 1){
                        $geojson->properties->data->elements->severity = $modifiedObjects[$modID]->properties->data->elements->severity;
                        $geojson->properties->data->automated = 2;
                }
                if($modifiedObjects[$modID]->properties->data->modified->warningType == 1){
                        $geojson->properties->data->elements->warningType = $modifiedObjects[$modID]->properties->data->elements->warningType;
                        $geojson->properties->data->automated = 2;
                }
                if($modifiedObjects[$modID]->properties->data->modified->warningThresh == 1){
                        $geojson->properties->data->elements->warningThresh = $modifiedObjects[$modID]->properties->data->elements->warningThresh;
                        $geojson->properties->data->automated = 2;
                }
                if($modifiedObjects[$modID]->properties->data->modified->confidence == 1){
                        $geojson->properties->data->elements->confidence = $modifiedObjects[$modID]->properties->data->elements->confidence;
                        $geojson->properties->data->automated = 2;
                }
                if($modifiedObjects[$modID]->properties->data->modified->source == 1){
                        $geojson->properties->data->elements->source = $modifiedObjects[$modID]->properties->data->elements->source;
                        $geojson->properties->data->automated = 2;
                }

		//$geojson->properties->data->valid_end = $modifiedObjects[$modID]->properties->data->valid_end;
		$geojson->properties->data->valid_end = $geojson->properties->data->valid_start + (60 * $modifiedObjects[$modID]->properties->data->duration);
		//$geojson->properties->data->valid_start = $modifiedObjects[$modID]->properties->data->valid_start;
                $geojson->properties->data->allow = 1;
                $geojson->properties->data->user = $modifiedObjects[$modID]->properties->data->user;
                $geojson->properties->data->modified = $modifiedObjects[$modID]->properties->data->modified;

		// time check
		if($geojson->properties->data->valid_start > $inTime){
                        continue; // object is from the future, look for next oldest file
                }
                elseif($geojson->properties->data->valid_end < $inTime){
                        continue; // latest object has expired
                }
                elseif(in_array($modID,$humanKeys)){
                        continue; // object has been taken over by human
               	}

                if($automated >= 1 || $automated == 0 && $geojson->properties->data->automated == 0){
			// good, keep going
                }
		else{
			continue;
		}

		// figure out which (if any) new objects overlap with the most recent auto object shape, and block them
		foreach($json["features"] as $feat){
			if($feat->properties->data->allow != 1){
				continue; // object is already blocked, ignore
			}
			elseif($feat->properties->data->automated != 1){
				continue; // object is previously overriden or manual
			}

			// get object bounds
			$yMax = 0;
			$yMin = 9999;
			$xMax = -9999;
			$xMin = 0;
			foreach($feat->geometry->coordinates[0] as $coord){
				if($coord[0] < $xMin){
					$xMin = $coord[0];
				}
				if($coord[0] > $xMax){
                                       	$xMax = $coord[0];
                               	}
				if($coord[1] < $yMin){
                                       	$yMin = $coord[1];
                               	}
				if($coord[1] > $yMax){
                                       	$yMax = $coord[1];
                               	}
			}

			// test for potential overlap
			$overlap = false;
			if($yMin >= $yMinObj && $yMin <= $yMaxObj){
				if($xMin >= $xMinObj && $xMin <= $xMaxObj){
					$overlap = true;
				}
				elseif($xMax >= $xMinObj && $xMax <= $xMaxObj){
                                       	$overlap = true;
                               	}
				elseif($xMinObj >= $xMin && $xMinObj <= $xMax){
                                        $overlap = true;
                               	}
                               	elseif($xMaxObj >= $xMin && $xMaxObj <= $xMax){
                                        $overlap = true;
                                }
			}
			elseif($xMin >= $xMinObj && $xMin <= $xMaxObj){
                               	if($yMin >= $yMinObj && $yMin <= $yMaxObj){
                                       	$overlap = true;
                               	}
                               	elseif($yMax >= $yMinObj && $yMax <= $yMaxObj){
                                        $overlap = true;
                                }
				elseif($yMinObj >= $yMin && $yMinObj <= $yMax){
                                        $overlap = true;
                               	}
                                elseif($yMaxObj >= $yMin && $yMaxObj <= $yMax){
                                        $overlap = true;
                                }
                       	}
			elseif($yMinObj >= $yMin && $yMinObj <= $yMax){
                                if($xMinObj >= $xMin && $xMinObj <= $xMax){
                                        $overlap = true;
                                }
                                elseif($xMaxObj >= $xMin && $xMaxObj <= $xMax){
                                        $overlap = true;
                                }
				elseif($xMin >= $xMinObj && $xMin <= $xMaxObj){
                                       	$overlap = true;
                               	}
                                elseif($xMax >= $xMinObj && $xMax <= $xMaxObj){
                                       	$overlap = true;
                               	}
                        }
                        elseif($xMinObj >= $xMin && $xMinObj <= $xMax){
                                if($yMinObj >= $yMin && $yMinObj <= $yMax){
                                        $overlap = true;
                                }
                                elseif($yMaxObj >= $yMin && $yMaxObj <= $yMax){
                                        $overlap = true;
                                }
				elseif($yMin >= $yMinObj && $yMin <= $yMaxObj){
                                        $overlap = true;
                                }
                               	elseif($yMax >= $yMinObj && $yMax <= $yMaxObj){
                                        $overlap = true;
                                }
                        }
			elseif($xMinObj >= $xMin && $xMinObj <= $xMax && $yMinObj >= $yMin && $yMinObj <= $yMax){
				$overlap = true; // new object completely surrounds original object
			}

			if(!$overlap){
				continue; // object does not remotely overlap with latest auto shape
			}

			// objects' bounds overlap, now test if a vertex from object is inside latest auto shape, and block
			foreach($feat->geometry->coordinates[0] as $coord){
				$pnt = $coord[0]." ".$coord[1];
				if($pl->pointInPolygon($pnt, $poly) == 1){
					$feat->properties->data->allow = 0;
					break;
				}
			}
		}

		// regardless, add the object back in to the list
		// change color and add a time out
		$geojson->properties->threatColor = "rgb(0,255,255)";
		$geojson->properties->data->threatColor = "rgb(0,255,255)";
		//$geojson->properties->threatColor = "rgb(0,0,0)";
                //$geojson->properties->data->threatColor = "rgb(0,0,0)";
		$json["features"][] = $geojson;
	}
}

if($block == 0){
        $json2 = array();
        $json2["type"] = "FeatureCollection";
        $json2["features"] = array();

        foreach($json["features"] as $feat){
                if($feat->properties->data->allow == 0){
                        continue;
                }
                $json2["features"][] = $feat;
        }

	$out = json_encode($json2);
}
else{
     	$out = json_encode($json);
}

echo $out."\n";

?>
