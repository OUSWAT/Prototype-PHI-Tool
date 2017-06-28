<?php

//date_default_timezone_set('UTC');
date_default_timezone_set('America/Denver');

$geojson = isset($_GET["geojson"]) ? $_GET["geojson"] : '{"type":"Feature","properties":{"probID":1,"modified":"true","hazType":"tornado","issueType":"afternoon","fStart":"18","fEnd":"19","color":"rgb(0,20,234)","prob":"2","discussion":"","user":"Karstens"},"geometry":{"type":"Polygon","coordinates":[[[-107.13916033507287,40.091953230945606],[-98.30615252256959,47.321335253923266],[-87.23193377256884,42.824830640699254],[-93.73584002257239,35.11677687584408],[-102.12939471007302,35.33216980974672],[-104.94189471006852,36.71820495883429],[-107.13916033507287,40.091953230945606]]]}}';
$first = isset($_GET["first"]) ? $_GET["first"] : "";
$last = isset($_GET["last"]) ? $_GET["last"] : "";
//$path = "/var/www/html/RadarQC/phi_new";
$path = getcwd();

if(!empty($geojson)){
	$json = json_decode($geojson);
	$json2 = json_decode($geojson, true);
	$issueType = $json->properties->issueType;
	$hazType = $json->properties->hazType;
	$fStart = $json->properties->fStart;
	$fEnd = $json->properties->fEnd;
	$user = $json->properties->user;
	$s = explode("-",$user);
	$desk = @$s[1];

	$headerArray = array();
	$valueArray = array();
	ksort($json2['properties']);
	foreach($json2['properties'] as $h => $v){
		$headerArray[] = $h;
		if($h == "members" || $h == "fields" || $h == "thresholds" || $h == "operators"){
			$valueArray[] = implode("|",$v);
		}
		elseif($h == "discussion"){
			$v = str_replace(",","",$v);
			$v = str_replace("|","",$v);
			$valueArray[] = $v;
		}
		else{
			$valueArray[] = $v;
		}
	}
	$header = implode(",",$headerArray);
	$txt = implode(",",$valueArray);

	$coordsArray = array();
	foreach($json->geometry->coordinates as $c1){
		if($desk == "NSSL"){
			$coordsArray[] = $c1[0];
			$coordsArray[] = $c1[1];
		}
		else{
			foreach($c1 as $c2){
				$coordsArray[] = $c2[0];
				$coordsArray[] = $c2[1];
			}
		}
	}

	$header = $header.",coords";
	$txt = $txt.",".implode("|",$coordsArray);

	$now = date("Ymd");
	$log = $issueType."_".$fStart."_".$fEnd."_".$hazType."_".$user.".json";
	$log2 = $issueType."_".$fStart."_".$fEnd."_".$hazType."_".$user.".txt";

	system("mkdir -p realtime/efp/products/".$now);
	system("chmod 777 realtime/efp/products/".$now);

	if(file_exists("realtime/efp/products/".$now."/".$log) && !empty($first)){
		system("rm realtime/efp/products/".$now."/".$log);
	}
	$fh = fopen("realtime/efp/products/".$now."/".$log,'a');
        fwrite($fh,$geojson."\n");
        fclose($fh);

	system("chmod 777 realtime/efp/products/".$now."/".$log);

	if(file_exists("realtime/efp/products/".$now."/".$log2) && !empty($first)){
                system("rm realtime/efp/products/".$now."/".$log2);
		$fh = fopen("realtime/efp/products/".$now."/".$log2,'a');
	        fwrite($fh,$header."\n");
	        fclose($fh);
        }
	elseif(!empty($first)){
		$fh = fopen("realtime/efp/products/".$now."/".$log2,'a');
                fwrite($fh,$header."\n");
                fclose($fh);
	}
        $fh = fopen("realtime/efp/products/".$now."/".$log2,'a');
        fwrite($fh,$txt."\n");
        fclose($fh);

	system("chmod 777 realtime/efp/products/".$now."/".$log2);

	if(!empty($last)){
		// generate kml
		//$cmd = "/localdata/radarqc/EFPkml.py -i ".$path."/realtime/efp/products/".$now."/".$log;
		//$c = system($cmd);
	}

	/*
	putenv("LD_LIBRARY_PATH");
        putenv("GEOS_DIR");
	putenv("LD_LIBRARY_PATH=/mnt/home/radarqc/WDSS2/lib:/mnt/home/radarqc/MSG31/lib/lnux_x86:/mnt/home/radarqc/tomcat/shared/lib:/usr/local/lib:/usr/lib");
	putenv("GEOS_DIR=/usr/local/lib");
	$cmd = "/localdata/radarqc/EFP_engine.py -i ".$log." -u ".$user." -t ".$inputTime." -g >& ".$path."/threats/engine_out.txt &";
	$c = system($cmd);
	echo "Data received!";
	*/
}
else{
	echo "idk";
}

?>
