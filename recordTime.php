<?php

date_default_timezone_set('UTC');

$user = isset($_GET["user"]) ? $_GET["user"] : "";
$case = isset($_GET["case"]) ? $_GET["case"] : "";
$site = isset($_GET["site"]) ? $_GET["site"] : "";
$inTime = isset($_GET["inTime"]) ? $_GET["inTime"] : "";

if(!empty($case)){
	if(is_numeric($case)){
		if(!empty($user) && !empty($site) && $inTime >= 0){
			$fh = fopen("time_logs/".$case."_".$site."_".$user.".txt","w");
			fwrite($fh,$inTime);
			fclose($fh);
			chmod("time_logs/".$case."_".$site."_".$user.".txt", 0777);
		}
	}

}

?>
