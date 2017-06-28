<?php

//date_default_timezone_set('UTC');
date_default_timezone_set('America/Denver');

$user = isset($_GET["user"]) ? $_GET["user"] : "Karstens";
$path = getcwd();

$now = date("Ymd");
if(file_exists("realtime/efp/products/".$now)){
	$jsons = scandir("realtime/efp/products/".$now);
	unset($jsons[array_search('.',$jsons)]);
        unset($jsons[array_search('..',$jsons)]);
	foreach($jsons as $json){
		$test = substr($json,-4);
		if($test == "json"){
			//morning_23_24_all_Karstens.json
			$d = explode("_",$json);
			$u = substr($d[4],0,-5);
			$d2 = explode("-",$u);
			if($d2[0] == $user){
				$data = file("realtime/efp/products/".$now."/".$json);
				foreach($data as $line){
					echo $line;
				}
			}
		}
	}
}

?>
