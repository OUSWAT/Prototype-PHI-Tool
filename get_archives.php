<?php

$case = isset($_GET["case"]) ? $_GET["case"] : "";
$site = isset($_GET["site"]) ? $_GET["site"] : "";

$radars = array();
$data = file("radars.gis");
foreach($data as $line){
	$d = explode(" ",$line);
	$radars[] = strtoupper($d[0]);
}

$exclude = array('.','..','get_myrorss_objects.php','get_objects.php','parse_objects.php','test.png','test2.png','warnings','wof.py');

$cases = scandir('archive');
foreach($exclude as $item){
	unset($cases[array_search($item,$cases)]);
}

$inv = array();
foreach($cases as $c){
	$sites = scandir('archive/'.$c);
	foreach($sites as $s){
		if(in_array($s,$radars)){
			if($c == $case && $s == $site){
				$inv[] = '<option value="'.$c.'|'.$s.'" selected>'.$c.' - '.$s.'</option>';
			}
			else{
				$inv[] = '<option value="'.$c.'|'.$s.'">'.$c.' - '.$s.'</option>';
			}
		}
	}
}

echo implode("",$inv);

?>
