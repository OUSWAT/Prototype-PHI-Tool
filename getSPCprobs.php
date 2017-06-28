<?php

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

date_default_timezone_set('UTC');

// input variables
$d = isset($_GET["d"]) ? $_GET["d"] : "20160415";
$user = isset($_GET["user"]) ? $_GET["user"] : "Karstens";
$desk = isset($_GET["desk"]) ? $_GET["desk"] : "SPC";
$period = isset($_GET["period"]) ? $_GET["period"] : "1_18_22";
$hazType = isset($_GET["hazType"]) ? $_GET["hazType"] : "tornado";
$issueType = isset($_GET["issueType"]) ? $_GET["issueType"] : "morning";
$model = isset($_GET["model"]) ? $_GET["model"] : "cal";

function file_curl($url)
        {
          $ch = curl_init();
          $timeout = 5;
          curl_setopt($ch,CURLOPT_URL,$url);
          curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
          curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,$timeout);
          $data = curl_exec($ch);
          curl_close($ch);
          $array = explode("\n", $data);
          array_pop($array);
          return $array;
        }

function getColor($val,$t){
	if($t == 'tornado'){
	        if($val == 2){
	                $r = 0;
	                $g = 139;
	                $b = 0;
	        }
	        elseif($val == 5){
	                $r = 139;
	                $g = 78;
	                $b = 38;
	        }
	        elseif($val == 10){
	                $r = 255;
	                $g = 200;
	                $b = 0;
	        }
	        elseif($val == 15){
	                $r = 255;
	                $g = 0;
	                $b = 0;
	        }
	        elseif($val == 30){
	                $r = 255;
	                $g = 0;
	                $b = 255;
	        }
		elseif($val == 45){
	                $r = 145;
	                $g = 44;
	                $b = 238;
	        }
		elseif($val == 60){
	                $r = 16;
	                $g = 78;
	                $b = 139;
	        }
	        else{
	                $r = 0;
	                $g = 0;
	                $b = 0;
	        }
	}
	else{
		if($val == 5){
                        $r = 139;
                        $g = 78;
                        $b = 38;
                }
                elseif($val == 15){
                        $r = 255;
                        $g = 200;
                        $b = 0;
                }
                elseif($val == 30){
                        $r = 255;
                        $g = 0;
                        $b = 0;
                }
                elseif($val == 45){
                        $r = 255;
                        $g = 0;
                        $b = 255;
                }
                elseif($val == 60){
                        $r = 145;
                        $g = 44;
                        $b = 238;
                }
                else{
                        $r = 0;
                        $g = 0;
                        $b = 0;
		}
	}
        $rgb = "rgb(".$r.",".$g.",".$b.")";
        return $rgb;
}

// initialize json to return
$json = array();
$json["type"] = "FeatureCollection";
$json["features"] = array();

if($hazType == "tornado"){
	$type = "tor";
}
else{
	$type = $hazType;
}
$e = explode("_",$period);
$p = $e[1]."-".$e[2];
$fStart = (int)$e[1];
$fEnd = (int)$e[2];
if($fStart == 18){
	$period2 = "18-22";
	$start = strtotime(substr($d,0,4)."-".substr($d,4,2)."-".substr($d,6,2)." 18:00:00 UTC");
        $end = strtotime(substr($d,0,4)."-".substr($d,4,2)."-".substr($d,6,2)." 22:00:00 UTC");
}
elseif($fStart = 22){
	$period2 = "22-02";
	$start = strtotime(substr($d,0,4)."-".substr($d,4,2)."-".substr($d,6,2)." 22:00:00 UTC");
	$end = strtotime(substr($d,0,4)."-".substr($d,4,2)."-".substr($d,6,2)." 02:00:00 UTC") + 86400;
}

$link = "http://hwt.nssl.noaa.gov/Spring_2017/efp/".$model."_".$type."_".$d."_".$period2.".txt";
//$link = "http://hwt.nssl.noaa.gov/Spring_2016/efp/".$model."_".$type."_20160415_".$period2.".txt";
//$data = @file($link);
$data = file_curl($link);

if(empty($data)){
	$out = json_encode($json);
	echo $out."\n";
	die();
}

$get = false;
$coords = array();
$i = 0;
foreach($data as $line){
	$e = explode(">",trim($line));
	if($get == true && @$e[0] != "<VG_TYPE"){
		$e2 = explode(" ",trim($line));
		$coords[] = array(floatval($e2[1]),floatval($e2[0]));
	}
	elseif($get == true && @$e[0] == "<VG_TYPE"){
		$i++;
		$feat = array();
                $feat["geometry"] = array();
                $feat["geometry"]["type"] = "Polygon";
                $feat["geometry"]["coordinates"] = array($coords);
                $feat["properties"] = array();
		$feat["properties"]["prob"] = $prob;
                $feat["properties"]["color"] = getColor($prob,$hazType);
		$feat["properties"]["hazType"] = $hazType;
		$feat["properties"]["issueType"] = $issueType;
		$feat["properties"]["user"] = $user."-".$desk;
		$feat["properties"]["show"] = 1;
		$feat["properties"]["discussion"] = "";
		$feat["properties"]["period"] = $period;
		$feat["properties"]["fStart"] = $fStart;
		$feat["properties"]["fEnd"] = $fEnd;
		$feat["properties"]["startTime"] = $start;
		$feat["properties"]["endTime"] = $end;
		$feat["properties"]["probID"] = $i;
		$feat["properties"]["modified"] = false;
		$feat["properties"]["ncpRecord"] = $issueType."_fourhourly_".$hazType;
                $json["features"][] = $feat;
		$get = false;
		$coords = array();
	}
	if(@$e[0] == "<GROUPED TEXT"){
		$e2 = explode("%",$e[1]);
		$prob = (int)$e2[0];
	}
	elseif(@$e[0] == "<NUMPTS"){
		$get = true;
	}
}

if($get == true){
	$i++;
	$feat = array();
        $feat["geometry"] = array();
        $feat["geometry"]["type"] = "Polygon";
        $feat["geometry"]["coordinates"] = array($coords);
        $feat["properties"] = array();
        $feat["properties"]["prob"] = $prob;
        $feat["properties"]["color"] = getColor($prob,$hazType);
	$feat["properties"]["hazType"] = $hazType;
	$feat["properties"]["issueType"] = $issueType;
	$feat["properties"]["user"] = $user."-".$desk;
	$feat["properties"]["show"] = 1;
	$feat["properties"]["discussion"] = "";
	$feat["properties"]["period"] = $period;
	$feat["properties"]["fStart"] = $fStart;
        $feat["properties"]["fEnd"] = $fEnd;
	$feat["properties"]["startTime"] = $start;
        $feat["properties"]["endTime"] = $end;
	$feat["properties"]["probID"] = $i;
	$feat["properties"]["modified"] = false;
	$feat["properties"]["ncpRecord"] = $issueType."_fourhourly_".$hazType;
        $json["features"][] = $feat;
}

$out = json_encode($json);
echo $out."\n";


?>
