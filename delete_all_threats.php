<?php

date_default_timezone_set('UTC');

$case = isset($_GET["case"]) ? $_GET["case"] : "";
$user = isset($_GET["user"]) ? $_GET["user"] : "";

if(!empty($case) && !empty($user)){
	$threats = scandir('threats/'.$case);
	unset($threats[array_search(".",$threats)]);
        unset($threats[array_search("..",$threats)]);
	foreach($threats as $threat){
		$d = explode("-",$threat);
		if($d[0] == $user && file_exists('threats/'.$case.'/'.$threat)){
			$fname = 'threats/'.$case.'/'.$threat;
	                system('rm -rf '.$fname);
		}
	}

	if(file_exists('threats/json/'.$user)){
		$jsons = scandir('threats/json/'.$user);
		unset($jsons[array_search(".",$jsons)]);
	        unset($jsons[array_search("..",$jsons)]);
		if(count($jsons) > 0){
			$cmd = 'rm threats/json/'.$user.'/*.json';
			system($cmd);
		}
	}
	echo "All Threats Deleted";
}
else{
	echo "Sum Ting Wong";
}

?>
