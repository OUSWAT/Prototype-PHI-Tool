<?php

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

// init vars
date_default_timezone_set('UTC');
// http://blobert.protect.nssl/RadarQC/phi_new/realtime/ewp/getObjectDisc.php?objID=273789&now=1492895790&type=probSevere&archive=BMX&site=KBMX&key=maxllaz&analysis=false&user=Karstens
$objID = isset($_GET["objID"]) ? $_GET["objID"] : "273789";
$now = isset($_GET["now"]) ? $_GET["now"] : "1492895790";
$type = isset($_GET["type"]) ? $_GET["type"] : "probSevere";
$archive = isset($_GET["archive"]) ? $_GET["archive"] : "0";
$site = isset($_GET["site"]) ? $_GET["site"] : "KABR";
$key = isset($_GET["key"]) ? $_GET["key"] : "maxllaz";
$user = isset($_GET["user"]) ? $_GET["user"] : "Karstens";
$analysis = isset($_GET["analysis"]) ? $_GET["analysis"] : "false";
$legacy = isset($_GET["legacy"]) ? $_GET["legacy"] : "false";
$probSevereKeys = array("cape","shear","mesh","growth","glaciation","flashRate","lightningJump");
$azShearKeys = array("3-6kmAGL");
$lightningKeys = array("totalLightning","nldnCG_count","eniIC_count");

$nowCheck = $now;
if($analysis == "true"){
	$nowCheck = 9999999999;
}

// determine path to object files
if($analysis == "true"){
	$path = "../../archive/".$archive."/".$site."/phiObjects/objects";
}
elseif($archive == 0 || !is_numeric($archive)){
	$path = "threats";
}
else{
	$path = "../../threats/".$archive;
}

// determine object file for reading attributes
$times = array();
$data = array();
$discs = array();
$objFiles = array();
$objFile = "";
$objIDLast = $objID;
$idsNotEqual = true;
while($idsNotEqual){
	$files = array_diff(scandir($path), array('..', '.'));
	foreach($files as $f){
		// Karstens-severe_20170208-172739_0000001.json
		$e = explode("_",$f);
		$e2 = explode(".",$e[2]);
		$e3 = explode("-",$e[0]);
		$t = substr($e[1],0,4)."-".substr($e[1],4,2)."-".substr($e[1],6,2)." ".substr($e[1],9,2).":".substr($e[1],11,2).":".substr($e[1],13,2)." UTC";
               	$fTime = strtotime($t);
                if(abs($fTime - $now) > 86400){
                       	continue;
                }
                elseif($e2[0] == $objIDLast && $e3[0] == $user || $legacy == "true" && $e2[0] == $objIDLast && $e3[1] == $type){
			$objFile = $f;
			break;
		}
	}

	// extract discussion
	$lines = file($path."/".$objFile) or die("");
	if($archive == 0){
		$lineCount = count($lines);
	}
	else{
		$lineCount = 0;
		foreach($lines as $line){
			$geojson = json_decode(trim($line), true);
		        if($geojson["properties"]["data"]["valid_start"] <= $nowCheck){
				$lineCount++;
			}
		}
		$lines = file($path."/".$objFile);
	}

	$c = 0;
	$issues = array();
	foreach($lines as $line){
		$c++;
		$geojson = json_decode(trim($line), true);
		if($geojson["properties"]["data"]["valid_start"] <= $nowCheck && !in_array($geojson["properties"]["data"]["issue"],$issues) && !in_array($geojson["properties"]["data"]["discussion"],$discs)){
			$issues[] = $geojson["properties"]["data"]["issue"];
			$discs[] = $geojson["properties"]["data"]["discussion"];
			$min = round(($geojson["properties"]["data"]["issue"] - $now) / 60);
			if($min <= 0){
				$minAgo = " (".abs($min)." min. ago)";
			}
			else{
				$minAgo = " (".$min." min. from now)";
			}
			if($legacy == "true"){
				if($geojson["properties"]["data"]["elements"]["alertLevel"] == "beAware"){
					$data[$geojson["properties"]["data"]["issue"]] = $geojson["properties"]["data"]["discussion"]."||".max($geojson["properties"]["data"]["probs"][0]);
				}
				else{
					$data[$geojson["properties"]["data"]["issue"]] = "|".$geojson["properties"]["data"]["discussion"]."|".max($geojson["properties"]["data"]["probs"][0]);
				}
			}
			else{
				if($geojson["properties"]["data"]["elements"]["alertLevel"] == "beAware"){
                                       	$product = "Advisory";
                               	}
                                else{
                                       	$product = "Warning";
                                }
                                if($geojson["properties"]["data"]["types"][0] == "severe1"){
                                        $d = explode("|",$geojson["properties"]["data"]["elements"]["severity"]);
                                        $tags = @$d[0]."\"/".@$d[1]." mph";
                                }
				elseif($geojson["properties"]["data"]["elements"]["severity"] == "sparseLightning"){
					$tags = "occasionalLightning";
				}
				elseif($geojson["properties"]["data"]["elements"]["severity"] == "strongTornado"){
                                        $tags = "considerableTornado";
                               	}
				elseif($geojson["properties"]["data"]["elements"]["severity"] == "violentTornado"){
                                        $tags = "catastrophicTornado";
                               	}
                                else{
                                        $tags = $geojson["properties"]["data"]["elements"]["severity"];
                                }
                               	$tags = $tags."/".$geojson["properties"]["data"]["elements"]["source"]."/".$geojson["properties"]["data"]["prediction"];
                               	$txt = $product.": Issued At ".date("H:i",$geojson["properties"]["data"]["issue"])." UTC".$minAgo."&#13;Tags: ".$tags."&#13;Discussion: ".$geojson["properties"]["data"]["discussion"];
                               	$data[$geojson["properties"]["data"]["issue"]] = $txt;
			}
		}
		$lastID = $geojson["properties"]["data"]["recommender_id"];
	}
	if($lastID == $objIDLast || $lastID == -999){
		$idsNotEqual = false;
	}
	$objIDLast = $lastID;
}

// dump info
if($legacy == "true"){
	if(empty($data)){
               	echo "{}";
       	}
       	else{
		$out = json_encode($data);
		echo $out."\n";
       	}
}
else{
	if(empty($data)){
		echo "";
	}
	else{
		$keys = array_keys($data);
		rsort($keys);
		$a = array();
		foreach($keys as $key){
			$a[] = $data[$key];
		}
		echo implode("&#13;&#13;",$a);
	}
}

?>
