<?php

date_default_timezone_set('UTC');

$scale = isset($_GET["scale"]) ? $_GET["scale"] : "1";
$xml_time = isset($_GET["xml_time"]) ? $_GET["xml_time"] : "";
$site = isset($_GET["site"]) ? $_GET["site"] : "";
$case = isset($_GET["case"]) ? $_GET["case"] : "";


if(empty($xml_time)){
        die();
}

$xml_file = date("Ymd-His",$xml_time).".xml";

// get Ortega's hail stats
$url = "realtime/ewp/lookupTables/Ortega_MESH_1in.csv";
$data = file($url);
$i = 0;
$thresholds = array();
$probs = array();
foreach($data as $line){
	$i++;
	if($i > 1){
		$d = explode(",",$line);
		$thresholds[] = $d[0] * 0.0393701;
		$probs[] = $d[1] * 100;
	}
}

function getOrtegaHailProb($meshVal,$thresholds,$probs){
	$probVal = 0;
	for($k=0;$k<count($thresholds);$k++){
		$probVal = $probs[$k];
		if($thresholds[$k] > $meshVal){
			break;
		}
	}
	return $probVal;
}

function getColor($val){
	if($val <= 20){
                $r = 0;
                $g = 204;
                $b = 0;
        }
	elseif($val < 40){
                $r = 255;
                $g = 255;
                $b = 0;
        }
	elseif($val < 60){
                $r = 255;
                $g = 128;
                $b = 0;
        }
	elseif($val < 80){
                $r = 255;
                $g = 0;
                $b = 0;
        }
	elseif($val <= 100){
                $r = 255;
                $g = 0;
                $b = 255;
	}
        else{
               	$r = 0;
		$g = 0;
		$b = 0;
	}
	$rgb = "rgb(".$r.",".$g.",".$b.")";
	return $rgb;
}

for($z=0;$z<4;$z++){
	if(!empty($case)){
		$link = "archive/".$case."/".$site."/PHITable/scale_".$z."/".$xml_file;
	}
	else{
		$link = "realtime/ewp/floater/PHITable/scale_".$z."/".$xml_file;
	}
	$xml= simplexml_load_file($link);

	$columns = $xml->data->datacolumn;
	$cols = array();

	for($i=0;$i<count($columns);$i++){
		if((string)$columns[$i]->attributes()->name == "Reflectivity_-10C"){
			$cols["Reflectivity_10C"] = array();
		}
		elseif((string)$columns[$i]->attributes()->name == "Avg-20CHt_scale0"){
			$cols["Avg_20CHt_scale0"] = array();
		}
		elseif((string)$columns[$i]->attributes()->name == "Avg-20CHt_scale1"){
	                $cols["Avg_20CHt_scale1"] = array();
	        }
		elseif((string)$columns[$i]->attributes()->name == "Avg-20CHt_scale2"){
	                $cols["Avg_20CHt_scale2"] = array();
	        }
		elseif((string)$columns[$i]->attributes()->name == "Avg-20CHt_scale3"){
	                $cols["Avg_20CHt_scale3"] = array();
	        }
		elseif((string)$columns[$i]->attributes()->name == "Min-20CHt"){
	                $cols["Min_20CHt"] = array();
	        }
		else{
			$cols[(string)$columns[$i]->attributes()->name] = array();
		}
		for($j=0;$j<count($columns[$i]);$j++){
			if((string)$columns[$i]->attributes()->name == "StartTime"){
				$cols[(string)$columns[$i]->attributes()->name][] = (string)$columns[$i]->item[$j]->attributes()->value;
			}
			elseif((string)$columns[$i]->attributes()->name == "Reflectivity_-10C"){
				$cols["Reflectivity_10C"][] = (float)$columns[$i]->item[$j]->attributes()->value;
			}
			elseif((string)$columns[$i]->attributes()->name == "Avg-20CHt_scale0"){
	                        $cols["Avg_20CHt_scale0"][] = (float)$columns[$i]->item[$j]->attributes()->value;
	                }
			elseif((string)$columns[$i]->attributes()->name == "Avg-20CHt_scale1"){
	                        $cols["Avg_20CHt_scale1"][] = (float)$columns[$i]->item[$j]->attributes()->value;
	                }
			elseif((string)$columns[$i]->attributes()->name == "Avg-20CHt_scale2"){
	                        $cols["Avg_20CHt_scale2"][] = (float)$columns[$i]->item[$j]->attributes()->value;
	                }
			elseif((string)$columns[$i]->attributes()->name == "Avg-20CHt_scale3"){
	                        $cols["Avg_20CHt_scale3"][] = (float)$columns[$i]->item[$j]->attributes()->value;
	                }
			elseif((string)$columns[$i]->attributes()->name == "Min-20CHt"){
	                        $cols["Min_20CHt"][] = (float)$columns[$i]->item[$j]->attributes()->value;
	                }
			elseif((string)$columns[$i]->attributes()->name == "MaxSfcDew"){
	                        $cols["MaxSfcDew"][] = ((float)$columns[$i]->item[$j]->attributes()->value * (9/5)) + 32;
	                }
			elseif((string)$columns[$i]->attributes()->name == "MaxSfcTemp"){
	                        $cols["MaxSfcTemp"][] = ((float)$columns[$i]->item[$j]->attributes()->value * (9/5)) + 32;
	                }
			elseif((string)$columns[$i]->attributes()->name == "Speed"){
	                        $cols["Speed"][] = (float)$columns[$i]->item[$j]->attributes()->value * 1.94384;
	                }
			elseif((string)$columns[$i]->attributes()->name == "Speed_scale0"){
	                        $cols["Speed_scale0"][] = (float)$columns[$i]->item[$j]->attributes()->value * 1.94384;
	                }
			elseif((string)$columns[$i]->attributes()->name == "Speed_scale1"){
	                        $cols["Speed_scale1"][] = (float)$columns[$i]->item[$j]->attributes()->value * 1.94384;
	                }
			elseif((string)$columns[$i]->attributes()->name == "Speed_scale2"){
	                        $cols["Speed_scale2"][] = (float)$columns[$i]->item[$j]->attributes()->value * 1.94384;
	                }
			elseif((string)$columns[$i]->attributes()->name == "Speed_scale3"){
	                        $cols["Speed_scale3"][] = (float)$columns[$i]->item[$j]->attributes()->value * 1.94384;
	                }
			elseif((string)$columns[$i]->attributes()->name == "MESH"){
	                        $cols["MESH"][] = (float)$columns[$i]->item[$j]->attributes()->value * 0.0393701;
				$cols["OrtegaHailProb"][] = getOrtegaHailProb(((float)$columns[$i]->item[$j]->attributes()->value * 0.0393701),$thresholds,$probs);
	                }
			elseif((string)$columns[$i]->attributes()->name == "MESH30"){
	                        $cols["MESH30"][] = (float)$columns[$i]->item[$j]->attributes()->value * 0.0393701;
	                }
			elseif((string)$columns[$i]->attributes()->name == "LightningProbabilityNext30min"){
				if((float)$columns[$i]->item[$j]->attributes()->value < 0){
					$cols["LightningProbabilityNext30min"][] = 0;
				}
				else{
	                                $cols["LightningProbabilityNext30min"][] = (float)$columns[$i]->item[$j]->attributes()->value * 100;
				}
                       	}
			/*
			elseif((string)$columns[$i]->attributes()->name == "RowName"){
	                        $cols["RowName"][] = (string)$columns[$i]->item[$j]->attributes()->value;
	                }
			*/
			else{
				$cols[(string)$columns[$i]->attributes()->name][] = (float)$columns[$i]->item[$j]->attributes()->value;
			}
		}
	}

	$keys = array_keys($cols);
	$k = 0;

	for($i=0;$i<count($cols[$keys[0]]);$i++){
		// calculate direction
		//$d = explode(":",$cols["RowName"][$k]);
		//$key = "MotionEast_scale".$d[0];
		$key = "MotionEast";
		$direction = round(270 - rad2deg(atan2((-1 * $cols["MotionSouth"][$k]),$cols[$key][$k])));
		$speed = sqrt(pow($cols["MotionSouth"][$k],2) + pow($cols[$key][$k],2));

		/*
		// calculate ellipsoid
		$coords = array();
		$lonRadius = $cols["LonRadius"][$k] / (111.325 * cos(deg2rad($cols["Latitude"][$k])));
	        $latRadius = $cols["LatRadius"][$k] / 111.325;
		for($j=0;$j<360;$j=$j+9){
			$x_increment = cos(deg2rad($j)) * $lonRadius;
			$x = round($cols["Longitude"][$k] + $x_increment,6);
			//$y_increment = ($latRadius / sin(deg2rad($j))) * sqrt(1 - pow(($x_increment) * cos(deg2rad($j)) / $lonRadius,2));
			$y_increment = sqrt(pow($latRadius,2) * (1 - (pow($x_increment,2) / pow($lonRadius,2))));
			if($j >= 180){
				$y_increment = -1 * $y_increment;
			}
			$y = round($cols["Latitude"][$k] + $y_increment,6);
			//$coords[] = array($x_increment,$y_increment);
			$coords[] = array($x,$y);
		}
		*/
		//print_r($coords);
		//die();

		/*
		$x_increment = $lonRadius / 11;
		$x = $cols["Longitude"][$k] - $lonRadius + $x_increment;
		for($j=0;$j<20;$j++){
			$y_increment = ($latRadius / cos(deg2rad($cols["Orientation"][$k]))) * sqrt(1 - pow(($x - $cols["Longitude"][$k]) * sin(deg2rad($cols["Orientation"][$k])) / $lonRadius,2));
			//$y_increment = sqrt(pow($latRadius,2) * (1 - (pow(($x - $cols["Longitude"][$k]),2) / pow($lonRadius,2))));
			//$y_increment = sqrt((pow($latRadius,2) / cos(deg2rad($cols["Orientation"][$k]))) * (1 - (pow(($x - $cols["Longitude"][$k]),2) * sin(deg2rad($cols["Orientation"][$k])) / pow($lonRadius,2))));
			//$y_increment = sqrt(pow($latRadius,2) * (1 - (pow(($x - $cols["Longitude"][$k]) * sin(deg2rad($cols["Orientation"][$k])),2) / pow($lonRadius,2)))) / cos(deg2rad($cols["Orientation"][$k]));
			$y_upper = round($cols["Latitude"][$k] + $y_increment,6);
			$coords[] = array($x,$y_upper);
			$x = round($x + $x_increment,6);
			//echo $y_increment.",".$cols["LonRadius"][$k].",".$lonRadius.",".$cols["LatRadius"][$k].",".$latRadius."\n";
			//echo pow(($x - $cols["Longitude"][$k]) * sin(deg2rad($cols["Orientation"][$k])) / $lonRadius,2)."\n";
		}
		$x = $cols["Longitude"][$k] + $lonRadius - $x_increment;
		for($j=0;$j<20;$j++){
			$y_increment = ($latRadius / cos(deg2rad($cols["Orientation"][$k]))) * sqrt(1 - pow(($x - $cols["Longitude"][$k]) * sin(deg2rad($cols["Orientation"][$k])) / $lonRadius,2));
			//$y_increment = sqrt(pow($latRadius,2) * (1 - (pow(($x - $cols["Longitude"][$k]) * sin(deg2rad($cols["Orientation"][$k])),2) / pow($lonRadius,2)))) / cos(deg2rad($cols["Orientation"][$k]));
			$y_lower = round($cols["Latitude"][$k] - $y_increment,6);
			$coords[] = array($x,$y_lower);
			$x = round($x - $x_increment,6);
			//echo $y_increment."\n";
		}
		//die();
		*/

		// create geojson
		$features = array();
		$features["type"] = "Feature";
		$features["properties"] = array();
		for($j=0;$j<count($keys);$j++){
			$features["properties"][$keys[$j]] = $cols[$keys[$j]][$k];
		}
		$features["properties"]["speed"] = $speed * 1.94384;
		$features["properties"]["color"] = getColor($features["properties"]["OrtegaHailProb"]);
		$features["properties"]["init"] = $xml_time;
		$features["properties"]["InitTime"] = date("Ymd-His",$xml_time);
		$features["properties"]["Direction"] = $direction;
		$features["properties"]["Scale"] = $z;
		$features["geometry"] = array();
		$features["geometry"]["type"] = "Point";
		//$features["geometry"]["type"] = "Polygon";
		$features["geometry"]["coordinates"] = array($cols["Longitude"][$k],$cols["Latitude"][$k]);
		//$features["geometry"]["coordinates"] = array($coords);
		echo json_encode($features)."\n";
		$k++;
	}
}

?>
