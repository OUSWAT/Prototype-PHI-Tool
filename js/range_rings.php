{"type": "FeatureCollection","features": [{"geometry": {"type": "GeometryCollection","geometries": [
<?php

$clat = isset($_GET["clon"]) ? $_GET["clat"] : "35.333";
$clon = isset($_GET["clon"]) ? $_GET["clon"] : "-97.278";

$radius = array(50,100,150,200,250);

for($k=0;$k<count($radius);$k++){

        $numpoints = 500;
        $yvalues = array();
        $xvalues = array();
	$coords = array();

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

	echo "{\"type\": \"LineString\",\"coordinates\":[";
	for($i=0;$i<=$doublepoints;$i++){
                $lat = $clat + ($yvalues[$i] * ($radius[$k] / 111.325));
                $lon = $clon + ($xvalues[$i] * ($radius[$k] / (cos($lat*pi()/180) * 111.325)));
		//$lon = $clon + ($xvalues[$i] * ($radius[$k] / 111.325));
                //echo "  ".$lat[$i].",".$lon[$i]."\n";
		$coords[] = "[".$lon.", ".$lat."]";
        }
	echo implode(",",$coords)."]}";
	if($k < count($radius) - 1){
		echo ",\n";
	}
	else{
		echo "\n";
	}

}

?>
]},"type": "Feature","properties": {}}]}
