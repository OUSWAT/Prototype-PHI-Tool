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
$type = isset($_GET["type"]) ? $_GET["type"] : "severe";

// initialize json to return
$json = array();
//$json["type"] = "FeatureCollection";
//$json["features"] = array();

if($type == "severe"){
	$dataPath = "../../archive/".$case."/".$site."/probSevereObjects/objects";
}
else{
	$dataPath = "../../archive/".$case."/".$site."/lightningObjects/objects";
}
$files = array_diff(scandir($dataPath), array('..', '.'));
foreach($files as $f){
	// probSevere_20150506-223839_063490.json
	$s = explode("_",$f);
	$s2 = explode(".",$s[2]);
	//$objID = sprintf('%07d',$s2[0]);
	$objID = intval($s2[0]);
	$json[$objID] = array();
	$data = file($dataPath."/".$f);
	foreach($data as $line){
		$geojson = json_decode(trim($line));
		$json[$objID][] = $geojson->properties->data->valid_start;
	}
}

$out = json_encode($json);
echo $out;

?>
