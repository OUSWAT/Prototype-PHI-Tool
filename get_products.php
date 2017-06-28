<?php

$case = isset($_GET["case"]) ? $_GET["case"] : "";
$site = isset($_GET["site"]) ? $_GET["site"] : "";
$product = isset($_GET["product"]) ? $_GET["product"] : "";

if(empty($case) || empty($site) || $case == 'undefined' || $site == 'undefined'){
	die();
}

$avail = array("Reflectivity","Velocity","MESH","MESH_Max_60min","RotationTrack60min","RotationTrackML60min","MergedReflectivityQCComposite","ReflectivityAtLowestAltitude");

$inv = array();
if(is_numeric($case)){
	$prods = scandir('archive/'.$case.'/'.$site);
	unset($prods[array_search('.',$prods)]);
	unset($prods[array_search('..',$prods)]);
}
else{
	$products = array();
	$prods = scandir('realtime/ewp/floater');
	unset($prods[array_search('.',$prods)]);
	unset($prods[array_search('..',$prods)]);
	/*
	foreach($prods as $p){
		$images = scandir('realtime/ewp/floater/'.$p);
		unset($images[array_search('.',$images)]);
		unset($images[array_search('..',$images)]);
		foreach($images as $image){
			$im = explode("_",$image);
			if(!in_array($im[2],$products) && $im[0] == $site || !in_array($im[2],$products) && $im[0] == "Floater"){
				$products[] = $im[2];
			}
		}
	}
	*/
}
foreach($prods as $prod){
	if(in_array($prod,$avail)){
		if($prod == $product){
			$inv[] = '<option value="'.$prod.'" selected>'.$prod.'</option>';
		}
		else{
			$inv[] = '<option value="'.$prod.'">'.$prod.'</option>';
		}
	}
}

if($product == "PHI-Tornado"){
	$inv[] = '<option value="PHI-Tornado" selected>PHI-Tornado</option>';
}
elseif(!is_numeric($case)){
	$inv[] = '<option value="PHI-Tornado">PHI-Tornado</option>';
}
if($product == "PHI-Severe"){
	$inv[] = '<option value="PHI-Severe" selected>PHI-Severe</option>';
}
elseif(!is_numeric($case)){
	$inv[] = '<option value="PHI-Severe">PHI-Severe</option>';
}
if($product == "PHI-Lightning"){
        $inv[] = '<option value="PHI-Lightning" selected>PHI-Lightning</option>';
}
elseif(!is_numeric($case)){
        $inv[] = '<option value="PHI-Lightning">PHI-Lightning</option>';
}

echo implode("",$inv);

?>
