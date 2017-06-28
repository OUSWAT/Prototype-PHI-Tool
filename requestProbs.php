<?php

date_default_timezone_set('UTC');

$user = isset($_GET["user"]) ? $_GET["user"] : "Karstens";
$ensemble = isset($_GET["ensemble"]) ? $_GET["ensemble"] : "nsslwrf";
$members = isset($_GET["members"]) ? $_GET["members"] : "ssef_s4m12_arw,ssef_s4m13_arw,ssef_s4m14_arw,ssef_s4m15_arw,ssef_s4m16_arw,ssef_s4m17_arw,ssef_s4m18_arw,ssef_s4m19_arw,ssef_s4m20_arw,ssef_s4m21_arw";
$fstart = isset($_GET["fstart"]) ? $_GET["fstart"] : "18";
$fend = isset($_GET["fend"]) ? $_GET["fend"] : "19";
$issueType = isset($_GET["issueType"]) ? $_GET["issueType"] : "";
$hazType = isset($_GET["hazType"]) ? $_GET["hazType"] : "";
$fields = isset($_GET["fields"]) ? $_GET["fields"] : "uh1";
$operators = isset($_GET["operators"]) ? $_GET["operators"] : "greaterThan";
$thresholds = isset($_GET["thresholds"]) ? $_GET["thresholds"] : "75,1,45";
$roi = isset($_GET["roi"]) ? $_GET["roi"] : "25";
$sigma = isset($_GET["sigma"]) ? $_GET["sigma"] : "10";
$levels = isset($_GET["levels"]) ? $_GET["levels"] : "2,5,10,15,30,45,60";
//$path = getcwd();
$path = "/var/www/html/RadarQC/phi_new";

if(!empty($user)){
	$t = explode(",",$thresholds);
	$initTime = date("Ymd")."00";
	//$cmd = "/localdata/radarqc/efpProbs.py -u ".$user." -E ".$ensemble." -m ".$members." -s ".$fstart." -e ".$fend." -p ".$path." -H ".$hazType." -i ".$issueType;
	//$cmd = $cmd." -f ".$fields." -o ".$operators." -t ".$thresholds." -r ".$roi." -S ".$sigma." -L ".$levels." >& ".$path."/realtime/efp/logs/errorLog_".$user.".txt &";
	$fname = $ensemble."_".$fstart."_".$fend."_".$t[0]."_".$t[1]."_".$t[2]."_".$roi."_".$sigma.".json";
	$cmd = "cp ".$path."/realtime/efp/automation/".$initTime."/".$fname." ".$path."/realtime/efp/geoJSON/".$user.".json";
	echo $cmd;
	$c = system($cmd);
	system("chmod 777 ".$path."/realtime/efp/geoJSON/".$user.".json");
	//echo "Data received!";
}
else{
	echo "Sum Ting Wong";
}

?>
