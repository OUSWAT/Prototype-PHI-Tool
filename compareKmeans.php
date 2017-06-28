<?php

date_default_timezone_set('UTC');

$scale = isset($_GET["scale"]) ? $_GET["scale"] : "1";
$list = isset($_GET["list"]) ? $_GET["list"] : "";
$minTime = isset($_GET["minTime"]) ? $_GET["minTime"] : "";
$nowTime = isset($_GET["nowTime"]) ? $_GET["nowTime"] : "";
$case = isset($_GET["case"]) ? $_GET["case"] : "";
$site = isset($_GET["site"]) ? $_GET["site"] : "";

$times = explode(",",$list);
$kmeans = array();

if(!empty($case)){
	$xml_files = scandir("archive/".$case."/".$site."/PHITable/scale_".$scale);
        unset($xml_files[array_search(".",$xml_files)]);
        unset($xml_files[array_search("..",$xml_files)]);

        foreach($xml_files as $xml){
                $d = str_split($xml);
                $t = strtotime($d[0].$d[1].$d[2].$d[3]."-".$d[4].$d[5]."-".$d[6].$d[7]." ".$d[9].$d[10].":".$d[11].$d[12].":".$d[13].$d[14]);
                if(!in_array($t,$times) && $t >= $minTime && $t < $nowTime){
                        $kmeans[] = $t;
                }
        }
}
else{
	$xml_files = scandir("realtime/ewp/floater/PHITable/scale_".$scale);
	unset($xml_files[array_search(".",$xml_files)]);
	unset($xml_files[array_search("..",$xml_files)]);

	foreach($xml_files as $xml){
		$d = str_split($xml);
		$t = strtotime($d[0].$d[1].$d[2].$d[3]."-".$d[4].$d[5]."-".$d[6].$d[7]." ".$d[9].$d[10].":".$d[11].$d[12].":".$d[13].$d[14]);
		if(!in_array($t,$times) && $t >= $minTime){
			$kmeans[] = $t;
		}
	}
}
echo implode(",",$kmeans);

?>
