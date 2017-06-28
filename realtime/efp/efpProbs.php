<?php

date_default_timezone_set('America/Chicago');

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

$nowTime = strtotime(date("Y-m-d H:i:s"));
$nowHour = date("H");
$nowDate = date("ymd",$nowTime);

date_default_timezone_set('UTC');

$d = isset($_GET["d"]) ? $_GET["d"] : "201705031600";
$type = isset($_GET["type"]) ? $_GET["type"] : "svrfull";
$org = isset($_GET["org"]) ? $_GET["org"] : "nssl";
$day = isset($_GET["day"]) ? $_GET["day"] : "1";

if($type == "svrfull" || $type == "svrhour"){
	$type2 = "fullperiod";
}
else{
	$type2 = $type;
}

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

function getColor($tag, $type){
        $color = "rgb(0,0,0)";
        if($tag == "TSTM" || $tag == "5"){
                $color = "rgb(139,71,38)";
        }
	elseif($tag == "MRGL"){
                $color = "rgb(0,255,0)";
        }
	elseif($tag == "SLGT" || $tag == "2"){
                $color = "rgb(0,139,0)";
        }
	elseif($tag == "15" && $type == "fullperiod" || $tag == "10" && $type == "torn" || $tag == "15" && $type == "wind" || $tag == "15" && $type == "hail"){
                $color = "rgb(255,200,0)";
        }
	elseif($tag == "30" && $type == "fullperiod" || $tag == "15" && $type == "torn" || $tag == "30" && $type == "wind" || $tag == "30" && $type == "hail"){
                $color = "rgb(255,0,0)";
        }
	elseif($tag == "45" && $type == "fullperiod" || $tag == "30" && $type == "torn" || $tag == "45" && $type == "wind" || $tag == "45" && $type == "hail"){
                $color = "rgb(255,0,255)";
        }
	elseif($tag == "60" && $type == "fullperiod" || $tag == "45" && $type == "torn" || $tag == "60" && $type == "wind" || $tag == "60" && $type == "hail"){
                $color = "rgb(145,44,238)";
        }
	elseif($tag == "60"){
                $color = "rgb(16,78,139)";
        }
	elseif($tag == "SIGNIFICANT SEVERE"){
                $color = "rgb(0,0,0)";
        }
	return $color;
}

$t = substr($d,0,4)."-".substr($d,4,2)."-".substr($d,6,2)." ".substr($d,8,2).":".substr($d,10,2).":00 UTC";
$inTime = strtotime($t);
$inHour = date("H",$inTime);
$inDay = date("d",$inTime);
$tDay = date("H");
$nTime = strtotime(date("Y-m-d H:i:s")) - 86400;
$nDay = date("H",$nTime);


// testing purposes only!!!
/*
if($inHour > 6){
	$inDay = "11";
}
else{
	$inDay = "12";
}
*/


$period = "";
if($nowHour < 16 && $type != "svrfull"){
	$period = "prelim_";
}
elseif($type != "svrfull"){
	$period = "final_";
}

if($org == "spc" && $type != "torn1hr"){
	if($inHour >= 18 && $inHour < 22){
		$inHour = 18;
		$period = "";
	}
	elseif($inHour >= 22 && $inHour < 24 || $inHour >= 0 && $inHour < 02){
		$inHour = 22;
	}
}
elseif($org == "nssl"){
	if($inHour >= 18 && $inHour < 22){
		$period = "";
	}
	if($type == "svrfull"){
		if($inHour >= 16){
			$inHour = 16;
		}
		elseif($inHour <= 12){
			$inHour = 16;
			$inDay = $nDay;
			//$inDay = 11; // test only
		}
		else{
			$inHour = -1;
		}
	}
	elseif($inHour >= 18 && $inHour < 20){
		$inHour = 18;
	}
	elseif($inHour >= 20 && $inHour < 22){
		$inHour = 20;
	}
	elseif($inHour >= 22){
                $inHour = 22;
        }
	elseif($inHour >= 0 && $inHour < 2){
                $inHour = "00";
        }
	elseif($inHour >= 2 && $inHour < 4){
                $inHour = "02";
        }
}
elseif($org == "spc" && $type == "torn1hr"){
	$period = "";
}

//nssl_DAY1_150313_svr131600Z.dat  nssl_final_DAY1_150313_svr132100Z.dat   nssl_prelim_DAY1_150313_svr132200Z.dat  spc_DAY1_150313_torn1hr132200Z.dat  spc_DAY2_150313_hail141200Z.dat        spc_prelim_DAY1_150313_hail132200Z.dat
//nssl_DAY1_150313_svr131800Z.dat  nssl_final_DAY1_150313_svr132200Z.dat   nssl_prelim_DAY1_150313_svr132300Z.dat  spc_DAY1_150313_torn1hr132300Z.dat  spc_DAY2_150313_torn141200Z.dat        spc_prelim_DAY1_150313_torn132200Z.dat
//nssl_DAY1_150313_svr131900Z.dat  nssl_final_DAY1_150313_svr132300Z.dat   spc_DAY1_150313_hail131600Z.dat         spc_DAY1_150313_torn1hr140000Z.dat  spc_DAY2_150313_wind141200Z.dat        spc_prelim_DAY1_150313_wind132200Z.dat
//nssl_DAY1_150313_svr132000Z.dat  nssl_final_DAY1_150313_svr140000Z.dat   spc_DAY1_150313_hail131800Z.dat         spc_DAY1_150313_torn1hr140100Z.dat  spc_final_DAY1_150313_hail132200Z.dat
//nssl_DAY2_150313_svr141200Z.dat  nssl_final_DAY1_150313_svr140100Z.dat   spc_DAY1_150313_torn131600Z.dat         spc_DAY1_150313_wind131600Z.dat     spc_final_DAY1_150313_torn132200Z.dat
//nssl_DAY3_150313_svr151200Z.dat  nssl_prelim_DAY1_150313_svr132100Z.dat  spc_DAY1_150313_torn131800Z.dat         spc_DAY1_150313_wind131800Z.dat     spc_final_DAY1_150313_wind132200Z.dat

// use this link when live
$link = "http://hwt.nssl.noaa.gov/Spring_2017/efp/".$org."_".$period."DAY".$day."_".$nowDate."_".$type2.$inDay.$inHour."00Z.dat";
//echo $link."\n";
//die();

// use this link for testing
//$link = "http://hwt.nssl.noaa.gov/Spring_2016/efp/".$org."_".$period."DAY".$day."_160411_".$type2.$inDay.$inHour."00Z.dat";

//echo $link."\n";
//die();

$trip = false;
$json = array();
$json["type"] = "FeatureCollection";
$json["features"] = array();

$data = @file_curl($link) or die(json_encode($json));
$index = -1;

foreach($data as $line){
	if(trim($line) == "$$"){
                $trip = false;
		$index++;

		// dump to json
		$json["features"][$index]["type"] = "Feature";
                $json["features"][$index]["properties"] = array();
                $json["features"][$index]["properties"]["contour"] = $cNum;
                $json["features"][$index]["properties"]["color"] = getColor($cNum, $type2);
               	$json["features"][$index]["geometry"] = array();
                $json["features"][$index]["geometry"]["type"] = "LineString";
		$json["features"][$index]["geometry"]["coordinates"] = $coords;
        }

	if($trip){
                $s = preg_split('/\s+/', trim($line));
                $coords[] = array(floatval($s[1]),floatval($s[0]));
        }

	if(strpos($line,"LABEL:") !== false){
		$s = explode("%",$lineLast);
		$cNum = $s[0];
		$trip = true;
		$coords = array();
	}

	$lineLast = $line;
}

$out = json_encode($json);
echo $out."\n";

?>
