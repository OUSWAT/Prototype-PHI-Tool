<?php

$user = isset($_GET["user"]) ? $_GET["user"] : "Karstens";

$logs = scandir("realtime/ewp/threats");
unset($logs[array_search('.',$logs)]);
unset($logs[array_search('..',$logs)]);

$id = 0;
foreach($logs as $log){
	$split = explode("_",$log);
	$tempID = substr($split[1],2);
	if($split[2] == $user.".txt" && $tempID > $id){
		$id = $tempID;
	}
}

$id++;
echo $id;

?>
