<?php

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

$site = isset($_GET["site"]) ? $_GET["site"] : "KBMX";

$path = '/localdata/radarqc';
$xml = simplexml_load_file($path."/radarinfo.xml");
foreach($xml->radar as $radar){
	if($radar['name'] == $site){
		$lat = (float)$radar->location['lat'];
		$lon = (float)$radar->location['lon'];
		echo $lon.",".$lat;
		break;
	}
}

?>
