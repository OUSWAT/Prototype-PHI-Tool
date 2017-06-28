<?php

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

// init vars
date_default_timezone_set('UTC');
$objID = isset($_GET["objID"]) ? $_GET["objID"] : "539083";
$now = isset($_GET["now"]) ? $_GET["now"] : "1495573741";
$type = isset($_GET["type"]) ? $_GET["type"] : "probSevere";
$archive = isset($_GET["archive"]) ? $_GET["archive"] : "0";
$site = isset($_GET["site"]) ? $_GET["site"] : "KABR";
$key = isset($_GET["key"]) ? $_GET["key"] : "probability";
$key = isset($_GET["key"]) ? $_GET["key"] : "probability";
$analysis = isset($_GET["analysis"]) ? $_GET["analysis"] : "false";
$probSevereKeys = array("cape","shear","mesh","growth","glaciation","flashRate","lightningJump","besttrack","abh","flashDensity","lr75","mWind79","maxllaz","mlcape","mlcin","p98llaz","p98mlaz","probHail","probWind","probTor","rh7045","srh01km","vilDensity","wb0");
$azShearKeys = array("3-6kmAGL");
$lightningKeys = array("totalLightning","nldnCG_count","eniIC_count");

$nowCheck = $now;
if($analysis == "true"){
	$nowCheck = 9999999999;
}
$times = array();
// special code for Amy's classification probs
if($key == "qlcs" || $key == "supercell" || $key == "disorganized" || $key == "linear" || $key == "marginal"){
	// "qlcs": 0.6118827674153346, "supercell": 0.00011013657310659348, "disorganized": 0.3808790044649186, "linear hybrid": 0.004965426364546856, "marginal supercell": 0.0021626651820933996

	$prev = 0;
	if($archive != 0){
                $path = "../../archive/".$archive."/".$site."/probSevereObjects/classification";
        }
	else{
	        // severe_wind_2016-04-28-211639.csv
                $path = "floater/probSevereObjects/classification";
        }
	$files = array_diff(scandir($path), array('..', '.'));
        rsort($files);
        $first = true;
        foreach($files as $f){
		$found = false;
		// predictions_20170519_1600.json
                $e = explode("_",$f);
                $fTime = strtotime(substr($e[1],0,4)."-".substr($e[1],4,2)."-".substr($e[1],6,2)." ".substr($e[2],0,2).":".substr($e[2],2,2).":00 UTC");
                if($archive != 0 && $fTime > $nowCheck){
                        continue;
                }
                $relTime = ($fTime - $now) / 60;
                $lines = file($path."/".$f);
		$geojson = json_decode(trim($lines[0]), true);
		$keys1 = array_keys($geojson);
		foreach($keys1 as $key1){
			if($key1 == $objID){
				$found = true;
				if($geojson[$key1] == "unknown"){
					$data[] = $prev;
                                       	$times[] = $relTime;
					break;
				}
				if($key == "linear"){
					$key2 = "linear hybrid";
				}
				elseif($key == "marginal"){
					$key2 = "marginal supercell";
				}
				else{
					$key2 = $key;
				}
				$data[] = $geojson[$key1][$key2] * 100;
                               	$times[] = $relTime;
				$prev = $geojson[$key1][$key2] * 100;
				break;
			}
		}
		if(!$found && $archive == 0){
                        break;
                }
	}
	if(empty($times)){
                echo "|";
        }
        else{
                $times = array_reverse($times);
                $data = array_reverse($data);
                echo implode(",",$times)."|".implode(",",$data);
        }
        die();
}

// special code for Ryan's wind probs
if($key == 'wind1' || $key == 'wind2' || $key == 'wind3'){
	if($archive != 0){
		$path = "../../archive/".$archive."/".$site."/probSevereObjects/wind";
	}
	else{
		// severe_wind_2016-04-28-211639.csv
		$path = "floater/probSevereObjects/wind";
	}
	$files = array_diff(scandir($path), array('..', '.'));
	rsort($files);
	$first = true;
	foreach($files as $f){
		$found = false;
	        $e = explode("_",$f);
	        $e2 = explode("-",$e[2]);
		$fTime = strtotime($e2[0]."-".$e2[1]."-".$e2[2]." ".substr($e2[3],0,2).":".substr($e2[3],2,2).":".substr($e2[3],4,2)." UTC");
		if($archive != 0 && $fTime > $nowCheck){
			continue;
		}
		$relTime = ($fTime - $now) / 60;
		$lines = file($path."/".$f);
		foreach($lines as $line){
			$d = explode(",",trim($line));
		        if($d[0] == $objID){
				if($key == 'wind1'){
					if($first){
						$data = array($d[5]*100,$d[5]*100,$d[4]*100,$d[4]*100,$d[3]*100,$d[3]*100,$d[2]*100,$d[2]*100,$d[1]*100,$d[1]*100);
						$times = array($relTime + 90,$relTime + 60,$relTime + 60,$relTime + 45,$relTime + 45,$relTime + 30,$relTime + 30,$relTime + 15,$relTime + 15,$relTime);
						$first = false;
					}
					else{
						$data[] = $d[1]*100;
						$times[] = $relTime;
					}
				}
				elseif($key == 'wind2'){
					if($first){
                                                $data = array($d[10]*100,$d[10]*100,$d[9]*100,$d[9]*100,$d[8]*100,$d[8]*100,$d[7]*100,$d[7]*100,$d[6]*100,$d[6]*100);
						$times = array($relTime + 90,$relTime + 60,$relTime + 60,$relTime + 45,$relTime + 45,$relTime + 30,$relTime + 30,$relTime + 15,$relTime + 15,$relTime);
                                                $first = false;
                                        }
                                        else{
                                                $data[] = $d[6]*100;
                                                $times[] = $relTime;
                                        }
				}
				elseif($key == 'wind3'){
					if($first){
                                                $data = array($d[15]*100,$d[15]*100,$d[14]*100,$d[14]*100,$d[13]*100,$d[13]*100,$d[12]*100,$d[12]*100,$d[11]*100,$d[11]*100);
						$times = array($relTime + 90,$relTime + 60,$relTime + 60,$relTime + 45,$relTime + 45,$relTime + 30,$relTime + 30,$relTime + 15,$relTime + 15,$relTime);
                                                $first = false;
                                        }
                                        else{
                                                $data[] = $d[11]*100;
                                                $times[] = $relTime;
                                        }
				}
				$found = true;
				break;
		        }
		}
		if(!$found && $archive == 0){
			break;
		}
	}
	if(empty($times)){
	        echo "|";
	}
	else{
		$times = array_reverse($times);
		$data = array_reverse($data);
	        echo implode(",",$times)."|".implode(",",$data);
	}
	die();
}

// determine path to object files
if($archive == 0){
	if($type == "probSevere"){
		$path = "floater/probSevereObjects/objects";
	}
	elseif($type == "azShear"){
		$path = "floater/azShearObjects/objects";
	}
	elseif($type == "lightning"){
                $path = "floater/lightningObjects/objects";
        }
	else{
		$path = "threats";
	}
}
else{
	if($type == "probSevere"){
		$path = "../../archive/".$archive."/".$site."/probSevereObjects/objects";
	}
	elseif($type == "azShear"){
		$path = "../../archive/".$archive."/".$site."/azShearObjects/objects";
        }
	elseif($type == "lightning"){
                $path = "../../archive/".$archive."/".$site."/lightningObjects/objects";
        }
	else{
             	$path = "../../threats/".$archive;
        }
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

// extract attributes
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
	if($geojson["properties"]["data"]["valid_start"] <= $nowCheck){
		$times[] = ($geojson["properties"]["data"]["valid_start"] - $now) / 60;
		if($type == "probSevere" && in_array($key,$probSevereKeys)){
			$e = explode(" ",$geojson["properties"]["data"]["ProbSevere"][$key]);
			if($key == "mesh" && !empty($e[1])){
				$data[] = $e[1];
			}
			elseif($key == "mesh"){
				$data[] = $e[0];
			}
			elseif($key == "growth"){
				$e2 = explode("%",@$e[1]);
				$data[] = @$e2[0];
			}
			elseif($key == "glaciation"){
				$e2 = explode("/",@$e[1]);
                                $data[] = @$e2[0];
			}
			elseif($key == "abh"){
				$data[] = @$e[3];
			}
			else{
				$data[] = $e[0];
			}
		}
		elseif($type == "lightning" && in_array($key,$lightningKeys)){
			$e = explode(" ",$geojson["properties"]["data"]["Lightning"][$key]);
			$data[] = $e[0];
		}
		elseif($type == "azShear" && in_array($key,$azShearKeys)){
			//$e = explode(" ",$geojson["properties"]["data"]["AzShear"][$key]);
			//$data[] = $e[0];
			$data[] = $geojson["properties"]["data"]["AzShear"][$key];
		}
		elseif($key == 'probability'){
			$data[] = $geojson["properties"]["data"]["probs"][0][0];
			if($c == $lineCount && $nowCheck < 9999999999){
				for($i=1;$i<count($geojson["properties"]["data"]["probs"][0]);$i++){
					$data[] = $geojson["properties"]["data"]["probs"][0][$i];
					$times[] = (($geojson["properties"]["data"]["valid_start"] - $now) / 60) + ($i * 5);
					if(((($geojson["properties"]["data"]["valid_start"] - $now) / 60) + ($i * 5)) >= $geojson["properties"]["data"]["duration"]){
						break;
					}
				}
			}
		}
		elseif($key == 'Speed'){
                        $data[] = $geojson["properties"]["data"]["speeds"][0];
                }
		elseif($key == 'Direction'){
                        $data[] = $geojson["properties"]["data"]["dirs"][0];
                }
		elseif($key == 'duration4'){
                       	$data[] = round($geojson["properties"]["data"]["ProbSevere"]["duration4"]);
                }
		elseif($key == 'duration5'){
                       	$data[] = round($geojson["properties"]["data"]["ProbSevere"]["duration5"]);
                }
		else{
			$data[] = $geojson["properties"]["data"][$key];
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
