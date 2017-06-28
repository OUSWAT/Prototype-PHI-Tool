<?php

date_default_timezone_set('UTC');

$case = isset($_GET["case"]) ? $_GET["case"] : "";
$site = isset($_GET["site"]) ? $_GET["site"] : "";
$product = isset($_GET["product"]) ? $_GET["product"] : "Reflectivity";
$last = isset($_GET["last"]) ? $_GET["last"] : "";
$user = isset($_GET["user"]) ? $_GET["user"] : "";
$validProbMinSevere = isset($_GET["validProbMinSevere"]) ? $_GET["validProbMinSevere"] : "";
$validProbMaxSevere = isset($_GET["validProbMaxSevere"]) ? $_GET["validProbMaxSevere"] : "";
$validProbMinTornado = isset($_GET["validProbMinTornado"]) ? $_GET["validProbMinTornado"] : "";
$validProbMaxTornado = isset($_GET["validProbMaxTornado"]) ? $_GET["validProbMaxTornado"] : "";
$validProbMinLightning = isset($_GET["validProbMinLightning"]) ? $_GET["validProbMinLightning"] : "";
$validProbMaxLightning = isset($_GET["validProbMaxLightning"]) ? $_GET["validProbMaxLightning"] : "";
$autoSpdSevere = isset($_GET["autoSpdSevere"]) ? $_GET["autoSpdSevere"] : "";
$autoDirSevere = isset($_GET["autoDirSevere"]) ? $_GET["autoDirSevere"] : "";
$autoSpdTornado = isset($_GET["autoSpdTornado"]) ? $_GET["autoSpdTornado"] : "";
$autoDirTornado = isset($_GET["autoDirTornado"]) ? $_GET["autoDirTornado"] : "";
$autoSpdLightning = isset($_GET["autoSpdLightning"]) ? $_GET["autoSpdLightning"] : "";
$autoDirLightning = isset($_GET["autoDirLightning"]) ? $_GET["autoDirLightning"] : "";

if(!empty($last)){
        $d = explode("_",$last);
        $t = str_split($d[1]);
        $lastTime = strtotime($t[0].$t[1].$t[2].$t[3]."-".$t[4].$t[5]."-".$t[6].$t[7]." ".$t[9].$t[10].":".$t[11].$t[12].":".$t[13].$t[14]);
}
else{
        $lastTime = strtotime(date("Y-m-d H:i:s"));
}

$thresh = 100;

if($product == "PHI-Tornado"){
	$toGet = "tornado";
	$product = "PHI";
}
elseif($product == "PHI-Severe"){
	$toGet = "severe";
        $product = "PHI";
}
elseif($product == "PHI-Lightning"){
        $toGet = "lightning";
        $product = "PHI";
}

else{
	$toGet = "";
}


if(!empty($last)){
	// check for floater update - if so, pass along new info and replace copy
	$phiInfo = "realtime/ewp/PHI_Floater_Info.txt";
	$phiCopy = "realtime/ewp/PHI_Floater_Info_Copy.txt";
	$info = file($phiInfo);
	$copy = file($phiCopy);
	if($copy != $info){
		foreach($info as $line){
			echo $line;
		}
		copy($phiInfo,$phiCopy);
		return;
	}
}

// see if the valid probs have updated (from another user)
$validPath = "validProbs/range";
$files = array_reverse(array_diff(scandir($validPath), array('..', '.')));
if(substr($user,0,3) == "ewp"){
	$user = "ewp";
}
$foundTornado = false;
$foundSevere = false;
$foundLightning = false;
foreach($files as $f){
        $e = explode("_",$f);
        $e2 = explode("-",$e[0]);
	$t = substr($e[1],0,4)."-".substr($e[1],4,2)."-".substr($e[1],6,2)." ".substr($e[1],9,2).":".substr($e[1],11,2).":".substr($e[1],13,2)." UTC";
       	$fTime = strtotime($t);
	if(($lastTime - $fTime) > 10800 || ($lastTime - $fTime) < 0){
		continue;
	}
        if($e2[0] == $user && $e2[1] == "severe"){
                $log = $validPath."/".$f;
                $data = file($log);
                $s = explode(",",trim($data[0]));
		if($s[0] != $validProbMinSevere || $s[1] != $validProbMaxSevere || $s[2] != $autoSpdSevere || $s[3] != $autoDirSevere){
			$validProbMinSevere = $s[0];
			$validProbMaxSevere = $s[1];
			$autoSpdSevere = $s[2];
			$autoDirSevere = $s[3];
	                $foundSevere = true;
		}
                break;
        }
	elseif($e2[0] == $user && $e2[1] == "tornado"){
                $log = $validPath."/".$f;
                $data = file($log);
                $s = explode(",",trim($data[0]));
                if($s[0] != $validProbMinTornado || $s[1] != $validProbMaxTornado || $s[2] != $autoSpdTornado || $s[3] != $autoDirTornado){
                       	$validProbMinTornado = $s[0];
                       	$validProbMaxTornado = $s[1];
			$autoSpdTornado = $s[2];
                       	$autoDirTornado = $s[3];
                        $foundTornado = true;
               	}
                break;
        }
	elseif($e2[0] == $user && $e2[1] == "lightning"){
                $log = $validPath."/".$f;
                $data = file($log);
                $s = explode(",",trim($data[0]));
                if($s[0] != $validProbMinLightning || $s[1] != $validProbMaxLightning || $s[2] != $autoSpdLightning || $s[3] != $autoDirLightning){
                        $validProbMinLightning = $s[0];
                        $validProbMaxLightning = $s[1];
			$autoSpdLightning = $s[2];
                       	$autoDirLightning = $s[3];
                        $foundLightning = true;
                }
                break;
        }
}
if($foundSevere){
	echo "severe,".$validProbMinSevere.",".$validProbMaxSevere.",".$autoSpdSevere.",".$autoDirSevere;
	die();
}
elseif($foundTornado){
       	echo "tornado,".$validProbMinTornado.",".$validProbMaxTornado.",".$autoSpdTornado.",".$autoDirTornado;
	die();
}
elseif($foundTornado){
        echo "lightning,".$validProbMinLightning.",".$validProbMaxLightning.",".$autoSpdLightning.",".$autoDirLightning;
        die();
}


// else process request for radar imagery
if(is_numeric($case)){
	$images = scandir("archive/".$case."/".$site."/".$product);
}
else{
	$images = scandir("realtime/ewp/floater/".$product);
}
//print_r($images);
unset($images[array_search('.',$images)]);
unset($images[array_search('..',$images)]);
//array_reverse($images);
$e = explode(".",gethostname());
$host = $e[0];
if(strpos($host,"ewp")){
	$host = "ewp";
}
// KRAX_20140227-155244_ReflectivityQC_00.50.png
$imCount = 0;
$siteImages = array();
if(!empty($last)){
	$d = explode("_",$last);
	$t = str_split($d[1]);
	$lastTime = strtotime($t[0].$t[1].$t[2].$t[3]."-".$t[4].$t[5]."-".$t[6].$t[7]." ".$t[9].$t[10].":".$t[11].$t[12].":".$t[13].$t[14]);
	foreach($images as $im){
		if($product == "PHI" && strpos($im,$host) === false){
			//continue;
		}
                $split = explode("_",$im);
		$t = str_split($split[1]);
		$imTime = strtotime($t[0].$t[1].$t[2].$t[3]."-".$t[4].$t[5]."-".$t[6].$t[7]." ".$t[9].$t[10].":".$t[11].$t[12].":".$t[13].$t[14]);
                if($split[0] == $site && $imTime > $lastTime || $split[0] == "Floater" && $imTime > $lastTime){
			if($product == "PHI" && strpos($im,$toGet) === false){
				continue;
			}
                        $siteImages[] = $im;
			$imCount++;
			if($imCount > $thresh){
				//break;
			}
               	}
       	}
}
else{
	//array_reverse($images);
	foreach($images as $im){
		if($product == "PHI" && strpos($im,$host) === false){
                        //continue;
                }
		$split = explode("_",$im);
		if($split[0] == $site || $split[0] == "Floater"){
			if($product == "PHI" && strpos($im,$toGet) === false){
                                continue;
                        }
                        $siteImages[] = $im;
			$imCount++;
                        if($imCount > $thresh){
                                //break;
                        }
		}
	}
}


//array_reverse($siteImages);

echo implode(",",$siteImages);

?>
