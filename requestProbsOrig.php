<?php

date_default_timezone_set('UTC');

$user = isset($_GET["user"]) ? $_GET["user"] : "Karstens";
$ensemble = isset($_GET["ensemble"]) ? $_GET["ensemble"] : "caps";
$members = isset($_GET["members"]) ? $_GET["members"] : "ssef_s4m12_arw,ssef_s4m13_arw,ssef_s4m14_arw,ssef_s4m15_arw,ssef_s4m16_arw,ssef_s4m17_arw,ssef_s4m18_arw,ssef_s4m19_arw,ssef_s4m20_arw,ssef_s4m21_arw";
$fstart = isset($_GET["fstart"]) ? $_GET["fstart"] : "21";
$fend = isset($_GET["fend"]) ? $_GET["fend"] : "24";
$issueType = isset($_GET["issueType"]) ? $_GET["issueType"] : "";
$hazType = isset($_GET["hazType"]) ? $_GET["hazType"] : "";
$fields = isset($_GET["fields"]) ? $_GET["fields"] : "uh1";
$operators = isset($_GET["operators"]) ? $_GET["operators"] : "greaterThan";
$thresholds = isset($_GET["thresholds"]) ? $_GET["thresholds"] : "75";
$roi = isset($_GET["roi"]) ? $_GET["roi"] : "25";
$sigma = isset($_GET["sigma"]) ? $_GET["sigma"] : "10";
$levels = isset($_GET["levels"]) ? $_GET["levels"] : "2,5,10,15,30,45,60";
//$path = getcwd();
$path = "/var/www/html/RadarQC/phi_new";

if(!empty($user)){
	//$fh = fopen('threats/'.$case.'/'.ucfirst($threat).'_ID'.$id.'_'.$user.'.txt','a');
	//fwrite($fh,$geojson."\n");
	//fclose($fh);
	putenv("LD_LIBRARY_PATH");
        putenv("GEOS_DIR");
	putenv("LD_LIBRARY_PATH=/mnt/home/radarqc/WDSS2/lib:/mnt/home/radarqc/MSG31/lib/lnux_x86:/mnt/home/radarqc/tomcat/shared/lib:/usr/local/lib:/usr/lib");
	putenv("GEOS_DIR=/usr/local/lib");
	$cmd = "/localdata/radarqc/efpProbs.py -u ".$user." -E ".$ensemble." -m ".$members." -s ".$fstart." -e ".$fend." -p ".$path." -H ".$hazType." -i ".$issueType;
	$cmd = $cmd." -f ".$fields." -o ".$operators." -t ".$thresholds." -r ".$roi." -S ".$sigma." -L ".$levels." >& ".$path."/realtime/efp/logs/errorLog_".$user.".txt &";
	$c = system($cmd);
	echo "Data received!";
}
else{
	echo "Sum Ting Wong";
}

?>
