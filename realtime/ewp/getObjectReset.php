<?php

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

// init vars
date_default_timezone_set('UTC');
$objID = isset($_GET["objID"]) ? $_GET["objID"] : "247390";
$now = isset($_GET["now"]) ? $_GET["now"] : "1461878400";
$type = isset($_GET["type"]) ? $_GET["type"] : "probSevere";
$archive = isset($_GET["archive"]) ? $_GET["archive"] : "0";
$site = isset($_GET["site"]) ? $_GET["site"] : "KABR";

// initialize output json
$json = array();
$json["type"] = "FeatureCollection";
$json["features"] = array();

// determine path to object files
if(is_numeric($archive)){
        if($type == "probSevere"){
                $path = "../../archive/".$archive."/".$site."/probSevereObjects/objects";
        }
        elseif($type == "azShear"){
                $path = "../../archive/".$archive."/".$site."/azShearObjects/objects";
        }
        elseif($type == "lightning"){
                $path = "../../archive/".$archive."/".$site."/lightningObjects/objects";
        }
        else{
                $path = "../../threats/".$archive;
        }
}
else{
        if($type == "probSevere"){
                $path = "floater/probSevereObjects/objects";
        }
	elseif($type == "azShear"){
                $path = "floater/azShearObjects/objects";
        }
	elseif($type == "lightning"){
                $path = "floater/lightningObjects/objects";
        }
	else{
             	$path = "threats";
        }
}


// determine object file for reading attributes
$objFile = "";
$files = array_diff(scandir($path), array('..', '.'));
foreach($files as $f){
	// Karstens-severe_20170208-172739_0000001.json
	$e = explode("_",$f);
	$e2 = explode(".",$e[2]);
	if($e2[0] == $objID){
		$objFile = $f;
		break;
	}
}

// dump null array if file is not found
if(empty($objFile)){
	$out = json_encode($json);
	echo $out;
}

// extract discussion
$lines = array_reverse(file($path."/".$objFile));
foreach($lines as $line){
	$geojson = json_decode(trim($line), true);
	if($geojson["properties"]["data"]["valid_start"] > $now){
		continue;
	}
	$json["features"][] = $geojson;
	break;
}

// dump json array
$out = json_encode($json);
echo $out;

?>
