<?php

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

$case = isset($_GET["case"]) ? $_GET["case"] : "";

if(empty($case)){
	die();
}

$radars = array();
$data = file("radars.gis");
foreach($data as $line){
	$d = explode(" ",$line);
	$radars[] = strtoupper($d[0]);
}

$inv = array();
$sites = scandir('archive/'.$case);
foreach($sites as $s){
	if(in_array($s,$radars)){
		$inv[] = $s;
	}
}

echo implode(",",$inv);

?>
