var timeCanvasStart;
var timeCanvasEnd;
var timeCanvasStartLast;
var timeCanvasEndLast;
var timeCanvasVal;
var timeCanvasNow;
var timeCanvasValLast = -999;
var timeCanvasLineVal;
var timeCanvasLineNow;
var knobs = [];
var dragCanvas = true;
var dragStartX;
var maxU;
var stage;
var layer;
var layer2;
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var selectOptions;
var selectOptionsWin;
var sideBar;
var mainHTML;
var displayTabHTML;
var wofTabHTML;
var threatTabHTML;
var historyTabHTML;
var backgroundTabHTML;
var activeThreatsHTML;
var timeBar;
var temporalDisplayHTML;
var mapHTML;
var win;
var records = [];
var timeButtons;


function setWinHTML(){
	selectOptionsWin = '<center><br><br><br><table border="0" cellpadding="1"><tr><td align="right" valign="center"><u>Username</u>:</td><td><input type="text" id="userSelect" /></td></tr>';
       	selectOptionsWin += '<tr><td align="right" valign="center"><u>Operating Mode</u>:</td><td><select id="opMode" onChange="loadOpMode();"><option value="realtime">Real-time</option><option value="archive">Archive</option></select></td></tr>';
	//selectOptionsWin += '<tr><td align="right" valign="center"><u>Operating Mode</u>:</td><td><select id="opMode" onChange="loadOpMode();"><option value="realtime">Real-time</option><option value="archive">Archive</option><option value="analysis">Analysis</option></select></td></tr>';
	selectOptionsWin += '<tr><td align="right" valign="center"><div id="name1"></div></td><td><div id="options1"></div></td></tr>';
	selectOptionsWin += '<tr><td align="right" valign="center"><div id="name2"></div></td><td><div id="options2"></div></td></tr>';
        selectOptionsWin += '<tr><td></td><td><input type="button" value="Submit" onClick="loadMap();" /></td></tr></table></center>';
}

function loadOpMode(){
	opMode = document.getElementById('opMode').value;
	wfos = {};
	floaterSites = [];
	if(opMode == 'realtime'){
		innerHTML = '<select id="caseSelect" onChange="loadSites(\'realtime\');">';

		var url = 'realtime/ewp/pngConvertRadars.txt?' + (new Date()).getTime();
		var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', url, false);
                dataRequest.send();
                var phiRadars = dataRequest.responseText.trim().split(",");

		var url = 'realtime/ewp/PHI_Floater_Info.txt?' + (new Date()).getTime();
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', url, false);
                dataRequest.send();
		phiFloaterInfo = dataRequest.responseText;
                lines = dataRequest.responseText.split("\n");
                for(i=0;i<lines.length;i++){
                        if(i == 0){
                                floaterBoundsNELat = lines[i].split(' ')[2];
                                floaterBoundsSWLon = lines[i].split(' ')[3];
                        }
			else if(i == 1){
				//centerLat = (parseFloat(floaterBoundsNELatTemp) + parseFloat(lines[i].split(' ')[2])) / 2;
				//offset = (centerLat - 10) * 0.003958264;
				//floaterBoundsNELat = floaterBoundsNELatTemp - (offset / 2);
                                //floaterBoundsSWLat = lines[i].split(' ')[2] - (offset / 3);
                                floaterBoundsSWLat = lines[i].split(' ')[2];
				floaterBoundsNELon = lines[i].split(' ')[3];
				floaterBounds = new OpenLayers.Bounds(floaterBoundsSWLon,floaterBoundsSWLat,floaterBoundsNELon,floaterBoundsNELat).transform(proj,proj2);
                        }
                        else if(i == 2){
				var fSites = lines[i].split(' ');
				var flSites = [];
                                for(var j=1;j<fSites.length;j++){
					if(phiRadars.indexOf(fSites[j]) == -1){
						continue;
					}
					flSites.push(fSites[j]);
				}
				if(flSites.length == 0){
					flSites = [fSites[1],fSites[2],fSites[3]];
				}
				for(var j=0;j<flSites.length;j++){
					if(wfos.hasOwnProperty(radarLocs[flSites[j]])){
						wfos[radarLocs[flSites[j]]].push(flSites[j]);
					}
					else{
						wfos[radarLocs[flSites[j]]] = [];
						wfos[radarLocs[flSites[j]]].push(flSites[j]);
					}
                                        floaterSites.push(flSites[j]);
                                }
                        }
                }
		for(wfo in wfos){
			innerHTML += '<option value="' + wfo + '">WFO - ' + wfo + '</option>';
		}
		innerHTML += '<option value="ncp">National Center Perspective (NCP)</option>';
		innerHTML += '</select>';
		document.getElementById('name1').innerHTML = '<u>Localization</u>:';
	}
	else if(opMode == 'archive'){
		url = 'getCases.php';
	       	var dataRequest = new XMLHttpRequest();
	       	dataRequest.open('GET', url, false);
	       	dataRequest.send();
		cases = dataRequest.responseText.split(",");
		innerHTML = '<select id="caseSelect" onChange="loadSites(\'archive\');">';
		for(var i=0;i<cases.length;i++){
			if(caseStartNames.hasOwnProperty(cases[i])){
				innerHTML += '<option value="' + cases[i] + '">' + caseStartNames[cases[i]] + '</option>';
			}
			else{
				innerHTML += '<option value="' + cases[i] + '">' + cases[i] + '</option>';
			}
		}
		innerHTML += '</select>';
		document.getElementById('name1').innerHTML = '<u>Case</u>:';
	}
	else if(opMode == 'analysis'){
                url = 'getCases.php';
               	var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', url, false);
               	dataRequest.send();
               	cases = dataRequest.responseText.split(",");
                innerHTML = '<select id="caseSelect" onChange="loadSites(\'analysis\');">';
                for(var i=0;i<cases.length;i++){
                        innerHTML += '<option value="' + cases[i] + '">' + cases[i] + '</option>';
                }
		//innerHTML += '<option value="realtime">Real-time</option>';
                innerHTML += '</select>';
                document.getElementById('name1').innerHTML = '<u>Case</u>:';
        }
	document.getElementById('options1').innerHTML = innerHTML;
	loadSites(opMode);
}

// NW Coords: 42.45 -79.43
// SE Coords: 36.45 -71.43
// Radars: KAKQ KBGM KBOX KBUF KCCX KDIX KDOX KENX KFCX KLWX KOKX KPBZ KRAX

function loadSites(opMode){
	if(opMode == 'realtime'){
               	loc = document.getElementById('caseSelect').value;
		innerHTML = '<select id="siteSelect" onChange="">';
		if(loc == 'ncp'){
                        innerHTML += '<option value="hwt">Hazardous Weather Testbed (EFP)</option>';
			innerHTML += '<option value="pecan">PECAN Field Campaign</option>';
                }
		else{
			for(j=0;j<wfos[loc].length;j++){
				innerHTML += '<option value="' + wfos[loc][j] + '">' + wfos[loc][j] + '</option>';
			}
		}
               	innerHTML += '</select>';
               	document.getElementById('name2').innerHTML = '<u>Site</u>:';            
		document.getElementById('options2').innerHTML = innerHTML;
       	}
	else if(opMode == 'archive'){
		caseSelect = document.getElementById('caseSelect').value;
		url = 'getSites.php?case=' + caseSelect;
		var dataRequest = new XMLHttpRequest();
		dataRequest.open('GET', url, false);
		dataRequest.send();
		sites = dataRequest.responseText.split(",");
		innerHTML = '<select id="siteSelect" onChange="">';
		for(var i=0;i<sites.length;i++){
			innerHTML += '<option value="' + sites[i] + '">' + sites[i] + '</option>';
		}
		innerHTML += '</select>';
		document.getElementById('name2').innerHTML = '<u>Site</u>:';
		document.getElementById('options2').innerHTML = innerHTML;
	}
	else if(opMode == 'analysis'){
               	caseSelect = document.getElementById('caseSelect').value;
               	if(caseSelect == 'realtime'){
			innerHTML = '<select id="siteSelect" onChange="">';
                       	for(var j=0;j<wfos[loc].length;j++){
                                innerHTML += '<option value="' + wfos[loc][j] + '">' + wfos[loc][j] + '</option>';
                        }
	                innerHTML += '</select>';
		}
		else{
			url = 'getSites.php?case=' + caseSelect;
	               	var dataRequest = new XMLHttpRequest();
	               	dataRequest.open('GET', url, false);
	               	dataRequest.send();
	               	sites = dataRequest.responseText.split(",");
	               	innerHTML = '<select id="siteSelect" onChange="">';
	               	for(var i=0;i<sites.length;i++){
	                       	innerHTML += '<option value="' + sites[i] + '">' + sites[i] + '</option>';
	               	}
	               	innerHTML += '</select>';
		}
               	document.getElementById('name2').innerHTML = '<u>Site</u>:';
               	document.getElementById('options2').innerHTML = innerHTML;
       	}
}

function setHTML(){
	// get default product
	url = 'get_products.php?case=' + acase + '&site=' + site + '&product=' + product + '&archive=' + archive;
	var dataRequest = new XMLHttpRequest();
	dataRequest.open('GET', url, false);
	dataRequest.send();
	selectOptions = '<select id="productSelect" onKeyDown="ignoreKeys();" onChange="loadNewProduct();">' + dataRequest.responseText + '</select>&nbsp;&nbsp;&nbsp;&nbsp;';

	// get list of archive cases available on server (if realtime, load site list)
	if(archive || analysis){
		url = 'get_archives.php?case=' + acase + '&site=' + site;
		var dataRequest = new XMLHttpRequest();
		dataRequest.open('GET', url, false);
		dataRequest.send();
		//caseSelectOptions = '<u>User</u>: ' + user + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
		caseSelectOptions = '<u onClick="jumpToSite();">Case</u>: <select id="caseSelect" onChange="resetCase();">';
		caseSelectOptions += dataRequest.responseText;
		caseSelectOptions += '</select>';
		caseSelectOptions = '';
	}
	else{
		//caseSelectOptions = '<u>User</u>: ' + user + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                caseSelectOptions = '<u onClick="jumpToSite();">Site</u>: <select id="siteSelect" onKeyDown="ignoreKeys();" onChange="resetSite();">';
		for(j=0;j<floaterSites.length;j++){
			if(floaterSites[j] == site){
		                caseSelectOptions += '<option value="' + floaterSites[j] + '" selected>' + floaterSites[j] + '</option>';
			}
			else{
				caseSelectOptions += '<option value="' + floaterSites[j] + '">' + floaterSites[j] + '</option>';
			}
		}
                caseSelectOptions += '</select>';
	}

	// innerHTML for various panels on main page
	timeButtons = '';
	if(!analysis){
		timeButtons += '<b><u>Time</u>:</b>&nbsp;&nbsp;<span id="archive_time_val" align="left" style="font-weight: bold; font-size: 26px; color: #009900;"></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	}
	timeButtons += '<b><u>Slider</u>:</b>&nbsp;&nbsp;<span id="master-time-input" onChange="alert(\'changed!\');" align="left" style="font-weight: bold; font-size: 26px; color: #FF0000;"></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	if(archive){
		timeButtons += '<span id="pauseSim" style="position:absolute;" ><input type="button" value="Pause Simulation" onClick="pauseSimulation();" /></span>';
	}
	timeButtons += '<span style="position:absolute;right:0px;">';
	//timeButtons += '<img id="ellipseButton" title="Draw Ellipse Threat" src="images/ellipseButton.png" onClick="drawThreat(\'ellipse\');" onMouseOver="this.src=\'images/ellipseButtonHighlight.png\';" onMouseOut="this.src=\'images/ellipseButton.png\';"/>';
	//timeButtons += '<img id="polyButton" title="Draw Irregular Polygon Threat" src="images/polyButton.png" onClick="drawThreat(\'polygon\');" onMouseOver="this.src=\'images/polyButtonHighlight.png\';" onMouseOut="this.src=\'images/polyButton.png\';"/>';
	//timeButtons += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	timeButtons += '<img title="Go to Beginning of Time Control" src="images/first_25.gif" onClick="goToStart();" onMouseOver="this.src=\'images/first_25_over.gif\';" onMouseOut="this.src=\'images/first_25.gif\';"/>';
	timeButtons += '<img title="Go Backward 1 Radar Scan" src="images/pre_25.gif" onClick="play = true; advanceScan(\'back\'); play = false;" onMouseOver="this.src=\'images/pre_25_over.gif\';" onMouseOut="this.src=\'images/pre_25.gif\';" />';
	//timeButtons += '<img title="Start Radar Loop" src="images/play_25_over.gif" onClick="playButton();" onMouseOver="this.src=\'images/play_25.gif\';" onMouseOut="this.src=\'images/play_25_over.gif\';" />';
	//timeButtons += '<img title="Stop Radar Loop" src="images/pause1_25_over.gif" onClick="stopButton();" onMouseOver="this.src=\'images/pause1_25.gif\';" onMouseOut="this.src=\'images/pause1_25_over.gif\';"/>';
	timeButtons += '<img title="Go Forward 1 Radar Scan" src="images/next_25.gif" onClick="play = true; advanceScan(\'forward\'); play = false;" onMouseOver="this.src=\'images/next_25_over.gif\';" onMouseOut="this.src=\'images/next_25.gif\';" />';
	timeButtons += '<img title="Go to End of Time Control" src="images/last_25.gif" onClick="goToEnd();" onMouseOver="this.src=\'images/last_25_over.gif\';" onMouseOut="this.src=\'images/last_25.gif\';"/>';
	//timeButtons += '<img title="Decrease Loop Speed" src="images/speed_up2.gif" onClick="increaseDelay();" onMouseOver="this.src=\'images/speed_up_over2.gif\';" onMouseOut="this.src=\'images/speed_up2.gif\';" />';
	//timeButtons += '<img title="Increase Loop Speed" src="images/speed_down2.gif" onClick="decreaseDelay();" onMouseOver="this.src=\'images/speed_down_over2.gif\';" onMouseOut="this.src=\'images/speed_down2.gif\';" />';
	//timeButtons += '<img title="Go to Current Time" src="images/ctime_over.png" onClick="goToNow();" onMouseOver="this.src=\'images/ctime.png\';" onMouseOut="this.src=\'images/ctime_over.png\';" />';
	timeButtons += '&nbsp;&nbsp;&nbsp;&nbsp;</span>';

	sideBar = '<div id="tiltTable"></div><br>';
	sideBar += '<span id="mapCoords"></span>';
	/*
	if(acase == '20130520' && site == 'KTLX'){
		myrorssCase = true;
		sideBar += '<b><u>Scales</u>:</b><table cellpadding="2" cellspacing="0" border="1"><tr><td width="30" align="center" id="scale0" onMouseOver="changeScale(0); setMouse(this);">20</td></tr>';
		sideBar += '<tr><td align="center" id="scale1" onMouseOver="changeScale(1); setMouse(this);">200</td></tr><tr><td align="center" id="scale2" onMouseOver="changeScale(2); setMouse(this);">800</td></tr>';
		sideBar += '<tr><td align="center" id="scale3" onMouseOver="changeScale(3); setMouse(this);">2000</td></tr></table><input type="checkbox" id="showMYRORSS" onClick="changeScale(lastScale);" />show<br><br>';
	}
	else if(kmeans){
		//sideBar += '<b><u>Scales</u>:</b><table cellpadding="2" cellspacing="0" border="1"><tr><td width="30" align="center" id="scale0" onMouseOver="changeKmeansScale(0); setMouse(this);">0</td></tr>';
               	//sideBar += '<tr><td align="center" id="scale1" onMouseOver="changeKmeansScale(1); setMouse(this);">1</td></tr><tr><td align="center" id="scale2" onMouseOver="changeKmeansScale(2); setMouse(this);">2</td></tr>';
               	//sideBar += '<tr><td align="center" id="scale3" onMouseOver="changeKmeansScale(3); setMouse(this);">3</td></tr></table><input type="checkbox" id="showKmeans" onClick="changeKmeansScale(lastScale);" checked />show<br><br>';
		sideBar += '<b><u>Scales</u>:</b><table cellpadding="2" cellspacing="0" border="1"><tr><td width="30" align="center" id="scale0" onClick="changeKmeansScale(0); setMouse(this);">20</td></tr>';
                sideBar += '<tr><td align="center" id="scale1" onClick="changeKmeansScale(1); setMouse(this);">200</td></tr><tr><td align="center" id="scale2" onClick="changeKmeansScale(2); setMouse(this);">800</td></tr>';
                sideBar += '<tr><td align="center" id="scale3" onClick="changeKmeansScale(3); setMouse(this);">2000</td></tr></table><input type="checkbox" id="showKmeans" onClick="changeKmeansScale(lastScale);" checked />show<br><br>';
	}
	if(acase == '20110524' && site == 'MPAR'){
		wofCase = true;
		sideBar += '<b><u>WoF</u>:</b><br><input type="checkbox" id="showWoF" onClick="showWoF();" />show';
	}
	*/
	displayTabHTML = '<br><div style="height:600px;"><b><u>User Location</u>:</b>Lat: <input type="text" id="uLat" size="10" value=""/> Lon: <input type="text" id="uLon" size="10" value=""/> <input type="button" value="Set" onClick="defineUserPoint();" />';
	displayTabHTML += '<input type="button" value="Locate Me!" onClick="locateUserPoint();" /><br>';
	displayTabHTML += '<b><u>User Lead-Time</u>:</b><input type="text" id="uDur" size="3" value="-1"/><br><br>';
	displayTabHTML += '<hr color="#000000">';
	//displayTabHTML += '<center><div id="chart4" style="width:450px;height:270px;"></div></center><div id="threatText"></div>';
	displayTabHTML += '<div id="threatText"></div>';
	//displayTabHTML += '<br><br><input type="checkbox" id="wofProbs1" onClick="displayWoFProbs1();" />Display WoF Probs (UH > 25 m^2/s^2)<br><input type="checkbox" id="wofProbs2" onClick="displayWoFProbs2();" />Display WoF Probs (0-2 km AGL Vorticity > 0.005 s^-1)<br><br>';
	legendTabHTML = '<center><div id="legend"></div></center>';
	//displayTabHTML += '<b><u>Threat Display</u>:</b><select id="gridType" onChange="selectGrid(\'config\'); setGridOpacity();"><option value="">Threat Polygons</option><option value="threat_lines">Threat Swath Polygons</option><option value="ndfd_grid">Time Step Grid</option><option value="ndfd_grid">Accumulated Grid</option></select><br><b><u>Grid Colors</u>:</b><select id="colorScale" onChange="setGridNums();"><option value="5Levels" selected>5 Levels</option><option value="NHC">NHC Colors</option><option value="full">Full Spectrum</option><option value="gray">Gray Scale</option></select><input type="checkbox" id="gridNums" onClick="setGridNums();" />Show Grid #\'s<div style="display: table-cell;vertical-align:middle;"><b><u>Grid Opacity</u>:</b><div class="slider" id="gridSlider-slider" style="width:100px;height:30px;ouline:none;display:inline-block;text-align:bottom;" tabIndex="1"><input class="gridSlider-input" id="gridSlider-slider-input" /></div><span id="gridSlider-input" align="left"></span></div><center><div id="legend"></div></center></div>';
	displayHTML = '<b><u>User Location</u>:</b>Lat: <input type="text" id="uLat" size="10" value=""/> Lon: <input type="text" id="uLon" size="10" value=""/>';
	displayHTML += '<input type="button" value="Set" onClick="defineUserPoint();" /><input type="button" value="Locate Me!" onClick="locateUserPoint();" />';
	displayHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	displayHTML += '<b><u>Preview Option</u>:</b><select id="gridType" onChange="selectGrid(\'config\'); setGridOpacity();">';
	displayHTML += '<option value="">None</option><option value="ndfd_grid">Time Step Grid</option><option value="ndfd_grid">Accumulated Grid</option><option value="threat_lines">Active Swaths</option></select>';
	displayHTML += '<select id="colorScale" onChange="setGridNums();"><option value="5Levels" selected>5 Levels</option><option value="NHC">NHC Colors</option><option value="full">Full Spectrum</option><option value="gray">Gray Scale</option></select>';
	displayHTML += '<input type="checkbox" id="gridNums" onClick="setGridNums();" />Show Grid #\'s<span class="slider" id="gridSlider-slider" style="width:100px;height:30px;ouline:none" tabIndex="1">';
	displayHTML += '<input class="gridSlider-input" id="gridSlider-slider-input" /></span><span id="gridSlider-input" align="left"></span>';
	displayHTML += '<div id="legend"></div>';
	historyTabHTML = '<div id="historyConfig" style="height:950px;"></div>';
	if(showW){
		wofTabHTML = '<br><br>&nbsp;&nbsp;<b><u>Data Layers</u>:</b><br>&nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" id="showWoFProbs" onClick="showWoFViz(\'points\');" checked />WoF Intensity<br>';
	}
	else{
		wofTabHTML = '<br><br>&nbsp;&nbsp;<b><u>Data Layers</u>:</b><br>&nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" id="showWoFProbs" onClick="showWoFViz(\'points\');" />WoF Intensity<br>';
	}
	//wofTabHTML += '<input type="checkbox" id="showWoFTracks" onClick="showWoFViz(\'lines\');" />WoF Tracks<br><br><br>';
	wofTabHTML += '<br><br>&nbsp;&nbsp;<b><u>Data Lead-Time</u>:</b><br><br>';
	wofTabHTML += '<table cellpadding="8" cellspacing="0" border="0" width="100%"><tr><td width="160px" height="50px">';
	wofTabHTML += '<span id="wofTime" style="width:160px;height:20px;ouline:none;display:inline-block;text-align:bottom;"></span>';
	wofTabHTML += '</td><td valign="center">';
	wofTabHTML += '<span id="wofLeadTimeLabel" style="height:20px;ouline:none;display:inline-block;text-align:left;"></span>';
	wofTabHTML += '</td></tr></table><br><br><br>';
	wofTabHTML += '&nbsp;&nbsp;<b><u>Data Type/Members/Threshold</u>:</b>&nbsp;&nbsp;&nbsp;&nbsp;<br><br>';
	wofTabHTML += '&nbsp;&nbsp;&nbsp;&nbsp;<select id="wofValSelect" onKeyDown="ignoreKeys();" onChange="changeWoFVal();">';
	wofTabHTML += '<option value="vorml">Mid-Level Vorticity</option>';
	wofTabHTML += '<option value="vor" selected>Low-Level Vorticity</option>'; 
	wofTabHTML += '</select><br><br>';
	wofTabHTML += '<table cellpadding="8" cellspacing="0" border="0" width="100%"><tr><td width="160px">';
	wofTabHTML += '<span id="wofValue" style="width:160px;height:20px;ouline:none;display:inline-block;text-align:bottom;"></span>';
        wofTabHTML += '</td><td align="left" valign="top">';
	wofTabHTML += '<span id="wofValLabel" style="font-weight:bold;width:200px;line-height:20px;ouline:none;display:inline-block;text-align:left;vertical-align:top;"></span>';
	wofTabHTML += '</td></tr><tr><td width="160px">';
        wofTabHTML += '<span id="wofInValue" style="width:160px;height:20px;ouline:none;display:inline-block;text-align:bottom;"></span>';
	wofTabHTML += '</td><td align="left" valign="top">';
        wofTabHTML += '<span id="wofInValLabel" style="font-weight:bold;width:200px;line-height:20px;ouline:none;display:inline-block;text-align:left;vertical-align:top;"></span>';
	wofTabHTML += '</td></tr></table>';
	mainHTML = '<table align="center" border="0" style="font-weight:bold"><tr><td width="530" align="left" valign="top">NSSL Prototype Probabilistic Hazard Information (PHI) Tool</td>';
	mainHTML += '<td align="left" valign="top" ><u>Product</u>:<span id="productsSelect"></span>';
	mainHTML += '<b><u>Opacity</u>:</b><div class="slider" id="opacitySlider-slider" valign="bottom" style="width:80px;height:20px;ouline:none;display:inline-block;text-align:bottom;" tabIndex="1">';
        mainHTML += '<input class="opacitySlider-input" id="opacitySlider-slider-input" valign="bottom" /></div>';
        mainHTML += '<span id="opacitySlider-input" align="left"></span>';
	//mainHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id="mapCoords"></span>';
	mainHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<u>Domain Overrides</u>:&nbsp;&nbsp;<select id="autoProbType" onChange="loadAutoProbRange();"><option style="background-color:yellow" value="severe">Severe</option><option style="background-color:orange" value="lightning">Lightning</option><option style="background-color:red" value="tornado">Tornado</option></select>';
	mainHTML += '&nbsp;&nbsp;&nbsp;&nbsp;Dir:<input id="autoDir" type="text" value="-1" maxlength="3" size="2" onChange="domainOverride();" /> °';
	mainHTML += '&nbsp;&nbsp;&nbsp;&nbsp;Speed:<input id="autoSpd" type="text" value="-1" maxlength="2" size="2" onChange="domainOverride();" /> kts';
	mainHTML += '<span id="validProbMinLabel" style="width:50px;height:20px;ouline:none;display:inline-block;text-align:center;" ></span>';
        mainHTML += '<span id="probSlider" align="left" style="width:120px;height:20px;ouline:none;display:inline-block;text-align:bottom;" ></span>';
        mainHTML += '<span id="validProbMaxLabel" style="width:50px;height:20px;ouline:none;display:inline-block;text-align:center;" ></span>';
	mainHTML += '</td>';
        mainHTML += '<td align="right"><div id="caseSelectOptions">' + caseSelectOptions + '</div></td><td width="1%"></td></tr><tr><td></td><td></td><td></td><td align="center" valign="top">' + sideBar + '</td></tr></table>';
	threatTabHTML = '';
	if(analysis){
		threatTabHTML = '<div id="analysisConfig"></div>';
	}
	else{
		threatTabHTML = '<center><table cellpadding="3" cellspacing="0" width="100%"><tr><td width="150" valign="center">';
		threatTabHTML += '<b><u>Hazard Controls</u>:</b>';
		threatTabHTML += '</td><td width="150" align="left">';
		threatTabHTML += '<img id="tornadoButton" title="Draw Tornado Hazard Area" src="images/tornadoButton.png" onClick="drawThreat(\'tornado\');" onMouseOver="this.src=\'images/tornadoButtonHighlight.png\';" onMouseOut="this.src=\'images/tornadoButton.png\';"/>';
		threatTabHTML += '<img id="severeButton" title="Draw Severe Hazard Area" src="images/severeButton.png" onClick="drawThreat(\'severe\');" onMouseOver="this.src=\'images/severeButtonHighlight.png\';" onMouseOut="this.src=\'images/severeButton.png\';"/>';
		//threatTabHTML += '<img id="hailButton" title="Draw Hail Hazard Area" src="images/hailButton.png" onClick="drawThreat(\'hail\');" onMouseOver="this.src=\'images/hailButtonHighlight.png\';" onMouseOut="this.src=\'images/hailButton.png\';"/>';
		//threatTabHTML += '<img id="windButton" title="Draw Wind Hazard Area" src="images/windButton.png" onClick="drawThreat(\'wind\');" onMouseOver="this.src=\'images/windButtonHighlight.png\';" onMouseOut="this.src=\'images/windButton.png\';"/>';
		threatTabHTML += '<img id="lightningButton" title="Draw Lightning Hazard Area" src="images/lightningButton.png" onClick="drawThreat(\'lightning\');" onMouseOver="this.src=\'images/lightningButtonHighlight.png\';" onMouseOut="this.src=\'images/lightningButton.png\';"/>';
		threatTabHTML += '</td><td valign="center" align="left" width="200">';
		threatTabHTML += '<input type="radio" id="radio_ellipse" name="drawType" onChange="switchControl();" value="ellipse" checked>Ellipse<br>';
		threatTabHTML += '<input type="radio" id="radio_polygon" name="drawType" onChange="switchControl();" value="polygon">Irregular Polygon';
		threatTabHTML += '</td></tr><tr><td width="150" valign="center">';
	        threatTabHTML += '<b><u>Utility Controls</u>:</b>';
	        threatTabHTML += '</td><td width="150" align="left">';
		threatTabHTML += '<img id="copyButton2" title="Copy Hazard Event" src="images/copyButton2.png" onClick="copyThreatInit();" onMouseOver="this.src=\'images/copyButtonHighlight2.png\';" onMouseOut="this.src=\'images/copyButton2.png\';"/>';
		threatTabHTML += '<img id="redrawHazard" title="Redraw Hazard Area" src="images/drawButton.png" onClick="startRedefineThreat();" onMouseOver="this.src=\'images/drawButtonHighlight.png\';" onMouseOut="this.src=\'images/drawButton.png\';" height="29" width="34"/>';
		threatTabHTML += '<img id="linkHazard" title="Transfer Objects" src="images/boreButton.png" onClick="linkObjectsInit();" onMouseOver="this.src=\'images/boreButtonHighlight.png\';" onMouseOut="this.src=\'images/boreButton.png\';" height="29" width="34"/>';
		threatTabHTML += '<td width="200"></td></tr></table>';
		threatTabHTML += '</center><hr color="#000000" />';
		threatTabHTML += '<div id="warningConfig"></div><br><table cellpadding="1" cellspacing="0" border="0"><tr><td valign="top"><div id="attrButtons" style="display:none;"></div></td><td><div class="example-plot" id="chart1" style="height:250px; width:500px; display:none"></div><div class="example-plot" id="chart2" style="height:250px; width:400px; display:none"></div><div class="example-plot" id="chart3" style="height:250px; width:400px; display:none"></div><div class="example-plot" id="chart5" style="height:250px; width:400px; display:none"></div><div class="example-plot" id="chart6" style="height:250px; width:400px; display:none"></div></td></tr></table><div id="activateThreat"></div>';
	}
	//backgroundTabHTML = '<input type="button" name="createBackground" id="createBackground" value="Create Background Probabilities" onClick="loadBackground();" ></input>';
	
	tracksTabHTML = '<center><table cellpadding="3" cellspacing="0" width="100%"><tr><td width="150" valign="center">';
        tracksTabHTML += '<b><u>Drawing Controls</u>:</b>';
        tracksTabHTML += '</td><td width="350" align="left">';
	tracksTabHTML += '<img id="drawButton" title="Draw Tornado Track Line" src="images/drawButton.png" onClick="drawTrack();" onMouseOver="this.src=\'images/drawButtonHighlight.png\';" onMouseOut="this.src=\'images/drawButton.png\';"/>';
	tracksTabHTML += '</td></tr></table></center>';
	tracksTabHTML += '<div id="trackConfig"></div>';

	backgroundTabHTML = '<input type="button" id="genProbs" value="Generate Probs" onClick="loadProbsConfig();" /><div id="backgroundConfig" ></div><div id="activatebackground"></div>';
	activeThreatsHTML = '<b><u>Active Objects</u>:</b><input type="button" id="deactivateThreat" value="Deactivate Threat" onClick="deactivateThreat();" /><input type="button" id="deleteThreat" value="Delete Threat" onClick="deleteThreat();" /><br><select multiple="multiple" name="activeThreats[]" id="activeThreats" style="width:400; height:150" onClick="highlightThreat(this.value,\'single\');" ondblclick="highlightThreat(this.value,\'double\');"></select>';

	timeBar = '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td width="25%" align="center"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td><b><u>Slider</u>:</b></td><td><span id="master-time-input" align="left" style="font-weight: bold; font-size: 26px;"></span></td></tr><tr><td><b><u>Simulation</u>:</b></td><td><span id="archive_time_val" align="left" style="font-weight: bold; font-size: 26px;"></span></td></tr></table></td><td width="5%" align="center"><b><u>Time</u>:</b></td><td width="50%" align="center"><div class="slider" id="master-time-slider" tabIndex="1" style="width:100%;outline:none;"><input class="master-time-input" id="master-time-slider-input" /></div></td><td width="20%" align="center"></td></tr></table>';

	temporalDisplayHTML = '<table cellpadding="0" cellspacing="0" width="100%"><tr><td width="400">' + activeThreatsHTML + '</td><td>' + timeBar + '</td></tr></table>';
	mapHTML = '<div id="map" class="smallmap" ></div>';

	timePanel = '<div id="container" draggable="true" onMouseWheel="zoomTimeCanvas(event);" onDblClick="zoomTimeCanvas(event);" style="height:500px;width:100%;"></div>';
	//timePanel += '<div style="border:1px solid rgb(153,188,232);height:100%;width:100%;">' + activeThreatsHTML + '</div>';
}

function setNCPHTML(){
        // innerHTML for various panels on main page
	caseSelectOptions = '';
	sideBar = '';
	displayTabHTML = '<center><div id="legend"></div></center>';
	displayHTML = '';
	timeButtons = '<b><u>Time</u>:</b>&nbsp;&nbsp;<span id="archive_time_val" align="left" style="font-weight: bold; font-size: 26px; color: #009900;"></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	timeButtons += '<b><u>Slider</u>:</b>&nbsp;&nbsp;<span id="master-time-input" onChange="alert(\'changed!\');" align="left" style="font-weight: bold; font-size: 26px; color: #FF0000;"></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	timeButtons += '<span style="position:absolute;right:0px;">';
	//timeButtons += '<input type="button" value="Copy" onClick="loadCopyWin();" />';
	//timeButtons += '<input type="button" id="extrap" value="Extrapolation" onClick="startExtrap();" />';
	//timeButtons += '<img id="copyButton" title="Copy Probabilities" src="images/copyButton.png" onClick="loadCopyWin();" onMouseOver="this.src=\'images/copyButtonHighlight.png\';" onMouseOut="this.src=\'images/copyButton.png\';"/>';
	//timeButtons += '<img id="drawButton" title="Draw Probabilities" src="images/drawButton.png" onClick="loadBackground();" onMouseOver="this.src=\'images/drawButtonHighlight.png\';" onMouseOut="this.src=\'images/drawButton.png\';"/>';
	//timeButtons += '<img id="ensembleButton" title="Generate Ensemble Probabilities" src="images/ensembleButton.png" onClick="loadProbsConfig();" onMouseOver="this.src=\'images/ensembleButtonHighlight.png\';" onMouseOut="this.src=\'images/ensembleButton.png\';"/>';
	timeButtons += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	timeButtons += '<img title="Go Backward 1 Day" src="images/first_25.gif" onClick="goToStart();" onMouseOver="this.src=\'images/first_25_over.gif\';" onMouseOut="this.src=\'images/first_25.gif\';"/>';
	timeButtons += '<img title="Go Backward 1 Hour" src="images/pre_25.gif" onClick="play = true; advanceScan(\'back\'); play = false;" onMouseOver="this.src=\'images/pre_25_over.gif\';" onMouseOut="this.src=\'images/pre_25.gif\';" />';
	//timeButtons += '<img title="Start Radar Loop" src="images/play_25_over.gif" onClick="playButton();" onMouseOver="this.src=\'images/play_25.gif\';" onMouseOut="this.src=\'images/play_25_over.gif\';" />';
	//timeButtons += '<img title="Stop Radar Loop" src="images/pause1_25_over.gif" onClick="stopButton();" onMouseOver="this.src=\'images/pause1_25.gif\';" onMouseOut="this.src=\'images/pause1_25_over.gif\';"/>';
	timeButtons += '<img title="Go Forward 1 Hour" src="images/next_25.gif" onClick="play = true; advanceScan(\'forward\'); play = false;" onMouseOver="this.src=\'images/next_25_over.gif\';" onMouseOut="this.src=\'images/next_25.gif\';" />';
	timeButtons += '<img title="Go Forward 1 Day" src="images/last_25.gif" onClick="goToEnd();" onMouseOver="this.src=\'images/last_25_over.gif\';" onMouseOut="this.src=\'images/last_25.gif\';"/>';
	//timeButtons += '<img title="Decrease Loop Speed" src="images/speed_up2.gif" onClick="increaseDelay();" onMouseOver="this.src=\'images/speed_up_over2.gif\';" onMouseOut="this.src=\'images/speed_up2.gif\';" />';
	//timeButtons += '<img title="Increase Loop Speed" src="images/speed_down2.gif" onClick="decreaseDelay();" onMouseOver="this.src=\'images/speed_down_over2.gif\';" onMouseOut="this.src=\'images/speed_down2.gif\';" />';
	timeButtons += '<img title="Go to Current Time" src="images/ctime_over.png" onClick="goToNow();" onMouseOver="this.src=\'images/ctime.png\';" onMouseOut="this.src=\'images/ctime_over.png\';" />';
	timeButtons += '</span>';

	modelOpts = '<select id="modelOpt" onKeyDown="ignoreKeys();" onChange="resetOpts(this.value);">';
	modelOpts += '<option value="">Choose Source</option>';
	//modelOpts += '<option value="nsslwrf14">NSSL WRF 2014</option>';
	//modelOpts += '<option value="nsslwrf15">NSSL WRF 2015</option>';
	modelOpts += '<option value="nsslwrf17">NSSL WRF 2017</option>';
	//modelOpts += '<option value="ukmet">UK-MET</option>';
	//modelOpts += '<option value="wof">WoF NEWS-e</option>';
	//modelOpts += '<option value="ouMap">OU MAP Ensemble</option>';
	//modelOpts += '<option value="ouMapProb">OU MAP Probability</option>';
	//modelOpts += '<option value="ouMapSpag">OU MAP Spaghetti</option>';
	//modelOpts += '<option value="ouMap1km">OU MAP 1 km</option>';
	modelOpts += '<option value="hrrr">HRRR</option>';
	modelOpts += '<option value="hrrre">HRRR-E</option>';
	//modelOpts += '<option value="nam">NAM</option>';
	//modelOpts += '<option value="gfs">GFS</option>';
	modelOpts += '<option value="obs">Observations</option>';
	modelOpts += '</select>';
	memberOpts = '<span id="memberOpts">';
	//memberOpts += '<select id="memberOpt" onChange="loadField();">';
	//memberOpts += '<option value="">Choose Member</option>';
	//memberOpts += '</select>';
	memberOpts += '</span>';
	fieldOpts = '<span id="fieldOpts">';
	//fieldOpts += '<select id="fieldOpt" onChange="loadField();">';
	//fieldOpts += '<option value="">Choose Field</option>';
	//fieldOpts += '</select>';
	fieldOpts += '</span>';
	fieldOpts += '<input type="button" value="Clear" onClick="resetOpts();" />';
	fieldOpts += '<b><u>Opacity</u>:</b><div class="slider" id="opacitySlider-slider" valign="bottom" style="width:100px;height:20px;ouline:none;display:inline-block;text-align:bottom;" tabIndex="1">';
	fieldOpts += '<input class="opacitySlider-input" id="opacitySlider-slider-input" valign="bottom" /></div>';
	fieldOpts += '<span id="opacitySlider-input" align="left"></span>';
	fieldOpts += '<span id="fieldOpts2"></span>';

        mainHTML = '<table align="center" border="0" style="font-weight:bold" width="100%"><tr><td width="505" align="left" valign="top">NSSL Prototype Probabilistic Hazard Information (PHI) Tool</td><td align="left" valign="center" ><b><u>Overlay</u>:</b>' + modelOpts + memberOpts + fieldOpts + '</td>';
        mainHTML += '<td align="right">' + caseSelectOptions + '</td><td width="1%"></td></tr><tr><td></td><td></td><td></td><td align="center" valign="top">' + sideBar + '</td></tr></table>';
        backgroundTabHTML = '<div id="tabButtons"><b><u>Forecasting Tools</u>:</b>&nbsp;&nbsp;&nbsp;&nbsp;';
	backgroundTabHTML += '<img id="copyButton" title="Copy Probabilities" src="images/copyButton.png" onClick="loadCopyWin();" onMouseOver="this.src=\'images/copyButtonHighlight.png\';" onMouseOut="this.src=\'images/copyButton.png\';"/>';
       	backgroundTabHTML += '<img id="drawButton" title="Draw Probabilities/Isochrones" src="images/drawButton.png" onClick="loadBackground();" onMouseOver="this.src=\'images/drawButtonHighlight.png\';" onMouseOut="this.src=\'images/drawButton.png\';"/>';
       	//backgroundTabHTML += '<img id="ensembleButton" title="Generate Ensemble Probabilities" src="images/ensembleButton.png" onClick="loadProbsConfig();" onMouseOver="this.src=\'images/ensembleButtonHighlight.png\';" onMouseOut="this.src=\'images/ensembleButton.png\';"/>';
	backgroundTabHTML += '<img id="extrap" title="Extrapolate Observations" onClick="startExtrap();" src="images/extrapButton.png" onMouseOver="this.src=\'images/extrapButtonHighlight.png\';" onMouseOut="this.src=\'images/extrapButton.png\';" />';
	//backgroundTabHTML += '<img id="boreButton" title="Bore Diagnostic Tool" onClick="startBore();" src="images/boreButton.png" onMouseOver="this.src=\'images/boreButtonHighlight.png\';" onMouseOut="this.src=\'images/boreButton.png\';" /><span id="boreGen"></span>';
	backgroundTabHTML += '</div>';
	backgroundTabHTML += '<div id="backgroundConfig" ></div><div id="activatebackground"></div>';
        activeThreatsHTML = '<b><u>Active Threats</u>:</b><input type="button" id="deactivateThreat" value="Deactivate Threat" onClick="deactivateThreat();" /><input type="button" id="deleteThreat" value="Delete Threat" onClick="deleteThreat();" /><br><select multiple="multiple" name="activeThreats[]" id="activeThreats" style="width:400; height:150" onClick="highlightThreat(this.value,\'single\');" ondblclick="highlightThreat(this.value,\'double\');"></select>';

        temporalDisplayHTML = '<table cellpadding="0" cellspacing="0" width="100%"><tr><td width="400">' + activeThreatsHTML + '</td><td>' + timeBar + '</td></tr></table>';
	mapHTML = '<div id="map" class="smallmap" ></div>';
	mapHTML += '<div id="map2" class="smallmap" ></div>';

        timePanel = '<div id="container" draggable="true" onMouseWheel="zoomTimeCanvas(event);" onDblClick="zoomTimeCanvas(event);" style="height:500px;width:100%;"></div>';
}


Ext.require(['*','Ext.data.*','Ext.panel.*','Ext.ux.CheckColumn']);

Ext.onReady(function(){
    Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));
    if(acase == null && site == null){
       setWinHTML();
       win = Ext.create('Ext.window.Window', {
                title: 'Prototype PHI Tool - Input Required',
                header: {
                    titlePosition: 2,
                    titleAlign: 'center'
                },
		closable: false,
                width: 400,
                height: 250,
                layout: {
                    type: 'border',
                    padding: 5
                },
		html: selectOptionsWin
       }).show();
       loadOpMode();
    }
    else{
	loadMap();
    }
});

function loadCopyWin(){
	if(drawType != null){
               	alert('You must deactivate all other controls first');
               	return;
       	}
       	document.getElementById("copyButton").src = "images/copyButtonSelect.png";
       	document.getElementById("copyButton").onmouseout = function(){this.src = "images/copyButtonSelect.png";}
       	document.getElementById("copyButton").onmouseover = function(){this.src = "images/copyButtonSelect.png";}
	innerHTML = '<center><br>';
	innerHTML += '<table cellpadding="2" cellspacing="0"><tr><td align="right">';
	innerHTML += '<b><u>Copy From</u>:</b> ';
	innerHTML += '</td><td>';
	if(site == 'pecan'){
		innerHTML += '<select id="inType" onChange="">';
		innerHTML += '<option value="MCS">MCS Activity</option>';
               	innerHTML += '<option value="CI">Pristine Convective Initiation</option>';
               	innerHTML += '<option value="BORE">Bore Activity</option>';
		innerHTML += '</select>';
	        innerHTML += '</td><td>';
		innerHTML += '<select id="inPeriod" onChange="">';
                innerHTML += '<option value="1_1">Day 1 3-hr Period 1</option>';
                innerHTML += '<option value="1_2">Day 1 3-hr Period 2</option>';
                innerHTML += '<option value="1_3">Day 1 3-hr Period 3</option>';
                innerHTML += '<option value="1_4">Day 1 3-hr Period 4</option>';
                innerHTML += '<option value="1_00_06">Day 1 6-hr Period 1 (00-06 UTC)</option>';
                innerHTML += '<option value="1_06_12">Day 1 6-hr Period 2 (06-12 UTC)</option>';
                innerHTML += '<option value="1_00_12">Day 1 12-hr Full Period (00-12 UTC)</option>';
                innerHTML += '<option value="2_00_12">Day 2 12-hr Full Period (00-12 UTC)</option>';
		innerHTML += '</select>';
	        innerHTML += '</td><td>';
		innerHTML += '<select id="inIssue" onChange="">';
                innerHTML += '<option value="morning">Morning (9am)</option>';
                innerHTML += '<option value="afternoon">Afternoon (3pm)</option>';
                innerHTML += '<option value="evening1">Evening 1 (6pm)</option>';
                innerHTML += '<option value="evening2">Evening 2 (7pm)</option>';
                innerHTML += '<option value="evening3">Evening 3 (9pm)</option>';
                innerHTML += '<option value="evening4">Evening 4 (10pm)</option>';
                innerHTML += '<option value="evening5">Evening 5 (11pm)</option>';
                innerHTML += '<option value="evening6">Evening 6 (12am)</option>';
		innerHTML += '</select>';
	        innerHTML += '</td></tr><tr><td align="right">';
	        innerHTML += '<b><u>Copy To</u>:</b> ';
	        innerHTML += '</td><td>';
		innerHTML += '<select id="outType" onChange="">';
                innerHTML += '<option value="MCS">MCS Activity</option>';
                innerHTML += '<option value="CI">Pristine Convective Initiation</option>';
                innerHTML += '<option value="BORE">Bore Activity</option>';
                innerHTML += '</select>';
                innerHTML += '</td><td>';
		innerHTML += '<select id="outPeriod" onChange="">';
                innerHTML += '<option value="1_1">Day 1 3-hr Period 1</option>';
                innerHTML += '<option value="1_2">Day 1 3-hr Period 2</option>';
                innerHTML += '<option value="1_3">Day 1 3-hr Period 3</option>';
                innerHTML += '<option value="1_4">Day 1 3-hr Period 4</option>';
                innerHTML += '<option value="1_00_06">Day 1 6-hr Period 1 (00-06 UTC)</option>'; 
                innerHTML += '<option value="1_06_12">Day 1 6-hr Period 2 (06-12 UTC)</option>';
                innerHTML += '<option value="1_00_12">Day 1 12-hr Full Period (00-12 UTC)</option>';
                innerHTML += '<option value="2_00_12">Day 2 12-hr Full Period (00-12 UTC)</option>';
		innerHTML += '</select>';
                innerHTML += '</td><td>';
		innerHTML += '<select id="outIssue" onChange="">';
                innerHTML += '<option value="morning">Morning (9am)</option>';
                innerHTML += '<option value="afternoon">Afternoon (3pm)</option>';
                innerHTML += '<option value="evening1">Evening 1 (6pm)</option>';
                innerHTML += '<option value="evening2">Evening 2 (7pm)</option>';
                innerHTML += '<option value="evening3">Evening 3 (9pm)</option>';
                innerHTML += '<option value="evening4">Evening 4 (10pm)</option>';
                innerHTML += '<option value="evening5">Evening 5 (11pm)</option>';
                innerHTML += '<option value="evening6">Evening 6 (12am)</option>';
		innerHTML += '</select>';
	        innerHTML += '</td></tr></table><br>';
	        innerHTML += '<input type="button" value="Copy" onClick="copyContours();" /><input type="button" value="Cancel" onClick="cancelContours();" /></center>';
                var winWidth = 680;
	}
	else{
		innerHTML += '<select id="inDeskType" onChange="reloadHazardOpts(); reloadInOpts(); reloadOutOpts();">';
                innerHTML += '<option value="NSSL">NSSL</option>';
                innerHTML += '<option value="SPC">SPC</option>';
                innerHTML += '</select>';
                innerHTML += '</td><td>';
		innerHTML += '<div id="inHazardType"></div>';
                innerHTML += '</td><td>';
		innerHTML += '<select id="inIssue" onChange="reloadInOpts();">';
                innerHTML += '<option value="morning">Morning</option>';
                innerHTML += '<option value="afternoon">Afternoon</option>';
                innerHTML += '</select>';
		innerHTML += '</td><td>';
		innerHTML += '<div id="inPeriodType"></div>';
	        innerHTML += '</td></tr><tr><td align="right">';
	        innerHTML += '<b><u>Copy To</u>:</b> ';
	        innerHTML += '</td><td>';
		innerHTML += '</td><td>';
		innerHTML += '<div id="outHazardType"></div>';
		innerHTML += '</td><td>';
		innerHTML += '<select id="outIssue" onChange="reloadOutOpts();">';
                innerHTML += '<option value="morning">Morning</option>';
                innerHTML += '<option value="afternoon">Afternoon</option>';
                innerHTML += '</select>';
		innerHTML += '</td><td>';
		innerHTML += '<div id="outPeriodType"></div>';
	        innerHTML += '</td></tr></table><br>';
	        innerHTML += '<input type="button" value="Copy" onClick="copyContours();" /><input type="button" value="Cancel" onClick="cancelContours();" /></center>';
		var winWidth = 680;
	}
	win = Ext.create('Ext.window.Window', {
		title: 'Copy Contours',
               	header: {
                    titlePosition: 2,
                    titleAlign: 'center'
               	},
               	closable: false,
               	width: winWidth,
               	height: 200,
               	layout: {
                    type: 'border',
                    padding: 5
               	},
               	html: innerHTML
	}).show();

	timeCheck = new Date();
        if(timeCheck.getUTCHours() < 18 && timeCheck.getUTCHours() > 9){
                document.getElementById('outIssue').selectedIndex = 0;
        }
        else{
                document.getElementById('outIssue').selectedIndex = 1;
		document.getElementById('outIssue').options[0].disabled = true;
        }

	reloadHazardOpts();
	reloadInOpts();
        reloadOutOpts();

	tNow = new Date(parseInt(timeCanvasVal.getAttr('time')) * 1000);
	tCheck = tNow.getUTCHours();
	if(tCheck < 18){
		tCheck += 24;
	}
	sel1 = document.getElementById('inPeriod');
	sel2 = document.getElementById('outPeriod');
	idx1 = -99;
	idx2 = -99;
	for(i=0;i<sel1.options.length;i++){
		hNow = sel1.options[i].value.split('_')[1];
		if(tCheck == hNow){
			idx1 = i;
			break;
		}
	}
	if(idx1 != -99){
		sel1.selectedIndex = idx1;
	}

	for(i=0;i<sel2.options.length;i++){
                hNow = sel2.options[i].value.split('_')[1];
                if(tCheck == hNow && document.getElementById('outIssue').selectedIndex == 1){
                        idx2 = i;
                        break;
                }
		else if((tCheck + 1) == hNow){
			idx2 = i;
                        break;
		}
        }
        if(idx2 != -99){
                sel2.selectedIndex = idx2;
        }

}

function reloadHazardOpts(){
	if(site != 'hwt'){
                return;
        }

        var inType = document.getElementById("inDeskType").value;
	if(inType == 'SPC'){
		innerHTML = '<select id="inType">';
		innerHTML += '<option value="tornado">Tornado (EF0+)</option>';
                innerHTML += '<option value="hail">Hail (1"+)</option>';
                innerHTML += '<option value="wind">Wind (50 kts+)</option>';
		innerHTML += '</select>';
	}
	else{
		innerHTML = '<select id="inType">';
		innerHTML += '<option value="coverage">Hourly Report Coverage</option>';
		innerHTML += '<option value="isochrone">Hourly Isochrones</option>';
                innerHTML += '</select>';
	}
	document.getElementById("inHazardType").innerHTML = innerHTML;

	if(inType == 'SPC'){
                innerHTML = '<select id="outType">';
                innerHTML += '<option value="tornado">Tornado (EF0+)</option>';
                innerHTML += '<option value="hail">Hail (1"+)</option>';
                innerHTML += '<option value="wind">Wind (50 kts+)</option>';
                innerHTML += '</select>';
        }
        else{
                innerHTML = '<select id="outType">';
		innerHTML += '<option value="coverage">Hourly Report Coverage</option>';
               	innerHTML += '<option value="isochrone">Hourly Isochrones</option>';
                innerHTML += '</select>';
        }
	document.getElementById("outHazardType").innerHTML = innerHTML;
}

function reloadInOpts(){
	if(site != 'hwt'){
		return;
	}

        var inType = document.getElementById("inDeskType").value;
	var inIssue = document.getElementById("inIssue").value;

	innerHTML = '<select id="inPeriod" onChange="">';
	if(inType == 'NSSL'){
                if(inIssue == 'morning'){
			innerHTML += '<option value="1_18_30">Day 1 4-hr Periods 1-9 (18-06 UTC)</option>';
                }
                else{
			//innerHTML += '<option value="1_22_30">Day 1 4-hr Periods 3-5 (22-06 UTC)</option>';
                }
        }
        else{
		if(inIssue == 'morning'){
                        innerHTML += '<option value="1_18_22">Day 1 4-hr Period 1 (18-22 UTC)</option>';
                        innerHTML += '<option value="1_22_26">Day 1 4-hr Period 2 (22-02 UTC)</option>';
                }
                else{
                        innerHTML += '<option value="1_22_26">Day 1 4-hr Period 2 (22-02 UTC)</option>';
                }
	}
	innerHTML += '</select>';
	document.getElementById("inPeriodType").innerHTML = innerHTML;
}

function reloadOutOpts(){
	if(site != 'hwt'){
		return;
	}

        var inType = document.getElementById("inDeskType").value;
        var outIssue = document.getElementById("outIssue").value;

	innerHTML = '<select id="outPeriod" onChange="">';
        if(inType == 'NSSL'){
                if(outIssue == 'morning'){
			innerHTML += '<option value="1_18_30">Day 1 4-hr Periods 1-9 (18-06 UTC)</option>';
                }
                else{
			//innerHTML += '<option value="1_22_30">Day 1 4-hr Periods 3-5 (22-06 UTC)</option>';
                }
        }
        else{
                if(outIssue == 'morning'){
                        innerHTML += '<option value="1_18_22">Day 1 4-hr Period 1 (18-22 UTC)</option>';
                        innerHTML += '<option value="1_22_26">Day 1 4-hr Period 2 (22-02 UTC)</option>';
                }
                else{
                        innerHTML += '<option value="1_22_26">Day 1 4-hr Period 2 (22-02 UTC)</option>';
                }
        }
        innerHTML += '</select>';
        document.getElementById("outPeriodType").innerHTML = innerHTML;

}

function copyContours(){
	background_area.removeAllFeatures();
        deletePendingRecords();
	var copied = false;
	var copyFrom = document.getElementById('inPeriod').value.split('_');
	var copyFromIssue = document.getElementById('inIssue').value;
	var copyFromType = document.getElementById('inType').value;
	var copyTo = document.getElementById('outPeriod').value.split('_');
	var copyToIssue = document.getElementById('outIssue').value;
	var copyToType = document.getElementById('outType').value;
	var diff1 = copyTo[1] - copyFrom[1];
	var diff2 = copyTo[2] - copyFrom[2];
	cNums = [];
	for(var i6=0;i6<activeProbs.features.length;i6++){
		if(activeProbs.features[i6].attributes.fStart == copyFrom[1] && activeProbs.features[i6].attributes.fEnd == copyFrom[2] && activeProbs.features[i6].attributes.issueType == copyFromIssue){
			if(activeProbs.features[i6].attributes.hazType != copyFromType){
				continue;
			}
			else if(copyToType == 'all' && copyFromIssue == 'morning' && copyToIssue == 'afternoon' && activeProbs.features[i6].attributes.prob == '18_22'){
				continue;
			}
			else if(copyToType == 'all' && copyFromIssue == 'morning' && copyToIssue == 'afternoon' && activeProbs.features[i6].attributes.prob == '20_24'){
                                continue;
                        }
			console.log(copyToType + ',' + copyFrom[0] + ',' + copyFrom[1] + ',' + copyTo[0]);
			var newFeat = activeProbs.features[i6].clone();
			newFeat.attributes.fStart = copyTo[1];
			newFeat.attributes.fEnd = copyTo[2];
			newFeat.attributes.show = true;
			newFeat.attributes.startTime = newFeat.attributes.startTime + (diff1 * 3600);
			newFeat.attributes.endTime = newFeat.attributes.endTime + (diff2 * 3600);
			newFeat.attributes.hazType = copyToType;
			newFeat.attributes.issueType = copyToIssue;
			newFeat.attributes.ncpRecord = copyToIssue + '_' + newFeat.attributes.ncpRecord.split('_')[1] + '_' + copyToType;
			cNums.push(parseInt(newFeat.attributes.probID));
			timeCanvasVal.setAttr('time',newFeat.attributes.startTime);
			background_area.addFeatures([newFeat]);
			copied = true;
		}
	}
	if(!copied){
		cancelContours();
		alert('No input features available - nothing done.');
		return;
	}

	contourNumber = cNums.max();

       	document.getElementById("drawButton").src = "images/drawButtonSelect.png";
       	document.getElementById("drawButton").onclick = unloadBackground;
       	document.getElementById("drawButton").onmouseout = function(){this.src = "images/drawButtonSelect.png";}
       	document.getElementById("drawButton").onmouseover = function(){this.src = "images/drawButtonSelect.png";}
       	backGPanel = Ext.getCmp('backgroundPanel');
       	backGPanel.show();

	loadBackground(null,true);
	drawType = 'background';	
	if(site == 'hwt'){
		inDesk = document.getElementById('inDeskType').value;
		deskSel = document.getElementById('deskType');
		for(var j4=0;j4<deskSel.options.length;j4++){
	                if(deskSel.options[j4].value == inDesk){
	                        deskSel.selectedIndex = j4;
	                        break;
	                }
	        }
		loadPeriods();
                loadHazards();
	        deskSel.disabled = true;
	}
	hazardSel = document.getElementById('hazardType');
       	for(var j4=0;j4<hazardSel.options.length;j4++){
               	if(hazardSel.options[j4].value == newFeat.attributes.hazType){
                       	hazardSel.selectedIndex = j4;
                       	break;
               	}
       	}
       	hazardSel.disabled = true;

	for(var i6=0;i6<background_area.features.length;i6++){
		loadContours(background_area.features[i6].attributes.probID,background_area.features[i6].attributes.prob);
		contourSel = document.getElementById('contourVal' + background_area.features[i6].attributes.probID);
		for(var j4=0;j4<contourSel.options.length;j4++){
			if(contourSel.options[j4].value == background_area.features[i6].attributes.prob){
				contourSel.selectedIndex = j4;
				break;
			}
		}
		loadContourColor(background_area.features[i6].attributes.probID);
	}
	insertNCPRecord(newFeat.clone(),'Pending');
	pending = true;

	moveSliderTime();
       	loadContours(contourNumber + 1);
        periodSel = document.getElementById('periodVal');
        for(var j4=0;j4<periodSel.options.length;j4++){
               	if(periodSel.options[j4].value == document.getElementById('outPeriod').value){
                        periodSel.selectedIndex = j4;
                       	break;
	        }
        }
        periodSel.disabled = true;

	backgroundCheck = false;
       	selectGrid();
        changeTime();

	cancelContours();
}

function cancelContours(){
	win.destroy();
       	win = null;
       	document.getElementById("copyButton").onmouseout = function(){this.src = "images/copyButton.png";}
       	document.getElementById("copyButton").onmouseover = function(){this.src = "images/copyButtonHighlight.png";}
       	document.getElementById("copyButton").src = "images/copyButton.png";
}

function resetOpts(val){
	if(val == null || val == ''){
		if(document.getElementById('obsMap') && document.getElementById('obsMap').checked){
			document.getElementById('obsMap').checked = false;
			loadObsMap();
		}
		document.getElementById('modelOpt').selectedIndex = 0;
		document.getElementById('memberOpts').innerHTML = '';
		document.getElementById('fieldOpts').innerHTML = '';
		document.getElementById('fieldOpts2').innerHTML = '';
		imgNameLast = null;
		imgNameLast2 = '';
		if(map.layers.indexOf(modelLayer) != -1){
                        map.removeLayer(modelLayer);
                }
		if(obsMap && map2.layers.indexOf(obsLayer) != -1){
                        map2.removeLayer(obsLayer);
                }
		timeDelta = 3600;
	}
	else{
		if(val == 'nsslwrf14'){
			memberOpts = nsslwrfEnsemble14['members'];
			memberNames = nsslwrfEnsemble14['names'];
			fieldOpts = nsslwrfEnsemble14['fields'];
			fieldNames = nsslwrfEnsemble14['fieldNames'];
			initOpts = initOpts_nsslwrf14;
		}
		else if(val == 'nsslwrf15'){
                        memberOpts = nsslwrfEnsemble15['members'];
                        memberNames = nsslwrfEnsemble15['names'];
                        fieldOpts = nsslwrfEnsemble15['fields'];
                        fieldNames = nsslwrfEnsemble15['fieldNames'];
                        initOpts = initOpts_nsslwrf15;
                }
		else if(val == 'nsslwrf17'){
                       	memberOpts = nsslwrfEnsemble17['members'];
                       	memberNames = nsslwrfEnsemble17['names'];
                       	fieldOpts = nsslwrfEnsemble17['fields'];
                       	fieldNames = nsslwrfEnsemble17['fieldNames'];
                       	initOpts = initOpts_nsslwrf17;
               	}
		else if(val == "ouMap"){
			memberOpts = ouMapEnsemble['members'];
                        memberNames = ouMapEnsemble['names'];
                        fieldOpts = ouMapEnsemble['fields'];
                        fieldNames = ouMapEnsemble['fieldNames'];
                        initOpts = initOpts_ouMap;
		}
		else if(val == "ouMap1km"){
                        memberOpts = ouMap1km['members'];
                        memberNames = ouMap1km['names'];
                        fieldOpts = ouMap1km['fields'];
                        fieldNames = ouMap1km['fieldNames'];
                        initOpts = initOpts_ouMap1km;
                }
               	else if(val == "ouMapProb"){
                        memberOpts = ouMapProb['members'];
                        memberNames = ouMapProb['names'];
                       	fieldOpts = ouMapProb['fields'];
                        fieldNames = ouMapProb['fieldNames'];
                        initOpts = initOpts_ouMapProb;
               	}
               	else if(val == "ouMapSpag"){
                        memberOpts = ouMapSpag['members'];
                        memberNames = ouMapSpag['names'];
                       	fieldOpts = ouMapSpag['fields'];
                        fieldNames = ouMapSpag['fieldNames'];
                        initOpts = initOpts_ouMapSpag;
               	}
		else if(val == 'ukmet'){
			memberOpts = ukmetEnsemble['members'];
                        memberNames = ukmetEnsemble['names'];
                        fieldOpts = ukmetEnsemble['fields'];
                        fieldNames = ukmetEnsemble['fieldNames'];
			initOpts = initOpts_ukmet;
		}
		else if(val == 'wof'){
                        memberOpts = wofEnsemble['members'];
                       	memberNames = wofEnsemble['names'];
                        fieldOpts = wofEnsemble['fields'];
                        fieldNames = wofEnsemble['fieldNames'];
                        initOpts = initOpts_wof;
                }
		else if(val == 'hrrr'){
                       	memberOpts = hrrrEnsemble['members'];
                       	memberNames = hrrrEnsemble['names'];
                        fieldOpts = hrrrEnsemble['fields'];
                       	fieldNames = hrrrEnsemble['fieldNames'];
			initOpts = initOpts_hrrr;
                }
		else if(val == 'hrrre'){
                       	memberOpts = hrrrEnsembleE['members'];
                       	memberNames = hrrrEnsembleE['names'];
                       	fieldOpts = hrrrEnsembleE['fields'];
                       	fieldNames = hrrrEnsembleE['fieldNames'];
                       	initOpts = initOpts_hrrre;
                }
		else if(val == 'nam'){
                        memberOpts = namEnsemble['members'];
                        memberNames = namEnsemble['names'];
                        fieldOpts = namEnsemble['fields'];
                        fieldNames = namEnsemble['fieldNames'];
                        initOpts = initOpts_nam;
                }
		else if(val == 'gfs'){
                        memberOpts = gfsEnsemble['members'];
                        memberNames = gfsEnsemble['names'];
                        fieldOpts = gfsEnsemble['fields'];
                        fieldNames = gfsEnsemble['fieldNames'];
                        initOpts = initOpts_gfs;
                }
		else if(val == 'obs'){
			memberOpts = conusObs['members'];
                        memberNames = conusObs['names'];
                        fieldOpts = conusObs['radarObs'];
                        fieldNames = conusObs['radarObsNames'];
		}
		else{
			memberOpts = [];
			memberNames = [];
			fieldOpts = [];
			fieldNames = [];
		}

		if(val == 'obs'){
			innerHTML = '<select id="memberOpt" onKeyDown="ignoreKeys();" onChange="swapFields();">';
                        innerHTML += '<option value="">Choose Source</option>';
			if(document.getElementById('obsMap') && document.getElementById('obsMap').checked){
	                        document.getElementById('obsMap').checked = false;
				loadObsMap();
	                }
                        document.getElementById('fieldOpts2').innerHTML = '';
			imgNameLast = '';
	                imgNameLast2 = '';
		}
		else{
			innerHTML = '<select id="initOpt" onKeyDown="ignoreKeys();" onMouseOver="updateInitOptions();" onChange="updateInitOptions(); loadField();">';
                        for(i=0;i<initOpts.length;i++){
				innerHTML += '<option value="' + initOpts[i] + '">' + initOpts[i] + '</option>';
			}
			innerHTML += '</select>';
			innerHTML += '<select id="memberOpt" onKeyDown="ignoreKeys();" onChange="loadField();">';
			innerHTML += '<option value="">Choose Member</option>';
			map2HTML = '<input type="checkbox" id="obsMap" onClick="loadObsMap();" /> Compare To: ';
			map2HTML += '<select id="map2Overlay" onKeyDown="ignoreKeys();" onChange="loadField(true);">';
			map2HTML += '<option value="obs">Observations</option>';
			//map2HTML += '<option value="ukmet_2km">UK-MET 2 km</option>';
			//map2HTML += '<option value="ukmet_4km">UK-MET 4 km</option>';
			map2HTML += '</select>';
			document.getElementById('fieldOpts2').innerHTML = map2HTML;
			imgNameLast = '';
	                imgNameLast2 = '';
		}
		for(i=0;i<memberOpts.length;i++){
			innerHTML += '<option value="' + memberOpts[i] + '">' + memberNames[i] + '</option>';
		}
		innerHTML += '</select>';
		document.getElementById('memberOpts').innerHTML = innerHTML;
		if(memberOpts.length == 1){
			document.getElementById('memberOpt').selectedIndex = 1;
		}
		else{
			document.getElementById('memberOpt').selectedIndex = 0;
		}

		innerHTML = '<select id="fieldOpt" onKeyDown="ignoreKeys();" onChange="loadField();">';
		innerHTML += '<option value="">Choose Field</option>';
		for(i=0;i<fieldOpts.length;i++){
                        innerHTML += '<option value="' + fieldOpts[i] + '">' + fieldNames[i] + '</option>';
                }
                innerHTML += '</select>';
		document.getElementById('fieldOpts').innerHTML = innerHTML;

                //document.getElementById('memberOpt').selectedIndex = 0;
                document.getElementById('fieldOpt').selectedIndex = 0;
		if(map.layers.indexOf(modelLayer) != -1){
                        map.removeLayer(modelLayer);
                }
		if(obsMap && map2.layers.indexOf(obsLayer) != -1){
                        map2.removeLayer(obsLayer);
                }
	}
	if(document.getElementById('legend') != null){
	        document.getElementById('legend').innerHTML = '';
	}
}

function swapFields(){
	if(document.getElementById('memberOpt').value == 'radar'){
		fieldOpts = conusObs['radarObs'];
               	fieldNames = conusObs['radarObsNames'];
	}
	else if(document.getElementById('memberOpt').value == 'satellite'){
		fieldOpts = conusObs['satelliteObs'];
                fieldNames = conusObs['satelliteObsNames'];
	}
	else{
		fieldOpts = conusObs['analysisObs'];
               	fieldNames = conusObs['analysisObsNames'];
	}
	innerHTML = '<select id="fieldOpt" onKeyDown="ignoreKeys();" onChange="loadField();">';
       	innerHTML += '<option value="">Choose Field</option>';
       	for(i=0;i<fieldOpts.length;i++){
               	innerHTML += '<option value="' + fieldOpts[i] + '">' + fieldNames[i] + '</option>';
       	}
       	innerHTML += '</select>';
	document.getElementById('fieldOpts').innerHTML = innerHTML;
	document.getElementById('fieldOpt').selectedIndex = 0;
       	if(map.layers.indexOf(modelLayer) != -1){
               	map.removeLayer(modelLayer);
       	}
	if(obsMap && map2.layers.indexOf(obsLayer) != -1){
                map2.removeLayer(obsLayer);
        }
	if(document.getElementById('legend') != null){
               	document.getElementById('legend').innerHTML = '';
       	}
	timeDelta = 3600;
}

function loadField(map2Bool){
	if(document.getElementById('modelOpt').value == '' || document.getElementById('memberOpt').value == '' || document.getElementById('fieldOpt').value == ''){
		if(map.layers.indexOf(modelLayer) != -1){
	                map.removeLayer(modelLayer);
	        }
		if(obsMap && map2.layers.indexOf(obsLayer) != -1){
			map2.removeLayer(obsLayer);
		}
		if(document.getElementById('legend') != null){
		        document.getElementById('legend').innerHTML = '';
		}
		imgNameLast = '';
		timeDelta = 3600;
		showUHObjects();
		return;
	}
	var modelOpt = document.getElementById('modelOpt').value;
        var memberOpt = document.getElementById('memberOpt').value;
        var fieldOpt = document.getElementById('fieldOpt').value;

	if(fieldOpt == 'uhObjects'){
		displayUHObjects();
		return;
	}
	else{
		uhObjects.removeAllFeatures();
	       	showUHObjects();
	       	uhMember = null;
	}

	var imgAttrs = null;
	if(modelOpt == 'nsslwrf14'){
		var imgAttrs = displayNSSLWRF14();
	}
	else if(modelOpt == 'nsslwrf15'){
		var imgAttrs = displayNSSLWRF15();
        }
	else if(modelOpt == 'nsslwrf17'){
                var imgAttrs = displayNSSLWRF17();
        }
	else if(modelOpt == 'ouMap' || modelOpt == 'ouMap1km' || modelOpt == 'ouMapProb' || modelOpt == 'ouMapSpag'){
		var imgAttrs = displayOUMap();
	}
	else if(modelOpt == 'ukmet'){
		var imgAttrs = displayUKMET();
        }
	else if(modelOpt == 'wof'){
		var imgAttrs = displayWOF();
        }
	else if(modelOpt == 'hrrr'){
		var imgAttrs = displayHRRR();
        }
	else if(modelOpt == 'hrrre'){
                var imgAttrs = displayHRRRE();
        }
	else if(modelOpt == 'gfs'){
		var imgAttrs = displayGFS();
        }
	else if(modelOpt == 'nam'){
		var imgAttrs = displayNAM();
        }
	else if(modelOpt == 'obs'){
		var imgAttrs = displayOBS();
        }

	// kill if nothing to display
	if(imgAttrs == null){
		return;
	}

	var imgName = imgAttrs[0];
	var imgPath = imgAttrs[1];
	var imgBounds = imgAttrs[2];
	var modelHours = imgAttrs[3];
	var maxFields = imgAttrs[4];
	var tDiff = imgAttrs[5];
	var hFactor = imgAttrs[6];
	var minute = imgAttrs[7];

	// probably need to figure out obsmap2 here

	if(memberOpt == 'max' && maxFields.indexOf(fieldOpt) == -1 || tDiff < 0 || tDiff > modelHours){
		// if trying to display a max field that doesn't exist, clear everything
		// or if time is less than or greater than display interval
               	if(map.layers.indexOf(modelLayer) != -1){
                       	map.removeLayer(modelLayer);
               	}
               	if(obsMap && map2.layers.indexOf(obsLayer) != -1){
                        map2.removeLayer(obsLayer);
                }
                if(document.getElementById('legend') != null){
                       	document.getElementById('legend').innerHTML = '';
                }
                imgNameLast = imgName;
                if(obsMap){
			// !!!!!!
                       	imgNameLast2 = imgName2;
                }
                return;
        }
	else if(imgName == imgNameLast && map2Bool == null){
                if(document.getElementById('legend') != null){
                        document.getElementById('legend').innerHTML = '<img src="images/color_scale_' + document.getElementById('fieldOpt').value + '.png" />';
                }
                return;
        }
        else if(map.layers.indexOf(modelLayer) != -1){
                map.removeLayer(modelLayer);
        }

	var imgOptions = {isBaseLayer: false, transparent: true, visibility: true, displayInLayerSwitcher:false, opacity: modelOpacity};
        modelLayer = new OpenLayers.Layer.Image('modelLayer',imgPath,imgBounds,new OpenLayers.Size(1, 1),imgOptions);
        map.addLayer(modelLayer);
        blank.setZIndex(0);
        modelLayer.setZIndex(200);
        if(document.getElementById('legend') != null){
                document.getElementById('legend').innerHTML = '<img src="images/color_scale_' + document.getElementById('fieldOpt').value + '.png" />';
        }
        imgNameLast = imgName;	

	if(obsMap){
		if(hourMaxFields.indexOf(fieldOpt) != -1 && modelOpt != 'ukmet'){
			var tNow = new Date((timeCanvasVal.getAttr('time') + 3600) * 1000);
			var tNowObs = new Date((timeCanvasVal.getAttr('time') + 3600) * 1000);
		}
		else if(memberOpt == 'ukmet_2km'){
	               	var tNow = new Date((timeCanvasVal.getAttr('time') - 10800) * 1000);
			var tNowObs = new Date(timeCanvasVal.getAttr('time') * 1000);
	       	}
		else{
			var tNow = new Date(timeCanvasVal.getAttr('time') * 1000);
			var tNowObs = new Date(timeCanvasVal.getAttr('time') * 1000);
		}
	       	var tNowC = new Date((timeCanvasNow.getAttr('time') - (hFactor * 3600)) * 1000);
		var dateStampC = String(tNowC.getUTCFullYear()) + String(pad(tNowC.getUTCMonth() + 1)) + String(pad(tNowC.getUTCDate())) + String(pad(tNowC.getUTCHours()));
	       	var timeStampC = dateStampC + minute;
		var tNowR = new Date((parseInt(timeCanvasNow.getAttr('time')) - 3600 - (hFactor * 3600)) * 1000);
	       	var dateStampR = String(tNowR.getUTCFullYear()) + String(pad(tNowR.getUTCMonth() + 1)) + String(pad(tNowR.getUTCDate())) + String(pad(tNowR.getUTCHours()));
	       	var timeStampR = dateStampR + minute;
		var dateStamp = String(tNowObs.getUTCFullYear()) + String(pad(tNowObs.getUTCMonth() + 1)) + String(pad(tNowObs.getUTCDate())) + String(pad(tNowObs.getUTCHours()));
		var timeStamp = dateStamp + minute;

		if(document.getElementById('fieldOpt').value == 'uphlcy' && document.getElementById('map2Overlay').value == 'obs' || document.getElementById('fieldOpt').value == 'uphlcy25' && document.getElementById('map2Overlay').value == 'obs' || document.getElementById('fieldOpt').value == 'vort005' && document.getElementById('map2Overlay').value == 'obs' || document.getElementById('fieldOpt').value == 'maxuh' && document.getElementById('map2Overlay').value == 'obs'){
			obCPart = 'azshear';
		}
		else if(document.getElementById('fieldOpt').value == 'hailcast' && document.getElementById('map2Overlay').value == 'obs'){
			obCPart = 'mesh';
		}
		else if(document.getElementById('fieldOpt').value == 'reflMean' && document.getElementById('map2Overlay').value == 'obs' || document.getElementById('fieldOpt').value == 'cref' && document.getElementById('map2Overlay').value == 'obs'){
			obCPart = 'refl';
		}
		else if(document.getElementById('fieldOpt').value == 'dbz1km' && document.getElementById('map2Overlay').value == 'obs'){
			obCPart = 'refl1km';
		}
		else if(document.getElementById('fieldOpt').value == 'dewp' && document.getElementById('map2Overlay').value == 'obs'){
                       	obCPart = 'td2m';
               	}
		else if(document.getElementById('fieldOpt').value == 'temp' && document.getElementById('map2Overlay').value == 'obs' || document.getElementById('fieldOpt').value == 'pmsl' && document.getElementById('map2Overlay').value == 'obs'){
                       	obCPart = 't2m';
               	}
		else if(document.getElementById('fieldOpt').value == 'hlcy3' && document.getElementById('map2Overlay').value == 'obs' || document.getElementById('fieldOpt').value == 'srh_3km' && document.getElementById('map2Overlay').value == 'obs'){
                       	obCPart = 'hlcy03';
               	}
               	else if(document.getElementById('fieldOpt').value == 'hlcy1' && document.getElementById('map2Overlay').value == 'obs' || document.getElementById('fieldOpt').value == 'srh_1km' && document.getElementById('map2Overlay').value == 'obs'){
                       	obCPart = 'hlcy01';
               	}
		else if(document.getElementById('fieldOpt').value == 'cape0000m' && document.getElementById('map2Overlay').value == 'obs'){
                       	obCPart = 'cape';
                }
		else{
			obCPart = document.getElementById('fieldOpt').value;
		}
		if(document.getElementById('map2Overlay').value == 'obs'){
                        var imgName2 = obCPart + '__obs_' + timeStamp + '.png';
			var imgPath2 = 'realtime/efp/obs/' + dateStamp.slice(0,-2) + '/' + imgName2;
			var imgName3 = obCPart + '__obs_' + timeStampC + '.png';
                       	var imgPath3 = 'realtime/efp/obs/' + dateStampC.slice(0,-2) + '/' + imgName3;
			var imgName4 = obCPart + '__obs_' + timeStampR + '.png';
                        var imgPath4 = 'realtime/efp/obs/' + dateStampR.slice(0,-2) + '/' + imgName4;
		}
		else if(document.getElementById('fieldOpt').value == 'uphlcy'){
			if(document.getElementById('map2Overlay').value == 'ukmet_2km' && document.getElementById('memberOpt').value == 'ukmet_2km'){
				var off = 0;
			}
			else if(document.getElementById('memberOpt').value == 'ukmet_2km' && document.getElementById('map2Overlay').value == 'ukmet_4km'){
				var off = -3;
			}
			else if(document.getElementById('map2Overlay').value == 'ukmet_4km'){
				var off = 0;
			}
			else if(document.getElementById('map2Overlay').value == 'ukmet_2km'){
				var off = 3;
			}
			else{
				var off = 1;
			}
			var imgName2 = document.getElementById('map2Overlay').value + '_' + document.getElementById('fieldOpt').value + '_' + document.getElementById('initOpt').value + 'f0' + pad(tDiff - off) + '.png';
                       	var imgPath2 = 'realtime/efp/images/' + document.getElementById('initOpt').value + '/' + document.getElementById('map2Overlay').value + '/' + imgName2;
		}
		else if(document.getElementById('map2Overlay').value == 'ukmet_2km' && document.getElementById('memberOpt').value != 'ukmet_2km'){
			var off = 3;
			var imgName2 = document.getElementById('map2Overlay').value + '_' + document.getElementById('fieldOpt').value + '_' + document.getElementById('initOpt').value + 'f0' + pad(tDiff - off) + '.png';
                       	var imgPath2 = 'realtime/efp/images/' + document.getElementById('initOpt').value + '/' + document.getElementById('map2Overlay').value + '/' + imgName2;
		}
		else if(document.getElementById('map2Overlay').value == 'ukmet_4km' && document.getElementById('memberOpt').value == 'ukmet_2km'){
			var off = -3;
                       	var imgName2 = document.getElementById('map2Overlay').value + '_' + document.getElementById('fieldOpt').value + '_' + document.getElementById('initOpt').value + 'f0' + pad(tDiff - off) + '.png';
                       	var imgPath2 = 'realtime/efp/images/' + document.getElementById('initOpt').value + '/' + document.getElementById('map2Overlay').value + '/' + imgName2;
		}
		else{
			var imgName2 = document.getElementById('map2Overlay').value + '_' + document.getElementById('fieldOpt').value + '_' + document.getElementById('initOpt').value + 'f0' + pad(tDiff) + '.png';
			var imgPath2 = 'realtime/efp/images/' + document.getElementById('initOpt').value + '/' + document.getElementById('map2Overlay').value + '/' + imgName2;
                }

		var tNow = new Date(timeCanvasNow.getAttr('time') * 1000);
		var tSlider = new Date(timeCanvasVal.getAttr('time') * 1000);
		var tDiff = timeCanvasNow.getAttr('time') - timeCanvasVal.getAttr('time');
                if(imgName2 == imgNameLast2 && map2Bool == null){
                        return;
                }
		if(map2.layers.indexOf(obsLayer) != -1){
	                map2.removeLayer(obsLayer);
	        }
		if(document.getElementById('map2Overlay').value == 'obs' && timeCanvasVal.getAttr('time') > timeCanvasNow.getAttr('time') && radarObs.indexOf(document.getElementById('fieldOpt').value) != -1){
			imgPath2 = imgPath3;
			imgNameLast2 = imgName2;
                        return;
                }
                else if(document.getElementById('map2Overlay').value == 'obs' && tDiff > 0 && tDiff < 420 && tSlider.getUTCMinutes() < 7 && tNow.getUTCMinutes() < 7){
			imgNameLast2 = imgName2;
                        return;
                }
		else if(document.getElementById('map2Overlay').value == 'obs' && radarObs.indexOf(document.getElementById('fieldOpt').value) == -1 && timeCanvasVal.getAttr('time') > (timeCanvasNow.getAttr('time') - 3600)){
			imgPath2 = imgPath4;
			imgNameLast2 = imgName2;
                        return;
		}
                obsLayer = new OpenLayers.Layer.Image('obsLayer',imgPath2,conusObs['bounds'],new OpenLayers.Size(1, 1),imgOptions);
                map2.addLayer(obsLayer);
                obsLayer.setZIndex(2000);
                imgNameLast2 = imgName2;
        }
}

function resetCase(){
	var proceed = confirm("Change Case?");
        if(!proceed){
		selValue = acase + '|' + site;
		caseSelect = document.getElementById('caseSelect');
                for(j,k=0;j=caseSelect[k];k++){
                        if(j.value == selValue){
                                caseSelect.selectedIndex = k;
                                break;
                        }
                }
               	return;
        }
	caseSelect = document.getElementById('caseSelect').value.split('|');
        acase = caseSelect[0];
        site = caseSelect[1];
	this.document.location.href = 'index.php?case=' + acase + '&site=' + site + '&user=' + user;
}

function resetSite(sname){
	if(sname == null){
		var proceed = confirm("Switch to " + document.getElementById('siteSelect').value + "?");
	}
	else{
		var proceed = confirm("Switch to " + sname + "?");
	}
        if(!proceed){
		siteSelect = document.getElementById('siteSelect');
		for(j,k=0;j=siteSelect[k];k++){
			if(j.value == site){
				siteSelect.selectedIndex = k;
				break;
			}
		}
		selectControl.unselectAll();
	}
	else{
		// reset site
		if(sname == null){
			site = document.getElementById('siteSelect').value;
		}
		else{
			site = sname;
		}

		// reload CWA Polygon
		loadCounties();
		loadCWA();
		//changeBlank();

		// set bounds for radar images based on site
                link = 'getSiteCoords.php?site=' + site;
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();
                coords = dataRequest.responseText.split(",");
                boundsSWLon = coords[0];
                boundsSWLat = coords[1];
                boundsNELon = coords[2];
                boundsNELat = coords[3];
                bounds = new OpenLayers.Bounds(boundsSWLon,boundsSWLat,boundsNELon,boundsNELat).transform(proj,proj2);		
		//map.setOptions({restrictedExtent: bounds});

		// reload radar sites
		radar_sites.removeAllFeatures();
		link = 'getAllSitesCoords.php?sites=' + floaterSites;
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();
                siteCoords = dataRequest.responseText.split("\n");
                for(im=0;im<siteCoords.length;im++){
                        coords = siteCoords[im].split(',');
                        if(floaterSites[im] == site){
                                radar_site = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(parseFloat(coords[0]),parseFloat(coords[1])).transform(proj, proj2),{'sname':floaterSites[im],'color':'cyan'});
				if(sname == null){
	                                // set center at radar site and set zoom elevation
	                                var point = new OpenLayers.LonLat(parseFloat(coords[0]), parseFloat(coords[1]));
	                                point.transform(proj, proj2);
	                                map.setCenter(point, 9);
				}
				clat = parseFloat(coords[1]);
                                clon = parseFloat(coords[0]);
                        }
                        else{
                                radar_site = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(parseFloat(coords[0]),parseFloat(coords[1])).transform(proj, proj2),{'sname':floaterSites[im],'color':'white'});
                        }
                        radar_sites.addFeatures([radar_site]);
                }

		// reload radar imagery
		product = document.getElementById('productSelect').value;
		field = product;
		loadNewProduct();

		// adject site selection menu
		siteSelect = document.getElementById('siteSelect');
                for(j,k=0;j=siteSelect[k];k++){
                        if(j.value == site){
                                siteSelect.selectedIndex = k;
                                break;
                        }
                }
                selectControl.unselectAll();

	}
}

function loadTimeCanvas(){

        stage = new Kinetic.Stage({
                container: 'container',
                width: window.innerWidth - 524,
                height: 500,
                draggable: true,
                dragBoundFunc: function(){
                        return {x:0,y:0}
                }
        });
        //stage.on('mousedown', function(event) {
        //        setTimeCanvas(event);
        //});
        stage.on('dragstart', function(event) {
                dragStartX = getCanvasCoords(event)[0];
        });
        stage.on('dragmove', function(event) {
                dragTimeCanvas(event);
        });

        layer = new Kinetic.Layer();
        layer2 = new Kinetic.Layer();
	layer3 = new Kinetic.Layer();

        //stage.add(layer2);
        stage.add(layer);
	stage.add(layer3);
	stage.add(layer2);

        timeCanvasLineNow = new Kinetic.Line({
                points: [[0,0],[0,500]],
                stroke: '#009900',
                strokeWidth: 1
        });
        timeCanvasLineVal = new Kinetic.Line({
                points: [[0,0],[0,500]],
                stroke: '#FF0000',
                strokeWidth: 1
        });
        timeCanvasLineVal.setAttr('x',190);

        timeCanvasVal = new Kinetic.RegularPolygon({
                x: 190,
                y: 54,
                sides: 3,
                radius: 10,
               	fill: '#FF0000',
               	stroke: 'black',
               	strokeWidth: 2,
                draggable: true,
               	dragBoundFunc: function(pos){
               	        timeCanvasLineVal.setAttr('x',pos.x);
               	        return {x:pos.x,y:54}
                }
        });
        timeCanvasVal.on('mouseover', function(event) {
                dragCanvas = false;
        });
        timeCanvasVal.on('mouseout', function(event) {
                dragCanvas = true;
        });
       	timeCanvasVal.on('dragmove', function(event) {
                calcSliderTime();
       	});

       	timeCanvasNow = new Kinetic.RegularPolygon({
                x: 190,
               	y: 6,
                sides: 3,
                radius: 10,
                fill: '#009900',
                stroke: 'black',
                rotationDeg: 180,
                strokeWidth: 2
        });

        layer2.add(timeCanvasLineNow);
        layer2.add(timeCanvasLineVal);
        layer2.add(timeCanvasVal);
        layer2.add(timeCanvasNow);

        //timeCanvasStart = 1386537901;
        //timeCanvasEnd = 1386545101;
        //timeCanvasValue = (timeCanvasStart + timeCanvasEnd) / 2;
        //timeCanvasNow.setAttr('time',currentTime);
        //timeCanvasVal.setAttr('time',timeCanvasValue);
       	//moveCurrentTime();
        //moveSliderTime();
        //timeCanvasStart += 0;
       	//timeCanvasEnd -= 3600;

        //drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
}

function moveCurrentTime(){
        pixelPos = Math.round(((timeCanvasNow.getAttr('time') - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
        timeCanvasNow.setAttr('x',pixelPos);
        timeCanvasLineNow.setAttr('x',pixelPos);
	layer2.batchDraw();
	//drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
}

function moveSliderTime(){
        pixelPos = Math.round(((timeCanvasVal.getAttr('time') - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
        timeCanvasVal.setAttr('x',pixelPos);
        timeCanvasLineVal.setAttr('x',pixelPos);
	layer2.batchDraw();
	d = new Date(0);
	d.setUTCSeconds(timeCanvasVal.getAttr('time'));
	//tString = d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' Z';
	tString = '<font size="2">' + pad(d.getUTCDate()) + ' ' + monthNames[d.getUTCMonth()] + ' ' + d.getUTCFullYear() + ' </font>'; 
        tString += pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' Z';
       	document.getElementById("master-time-input").innerHTML = tString;
	//drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
}

function calcSliderTime(){
        sliderTime = timeCanvasStart + Math.round(timeCanvasVal.getAttr('x') / stage.getAttr('width') * (timeCanvasEnd - timeCanvasStart));
        timeCanvasVal.setAttr('time',sliderTime);
	pixelPos = Math.round(((timeCanvasVal.getAttr('time') - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
	if(pixelPos != timeCanvasVal.getAttr('x')){
		timeCanvasVal.setAttr('x',pixelPos);
	        timeCanvasLineVal.setAttr('x',pixelPos);
	}
	d = new Date(0);
       	d.setUTCSeconds(timeCanvasVal.getAttr('time'));
	//tString = d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' Z';
	tString = '<font size="2">' + pad(d.getUTCDate()) + ' ' + monthNames[d.getUTCMonth()] + ' ' + d.getUTCFullYear() + ' </font>'; 
        tString += pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' Z';
       	document.getElementById("master-time-input").innerHTML = tString;
	//drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
	changeTime();
}

function setTimeCanvas(e){
        coords = getCanvasCoords(e);
	timeCanvasVal.setAttr('x',coords[0]);
	timeCanvasLineVal.setAttr('x',coords[0]);
	newTime = timeCanvasStart + parseInt((coords[0] / stage.getAttr('width')) * (timeCanvasEnd - timeCanvasStart));
        timeCanvasVal.setAttr('time',newTime);
	layer2.batchDraw();
       	d = new Date(0);
       	d.setUTCSeconds(timeCanvasVal.getAttr('time'));
       	//tString = d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' Z';
	tString = '<font size="2">' + pad(d.getUTCDate()) + ' ' + monthNames[d.getUTCMonth()] + ' ' + d.getUTCFullYear() + ' </font>'; 
        tString += pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' Z';
        document.getElementById("master-time-input").innerHTML = tString;
}

function getCanvasCoords(e){
        if(!e){
                var e = window.event;
        }
        if(e.pageX){
                x = e.pageX - Math.round(document.getElementById('timeDiv').getBoundingClientRect().left);
                y = e.pageY - Math.round(document.getElementById('timeDiv').getBoundingClientRect().top);
        }
       	else{
                x = e.clientX - Math.round(document.getElementById('timeDiv').getBoundingClientRect().left);
               	y = e.clientY - Math.round(document.getElementById('timeDiv').getBoundingClientRect().top);
       	}
       	return [x,y];
}

function dragTimeCanvas(e){
        x = getCanvasCoords(e)[0];
        if(x >= 0 && dragCanvas){
                secs = Math.round((timeCanvasEnd - timeCanvasStart) / stage.getAttr('width')) * (dragStartX - x);
                timeCanvasStart += secs;
                timeCanvasEnd += secs;
               	moveCurrentTime();
               	moveSliderTime();
                drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
                dragStartX = x;
        }
}

function zoomTimeCanvas(e){
        if(maxU == 'minutes'){
                amt = 300;
        }
       	else if(maxU == 'hours'){
                amt = 900;
        }
       	else if(maxU == 'days'){
               	amt = 3600;
        }
       	if(e.type != 'keydown'){
               	startInc = Math.round(amt * (getCanvasCoords(e)[0] / stage.getAttr('width')));
        }
        else{
                startInc = amt / 2;
        }
       	endInc = amt - startInc;
       	if((((timeCanvasEnd - endInc) - (timeCanvasStart + startInc)) < 500)){
                timeCanvasStart -= startInc;
                timeCanvasEnd += endInc;
                return;
        }
       	else if((((timeCanvasEnd + endInc) - (timeCanvasStart - startInc)) < 500)){
               	timeCanvasStart += startInc;
                timeCanvasEnd -= endInc;
                return;
        }
        if(e.wheelDelta > 0 || e.keyCode == '107' || e.keyCode == '61' || e.keyCode == '187'){
               	timeCanvasStart += startInc;
               	timeCanvasEnd -= endInc;
        }
        else{
                timeCanvasStart -= startInc;
               	timeCanvasEnd += endInc;
       	}
        moveCurrentTime();
        moveSliderTime();
        drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
}

function drawTick(x1,y1,x2,y2,color){
        line = new Kinetic.Line({
               	points: [[x1,y1],[x2,y2]],
               	stroke: color,
                strokeWidth: 1
        });
       	layer.add(line);
}

function drawText(x,y,text,color){
        var str = new Kinetic.Text({
                x: x,
                y: y,
                text: text,
                fontSize: 18,
                fontFamily: 'Verdana',
               	align: 'center',
               	fill: color
        });
        str.setOffset({
                x : str.getWidth()/2,
               	y : str.getHeight()/2
       	});
       	layer.add(str);
}

function drawTimeCanvas(startTime,endTime){
	//if(startTime == null || endTime == null || timeCanvasStartLast == startTime || timeCanvasEndLast == endTime){
	if(startTime == null || endTime == null){
		return;
	}
	timeCanvasStartLast = startTime;
	timeCanvasEnd = endTime;
        layer.removeChildren();
       	stage.clear();

        // initialize some variables
       	startDate = new Date(0);
        startDate.setUTCSeconds(startTime);
        endDate = new Date(0);
       	endDate.setUTCSeconds(endTime);
        secs = endTime - startTime;
        width = stage.getAttr('width');
        ratio = secs / width;
        baseColor = 'rgba(0,0,255,1.0)';

       	// determine axis units
        if(ratio <= 3){
                minorUnit = 60;
                majorUnit = 300;
               	maxUnit = 3600;
                maxU = 'minutes';
               	minorUnitPixels = Math.round(width / (secs / minorUnit));
                majorUnitPixels = minorUnitPixels * 5;
                maxUnitPixels = minorUnitPixels * 20;
        }
        else if(ratio <= 10){
               	minorUnit = 300;
               	majorUnit = 900;
               	maxUnit = 3600;
               	maxU = 'hours';
                minorUnitPixels = Math.round(width / (secs / minorUnit));
               	majorUnitPixels = minorUnitPixels * 3;
               	maxUnitPixels = minorUnitPixels * 12;
        }
        else if(ratio <= 20){
                minorUnit = 900;
               	majorUnit = 3600;
               	maxUnit = 86400;
                maxU = 'days';
                minorUnitPixels = Math.round(width / (secs / minorUnit));
               	majorUnitPixels = minorUnitPixels * 4;
               	maxUnitPixels = minorUnitPixels * 96;
        }
        else if(ratio <= 55){
                minorUnit = 3600;
               	majorUnit = 10800;
               	maxUnit = 86400;
                maxU = 'days';
                minorUnitPixels = Math.round(width / (secs / minorUnit));
                majorUnitPixels = minorUnitPixels * 3;
                maxUnitPixels = minorUnitPixels * 24;
        }
        else if(ratio > 55){
                minorUnit = 3600;
               	majorUnit = 21600;
               	maxUnit = 86400;
               	maxU = 'days';
                minorUnitPixels = Math.round(width / (secs / minorUnit));
                majorUnitPixels = minorUnitPixels * 6;
               	maxUnitPixels = minorUnitPixels * 24;
       	}

       	// draw ticks and labels
       	minorCoeff = minorUnit * 1000;
        firstMinorTick = width / (secs / (((Math.ceil(startDate.getTime() / minorCoeff) * minorCoeff) / 1000) - startTime));
        majorCoeff = majorUnit * 1000;
       	firstMajorTick = width / (secs / (((Math.ceil(startDate.getTime() / majorCoeff) * majorCoeff) / 1000) - startTime));
       	maxCoeff = maxUnit * 1000;
        firstMaxTick = width / (secs / (((Math.ceil(startDate.getTime() / maxCoeff) * maxCoeff) / 1000) - startTime));
       	tickTime = new Date(0);
        tickTime.setUTCSeconds((Math.ceil(startDate.getTime() / minorCoeff) * minorCoeff) / 1000);
        w2 = firstMinorTick;
       	drawn = false;
        for(var w=Math.round(firstMinorTick);w<width;w+=minorUnitPixels){
                xPixel = Math.round((((tickTime.getTime() / 1000) - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
                drawTick(xPixel,60,xPixel,50,baseColor);
                if(!drawn && Math.abs(firstMajorTick - w2) < 5 || drawn && Math.abs(majorUnitPixels - w2) < 5){
                        if(maxU == 'minutes' || maxU == 'hours'){
                               	if(tickTime.getUTCMinutes() == 0){
                                       	drawTick(xPixel,60,xPixel,0,'rgba(0,0,0,1.0)');
                               	}
                               	else if(tickTime.getUTCMinutes() == 30){
                                       	drawTick(xPixel,60,xPixel,45,'rgba(255,0,0,1.0)');
                                       	drawText(xPixel,38,pad(tickTime.getUTCMinutes()),'rgba(0,0,0,1.0)');
                                       	drawText(xPixel,15,tickTime.getUTCDate() + '-' + months[tickTime.getUTCMonth()] + ' ' + pad(tickTime.getUTCHours()) + ' UTC','rgba(0,0,0,1.0)');
                                }
                                else{
                                        drawTick(xPixel,60,xPixel,45,'rgba(255,0,0,1.0)');
                                       	drawText(xPixel,38,pad(tickTime.getUTCMinutes()),'rgba(0,0,0,1.0)');
                               	}
                        }
                        else if(maxU == 'days'){
                               	if(tickTime.getUTCHours() == 0){
                                       	drawTick(xPixel,60,xPixel,0,'rgba(0,0,0,1.0)');
                                }
                                else if(tickTime.getUTCHours() == 12){
                                        drawTick(xPixel,60,xPixel,45,'rgba(255,0,0,1.0)');
                                       	drawText(xPixel,38,pad(tickTime.getUTCHours()),'rgba(0,0,0,1.0)');
                                       	drawText(xPixel,15,tickTime.getUTCDate() + '-' + months[tickTime.getUTCMonth()],'rgba(0,0,0,1.0)');
                               	}
                                else{
                                       	drawTick(xPixel,60,xPixel,45,'rgba(255,0,0,1.0)');
                                       	drawText(xPixel,38,pad(tickTime.getUTCHours()),'rgba(0,0,0,1.0)');
                                }
                        }
                        w2 = 0;
                       	drawn = true;
                }
                tickTime.setUTCSeconds(tickTime.getUTCSeconds() + minorUnit);
               	w2 += minorUnitPixels;
        }

        // draw border lines
        drawTick(0,0,stage.getAttr('width'),0,'rgba(0,0,0,1.0)');
        drawTick(0,0,0,60,'rgba(0,0,0,1.0)');
        drawTick(0,60,stage.getAttr('width'),60,'rgba(0,0,0,1.0)');
        drawTick(stage.getAttr('width'),0,stage.getAttr('width'),60,'rgba(0,0,0,1.0)');
        drawTick(0,25,width,25,'rgba(0,0,0,1.0)');

	// draw threat sliders
	if(acase == 'ncp'){
		drawNCPThreatSliders();
	}
	else{
		drawThreatSliders();
	}

        // draw stage
	stage.setWidth(window.innerWidth - 524);
        stage.draw();

	if(acase != 'ncp'){
		getActiveCounts();
	}
}

function getActiveCounts(){
	tCount = 0;
	sCount = 0;
       	hCount = 0;
       	wCount = 0;
       	lCount = 0;

	try{
		/*
		for(var k3=0;k3<threatStore.data.items.length;k3++){
			if(threatStore.data.items[k3].data.hazardType == 'Tornado'){
				tCount++;
			}
			else if(threatStore.data.items[k3].data.hazardType == 'Severe'){
                                sCount++;
                        }
			else if(threatStore.data.items[k3].data.hazardType == 'Hail'){
				hCount++;
			}
			else if(threatStore.data.items[k3].data.hazardType == 'Wind'){
				wCount++;
			}
			else if(threatStore.data.items[k3].data.hazardType == 'Lightning'){
				lCount++;
			}
		}
		*/
		var sCount0 = 0;
		var sCount1 = 0;
		var sCount2 = 0;
		var sCount3 = 0;
		for(var i=0;i<probSevere.features.length;i++){
			if(probSevere.features[i].attributes.data['allow'] == 0){
				sCount3++;
			}
			else if(probSevere.features[i].attributes.data['automated'] == 1){
				sCount1++;
			}
			else if(probSevere.features[i].attributes.data['automated'] == 0){
				sCount0++;
			}
			else{
				sCount2++;
			}
		}

		var tCount0 = 0;
                var tCount1 = 0;
                var tCount2 = 0;
		var tCount3 = 0;
                for(var i=0;i<azShear.features.length;i++){
			if(azShear.features[i].attributes.data['allow'] == 0){
                               	tCount3++;
                        }
                        else if(azShear.features[i].attributes.data['automated'] == 1){
                                tCount1++;
                        }
                        else if(azShear.features[i].attributes.data['automated'] == 0){
                                tCount0++;
                        }
                        else{ 
                                tCount2++;
                        }
                }

		var lCount0 = 0;
               	var lCount1 = 0;
                var lCount2 = 0;
                var lCount3 = 0;
               	for(var i=0;i<lightning.features.length;i++){
                       	if(lightning.features[i].attributes.data['allow'] == 0){
                               	lCount3++;
                       	}
                       	else if(lightning.features[i].attributes.data['automated'] == 1){
                               	lCount1++;
                       	}
                       	else if(lightning.features[i].attributes.data['automated'] == 0){
                               	lCount0++;
                       	}
                       	else{ 
                               	lCount2++;
                       	}
               	}

		innerHTML = '<table border="1" width="100%" cellpadding="3" cellspacing="0" bordercolor="#cccccc"><tr><td>';
		/*
		if(showAT){

                        innerHTML += '<input type="checkbox" id="showActiveThreats" onChange="showActiveThreats();" checked />&nbsp;&nbsp;';
                }
                else{
                        innerHTML += '<input type="checkbox" id="showActiveThreats" onChange="showActiveThreats();" />&nbsp;&nbsp;';
                }
		*/
		//innerHTML += '<b style="font-size: 75%;"><u>Objects</u>:</b>&nbsp;&nbsp;&nbsp;&nbsp;';
		if(showT){
			innerHTML += '<input type="checkbox" id="showTornado" onChange="showTornado();" checked />';
		}
		else{
			innerHTML += '<input type="checkbox" id="showTornado" onChange="showTornado();" />';
		}
		innerHTML += '<b style="font-size: 80%; color:rgb(255,0,0); text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000;">T:&nbsp;' + tCount0 + '/' + tCount2 + '/' + tCount1 + '/' + tCount3 + '</b>';
		innerHTML += '</td><td>';
		if(showS){
			innerHTML += '<input type="checkbox" id="showSevere" onChange="showSevere();" checked />';
		}
		else{
			innerHTML += '<input type="checkbox" id="showSevere" onChange="showSevere();" />';
		}
		innerHTML += '<b style="font-size: 80%; color:rgb(255,255,0); text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000;">S:&nbsp;' + sCount0 + '/' + sCount2 + '/' + sCount1 + '/' + sCount3 + '</b>&nbsp;&nbsp;&nbsp;&nbsp;';
		if(showPT){
			innerHTML += '<input type="checkbox" id="showProbTor" onChange="showProbTor();" checked /><b style="font-size: 80%;">ProbTor</b>';
		}
		else{
			innerHTML += '<input type="checkbox" id="showProbTor" onChange="showProbTor();" /><b style="font-size: 80%;">ProbTor</b>';
		}
		innerHTML += '</td><td>';
		if(showL){
                       	innerHTML += '<input type="checkbox" id="showLightning" onChange="showLightning();" checked />';
               	}
               	else{
                       	innerHTML += '<input type="checkbox" id="showLightning" onChange="showLightning();" />';
               	}
                innerHTML += '<b style="font-size: 80%; color:rgb(255,128,0); text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000;">L:&nbsp;' + lCount0 + '/' + lCount2 + '/' + lCount1 + '/' + lCount3 + '</b>';

		//innerHTML += '<b style="font-size: 125%; color:rgb(0,204,0); text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000;">H:&nbsp;' + hCount + '</b>&nbsp;&nbsp;&nbsp;&nbsp;';
		//innerHTML += '<b style="font-size: 125%; color:rgb(0,0,255); text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000;">W:&nbsp;' + wCount + '</b>&nbsp;&nbsp;&nbsp;&nbsp;';
		//innerHTML += '<b style="font-size: 125%; color:rgb(255,255,0); text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000;">L:&nbsp;' + lCount + '</b>&nbsp;&nbsp;&nbsp;&nbsp;';
		innerHTML += '</td>';
		/*
		if(activeStyle){
			innerHTML += '<input type="radio" id="activeType" name="activeProbType" value="type" onChange="switchActiveThreats();" checked /><b style="font-size: 60%;">Type</b>';
			innerHTML += '<input type="radio" id="activeProb" name="activeProbType" value="prob" onChange="switchActiveThreats();" /><b style="font-size: 60%;">Probability</b>';
		}
		else{
			innerHTML += '<input type="radio" id="activeType" name="activeProbType" value="type" onChange="switchActiveThreats();" /><b style="font-size: 60%;">Type</b>';
                        innerHTML += '<input type="radio" id="activeProb" name="activeProbType" value="prob" onChange="switchActiveThreats();" checked /><b style="font-size: 60%;">Probability</b>';
		}
		*/
		if(showB){
			innerHTML += '<td><input type="checkbox" id="showBlock" onChange="showBlocked();" checked /><b style="font-size: 80%;">Blocked</b></td>';
		}
		else{
			innerHTML += '<td><input type="checkbox" id="showBlock" onChange="showBlocked();" /><b style="font-size: 80%;">Blocked</b></td>';
		}
		innerHTML += '</tr></table>';
		document.getElementById('deactivate').innerHTML = innerHTML;
	}
	catch(err){
		// do nothing
	}
}

Ext.define('threatModel', {
    extend: 'Ext.data.Model',
    fields: [ 'eventID', 'hazardType', 'status', 'startTime', 'endTime', 'issue', 'valid_start', 'valid_start_orig', 'valid_end', 'threatColor', 'fname', 'updateTimes', 'show', 'prob', 'timeLeft' ]
});

var threatStore = Ext.create('Ext.data.Store', {
    model: 'threatModel',
    storeId: 'threatStore',
    data: []
});

Ext.define('reportsModel', {
    extend: 'Ext.data.Model',
    fields: [ 'time', 'hazard', 'magnitude', 'comments', 'epoch']
});

var reportsStore = Ext.create('Ext.data.Store', {
    model: 'reportsModel',
    storeId: 'reportsStore',
    data: []
});

//{ eventID: '2', hazardType: 'TOR.W', status: 'Issued', startTime: '12-Dec 22:00 Z', endTime: '12-Dec 22:30 Z' }
function insertRecordOld(feat,st,insert){
	if(feat.attributes.data['types'][0] == 'tornado1'){
		hType = 'TOR.W';
	}
	else if(feat.attributes.data['types'][0] == 'hail1' || feat.attributes.data['types'][0] == 'wind1' || feat.attributes.data['types'][0] == 'severe1'){
		hType = 'SVR.W';
	}
	else if(feat.attributes.data['types'][0] == 'lightning1'){
		hType = 'SVR.W';
	}
	else{
		hType = '???.?';
		return;
	}
	sDate = new Date(0);
	sDate.setUTCSeconds(feat.attributes.data['valid_start']);
	sTime = pad(sDate.getUTCDate()) + '-' + months[sDate.getUTCMonth()] + ' ' + pad(sDate.getUTCHours()) + ':' + pad(sDate.getUTCMinutes()) + ' Z';
	eDate = new Date(0);
	eDate.setUTCSeconds(feat.attributes.data['valid_end']);
	eTime = pad(eDate.getUTCDate()) + '-' + months[eDate.getUTCMonth()] + ' ' + pad(eDate.getUTCHours()) + ':' + pad(eDate.getUTCMinutes()) + ' Z';
	match1 = threatStore.find('eventID',String(feat.attributes.data['id']));
	match2 = threatStore.find('hazardType',hType);
	match3 = threatStore.find('status',st);
	match4 = threatStore.find('startTime',sTime);
	match5 = threatStore.find('endTime',eTime);
	if(match1 == -1 || match2 == -1 || match3 == -1 || match4 == -1 || match5 == -1 || insert != null){
		// add record to store
		fname = feat.attributes.data['types'][0].capitalize() + '_ID' + feat.attributes.data['id'] + '_' + user + '.txt';
		if(match1 != -1 && match2 != -1 && match3 != -1 && match1 == match2 && match2 == match3 || match1 != -1 && match2 != -1 && match3 != -1 && match4 != -1 && match5 != -1){
			for(k4=0;k4<records.length;k4++){
		                if(records[k4].eventID == String(feat.attributes.data['id'])){
					recordIndex = k4;
		                       	break;
		                }
		        }
			threatStore.remove(threatStore.data.items[match1]);
                       	//knobs[match1][0].remove();
                        //knobs[match1][1].remove();
                        //knobs.splice(match1,1);
			records[recordIndex].startTime = sTime;
			records[recordIndex].endTime = eTime;
			records[recordIndex].updateTimes.push(feat.attributes.data['valid_start'])
			records[recordIndex].issue = feat.attributes.data['issue'];
			records[recordIndex].valid_start = feat.attributes.data['valid_start'];
			records[recordIndex].valid_end = feat.attributes.data['valid_end'];
			threatStore.add(records[recordIndex]);
		}
		else{
			// changes here MUST go in threatModel!!!
			records.push({eventID: String(feat.attributes.data['id']), hazardType: hType, status: st, startTime: sTime, endTime: eTime, issue: feat.attributes.data['issue'], valid_start: feat.attributes.data['valid_start'], valid_start_orig: feat.attributes.data['valid_start'], valid_end: feat.attributes.data['valid_end'], threatColor: feat.attributes.data['threatColor'], fname: fname, show: true, updateTimes: []});
		        threatStore.add(records[records.length-1]);
		}
	        threatStore.commitChanges();

		// add knobs to knob array
		if(st == 'Issued'){
			draggable = false;
		}
		else{
			//draggable = true;
			draggable = false;
		}
		/*
		knobs.push([]);
               	knobs[knobs.length-1].push(new Kinetic.Rect({
	                x: 0,
	                y: 64,
	                width: 10,
	                height: 15,
	                cornerRadius: 2,
			offsetX: 5,
	                fill: '#FFFFFF',
	                stroke: 'black',
	               	strokeWidth: 2,
	               	draggable: false,
	                dragBoundFunc: function(pos){
	                        timeCanvasLineVal.setAttr('x',pos.x);
	                        return {x:pos.x,y:64}
	                }
	        }));
		knobs[knobs.length-1].push(new Kinetic.Rect({
                       	x: 0,
                       	y: 64,
                        width: 10,
                        height: 15,
                        cornerRadius: 2,
			offsetX: 5,
                        fill: '#FFFFFF',
                        stroke: 'black',
                        strokeWidth: 2,
                        draggable: draggable,
                        dragBoundFunc: function(pos){
                                timeCanvasLineVal.setAttr('x',pos.x);
                                return {x:pos.x,y:64}
                       	}
               	}));
	        knobs[knobs.length-1][0].on('dragmove', function(event) {
	                // do sum ting
	        });
	        knobs[knobs.length-1][1].on('dragmove', function(event) {
	                // do sum ting
	        });
	       	layer3.add(knobs[knobs.length-1][0]);
	        layer3.add(knobs[knobs.length-1][1]);
		*/

		// redraw canvas
		drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
	}
}

function insertRecord(feat,st,insert){
	// config variables for record
	if(parseInt(feat.attributes.data['types'][0].split('_')[0]) == feat.attributes.data['id']){
		var json_format = new OpenLayers.Format.JSON();
		hTypes = json_format.read(featureTypes);
	}
	else{
		hTypes = feat.attributes.data['types'];
	}
       	if(hTypes[0] == 'tornado1'){
               	hType = 'Tornado';
       	}
	else if(hTypes[0] == 'severe1'){
                hType = 'Severe';
        }
       	else if(hTypes[0] == 'hail1'){
               	hType = 'Hail';
       	}
	else if(hTypes[0] == 'wind1'){
                hType = 'Wind';
        }
       	else if(hTypes[0] == 'lightning1'){
               	hType = 'Lightning';
       	}
       	else{
               	hType = '???.?';
               	return;
       	}
	
       	sDate = new Date(0);
       	sDate.setUTCSeconds(parseInt(feat.attributes.data['valid_start']));
       	sTime = pad(sDate.getUTCDate()) + '-' + months[sDate.getUTCMonth()] + ' ' + pad(sDate.getUTCHours()) + ':' + pad(sDate.getUTCMinutes()) + ' Z';
        eDate = new Date(0);
        eDate.setUTCSeconds(parseInt(feat.attributes.data['valid_end']));
        eTime = pad(eDate.getUTCDate()) + '-' + months[eDate.getUTCMonth()] + ' ' + pad(eDate.getUTCHours()) + ':' + pad(eDate.getUTCMinutes()) + ' Z';
	fname = hTypes[0].capitalize() + '_ID' + feat.attributes.data['id'] + '_' + user + '.txt';

	// check if record exists - if not, add to records array
	var recordFound = false;
	newRecord = {eventID: String(feat.attributes.data['id']), hazardType: hType, status: st, startTime: sTime, endTime: eTime, issue: feat.attributes.data['issue'], valid_start: feat.attributes.data['valid_start'], valid_start_orig: feat.attributes.data['valid_start'], valid_end: feat.attributes.data['valid_end'], threatColor: feat.attributes.data['threatColor'], fname: fname, show: true, updateTimes: [], probs: feat.attributes.data['probs'], prob: parseInt(feat.attributes.data['probs'][0][0])};
        for(var k3=0;k3<records.length;k3++){
                if(records[k3].eventID == String(feat.attributes.data['id']) && records[k3].hazardType == hType && records[k3].status == st && records[k3].valid_start == feat.attributes.data['valid_start'] && records[k3].valid_end == feat.attributes.data['valid_end']){
                        recordFound = true;
                        break;
                }
        }
        if(!recordFound){
                records.push(newRecord);
        }

	// check if threat already exists in database - if not, add it
	var recordFound = false;
	var recordUpdate = false;
       	for(var k3=0;k3<threatStore.data.items.length;k3++){
               	if(threatStore.data.items[k3].get('fname') == fname){
			// check if updating record, else ignore
			if(st == 'Pending'){
				st = 'Updating';
				idx = k3;
				recordUpdate = true;
			}
			else if(threatStore.data.items[k3].get('status') == 'Updating' && st == 'Issued' && insert != null){
				idx = k3;
                               	recordUpdate = true;
			}
			else if(threatStore.data.items[k3].get('status') == 'Updating' && st == 'Issued' && threat_area.features == 0){
                               	idx = k3;
                               	recordUpdate = true;
                        }
			ridx = k3;
			recordFound = true;
                       	break;
               	}
       	}
       	if(!recordFound){
               	threatStore.add(records[records.length-1]);
               	threatStore.commitChanges();
       	}
	else if(recordUpdate){
		threatStore.data.items[idx].set('status',st);
		//threatStore.data.items[idx].set('valid_start',feat.attributes.data['valid_start']);
		if(validEnding == 0){
			validEnding = threatStore.data.items[idx].get('valid_end');
		}
		threatStore.data.items[idx].set('valid_end',feat.attributes.data['valid_end']);
		//threatStore.data.items[idx].set('startTime',sTime);
		threatStore.data.items[idx].set('endTime',eTime);
		//threatStore.data.items[idx].set('issue',feat.attributes.data['issue']);
	}
	if(recordFound && !recordUpdate){
               	if(threatStore.data.items[ridx].get('valid_start') > feat.attributes.data['valid_start']){
                       	threatStore.data.items[ridx].set('valid_start',feat.attributes.data['valid_start']);
                       	threatStore.data.items[ridx].set('startTime',sTime);
               	}
               	if(threatStore.data.items[ridx].get('valid_end') < feat.attributes.data['valid_end']){
                       	threatStore.data.items[ridx].set('valid_end',feat.attributes.data['valid_end']);
                       	threatStore.data.items[ridx].set('endTime',eTime);
                }
		threatStore.data.items[ridx].set('issue',feat.attributes.data['issue']);
        }

	// redraw time canvas
	drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
}

function insertNCPRecord(feat,st){
	fstart = feat.attributes.fStart;
	fend = feat.attributes.fEnd;
	startTime = feat.attributes.startTime;
	endTime = feat.attributes.endTime;
	hazardType = feat.attributes.hazType.capitalize();
	issueType = feat.attributes.issueType.capitalize();
	ncpRecord = feat.attributes.ncpRecord;
	sDate = new Date(0);
       	sDate.setUTCSeconds(startTime);
       	sTime = pad(sDate.getUTCDate()) + '-' + months[sDate.getUTCMonth()] + ' ' + pad(sDate.getUTCHours()) + ':' + pad(sDate.getUTCMinutes()) + ' Z';
       	eDate = new Date(0);
       	eDate.setUTCSeconds(endTime);
       	eTime = pad(eDate.getUTCDate()) + '-' + months[eDate.getUTCMonth()] + ' ' + pad(eDate.getUTCHours()) + ':' + pad(eDate.getUTCMinutes()) + ' Z';
	if(st == 'Pending'){
		colorVal = '#FF0000';
	}
	else{
		colorVal = '#009933';
	}
	recordFound = false;
	newRecord = {eventID: issueType, hazardType: hazardType, status: st, startTime: sTime, endTime: eTime, issue: startTime, valid_start: startTime, valid_start_orig: startTime, valid_end: endTime, threatColor: colorVal, fname: ncpRecord, show: true, updateTimes: []};
	for(var k3=0;k3<records.length;k3++){
		if(records[k3].eventID == issueType && records[k3].hazardType == hazardType && records[k3].status == st && records[k3].valid_start == startTime && records[k3].valid_end == endTime){
			recordFound = true;
			break;
		}
	}
	if(!recordFound){
		records.push(newRecord);
	}
	recordFound = false;
	recordUpdate1 = false;
	recordUpdate2 = false;
	for(var k3=0;k3<threatStore.data.items.length;k3++){
		if(threatStore.data.items[k3].get('fname') == ncpRecord){
			recordFound = true;
			idx = k3;
			checkState = threatStore.data.items[k3].get('show');
			if(threatStore.data.items[k3].get('valid_start') > startTime){
				recordUpdate1 = true;
			}
			else if(threatStore.data.items[k3].get('valid_end') < endTime){
                                recordUpdate2 = true;
                        }
			break;
		}
	}
	if(!recordFound){
		//alert('inserting into threatstore: ' + ncpRecord);
		threatStore.add(records[records.length-1]);
               	threatStore.commitChanges();
		idx = threatStore.data.items.length - 1;
		checkState = true;
	}
	else if(recordUpdate1){
		threatStore.data.items[idx].set('valid_start',startTime);
		threatStore.data.items[idx].set('startTime',sTime);		
	}
	else if(recordUpdate2){
                threatStore.data.items[idx].set('valid_end',endTime);
                threatStore.data.items[idx].set('endTime',eTime);    
        }
	showNCPProbs(idx, checkState);

       	// redraw canvas
       	drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
}

function deletePendingRecords(){
	for(var k3=0;k3<threatStore.data.items.length;k3++){
		if(threatStore.data.items[k3].get('status') == 'Pending'){
			threatStore.remove(threatStore.data.items[k3]);
			threatStore.commitChanges();
			//knobs[k3][0].remove();
			//knobs[k3][1].remove();
			//knobs.splice(k3,1);
		}
	}
	for(var k4=0;k4<records.length;k4++){
		if(records[k4].status == 'Pending'){
			records.splice(k4,1);
		}
	}
	drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
}

function revertNCPRecords(){
	for(k4=0;k4<threatStore.data.items.length;k4++){
		vStarts = [];
		vStarts2 = [];
		vEnds = [];
		vEnds2 = [];
		for(k3=0;k3<records.length;k3++){	
			if(threatStore.data.items[k4].get('fname') == records[k3].fname){
				vStarts.push(records[k3].valid_start);
				vStarts2.push(records[k3].startTime);
				vEnds.push(records[k3].valid_end);
				vEnds2.push(records[k3].endTime);
			}
		}
		vMin = vStarts.min();
		vMax = vEnds.max();
		if(threatStore.data.items[k4].get('valid_start') < vMin){
			threatStore.data.items[k4].set('valid_start',vMin);
			threatStore.data.items[k4].set('startTime',vStarts2[vStarts.indexOf(vMin)]);
		}
		if(threatStore.data.items[k4].get('valid_end') > vMax){
			threatStore.data.items[k4].set('valid_end',vMax);
                        threatStore.data.items[k4].set('endTime',vEnds2[vEnds.indexOf(vMax)]);
                }
	}
}

// changes status back to "issued"
function revertUpdate(){
	eDate = new Date(0);
        eDate.setUTCSeconds(validEnding);
        eTime = pad(eDate.getUTCDate()) + '-' + months[eDate.getUTCMonth()] + ' ' + pad(eDate.getUTCHours()) + ':' + pad(eDate.getUTCMinutes()) + ' Z';
	for(k3=0;k3<threatStore.data.items.length;k3++){
                if(threatStore.data.items[k3].get('status') == 'Updating'){
			threatStore.data.items[k3].set('status','Issued');
			threatStore.data.items[k3].set('valid_end',validEnding);
			threatStore.data.items[k3].set('endTime',eTime);
                       	threatStore.commitChanges();
                }
        }
        drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
	validEnding = 0;
}

// remove items from time panel when they expire
function checkActiveThreats(){
	for(var k3=(threatStore.data.items.length - 1);k3>=0;k3--){
		if(threatStore.data.items[k3].get('status') == 'Pending'){
			continue;
		}
                else if(threatStore.data.items[k3].get('valid_end') < currentTime){
			var notFound = true;
			while(notFound){
				var found = false;
				for(var k4=0;k4<records.length;k4++){
			                if(records[k4].eventID == threatStore.data.items[k3].get('eventID') && records[k4].issue == threatStore.data.items[k3].get('issue')){
			                       	records.splice(k4,1);
						found = true;
						break;
			                }
			        }
				if(!found){
					notFound = false;
				}
			}
			threatStore.remove(threatStore.data.items[k3]); // might need to move to inner loop
               	}
		else if(activeIDs.indexOf(threatStore.data.items[k3].get('eventID')) == -1){
			for(var k4=0;k4<records.length;k4++){
				if(records[k4].eventID == threatStore.data.items[k3].get('eventID') && records[k4].issue == threatStore.data.items[k3].get('issue')){
					records.splice(k4,1);
				}
			}
			threatStore.remove(threatStore.data.items[k3]); // might need to move to inner loop
		}
       	}
	drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
}

function drawNCPThreatSliders(){
        var linePos = 46;
        var sliderBars = [];
        var fnames = [];
	var linePositions = [];

        for(var k3=0;k3<records.length;k3++){
		var rec = records[k3].fname;
                if(fnames.indexOf(rec) == -1){
                        if(linePos == 67){
                                linePos += 22;
                        }
                        else{
                               	linePos += 21;
                        }
                        sliderBar = new Kinetic.Rect({
                                x: 0,
                               	y: linePos,
                                width: stage.getAttr('width'),
                               	height: 10,
                                fill: '#EEEEEE',
                                stroke: '#777777',
                                strokeWidth: 1
                       	});
                       	if(records[k3].status == 'Issued'){
                               	draggable = false;
                       	}
                       	else{
                               	//draggable = true;
                               	draggable = false;
                       	}
                       	layer.add(sliderBar);
                       	pixelPosLeftKnob = Math.round(((records[k3].valid_start - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
                       	pixelPosLeftBar = Math.round(((records[k3].valid_start_orig - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
			/*
                       	knobs[k3][0].setAttr('x',pixelPosLeftKnob);
                       	knobs[k3][0].setAttr('y',(linePos-3));
                       	knobs[k3][0].setAttr('draggable',false);
                       	knobs[k3][0].setAttr('time',threatStore.data.items[k3].get('valid_start'));
                       	knobs[k3][0].setDragBoundFunc(function(pos){
                               	timeCanvasLineVal.setAttr('x',pos.x);
                               	return {x:pos.x,y:(linePos-3)}
                       	});
			*/
                       	pixelPosRight = Math.round(((records[k3].valid_end - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
			/*
                       	knobs[k3][1].setAttr('x',pixelPosRight);
                       	knobs[k3][1].setAttr('y',(linePos-3));
                       	knobs[k3][1].setAttr('draggable',draggable);
                       	knobs[k3][0].setAttr('time',threatStore.data.items[k3].get('valid_end'));
                       	knobs[k3][1].setDragBoundFunc(function(pos){
                               	timeCanvasLineVal.setAttr('x',pos.x);
                               	return {x:pos.x,y:(linePos-3)}
                       	});
			*/
                       	layer3.batchDraw();
                       	highlightBar = new Kinetic.Rect({
                               	x: pixelPosLeftBar,
                               	y: linePos,
                               	width: (pixelPosRight - pixelPosLeftBar),
                               	height: 10,
                               	fill: records[k3].threatColor,
                               	stroke: '#000000',
                               	strokeWidth: 1
                       	});
                        layer.add(highlightBar);
                       	uTimes = records[k3].updateTimes;
                       	for(k4=0;k4<uTimes.length;k4++){
                               	xPixel = Math.round(((uTimes[k4] - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
                                drawTick(xPixel,(linePos+10),xPixel,linePos,'rgba(0,0,0,1.0)');
                        }
                        fnames.push(rec);
			linePositions.push(linePos);
                       	index = k3;
               	}
               	else{
			var idx = fnames.indexOf(rec);
			var linePos2 = linePositions[idx];
                       	pixelPosLeft = Math.round(((records[k3].valid_start - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
                        pixelPosRight = Math.round(((records[k3].valid_end - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
                        highlightBar = new Kinetic.Rect({
                               	x: pixelPosLeft,
                               	y: linePos2,
                               	width: (pixelPosRight - pixelPosLeft),
                                height: 10,
                                fill: records[k3].threatColor,
                               	stroke: '#000000',
                                strokeWidth: 1
                        });
                        layer.add(highlightBar);
			layer.batchDraw();
                        //knobs[index][0].setAttr('x',pixelPosLeft);
                        //knobs[index][1].setAttr('x',pixelPosRight);
                }
        }
}

function drawThreatSlidersOld(){
	linePos = 46;
       	sliderBars = [];
       	fnames = [];
       	linePositions = [];

       	for(var k3=0;k3<records.length;k3++){
		var updated = false;
               	if(fnames.indexOf(records[k3].fname) == -1){
			if(linePos == 67){
                                linePos += 22;
                       	}
                       	else{
                               	linePos += 21;
                       	}
                       	sliderBar = new Kinetic.Rect({
                                x: 0,
                                y: linePos,
                                width: stage.getAttr('width'),
                               	height: 10,
                               	fill: '#EEEEEE',
                               	stroke: '#777777',
                               	strokeWidth: 1
                        });
                       	layer.add(sliderBar);
                       	pixelPosLeftKnob = Math.round(((records[k3].valid_start - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
                       	pixelPosLeftBar = Math.round(((records[k3].valid_start_orig - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
                       	pixelPosRight = Math.round(((records[k3].valid_end - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
                        layer3.batchDraw();
                        highlightBar = new Kinetic.Rect({
                               	x: pixelPosLeftBar,
                               	y: linePos,
                                width: (pixelPosRight - pixelPosLeftBar),
                                height: 10,
                               	fill: records[k3].threatColor,
                               	stroke: '#000000',
                               	strokeWidth: 1
                       	});
                        layer.add(highlightBar);
                       	uTimes = records[k3].updateTimes;
                       	for(var k4=0;k4<uTimes.length;k4++){
				xPixel = Math.round(((uTimes[k4] - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
                               	drawTick(xPixel,(linePos+10),xPixel,linePos,'rgba(0,0,0,1.0)');
                       	}
                       	fnames.push(records[k3].fname);
                       	linePositions.push(linePos);
                       	index = k3;
		}
		else{
			/*
			idx = fnames.indexOf(records[k3].fname);
                       	linePos = linePositions[idx];
                       	pixelPosLeft = Math.round(((records[k3].valid_start - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
                       	pixelPosRight = Math.round(((records[k3].valid_end - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
                       	highlightBar = new Kinetic.Rect({
                               	x: pixelPosLeft,
                               	y: linePos,
                               	width: (pixelPosRight - pixelPosLeft),
                               	height: 10,
                               	fill: records[k3].threatColor,
                               	stroke: '#000000',
                               	strokeWidth: 1
                       	});
                       	layer.add(highlightBar);
                       	layer.batchDraw();
			*/
				updated = true;
                                idx = fnames.indexOf(records[k3].fname);
                                linePos = linePositions[idx];
                                pixelPosLeft = Math.round(((records[k3].valid_start - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
                                if(pixelPosLeft < 0){
                                        pixelPosLeft = 0;
                                        break;
                                }

		}
		if(updated){
                        highlightBar = new Kinetic.Rect({
                                x: pixelPosLeft,
                                y: linePos,
                                width: (pixelLeftLast - pixelPosLeft),
                                height: 10,
                                fill: '#999999',
                                stroke: '#000000',
                                strokeWidth: 1
                        });
                        layer.add(highlightBar);
                }
	}
}

function drawThreatSliders(){
	linePos = 46;
	sliderBars = [];
	fnames = [];
	linePositions = [];
	pixelNow = parseInt(((timeCanvasNow.getAttr('time') - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
	//var geojson_format = new OpenLayers.Format.JSON();
	tempRecords = {};
	for(var d3=0;d3<records.length;d3++){
		if(!tempRecords.hasOwnProperty(records[d3].fname)){
			tempRecords[records[d3].fname] = [];
		}
		//tempRecords[records[d3].fname].push(geojson_format.read(JSON.stringify(records[d3])));
		tempRecords[records[d3].fname].push(records[d3]);
	}
        //tempRecords = geojson_format.read(JSON.stringify(records));
	for(var d3=0;d3<threatStore.data.items.length;d3++){
		updated = false;
		storeName = threatStore.data.items[d3].get('fname');
		for(var d5=(tempRecords[storeName].length - 1);d5>=0;d5--){
			if(fnames.indexOf(tempRecords[storeName][d5].fname) == -1){
				if(linePos == 67){
					linePos += 22;
				}
				else{
					linePos += 21;
				}
				sliderBar = new Kinetic.Rect({
			               	x: 0,
			               	y: linePos,
					width: stage.getAttr('width'),
					height: 10,
			                fill: '#EEEEEE',
			                stroke: '#777777',
			                strokeWidth: 1
			        });
				layer.add(sliderBar);

				pixelPosLeftKnob = Math.round(((tempRecords[storeName][d5].valid_start - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
	                        pixelPosLeftBar = Math.round(((tempRecords[storeName][d5].valid_start_orig - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
	                        pixelPosRight = Math.round(((tempRecords[storeName][d5].valid_end - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
				pixelLeftLast = pixelPosLeftBar;

				steps = ((tempRecords[storeName][d5].valid_end - tempRecords[storeName][d5].valid_start_orig) / 300);
				inc = (pixelPosRight - pixelPosLeftBar) / steps;				
				if(tempRecords[storeName][d5].status != 'Pending' || tempRecords[storeName][d5].status == 'Pending' && config){
					// for vizualizing probablity trend, needs additional width/color lines below too in the highlightBar
					/*
					if(tempRecords[storeName][d5].status == 'Pending'){
						prbs = tempProbs;
					}
					else{
						prbs = tempRecords[storeName][d5].probs[0];
					}
					for(var d6=0;d6<steps;d6++){
						slp = (prbs[d6+1] - prbs[d6]) / 5;
                                                y_int = prbs[d6] - ((d6 * 5) * slp);
						for(var d7=0;d7<5;d7++){
							leftPos = pixelPosLeftBar + (d6 * inc) + ((d7 * inc) / 5);
							prob = parseInt(Math.round((((d6 * 5) + d7) * slp) + y_int,0));
							color = getStandardColor(prob);
							highlightBar = new Kinetic.Rect({	
					                        x: leftPos,
					                       	y: linePos,
					                       	width: (inc / 5),
					                       	height: 10,
					                       	fill: color,
					                       	//stroke: '#000000',
					                       	strokeWidth: 0
					                });
							layer.add(highlightBar);
							if(leftPos < pixelNow && (leftPos + (inc/5)) > pixelNow){
								threatStore.data.items[d3].set('prob',prob + '%');
							}
						}
					}
					*/

					highlightBar = new Kinetic.Rect({
	                                       	x: pixelPosLeftBar,
	                                       	y: linePos,
	                                       	//width: ((leftPos + (inc / 5)) - pixelPosLeftBar),
	                                        width: (pixelPosRight - pixelPosLeftBar),
						height: 10,
	                                        //fill: 'rgba(0,0,0,0)',
	                                        fill: tempRecords[storeName][d5].threatColor,
						stroke: '#000000',
	                                        strokeWidth: 1
	                                });
					layer.add(highlightBar);
					fnames.push(tempRecords[storeName][d5].fname);
					linePositions.push(linePos);
					index = d3;
				}
			}
			else{
			//else if(tempRecords[d5].fname == threatStore.data.items[d3].get('fname')){
				//idx = fnames.indexOf(threatStore.data.items[d3].get('fname'));
				updated = true;
				idx = fnames.indexOf(tempRecords[storeName][d5].fname);
				linePos = linePositions[idx];
				pixelPosLeft = Math.round(((tempRecords[storeName][d5].valid_start - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));
				if(pixelPosLeft < 0){
					pixelPosLeft = 0;
					break;
				}
				//pixelPosRight = Math.round(((records[d5].valid_end - timeCanvasStart) / (timeCanvasEnd - timeCanvasStart)) * stage.getAttr('width'));

				/*
				steps = ((records[d5].valid_end - records[d5].valid_start) / 300);
                                inc = (pixelPosRight - pixelPosLeft) / steps;
                                if(records[d5].status != 'Pending' || records[d5].status == 'Pending' && config){
                                       	if(records[d5].status == 'Pending'){
                                                prbs = tempProbs;
                                        }
                                       	else{
                                               	prbs = records[d5].probs[0];
                                       	}
					eclipse = false;
                                       	for(d6=0;d6<steps;d6++){
                                               	slp = (prbs[d6+1] - prbs[d6]) / 5;
                                               	y_int = prbs[d6] - ((d6 * 5) * slp);
                                               	for(d7=0;d7<5;d7++){
                                                       	leftPos = pixelPosLeft + (d6 * inc) + ((d7 * inc) / 5);
							if((leftPos + (inc / 5)) > pixelLeftLast){
								barWidth = pixelLeftLast - leftPos;
								eclipse = true;
							}
							else{
								barWidth = (inc / 5);
							}
                                                       	prob = (((d6 * 5) + d7) * slp) + y_int;
                                                       	color = getStandardColor(prob);
                                                       	highlightBar = new Kinetic.Rect({       
                                                               	x: leftPos,
                                                               	y: linePos,
                                                               	width: barWidth,
                                                               	height: 10,
                                                               	fill: color,
                                                               	//stroke: '#000000',
                                                               	strokeWidth: 0
                                                       	});
                                                       	layer.add(highlightBar);
							if(eclipse){
								break;
							}
                                               	}
						if(eclipse){
							break;
						}
                                       	}
                               	}
				highlightBar = new Kinetic.Rect({
	                               	x: pixelPosLeft,
	                               	y: linePos,
	                               	width: (pixelLeftLast - pixelPosLeft),
	                               	height: 10,
	                               	fill: 'rgba(0,0,0,1)',
	                                stroke: '#000000',
	                               	strokeWidth: 1
	                        });
				layer.add(highlightBar);
				//layer.batchDraw();
				pixelLeftLast = pixelPosLeft;
				*/
			}
		}
		if(updated){
			highlightBar = new Kinetic.Rect({
                                x: pixelPosLeft,
                                y: linePos,
                                width: (pixelLeftLast - pixelPosLeft),
                                height: 10,
                                fill: '#999999',
                                stroke: '#000000',
                                strokeWidth: 1
                        });
                        layer.add(highlightBar);
		}
	}
}
