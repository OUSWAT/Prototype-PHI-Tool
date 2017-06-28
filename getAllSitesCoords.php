<?php

$sites = isset($_GET["sites"]) ? $_GET["sites"] : "KDMX,KOAX";

$xml = simplexml_load_file("radarinfo.xml");
$allSites = explode(",",$sites);
$allCoords = array();

foreach($allSites as $site){
	foreach($xml->radar as $radar){
		if($radar['name'] == $site){
			$lat = (float)$radar->location['lat'];
			$lon = (float)$radar->location['lon'];
			$allCoords[] = $lon.",".$lat;
			break;
		}
	}
}

echo implode("\n",$allCoords);

?>
