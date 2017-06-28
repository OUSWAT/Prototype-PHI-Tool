/*

Copyright (c) 2014 Cooperative Institute for Mesoscale Meteorological Studies (CIMMS) and the University of Oklahoma

Author:         Dr. Chris Karstens
Email:          chris.karstens@noaa.gov
Description:    Contains the following:
			1. primary function for loading data onto the threat probability tab
			2. function to unload data from threat probability tab
			3. assigns or reassigns the valid start time to the threat object
			4. loads list of threat type(s) assigned to threat object
			5. generates select menu of threat type(s) for user to assign to threat object
			6. modifies threat object attributes based on recommender selection
			7. sets speech-to-text to warning decision discussion text box
			8. function for controlling button colors
			9. reassigns style map to ndfd grid
			10. function for returning primary threat type
			11. loads list of buttons for temporal array charts
			12. functions for undoing or redoing modifications to threat object temporal array atributes
			13. function for resetting threat type(s)

*/

// primary function for loading data onto the threat probability tab
function loadConfigPanel(featID){
	if(configPanelLoaded){
		//return;
	}
	configPanelLoaded = true;
	if(config || !config){

		setHistory = false;
		//config = true;
		//document.getElementById("createWarning").value = "Clear";
		//document.getElementById("createBackground").disabled = true;
		//document.getElementById("createWarning").onclick = unloadConfigPanel;
		//document.getElementById("ellipseButton").onclick = unloadConfigPanel;
		//document.getElementById("ellipseButton").onmouseout = 'document.getElementById("ellipseButton").src = "images/ellipseButtonSelect.png"';
		//document.getElementById("ellipseButton").onmouseover = 'document.getElementById("ellipseButton").src = "images/ellipseButtonSelect.png"';

		var mFound = false;
		if(modifyFeature.feature.attributes.data['RowName'] != -999){
	               	for(var mKey in modifyFeature.feature.attributes.data.modified){
	                       	if(modifyFeature.feature.attributes.data.modified[mKey] == 1){
	                               	mFound = true;
	                               	break;
	                        }
	                }
		}

		innerHTML = '<table cellpadding="3" cellspacing="0" border="0" width="100%">';
		innerHTML += '<tr><td width="30%"><u>ID/Start Time</u>:</td><td width="70%">' + modifyFeature.feature.attributes.data['id'] + '&nbsp;&nbsp;&nbsp;&nbsp;<span id="threatTime"></span>';
		if(modifyFeature.feature.attributes.data['automated'] > 0 || modifyFeature.feature.attributes.data['automated'] == 0 && mFound){
			innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;<input type="button" id="resetAuto" value="Reset" onClick="resetAuto();" />';
		}
		innerHTML += '</td></tr>';
		innerHTML += '<tr><td width="30%"><u>Hazard</u>:</td><td width="70%"><span id="opt1"></span></td></tr>';
		if(modifyFeature.feature.attributes.data['types'][0] != 'lightning1'){
			innerHTML += '<tr><td width="30%"><u>Product</u>:</td><td width="70%"><span id="alertLevel"></span><span id="legWarning"></span></td></tr>';
		}
		innerHTML += '<tr><td width="30%"><u>Severity</u>:</td><td width="70%"></span><span id="severity"></span></td></tr>';
		innerHTML += '</table>';
		innerHTML += '<hr color="#000000" />';
		innerHTML += '<table cellpadding="3" cellspacing="0" border="0" width="100%">';		
		innerHTML += '<tr><td width="30%"><u>Motion/Duration</u>:</td><td width="70%">';
		if(modifyFeature.feature.attributes.data.modified['direction'] == 1){
			innerHTML += '<input id="motionVectorDir" style="font-weight:bold;" type="text" maxlength="3" size="3" onChange="adjustVector(\'direction\');" /> ° @ ';
		}
		else{
			innerHTML += '<input id="motionVectorDir" type="text" maxlength="3" size="3" onChange="adjustVector(\'direction\');" /> ° @ ';
		}
		if(modifyFeature.feature.attributes.data.modified['speed'] == 1){
			innerHTML += '<input id="motionVectorSpeed" style="font-weight:bold;" type="text" maxlength="3" size="3" onChange="adjustVector(\'speed\');" /> kts&nbsp;&nbsp;&nbsp;&nbsp;for&nbsp;&nbsp;';
		}
		else{
			innerHTML += '<input id="motionVectorSpeed" type="text" maxlength="3" size="3" onChange="adjustVector(\'speed\');" /> kts&nbsp;&nbsp;&nbsp;&nbsp;for&nbsp;&nbsp;';
		}
		if(modifyFeature.feature.attributes.data.modified['duration'] == 1){
			innerHTML += '<input type="text" id="duration-input" style="font-weight:bold;" maxlength="3" size="3" onChange="changeDuration();" > minutes</td></tr>';
		}
		else{
			innerHTML += '<input type="text" id="duration-input" maxlength="3" size="3" onChange="changeDuration();" > minutes</td></tr>';
		}
		if(modifyFeature.feature.attributes.data['automated'] > 0 || modifyFeature.feature.attributes.data['automated'] == 0 && mFound){
			if(modifyFeature.feature.attributes.data.modified['object'] == 0){
				innerHTML += '<tr><td width="30%"><u>Object Shape/Pos</u>:</td><td width="70%">';
				innerHTML += '<table><tr><td style="font-size:90%;">';
				innerHTML += 'Auto:<input type="checkbox" id="autoObject" onChange="modifyAutoObject();" checked />&nbsp;&nbsp;&nbsp;&nbsp;';
				innerHTML += '</td><td style="font-size:90%;">';
				innerHTML += 'Buffer:&nbsp;<input id="objBuffer" type="text" value="0" maxlength="3" size="1" onChange="adjustObjPosition();" />&nbsp;km&nbsp;&nbsp;&nbsp;';
				innerHTML += '</td><td style="font-size:90%;">';
				innerHTML += 'Offset X:&nbsp;<input id="objOffsetX" type="text" value="0" maxlength="2" size="1" onChange="adjustObjPosition();" />&nbsp;km';
				innerHTML += '</td></tr><tr><td>';
				innerHTML += '</td><td style="font-size:90%;">';
				innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Dir:&nbsp;<input id="objBufDir" type="text" value="-1" maxlength="3" size="2" onChange="adjustObjPosition();" /> °';
				innerHTML += '</td><td style="font-size:90%;">';
				innerHTML += 'Offset Y:&nbsp;<input id="objOffsetY" type="text" value="0" maxlength="2" size="1" onChange="adjustObjPosition();" />&nbsp;km';
				innerHTML += '</td></tr></table>';
				innerHTML += '</td></tr>';
			}
			else{
				innerHTML += '<tr><td width="30%"><u>Object Shape/Pos</u>:</td><td width="70%">';
				innerHTML += '<table><tr><td style="font-size:90%;">';
                               	innerHTML += 'Auto:<input type="checkbox" id="autoObject" onChange="modifyAutoObject();" />&nbsp;&nbsp;&nbsp;&nbsp;';
                               	innerHTML += '</td><td style="font-size:90%;">';
                               	innerHTML += 'Buffer:&nbsp;<input id="objBuffer" type="text" value="0" maxlength="3" size="3" onChange="adjustObjPosition();" disabled />&nbsp;km&nbsp;&nbsp;&nbsp;';
                               	innerHTML += '</td><td style="font-size:90%;">';
                               	innerHTML += 'Offset X:&nbsp;<input id="objOffsetX" type="text" value="0" maxlength="2" size="2" onChange="adjustObjPosition();" disabled />&nbsp;km';
                               	innerHTML += '</td></tr><tr><td>';
                               	innerHTML += '</td><td style="font-size:90%;">';
                               	innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Dir:&nbsp;<input id="objBufDir" type="text" value="-1" maxlength="3" size="3" onChange="adjustObjPosition();" disabled /> °';
                               	innerHTML += '</td><td style="font-size:90%;">';
                               	innerHTML += 'Offset Y:&nbsp;<input id="objOffsetY" type="text" value="0" maxlength="2" size="2" onChange="adjustObjPosition();" disabled />&nbsp;km';
                               	innerHTML += '</td></tr></table>';
				innerHTML += '</td></tr>';
			}
		}
		//innerHTML += '<tr><td width="30%"><u>Prediction</u>:</td><td width="70%"><span id="prediction"></span></td></tr>';
		//innerHTML += '<tr><td width="30%"><u>Severity</u>:</td><td width="70%"><span id="severity"></span></td></tr>';
		//innerHTML += '<tr><td width="30%"><u>Alert Level</u>:</td><td width="70%"><span id="alertLevel"></span></td></tr>';
		//innerHTML += '<tr><td width="30%"><u>Warning Threshold</u>:</td><td width="70%"><span id="legWarning"></span></td></tr>';
		//innerHTML += '<tr><td width="30%"><u>Prediction</u>:</td><td width="70%"><span id="prediction"></span></td></tr>';
		innerHTML += '</table>';

		//innerHTML += '<table cellpadding="0" cellspacing="0" border="0" width="100%">';
		//innerHTML += '<tr><td width="30%"><u>Threat(s)</u>:</td><td width="70%"><span id="opt1"></span><span id="opt2"></span><span id="opt3"></span><span id="opt4"></span><span id="opt5"></span><span id="opt6"></span><span id="opt7"></span><span id="opt8"></span></td></tr>';
		//innerHTML += '<tr><td width="30%"><u>Hazard</u>:</td><td width="70%"><span id="opt1"></span></td></tr>';
		//innerHTML += '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td width="30%"><u>Duration</u>:</td><td width="50%">';
                //innerHTML += '<div class="slider" id="duration-slider" tabIndex="1" style="outline:none"><input class="slider-input" id="duration-slider-input" /></div>';
                //innerHTML += '</td><td width="20%"><input type="text" id="duration-input" maxlength="3" size="3" onChange="setLeadTime();" > min.</td></tr>';
		//innerHTML += '</table>';
		innerHTML += '<hr color="#000000" />';

		innerHTML += '<table cellpadding="3" cellspacing="0" border="0" width="100%">';
		innerHTML += '<tr><td width="30%"><u>Prediction</u>:</td><td width="70%"><span id="prediction"></span></td></tr>';
		if(modifyFeature.feature.attributes.data['types'][0] == 'tornado1'){
                       	innerHTML += '<tr><td width="30%"><u>Guidance</u>:</td><td width="70%">';
                       	innerHTML += 'Peak Shear: <input id="peakShear" type="text" maxlength="3" size="3" onChange="computePeakShearProbs();" /> kts';
			innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
			innerHTML += '<input type="button" value="ProbTor" onClick="interpolateTrend(\'probTor\');" />';
                       	innerHTML += '</td></tr>';
               	}
		else if(modifyFeature.feature.attributes.data['types'][0] == 'severe1' && modifyFeature.feature.attributes.data['RowName'] != -999){
			innerHTML += '<tr><td width="30%"><u>Guidance</u>:</td><td width="70%">';
			innerHTML += '<input type="button" value="ProbSevere" onClick="interpolateTrend(\'prob\');" />';
                        innerHTML += '&nbsp;&nbsp;&nbsp;';
                        innerHTML += '<input type="button" value="ProbHail" onClick="interpolateTrend(\'probHail\');" />';
			innerHTML += '&nbsp;&nbsp;&nbsp;';
                       	innerHTML += '<input type="button" value="ProbWind" onClick="interpolateTrend(\'probWind\');" />';
			innerHTML += '&nbsp;&nbsp;&nbsp;';
                       	innerHTML += '<input type="button" value="ProbTor" onClick="interpolateTrend(\'probTor\');" />';
                       	innerHTML += '</td></tr>';
		}
		innerHTML += '<tr><td width="30%"><u>Trend Interpolation</u>:</td><td width="70%">';
		innerHTML += '<input type="button" id="drawProbsButton" value="Draw" onClick="drawProbsInit();" />';
		innerHTML += '<input type="button" value="Linear" onClick="interpolateTrend(\'linear\');" />';
		innerHTML += '<input type="button" value="Exp1" onClick="interpolateTrend(\'exp\');" />';
		innerHTML += '<input type="button" value="Exp2" onClick="interpolateTrend(\'decay\');" />';
		innerHTML += '<input type="button" value="Bell" onClick="interpolateTrend(\'bell\');" />';
		innerHTML += '<input type="button" value="+5" onClick="interpolateTrend(\'plus5\');" />';
		innerHTML += '<input type="button" value="-5" onClick="interpolateTrend(\'minus5\');" />';
		innerHTML += '<input type="button" value="Obs" onClick="interpolateTrend(\'obs\'); setSource();" />';
		innerHTML += '</td></tr>';
		innerHTML += '<tr><td width="30%"></td><td width="70%">';
		innerHTML += '<input type="button" style="width:45px; background:#DDDDDD; font-size:11px;" value="UNDO" onClick="undo();" />';
                innerHTML += '<input type="button" style="width:45px; background:#DDDDDD; font-size:11px;" value="REDO" onClick="redo();" />';
                innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
		innerHTML += '<input type="checkbox" id="gridPreviewBox" onChange="changeGridState(); ndfd_grid2.removeAllFeatures(); lightUpGridAccum2(true);">Grid Preview';
		innerHTML += '</td></tr>';
		innerHTML += '</table>';
		document.getElementById("warningConfig").innerHTML = innerHTML;
		if(modifyFeature.feature.attributes.data['types'][0] == 'tornado1'){
			document.getElementById("peakShear").value = shearVal;
		}
		modifyFeature.feature.attributes.data['valid_end'] = parseInt(modifyFeature.feature.attributes.data['valid_start']) + (60 * parseInt(modifyFeature.feature.attributes.data['duration'])); // need to fix this at some point... valid_end is set as a string somewhere...
		document.getElementById("duration-input").value = parseInt(modifyFeature.feature.attributes.data['duration']);
		document.getElementById("motionVectorDir").value = parseInt(modifyFeature.feature.attributes.data['dirs'][0]);
		document.getElementById("motionVectorSpeed").value = parseInt(modifyFeature.feature.attributes.data['speeds'][0]);
		try{
			if(modifyFeature.feature.attributes.data.hasOwnProperty('buffer')){
				document.getElementById("objBuffer").value = modifyFeature.feature.attributes.data['buffer'];
				console.log('Bufval: ' + modifyFeature.feature.attributes.data['buffer']);
			}
		}
		catch(err){}
		try{
			if(modifyFeature.feature.attributes.data.hasOwnProperty('bufDir')){
				document.getElementById("objBufDir").value = modifyFeature.feature.attributes.data['bufDir'];
			}
		}
		catch(err){}
		try{
			if(modifyFeature.feature.attributes.data.hasOwnProperty('objOffsetX')){
		                document.getElementById("objOffsetX").value = modifyFeature.feature.attributes.data['objOffsetX'].toFixed(1);
				document.getElementById("objOffsetY").value = modifyFeature.feature.attributes.data['objOffsetY'].toFixed(1);
			}
		}
		catch(err){}

		if(gridState){
                       	document.getElementById('gridPreviewBox').checked = true;
               	}
               	else{
                       	document.getElementById('gridPreviewBox').checked = false;
               	}

		
		// modifyFeature.feature.attributes.data['dirs'][0] + '° @ ' + modifyFeature.feature.attributes.data['speeds'][0] + ' kts
		var newOpts = ['tornado1','severe1','hail1','wind1','lightning1'];
		for(var i8=1;i8<=modifyFeature.feature.attributes.data['types'].length;i8++){
	                loadThreats(i8);
	                addOpts(i8);
		}
		loadThreats(i8);
		
		//loadThreats(1);
		//addOpts(1);
		//loadThreats(2);

		loadChartButtons();

		//swapBColor(oldButton);
		innerHTML = '<hr color="#000000" />';
		//innerHTML += '<table cellpadding="3" cellspacing="0" border="0" width="100%">';
		//innerHTML += '<tr><td width="30%"><u>Prediction</u>:</td><td width="70%"><span id="prediction"></span></td></tr>';
		//innerHTML += '<tr><td width="30%"><u>Alert Level</u>:</td><td width="70%"><span id="alertLevel"></span><span id="legWarning"></span></td></tr>';
                //innerHTML += '<tr><td width="30%"><u>Severity</u>:</td><td width="70%"><span id="severity"></span></td></tr>';
		//innerHTML += '<tr><td width="30%"><u>Confidence</u>:</td><td width="70%"><span id="confidence"></span></td></tr>';
		//innerHTML += '</table>';
		if(!(document.createElement("input").webkitSpeech === undefined)){
			innerHTML += '<u>Discussion</u>: <input x-webkit-speech type="text" id="speech" size="0" size="" placeholder="Use For Speech -->" onwebkitspeechchange="setTextArea(this.value);" /><br><textarea id="discussion" onInput="recordDisc();" rows="5" cols="60" >Recognized text will be copied here (or type manually).</textarea><br>';
		}
		else{
			innerHTML += '<u>Discussion</u>:&nbsp;&nbsp;&nbsp;&nbsp;<input type="button" value="Clear" onClick="clearDisc();"></input><br><textarea id="discussion" onInput="recordDisc();" rows="5" cols="60"></textarea><br>';
		}
		//innerHTML += '<u>Actions</u>:<br><textarea id="actions" onInput="recordActions();" rows="4" cols="70">Type actions here.</textarea><br>';
		//innerHTML += '<u>Impacts</u>:<br><textarea id="impacts" onInput="recordImpacts();" rows="4" cols="70">Type impacts here.</textarea><br>';
		innerHTML += '<center><input type="button" value="Issue" onClick="activateThreat();"></input></center>';

		//innerHTML += '<hr color="#000000" />';
		//innerHTML += '<table cellpadding="3" cellspacing="0" border="0" width="100%"><tr><td width="30%"><u>Auxiliary Controls</u>:</td><td width="70%">';
                //innerHTML += '<input type="button" value="Redraw Threat" onClick="startRedefineThreat();" />';
                //innerHTML += '<input type="button" value="Reset History" onClick="decoupleVector();" />';
                //innerHTML += '<span id="previewGrid"></span>';
                //innerHTML += '</td></tr><tr><td width="30%"><u>Recommenders</u>:</td><td width="70%">';
                //innerHTML += '<select id="recommenders" onKeyDown="ignoreKeys();" onChange="setRecommender();"><option value=""><--Choose--></option>';
                //innerHTML += '<option value="75R30">Right-Turning Supercell</option>';
                //innerHTML += '<option value="75L30">Left-Turning Supercell</option>';
                //innerHTML += '<option value="broad">Broad Swath</option>';
                //innerHTML += '<option value="funnel">Light Bulb Swath</option>';
		//innerHTML += '<option value="cspl">Cubic Spline Interpolation</option>';
		//innerHTML += '</select>';
                //innerHTML += '</td></tr></table>';
                //innerHTML += '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td width="30%"><u>Preview Time</u>:</td><td width="50%">';
                //innerHTML += '<div class="slider" id="time-slider" tabIndex="1" style="outline:none"><input class="time-input" id="time-slider-input" ></div>';
                //innerHTML += '</td><td width="20%"><input type="text" id="time-input" maxlength="3" size="3" onChange="previewTime();"> min.</td></tr>';
                //innerHTML += '</table>';
                innerHTML += '<hr color="#000000" />';

		document.getElementById("activateThreat").innerHTML = innerHTML;

		if(modifyFeature.feature.attributes.data['discussion']){
			document.getElementById('discussion').value = modifyFeature.feature.attributes.data['discussion'];
		}

		//if(gridPreview){
                //        document.getElementById("previewGrid").innerHTML = '<input type="button" id="previewGridButton" value="Clear" onClick="clearGridPreview();" />';
                //}
                //else{
                //        document.getElementById("previewGrid").innerHTML = '<input type="button" id="previewGridButton" value="Preview Grid" onClick="lightUpGridAccum2(true);" />';
                //}

		/*
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
		*/

		vdate = new Date(modifyFeature.feature.attributes.data['valid_start'] * 1000);
		vtime = pad(vdate.getUTCHours()) + ':' + pad(vdate.getUTCMinutes()) + ':' + pad(vdate.getUTCSeconds()) + ' UTC';
		document.getElementById("threatTime").innerHTML = vtime;

		genSeverityHTML();

		if(modifyFeature.feature.attributes.data['types'][0] != 'lightning1'){
			var html = '<select id="alert" onChange="setAlertLevel();">';
			html += '<option value="takeAction">Warning</option>';
			html += '<option value="beAware">Advisory</option>';
	               	html += '</select>';
			document.getElementById('alertLevel').innerHTML = html;
			if(modifyFeature.feature.attributes.data.hasOwnProperty('elements')){
		               	document.getElementById('alert').value = modifyFeature.feature.attributes.data['elements']['alertLevel'];
				setAlertLevel();
			}
		}

		/*
		var html = '<select id="confid" onChange="setConfidenceLevel();">';
		html += '<option value=""><-- Select --></option>';
                html += '<option value="low">Low</option>';
                html += '<option value="lowMedium">Medium-Low</option>';
		html += '<option value="medium">Medium</option>';
		html += '<option value="mediumHigh">Medium-High</option>';
		html += '<option value="high">High</option>';
                html += '</select>';
                document.getElementById('confidence').innerHTML = html;
                document.getElementById('confid').value = modifyFeature.feature.attributes.data['elements']['confidence'];
		*/

		html = '<select id="pred" onChange="setPrediction();">';
		html += '<option value="explicit">Explicit</option>';
		html += '<option value="persistence">Persistence</option>';
		html += '</select>';
		document.getElementById('prediction').innerHTML = html;

		document.getElementById('pred').value = modifyFeature.feature.attributes.data['prediction']

		/*
		time_slider = new Slider(document.getElementById("time-slider"), document.getElementById("time-slider-input"));
                time_slider.setMaximum(45);
                time_slider.setMinimum(0);
                //time_slider_val.onchange = function () {
                //        time_slider.setValue(parseInt(this.value));
                //};
                time_slider.onchange = function(){
			setHistory = false;
        		ftime = time_slider.getValue();
			time_slider_val = document.getElementById("time-input");
        		//time_slider_val.innerHTML = '+' + ftime + ' min.';
        		time_slider_val.value = ftime;
        		tSlide = true;
			if(modifyFeatureDrawn){
	        		modifyThreat(updateThreat);
			}
        		tSlide = false;
        		//master_time_slider.setValue(tempValidStart + (60 * ftime));
        		timeCanvasVal.setAttr('time',tempValidStart + (60 * ftime));
		        moveSliderTime();
		};
		time_slider.setValue(0);
		document.getElementById("time-input").value = 0;

                duration_slider = new Slider(document.getElementById("duration-slider"), document.getElementById("duration-slider-input"));
                duration_slider.setMaximum(24);
                duration_slider.setMinimum(3);
                duration_slider.onchange = function () {
			setHistory = false;
			if(modifyFeature == null || modifyFeature.feature == null){
				//alert('Changes cannot be made while previewing threat evolution');
				time_slider.setValue(0);
				//return;
			}
			if(ftime == 0){
				setHistory = false;
				document.getElementById("duration-input").value = modifyFeature.feature.attributes.data['duration'];
				duration_slider_val = document.getElementById("duration-input");
	                       	//modifyFeature.feature.attributes.data['duration'] = duration_slider.getValue() * 5;
				modifyFeature.feature.attributes.data['duration'] = duration_slider_val * 5;
				modifyFeature.feature.attributes.data['valid_end'] = parseInt(modifyFeature.feature.attributes.data['valid_start']) + (60 * parseInt(modifyFeature.feature.attributes.data['duration']));
	                        //duration_slider_val.value = modifyFeature.feature.attributes.data['duration'];
				//time_slider.setMaximum(modifyFeature.feature.attributes.data['duration']);
				if(modifyFeature.feature.attributes.data['duration'] != durationValLast){
					modifyFeature.feature.attributes.data.modified['duration'] = 1;
				        console.log('duration modified');
					durationValLast = modifyFeature.feature.attributes.data['duration'];
                                        modifyThreat();
					//lightUpGridAccum2();
				}
				deletePendingRecords();
	                       	insertRecord(modifyFeature.feature.clone(),'Pending');
	                        //buildWarning();
			}
			else{
				//alert('Changes cannot be made while previewing threat evolution');
				setHistory = false;
				//duration_slider.setValue(modifyFeature.feature.attributes.data['duration'] / 5);
			}
                };
                if(modifyFeature.feature != null){
			duration_slider.setValue(modifyFeature.feature.attributes.data['duration'] / 5);
		}
		else{
			duration_slider.setValue(9);
		}
		*/
		moveSliderTime();
		deletePendingRecords();
		insertRecord(modifyFeature.feature.clone(),'Pending');
		//ndfd_grid2.removeAllFeatures();
		lightUpGridAccum2(true);
		config = true;
		try{
                        var autoObj = document.getElementById('autoObject').checked;
	                swapAutomation(autoObj);
                }
               	catch(err){
			swapAutomation(false);
		}
		console.log('tab');
        }
	else{

	}
}

// clears the threats probability tab
function unloadConfigPanel(){
	var splt = document.getElementById("redrawHazard").src.split('/');
	if(splt[splt.length - 1] == "drawButtonSelect.png"){
                stopRedraw();
        }
	if(drawTypeOrig == null || polygonControl3.active || ellipseControl3.active){
		//alert(drawType);
		if(drawType == 'tornado'){
			document.getElementById("tornadoButton").onclick = function(){drawThreat('tornado');}
		        document.getElementById("tornadoButton").onmouseout = function(){this.src = "images/tornadoButton.png";}
		        document.getElementById("tornadoButton").onmouseover = function(){this.src = "images/tornadoButtonHighlight.png";}
			document.getElementById("tornadoButton").src = "images/tornadoButton.png";
		}
		else if(drawType == 'severe'){
                        document.getElementById("severeButton").onclick = function(){drawThreat('severe');}
                        document.getElementById("severeButton").onmouseout = function(){this.src = "images/severeButton.png";}
                        document.getElementById("severeButton").onmouseover = function(){this.src = "images/severeButtonHighlight.png";}
                        document.getElementById("severeButton").src = "images/severeButton.png";
                }
		else if(drawType == 'hail'){
	                document.getElementById("hailButton").onclick = function(){drawThreat('hail');}
	                document.getElementById("hailButton").onmouseout = function(){this.src = "images/hailButton.png";}
	                document.getElementById("hailButton").onmouseover = function(){this.src = "images/hailButtonHighlight.png";}
	                document.getElementById("hailButton").src = "images/hailButton.png";
	        }
		else if(drawType == 'wind'){
	                document.getElementById("windButton").onclick = function(){drawThreat('wind');}
	                document.getElementById("windButton").onmouseout = function(){this.src = "images/windButton.png";}
	                document.getElementById("windButton").onmouseover = function(){this.src = "images/windButtonHighlight.png";}
	                document.getElementById("windButton").src = "images/windButton.png";
	        }
		else if(drawType == 'lightning'){
	                document.getElementById("lightningButton").onclick = function(){drawThreat('lightning');}
	                document.getElementById("lightningButton").onmouseout = function(){this.src = "images/lightningButton.png";}
	                document.getElementById("lightningButton").onmouseover = function(){this.src = "images/lightningButtonHighlight.png";}
	                document.getElementById("lightningButton").src = "images/lightningButton.png";
	        }
		drawType = null;
		//ndfd_grid2.removeAllFeatures();
	}
	newFeature = false;
       	newFeature2 = false;
	bufClone = null;
	bufClone2 = null;
	bufCloneTime = null;
	bufMove = false;
	objOffsetX = 0;
	objOffsetY = 0;
	p1 = null;
	p2 = null;
       	config = false;
	configPanelLoaded = false;
	newScanHere = false;
	direction_slider = null;
	azShearTimeLast = 0;
        azShearDateLast = 0;
        probSevereTimeLast = 0;
        probSevereDateLast = 0;
        lightningTimeLast = 0;
        lightningDateLast = 0;
        unBuildWarning();
	//document.getElementById("createBackground").disabled = false;
	types = [];
	objHistory = [];
	redoHistory = [];
	featureTypes = [];
	moveThreatTime = null;
	drawProbs = null;
	startPoint = null;
	cloneTime = 0;
	centroidTime = 0;
	centers = {};
	setHistory = false;
	modifiedObject = false;
	objTypeMove = null;
	shearVal = null;
	predFound = false;
	resetting = false;
	resetClone = null;
	wofRecommender = false;
        //document.getElementById("createWarning").value = "Create Threat Probabilities";
	//document.getElementById("createWarning").onclick = drawThreat;
        document.getElementById("warningConfig").innerHTML = "";
	document.getElementById("attrButtons").innerHTML = "";
	try{
		if(drawTypeOrig == null){
			document.getElementById("historyConfig").innerHTML = '';
		}
	}
	catch(err){}
	time_slider = null;
	assigningStart = false;
	clearGridPreview();
	if(drawTypeOrig == null || polygonControl3.active || ellipseControl3.active){
		modifyFeature.feature = null;
		//loadNewProduct();
		ellipseControl3.deactivate();
               	polygonControl3.deactivate();
	}
}

function doubleUnload(){
	unloadConfigPanel();
	unloadConfigPanel();
}

function changeDuration(){
	setHistory = false;
        duration_slider_val = parseInt(document.getElementById("duration-input").value);
        modifyFeature.feature.attributes.data['duration'] = duration_slider_val;
        modifyFeature.feature.attributes.data['valid_end'] = parseInt(modifyFeature.feature.attributes.data['valid_start']) + (60 * parseInt(modifyFeature.feature.attributes.data['duration']));
        modifyFeature.feature.attributes.data.modified['duration'] = 1;
        durationValLast = parseInt(modifyFeature.feature.attributes.data['duration']);
	document.getElementById("duration-input").style.fontWeight = 'bold';
        deletePendingRecords();
	insertRecord(modifyFeature.feature.clone(),'Pending');
	modifyThreat();
	ndfd_grid2.removeAllFeatures();
	lightUpGridAccum2(true);
	console.log('duration modified');
}

function previewTime(){
	return;
	time_slider_val = document.getElementById("time-input");
	time_slider.setValue(time_slider_val.value);	
        tSlide = true;
	setHistory = false;
        modifyThreat(updateThreat);
        tSlide = false;
        timeCanvasVal.setAttr('time',tempValidStart + (60 * ftime));
        moveSliderTime();
}

function setLeadTime(){
	setHistory = false;
	//duration_slider_val = document.getElementById("duration-input");
	//duration_slider.setValue(parseInt(duration_slider_val.value / 5));
}

// assigns or reassigns the valid start time to the threat object
function assignValidStartOld(){
	if(modifyFeature == null || modifyFeature.feature == null){
		//alert('Changes cannot be made while previewing threat evolution');
		//time_slider.setValue(0);
                //return;
        }
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

// loads list of threat type(s) assigned to threat object
var opts = ['tornado1','severe1','lightning1'];
var newOpts = ['tornado1','severe1','lightning1'];
var types = [];
var optsAvail = ['none','tornado1','tornado2','severe1','severe2','lightning1','lightning2'];
var optsName = ['Add Threat','Tornado','Sig. Tornado (EF2+)','Total Severe','Sig. Total Severe','Lightning','Sig. Lightning'];

/*
var opts = ['tornado1','severe1','hail1','wind1','lightning1'];
var newOpts = ['tornado1','severe1','hail1','wind1','lightning1'];
var types = [];
var optsAvail = ['none','tornado1','tornado2','severe1','severe2','hail1','hail2','wind1','wind2','lightning1','lightning2'];
var optsName = ['Add Threat','Tornado (EF0+)','Sig. Tornado (EF2+)','Total Severe','Sig. Total Severe','Hail (1 in.+)','Sig. Hail (2 in.+)','Wind (50 kts+)','Sig. Wind (65 kts+)','Lightning','Sig. Lightning'];
*/

function loadThreats(val){
	if(val > 1){
		return;
	}
	prev = 'threat' + (val - 1);
	if(val != 1 && document.getElementById(prev).value == 'none'){
		return;
	}
	val2 = val + 1;
	innerHTML = '<select id="threat' + val + '" onKeyDown="ignoreKeys();" onChange="addOpts(' + val + '); changeThreatColor(modifyFeature.feature); loadThreats(' + val2 + '); loadChartButtons(); oldButton = \'prob1\'; document.getElementById(oldButton).click();">';
	for(var i=0;i<newOpts.length;i++){
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

// generates select menu of threat type(s) for user to assign to threat object
function addOpts(val){
	//newOpts = ['none','tornado1','severe1','hail1','wind1','lightning1'];
	var newOpts = ['none','tornado1','severe1','lightning1'];
	types = [];
	for(i=1;i<=val;i++){
		option = 'threat' + i;
		if(document.getElementById(option) == null){
			return;
		}
		selectedOption = document.getElementById(option).value;
		if(selectedOption != 'none'){
			types.push(selectedOption);
		}
		if(selectedOption == 'tornado1'){
			newOpts.splice(newOpts.indexOf('tornado1'),1);
			//newOpts.push('tornado2');
		}
		else if(selectedOption == 'tornado2'){
                        newOpts.splice(newOpts.indexOf('tornado2'),1);
                }
		else if(selectedOption == 'severe1'){
                        newOpts.splice(newOpts.indexOf('severe1'),1);
                        //newOpts.push('severe2');
                }
                else if(selectedOption == 'severe2'){
                        newOpts.splice(newOpts.indexOf('severe2'),1);
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
	return; // added for just one hazard
	for(i=(val+1);i<=8;i++){
		option = 'opt' + i;
		document.getElementById(option).innerHTML = '';
	}
}

// modifies threat object attributes based on recommender selection
function setRecommender(){
	if(modifyFeature == null || modifyFeature.feature == null){
                //alert('Changes cannot be made while previewing threat evolution');
		//time_slider.setValue(0);
        	//return;
        }
	selectedOption = document.getElementById('recommenders').value;
	if(selectedOption != ""){
		for(var i=0;i<threat_area.features.length;i++){
			if(threat_area.features[i].attributes.data['valid_start'] == modifyFeature.feature.attributes.data['valid_start'] && threat_area.features[i].attributes.data['id'] == modifyFeature.feature.attributes.data['id']){
				var index = i;
				break;
			}
		}
		modifyFeature.unsetFeature();
		
		if(selectedOption == "75R30"){
			new_speeds = [];
			new_dirs = [];
			for(var i=0;i<threat_area.features[index].attributes.data['speeds'].length;i++){
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
			threat_area.features[index].attributes.data['centers'] = {};
			track_points.removeAllFeatures();
			modifyFeature.setFeature(threat_area.features[index]);
		}
		if(selectedOption == "75L30"){
                        new_speeds = [];
                        new_dirs = [];
                        for(i=0;i<threat_area.features[index].attributes.data['speeds'].length;i++){
                                if(i == 0){
                                        new_speeds.push(threat_area.features[index].attributes.data['speeds'][i]);
                                       	new_dirs.push(threat_area.features[index].attributes.data['dirs'][i]);
                               	}
                                else if(i <= (threat_area.features[index].attributes.data['duration'] / 5)){
                                        offset_angle = threat_area.features[index].attributes.data['dirs'][0] - (30 * (i / (threat_area.features[index].attributes.data['duration'] / 5)));
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
                        threat_area.features[index].attributes.data['centers'] = {};
                       	track_points.removeAllFeatures();
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
		else if(selectedOption == "broad"){
                       	new_speeds = [];
                       	new_dirs = [];
                       	for(i=0;i<threat_area.features[index].attributes.data['spd'].length;i++){
				if((i*5) <= threat_area.features[index].attributes.data['duration']){
					dirOffset = (((threat_area.features[index].attributes.data['duration'] - (i*5)) / threat_area.features[index].attributes.data['duration']) * 40) + 5;
					spdOffset = (((threat_area.features[index].attributes.data['duration'] - (i*5)) / threat_area.features[index].attributes.data['duration']) * 15) + 5;
					new_speeds.push(Math.round(spdOffset));
					new_dirs.push(Math.round(dirOffset));
				}
				else{
					new_speeds.push(5);
                                       	new_dirs.push(5);
				}
                       	}
                       	threat_area.features[index].attributes.data['spd'] = new_speeds;
                       	threat_area.features[index].attributes.data['dir'] = new_dirs;
			threat_area.features[index].attributes.data['centers'] = {};
			track_points.removeAllFeatures();
                       	modifyFeature.setFeature(threat_area.features[index]);
               	}
		else if(selectedOption == "funnel"){
                       	new_speeds = [];
                        new_dirs = [];
                        for(i=0;i<threat_area.features[index].attributes.data['spd'].length;i++){
                                if((i*5) <= threat_area.features[index].attributes.data['duration']){
                                        dirOffset = ((((i*5)) / threat_area.features[index].attributes.data['duration']) * 20) + 5;
                                        spdOffset = ((((i*5)) / threat_area.features[index].attributes.data['duration']) * 7) + 5;
                                        new_speeds.push(Math.round(spdOffset));
                                        new_dirs.push(Math.round(dirOffset));
                                }
                                else{
                                        new_speeds.push(5);
                                        new_dirs.push(5);
                                }
                        }
                        threat_area.features[index].attributes.data['spd'] = new_speeds;
                        threat_area.features[index].attributes.data['dir'] = new_dirs;
                        threat_area.features[index].attributes.data['centers'] = {};
                        track_points.removeAllFeatures();
                       	modifyFeature.setFeature(threat_area.features[index]);
                }
	}
}

// sets speech-to-text to warning decision discussion text box
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

// controls button colors
function swapBColor(newButton){
	document.getElementById(oldButton).style.background = '#DDDDDD';
	document.getElementById(oldButton).style.color = '#000000';
	document.getElementById(newButton).style.background = '#000099';
	document.getElementById(newButton).style.color = '#FFFFFF';
	oldButton = newButton;
}

// reassigns style map to ndfd grid
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

// returns primary threat type
function getButtonVal(){
	if(modifyFeature.feature.attributes.data['types'][0] == 'tornado1'){
                buttonVal = 'P(Tornado)';
        }
	else if(modifyFeature.feature.attributes.data['types'][0] == 'severe1'){
                buttonVal = 'P(Severe)';
        }
        else if(modifyFeature.feature.attributes.data['types'][0] == 'hail1'){
                buttonVal = 'P(Hail)';
        }
        else if(modifyFeature.feature.attributes.data['types'][0] == 'wind1'){
                buttonVal = 'P(Wind)';
        }
	else if(modifyFeature.feature.attributes.data['types'][0] == 'lightning1'){
		// have duplicate colors
		buttonVal = 'P(Lightning)';
	}
	else{
		buttonVal = 'P(RuhRoh)';
	}
	return buttonVal;
}

// loads list of buttons for temporal array charts
function loadChartButtons(){
		var i9 = 0;
                innerHTML = '';
                for(var j9=0;j9<types.length;j9++){
			if(j9 == 0){
				innerHTML += '<br>';
			}
                        if(types[j9] == 'tornado1'){
                                i9++;
                                if(types.indexOf('tornado2') == -1){
                                        innerHTML += '<input type="button" id="prob' + i9 + '" style="width:90px; background:#DDDDDD" value="P(Tornado)" onClick="probChart(\'tornado1\',\'\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                                else{
                                        innerHTML += '<input type="button" id="prob' + i9 + '" style="width:90px; background:#DDDDDD" value="P(Tornado)" onClick="probChart(\'tornado1\',\'tornado2\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                        }
			else if(types[j9] == 'severe1'){
                                i9++;
                                if(types.indexOf('severe2') == -1){
                                        innerHTML += '<input type="button" id="prob' + i9 + '" style="width:90px; background:#DDDDDD" value="P(Severe)" onClick="probChart(\'severe1\',\'\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                                else{
                                        innerHTML += '<input type="button" id="prob' + i9 + '" style="width:90px; background:#DDDDDD" value="P(Severe)" onClick="probChart(\'severe1\',\'severe2\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                        }
                        else if(types[j9] == 'hail1'){
                                i9++;
                                if(types.indexOf('hail2') == -1){
                                        innerHTML += '<input type="button" id="prob' + i9 + '" style="width:90px; background:#DDDDDD" value="P(Hail)" onClick="probChart(\'hail1\',\'\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                                else{
                                        innerHTML += '<input type="button" id="prob' + i9 + '" style="width:90px; background:#DDDDDD" value="P(Hail)" onClick="probChart(\'hail1\',\'hail2\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                        }
                        else if(types[j9] == 'wind1'){
                                i9++;
                                if(types.indexOf('wind2') == -1){
                                        innerHTML += '<input type="button" id="prob' + i9 + '" style="width:90px; background:#DDDDDD" value="P(Wind)" onClick="probChart(\'wind1\',\'\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                                else{
                                        innerHTML += '<input type="button" id="prob' + i9 + '" style="width:90px; background:#DDDDDD" value="P(Wind)" onClick="probChart(\'wind1\',\'wind2\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                        }
			else if(types[j9] == 'lightning1'){
                                i9++;
                                if(types.indexOf('lightning2') == -1){
                                        innerHTML += '<input type="button" id="prob' + i9 + '" style="width:90px; background:#DDDDDD" value="P(Lightning)" onClick="probChart(\'lightning1\',\'\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                                else{
                                        innerHTML += '<input type="button" id="prob' + i9 + '" style="width:90px; background:#DDDDDD" value="P(Lightning)" onClick="probChart(\'lightning1\',\'lightning2\'); swapBColor(this.id); setProbIdx();" /><br>';
                                }
                        }
                }
                //innerHTML += '<input type="button" id="speed" style="width:90px; background:#DDDDDD" value="Speed" onClick="speedChart(); swapBColor(this.id);" /><br>';
                //innerHTML += '<input type="button" id="spd" style="width:90px; background:#DDDDDD;" value="Speed (?)" onClick="speedDeltaChart(); swapBColor(this.id);" /><br>';
                //innerHTML += '<input type="button" id="direction" style="width:90px; background:#DDDDDD" value="Direction" onClick="dirChart(); swapBColor(this.id);" /><br>';
                //innerHTML += '<input type="button" id="dir" style="width:90px; background:#DDDDDD;" value="Direction (?)" onClick="dirDeltaChart(); swapBColor(this.id);" /><br><br>';
		//innerHTML += '<input type="button" style="width:45px; background:#DDDDDD; font-size:11px;" value="UNDO" onClick="undo();" />';
		//innerHTML += '<input type="button" style="width:45px; background:#DDDDDD; font-size:11px;" value="REDO" onClick="redo();" />';
		//innerHTML += '<br><input type="checkbox" id="gridPreviewBox" onChange="changeGridState(); ndfd_grid2.removeAllFeatures(); lightUpGridAccum2(true);">Grid Preview';
                document.getElementById("attrButtons").innerHTML = innerHTML;
		if(gridState){
			document.getElementById('gridPreviewBox').checked = true;
		}
		else{
			document.getElementById('gridPreviewBox').checked = false;
		}
}

// undo button
function undo(){
	if(modifyFeature == null || modifyFeature.feature == null){
                //alert('Changes cannot be made while previewing threat evolution');
                //time_slider.setValue(0);
		//return;
        }
        else if(objHistory.length > 1){
                var geojson_format = new OpenLayers.Format.JSON();
                undoing = true;
                undo_index = objHistory.length - 2;
                modifyFeature.feature.attributes = geojson_format.read(objHistory[undo_index]);
                redoHistory.push(objHistory.slice(-1));
                objHistory = objHistory.slice(0,-1);
		setHistory = false;
                modifyThreat(false);
                undoing = false;
        }
}

// redo button
function redo(){
	if(modifyFeature == null || modifyFeature.feature == null){
                //alert('Changes cannot be made while previewing threat evolution');
                //time_slider.setValue(0);
		//return;
        }
        else if(redoHistory.length > 0){
                var geojson_format = new OpenLayers.Format.JSON();
                undoing = true;
                modifyFeature.feature.attributes = geojson_format.read(redoHistory[redoHistory.length - 1]);
                setHistory = false;
		modifyThreat(false);
                objHistory.push(redoHistory.slice(-1));
                redoHistory = redoHistory.slice(0,-1);
                undoing = false;
        }
}

// resets threat type(s)
function changeThreatColor(threatObject,num){
	if(modifyFeature == null || modifyFeature.feature == null){
                //alert('Changes cannot be made while previewing threat evolution');
		setHistory = false;
                //time_slider.setValue(0);
		//return;
        }

	if(drawType == 'tornado'){
                document.getElementById("tornadoButton").onclick = function(){drawThreat('tornado');}
                document.getElementById("tornadoButton").onmouseout = function(){this.src = "images/tornadoButton.png";}
                document.getElementById("tornadoButton").onmouseover = function(){this.src = "images/tornadoButtonHighlight.png";}
                document.getElementById("tornadoButton").src = "images/tornadoButton.png";
        }
	else if(drawType == 'severe'){
                document.getElementById("severeButton").onclick = function(){drawThreat('severe');}
                document.getElementById("severeButton").onmouseout = function(){this.src = "images/severeButton.png";}
                document.getElementById("severeButton").onmouseover = function(){this.src = "images/severeButtonHighlight.png";}
                document.getElementById("severeButton").src = "images/severeButton.png";
        }
        else if(drawType == 'hail'){
                document.getElementById("hailButton").onclick = function(){drawThreat('hail');}
                document.getElementById("hailButton").onmouseout = function(){this.src = "images/hailButton.png";}
                document.getElementById("hailButton").onmouseover = function(){this.src = "images/hailButtonHighlight.png";}
                document.getElementById("hailButton").src = "images/hailButton.png";
        }
        else if(drawType == 'wind'){
                document.getElementById("windButton").onclick = function(){drawThreat('wind');}
                document.getElementById("windButton").onmouseout = function(){this.src = "images/windButton.png";}
                document.getElementById("windButton").onmouseover = function(){this.src = "images/windButtonHighlight.png";}
                document.getElementById("windButton").src = "images/windButton.png";
        }
        else if(drawType == 'lightning'){
                document.getElementById("lightningButton").onclick = function(){drawThreat('lightning');}
                document.getElementById("lightningButton").onmouseout = function(){this.src = "images/lightningButton.png";}
                document.getElementById("lightningButton").onmouseover = function(){this.src = "images/lightningButtonHighlight.png";}
                document.getElementById("lightningButton").src = "images/lightningButton.png";
        }

        threat = document.getElementById("threat1").value;
        if(threat == "tornado1"){
                threatColor = "rgb(255,0,0)";
		drawType = 'tornado';		
        }
	else if(threat == "severe1"){
                threatColor = "rgb(255,255,0)";
                drawType = 'severe';
        }
        else if(threat == "hail1"){
                threatColor = "rgb(0,204,0)";
		drawType = 'hail';
        }
        else if(threat == "wind1"){
                threatColor = "rgb(0,0,255)";
		drawType = 'wind';
        }
        else if(threat == "lightning1"){
                threatColor = "rgb(255,128,0)";
		drawType = 'lightning';
        }

	button = drawType + "Button";
	document.getElementById(button).src = "images/" + drawType + "ButtonSelect.png";
        document.getElementById(button).onclick = unloadConfigPanel;
        document.getElementById(button).onmouseout = function(){this.src = "images/" + drawType + "ButtonSelect.png";}
        document.getElementById(button).onmouseover = function(){this.src = "images/" + drawType + "ButtonSelect.png";}

        threatObject.attributes.data['threatColor'] = threatColor;
        threatObject.attributes.threatColor = threatObject.attributes.data['threatColor'];
        threatObject.attributes.data['types'] = [];
        for(var i=0;i<types.length;i++){
                threatObject.attributes.data['types'].push(types[i]);
                if(i > (threatObject.attributes.data['probs'].length - 1)){
                        if(types[i].slice(-1) == '1'){
                                threatObject.attributes.data['probs'].push(default_probs);
                        }
                        else{
                                threatObject.attributes.data['probs'].push(default_sig_probs);
                        }
                }
        }
        if(threatObject.attributes.data['probs'].length > threatObject.attributes.data['types'].length){
		threatObject.attributes.data['probs'].splice(threatObject.attributes.data['types'].length,(threatObject.attributes.data['probs'].length - threatObject.attributes.data['types'].length));
        }
        threat_area.redraw();
	setHistory = false;

	//if(modifyFeatureDrawn){
	        modifyThreat(updateThreat);
	//}
        //deletePendingRecords();
        //insertRecord(threatObject.clone(),'Pending');
}

function recordDisc(){
	var disc = document.getElementById('discussion').value;
	modifyFeature.feature.attributes.data['discussion'] = disc;
	modifyFeature.feature.attributes.data.modified['discussion'] = 1;
	console.log('discussion modified');
}

function recordActions(){
        var disc = document.getElementById('actions').value;
        modifyFeature.feature.attributes.data['elements']['actions'] = disc;
        modifyFeature.feature.attributes.data.modified['actions'] = 1;
        console.log('actions modified');
}

function recordImpacts(){
        var disc = document.getElementById('impacts').value;
        modifyFeature.feature.attributes.data['elements']['impacts'] = disc;
        modifyFeature.feature.attributes.data.modified['impacts'] = 1;
        console.log('impacts modified');
}

function adjustVector(changeType){
	var geojson_format = new OpenLayers.Format.JSON();
	var newSpeed = parseInt(document.getElementById('motionVectorSpeed').value);
	var newDir = parseInt(document.getElementById('motionVectorDir').value);
	updateThreat = false;
       	modifyFeature.feature.attributes.data['centers'] = {};
       	centers = {};
	if(newSpeed > 100){
		newSpeed = 100;
	}
	newSpeeds = [];
	newDirs = [];
	for(var i=0;i<modifyFeature.feature.attributes.data['dirs'].length;i++){
		newSpeeds.push(newSpeed);
		newDirs.push(newDir);
	}
	var tempAttrs = geojson_format.read(JSON.stringify(modifyFeature.feature.attributes));
	var objClone = modifyFeature.feature.geometry.clone();
        modifyFeature.unsetFeature();
       	modifyFeature.feature = null;
       	var newObj = new OpenLayers.Feature.Vector(objClone,tempAttrs);
       	threat_area.removeAllFeatures();
       	threat_area.addFeatures([newObj]);
       	threat_area.features[threat_area.features.length-1].attributes.data['speeds'] = newSpeeds;
	threat_area.features[threat_area.features.length-1].attributes.data['dirs'] = newDirs;
	threat_area.features[threat_area.features.length-1].attributes.data['dirs_orig'] = newDirs;
	if(changeType == 'direction'){
		threat_area.features[threat_area.features.length-1].attributes.data.modified['direction'] = 1;
		document.getElementById("motionVectorDir").style.fontWeight = 'bold';
		console.log('direction modified');
	}
	else if(changeType == 'speed'){
		threat_area.features[threat_area.features.length-1].attributes.data.modified['speed'] = 1;
		document.getElementById("motionVectorSpeed").style.fontWeight = 'bold';
		console.log('speed modified');
	}
	threat_area.redraw();
       	modifyFeature.setFeature(threat_area.features[threat_area.features.length-1]);
	ndfd_grid2.removeAllFeatures();
	lightUpGridAccum2(true);
}

function changeGridState(){
	gridState = document.getElementById('gridPreviewBox').checked;
	if(!gridState){
		clearGridPreview();
	}
}

function setSeverity(){
	try{
		var sev = document.getElementById('sev').value;
	}
	catch(err){
		var sev = document.getElementById('sev1').value + '|' + document.getElementById('sev2').value;
		if(parseFloat(document.getElementById('sev1').value) >= 1 || parseFloat(document.getElementById('sev2').value) >= 60){
			document.getElementById('alert').value = 'takeAction';
			setAlertLevel();
		}
		else if(parseFloat(document.getElementById('sev1').value) < 1 && document.getElementById('sev2').value == '' || document.getElementById('sev1').value == '' && parseFloat(document.getElementById('sev2').value) < 60 || parseFloat(document.getElementById('sev1').value) < 1 &&  parseFloat(document.getElementById('sev2').value) < 60){
			document.getElementById('alert').value = 'beAware';
                       	setAlertLevel();
		}
	}
	modifyFeature.feature.attributes.data['elements']['severity'] = sev;
	modifyFeature.feature.attributes.data.modified['severity'] = 1;
}

function setPrediction(){
       	var pred = document.getElementById('pred').value;
       	modifyFeature.feature.attributes.data['prediction'] = pred;
	modifyFeature.feature.attributes.data.modified['prediction'] = 1;
	checkPrediction();
}

function setAlertLevel(){
        var alert = document.getElementById('alert').value;
        modifyFeature.feature.attributes.data['elements']['alertLevel'] = alert;
	modifyFeature.feature.attributes.data.modified['alertLevel'] = 1;
	if(alert == 'takeAction'){
		/*
		var html = '<select id="warningType" onChange="setWarningType();">';
                //html += '<option value=""><-- Select --></option>';
                html += '<option value="probability">Probability</option>';
                //html += '<option value="time">Time</option>';
                html += '</select>&nbsp;&nbsp;=&nbsp;&nbsp;';
                html += '<input id="warningThresh" type="text" maxlength="3" size="3" onChange="setWarningThresh();" />%';
                document.getElementById('legWarning').innerHTML = html;
                document.getElementById('warningType').value = modifyFeature.feature.attributes.data['elements']['warningType'];
                document.getElementById('warningThresh').value = modifyFeature.feature.attributes.data['elements']['warningThresh'];
		*/
		/*
		var html = '&nbsp;&nbsp;>=&nbsp;&nbsp;<select id="warningThresh" onChange="setWarningThresh();">';
		html += '<option value="0">0%</option>';
                html += '<option value="10">10%</option>';
                html += '<option value="20">20%</option>';
                html += '<option value="30">30%</option>';
                html += '<option value="40">40%</option>';
                html += '<option value="50">50%</option>';
                html += '<option value="60">60%</option>';
                html += '<option value="70">70%</option>';
                html += '<option value="80">80%</option>';
                html += '<option value="90">90%</option>';
                html += '<option value="100">100%</option>';
		html += '</html>';
		document.getElementById('legWarning').innerHTML = html;
		document.getElementById('warningThresh').value = modifyFeature.feature.attributes.data['elements']['warningThresh'];
		*/
		document.getElementById('legWarning').innerHTML = ''; // added 8/23/16 to get rid of warning threshold
	}
	else{
		document.getElementById('legWarning').innerHTML = '';
	}
}

function setConfidenceLevel(){
        var confid = document.getElementById('confid').value;
        modifyFeature.feature.attributes.data['elements']['confidence'] = confid;
	modifyFeature.feature.attributes.data.modified['confidence'] = 1;
}

function setWarningType(){
        var wType = document.getElementById('warningType').value;
        modifyFeature.feature.attributes.data['elements']['warningType'] = wType;
	modifyFeature.feature.attributes.data.modified['warningType'] = 1;
}

function setWarningThresh(){
        var wThresh = parseInt(document.getElementById('warningThresh').value);
        modifyFeature.feature.attributes.data['elements']['warningThresh'] = wThresh;
	modifyFeature.feature.attributes.data.modified['warningThresh'] = 1;
}

function setSource(){
        var src = document.getElementById('src').value;
        modifyFeature.feature.attributes.data['elements']['source'] = src;
	modifyFeature.feature.attributes.data.modified['source'] = 1;
}

function genSeverityHTML(){
		var html = '<select id="sev" onChange="setSeverity();">';
                if(modifyFeature.feature.attributes.data['types'][0] == 'tornado1'){
                        document.getElementById('threat1').value = 'tornado1';
                        changeThreatColor(modifyFeature.feature);
                        var html = '<select id="sev" onChange="setSeverity();">';
                        html += '<option value=""><-- Tornado Severity --></option>';
                        html += '<option value="weakTornado">Weak/Short-Lived</option>';
                        html += '<option value="strongTornado">Considerable</option>';
			html += '<option value="violentTornado">Catastrophic</option>';
                        html += '</select>';
                }
                else if(modifyFeature.feature.attributes.data['types'][0] == 'severe1'){
			document.getElementById('threat1').value = 'severe1';
			//if(drawType != 'severe'){
				changeThreatColor(modifyFeature.feature);
			//}
                        var html = '<select id="sev1" onChange="setSeverity();">';
                        html += '<option value=""><-- Hail Severity --></option>';
			html += '<option value="0.25">0.25 in.</option>';
                        html += '<option value="0.5">0.5 in.</option>';
                        html += '<option value="0.75">0.75 in.</option>';
                        html += '<option value="0.88">0.88 in.</option>';
			html += '<option value="1">1 in.</option>';
                        html += '<option value="1.25">1.25 in.</option>';
                        html += '<option value="1.5">1.5 in.</option>';
                        html += '<option value="1.75">1.75 in.</option>';
                        html += '<option value="2">2 in.</option>';
                        html += '<option value="2.5">2.5 in.</option>';
                        html += '<option value="2.75">2.75 in.</option>';
			html += '<option value="3">3 in.</option>';
			html += '<option value="4">4 in.</option>';
			html += '<option value="5">5+ in.</option>';
                        html += '</select>';
                        html += '<select id="sev2" onChange="setSeverity();">';
                        html += '<option value=""><-- Wind Severity --></option>';
			html += '<option value="40">40 mph</option>';
			html += '<option value="50">50 mph</option>';
                        html += '<option value="60">60 mph</option>';
                        html += '<option value="70">70 mph</option>';
                        html += '<option value="80">80 mph</option>';
                        html += '<option value="90">90 mph</option>';
                        html += '<option value="100">100+ mph</option>';
                        html += '</select>';
                }
                else if(modifyFeature.feature.attributes.data['types'][0] == 'hail1'){
                        document.getElementById('threat1').value = 'hail1';
                        changeThreatColor(modifyFeature.feature);
                }
                else if(modifyFeature.feature.attributes.data['types'][0] == 'wind1'){
                        document.getElementById('threat1').value = 'wind1';
                        changeThreatColor(modifyFeature.feature);
                }
                else if(modifyFeature.feature.attributes.data['types'][0] == 'lightning1'){
                        document.getElementById('threat1').value = 'lightning1';
                        changeThreatColor(modifyFeature.feature);
                        var html = '<select id="sev" onChange="setSeverity();">';
                        html += '<option value=""><-- Lightning Severity --></option>';
                        html += '<option value="sparseLightning">Occasional Lightning (>=1)</option>';
                        html += '<option value="frequentLightning">Frequent Lightning (>=5)</option>';
			html += '<option value="extremeLightning">Extreme Lightning (>=20)</option>';
                        html += '</select>';
                }
                //html += '<option value="none">¯\\_(ツ)_/¯</option>';
                html += '<select id="src" onChange="setSource();">';
                html += '<option value=""><-- Source --></option>';
                html += '<option value="radarIndicated">Radar Indicated</option>';
                html += '<option value="observed">Observed</option>';
                html += '<option value="predicted">Predicted</option>';
                html += '</select>';
                document.getElementById('severity').innerHTML = html;
                try{
                        document.getElementById('sev').value = modifyFeature.feature.attributes.data['elements']['severity'];
                }
                catch(err){
			if(modifyFeature.feature.attributes.data.hasOwnProperty('elements')){
	                        var sevs = modifyFeature.feature.attributes.data['elements']['severity'].split('|');
	                        document.getElementById('sev1').value = sevs[0];
	                        if(sevs.length > 1){
	                                document.getElementById('sev2').value = sevs[1];
	                        }
			}
                }
		if(modifyFeature.feature.attributes.data.hasOwnProperty('elements')){
			document.getElementById('src').value = modifyFeature.feature.attributes.data['elements']['source'];
		}
}

function modifyAutoObject(){
	var autoObj = document.getElementById('autoObject').checked;
	if(modifyFeature.feature.attributes.data['init'] == -999){
		alert('Could not find automated object, it is likely that automation has lost tracking it');
		autoObj = false;
		document.getElementById('autoObject').checked = false;
	}
	if(autoObj){
		modifyFeature.feature.attributes.data.modified['object'] = 0;
                //modifyFeature.feature.attributes.data['automated'] = 2;
		modifyFeature.feature.attributes.data['buffer'] = 0;
		modifyFeature.feature.attributes.data['bufDir'] = -1;
		modifyFeature.feature.attributes.data['objOffsetX'] = 0;
		modifyFeature.feature.attributes.data['objOffsetY'] = 0;
		modifyFeature.feature.attributes.data.modified['objShape'] = 0;
		modifyFeature.feature.attributes.data.modified['objPosition'] = 0;
                document.getElementById('objBuffer').disabled = false;
                document.getElementById('objBufDir').disabled = false;
                document.getElementById('objOffsetX').disabled = false;
                document.getElementById('objOffsetY').disabled = false;
		var geojson_format = new OpenLayers.Format.JSON();
		var tempAttrs = geojson_format.read(JSON.stringify(modifyFeature.feature.attributes));
		var obj = getAutoGeometry();
	        if(obj == null){
			swapAutomation(autoObj);
	                return;
	        }
	        var obj2 = obj.geometry.clone();
	        obj2 = obj2.transform(proj,proj2);
		bufClone = obj2.clone();
		bufCloneTime = obj.attributes.data['valid_start'];
	        modifyFeature.unsetFeature();
	        modifyFeature.feature = null;
	        obj.attributes.data['centers'] = {};
	        centers = {};
		tempAttrs.data['centers'] = {};
	        var bufObj = new OpenLayers.Feature.Vector(obj2,obj.attributes);
	        var arr1 = [];
	        var arr2 = [];
	        renderObjects(bufObj, now, arr1, arr2);
	        bufObj = arr1[0];
		var bufObj2 = new OpenLayers.Feature.Vector(bufObj.geometry,tempAttrs);
	        track_points.removeAllFeatures();
	        track_points.redraw();
	        threat_area.removeAllFeatures();
	        threat_area.addFeatures([bufObj2]);
	        threat_area.redraw();
	        modifyFeature.setFeature(threat_area.features[threat_area.features.length-1]);
		bufClone2 = modifyFeature.feature.geometry.clone();
	        ndfd_grid2.removeAllFeatures();
	        lightUpGridAccum2(true);
		console.log('object modified');
	}
	else{
		modifyFeature.feature.attributes.data.modified['object'] = 1;
		//modifyFeature.feature.attributes.data['automated'] = 0;
		document.getElementById('objBuffer').disabled = true;
               	document.getElementById('objBufDir').disabled = true;
               	document.getElementById('objOffsetX').disabled = true;
               	document.getElementById('objOffsetY').disabled = true;
		console.log('object modified, but not really');
	}
	swapAutomation(autoObj);
}

function loadAnalysisConfig(){
	// set text for analysis tab
	var innerHTML = '<center><input type="button" value="Refresh" onClick="loadAnalysisConfig();" /><br><br>';
	innerHTML += '<div id="analysisChart1" style="width:480px; height:250px;"></div></center>';
	document.getElementById('analysisConfig').innerHTML = innerHTML;

	// generate chart(s)
	var d = new Date();
	var offset = d.getTimezoneOffset() * 60000;
	var jsonFormat = new OpenLayers.Format.JSON();
	var link = 'realtime/ewp/getAnalysisData.php?user=' + user + '&case=' + acase + '&site=' + site;
	var dataRequest = new XMLHttpRequest();
	dataRequest.open('GET', link, false);
	dataRequest.send();
	var objData = jsonFormat.read(dataRequest.responseText);
	var warningsSVR = [];
	var advisoriesSVR = [];
	var warningsLGT = [];
       	var advisoriesLGT = [];
	var warningsTOR = [];
       	var advisoriesTOR = [];
	var accum = {};
	var issuedIDs = [];
	var svrObj = false;
	var lgtObj = false;

	// format issuance times
	for(var i=0;i<objData.features.length;i++){
		var d2 = new Date(objData.features[i].properties.data.issue * 1000);
                var ds = String(d2.getUTCFullYear()) + '-' + String(d2.getUTCMonth() + 1) + '-' + String(d2.getUTCDate() + ' ' + String(d2.getUTCHours()) + ':' + String(d2.getUTCMinutes()));
		if(objData.features[i].properties.data.types[0] == 'severe1'){
			if(!svrObj){
				// get list of auto objects and their time periods
				var link = 'realtime/ewp/getAutoData.php?type=severe&case=' + acase + '&site=' + site;
				var dataRequest = new XMLHttpRequest();
			        dataRequest.open('GET', link, false);
			        dataRequest.send();
				var probSevereData = jsonFormat.read(dataRequest.responseText);
				var svrKeys = Object.keys(probSevereData);
				svrObj = true;
			}
			if(objData.features[i].properties.data.elements.alertLevel == 'takeAction'){
				warningsSVR.push([ds, 1]);
			}
			else{
				advisoriesSVR.push([ds, 1]);
			}
			if(issuedIDs.indexOf(objData.features[i].properties.data.id) == -1){
				accum[objData.features[i].properties.data.id] = {
					'start':objData.features[i].properties.data.issue,
					'end':objData.features[i].properties.data.valid_start + (60 * objData.features[i].properties.data.duration)
				};
			}
			else if(objData.features[i].properties.data.issue < accum[objData.features[i].properties.data.id]['start']){
				accum[objData.features[i].properties.data.id]['start'] = objData.features[i].properties.data.issue;
			}
			else if(objData.features[i].properties.data.valid_start + (60 * objData.features[i].properties.data.duration) > accum[objData.features[i].properties.data.id]['end']){
                               	accum[objData.features[i].properties.data.id]['end'] = objData.features[i].properties.data.valid_start + (60 * objData.features[i].properties.data.duration);
                       	}
			if(svrKeys.indexOf(String(objData.features[i].properties.data.id)) != -1){
				if(probSevereData[String(objData.features[i].properties.data.id)].max() > accum[objData.features[i].properties.data.id]['end']){
					accum[objData.features[i].properties.data.id]['end'] = probSevereData[String(objData.features[i].properties.data.id)].max();
				}
			}
			issuedIDs.push(objData.features[i].properties.data.id);
		}
		else if(objData.features[i].properties.data.types[0] == 'lightning1'){
			if(!lgtObj){
                                // get list of auto objects and their time periods
                               	var link = 'realtime/ewp/getAutoData.php?type=lightning&case=' + acase + '&site=' + site;
                               	var dataRequest = new XMLHttpRequest();
                                dataRequest.open('GET', link, false);
                                dataRequest.send();
                               	var lightningData = jsonFormat.read(dataRequest.responseText);
				var lgtKeys = Object.keys(probSevereData);
                               	lgtObj = true;
                        }
                        if(objData.features[i].properties.data.elements.alertLevel == 'takeAction'){
                                warningsLGT.push([ds, 1]);
                       	}
                       	else{
                                advisoriesLGT.push([ds, 1]);
                       	}
			if(issuedIDs.indexOf(objData.features[i].properties.data.id) == -1){
                               	accum[objData.features[i].properties.data.id] = {
                                       	'start':objData.features[i].properties.data.issue,
                                       	'end':objData.features[i].properties.data.valid_start + (60 * objData.features[i].properties.data.duration)
                               	};
                        }
                       	else if(objData.features[i].properties.data.issue < accum[objData.features[i].properties.data.id]['start']){
                                accum[objData.features[i].properties.data.id]['start'] = objData.features[i].properties.data.issue;
                        }
                        else if(objData.features[i].properties.data.valid_start + (60 * objData.features[i].properties.data.duration) > accum[objData.features[i].properties.data.id]['end']){
                                accum[objData.features[i].properties.data.id]['end'] = objData.features[i].properties.data.valid_start + (60 * objData.features[i].properties.data.duration);
                       	}
                        if(lgtKeys.indexOf(String(objData.features[i].properties.data.id)) != -1){
                               	if(lightningData[String(objData.features[i].properties.data.id)].max() > accum[objData.features[i].properties.data.id]['end']){
                                       	accum[objData.features[i].properties.data.id]['end'] = lightningData[String(objData.features[i].properties.data.id)].max();
                               	}
                       	}
                        issuedIDs.push(objData.features[i].properties.data.id);
               	}
		else if(objData.features[i].properties.data.types[0] == 'tornado1'){
                        if(objData.features[i].properties.data.elements.alertLevel == 'takeAction'){
                                warningsTOR.push([ds, 1]);
                       	}
                       	else{
                                advisoriesTOR.push([ds, 1]);
                       	}
			var d = new Date(objData.features[i].properties.data.issue * 1000);
			var secs = objData.features[i].properties.data.issue + (60 - d.getUTCSeconds());
			for(var j=secs;j<(objData.features[i].properties.data.issue + (60 * objData.features[i].properties.data.duration));j+=60){
				if(j in accum){
					accum[j]++;
				}
				else{
					accum[j] = 1;
				}
			}
               	}
	}

	// create active forecasts plots
	var accumAll = {};
	var accumPlot = [];
	var keys = Object.keys(accum);
	keys.sort();
	for(var i=0;i<keys.length;i++){
		var d2 = new Date(accum[keys[i]]['start'] * 1000);
		var secs = accum[keys[i]]['start'] + (60 - d2.getUTCSeconds());
		for(var j=secs;j<accum[keys[i]]['end'];j+=60){
			if(j in accumAll){
				accumAll[j]++;
			}
			else{
				accumAll[j] = 1;
			}
		}
	}
	var keys = Object.keys(accumAll);
        keys.sort();
        for(var i=0;i<keys.length;i++){
		var d2 = new Date(Number(keys[i]) * 1000);
               	var ds = String(d2.getUTCFullYear()) + '-' + String(d2.getUTCMonth() + 1) + '-' + String(d2.getUTCDate() + ' ' + String(d2.getUTCHours()) + ':' + String(d2.getUTCMinutes()));
		accumPlot.push([ds,accumAll[keys[i]]]);
	}

	analysis_chart(accumPlot,warningsSVR,advisoriesSVR,warningsLGT,advisoriesLGT,warningsTOR,advisoriesTOR);
}

function adjustBuffer(){
	var geojson_format = new OpenLayers.Format.JSON();
       	var parser = new jsts.io.OpenLayersParser();
	var bc = bufClone.clone();
	var objBuffer = parseInt(document.getElementById('objBuffer').value);
        var objBufDir = parseInt(document.getElementById('objBufDir').value);
        var xVal = parseFloat(document.getElementById('objOffsetX').value);
        var yVal = parseFloat(document.getElementById('objOffsetY').value);
	if(modifyFeature.feature.attributes.data.hasOwnProperty('objOffsetX')){
		if(objOffsetX.toFixed(1) != xVal.toFixed(1) || objOffsetY.toFixed(1) != yVal.toFixed(1)){
                        //bc.move(xVal*1000,yVal*1000);
			objOffsetX = xVal;
			objOffsetY = yVal;
			modifyFeature.feature.attributes.data['objOffsetX'] = objOffsetX;
		        modifyFeature.feature.attributes.data['objOffsetY'] = objOffsetY;
			modifyFeature.feature.attributes.data.modified['objPosition'] = 1;
		}
		else if(objOffsetX != 0 || objOffsetY != 0){
			//bc.move(objOffsetX*1000,objOffsetY*1000);
		}
	}
	/*
	if(objBufDir >= 0){
		var clones = [];
		var center = bc.getCentroid();
		var verts = bc.getVertices();         
                var coords = new Array();
		var bufDir = (90 - objBufDir);
                for(var i=0;i<verts.length;i++){
                        var dir = Math.atan2(verts[i].y - center.y,verts[i].x - center.x);
			var dir2 = dir * 180 / Math.PI;
			if(dir2 < 0){
                               	dir2 = dir2 + 360;
                       	}
                       	else if(dir2 >= 360){
                               	dir2 = dir2 - 360;
                       	}
			var dirDiff = bufDir - dir2;
			if(dirDiff < 0){
				dirDiff = dirDiff + 360;
			}
			else if(dirDiff >= 360){
				dirDiff = dirDiff - 360;
			}
			if(dirDiff > 180){
				dirDiff = dirDiff - 360;
			}
			if(Math.abs(dirDiff) > 90){
				console.log(dir2 + ',' + dirDiff);
				coords.push(verts[i]);
				continue;
			}
			var normVal = ((90 - Math.abs(dirDiff)) / 90) * (objBuffer * 1000);
			console.log(bufDir + ',' + dir2 + ',' + dirDiff);
                        var x = (Math.cos(dir) * (normVal));
                        var y = (Math.sin(dir) * (normVal));
			var c = bc.clone();
			c.move(x,y);
	                clones.push(c.clone());
                }
		var obj = parser.read(bc);
		for(var i=0;i<clones.length;i++){
			var c = parser.read(clones[i]);
			obj = obj.union(c);
		}
		obj = parser.write(obj);
		var verts = obj.getVertices();
                if(verts.length > 40){
                        var fraction = verts.length / 40;
                        var fraction_orig = verts.length / 40;
                        var newVerts = new Array();
                        for(var i=0;i<verts.length;i++){
                                if(i >= fraction){
                                        newVerts.push(verts[i]);
                                        fraction = fraction + fraction_orig;
                               	}
                       	}
                        newVerts.push(verts[0]);
                        var linearRing = new OpenLayers.Geometry.LinearRing(newVerts);
                        obj = new OpenLayers.Geometry.Polygon([linearRing]);
               	}
	}
	else if(objBuffer != 0){
		var obj = parser.read(bc);
                obj = obj.buffer(objBuffer * 1000); // convert to meters
                obj = parser.write(obj);
		var verts = obj.getVertices();
	       	if(verts.length > 40){
	                var fraction = verts.length / 40;
	                var fraction_orig = verts.length / 40;
	                var newVerts = new Array();
	                for(var i=0;i<verts.length;i++){
	                        if(i >= fraction){
	                                newVerts.push(verts[i]);
	                                fraction = fraction + fraction_orig;
	                        }
	                }
	                newVerts.push(verts[0]);
	                var linearRing = new OpenLayers.Geometry.LinearRing(newVerts);
	                obj = new OpenLayers.Geometry.Polygon([linearRing]);
	        }
	}
	else{
		var obj = bc.clone();
	}
	*/
	var tempAttrs = geojson_format.read(JSON.stringify(modifyFeature.feature.attributes));
	modifyFeature.unsetFeature();
	modifyFeature.feature = null;
	var bufObj = new OpenLayers.Feature.Vector(bufClone,tempAttrs);
	var a1 = [];
       	var a2 = []
       	renderObjects(bufObj,now,a1,a2);
       	bufObj = a1[0];

	threat_area.removeAllFeatures();
       	threat_area.addFeatures([bufObj]);
	threat_area.features[threat_area.features.length-1].attributes.data['buffer'] = objBuffer;
	threat_area.features[threat_area.features.length-1].attributes.data.modified['objShape'] = 1;
	threat_area.features[threat_area.features.length-1].attributes.data['bufDir'] = objBufDir;
	threat_area.redraw();
	modifyFeature.setFeature(threat_area.features[threat_area.features.length-1]);
	console.log('buffer modified');
        ndfd_grid2.removeAllFeatures();
        lightUpGridAccum2(true);
}

function adjustObjOffset(){
	objOffsetX = (modifyFeature.feature.geometry.getCentroid().x - bufClone2.getCentroid().x) / 1000;
       	objOffsetY = (modifyFeature.feature.geometry.getCentroid().y - bufClone2.getCentroid().y) / 1000;
	console.log(objOffsetX + ',' + objOffsetY);
	modifyFeature.feature.attributes.data['objOffsetX'] = objOffsetX;
        modifyFeature.feature.attributes.data['objOffsetY'] = objOffsetY;
	if(objOffsetX == 0 && objOffsetY == 0){
		modifyFeature.feature.attributes.data.modified['objPosition'] = 0;
	}
	else{
		modifyFeature.feature.attributes.data.modified['objPosition'] = 1;
	}
	try{
	        document.getElementById('objOffsetX').value = objOffsetX.toFixed(1);
	        document.getElementById('objOffsetY').value = objOffsetY.toFixed(1);
	}
	catch(err){
		modifyFeature.feature.attributes.data['objOffsetX'] = 0;
	        modifyFeature.feature.attributes.data['objOffsetY'] = 0;
	       	//modifyFeature.feature.attributes.data.modified['objPosition'] = 0;
	}
}

function adjustObjPosition(){
	var geojson_format = new OpenLayers.Format.JSON();
	var xVal = parseFloat(document.getElementById('objOffsetX').value);
        var yVal = parseFloat(document.getElementById('objOffsetY').value);
	var objBuffer = parseInt(document.getElementById('objBuffer').value);
	var objBufDir = parseInt(document.getElementById('objBufDir').value);
       	if(objOffsetX.toFixed(1) != xVal.toFixed(1) || objOffsetY.toFixed(1) != yVal.toFixed(1)){
               	objOffsetX = xVal;
                objOffsetY = yVal;
		modifyFeature.feature.attributes.data['objOffsetX'] = objOffsetX;
	       	modifyFeature.feature.attributes.data['objOffsetY'] = objOffsetY;
		modifyFeature.feature.attributes.data.modified['objPosition'] = 1;
	}
	if(objBuffer != modifyFeature.feature.attributes.data['buffer']){
		modifyFeature.feature.attributes.data['bufDir'] = objBufDir;
	       	modifyFeature.feature.attributes.data['buffer'] = objBuffer;
		modifyFeature.feature.attributes.data.modified['objShape'] = 1;
	}

	var tempAttrs = geojson_format.read(JSON.stringify(modifyFeature.feature.attributes));
       	modifyFeature.unsetFeature();
       	modifyFeature.feature = null;
        var bufObj = new OpenLayers.Feature.Vector(bufClone.clone(),tempAttrs);
	bufObj.attributes.data['valid_start'] = bufCloneTime;
        var a1 = [];
        var a2 = []
        renderObjects(bufObj,now,a1,a2);
        bufObj = a1[0];
	//bufObj.attributes.data['valid_start'] = tempAttrs.data['valid_start'];
	bufObj.attributes.data['valid_start'] = parseInt(geojson_format.read(parseInt(scans[scans.length - 1][0].split('_')[1])));
       	
	threat_area.removeAllFeatures();
       	threat_area.addFeatures([bufObj]);
        threat_area.redraw();
        modifyFeature.setFeature(threat_area.features[threat_area.features.length-1]);
        console.log('position modified');
        ndfd_grid2.removeAllFeatures();
        lightUpGridAccum2(true);
}

function setObjPosition(obj){
	var geojson_format = new OpenLayers.Format.JSON();
        var parser = new jsts.io.OpenLayersParser();
	if(obj.attributes.data.hasOwnProperty('objOffsetX') && obj.attributes.data['objOffsetX'] != 0 || obj.attributes.data.hasOwnProperty('objOffsetY') && obj.attributes.data['objOffsetY'] != 0){
		obj.geometry.move(obj.attributes.data['objOffsetX'] * 1000, obj.attributes.data['objOffsetY'] * 1000);
	}
	if(obj.attributes.data.hasOwnProperty('bufDir') && obj.attributes.data['bufDir'] > 0){
		var clones = [];
               	var center = obj.geometry.getCentroid();
               	var verts = obj.geometry.getVertices();         
               	var coords = new Array();
               	var bufDir = (90 - obj.attributes.data['bufDir']);
               	for(var i=0;i<verts.length;i++){
                       	var dir = Math.atan2(verts[i].y - center.y,verts[i].x - center.x);
                       	var dir2 = dir * 180 / Math.PI;
                       	if(dir2 < 0){
                               	dir2 = dir2 + 360;
                       	}
                       	else if(dir2 >= 360){
                               	dir2 = dir2 - 360;
                       	}
                       	var dirDiff = bufDir - dir2;
                       	if(dirDiff < 0){
                               	dirDiff = dirDiff + 360;
                       	}
                        else if(dirDiff >= 360){
                               	dirDiff = dirDiff - 360;
                        }
                        if(dirDiff > 180){
                                dirDiff = dirDiff - 360;
                        }
                       	if(Math.abs(dirDiff) > 90){
                                coords.push(verts[i]);
                               	continue;
                       	}
                       	var normVal = ((90 - Math.abs(dirDiff)) / 90) * (obj.attributes.data['buffer'] * 1000);
                        var x = (Math.cos(dir) * (normVal));
                        var y = (Math.sin(dir) * (normVal));
                        var c = obj.geometry.clone();
                        c.move(x,y);
                        clones.push(c.clone());
                }
                var newObj = parser.read(obj.geometry);
               	for(var i=0;i<clones.length;i++){
                       	var c = parser.read(clones[i]);
                       	newObj = newObj.union(c);
                }
                newObj = parser.write(newObj);
		var verts = newObj.getVertices();
                if(verts.length > 40){
                        var fraction = verts.length / 40;
                       	var fraction_orig = verts.length / 40;
                       	var newVerts = new Array();
                        for(var i=0;i<verts.length;i++){
                                if(i >= fraction){
                                        newVerts.push(verts[i]);
                                        fraction = fraction + fraction_orig;
                                }
                        }
                        newVerts.push(verts[0]);
                        var linearRing = new OpenLayers.Geometry.LinearRing(newVerts);
                       	newObj = new OpenLayers.Geometry.Polygon([linearRing]);
               	}
		obj = new OpenLayers.Feature.Vector(newObj,obj.attributes);
	}
	else if(obj.attributes.data.hasOwnProperty('buffer') && obj.attributes.data['buffer'] != 0){
		var newObj = parser.read(obj.geometry);
               	newObj = newObj.buffer(obj.attributes.data['buffer'] * 1000); // convert to meters
               	newObj = parser.write(newObj);
                var verts = newObj.getVertices();
                if(verts.length > 40){
                        var fraction = verts.length / 40;
                        var fraction_orig = verts.length / 40;
                        var newVerts = new Array();
                        for(var i=0;i<verts.length;i++){
                                if(i >= fraction){
                                        newVerts.push(verts[i]);
                                        fraction = fraction + fraction_orig;
                                }
                        }
                        newVerts.push(verts[0]);
                        var linearRing = new OpenLayers.Geometry.LinearRing(newVerts);
                        newObj = new OpenLayers.Geometry.Polygon([linearRing]);
                }
		obj = new OpenLayers.Feature.Vector(newObj,obj.attributes);
	}
	return obj;
}

function resetAuto(){
	if(resetting){
		resetting = false;
		track_points.removeAllFeatures();
	        track_points.redraw();
	        threat_area.removeAllFeatures();
	        threat_area.addFeatures([resetClone]);
	        threat_area.redraw();
	        modifyFeature.setFeature(threat_area.features[threat_area.features.length-1]);
	        //document.getElementById("motionVectorDir").style.fontWeight = 'normal';
	        //document.getElementById("motionVectorSpeed").style.fontWeight = 'normal';
	        //document.getElementById("duration-input").style.fontWeight = 'normal';
	        //console.log(modifyFeature.feature.attributes);
	        ndfd_grid2.removeAllFeatures();
	        lightUpGridAccum2(true);
		document.getElementById('resetAuto').value = 'Reset';
	        console.log('object restored');
		return;
	}
	var obj = getAutoGeometry();
	if(obj == null || modifyFeature.feature.attributes.data['init'] == -999){
		alert('Could not find automated object, it is likely that automation has lost tracking it');
		return;
	}
	resetClone = modifyFeature.feature.clone();
	resetting = true;
	var obj2 = obj.geometry.clone();
        obj2 = obj2.transform(proj,proj2);
	var init = modifyFeature.feature.attributes.data['initiated'];
	var usr = modifyFeature.feature.attributes.data['user'];
	modifyFeature.unsetFeature();
        modifyFeature.feature = null;
	obj.attributes.data['centers'] = {};
	centers = {};
        var bufObj = new OpenLayers.Feature.Vector(obj2,obj.attributes);
	var arr1 = [];
	var arr2 = [];
	renderObjects(bufObj, now, arr1, arr2);
	bufObj = arr1[0];
	bufObj.attributes.data['valid_start'] = parseInt(scans[scans.length - 1][0].split('_')[1]);
	bufObj.attributes.data['valid_end'] = parseInt(scans[scans.length - 1][0].split('_')[1]) + (obj.attributes.data['duration'] * 60);
	bufObj.attributes.data['initiated'] = init;
	bufObj.attributes.data['user'] = usr;
	track_points.removeAllFeatures();
	track_points.redraw();
        threat_area.removeAllFeatures();
        threat_area.addFeatures([bufObj]);
        threat_area.redraw();
       	modifyFeature.setFeature(threat_area.features[threat_area.features.length-1]);
	document.getElementById("motionVectorDir").style.fontWeight = 'normal';
	document.getElementById("motionVectorSpeed").style.fontWeight = 'normal';
	document.getElementById("duration-input").style.fontWeight = 'normal';
	console.log(modifyFeature.feature.attributes);
        ndfd_grid2.removeAllFeatures();
       	lightUpGridAccum2(true);
	document.getElementById('resetAuto').value = 'Restore';
	console.log('object reset');
}

function getAutoGeometry(){
	var jsonFormat = new OpenLayers.Format.GeoJSON();
        var objID = modifyFeature.feature.attributes.data['id'];
        var objType = modifyFeature.feature.attributes.data['types'][0];
        if(objType == 'severe1'){
                objType = 'probSevere'
        }
        else if(objType == 'lightning1'){
                objType = 'lightning'
        }
        var link = 'realtime/ewp/getObjectReset.php?objID=' + objID + '&archive=' + acase + '&site=' + site + '&now=' + timeCanvasVal.getAttr('time') + '&type=' + objType;
        var dataRequest = new XMLHttpRequest();
        dataRequest.open('GET', link, false);
        dataRequest.send();
        var objData = jsonFormat.read(dataRequest.responseText);
	if(objData.length == 0){
                return null;
        }
	return objData[0];
}

function clearDisc(){
	document.getElementById('discussion').value = '';
	modifyFeature.feature.attributes.data['discussion'] = '';;
}
