<?php

// if no file is found, hangs up load time...
//die();

date_default_timezone_set('UTC');

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

$today = date("Ymd");

$link = "http://hwt.nssl.noaa.gov/Spring_2017/centerpoint/".$today."_centerpoint.txt";
$data = @file_curl($link);

if(empty($data)){
	die();
}

$site = trim($data[0]);

$link2 = "se2011mapstns.tbl";
$data2 = file($link2);

foreach($data2 as $line){
	$d = explode(" ", trim(ereg_replace( ' +', ' ', $line)));
	if($d[0] == $site){
		$lat = $d[5] / 100;
		$lon = $d[6] / 100;
		echo $site.",".$lon.",".$lat;
		break;
	}
}

?>
