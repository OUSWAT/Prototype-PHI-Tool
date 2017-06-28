<?php

date_default_timezone_set('UTC');

$d = isset($_GET["d"]) ? $_GET["d"] : ""; //201703302000
$type = isset($_GET["type"]) ? $_GET["type"] : "CATEGORICAL";
$day = isset($_GET["day"]) ? $_GET["day"] : "1";

function getColor($tag, $type){
	$color = "rgb(0,0,0)";
	if($tag == "TSTM" || $tag == "0.05"){
		$color = "rgb(139,71,38)";
	}
	elseif($tag == "MRGL"){
		$color = "rgb(0,255,0)";
	}
	elseif($tag == "SLGT" || $tag == "0.02"){
                $color = "rgb(0,139,0)";
        }
	elseif($tag == "ENH" && $type == "CATEGORICAL" || $tag == "0.10" && $type == "TORNADO" || $tag == "0.15" && $type == "WIND" || $tag == "0.15" && $type == "HAIL"){
                $color = "rgb(255,200,0)";
        }
	elseif($tag == "MDT" && $type == "CATEGORICAL" || $tag == "0.15" && $type == "TORNADO" || $tag == "0.30" && $type == "WIND" || $tag == "0.30" && $type == "HAIL"){
                $color = "rgb(255,0,0)";
        }
	elseif($tag == "HIGH" && $type == "CATEGORICAL" || $tag == "0.30" && $type == "TORNADO" || $tag == "0.45" && $type == "WIND" || $tag == "0.45" && $type == "HAIL"){
                $color = "rgb(255,0,255)";
        }
	elseif($tag == "HIGH" && $type == "CATEGORICAL" || $tag == "0.45" && $type == "TORNADO" || $tag == "0.60" && $type == "WIND" || $tag == "0.60" && $type == "HAIL"){
                $color = "rgb(145,44,238)";
        }
	elseif($tag == "0.60"){
                $color = "rgb(16,78,139)";
        }
	elseif($tag == "SIG"){
                $color = "rgb(0,0,0)";
        }
	return $color;
}

if(empty($d)){
	$hr = date("H");
	$min = date("i");
	if($hr >= 20){
		$d = date("Ymd")."2000";
	}
	elseif($hr >= 16 && $min >= 30){
		$d = date("Ymd")."1630";
	}
	elseif($hr >= 13){
               	$d = date("Ymd")."1300";
       	}
	elseif($hr >= 6){
               	$d = date("Ymd")."1200";
       	}
	elseif($hr >= 1){
		$d = date("Ymd")."0100";
	}
	else{
		$now = strtotime(date("Y-m-d H:i:s")) - 86400;
		$d = date("Ymd",$now)."2000";
	}
}

$json = array();
$json["type"] = "FeatureCollection";
$json["features"] = array();
$out = json_encode($json);

$year = substr($d,0,4);
$url = "http://www.spc.noaa.gov/products/outlook/archive/".$year."/KWNSPTSDY".$day."_".$d.".txt";

// parse text product
$data = file($url) or die($out);
$snag = false;
$snag2 = false;
$coords = array();
foreach($data as $line){
	if(trim($line) == "&&"){
		$snag = false;
		$snag2 = false;
	}

	if($snag){
		$s = preg_split('/\s+/', trim($line));
		if(strlen($s[0]) > 0 && strlen($s[0]) < 8){
			$index = $s[0];
			if(!array_key_exists($index,$coords)){
				$coords[$index] = array();
			}
			$coords[$index][] = array();
			for($i=1;$i<count($s);$i++){
				if($s[$i] == 99999999){
					$coords[$index][] = array();
				}
				else{
					$coords[$index][count($coords[$index]) - 1][] = $s[$i];
				}
			}
			$snag2 = true;
		}
		elseif($snag2 && strlen($s[0]) > 0){
			foreach($s as $c){
				if($c == 99999999){
                                       	$coords[$index][] = array();
                               	}
				else{
					$coords[$index][count($coords[$index]) - 1][] = $c;
				}
			}
		}
	}

	if(strpos($line,$type)){
                $snag = true;
        }
}

// generate json array
$keys = array_keys($coords);
$index = -1;
foreach($keys as $key){
	for($i=0;$i<count($coords[$key]);$i++){
		$index++;
		$json["features"][$index]["type"] = "Feature";
		$json["features"][$index]["properties"] = array();
		$json["features"][$index]["properties"]["contour"] = $key;
		$json["features"][$index]["properties"]["color"] = getColor($key, $type);
		$json["features"][$index]["properties"]["issue"] = $d;
		$json["features"][$index]["geometry"] = array();
		$json["features"][$index]["geometry"]["type"] = "LineString";
		$json["features"][$index]["geometry"]["coordinates"] = array();
		foreach($coords[$key][$i] as $coord){
			$lat = substr($coord,0,4) / 100.0;
			$lon = substr($coord,4,8) / -100.0;
			if($lon > -50 ){
				$lon = $lon - 100;
			}
			$json["features"][$index]["geometry"]["coordinates"][] = array($lon,$lat);
		}
	}
}

$out = json_encode($json);
echo $out;

?>
