<?php

$case = isset($_GET["case"]) ? $_GET["case"] : "";
$site = isset($_GET["site"]) ? $_GET["site"] : "";

$exclude = array('.','..','get_myrorss_objects.php','get_objects.php','parse_objects.php','test.png','test2.png','warnings','wof.py','PHI','PHI_backup','makeFloaterFile.py','20080716','20110524','20120629','20130520','20090809','20110427','20120613','20130519','20130805');

$cases = scandir('archive');
foreach($exclude as $item){
	unset($cases[array_search($item,$cases)]);
}

$inv = array();
foreach($cases as $c){
	$inv[] = $c;
}

echo implode(",",$inv);

?>
