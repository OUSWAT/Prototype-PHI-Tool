<?php

$radius1 = isset($_GET["radius1"]) ? $_GET["radius1"] : "1";
$radius2 = isset($_GET["radius2"]) ? $_GET["radius2"] : "0";
$radius3 = isset($_GET["radius3"]) ? $_GET["radius3"] : "0";

putenv("TZ=UTC");
date_default_timezone_set('UTC');
header('Content-type: text/plain');

//predefined variables

$sec_allow = 20;
$sec_allow2 = 60;
$sec_allow3 = 80;
$sec_allow4 = 120;

//placefile header

echo "Title: TWISTEX Mesonet Obs 
RefreshSeconds: 002
IconFile: 1, 20, 49, 1, 48, \"C:/twistex/white_barbs.png\"
IconFile: 2, 15, 25, 8, 25, \"C:/twistex/arrows.png\"
IconFile: 3, 22, 22, 11, 11, \"C:/twistex/markers.png\"
IconFile: 4, 20, 49, 1, 48, \"C:/twistex/white_barbs_crumb.png\"
IconFile: 5, 15, 25, 8, 25, \"C:/twistex/arrows_crumb.png\"
IconFile: 6, 22, 22, 11, 11, \"C:/twistex/markers_crumb.png\"
Font: 1, 15, 1, \"Times\"
Color: 250 250 250

";

//get current time in seconds

$get_now_time = date('H:i:s');
$now_time = strtotime($get_now_time);

$a = -1;
$link2 = "C:/php/60.txt";
if(filesize($link2) > 0){
	$data = file($link2);
	foreach ($data as $line) {
		 $a++;
		 $mm = explode (",",trim($line));
		 
		 if($a <= 3){

			 //latitude

			 $mm_lat = $mm[12];

			 //longitude

			 $mm_lon = $mm[11]*-1;

		}

		 if($a == 0){
			  $m1_lat = $mm_lat;
			  $m1_lon = $mm_lon;
			  $id = "M1";
			  $mm_sym_60 = 7;
			  $mm_sym_20 = 4;
			  $mm_sym = 1;
		 }
		 if($a == 1){
			  $m2_lat = $mm_lat;
			  $m2_lon = $mm_lon;
			  $id = "M2";
			  $mm_sym_60 = 8;
			  $mm_sym_20 = 5;
			  $mm_sym = 2;
		 }
		 if($a == 2){
			  $m3_lat = $mm_lat;
			  $m3_lon = $mm_lon;
			  $id = "M3";
			  $mm_sym_60 = 9;
			  $mm_sym_20 = 6;
			  $mm_sym = 3;
		 }
		 if($a == 3){
			  $probe_lat = $mm_lat;
			  $probe_lon = $mm_lon;
			  $id = "Probe";
			  $mm_sym_60 = 12;
			  $mm_sym_20 = 11;
			  $mm_sym = 10;
		 }

		if($a <= 3){
			 //vehicle heading & time

			 $heading =  $mm[15];
			 $get_t = str_split($mm[2]);
			 $mm_time = "".$get_t[0]."".$get_t[1].":".$get_t[2]."".$get_t[3].":".$get_t[5]."".$get_t[6]."Z";
			 $get_mm_time = strtotime($mm_time);
			 $mm_time_diff = abs($now_time - $get_mm_time);
			 //echo "".$now_time.",".$get_mm_time.",".$mm_time_diff."\n";
			 if($mm_time_diff > $sec_allow3){
				  $mm_sym = $mm_sym_60;
			 }
			 if($mm_time_diff > $sec_allow3 && $mm_time_diff < $sec_allow4){
				  $mm_sym = $mm_sym_20;
			 }

			 //temp and dew point

			 $temp_round = round(((9/5)*$mm[4])+32,1);
			 $dew_point_round = round(((9/5)*$mm[9])+32,1);
			 $temp_round2 = round(((9/5)*$mm[4])+32,0);
			 $dew_point_round2 = round(((9/5)*$mm[9])+32,0);
			 
			 //pressure
			   
			 $pressure = round($mm[10],2);

			 //wind barbs
			   
			 $barb = round($mm[6]*1.0 ,2);
			 $wind_dir = round($mm[7],0);
				  
			 if (0 <= $barb && $barb < 2.5) {
				  $mag = 21;
			 }
			 elseif(2.5 <= $barb && $barb < 7.5) {
				  $mag = 1;
			 }
			 elseif(7.5 <= $barb && $barb < 12.5) {
				  $mag = 2;
			 }
			 elseif(12.5 <= $barb && $barb < 17.5) {
				  $mag = 3;
			 }
			 elseif(17.5 <= $barb && $barb < 22.5) {
				  $mag = 4;
			 }
			 elseif(22.5 <= $barb && $barb < 27.5) {
				  $mag = 5;
			 }
			 elseif(27.5 <= $barb && $barb < 32.5) {
				  $mag = 6;
			 }
			 elseif(32.5 <= $barb && $barb < 37.5) {
				  $mag = 7;
			 }
			 elseif(37.5 <= $barb && $barb < 42.5) {
				  $mag = 8;
			 }
			 elseif(42.5 <= $barb && $barb < 47.5) {
				  $mag = 9;
			 }
			 elseif(47.5 <= $barb && $barb < 52.5) {
				  $mag = 10;
			 }
			 elseif(52.5 <= $barb && $barb < 57.5) {
				  $mag = 11;
			 }
			 elseif(57.5 <= $barb && $barb < 62.5) {
				  $mag = 12;
			 }
			 elseif(62.5 <= $barb && $barb < 67.5) {
				  $mag = 13;
			 }
			 elseif(67.5 <= $barb && $barb < 72.5) {
				  $mag = 14;
			 }
			 elseif(72.5 <= $barb && $barb < 77.5) {
				  $mag = 15;
			 }
			 elseif(77.5 <= $barb && $barb < 82.5) {
				  $mag = 16;
			 }
			 elseif(82.5 <= $barb && $barb < 87.5) {
				  $mag = 17;
			 }
			 elseif(87.5 <= $barb && $barb < 92.5) {
				  $mag = 18;
			 }
			 elseif(92.5 <= $barb && $barb < 97.5) {
				  $mag = 19;
			 }
			 elseif(97.5 <= $barb && $barb < 102.5) {
				  $mag = 20;
			 }
			 elseif($barb > 102.5) {
				  $mag = 23;
			 }


			 //Prepare Statements

			 $line1 = "Threshold: 60";
			 $line2 = "Object: ".$mm_lat.",".$mm_lon." ";
			 $line3 = "  Icon: 0,0,".$wind_dir.",4,".$mag."\n  Threshold: 999";
			 $line4 = "  Icon: 0,0,".$heading.",5,7,";
			 $line5 = "  Icon: 0,0,0,6,$mm_sym, \"".$id." @ ".$mm_time."\\nTemp: ".$temp_round."F (Dew: ".$dew_point_round."F)\\nWind: ".$wind_dir." deg. @ ".$barb." kts\\n";
			 $line5_1 = "Pressure: ".$pressure." mb\"";
			 $line10 = " End:";

			 // Statement

			 if($a == 0){
				  $m1_string = "".$line1."\n".$line2."\n".$line3."\n".$line4."\n".$line5."".$line5_1."\n".$line10."\n\n";
			 }
			 if($a == 1){
				  $m2_string = "".$line1."\n".$line2."\n".$line3."\n".$line4."\n".$line5."".$line5_1."\n".$line10."\n\n";
			 }
			 if($a == 2){
				  $m3_string = "".$line1."\n".$line2."\n".$line3."\n".$line4."\n".$line5."".$line5_1."\n".$line10."\n\n";
			 }
			 if($a == 3){
				  $probe_string = "".$line1."\n".$line2."\n".$line3."\n".$line4."\n".$line5."".$line5_1."\n".$line10."\n\n";
			 }
		}
	}
	echo $m1_string;
	echo $m2_string;
	echo $m3_string;
	echo $probe_string;
}

$a = -1;
$link = "C:\php\concatenate.txt";
if(filesize($link) > 0){
	$data = file($link);
	foreach ($data as $line) {
		 $a++;
		 $mm = explode (",",trim($line));
		 
		 if($a <= 3){

			 //latitude

			 $mm_lat = $mm[12];

			 //longitude

			 $mm_lon = $mm[11]*-1;

		}

		 if($a == 0){
			  $m1_lat = $mm_lat;
			  $m1_lon = $mm_lon;
			  $id = "M1";
			  $mm_sym_60 = 7;
			  $mm_sym_20 = 4;
			  $mm_sym = 1;
		 }
		 if($a == 1){
			  $m2_lat = $mm_lat;
			  $m2_lon = $mm_lon;
			  $id = "M2";
			  $mm_sym_60 = 8;
			  $mm_sym_20 = 5;
			  $mm_sym = 2;
		 }
		 if($a == 2){
			  $m3_lat = $mm_lat;
			  $m3_lon = $mm_lon;
			  $id = "M3";
			  $mm_sym_60 = 9;
			  $mm_sym_20 = 6;
			  $mm_sym = 3;
		 }
		 if($a == 3){
			  $probe_lat = $mm_lat;
			  $probe_lon = $mm_lon;
			  $id = "Probe";
			  $mm_sym_60 = 12;
			  $mm_sym_20 = 11;
			  $mm_sym = 10;
		 }

		if($a <= 3){
			 //vehicle heading & time

			 $heading =  $mm[15];
			 $get_t = str_split($mm[2]);
			 $mm_time = "".$get_t[0]."".$get_t[1].":".$get_t[2]."".$get_t[3].":".$get_t[5]."".$get_t[6]."Z";
			 $get_mm_time = strtotime($mm_time);
			 $mm_time_diff = abs($now_time - $get_mm_time);
			 //echo "".$now_time.",".$get_mm_time.",".$mm_time_diff."\n";
			 if($mm_time_diff > $sec_allow){
				  $mm_sym = $mm_sym_60;
			 }
			 if($mm_time_diff > $sec_allow && $mm_time_diff < $sec_allow2){
				  $mm_sym = $mm_sym_20;
			 }

			 //temp and dew point

			 $temp_round = round(((9/5)*$mm[4])+32,1);
			 $dew_point_round = round(((9/5)*$mm[9])+32,1);
			 $temp_round2 = round(((9/5)*$mm[4])+32,0);
			 $dew_point_round2 = round(((9/5)*$mm[9])+32,0);
			 
			 //pressure
			   
			 $pressure = round($mm[10],2);

			 //wind barbs
			   
			 $barb = round($mm[6]*1.0 ,2);
			 $wind_dir = round($mm[7],0);
				  
			 if (0 <= $barb && $barb < 2.5) {
				  $mag = 21;
			 }
			 elseif(2.5 <= $barb && $barb < 7.5) {
				  $mag = 1;
			 }
			 elseif(7.5 <= $barb && $barb < 12.5) {
				  $mag = 2;
			 }
			 elseif(12.5 <= $barb && $barb < 17.5) {
				  $mag = 3;
			 }
			 elseif(17.5 <= $barb && $barb < 22.5) {
				  $mag = 4;
			 }
			 elseif(22.5 <= $barb && $barb < 27.5) {
				  $mag = 5;
			 }
			 elseif(27.5 <= $barb && $barb < 32.5) {
				  $mag = 6;
			 }
			 elseif(32.5 <= $barb && $barb < 37.5) {
				  $mag = 7;
			 }
			 elseif(37.5 <= $barb && $barb < 42.5) {
				  $mag = 8;
			 }
			 elseif(42.5 <= $barb && $barb < 47.5) {
				  $mag = 9;
			 }
			 elseif(47.5 <= $barb && $barb < 52.5) {
				  $mag = 10;
			 }
			 elseif(52.5 <= $barb && $barb < 57.5) {
				  $mag = 11;
			 }
			 elseif(57.5 <= $barb && $barb < 62.5) {
				  $mag = 12;
			 }
			 elseif(62.5 <= $barb && $barb < 67.5) {
				  $mag = 13;
			 }
			 elseif(67.5 <= $barb && $barb < 72.5) {
				  $mag = 14;
			 }
			 elseif(72.5 <= $barb && $barb < 77.5) {
				  $mag = 15;
			 }
			 elseif(77.5 <= $barb && $barb < 82.5) {
				  $mag = 16;
			 }
			 elseif(82.5 <= $barb && $barb < 87.5) {
				  $mag = 17;
			 }
			 elseif(87.5 <= $barb && $barb < 92.5) {
				  $mag = 18;
			 }
			 elseif(92.5 <= $barb && $barb < 97.5) {
				  $mag = 19;
			 }
			 elseif(97.5 <= $barb && $barb < 102.5) {
				  $mag = 20;
			 }
			 elseif($barb > 102.5) {
				  $mag = 23;
			 }


			 //Prepare Statements

			 $line1 = "Threshold: 60";
			 $line2 = "Object: ".$mm_lat.",".$mm_lon." ";
			 $line3 = "  Icon: 0,0,".$wind_dir.",1,".$mag."\n  Threshold: 999";
			 $line4 = "  Icon: 0,0,".$heading.",2,7,";
			 $line5 = "  Icon: 0,0,0,3,$mm_sym, \"".$id." @ ".$mm_time."\\nTemp: ".$temp_round."F (Dew: ".$dew_point_round."F)\\nWind: ".$wind_dir." deg. @ ".$barb." kts\\n";
			 $line5_1 = "Pressure: ".$pressure." mb\"";
			 $line6 = "  Threshold: 15";
			 $line7 = "  Text:  -24, 13, 1, \" ".$temp_round2." \"";
			 $line8 = "  Text:  -24, -13, 1, \" ".$dew_point_round2." \"";
			 $line9 = "  Text:  24, 13, 1, \" ".$pressure." \"";
			 $line10 = " End:";

			 // Statement

			 if($a == 0){
				  $m1_string = "".$line1."\n".$line2."\n".$line3."\n".$line4."\n".$line5."".$line5_1."\n".$line6."\n".$line7."\n".$line8."\n".$line9."\n".$line10."\n\n";
			 }
			 if($a == 1){
				  $m2_string = "".$line1."\n".$line2."\n".$line3."\n".$line4."\n".$line5."".$line5_1."\n".$line6."\n".$line7."\n".$line8."\n".$line9."\n".$line10."\n\n";
			 }
			 if($a == 2){
				  $m3_string = "".$line1."\n".$line2."\n".$line3."\n".$line4."\n".$line5."".$line5_1."\n".$line6."\n".$line7."\n".$line8."\n".$line9."\n".$line10."\n\n";
			 }
			 if($a == 3){
				  $probe_string = "".$line1."\n".$line2."\n".$line3."\n".$line4."\n".$line5."".$line5_1."\n".$line6."\n".$line7."\n".$line8."\n".$line9."\n".$line10."\n\n";
			 }
		}
		if($a == 4){
			$mm_id = $mm[0];
			$m1_lat_way = $mm[2];
			$m1_lon_way = $mm[3];
			$m2_lat_way = $mm[5];
			$m2_lon_way = $mm[6];
			$m3_lat_way = $mm[8];
			$m3_lon_way = $mm[9];
			$mt_lat_way = $mm[11];
			$mt_lon_way = $mm[12];
			
			if($m1_lat_way > 0){
				echo "Threshold: 999\n";
				echo "Object: ".$m1_lat_way.",".$m1_lon_way."\n";
				echo "  Icon: 0,0,0,3,15,\"M1 Waypoint set by ".$mm_id."\"\n";
				echo "End:";
			}
			if($m2_lat_way > 0){
				echo "Threshold: 999\n";
				echo "Object: ".$m2_lat_way.",".$m2_lon_way."\n";
				echo "  Icon: 0,0,0,3,16,\"M2 Waypoint set by ".$mm_id."\"\n";
				echo "End:";
			}
			if($m3_lat_way > 0){
				echo "Threshold: 999\n";
				echo "Object: ".$m3_lat_way.",".$m3_lon_way."\n";
				echo "  Icon: 0,0,0,3,17,\"M3 Waypoint set by ".$mm_id."\"\n";
				echo "End:";
			}
			if($mt_lat_way > 0){
				echo "Threshold: 999\n";
				echo "Object: ".$mt_lat_way.",".$mt_lon_way."\n";
				echo "  Icon: 0,0,0,3,18,\"MT Waypoint set by ".$mm_id."\"\n";
				echo "End:";
			}
			echo "\n\n";

		}
		if($a == 5){
			if($mm[4] > 0){
				echo "Threshold: 999\n";
				echo "Object: ".$mm[4].",".$mm[5]."\n";
				echo "  Icon: 0,0,0,3,13,\"Probes deployed by ".$mm_id."\\n  HITPR: ".$mm[1]."\\n  Video: ".$mm[2]."\\n  Wind: ".$mm[3]."\"\n";
				echo "End:\n\n";
			}
		}
		if($a == 6){
			if($mm[1] > 0){
				echo "Threshold: 999\n";
				echo "Object: ".$mm[1].",".$mm[2]."\n";
				echo "  Icon: 0,0,0,3,14,\"Target Set by ".$mm_id."\"\n";
				echo "End:\n\n";
			}
		}
	}

	//Make circles

	$radius = array($radius1,$radius2,$radius3);
	if($radius3 == 0){
		 $l = 1;
	}
	if($radius2 == 0){
		 $l = 0;
	}
	if($radius1 == 0){
		 $l = -1;
	}

	for($k=0;$k<=$l;$k++){

		 $numpoints = 100;
		 $yvalues = array();
		 $xvalues = array();

		 $multfactor = $numpoints / $radius[$k];
		 $halfpoints = $numpoints / 2;
		 $doublepoints = ($numpoints) * 2;
		 $yvalues[0] = -1;
		 $xvalues[0] = 0;

		 //Compute top half of a circle normalized to radius 1
		 for($i=1;$i<=$numpoints+1;$i++){
			  $yvalues[$i] = -1 + ($radius[$k] / $numpoints) * (($multfactor * $i) / $halfpoints); 
			  $xvalues[$i] = (pow((1 - (pow($yvalues[$i],2))),0.5));
		 }    

		 //Compute botton half of circle normalized to radius 1
		 for($i=$numpoints+1;$i<=$doublepoints;$i++){
			  $m = $i - $numpoints; 
			  $yvalues[$i] = (-1 + ($radius[$k] / $numpoints) * (($multfactor * $m) / $halfpoints)) * -1;
			  $xvalues[$i] = (pow((1 - (pow($yvalues[$i],2))),0.5)) * -1;
		 }

		 echo "Line: 1,0,\"\"\n";
		 for($i=0;$i<=$doublepoints;$i++){
			  $lat[$i] = $m1_lat + ($yvalues[$i] * ($radius[$k] / 111.325));
			  $lon[$i] = $m1_lon + ($xvalues[$i] * ($radius[$k] / (cos($lat[$i]*pi()/180) * 111.325)));
			  echo "  ".$lat[$i].",".$lon[$i]."\n";
		 }
		 echo "End:\n\n";

		 echo "Line: 1,0,\"\"\n";
		 for($i=0;$i<=$doublepoints;$i++){
			  $lat[$i] = $m2_lat + ($yvalues[$i] * ($radius[$k] / 111.325));
			  $lon[$i] = $m2_lon + ($xvalues[$i] * ($radius[$k] / (cos($lat[$i]*pi()/180) * 111.325)));
			  echo "  ".$lat[$i].",".$lon[$i]."\n";
		 }
		 echo "End:\n\n";

		 echo "Line: 1,0,\"\"\n";
		 for($i=0;$i<=$doublepoints;$i++){
			  $lat[$i] = $m3_lat + ($yvalues[$i] * ($radius[$k] / 111.325));
			  $lon[$i] = $m3_lon + ($xvalues[$i] * ($radius[$k] / (cos($lat[$i]*pi()/180) * 111.325)));
			  echo "  ".$lat[$i].",".$lon[$i]."\n";
		 }
		 echo "End:\n\n";

		 echo "Line: 1,0,\"\"\n";
		 for($i=0;$i<=$doublepoints;$i++){
			  $lat[$i] = $probe_lat + ($yvalues[$i] * ($radius[$k] / 111.325));
			  $lon[$i] = $probe_lon + ($xvalues[$i] * ($radius[$k] / (cos($lat[$i]*pi()/180) * 111.325)));
			  echo "  ".$lat[$i].",".$lon[$i]."\n";
		 }
		 echo "End:\n\n";
	}

	echo $m1_string;
	echo $m2_string;
	echo $m3_string;
	echo $probe_string;
}

?>

