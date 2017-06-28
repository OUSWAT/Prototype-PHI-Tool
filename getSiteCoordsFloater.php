<?php

$site = isset($_GET["site"]) ? $_GET["site"] : "KBGM";

$path = getcwd();
$xml = simplexml_load_file($path."/radarinfo.xml");
$factor = 3.2;
foreach($xml->radar as $radar){
	if($radar['name'] == $site){
		$lat = (float)$radar->location['lat'];
		$lon = (float)$radar->location['lon'];
		//$o = round(($lat - 10) * 0.003958264,3);
		$o = round(($lat - 10) * 0.002658264,3);
		$swLat = $lat - 3;
		$swLon = $lon - 4;
		$neLat = $lat + 3;
		$neLon = $lon + 4;
		echo $swLon.",".$swLat.",".$neLon.",".$neLat;
		break;
	}
}

?>
