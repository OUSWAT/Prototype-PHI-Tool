function loadBackground(){
	document.getElementById("createBackground").value = "Clear";
	document.getElementById("createWarning").disabled = true;
        document.getElementById("createBackground").onclick = unloadBackground;
	innerHTML = '<br><b><u>Background PHI</u>:</b><br><br>';
	innerHTML += '<u>Day</u>: ';
	innerHTML += '<select id="phiDay" onChange="loadPHIOpts();">';
	for(i=1;i<=8;i++){
		innerHTML += '<option value="' + i + '">Day ' + i + '</option>';
	}
	innerHTML += '</select><br>';
	innerHTML += '<div id="phiOpts"></div>';
	innerHTML += '<div id="contours"></div>';
	document.getElementById("warningConfig").innerHTML = innerHTML;
	loadPHIOpts();
}

function unloadBackground(){
	document.getElementById("createBackground").value = "Create Background Probabilities";
        document.getElementById("createBackground").onclick = loadBackground;
	document.getElementById("warningConfig").innerHTML = '';
	background_area.removeAllFeatures();
	document.getElementById("createWarning").disabled = false;
}

optsAvail = ['none','tornado1','tornado2','hail1','hail2','wind1','wind2','lightning1','lightning2'];
optsName = ['Add Threat','Tornado (EF0+)','Sig. Tornado (EF2+)','Hail (1 in.+)','Sig. Hail (2 in.+)','Wind (50 kts+)','Sig. Wind (65 kts+)','Lightning','Sig. Lightning'];
function loadPHIOpts(){
	dayVal = document.getElementById('phiDay').value;
	if(dayVal == 1){
		now = new Date(currentTime * 1000);
		hStart = Math.floor(now.getUTCHours() / 3) * 3;
	}
	else{
		hStart = 0;
	}
	innerHTML = '<u>Period</u>: ';
	innerHTML += '<select id="periodVal" onChange="loadContours();">';
	for(i=hStart;i<24;i+=3){
		j = i + 3;
		innerHTML += '<option value="' + i + '_' + j + '">' + pad(i) + '-' + pad(j) + ' UTC</option>';
	}
	innerHTML += '</select><br>';
	innerHTML += '<u>Threat</u>: ';
	innerHTML += '<select id="threatType" onChange="">';
	for(i=1;i<optsAvail.length;i++){
		innerHTML += '<option value="' + optsAvail[i] + '">' + optsName[i] + '</value>';
	}
	innerHTML += '</select>';
	document.getElementById('phiOpts').innerHTML = innerHTML;
	loadContours();
}

function loadContours(){
	innerHTML = '<br><u>Contour</u>: ';
	innerHTML += '<select id="contourVal" onChange="">';
	innerHTML += '<option value="2">2%</option>';
	for(i=5;i<=60;i+=5){
		innerHTML += '<option value="' + i + '">' + i + '%</option>';
	}
	innerHTML += '</select>';
	innerHTML += '<input type="button" value="Draw" id="drawButton" onClick="drawBackground();" />';
	innerHTML += '<span id="backgroundConfig"></span>';
	document.getElementById('contours').innerHTML = innerHTML;
}
