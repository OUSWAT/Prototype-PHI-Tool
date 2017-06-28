<?php

ob_start('ob_gzhandler');

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

// init vars
date_default_timezone_set('UTC');
$d = isset($_GET["d"]) ? $_GET["d"] : "20160403152000";
$archive = isset($_GET["archive"]) ? $_GET["archive"] : "0";
$case = isset($_GET["case"]) ? $_GET["case"] : "";
$site = isset($_GET["site"]) ? $_GET["site"] : "";

$json = array();
$json["type"] = "FeatureCollection";
$json["features"] = array();

$path = getcwd();
if($archive == 1){
	$nldnPath = $path."/../../archive/".$case."/".$site."/lightningObjects/nldn";
}
else{
	$nldnPath = $path."/floater/lightningObjects/nldn";
}

$inTime = strtotime(substr($d,0,4)."-".substr($d,4,2)."-".substr($d,6,2)." ".substr($d,8,2).":".substr($d,10,2).":".substr($d,12,2));

// NLDN.0003.2016.04.03.15.17.json
for($i=0;$i<5;$i++){
	//$nldnFile = "NLDN.0003.".substr($d,0,4).".".substr($d,4,2).".".substr($d,6,2).".".substr($d,8,2).".".substr($d,10,2).".json";
	$nldnFile = "NLDN.0003.".date("Y.m.d.H.i",$inTime).".json";
	//echo $nldnFile."\n";
	if(file_exists($nldnPath."/".$nldnFile)){
		$data = file_get_contents($nldnPath."/".$nldnFile);
		$feats = json_decode($data,true);
	        foreach($feats["features"] as $feat){
			$json["features"][] = $feat;
		}
	}
	$inTime = $inTime - 60;
}
$out = json_encode($json);
echo $out;
die();
$files = array_reverse(array_diff(scandir($nldnPath), array('..', '.')));
foreach($files as $f){
	echo file_get_contents($nldnPath."/".$f);
	break;
}
