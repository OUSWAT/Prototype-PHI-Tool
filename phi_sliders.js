var product = 'Reflectivity';
var field = product;
var lat;
var lon;
var archive = true;
var config = false;
var direction_slider;
var time_slider;
var grid_slider;
var tSlide = false;
var ftime = 0;
var duration_last;
var oldButton = 'prob1';
function loadConfigPanel(featID){
	if(config || !config){
		config = true;
		//document.getElementById("createWarning").value = "Clear";
		//document.getElementById("createBackground").disabled = true;
		//document.getElementById("createWarning").onclick = unloadConfigPanel;
		//document.getElementById("ellipseButton").onclick = unloadConfigPanel;
		//document.getElementById("ellipseButton").onmouseout = 'document.getElementById("ellipseButton").src = "images/ellipseButtonSelect.png"';
		//document.getElementById("ellipseButton").onmouseover = 'document.getElementById("ellipseButton").src = "images/ellipseButtonSelect.png"';
		innerHTML = '<table cellpadding="0" cellspacing="0" border="0" width="100%">';
		innerHTML += '<tr><td width="30%"><u>Threat ID</u>:</td><td width="70%">' + id + '</td></tr>';
		innerHTML += '<tr><td width="30%"><u>Threat(s)</u>:</td><td width="70%"><span id="opt1"></span><span id="opt2"></span><span id="opt3"></span><span id="opt4"></span><span id="opt5"></span><span id="opt6"></span><span id="opt7"></span><span id="opt8"></span></td></tr>';
		innerHTML += '<tr><td width="30%"><u>Valid Start Time</u>:</td><td width="70%"><span id="threatTime"></span></td></tr></table>';
		innerHTML += '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td width="30%"><u>Forecast Time</u>:</td><td width="50%">';
		innerHTML += '<div class="slider" id="time-slider" tabIndex="1" style="outline:none"><input class="time-input" id="time-slider-input" /></div>';
		innerHTML += '</td><td width="20%"><span id="time-input" align="left"></span></td></tr>';
		innerHTML += '</table>';
		innerHTML += '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td width="30%"><u>Max Lead Time</u>:</td><td width="50%">';
		innerHTML += '<div class="slider" id="duration-slider" tabIndex="1" style="outline:none"><input class="slider-input" id="duration-slider-input" /></div>';
		innerHTML += '</td><td width="20%"><span id="duration-input" align="left"></span></td></tr>';
		innerHTML += '</table>';
		innerHTML += '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td width="30%"><u>Recommenders</u>:</td><td width="50%">';
		innerHTML += '<select id="recommenders" onChange="setRecommender();"><option value=""><--Choose--></option><option value="75R30">Right-Turning Supercell</option><option value="cspl">Cubic Spline Interpolation</option></select>';
		innerHTML += '</td><td width="20%"><span id="recon-input" align="left"></span></td></tr>';
		innerHTML += '</table>';
		innerHTML += '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td width="30%"><u>Initial Motion Vector</u>:</td><td width="50%" align="center">';
		innerHTML += '<div id="motionVector"></div></td><td align="left" width="20%"><input type="button" value="Preview Grid" onClick="lightUpGridAccum2();" /></td></tr></table>';
		document.getElementById("warningConfig").innerHTML = innerHTML;

		// modifyFeature.feature.attributes.data['dirs'][0] + '° @ ' + modifyFeature.feature.attributes.data['speeds'][0] + ' kts
		newOpts = ['tornado1','hail1','wind1','lightning1'];
		for(i8=1;i8<=modifyFeature.feature.attributes.data['types'].length;i8++){
	                loadThreats(i8);
	                addOpts(i8);
		}
		loadThreats(i8);
		
		//loadThreats(1);
		//addOpts(1);
		//loadThreats(2);

		loadChartButtons();

		swapBColor(oldButton);
		if(!(document.createElement("input").webkitSpeech === undefined)){
			innerHTML = '<u>Warning Decision Discussion</u>: <input x-webkit-speech type="text" id="speech" size="0" size="60" placeholder="Use For Speech -->" onwebkitspeechchange="setTextArea(this.value);" /><br><textarea id="discussion" rows="10" cols="60" >Recognized text will be copied here (or type manually).</textarea><br>';
		}
		else{
			innerHTML = '<u>Warning Decision Discussion</u>:<br><textarea id="discussion" rows="10" cols="60">Type discussion here.</textarea><br>';
		}
		innerHTML += '<center><input type="button" value="Activate Threat" onClick="activateThreat();"></input></center>';
		document.getElementById("activateThreat").innerHTML = innerHTML;

		innerHTML = '<select id="validStart" onChange="assignValidStart()">'
		for(j=0;j<scans.length;j++){
			vdate = new Date(scans[j][0].split('_')[1] * 1000);
			vtime = pad(vdate.getUTCHours()) + ':' + pad(vdate.getUTCMinutes()) + ':' + pad(vdate.getUTCSeconds()) + ' UTC';
			if(scans[j][0].split('_')[1] == modifyFeature.feature.attributes.data['valid_start']){
				innerHTML += '<option value="' + scans[j][0].split('_')[1] + '" selected>' + vtime + '</option>';
			}
			else{
				innerHTML += '<option value="' + scans[j][0].split('_')[1] + '">' + vtime + '</option>';
			}
		}
		innerHTML += '</select>';
		document.getElementById("threatTime").innerHTML = innerHTML;

		if(modifyFeature.feature.attributes.threatColor == 'rgb(255,0,0)'){
			document.getElementById('threat1').value = 'tornado1';
			changeThreatColor(modifyFeature.feature);
		}
		else if(modifyFeature.feature.attributes.threatColor == 'rgb(0,204,0)'){
			document.getElementById('threat1').value = 'hail1';
			changeThreatColor(modifyFeature.feature);
		}
		else if(modifyFeature.feature.attributes.threatColor == 'rgb(0,0,255)'){
			document.getElementById('threat1').value = 'wind1';
			changeThreatColor(modifyFeature.feature);
		}
		else if(modifyFeature.feature.attributes.threatColor == 'rgb(255,255,0)'){
			document.getElementById('lightning1').value = 'lightning1';
			changeThreatColor(modifyFeature.feature);
		}

		time_slider = new Slider(document.getElementById("time-slider"), document.getElementById("time-slider-input"));
                time_slider.setMaximum(45);
                time_slider.setMinimum(0);
                var time_slider_val = document.getElementById("time-input");
                //time_slider_val.onchange = function () {
                //        time_slider.setValue(parseInt(this.value));
                //};
                time_slider.onchange = function () {
                        ftime = time_slider.getValue();
                        time_slider_val.innerHTML = '+' + ftime + ' min.';
			tSlide = true;
                        modifyThreat(updateThreat);
			tSlide = false;
			//master_time_slider.setValue(tempValidStart + (60 * ftime));
			timeCanvasVal.setAttr('time',tempValidStart + (60 * ftime));
			moveSliderTime();
                };
		time_slider.setValue(0);

                var duration_slider = new Slider(document.getElementById("duration-slider"), document.getElementById("duration-slider-input"));
                duration_slider.setMaximum(24);
                duration_slider.setMinimum(3);
                var duration_slider_val = document.getElementById("duration-input");
                duration_slider_val.onchange = function () {
                        duration_slider.setValue(parseInt(this.value) * 5);
                };
                duration_slider.onchange = function () {
			if(ftime == 0){
	                       	modifyFeature.feature.attributes.data['duration'] = duration_slider.getValue() * 5;
				modifyFeature.feature.attributes.data['valid_end'] = parseInt(modifyFeature.feature.attributes.data['valid_start']) + (60 * parseInt(modifyFeature.feature.attributes.data['duration']));
	                        duration_slider_val.innerHTML = modifyFeature.feature.attributes.data['duration'] + ' min.';
				time_slider.setMaximum(modifyFeature.feature.attributes.data['duration']);
				modifyThreat(updateThreat);
				deletePendingRecords();
	                       	insertRecord(modifyFeature.feature.clone(),'Pending');
	                        //buildWarning();
			}
			else{
				//alert('Changes cannot be made while previewing threat evolution');
				duration_slider.setValue(modifyFeature.feature.attributes.data['duration'] / 5);
			}
                };
                if(modifyFeature.feature != null){
			duration_slider.setValue(modifyFeature.feature.attributes.data['duration'] / 5);
		}
		else{
			duration_slider.setValue(9);
		}
        }
	else{
	}
}
function unloadConfigPanel(){
	if(drawType == 'ellipse'){
		document.getElementById("ellipseButton").onclick = function(){drawType = 'ellipse'; drawThreat();}
	        document.getElementById("ellipseButton").onmouseout = function(){this.src = "images/ellipseButton.png";}
	        document.getElementById("ellipseButton").onmouseover = function(){this.src = "images/ellipseButtonHighlight.png";}
		//document.getElementById("ellipseButton").src = "images/ellipseButtonHighlight.png";
	}
	else if(drawType == 'polygon'){
		document.getElementById("polyButton").onclick = function(){drawType = 'polygon'; drawThreat();}
                document.getElementById("polyButton").onmouseout = function(){this.src = "images/polyButton.png";}
                document.getElementById("polyButton").onmouseover = function(){this.src = "images/polyButtonHighlight.png";}
                //document.getElementById("polyButton").src = "images/polyButtonHighlight.png";
	}
	p1 = null;
	p2 = null;
       	config = false;
	direction_slider = null;
        unBuildWarning();
	//document.getElementById("createBackground").disabled = false;
	types = [];
	history = [];
	redoHistory = [];
	featureTypes = [];
	moveThreatTime = null;
        //document.getElementById("createWarning").value = "Create Threat Probabilities";
	//document.getElementById("createWarning").onclick = drawThreat;
        document.getElementById("warningConfig").innerHTML = "";
	document.getElementById("attrButtons").innerHTML = "";
	changeTime();
}

function assignValidStart(){
	if(updateThreat){
		for(m=0;m<activeThreatClones.features.length;m++){
           		if(activeThreatClones.features[m].attributes.data['issue'] == modifyFeature.feature.attributes.data['issue'] && activeThreatClones.features[m].attributes.data['types'][0].split('_')[0] != modifyFeature.feature.attributes.data['id']){
                                index = m;
                        	break;
                	}
        	}
		timeDiff = document.getElementById("validStart").value - activeThreatClones.features[index].attributes.data['valid_start'];
		if(timeDiff < 0){
			alert('Invalid Time Setting');
			return;
		}
		modifyFeature.feature.attributes.data['timeDiff'] = timeDiff;
		swaths.removeAllFeatures();
		geoClone = activeThreats.features[index].clone();
                interpolateSwath(geoClone);
	}
	modifyFeature.feature.attributes.data['valid_start'] = document.getElementById("validStart").value;
	//alert(modifyFeature.feature.attributes.data['valid_end']);
	modifyFeature.feature.attributes.data['valid_end'] = parseInt(modifyFeature.feature.attributes.data['valid_start']) + (60 * parseInt(modifyFeature.feature.attributes.data['duration']));
	//master_time_slider.setValue(document.getElementById("validStart").value);
	timeCanvasVal.setAttr('time',document.getElementById("validStart").value);
	//moveSliderTime();
	deletePendingRecords();
       	insertRecord(modifyFeature.feature.clone(),'Pending');
	modifyThreat(updateThreat);
}

opts = ['tornado1','hail1','wind1','lightning1'];
var newOpts = ['tornado1','hail1','wind1','lightning1'];
var types = [];
optsAvail = ['none','tornado1','tornado2','hail1','hail2','wind1','wind2','lightning1','lightning2'];
optsName = ['Add Threat','Tornado (EF0+)','Sig. Tornado (EF2+)','Hail (1 in.+)','Sig. Hail (2 in.+)','Wind (50 kts+)','Sig. Wind (65 kts+)','Lightning','Sig. Lightning'];
function loadThreats(val){
	prev = 'threat' + (val - 1);
	if(val != 1 && document.getElementById(prev).value == 'none'){
		return;
	}
	val2 = val + 1;
	innerHTML = '<select id="threat' + val + '" onChange="addOpts(' + val + '); changeThreatColor(modifyFeature.feature); loadThreats(' + val2 + '); loadChartButtons(); oldButton = \'prob1\'; document.getElementById(oldButton).click();">';
	for(i=0;i<newOpts.length;i++){
		if(val <= modifyFeature.feature.attributes.data['types'].length && newOpts[i] == modifyFeature.feature.attributes.data['types'][val-1]){
		        innerHTML += '<option value="' + newOpts[i] + '" selected>' + optsName[optsAvail.indexOf(newOpts[i])] + '</option>';
		}
		else{
			innerHTML += '<option value="' + newOpts[i] + '">' + optsName[optsAvail.indexOf(newOpts[i])] + '</option>';
		}
	}
	innerHTML += '</select>';
	option = 'opt' + val;
	document.getElementById(option).innerHTML = innerHTML;
}

function addOpts(val){
	newOpts = ['none','tornado1','hail1','wind1','lightning1'];
	types = [];
	for(i=1;i<=val;i++){
		option = 'threat' + i;
		selectedOption = document.getElementById(option).value;
		if(selectedOption != 'none'){
			types.push(selectedOption);
		}
		if(selectedOption == 'tornado1'){
			newOpts.splice(newOpts.indexOf('tornado1'),1);
			newOpts.push('tornado2');
		}
		else if(selectedOption == 'tornado2'){
                        newOpts.splice(newOpts.indexOf('tornado2'),1);
                }
		else if(selectedOption == 'hail1'){
			newOpts.splice(newOpts.indexOf('hail1'),1);
			newOpts.push('hail2');
		}
		else if(selectedOption == 'hail2'){
                        newOpts.splice(newOpts.indexOf('hail2'),1);
                }
		else if(selectedOption == 'wind1'){
			newOpts.splice(newOpts.indexOf('wind1'),1);
                        newOpts.push('wind2');
                }
		else if(selectedOption == 'wind2'){
                        newOpts.splice(newOpts.indexOf('wind2'),1);
                }
		else if(selectedOption == 'lightning1'){
			newOpts.splice(newOpts.indexOf('lightning1'),1);
                        newOpts.push('lightning2');
                }
		else if(selectedOption == 'lightning2'){
                        newOpts.splice(newOpts.indexOf('lightning2'),1);
                }
	}
	for(i=(val+1);i<=8;i++){
		option = 'opt' + i;
		document.getElementById(option).innerHTML = '';
	}
}

function setRecommender(){
	selectedOption = document.getElementById('recommenders').value;
	if(selectedOption != ""){
		for(i=0;i<threat_area.features.length;i++){
			if(threat_area.features[i].attributes.data['valid_start'] == modifyFeature.feature.attributes.data['valid_start'] && threat_area.features[i].attributes.data['id'] == modifyFeature.feature.attributes.data['id']){
				index = i;
				break;
			}
		}
		modifyFeature.unsetFeature();
		
		if(selectedOption == "75R30"){
			new_speeds = [];
			new_dirs = [];
			for(i=0;i<threat_area.features[index].attributes.data['speeds'].length;i++){
				if(i == 0){
					new_speeds.push(threat_area.features[index].attributes.data['speeds'][i]);
					new_dirs.push(threat_area.features[index].attributes.data['dirs'][i]);
				}
				else if(i <= (threat_area.features[index].attributes.data['duration'] / 5)){
					offset_angle = threat_area.features[index].attributes.data['dirs'][0] + (30 * (i / (threat_area.features[index].attributes.data['duration'] / 5)));
					offset_speed = threat_area.features[index].attributes.data['speeds'][0] * ((75 + (25 * (1 - (i / (threat_area.features[index].attributes.data['duration'] / 5))))) / 100);
					new_speeds.push(offset_speed);
					new_dirs.push(offset_angle);
				}
				else{
					new_speeds.push(offset_speed);
					new_dirs.push(offset_angle);
				}
			}
			threat_area.features[index].attributes.data['speeds'] = new_speeds;
			threat_area.features[index].attributes.data['dirs'] = new_dirs;
			modifyFeature.setFeature(threat_area.features[index]);
		}
		else if(selectedOption == "cspl"){
			xCoords = [];
			yCoords = [];
			ks = [];
			for(i=0;i<wof_points.features.length;i+=10){
				if(i != 0 && i!= (wof_points.features.length - 1)){
					xNew = (wof_points.features[i-2].geometry.x + wof_points.features[i-1].geometry.x + wof_points.features[i].geometry.x + wof_points.features[i+1].geometry.x + wof_points.features[i+2].geometry.x) / 5;
					yNew = (wof_points.features[i-2].geometry.y + wof_points.features[i-1].geometry.y + wof_points.features[i].geometry.y + wof_points.features[i+1].geometry.y + wof_points.features[i+2].geometry.y) / 5;
					wof_points.features[i].geometry.move((xNew - wof_points.features[i].geometry.x),(yNew - wof_points.features[i].geometry.y));
				}
				xCoords.push(wof_points.features[i].geometry.x);
				yCoords.push(wof_points.features[i].geometry.y);
			}
			CSPL.getNaturalKs(xCoords,yCoords,ks);
			j = -1;
			j2 = -10;
			for(i=0;i<wof_points.features.length;i++){
				if((i%10) == 0){
					j+=10;
					j2+=10;
					k = 0;
				}
				else{
					k++;
					x = wof_points.features[j2].geometry.x + (((wof_points.features[j].geometry.x - wof_points.features[j2].geometry.x) / 9) * k);
					y = CSPL.evalSpline(x,xCoords,yCoords,ks);
					xDiff = x - wof_points.features[i].geometry.x;
					yDiff = y - wof_points.features[i].geometry.y;
					wof_points.features[i].geometry.move(xDiff,yDiff);
				}
				if(i > 0){
					newSpeed = Math.round((Math.sqrt(Math.pow((wof_points.features[i].geometry.x - wof_points.features[i-1].geometry.x),2) + Math.pow((wof_points.features[i].geometry.y - wof_points.features[i-1].geometry.y),2)) / 60) * 1.94384);
					newDir = 270 - Math.round((180 / Math.PI) * Math.atan2((wof_points.features[i].geometry.y - wof_points.features[i-1].geometry.y),(wof_points.features[i].geometry.x - wof_points.features[i-1].geometry.x)));
					if(newDir >= 360){
						newDir = newDir - 360;
					}
					if(newDir < 0){
                                                newDir = newDir + 360;
                                        }
					wof_points.features[i-1].attributes.speed = newSpeed;
					wof_points.features[i-1].attributes.dir = newDir;
					if(i == (wof_points.features.length - 1)){
						wof_points.features[i].attributes.speed = newSpeed;
	                                        wof_points.features[i].attributes.dir = newDir;
					}
				}
			}
			for(i=0;i<threat_area.features.length;i++){
                                if(threat_area.features[i].attributes.data['valid_start'] == tempValidStart && types.indexOf(threat_area.features[i].attributes.data['types'][0]) != -1){
                                        idx = i;
                                        break;
                                }
                        }
			setWofAttributes();
			wofR = false;
			modifyFeature.unsetFeature();
                        modifyFeature.setFeature(threat_area.features[idx]);
		}
	}
}

function setTextArea(val){
        txt = document.getElementById('discussion');
	split = val.split(' ');
	txtData = [];
	capitalize = false;
	for(i=0;i<split.length;i++){
		if(i == 0 || capitalize){
			txtData.push(split[i].capitalize());
			capitalize = false;
		}
		else{
			txtData.push(split[i]);
		}
	}
	if(txt.value == "Recognized text will be copied here (or type manually)." || txt.value == ''){
		txt.value = txtData.join(' ');
        }
        else{
                txt.value = txt.value + '  ' + txtData.join(' ');
        }
	document.getElementById('speech').value = '';
}

function swapBColor(newButton){
	document.getElementById(oldButton).style.background = '#DDDDDD';
	document.getElementById(oldButton).style.color = '#000000';
	document.getElementById(newButton).style.background = '#000099';
	document.getElementById(newButton).style.color = '#FFFFFF';
	oldButton = newButton;
}

function setWofAttributes(){
        tempProbs = modifyFeature.feature.attributes.data['probs'][0];
        tempSpeeds = modifyFeature.feature.attributes.data['speeds'];
        tempDirs = modifyFeature.feature.attributes.data['dirs'];
        tempDirs_orig = modifyFeature.feature.attributes.data['dirs_orig'];
        tempSpd = modifyFeature.feature.attributes.data['spd'];
        tempDir = modifyFeature.feature.attributes.data['dir'];
	//tempId = modifyFeature.feature.attributes.data['id'];
        //tempDuration = modifyFeature.feature.attributes.data['duration'];
	//tempThreatColor = modifyFeature.feature.attributes.data['threatColor'];
        //tempValidStart = parseInt(modifyFeature.feature.attributes.data['valid_start']);
        //tempValidEnd = parseInt(modifyFeature.feature.attributes.data['valid_end']);
	tempDuration = wof_points.features[0].attributes.duration;
        tempProbs = [];
        tempSpeeds  = [];
        tempDirs  = [];
        tempDirs_orig = [];
        tempSpd  = [];
        tempDir = [];
        for(i=0;i<default_dirs.length;i++){
                j = i * 5;
                if(j < wof_points.features.length){
                        tempProbs.push(wof_points.features[j].attributes.prob);
                        tempSpeeds.push(wof_points.features[j].attributes.speed);
                        tempDirs.push(wof_points.features[j].attributes.dir);
                        tempDirs_orig.push(wof_points.features[j].attributes.dir);
                        tempSpd.push(wof_points.features[j].attributes.spdu);
                        tempDir.push(wof_points.features[j].attributes.diru);
                }
                else{
                        tempProbs.push(wof_points.features[wof_points.features.length - 1].attributes.prob);
                        tempSpeeds.push(wof_points.features[wof_points.features.length - 1].attributes.speed);
                        tempDirs.push(wof_points.features[wof_points.features.length - 1].attributes.dir);
                        tempDirs_orig.push(wof_points.features[wof_points.features.length - 1].attributes.dir);
                        tempSpd.push(wof_points.features[wof_points.features.length - 1].attributes.spdu);
                	tempDir.push(wof_points.features[wof_points.features.length - 1].attributes.diru);
        	}
        }
        modifyFeature.feature.attributes.data['probs'][0] = tempProbs;
        modifyFeature.feature.attributes.data['speeds'] = tempSpeeds;
        modifyFeature.feature.attributes.data['dirs'] = tempDirs;
        modifyFeature.feature.attributes.data['dirs_orig'] = tempDirs_orig;
        modifyFeature.feature.attributes.data['spd'] = tempSpd;
	modifyFeature.feature.attributes.data['dir'] = tempDir;
        modifyFeature.feature.attributes.data['duration'] = tempDuration;
}

function showWoF(){
	if(document.getElementById('showWoF').checked){
		activeWof.setVisibility(true);
	}
	else{
		activeWof.setVisibility(false);
	}
	changeTime();
}

function setGridNums(){
	colorScale = document.getElementById('colorScale').value;
	currentTimeLast = -999;
	ndfd_grid.removeAllFeatures();
	ndfd_grid2.removeAllFeatures();
	if(document.getElementById('gridNums').checked){
		ndfd_grid.styleMap = styleMapGrid3;
		ndfd_grid2.styleMap = styleMapGrid3;
        }
        else{
		ndfd_grid.styleMap = styleMapGrid;
		ndfd_grid2.styleMap = styleMapGrid;
        }
	changeTime();
}

function getButtonVal(){
	if(modifyFeature.feature.attributes.threatColor == 'rgb(255,0,0)'){
                buttonVal = 'P(Tornado)';
        }
        else if(modifyFeature.feature.attributes.threatColor == 'rgb(0,204,0)'){
                buttonVal = 'P(Hail)';
        }
        else if(modifyFeature.feature.attributes.threatColor == 'rgb(0,0,255)'){
                buttonVal = 'P(Wind)';
        }
	else if(modifyFeature.feature.attributes.threatColor == 'rgb(255,255,0)'){
		buttonVal = 'P(Lightning)';
	}
	else{
		buttonVal = 'P(RuhRoh)';
	}
	return buttonVal;
}

function loadChartButtons(){
		i = 0;
                innerHTML = '';
                for(j=0;j<types.length;j++){
			if(j == 0){
				innerHTML += '<br>';
			}
                        if(types[j] == 'tornado1'){
                                i++;
                                if(types.indexOf('tornado2') == -1){
                                        innerHTML += '<input type="button" id="prob' + i + '" style="width:90px; background:#DDDDDD" value="P(Tornado)" onClick="probChart(\'tornado1\',\'\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                                else{
                                        innerHTML += '<input type="button" id="prob' + i + '" style="width:90px; background:#DDDDDD" value="P(Tornado)" onClick="probChart(\'tornado1\',\'tornado2\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                        }
                        else if(types[j] == 'hail1'){
                                i++;
                                if(types.indexOf('hail2') == -1){
                                        innerHTML += '<input type="button" id="prob' + i + '" style="width:90px; background:#DDDDDD" value="P(Hail)" onClick="probChart(\'hail1\',\'\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                                else{
                                        innerHTML += '<input type="button" id="prob' + i + '" style="width:90px; background:#DDDDDD" value="P(Hail)" onClick="probChart(\'hail1\',\'hail2\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                        }
                        else if(types[j] == 'wind1'){
                                i++;
                                if(types.indexOf('wind2') == -1){
                                        innerHTML += '<input type="button" id="prob' + i + '" style="width:90px; background:#DDDDDD" value="P(Wind)" onClick="probChart(\'wind1\',\'\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                                else{
                                        innerHTML += '<input type="button" id="prob' + i + '" style="width:90px; background:#DDDDDD" value="P(Wind)" onClick="probChart(\'wind1\',\'wind2\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                        }
			else if(types[j] == 'lightning1'){
                                i++;
                                if(types.indexOf('lightning2') == -1){
                                        innerHTML += '<input type="button" id="prob' + i + '" style="width:90px; background:#DDDDDD" value="P(Lightning)" onClick="probChart(\'lightning1\',\'\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                                else{
                                        innerHTML += '<input type="button" id="prob' + i + '" style="width:90px; background:#DDDDDD" value="P(Lightning)" onClick="probChart(\'lightning1\',\'lightning2\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                        }
                }
                innerHTML += '<input type="button" id="speed" style="width:90px; background:#DDDDDD" value="Speed" onClick="speedChart(); swapBColor(this.id);" /><br>';
                innerHTML += '<input type="button" id="spd" style="width:90px; background:#DDDDDD;" value="Speed (?)" onClick="speedDeltaChart(); swapBColor(this.id);" /><br>';
                innerHTML += '<input type="button" id="direction" style="width:90px; background:#DDDDDD" value="Direction" onClick="dirChart(); swapBColor(this.id);" /><br>';
                innerHTML += '<input type="button" id="dir" style="width:90px; background:#DDDDDD;" value="Direction (?)" onClick="dirDeltaChart(); swapBColor(this.id);" /><br>';
		innerHTML += '<input type="button" style="width:45px; background:#DDDDDD; font-size:11px;" value="UNDO" onClick="undo();" />';
		innerHTML += '<input type="button" style="width:45px; background:#DDDDDD; font-size:11px;" value="REDO" onClick="redo();" />';
                document.getElementById("attrButtons").innerHTML = innerHTML;
}
