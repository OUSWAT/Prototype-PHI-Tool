<?php

date_default_timezone_set('UTC');

$member = isset($_GET["member"]) ? $_GET["member"] : "sseo01";
$now = isset($_GET["now"]) ? $_GET["now"] : "2014060300";
$path = getcwd();

$sseo = array("sseo01","sseo02","sseo03","sseo04","sseo05","sseo06","sseo07");
$wrf = array("nssl_4km","nssl_4km_em_ctl","nssl_4km_em_n1","nssl_4km_em_p1","nssl_4km_nmb_ctl","nssl_4km_nmb_p1","nssl_4km_nmm_ctl");

if($member == 'max' && file_exists("realtime/efp/stormObjects/".$now)){
	$members = scandir("realtime/efp/stormObjects/".$now);
        unset($members[array_search('.',$members)]);
        unset($members[array_search('..',$members)]);
	foreach($members as $mem){
		$jsons = scandir("realtime/efp/stormObjects/".$now."/".$mem);
	        unset($jsons[array_search('.',$jsons)]);
	        unset($jsons[array_search('..',$jsons)]);
	        foreach($jsons as $json){
	                $test = substr($json,-3);
	                if($test == "dat"){
	                        $data = file("realtime/efp/stormObjects/".$now."/".$mem."/".$json);
	                        foreach($data as $line){
	                                echo $line;
	                        }
	                }
	        }
	}
}
elseif(file_exists("realtime/efp/stormObjects/".$now."/".$member)){
	$jsons = scandir("realtime/efp/stormObjects/".$now."/".$member);
	unset($jsons[array_search('.',$jsons)]);
        unset($jsons[array_search('..',$jsons)]);
	foreach($jsons as $json){
		$test = substr($json,-3);
		if($test == "dat"){
			$data = file("realtime/efp/stormObjects/".$now."/".$member."/".$json);
			foreach($data as $line){
				echo $line;
			}
		}
	}
}

?>
