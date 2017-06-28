<?php

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

// init vars
date_default_timezone_set('UTC');
$objID = isset($_GET["objID"]) ? $_GET["objID"] : "327610";
$now = isset($_GET["now"]) ? $_GET["now"] : "1462832820";
$type = isset($_GET["type"]) ? $_GET["type"] : "probSevere";
$archive = isset($_GET["archive"]) ? $_GET["archive"] : "20160509";
$site = isset($_GET["site"]) ? $_GET["site"] : "KTLX";
$key = isset($_GET["key"]) ? $_GET["key"] : "probability";
$user = isset($_GET["user"]) ? $_GET["user"] : "ewp1";
$analysis = isset($_GET["analysis"]) ? $_GET["analysis"] : "false";

// take inputs and call getObjectInfo.php to get full automated trend
$path = getcwd();
$data1 = exec("php ".$path."/getObjectInfo.php objID=".$objID." now=".$now." type=".$type." archive=".$archive." site=".$site." key=".$key." analysis=".$analysis);

// take output from getObjectInfo.php and feed times into getObjectInfoMod.php
$txt1 = explode("|",trim($data1));
$autoProbs = explode(",",$txt1[1]);
$data2 = exec("php ".$path."/getObjectInfoMod.php objID=".$objID." now=".$now." type=".$type." archive=".$archive." site=".$site." key=".$key." user=".$user." inTimes=".$txt1[0]." analysis=".$analysis);
echo "php ".$path."/getObjectInfoMod.php objID=".$objID." now=".$now." type=".$type." archive=".$archive." site=".$site." key=".$key." user=".$user." inTimes=".$txt1[0]." analysis=".$analysis."\n";
die();

// replace non-null values from getObjectInfoMod.php in getObjectInfo.php values.
print_r($data2);
die();
$txt2 = explode("|",trim($data2));
print_r($txt2);
die();
$times = explode(",",$txt2[0]);
$modProbs = explode(",",$txt2[1]);
for($i=0;$i<count($modProbs);$i++){
	if($modProbs[$i] != "null" || ($modProbs[$i] == "null" && $times[$i] > 0)){
		$autoProbs[$i] = $modProbs[$i];
	}
}

// return to jonathan
echo implode(",",$times)."|".implode(",",$autoProbs);

?>
