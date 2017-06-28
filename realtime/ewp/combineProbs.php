<?php

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

date_default_timezone_set('UTC');

$d = isset($_GET["d"]) ? $_GET["d"] : "20150528181832";
$fcstr = isset($_GET["fcstr"]) ? $_GET["fcstr"] : "ewp9";
$type = isset($_GET["type"]) ? $_GET["type"] : "severe";
$archive = isset($_GET["archive"]) ? $_GET["archive"] : "0";
$automated = isset($_GET["automated"]) ? $_GET["automated"] : "1";
$block = isset($_GET["block"]) ? $_GET["block"] : "0";

$path = "/var/www/html/RadarQC/phi_new";

if(substr($fcstr,0,3) == "ewp"){
        $fcstr = "ewp";
}

$url1 = "http://blobert.protect.nssl/RadarQC/phi_new/realtime/ewp/ewpProbs.php?d=".$d."&fcstr=".$fcstr."&type=severe&archive=".$archive."&block=".$block;
$url2 = "http://blobert.protect.nssl/RadarQC/phi_new/realtime/ewp/ewpProbs.php?d=".$d."&fcstr=".$fcstr."&type=tornado&archive=".$archive."&block=".$block;

$data1 = file($url1);
$data2 = file($url2);

$geojson1 = json_decode(trim($data1[0]), true);
$geojson2 = json_decode(trim($data2[0]), true);

//$all = array_merge_recursive( $geojson1, $geojson2 );
//$allJson = json_encode($all);
//$allJson = json_encode(array($geojson1, $geojson2));

// initialize json to return
$json = array();
$json["type"] = "FeatureCollection";
$json["features"] = array();

foreach($geojson1["features"] as $obj){
	$json["features"][] = $obj;
}
foreach($geojson2["features"] as $obj){
        $json["features"][] = $obj;
}

$allJson = json_encode($json);

echo $allJson;

?>
