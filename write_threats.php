<?php

date_default_timezone_set('UTC');

$geojson = isset($_GET["geojson"]) ? $_GET["geojson"] : '{"type":"Feature","properties":{"threatColor":"rgb(255,0,0)","data":{"id":0,"duration":45,"threatColor":"rgb(255,0,0)","timeDiff":1280,"issue":1369080108,"types":["tornado1"],"valid_start":1369079981,"valid_end":1369082681,"probs":[[80,78,67,66,57,51,47,45,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35]],"speeds":[21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21],"dirs":[256,256,256,256,256,256,256,256,256,256,256,256,256,256,256,256,256,256,256,256,256,256,256,256,256],"dirs_orig":[382,382,382,382,382,382,382,382,382,382,382,382,382,382,382,382,382,382,382,382,382,382,382,382,382],"dir":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],"spd":[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],"discussion":""}},"geometry":{"type":"Polygon","coordinates":[[[-97.7620106103868,34.55527202431961],[-97.77833278486169,34.550782365316834],[-97.79510069365867,34.5482747863044],[-97.81190145521357,34.54781121270848],[-97.82832137901839,34.54940309322465],[-97.84395615205455,34.553011114591705],[-97.85842079432098,34.55854618094256],[-97.87135913831972,34.5658716325122],[-97.8824525990816,34.574806646642244],[-97.89142801878555,34.58513073382492],[-97.89806439281088,34.596589213820636],[-97.90219831160405,34.60889953242196],[-97.90372798436475,34.62175825885569],[-97.90261574547297,34.63484858760897],[-97.89888898194147,34.64784815698485],[-97.8926394590568,34.66043699012174],[-97.88402106081347,34.67230536260121],[-97.87324600077896,34.683161404013326],[-97.86057959669166,34.692738248732674],[-97.84633373745767,34.70080056335512],[-97.83085920341061,34.7071502943464],[-97.81453702893567,34.71163149898607],[-97.79776912013877,34.71413414514363],[-97.78096835858389,34.71459679025401],[-97.76454843477894,34.71300807650821],[-97.74891366174289,34.709407007182456],[-97.73444901947647,34.70388199763098],[-97.72151067547763,34.69656872319063],[-97.71041721471585,34.68764681453859],[-97.70144179501185,34.67733547832724],[-97.6948054209866,34.66588814664169],[-97.69067150219338,34.65358628241373],[-97.68914182943261,34.6407324888422],[-97.69025406832449,34.62764308857583],[-97.69398083185598,34.61464035242476],[-97.70023035474054,34.60204456723727],[-97.70884875298397,34.590166137948195],[-97.71962381301852,34.579297919399515],[-97.73229021710574,34.569707969200756],[-97.74653607633975,34.561632903611795],[-97.7620106103868,34.55527202431961]]]}}';
$threat = isset($_GET["threat"]) ? $_GET["threat"] : "Tornado1";
$case = isset($_GET["case"]) ? $_GET["case"] : "20130520";
$id = isset($_GET["id"]) ? $_GET["id"] : "0";
$user = isset($_GET["user"]) ? $_GET["user"] : "Karstens";
$state = isset($_GET["state"]) ? $_GET["state"] : "";
$inputTime = isset($_GET["inputTime"]) ? $_GET["inputTime"] : "1369079981";
//$path = "/var/www/html/RadarQC/phi_dev";
$path = getcwd();

if(!empty($case)){

	$tStamp = date("Ymd-His",$inputTime);
	$fname = $user."-".substr($threat,0,-1)."_".$tStamp."_".sprintf("%07d", $id).".json";
	if(is_numeric($case)){
		//$log = $path.'/threats/'.$case.'/'.ucfirst($threat).'_ID'.$id.'_'.$user.'.txt';
		$files = array_diff(scandir($path.'/threats/'.$case), array('..', '.'));
                foreach($files as $f){
                        // Karstens-severe_20150419-133848_338926.json
                        $d = explode("_",$f);
                        $d2 = explode(".",$d[2]);
			$d3 = explode("-",$d[0]);
			if($d2[0] == $id && $d3[1] == substr($threat,0,-1) && $d3[0] == $user){
                                $fname = $f;
				break;
                        }
                }
		$log = $path.'/threats/'.$case.'/'.$fname;
	}
	else{
		//$log = $path.'/realtime/ewp/threats/'.ucfirst($threat).'_ID'.$id.'_'.$user.'.txt';
		$files = array_diff(scandir($path.'/realtime/ewp/threats'), array('..', '.'));
		foreach($files as $f){
			// Karstens-severe_20150419-133848_338926.json
			$d = explode("_",$f);
			$d2 = explode(".",$d[2]);
			$d3 = explode("-",$d[0]);
			if($d2[0] == $id && $d3[1] == substr($threat,0,-1) && $d3[0] == $user){
				$fname = $f;
				break;
			}
		}
		$log = $path.'/realtime/ewp/threats/'.$fname;
	}
	$fh = fopen($log,'a');
	fwrite($fh,$geojson."\n");
	fclose($fh);
	system("chmod 777 ".$log);
	/*
	if(empty($state)){
		putenv("LD_LIBRARY_PATH");
                putenv("GEOS_DIR");
		putenv("LD_LIBRARY_PATH=/mnt/home/radarqc/WDSS2/lib:/mnt/home/radarqc/MSG31/lib/lnux_x86:/mnt/home/radarqc/tomcat/shared/lib:/usr/local/lib:/usr/lib");
		putenv("GEOS_DIR=/usr/local/lib");
		if(is_numeric($case)){
			$cmd = "/localdata/radarqc/engine.py -i ".$log." -u ".$user." -t ".$inputTime." -n >& ".$path."/threats/engine_out.txt &";
		}
		else{
			$cmd = "/localdata/radarqc/engine.py -i ".$log." -u ".$user." -t ".$inputTime." -n -r >& ".$path."/threats/engine_out.txt &";
		}
		$c = system($cmd);
	}
	*/
	echo "Data received!";
}
else{
	echo "Ruh Roh";
}

?>
