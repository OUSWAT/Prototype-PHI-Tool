<?php

ob_start('ob_gzhandler');

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

date_default_timezone_set('UTC');

$case = isset($_GET["case"]) ? $_GET["case"] : "20150506";
$site = isset($_GET["site"]) ? $_GET["site"] : "KTLX";
$user = isset($_GET["user"]) ? $_GET["user"] : "ewp12";

// initialize json to return
$json = array();
$json["type"] = "FeatureCollection";
$json["features"] = array();

$dataPath = "../../archive/".$case."/".$site."/phiObjects/objects";
$files = array_diff(scandir($dataPath), array('..', '.'));
foreach($files as $f){
	if(strpos($f,$user) === False){
		continue;
	}
	$data = file($dataPath."/".$f);
	foreach($data as $line){
		$geojson = json_decode(trim($line));
		$json["features"][] = $geojson;
	}
}

$out = json_encode($json);
echo $out;

?>
