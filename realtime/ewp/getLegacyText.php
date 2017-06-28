<?php

header("Content-Type: text/plain");
date_default_timezone_set("UTC");

if (isset($argv))
     for ($i=1;$i<count($argv);$i++){
          $it = split("=",$argv[$i]);
          $_GET[$it[0]] = $it[1];
     }

$now = isset($_GET["now"]) ? $_GET["now"] : "1430090800"; // epoch
$issue = isset($_GET["issue"]) ? $_GET["issue"] : "1430090700"; // epoch
$vStart = isset($_GET["vStart"]) ? $_GET["vStart"] : "1430090600"; // epoch
$duration = isset($_GET["duration"]) ? $_GET["duration"] : "60"; // minutes
$type = isset($_GET["type"]) ? $_GET["type"] : "tornado"; // severe, tornado, or lightning
$wType = isset($_GET["wType"]) ? $_GET["wType"] : "warning"; // warning/takeAction or advisory/beAware
$speed = isset($_GET["speed"]) ? $_GET["speed"] : "15"; // storm speed (knots)
$direction = isset($_GET["direction"]) ? $_GET["direction"] : "225"; // storm direction (degrees)
$site = isset($_GET["site"]) ? $_GET["site"] : "OUN"; // WFO site
$id = isset($_GET["id"]) ? $_GET["id"] : "0001"; // object ID
$con = isset($_GET["con"]) ? $_GET["con"] : "CON"; // NEW, CON, or EXP
$x = isset($_GET["x"]) ? $_GET["x"] : "-95"; // lon of object centroid
$y = isset($_GET["y"]) ? $_GET["y"] : "35"; // lat of object centroid
$user = isset($_GET["user"]) ? $_GET["user"] : ""; // forecaster
$severity = isset($_GET["severity"]) ? $_GET["severity"] : ""; // severity
$source = isset($_GET["source"]) ? $_GET["source"] : ""; // source for advisory or warning
$coords = isset($_GET["coords"]) ? $_GET["coords"] : ""; // coords for warnings/adv
//$severity = isset($_GET["severity"]) ? $_GET["severity"] : "violentTornado"; // severity
//$source = isset($_GET["source"]) ? $_GET["source"] : "observed"; // source for advisory or warning
//$coords = isset($_GET["coords"]) ? $_GET["coords"] : "-99.1,35.2,-100.4,35.2,-100.5,35.7,-99.4,35.6"; // coords for warnings/adv

$type = strtolower($type);
if($type == "severe thunderstorm"){
	$type = "severe";
}
if($source == "radarIndicated"){
        $source = "radar indicated";
}

function file_curl($url)
        {
          $ch = curl_init();
          $timeout = 5;
          curl_setopt($ch,CURLOPT_URL,$url);
          curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
          curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,$timeout);
          $data = curl_exec($ch);
          curl_close($ch);
          $array = explode("\n", $data);
          array_pop($array);
          return $array;
        }

function getDirection($val){
        if($val < 0){
                $val = $val + 360;
        }
        if($val >= 360){
                $val = $val - 360;
        }
        if($val >= 0 && $val < 11.25){
                $dir = "east";
        }
        elseif($val < 33.75){
                $dir = "east-northeast";
        }
        elseif($val < 56.25){
                $dir = "northeast";
        }
        elseif($val < 78.75){
                $dir = "north-northeast";
        }
        elseif($val < 101.25){
                $dir = "north";
        }
        elseif($val < 123.75){
                $dir = "north-northwest";
        }
        elseif($val < 146.25){
                $dir = "northwest";
        }
        elseif($val < 168.75){
		$dir = "west-northwest";
        }
        elseif($val < 191.25){
                $dir = "west";
        }
       	elseif($val < 213.75){
                $dir = "west-southwest";
       	}
       	elseif($val < 236.25){
                $dir = "southwest";
       	}
       	elseif($val < 258.75){
               	$dir = "south-southwest";
       	}
       	elseif($val < 281.25){
               	$dir = "south";
       	}
       	elseif($val < 303.75){
               	$dir = "south-southeast";
       	}
        elseif($val < 326.25){
                $dir = "southeast";
       	}
       	elseif($val < 348.75){
               	$dir = "east-southeast";
        }
        elseif($val < 360){
                $dir = "east";
        }
        else{
                $dir = "UNK";
        }
        return strtoupper($dir);
}

function formatAMPM($d) {
	return date("gi A",$d);
}

// get time stamps
$inTime = strtotime(date("Y-m-d H:i:s",$now)." UTC");
//$tIssue = new DateTime(date("Y-m-d H:i:s",$issue));
//$tIssue->setTimezone(new DateTimeZone("America/Chicago"));
$tIssue = $issue - (3600 * 6);
$vEnd = $vStart + ($duration * 60) - (3600 * 6);
$tStamp1 = date("dHi",$issue);
$tStamp2 = date("ymd",$tIssue)."T".date("Hi",$tIssue);
$tStamp3 = date("ymd",$vEnd)."T".date("Hi",$vEnd);
$tStamp4 = formatAMPM($tIssue)." CDT ".strtoupper(date("D M d Y",$tIssue));
$tStamp5 = date("ymd",$issue)."T".date("Hi",$issue);
$tStamp6 = date("ymd",$vEnd + (3600 * 6))."T".date("Hi",$vEnd + (3600 * 6));

// get town data
$req = "http://maps.googleapis.com/maps/api/geocode/json?latlng=".$y.",".$x."&sensor=false";
$txt = file_curl($req);
$json = json_decode(implode($txt),true);
//print_r($json);
//die();

// get index for town data
if($json["results"][1]["types"][0] == "postal_code"){
	$idx = 1;
}
else{
	$idx = 2;
}

// get town coords
$ux = $json["results"][$idx]["geometry"]["location"]["lng"];
$uy = $json["results"][$idx]["geometry"]["location"]["lat"];

// get town distance (miles)
$xDiff = ($ux - $x) * 111325 * cos($y * pi() / 180);
$yDiff = ($uy - $y) * 111325 ;
$uTownDistance = round(sqrt(($xDiff * $xDiff) + ($yDiff * $yDiff)) / 1609.34,0);

// get town direction
$uBearing = getDirection(atan2(($y - $uy), ($x - $ux)) * 180 / pi());

// get town name
$s1 = explode(",",$json["results"][$idx]["formatted_address"]);
$s2 = explode(" ",$s1[1]);
$uTownName = strtoupper($s1[0].", ".$s2[1]);

// get county name
$uCountyName = strtoupper($json["results"][$idx]["address_components"][2]["long_name"]);

// get storm speed in MPH
$uSpeed = round($speed * 1.15077945,0);

// assemble message
if($wType != "warning" && $wType != "takeAction"){
	$innerHTML = "350\n";
	$innerHTML = $innerHTML."WUUS82 K".$site." ".$tStamp1."\n";
	$innerHTML = $innerHTML."SPS".$site."\n";
	$innerHTML = $innerHTML."HAZARDOUS WEATHER TESTBED NORMAN OKLAHOMA\n";
	$innerHTML = $innerHTML.$tStamp4."\n\n";
	$innerHTML = $innerHTML."...SIGNIFICANT WEATHER ADVISORY FOR ".$uCountyName." CONTINUES UNTIL ".formatAMPM($vEnd)." CDT...\n\n";
	$innerHTML = $innerHTML."AT ".formatAMPM($vStart - (3600 * 6))." CDT...A STRONG THUNDERSTORM WAS LOCATED ".$uTownDistance." MILES ".$uBearing." OF ".$uTownName;
	$innerHTML = $innerHTML."...MOVING ".getDirection(270 - $direction)." AT ".$uSpeed." MPH.\n\n";
	if($type == "severe"){
		$s = explode("|",$severity);
		if(count($s) == 2 && !empty($s[0]) && !empty($s[1])){
			$what = $s[0]." INCH HAIL AND ".$s[1]." MPH WINDS";
		}
		elseif(count($s) == 2 && !empty($s[1])){
			$what = $s[1]." MPH WINDS";
		}
		elseif(!empty($s[0])){
			$what = $s[0]." INCH HAIL";
		}
		else{
			$what = "SMALL HAIL AND/OR STRONG WINDS";
		}
		$impact = "PEOPLE OUTDOORS SHOULD SEEK SHELTER IMMEDIATELY. EXPECT MINOR DAMAGE TO TREE LIMBS AND BLOWING AROUND OF LIGHT...UNSECURED OBJECTS. ELECTRICAL APPLIANCES SHOULD NOT BE USED UNLESS IN AN EMERGENCY.";
	}
	elseif($type == "lightning"){
		$what = "FREQUENT LIGHTNING";
		$impact = "FREQUENT CLOUD TO GROUND LIGHTNING IS OCCURRING WITH THESE STORMS. LIGHTNING CAN STRIKE 10 MILES AWAY FROM A THUNDERSTORM. SEEK A SAFE SHELTER INSIDE A BUILDING OR VEHICLE.";
	}
	else{
		$what = "POSSIBLE TORNADO";
		$impact = "PEOPLE OUTDOORS SHOULD SEEK SHELTER IMMEDIATELY.";
	}
	$innerHTML = $innerHTML."HAZARD...".$what."\n\n";
	$innerHTML = $innerHTML."IMPACT...".$impact."\n\n";
	$innerHTML = $innerHTML."&&\n\n";
	if(!empty($coords)){
                $cs = array();
                $c = explode(",",$coords);
                for($i=0;$i<count($c);$i++){
                       	$lon = abs($c[$i]);
                       	$lat = $c[$i+1];
                        if($lon >= 100){
                                $lon = $lon - 100;
                       	}
                        $cs[] = round($lat*100,0)." ".sprintf("%04d",round($lon*100,0));
                        $i++;
               	}
                $innerHTML = $innerHTML."LAT...LON ".implode(" ",$cs)."\n";
        }
	$innerHTML = $innerHTML."TIME...MOT...LOC ".date("Hi",$vStart)."Z ".$direction."DEG ".$speed."KT ".round($y*100,0)." ".sprintf("%04d",round(abs($x)*100,0))."\n\n";
	$innerHTML = $innerHTML."$$\n\n";
	$innerHTML = $innerHTML.$user."\n\n";
}
else{
	$innerHTML = "350\n";
	$innerHTML = $innerHTML."WUUS53 K".$site." ".$tStamp1."\n";
	// /O.CON.KOUN.TO.W.0018.000000T0000Z-160509T2230Z/
	if($type == "severe"){
		if($con == "NEW"){
			$innerHTML = $innerHTML."SVR".$site."\n";
			$innerHTML = $innerHTML."/O.".strtoupper($con).".K".$site.".SV.W.".sprintf("%04d",substr($id,-4,4)).".".$tStamp5."Z-".$tStamp6."Z/\n\n";
			$innerHTML = $innerHTML."BULLETIN - IMMEDIATE BROADCAST REQUESTED\n";
			$innerHTML = $innerHTML."SEVERE THUNDERSTORM WARNING\n";
		}
		elseif($con == "CON" || $con == "EXP"){
			$innerHTML = $innerHTML."SVS".$site."\n";
			$innerHTML = $innerHTML."/O.".strtoupper($con).".K".$site.".SV.W.".sprintf("%04d",substr($id,-4,4)).".000000T0000Z-".$tStamp6."Z/\n\n";
		}
	}
	elseif($type == "tornado"){
		if($con == "NEW"){
			$innerHTML = $innerHTML."TOR".$site."\n";
	               	$innerHTML = $innerHTML."/O.".strtoupper($con).".K".$site.".TO.W.".sprintf("%04d",substr($id,-4,4)).".".$tStamp5."Z-".$tStamp6."Z/\n\n";
			$innerHTML = $innerHTML."BULLETIN - IMMEDIATE BROADCAST REQUESTED\n";
			$innerHTML = $innerHTML."TORNADO WARNING\n";
		}
		elseif($con == "CON" || $con == "EXP"){
			$innerHTML = $innerHTML."SVS".$site."\n";
			$innerHTML = $innerHTML."/O.".strtoupper($con).".K".$site.".TO.W.".sprintf("%04d",substr($id,-4,4)).".000000T0000Z-".$tStamp6."Z/\n\n";
		}
	}
	else{
		if($con == "NEW"){
			$innerHTML = $innerHTML."LGT".$site."\n";
	               	$innerHTML = $innerHTML."/O.".strtoupper($con).".K".$site.".LG.W.".sprintf("%04d",substr($id,-4,4)).".".$tStamp5."Z-".$tStamp6."Z/\n\n";
			$innerHTML = $innerHTML."BULLETIN - IMMEDIATE BROADCAST REQUESTED\n";
			$innerHTML = $innerHTML."LIGHTNING WARNING\n";
		}
		elseif($con == "CON" || $con == "EXP"){
			$innerHTML = $innerHTML."SVS".$site."\n";
			$innerHTML = $innerHTML."/O.".strtoupper($con).".K".$site.".LG.W.".sprintf("%04d",substr($id,-4,4)).".000000T0000Z-".$tStamp6."Z/\n\n";
		}
	}
	$innerHTML = $innerHTML."HAZARDOUS WEATHER TESTBED NORMAN OKLAHOMA\n";
	$innerHTML = $innerHTML.$tStamp4."\n\n";
	if($con == "NEW"){
		$innerHTML = $innerHTML."THE HAZARDOUS WEATHER TESTBED IN NORMAN HAS ISSUED A\n\n";
		if($type == "severe"){
	               	$innerHTML = $innerHTML."* SEVERE THUNDERSTORM WARNING FOR...\n";
		}
		elseif($type == "tornado"){
	               	$innerHTML = $innerHTML."* TORNADO WARNING FOR...\n";
		}
		else{
			$innerHTML = $innerHTML."* LIGHTNING WARNING FOR...\n";
		}
		$innerHTML = $innerHTML."  ".$uCountyName.".\n\n";
		$innerHTML = $innerHTML."* UNTIL ".formatAMPM($vEnd)." CDT\n\n";
	}
	elseif($con == "CON"){
		if($type == "severe"){
			$innerHTML = $innerHTML."...A SEVERE THUNDERSTORM WARNING REMAINS IN EFFECT UNTIL ".formatAMPM($vEnd)." CDT FOR ".$uCountyName."...\n\n";
		}
		elseif($type == "tornado"){
			$innerHTML = $innerHTML."...A TORNADO WARNING REMAINS IN EFFECT UNTIL ".formatAMPM($vEnd)." CDT FOR ".$uCountyName."...\n\n";
		}
		else{
			$innerHTML = $innerHTML."...A LIGHTNING WARNING REMAINS IN EFFECT UNTIL ".formatAMPM($vEnd)." CDT FOR ".$uCountyName."...\n\n";
		}
	}
	if($con == "EXP"){
		// ...THE SEVERE THUNDERSTORM WARNING FOR SOUTHEASTERN LOGAN COUNTY WILL EXPIRE AT 515 PM CDT...
		if($type == "severe"){
			$innerHTML = $innerHTML."...THE SEVERE THUNDERSTORM WARNING FOR ".$uCountyName." WILL EXPIRE AT ".formatAMPM($vEnd)." CDT...\n\n";
		}
		elseif($type == "tornado"){
			$innerHTML = $innerHTML."...THE TORNADO WARNING FOR ".$uCountyName." WILL EXPIRE AT ".formatAMPM($vEnd)." CDT...\n\n";
		}
		else{
			$innerHTML = $innerHTML."...THE LIGHTNING WARNING FOR ".$uCountyName." WILL EXPIRE AT ".formatAMPM($vEnd)." CDT...\n\n";
		}
		$innerHTML = $innerHTML."THE STORM WHICH PROMPTED THE WARNING HAS WEAKENED BELOW SEVERE LIMITS...AND HAVE EXITED THE WARNED AREA. THEREFORE THE WARNING WILL BE ALLOWED TO EXPIRE.\n\n";
	}
	else{
		if($type == "severe"){
			$innerHTML = $innerHTML."* AT ".formatAMPM($vStart - (3600 * 6))." CDT...A SEVERE THUNDERSTORM WAS LOCATED ".$uTownDistance." MILES ".$uBearing." OF ".$uTownName."...MOVING ".getDirection(270 - $direction)." AT ".$uSpeed." MPH.\n\n";
			$s = explode("|",$severity);
	                if(count($s) == 2 && !empty($s[0]) && !empty($s[1])){
	                        $what = $s[0]." INCH HAIL AND ".$s[1]." MPH WINDS";
				$tag = "HAIL...".$s[0]."IN\nWIND...".$s[1]."MPH";
	                }
	                elseif(count($s) == 2 && !empty($s[1])){
	                        $what = $s[1]." MPH WINDS";
				$tag = "WIND...".$s[1]."MPH";
	                }
	                elseif(!empty($s[0])){
	                        $what = $s[0]." INCH HAIL";
				$tag = "HAIL...".$s[0]."IN";
	                }
	                else{
	                        $what = "UNK";
				$tag = "";
	                }
			$tag = $tag."\n\n";
			$impact = "PEOPLE OUTDOORS SHOULD SEEK SHELTER IMMEDIATELY. EXPECT MINOR DAMAGE TO TREE LIMBS AND BLOWING AROUND OF LIGHT...UNSECURED OBJECTS. ELECTRICAL APPLIANCES SHOULD NOT BE USED UNLESS IN AN EMERGENCY.";
		}
		elseif($type == "tornado"){
			$innerHTML = $innerHTML."* AT ".formatAMPM($vStart - (3600 * 6))." CDT...A TORNADO WAS LOCATED ".$uTownDistance." MILES ".$uBearing." OF ".$uTownName."...MOVING ".getDirection(270 - $direction)." AT ".$uSpeed." MPH.\n\n";
			$what = "TORNADO";
			if(!empty($source)){
				$tag = "TORNADO...".strtoupper($source)."\n";
			}
			else{
				$tag = "";
			}
			if(!empty($severity)){
				if($severity == "strongTornado"){
					$tag = $tag."TORNADO DAMAGE THREAT...CONSIDERABLE\n\n";
				}
				elseif($severity == "violentTornado"){
					$tag = $tag."TORNADO DAMAGE THREAT...CATASTROPHIC\n\n";
				}
			}
			$impact = "FLYING DEBRIS WILL BE DANGEROUS TO THOSE CAUGHT WITHOUT SHELTER. MOBLIE HOMES WILL BE DAMAGED OR DESTROYED. DAMAGE TO ROOFS...WINDOWS...AND VEHICLES WILL OCCUR. TREE DAMAGE IS LIKELY.";
		}
		else{
			$innerHTML = $innerHTML."* AT ".formatAMPM($vStart - (3600 * 6))." CDT...LIGHTNING WAS LOCATED ".$uTownDistance." MILES ".$uBearing." OF ".$uTownName."...MOVING ".getDirection(270 - $direction)." AT ".$uSpeed." MPH.\n\n";
	                $what = "LIGHTNING";
	                if(!empty($source)){
	                        $tag = "LIGHTNING...".strtoupper($source)."\n\n";
	                }
	                else{
	                        $tag = "";
	                }
			$impact = "FREQUENT CLOUD TO GROUND LIGHTNING IS OCCURRING WITH THESE STORMS. LIGHTNING CAN STRIKE 10 MILES AWAY FROM A THUNDERSTORM. SEEK A SAFE SHELTER INSIDE A BUILDING OR VEHICLE.";
		}
		$innerHTML = $innerHTML."HAZARD...".$what.".\n\n";
	        $innerHTML = $innerHTML."SOURCE...".strtoupper($source).".\n\n";
	        $innerHTML = $innerHTML."IMPACT...".$impact."\n\n";
	        $innerHTML = $innerHTML."* LOCATIONS IMPACTED INCLUDE...\n";
	        $innerHTML = $innerHTML."  YOUR LOCATION.\n\n";
	        $innerHTML = $innerHTML."PRECAUTIONARY/PREPAREDNESS ACTIONS...\n\n";
	        $innerHTML = $innerHTML."SEEK SHELTER IMMEDIATELY.\n\n";
	}
        $innerHTML = $innerHTML."&&\n\n";
	if(!empty($coords)){
		$cs = array();
		$c = explode(",",$coords);
		for($i=0;$i<count($c);$i++){
			$lon = abs($c[$i]);
			$lat = $c[$i+1];
			if($lon >= 100){
				$lon = $lon - 100;
			}
			$cs[] = round($lat*100,0)." ".sprintf("%04d",round($lon*100,0));
			$i++;
		}
		$innerHTML = $innerHTML."LAT...LON ".implode(" ",$cs)."\n";
	}
	$x = abs($x);
	if($x >= 100){
		$x = $x - 100;
	}
	$innerHTML = $innerHTML."TIME...MOT...LOC ".date("Hi",$vStart)."Z ".$direction."DEG ".$speed."KT ".round($y*100,0)." ".sprintf("%04d",round(abs($x)*100,0))."\n\n";
        $innerHTML = $innerHTML.$tag;
        $innerHTML = $innerHTML."$$\n\n";
	$innerHTML = $innerHTML.$user."\n\n";
}

echo $innerHTML."\n";

?>
