<?php

header("Content-Type: text/plain");
date_default_timezone_set('UTC');

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

$d = isset($_GET["d"]) ? $_GET["d"] : "1430090610";
$thresh = isset($_GET["thresh"]) ? $_GET["thresh"] : "0";
$type = isset($_GET["type"]) ? $_GET["type"] : "tornadosevere"; // severe or tornado or tornadosevere
$wType = isset($_GET["wType"]) ? $_GET["wType"] : "all"; // warn, adv, all
$auto = isset($_GET["auto"]) ? $_GET["auto"] : "0"; // 0=manual, 1=automated, 2=human/machine modified, 3=all
$archive = isset($_GET["archive"]) ? $_GET["archive"] : "0";
$site = isset($_GET["site"]) ? $_GET["site"] : "KFWS";

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

$link = "http://blobert.protect.nssl/RadarQC/phi_new/realtime/ewp/getLegacy.php?d=".$d."&thresh=".$thresh."&type=".$type."&wType=".$wType."&auto=".$auto."&archive=".$archive."&site=".$site;
$txt = file_curl($link);
$json = json_decode($txt[0],true);

for($i=0;$i<count($json["features"]);$i++){
	if($json["features"][$i]["properties"]["data"]["auto"] != 1){
		if($json["features"][$i]["properties"]["data"]["warningType"] == "Tornado"){
			$t = "tornado";
		}
		elseif($json["features"][$i]["properties"]["data"]["warningType"] == "Lightning"){
			$t = "lightning";
		}
		else{
			$t = "severe";
		}
		$id = $json["features"][$i]["properties"]["data"]["ID"];
		$link = "http://blobert.protect.nssl/RadarQC/phi_new/realtime/ewp/getObjectDisc.php?objID=".$id."&now=".$d."&archive=".$archive."&site=".$site."&analysis=false&user=all&legacy=true&type=".$t;
		$txt = file_curl($link);
		$disc = json_decode($txt[0],true);
		$json["features"][$i]["properties"]["data"]["discussion"] = $disc;
	}
}

// dump json
$out = json_encode($json);
echo $out."\n";

?>
