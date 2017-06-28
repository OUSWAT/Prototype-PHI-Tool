<?php

$case = isset($_GET["case"]) ? $_GET["case"] : "";
$site = isset($_GET["site"]) ? $_GET["site"] : "";
$model = isset($_GET["model"]) ? $_GET["model"] : "nssl_4km_17";

if($model == "ouMap" || $model == "ouMap1km"){
	$inv = array();
	/*
	$link = "http://weather.ou.edu/~map/real_time_data/PECAN/PHI/?".time();
	$data = file($link);
	foreach($data as $line){
		// <img src="/icons/folder.gif" alt="[DIR]" width="10" height="10"> <a href="2015051512/">2015051512/</a>
		$s = explode('"',$line);
		if(@$s[1] == "/icons/folder.gif"){
			$inv[] = substr($s[9],0,10);
		}
	}
	rsort($inv);
	*/
	echo implode(",",$inv);
	die();
}

$exclude = array('.','..');
$cases = scandir('realtime/efp/images');
foreach($exclude as $item){
	unset($cases[array_search($item,$cases)]);
}

$inv = array();
foreach(array_reverse($cases) as $c){
	$models = scandir('realtime/efp/images/'.$c);
	foreach($models as $m){
		if(strpos('realtime/efp/images/'.$c.'/'.$m,$model) && !in_array($c,$inv)){
			$inv[] = $c;
			continue;
		}
		elseif(strpos('realtime/efp/images/'.$c.'/'.$m,substr($model,0,8)) && substr($c,2,2) == substr($model,-2,2) && !in_array($c,$inv)){
			$inv[] = $c;
                        continue;
		}
	}
	if($model == "hrrr" && count($inv) > 30){
		break;
	}
}

if($model == "nssl_4km_14" || $model == "nssl_4km_15"){
	$cases = scandir('realtime/efp/uhTracks');
	foreach($exclude as $item){
	        unset($cases[array_search($item,$cases)]);
	}
	foreach($cases as $c){
		if(substr($c,2,2) != substr($model,-2,2)){
			continue;
		}
		$case = $c."00";
		if(!in_array($case,$inv)){
			$inv[] = $case;
		}
	}
}
/*
elseif($model == "nssl_4km_17"){
	$cases = scandir('realtime/efp/images');
        foreach($exclude as $item){
                unset($cases[array_search($item,$cases)]);
        }
	foreach($cases as $c){
                if(substr($c,2,2) != substr($model,-2,2)){
                        continue;
                }
                $case = $c."00";
                if(!in_array($case,$inv)){
                        $inv[] = $case;
                }
        }
}
*/
rsort($inv);

echo implode(",",$inv);

?>
