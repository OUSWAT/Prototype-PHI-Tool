<?php

date_default_timezone_set('UTC');

$link = isset($_GET["link"]) ? $_GET["link"] : "2015052812/hires/needboreplot_2015052812_0305_0153_0239_0151_111_013.png";
$reqTime = isset($_GET["reqTime"]) ? $_GET["reqTime"] : "";

$url = "http://weather.ou.edu/~map/real_time_data/PECAN/PHI/".$link;

$s = explode("/",$link);
$localFile = "bore/".substr($s[2],0,-3)."txt";
$data = file($localFile);
$pieces = preg_split('/\s+/', $data[0]);

$invHeight = $pieces[1];
$invStrength = $pieces[2];
$cpDepth = $pieces[3];
$cpSpeed = $pieces[4];

/*
if($invHeight == -1){
	$invHeight = "";
}
if($invStrength == -1){
       	$invStrength = "";
}
if($cpDepth == -1){
       	$cpDepth = "";
}
if($cpSpeed == -1){
       	$cpSpeed = "";
}
*/

?>

<html>
<head>

<script type="text/javascript">

var timeint;
var boreURL;
var reqTime = <?php echo $reqTime; ?>;

function regenBore(){

	alert('Regenerating Bore Diagnostics, please stand by (image will automatically update).');
	document.getElementById('boreImg').src = '';

	var invHeight = document.getElementById('invHeight').value;
	var invStrength = document.getElementById('invStrength').value;
	var cpDepth = document.getElementById('cpDepth').value;
	var cpSpeed = document.getElementById('cpSpeed').value;

	var link = 'regenBore.php?reqTime=' + reqTime + '&invHeight=' + invHeight + '&invStrength=' + invStrength + '&cpDepth=' + cpDepth + '&cpSpeed=' + cpSpeed;
	var dataRequest = new XMLHttpRequest();
        dataRequest.open('GET', link, false);
        dataRequest.send();

	timerInt = setInterval(timer,1000);
}

function timer(){
	var request = new XMLHttpRequest();
        request.open('GET', 'bore/' + reqTime + '.txt', false);
        request.onreadystatechange = function(){
                if(request.readyState === 4){
                        if(request.status === 200 || request.status == 0){
				clearInterval(timerInt);
                                boreURL = 'http://weather.ou.edu/~map/real_time_data/PECAN/PHI/' + request.responseText.split("\n")[0];
				document.getElementById('boreImg').src = boreURL;
                        }
                }
        }
        request.send(null);
}

</script>

</head>
<body>

<table width="1878" border="1">
<tr>
<td width="150">

<b><u>Optional Parameter Modification</b>:</u>
<br>
<br>

<p>
Inversion Height (m):
<input type="text" id="invHeight" value="<?php echo $invHeight; ?>" />
</p>

<p>
Inversion Strength (K):
<input type="text" id="invStrength" value="<?php echo $invStrength; ?>" />
</p>

<p>
Cold Pool Depth (m):
<input type="text" id="cpDepth" value="<?php echo $cpDepth; ?>" />
</p>

<p>
Cold Pool Speed (m/s):
<input type="text" id="cpSpeed" value="<?php echo $cpSpeed; ?>" />
</p>

<p>
<input type="button" value="Submit" onClick="regenBore();" />
</p>

</td>
<td width="1728">

<img id="boreImg" src="<?php echo $url; ?>" width="1728" height="691" />

</td>
</tr>
</table>

</body>
</html>
