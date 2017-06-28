<?php

//ob_start('ob_gzhandler');

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

// init vars
date_default_timezone_set('UTC');
$objID = isset($_GET["objID"]) ? $_GET["objID"] : "2";
$objType = isset($_GET["objType"]) ? $_GET["objType"] : "probSevere";
$now = isset($_GET["now"]) ? $_GET["now"] : "";
$hazard = isset($_GET["hazard"]) ? $_GET["hazard"] : "all";
$analysis = isset($_GET["analysis"]) ? $_GET["analysis"] : "false";

$nowCheck = $now;
if($analysis == "true"){
	$nowCheck = 9999999999;
}

// determine case date for log
$hour = date("H",$now);
if($hour < 12){
	$case = date("Ymd",($now - 86400));
}
else{
	$case = date("Ymd",$now);
}

// read reports log
$log = "history/reports/".$objType."_".$case.".json";
$contents = file_get_contents($log);
$geojson = json_decode($contents);

// initialize json to return
$json = array();
$json["type"] = "FeatureCollection";
$json["features"] = array();

// append matching reports to output stream
foreach($geojson->features as $feature){
	if($feature->properties->epoch <= $nowCheck){
		if($feature->properties->objID == $objID && $feature->properties->hazard == $hazard || $feature->properties->objID == $objID && $hazard == "all"){
			$json["features"][] = $feature;
		}
	}
}

// dump reports
$out = json_encode($json, JSON_UNESCAPED_UNICODE);
echo $out."\n";

?>
