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
		$swLat = $lat - $factor - $o;
		$swLon = $lon - $factor;
		$neLat = $lat + $factor - $o;
		$neLon = $lon + $factor;
		echo $swLon.",".$swLat.",".$neLon.",".$neLat;
		echo "\n";
		echo ($lat + $factor)." ".($lon - $factor).",".($lat - $factor)." ".($lon + $factor);
		echo "\n";
		break;
	}
}

?>
