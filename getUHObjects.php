<?php

date_default_timezone_set('UTC');

$member = isset($_GET["member"]) ? $_GET["member"] : "nssl_4km";
$now = isset($_GET["now"]) ? $_GET["now"] : "20140514";
$path = getcwd();

if($member == 'max' && file_exists("realtime/efp/uhTracks/".$now)){
	$members = scandir("realtime/efp/uhTracks/".$now);
        unset($members[array_search('.',$members)]);
        unset($members[array_search('..',$members)]);
	foreach($members as $mem){
		$jsons = scandir("realtime/efp/uhTracks/".$now."/".$mem);
	        unset($jsons[array_search('.',$jsons)]);
	        unset($jsons[array_search('..',$jsons)]);
	        foreach($jsons as $json){
	                $test = substr($json,-4);
	                if($test == "json"){
	                        $data = file("realtime/efp/uhTracks/".$now."/".$mem."/".$json);
	                        foreach($data as $line){
	                                echo $line;
	                        }
	                }
	        }
	}
}
elseif(file_exists("realtime/efp/uhTracks/".$now."/".$member)){
	$jsons = scandir("realtime/efp/uhTracks/".$now."/".$member);
	unset($jsons[array_search('.',$jsons)]);
        unset($jsons[array_search('..',$jsons)]);
	foreach($jsons as $json){
		$test = substr($json,-4);
		if($test == "json"){
			$data = file("realtime/efp/uhTracks/".$now."/".$member."/".$json);
			foreach($data as $line){
				echo $line;
			}
		}
	}
}

?>
