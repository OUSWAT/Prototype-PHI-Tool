	/*

        Copyright (c) 2014 Cooperative Institute for Mesoscale Meteorological Studies (CIMMS) and the University of Oklahoma

        Author:         Dr. Chris Karstens
        Email:          chris.karstens@noaa.gov
        Description:    Contains the following:
				1. function for setting background object after it is drawn
				2. funcation for initiating controls for drawing background probabilities

        */

	// sets background object after drawn
	function backgroundDrawn(nullFeat){
		var parser = new jsts.io.OpenLayersParser();
               	geom = parser.read(background_area.features[background_area.features.length - 1].geometry);
                if(!geom.isValid() && nullFeat == null){
                       	alert('Invalid Geometry!  Try again.');
                        background_area.removeAllFeatures();
                        return;
                }
		polygonControl2.deactivate();
		polygonControl5.deactivate();
		modifyFeature2.activate();
		//document.getElementById("createBackground").disabled = false;
		//document.getElementById("phiDay").disabled = false;
                document.getElementById("periodVal").disabled = true;
                document.getElementById("contourVal" + contourNumber).disabled = false;
                //document.getElementById("drawButton" + contourNumber).disabled = false;
		txt = '<input type="button" value="Delete" id="deleteContourButton' + contourNumber + '" onClick="deleteContour(' + contourNumber + ');" />';
		document.getElementById("backgroundConfigure" + contourNumber).innerHTML = txt;
		idx = background_area.features.length - 1;
		//background_area.features[idx].attributes.color = '#009933';
		background_area.features[idx].attributes.probID = contourNumber;
		background_area.features[idx].attributes.modified = 'true';
		background_area.features[idx].attributes.hazType = document.getElementById("hazardType").value;
		background_area.features[idx].attributes.issueType = document.getElementById("issueType").value;
		background_area.features[idx].attributes.user = user + '-' + desk;
		background_area.features[idx].attributes.show = true;
		period = document.getElementById("periodVal").value;
		background_area.features[idx].attributes.period = period;
		if(period.split('_').length == 2){
			period2 = document.getElementById("periodValHour").value;
			period = period.split('_')[0] + '_' + period2;
		}
	        pDay = period.split('_')[0];
                fstart = period.split('_')[1];
                fend = period.split('_')[2];		
		background_area.features[idx].attributes.fStart = fstart;
		background_area.features[idx].attributes.fEnd = fend;
		tnow = new Date();
		if(site == 'pecan'){
			if(tnow.getUTCHours() < 12){
				modelInitTime = parseInt((Date.UTC(tnow.getUTCFullYear(),tnow.getUTCMonth(),tnow.getUTCDate(),0,0,0)) / 1000) + (86400 * (parseInt(pDay) - 1));
			}
			else{
				modelInitTime = parseInt((Date.UTC(tnow.getUTCFullYear(),tnow.getUTCMonth(),tnow.getUTCDate(),0,0,0)) / 1000) + (86400 * parseInt(pDay));
			}
		}
		else{
	                modelInitTime = parseInt((Date.UTC(tnow.getUTCFullYear(),tnow.getUTCMonth(),tnow.getUTCDate(),0,0,0)) / 1000);
		}
                startTime = modelInitTime + (fstart * 3600);
                endTime = modelInitTime + (fend * 3600);
               	background_area.features[idx].attributes.startTime = startTime;
               	background_area.features[idx].attributes.endTime = endTime;
		diff = endTime - startTime;
		if(diff == 3600){
			ncpRecord = document.getElementById("issueType").value + '_onehourly_all';
		}
		else if(diff == 14400){
			ncpRecord = document.getElementById("issueType").value + '_fourhourly_' + document.getElementById("hazardType").value;
		}
		else{
			ncpRecord = document.getElementById("issueType").value + '_fullperiod_' + document.getElementById("hazardType").value;
		}
		background_area.features[idx].attributes.ncpRecord = ncpRecord;
		loadContourColor(contourNumber);
		//background_area.redraw();
		modifyFeature2.selectFeature(background_area.features[idx]);
		loadContours(contourNumber + 1);
		insertNCPRecord(background_area.features[idx].clone(),'Pending');
		timeCanvasVal.setAttr('time',startTime);
		moveSliderTime();
		pending = true;
		changeTime();
		//gstreets.setZIndex(3);
		if(nullFeat == null){
			connectLines();
		}
                setLayerIndexes();
                selectGrid();
		/*
		if(desk == 'SPC'){
			addNavigation();
		}
		else{
			removeNavigation();
		}
		*/
	}

	// initial controls for drawing background probabilities
        function drawBackground(cNum){
                modifyFeature.deactivate();
		modifyFeature2.deactivate();
		if(desk == 'SPC' || document.getElementById("hazardType").value == 'coverage'){
	                polygonControl2.activate();
		}
		else{
			polygonControl5.activate();
		}
		backGPanel = Ext.getCmp('backgroundPanel');
                backGPanel.show();
		//document.getElementById("createBackground").disabled = true;
		//document.getElementById("phiDay").disabled = true;
		if(site != 'pecan'){
			document.getElementById("deskType").disabled = true;
		}
		document.getElementById("periodVal").disabled = true;
		document.getElementById("issueType").disabled = true;
		document.getElementById("hazardType").disabled = true;
		document.getElementById("contourVal" + cNum).disabled = true;
		//document.getElementById("drawButton" + cNum).disabled = true;
                document.getElementById("backgroundConfigure" + cNum).innerHTML = '<b>Click on Map to Draw Polygon  --></b>';
		contourNumber = cNum;
        }

	// after drawing/editing probability contours, complete valid geometry
	function connectLines(){
		if(!checkKey() || modifyFeature2.mode != 1 || desk != 'SPC' || desk != 'SPC' && document.getElementById("hazardType") != 'coverage'){
			return;
		}
		// snatch feature id and deselect
		probID = modifyFeature2.feature.attributes.probID;
		modifyFeature2.unselectFeature(modifyFeature2.feature);
		for(i2=0;i2<background_area.features.length;i2++){
                        if(background_area.features[i2].attributes.probID == probID){
				index = i2;
				break;
                        }
                }
		var parser = new jsts.io.OpenLayersParser();
		var geojson_format = new OpenLayers.Format.JSON();
		featureAttrs = JSON.stringify(background_area.features[index].attributes);
		verts = background_area.features[index].geometry.getVertices();
                coords = new Array();
                for(i2=0;i2<verts.length;i2++){
                	coords.push(verts[i2]);
                }
		if(verts[0] != verts[verts.length - 1]){
			coords.push(verts[0]);
		}
		lineString = new OpenLayers.Geometry.LineString(coords);
                linearRing = new OpenLayers.Geometry.LinearRing(coords);
		poly = new OpenLayers.Geometry.Polygon([linearRing]);

		geom = parser.read(poly);
                if(!geom.isValid()){
                        alert('Warning: Invalid Geometry!');
                        //modifyFeature2.resetVertices();
			//return;
                }
		//else if(verts[0] == verts[verts.length - 1]){
		//	modifyFeature2.selectFeature(background_area.features[index]);
	        //        modifyFeature2.feature.attributes.modified = 'true';
		//	return;
		//}

		newLine = new OpenLayers.Feature.Vector(lineString,geojson_format.read(featureAttrs));

		background_area.removeFeatures([background_area.features[index]]);
		background_area.addFeatures([newLine]);
		modifyFeature2.selectFeature(background_area.features[background_area.features.length - 1]);
		modifyFeature2.feature.attributes.modified = 'true';
	}

	function loadContourColor(cNum){
		for(i=0;i<background_area.features.length;i++){
			if(background_area.features[i].attributes.probID == cNum){
				cVal = document.getElementById('contourVal' + cNum).value;
				if(site == 'pecan'){
					background_area.features[i].attributes.color = getPecanColor(cVal);
                                       	document.getElementById('bkgd' + cNum).style.color = getPecanColor(cVal);
				}
				else if(desk == 'SPC'){
					if(document.getElementById('hazardType').value == 'tornado' || document.getElementById('hazardType').value == 'all'){
						background_area.features[i].attributes.color = getSPCTornadoColor(cVal);
						document.getElementById('bkgd' + cNum).style.color = getSPCTornadoColor(cVal);
					}
					else{
						background_area.features[i].attributes.color = getSPCColor(cVal);
	                                        document.getElementById('bkgd' + cNum).style.color = getSPCColor(cVal);
					}
				}
				else if(document.getElementById("hazardType").value == 'coverage'){
					if(cVal == '18_19'){
                                               	background_area.features[i].attributes.color = 'rgb(154,188,230)';
                                               	document.getElementById('bkgd' + cNum).style.color = 'rgb(154,188,230)';
                                       	}
                                       	else if(cVal == '19_20'){
                                               	background_area.features[i].attributes.color = 'rgb(117,164,221)';
                                               	document.getElementById('bkgd' + cNum).style.color = 'rgb(117,164,221)';
                                       	}
                                       	else if(cVal == '20_21'){
                                               	background_area.features[i].attributes.color = 'rgb(87,144,213)';
                                               	document.getElementById('bkgd' + cNum).style.color = 'rgb(87,144,213)';
                                       	}
                                       	else if(cVal == '21_22'){
                                               	background_area.features[i].attributes.color = 'rgb(61,127,207)';
                                               	document.getElementById('bkgd' + cNum).style.color = 'rgb(61,127,207)';
                                       	}
                                       	else if(cVal == '22_23'){
                                               	background_area.features[i].attributes.color = 'rgb(44,105,178)';
                                               	document.getElementById('bkgd' + cNum).style.color = 'rgb(44,105,178)';
                                       	}
                                       	else if(cVal == '23_24'){
                                               	background_area.features[i].attributes.color = 'rgb(36,87,148)';
                                               	document.getElementById('bkgd' + cNum).style.color = 'rgb(36,87,148)';
                                       	}
                                        else if(cVal == '24_25'){
                                                background_area.features[i].attributes.color = 'rgb(30,73,124)';
                                                document.getElementById('bkgd' + cNum).style.color = 'rgb(30,73,124)';
                                        }
                                       	else if(cVal == '25_26'){
                                               	background_area.features[i].attributes.color = 'rgb(23,55,93)';
                                               	document.getElementById('bkgd' + cNum).style.color = 'rgb(23,55,93)';
                                        }
                                        else if(cVal == '26_27'){
                                                background_area.features[i].attributes.color = 'rgb(19,45,77)';
                                                document.getElementById('bkgd' + cNum).style.color = 'rgb(19,45,77)';
                                       	}			
				}
				else{
					if(cVal == '18_22'){
						background_area.features[i].attributes.color = 'rgb(160,160,160)';
						document.getElementById('bkgd' + cNum).style.color = 'rgb(160,160,160)';
					}
					else if(cVal == '19_23'){
                                               	background_area.features[i].attributes.color = 'rgb(140,140,140)';
                                                document.getElementById('bkgd' + cNum).style.color = 'rgb(140,140,140)';
                                       	}
					else if(cVal == '20_24'){
                                                background_area.features[i].attributes.color = 'rgb(120,120,120)';
                                                document.getElementById('bkgd' + cNum).style.color = 'rgb(120,120,120)';
                                        }
					else if(cVal == '21_25'){
                                               	background_area.features[i].attributes.color = 'rgb(100,100,100)';
                                                document.getElementById('bkgd' + cNum).style.color = 'rgb(100,100,100)';
                                       	}
					else if(cVal == '22_26'){
                                                background_area.features[i].attributes.color = 'rgb(80,80,80)';
                                                document.getElementById('bkgd' + cNum).style.color = 'rgb(80,80,80)';
                                        }
					else if(cVal == '23_27'){
                                               	background_area.features[i].attributes.color = 'rgb(60,60,60)';
                                               	document.getElementById('bkgd' + cNum).style.color = 'rgb(60,60,60)';
                                       	}
					else if(cVal == '24_28'){
                                                background_area.features[i].attributes.color = 'rgb(40,40,40)';
                                                document.getElementById('bkgd' + cNum).style.color = 'rgb(40,40,40)';
                                        }
					else if(cVal == '25_29'){
                                               	background_area.features[i].attributes.color = 'rgb(20,20,20)';
                                               	document.getElementById('bkgd' + cNum).style.color = 'rgb(20,20,20)';
                                       	}
					else if(cVal == '26_30'){
                                                background_area.features[i].attributes.color = 'rgb(0,0,0)';
                                                document.getElementById('bkgd' + cNum).style.color = 'rgb(0,0,0)';
                                        }
				}
				background_area.features[i].attributes.prob = cVal;
				background_area.redraw();
				break;
			}
		}
	}

	function deleteContour(cNum){
		if(cNum == null && modifyFeature2.feature != null){
			cNum = modifyFeature2.feature.attributes.probID;
		}
		if(modifyFeature2.feature != null && modifyFeature2.feature.attributes.probID == cNum){
			modifyFeature2.unselectFeature(modifyFeature2.feature);
		}
		for(i=0;i<background_area.features.length;i++){
                        if(background_area.features[i].attributes.probID == cNum){
				background_area.removeFeatures([background_area.features[i]]);
                                background_area.redraw();
				document.getElementById('contours' + cNum).innerHTML = '';
                                break;
                        }
                }
	}

	function editContourOn(){
		editContourOff();
		//document.getElementById('editContour' + modifyFeature2.feature.attributes.probID).innerHTML = 'EDITING';
		if(modifyFeature2.feature != null){
			document.getElementById('contours' + modifyFeature2.feature.attributes.probID).style.border = '3px ' + modifyFeature2.feature.attributes.color + ' solid';
		}
	}

	function editContourOff(){
		for(var i=1;i<=contourNumber;i++){
			//document.getElementById('editContour' + i).innerHTML = '';
			document.getElementById('contours' + i).style.border = '0px #000000 solid';
		}
	}

	function showNCPProbs(recordIndex, checked){
		for(var k3=0;k3<activeProbs.features.length;k3++){
			if(threatStore.data.items[recordIndex].get('fname') == activeProbs.features[k3].attributes.ncpRecord){
				activeProbs.features[k3].attributes.show = checked;
			}
		}
		for(var k3=0;k3<background_area.features.length;k3++){
			if(threatStore.data.items[recordIndex].get('fname') == background_area.features[k3].attributes.ncpRecord){
                               	background_area.features[k3].attributes.show = checked;
                       	}
		}
	}

	function displayUHObjects(){
		if(map.layers.indexOf(modelLayer) != -1){
                        map.removeLayer(modelLayer);
                }
                if(obsMap && map2.layers.indexOf(obsLayer) != -1){
                        map2.removeLayer(obsLayer);
                }
                if(uhMember == document.getElementById('memberOpt').value){
                        return;
                }
                uhObjects.removeAllFeatures();
                link = 'getUHObjects.php?member=' + document.getElementById('memberOpt').value + '&now=' + document.getElementById('initOpt').value.slice(0,8);
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();

                timeDelta = 3600;
                contours = dataRequest.responseText.split("\n");
                var geojson_format = new OpenLayers.Format.GeoJSON();
                cts = [];
                fTimes = [];
                for(k7=0;k7<contours.length;k7++){
                       	if(contours[k7].length > 0){
                                contour = geojson_format.read(contours[k7]);
                               	contour[0].geometry.transform(proj,proj2);
                               	if(contour[0].attributes.CNTR_VALUE == 25){
                                       	contour[0].attributes.COLOR = '#00FF00';
                               	}
                               	else if(contour[0].attributes.CNTR_VALUE == 50){
                                       	contour[0].attributes.COLOR = '#006600';
                               	}
                               	else if(contour[0].attributes.CNTR_VALUE == 75){
                                       	contour[0].attributes.COLOR = '#0000CC';
                               	}
                               	else if(contour[0].attributes.CNTR_VALUE == 100){
                                       	contour[0].attributes.COLOR = '#FF0000';
                               	}
                               	else if(contour[0].attributes.CNTR_VALUE == 150){
                                       	contour[0].attributes.COLOR = '#990000';
                               	}
                               	else if(contour[0].attributes.CNTR_VALUE == 200){
                                       	contour[0].attributes.COLOR = '#CC00FF';
                               	}
                               	else{
                                       	contour[0].attributes.COLOR = '#000000';
                               	}
                               	cts.push(contour[0]);
                       	}
               	}
               	uhObjects.addFeatures(cts);
		showUHObjects();

               	uhMember = document.getElementById('memberOpt').value;
	}

	function displayNSSLWRF14(){
		var idx = document.getElementById('memberOpt').selectedIndex - 1;
               	if(idx >= 0){
                       	timeDelta = nsslwrfEnsemble14['interval'][idx] * 60;
               	}
               	else{
                       	timeDelta = 3600;
               	}
               	var imgBounds = nsslwrfEnsemble14['bounds'];
               	var modelHours = nsslwrfEnsemble14['hours'];
               	var maxFields = nsslwrfEnsemble14['maxFields'];
		var hFactor = 0;
		var minute = '00';
               	goToModelTime();
		
		if(hourMaxFields.indexOf(document.getElementById('fieldOpt').value) != -1){
                        var tNow = new Date((timeCanvasVal.getAttr('time') + 3600) * 1000);
               	}
               	else{
                        var tNow = new Date(timeCanvasVal.getAttr('time') * 1000);
               	}
		var initT = Date.UTC(document.getElementById('initOpt').value.slice(0,4),document.getElementById('initOpt').value.slice(4,6) - 1,document.getElementById('initOpt').value.slice(6,8),document.getElementById('initOpt').value.slice(8,10));
                var tDiff = Math.floor((tNow - initT) / 3600000);
                var imgName = document.getElementById('memberOpt').value + '_' + document.getElementById('fieldOpt').value + '_' + document.getElementById('initOpt').value + 'f0' + pad(Math.abs(tDiff)) + '.png';
                var imgPath = 'realtime/efp/images/' + document.getElementById('initOpt').value + '/' + document.getElementById('memberOpt').value + '/' + imgName;
               	return [imgName, imgPath, imgBounds, modelHours, maxFields, tDiff, hFactor, minute];
	}

	function displayNSSLWRF15(){
		var idx = document.getElementById('memberOpt').selectedIndex - 1;
               	if(idx >= 0){
                       	timeDelta = nsslwrfEnsemble15['interval'][idx] * 60;
               	}
               	else{
                       	timeDelta = 3600;
               	}
               	var imgBounds = nsslwrfEnsemble15['bounds'];
               	var modelHours = nsslwrfEnsemble15['hours'];
               	var maxFields = nsslwrfEnsemble15['maxFields'];
		var hFactor = 0;
		var minute = '00';
               	goToModelTime();

		if(hourMaxFields.indexOf(document.getElementById('fieldOpt').value) != -1){
                        var tNow = new Date((timeCanvasVal.getAttr('time') + 3600) * 1000);
               	}
               	else{
                        var tNow = new Date(timeCanvasVal.getAttr('time') * 1000);
               	}
		var initT = Date.UTC(document.getElementById('initOpt').value.slice(0,4),document.getElementById('initOpt').value.slice(4,6) - 1,document.getElementById('initOpt').value.slice(6,8),document.getElementById('initOpt').value.slice(8,10));
               	var tDiff = Math.floor((tNow - initT) / 3600000);

		// account for missing precip accum images
               	if(document.getElementById('fieldOpt').value == 'precip03'){
                        var diff = (((tNow - initT) / 3600000) / 3) - Math.floor(((tNow - initT) / 3600000) / 3);
                        if(diff != 0){
                               	tDiff = (Math.floor(tDiff / 3) * 3) + 3;
                       	}
                       	else{
                               	tDiff = (Math.floor(tDiff / 3) * 3);
                       	}
			if(tDiff == 0){
                               	tDiff = -1;
                       	}
               	}
                else if(document.getElementById('fieldOpt').value == 'precip06'){
                        var diff = (((tNow - initT) / 3600000) / 6) - Math.floor(((tNow - initT) / 3600000) / 6);
                        if(diff != 0){
                                tDiff = (Math.floor(tDiff / 6) * 6) + 6;
                       	}
                       	else{
                                tDiff = (Math.floor(tDiff / 6) * 6);
                       	}
			if(tDiff == 0){
                               	tDiff = -1;
                       	}
                }
                else if(document.getElementById('fieldOpt').value == 'precip12'){
                        var diff = (((tNow - initT) / 3600000) / 12) - Math.floor(((tNow - initT) / 3600000) / 12);
                        if(diff != 0){
                               	tDiff = (Math.floor(tDiff / 12) * 12) + 12;
                        }
                        else{
                                tDiff = (Math.floor(tDiff / 12) * 12);
                       	}
			if(tDiff == 0){
                               	tDiff = -1;
                       	}
               	}

		var imgName = document.getElementById('memberOpt').value + '_' + document.getElementById('fieldOpt').value + '_' + document.getElementById('initOpt').value + 'f0' + pad(Math.abs(tDiff)) + '.png';
               	var imgPath = 'realtime/efp/images/' + document.getElementById('initOpt').value + '/' + document.getElementById('memberOpt').value + '/' + imgName;
		return [imgName, imgPath, imgBounds, modelHours, maxFields, tDiff, hFactor, minute];
	}

	function displayNSSLWRF17(){
               	var idx = document.getElementById('memberOpt').selectedIndex - 1;
               	if(idx >= 0){
                       	timeDelta = nsslwrfEnsemble17['interval'][idx] * 60;
               	}
               	else{
                       	timeDelta = 3600;
               	}
               	var imgBounds = nsslwrfEnsemble17['bounds'];
               	var modelHours = nsslwrfEnsemble17['hours'];
               	var maxFields = nsslwrfEnsemble17['maxFields'];
               	var hFactor = 0;
               	var minute = '00';
               	goToModelTime();

               	if(hourMaxFields.indexOf(document.getElementById('fieldOpt').value) != -1){
                       	var tNow = new Date((timeCanvasVal.getAttr('time') + 3600) * 1000);
               	}
               	else{
                       	var tNow = new Date(timeCanvasVal.getAttr('time') * 1000);
               	}
               	var initT = Date.UTC(document.getElementById('initOpt').value.slice(0,4),document.getElementById('initOpt').value.slice(4,6) - 1,document.getElementById('initOpt').value.slice(6,8),document.getElementById('initOpt').value.slice(8,10));
               	var tDiff = Math.floor((tNow - initT) / 3600000);

               	// account for missing precip accum images
               	if(document.getElementById('fieldOpt').value == 'precip03'){
                       	var diff = (((tNow - initT) / 3600000) / 3) - Math.floor(((tNow - initT) / 3600000) / 3);
                       	if(diff != 0){
                               	tDiff = (Math.floor(tDiff / 3) * 3) + 3;
                       	}
                       	else{
                               	tDiff = (Math.floor(tDiff / 3) * 3);
                       	}
                       	if(tDiff == 0){
                               	tDiff = -1;
                       	}
               	}
               	else if(document.getElementById('fieldOpt').value == 'precip06'){
                       	var diff = (((tNow - initT) / 3600000) / 6) - Math.floor(((tNow - initT) / 3600000) / 6);
                       	if(diff != 0){
                               	tDiff = (Math.floor(tDiff / 6) * 6) + 6;
                       	}
                       	else{
                               	tDiff = (Math.floor(tDiff / 6) * 6);
                       	}
                       	if(tDiff == 0){
                               	tDiff = -1;
                       	}
               	}
               	else if(document.getElementById('fieldOpt').value == 'precip12'){
                       	var diff = (((tNow - initT) / 3600000) / 12) - Math.floor(((tNow - initT) / 3600000) / 12);
                       	if(diff != 0){
                               	tDiff = (Math.floor(tDiff / 12) * 12) + 12;
                       	}
                       	else{
                               	tDiff = (Math.floor(tDiff / 12) * 12);
                       	}
                       	if(tDiff == 0){
                               	tDiff = -1;
                       	}
               	}

               	var imgName = document.getElementById('memberOpt').value + '_' + document.getElementById('fieldOpt').value + '_' + document.getElementById('initOpt').value + 'f0' + pad(Math.abs(tDiff)) + '.png';
               	var imgPath = 'realtime/efp/images/' + document.getElementById('initOpt').value + '/' + document.getElementById('memberOpt').value + '/' + imgName;
               	return [imgName, imgPath, imgBounds, modelHours, maxFields, tDiff, hFactor, minute];
       	}

	function displayHRRRE(){
               	var idx = document.getElementById('memberOpt').selectedIndex - 1;
               	if(idx >= 0){
                       	timeDelta = hrrrEnsembleE['interval'][idx] * 60;
               	}
               	else{
                       	timeDelta = 3600;
               	}
               	var imgBounds = hrrrEnsembleE['bounds'];
               	var modelHours = hrrrEnsembleE['hours'];
               	var maxFields = hrrrEnsembleE['maxFields'];
               	var hFactor = 0;
               	var minute = '00';
               	goToModelTime();

               	if(hourMaxFields.indexOf(document.getElementById('fieldOpt').value) != -1){
                       	var tNow = new Date((timeCanvasVal.getAttr('time') + 3600) * 1000);
               	}
               	else{
                       	var tNow = new Date(timeCanvasVal.getAttr('time') * 1000);
               	}
               	var initT = Date.UTC(document.getElementById('initOpt').value.slice(0,4),document.getElementById('initOpt').value.slice(4,6) - 1,document.getElementById('initOpt').value.slice(6,8),document.getElementById('initOpt').value.slice(8,10));
               	var tDiff = Math.floor((tNow - initT) / 3600000);

               	var imgName = document.getElementById('memberOpt').value + '_' + document.getElementById('fieldOpt').value + '_' + document.getElementById('initOpt').value + 'f0' + pad(Math.abs(tDiff)) + '.png';
               	var imgPath = 'realtime/efp/images/' + document.getElementById('initOpt').value + '/' + document.getElementById('memberOpt').value + '/' + imgName;
               	return [imgName, imgPath, imgBounds, modelHours, maxFields, tDiff, hFactor, minute];
       	}

	function displayOUMap(){
                var idx = document.getElementById('memberOpt').selectedIndex - 1;
                if(idx >= 0){
                        timeDelta = ouMapEnsemble['interval'][idx] * 60;
                }
                else{
                        timeDelta = 3600;
                }
                var imgBounds = ouMapEnsemble['bounds'];
                var modelHours = ouMapEnsemble['hours'];
                var maxFields = [];
                var hFactor = 0;
                var minute = '00';
                goToModelTime();

                //var tNow = new Date((timeCanvasVal.getAttr('time') - 10800) * 1000);
                var tNow = new Date(timeCanvasVal.getAttr('time') * 1000);
                var initT = Date.UTC(document.getElementById('initOpt').value.slice(0,4),document.getElementById('initOpt').value.slice(4,6) - 1,document.getElementById('initOpt').value.slice(6,8),document.getElementById('initOpt').value.slice(8,10));
                var tDiff = Math.floor((tNow - initT) / 3600000);
                var imgName = document.getElementById('memberOpt').value + '_' + document.getElementById('fieldOpt').value + '_initf0' + pad(Math.abs(tDiff)) + '.png';
		var imgPath = 'http://weather.ou.edu/~map/real_time_data/PECAN/PHI/' + document.getElementById('initOpt').value + '/' + document.getElementById('memberOpt').value + '/' + imgName;
                return [imgName, imgPath, imgBounds, modelHours, maxFields, tDiff, hFactor, minute];
        }

	function displayUKMET(){
		var idx = document.getElementById('memberOpt').selectedIndex - 1;
               	if(idx >= 0){
                       	timeDelta = ukmetEnsemble['interval'][idx] * 60;
               	}
               	else{
                       	timeDelta = 3600;
               	}
               	var imgBounds = ukmetEnsemble['bounds'];
               	var modelHours = ukmetEnsemble['hours'];
		var maxFields = [];
		var hFactor = 0;
		var minute = '00';
               	goToModelTime();

		//var tNow = new Date((timeCanvasVal.getAttr('time') - 10800) * 1000);
		var tNow = new Date(timeCanvasVal.getAttr('time') * 1000);
		var initT = Date.UTC(document.getElementById('initOpt').value.slice(0,4),document.getElementById('initOpt').value.slice(4,6) - 1,document.getElementById('initOpt').value.slice(6,8),document.getElementById('initOpt').value.slice(8,10));
               	var tDiff = Math.floor((tNow - initT) / 3600000);
               	var imgName = document.getElementById('memberOpt').value + '_' + document.getElementById('fieldOpt').value + '_' + document.getElementById('initOpt').value + 'f0' + pad(Math.abs(tDiff)) + '.png';
               	var imgPath = 'realtime/efp/images/' + document.getElementById('initOpt').value + '/' + document.getElementById('memberOpt').value + '/' + imgName;
                return [imgName, imgPath, imgBounds, modelHours, maxFields, tDiff, hFactor, minute];
	}

	function displayWOF(){
		if(lastWofDate != document.getElementById('initOpt').value){
                       	// get unique bounds for WoF domain (moving)
                       	link = 'realtime/efp/images/' + document.getElementById('initOpt').value + '/wofBounds.txt';
                       	var dataRequest = new XMLHttpRequest();
                       	dataRequest.open('GET', link, false);
                       	dataRequest.send();
                       	var coords = dataRequest.responseText.split(",");
                       	var llLon = coords[0];
                       	var llLat = coords[1];
                       	var urLon = coords[2];
                       	var urLat = coords[3].split("\n")[0];
                       	wofEnsemble['bounds'] = new OpenLayers.Bounds(llLon,llLat,urLon,urLat).transform(proj,proj2);
                       	lastWofDate = document.getElementById('initOpt').value;
               	}

               	var idx = document.getElementById('memberOpt').selectedIndex - 1;
               	if(idx >= 0){
                       	timeDelta = wofEnsemble['interval'][idx] * 60;
               	}
               	else{
                       	timeDelta = 3600;
               	}
               	var imgBounds = wofEnsemble['bounds'];
               	if(idx == 1){
			var modelHours = 240;
		}
		else{
			var modelHours = wofEnsemble['minutes'];
		}
		var maxFields = [];
		var hFactor = 0;
		var minute = '00';
               	goToModelTime();

		if(hourMaxFields.indexOf(document.getElementById('fieldOpt').value) != -1){
                        var tNow = new Date((timeCanvasVal.getAttr('time') + 3600) * 1000);
               	}
               	else{
                        var tNow = new Date(timeCanvasVal.getAttr('time') * 1000);
               	}
		var initT = Date.UTC(document.getElementById('initOpt').value.slice(0,4),document.getElementById('initOpt').value.slice(4,6) - 1,document.getElementById('initOpt').value.slice(6,8),document.getElementById('initOpt').value.slice(8,10),document.getElementById('initOpt').value.slice(10,12));
               	var tDiff = Math.floor((tNow - initT) / 300000) * 5;
		tDiff2 = Math.abs(tDiff);
		if(Math.abs(tDiff) < 100){
			tDiff2 = '0' + pad(Math.abs(tDiff));
		}
               	if(document.getElementById('fieldOpt').value.slice(-3) == 'max'){
			var imgName = document.getElementById('memberOpt').value + '_' + document.getElementById('fieldOpt').value + '_' + document.getElementById('initOpt').value + 'f000.png?' + (new Date()).getTime();
		}
		else{
			var imgName = document.getElementById('memberOpt').value + '_' + document.getElementById('fieldOpt').value + '_' + document.getElementById('initOpt').value + 'f' + tDiff2 + '.png';
		}
               	var imgPath = 'realtime/efp/images/' + document.getElementById('initOpt').value + '/' + document.getElementById('memberOpt').value + '/' + imgName;
                return [imgName, imgPath, imgBounds, modelHours, maxFields, tDiff, hFactor, minute];
	}

	function displayHRRR(){
		var idx = document.getElementById('memberOpt').selectedIndex - 1;
               	if(idx >= 0){
                       	timeDelta = hrrrEnsemble['interval'][idx] * 60;
               	}
               	else{
                       	timeDelta = 3600;
               	}
               	var imgBounds = hrrrEnsemble['bounds'];
               	var modelHours = hrrrEnsemble['hours'];
		var maxFields = [];
		var hFactor = 0;
		var minute = '00';
               	goToModelTime();

		if(hourMaxFields.indexOf(document.getElementById('fieldOpt').value) != -1){
                        var tNow = new Date((timeCanvasVal.getAttr('time') + 3600) * 1000);
               	}
               	else{
                        var tNow = new Date(timeCanvasVal.getAttr('time') * 1000);
               	}
		var initT = Date.UTC(document.getElementById('initOpt').value.slice(0,4),document.getElementById('initOpt').value.slice(4,6) - 1,document.getElementById('initOpt').value.slice(6,8),document.getElementById('initOpt').value.slice(8,10));
               	var tDiff = Math.floor((tNow - initT) / 3600000);

		// account for missing precip accum images
                if(document.getElementById('fieldOpt').value == 'precip03'){
                       	var diff = (((tNow - initT) / 3600000) / 3) - Math.floor(((tNow - initT) / 3600000) / 3);
                       	if(diff != 0){
                                tDiff = (Math.floor(tDiff / 3) * 3) + 3;
                       	}
                        else{
                                tDiff = (Math.floor(tDiff / 3) * 3);
                        }
			if(tDiff == 0){
                               	tDiff = -1;
                       	}
                }
                else if(document.getElementById('fieldOpt').value == 'precip06'){
                        var diff = (((tNow - initT) / 3600000) / 6) - Math.floor(((tNow - initT) / 3600000) / 6);
                       	if(diff != 0){
                                tDiff = (Math.floor(tDiff / 6) * 6) + 6;
                       	}
                       	else{
                               	tDiff = (Math.floor(tDiff / 6) * 6);
                       	}
			if(tDiff == 0){
                               	tDiff = -1;
                       	}
               	}
               	else if(document.getElementById('fieldOpt').value == 'precip12'){
                        var diff = (((tNow - initT) / 3600000) / 12) - Math.floor(((tNow - initT) / 3600000) / 12);
                        if(diff != 0){
                                tDiff = (Math.floor(tDiff / 12) * 12) + 12;
                        }
                       	else{
                               	tDiff = (Math.floor(tDiff / 12) * 12);
                        }
			if(tDiff == 0){
				tDiff = -1;
			}
                }

               	var imgName = document.getElementById('memberOpt').value + '_' + document.getElementById('fieldOpt').value + '_' + document.getElementById('initOpt').value + 'f0' + pad(Math.abs(tDiff)) + '.png';
               	var imgPath = 'realtime/efp/images/' + document.getElementById('initOpt').value + '/' + document.getElementById('memberOpt').value + '/' + imgName;
                return [imgName, imgPath, imgBounds, modelHours, maxFields, tDiff, hFactor, minute];
	}

	function displayNAM(){
		var idx = document.getElementById('memberOpt').selectedIndex - 1;
               	if(idx >= 0){
                       	timeDelta = namEnsemble['interval'][idx] * 60;
               	}
               	else{
                        timeDelta = 3600;
               	}
               	var imgBounds = namEnsemble['bounds'];
               	var modelHours = namEnsemble['hours'];
		var maxFields = [];
		var hFactor = 0;
		var minute = '00';
                goToModelTime();

		if(hourMaxFields.indexOf(document.getElementById('fieldOpt').value) != -1){
                        var tNow = new Date((timeCanvasVal.getAttr('time') + 3600) * 1000);
               	}
               	else{
                        var tNow = new Date(timeCanvasVal.getAttr('time') * 1000);
               	}
		var initT = Date.UTC(document.getElementById('initOpt').value.slice(0,4),document.getElementById('initOpt').value.slice(4,6) - 1,document.getElementById('initOpt').value.slice(6,8),document.getElementById('initOpt').value.slice(8,10));
               	var tDiff = Math.floor((tNow - initT) / 3600000);

		// account for missing precip accum images
                if(document.getElementById('fieldOpt').value == 'precip03'){
                        var diff = (((tNow - initT) / 3600000) / 3) - Math.floor(((tNow - initT) / 3600000) / 3);
                        if(diff != 0){
				tDiff = (Math.floor(tDiff / 3) * 3) + 3;
                        }
			else{
				tDiff = (Math.floor(tDiff / 3) * 3);
			}
			if(tDiff == 0){
                               	tDiff = -1;
                       	}
                }
               	else if(document.getElementById('fieldOpt').value == 'precip06'){
                       	var diff = (((tNow - initT) / 3600000) / 6) - Math.floor(((tNow - initT) / 3600000) / 6);
                       	if(diff != 0){
                               	tDiff = (Math.floor(tDiff / 6) * 6) + 6;
                       	}
                        else{
                               	tDiff = (Math.floor(tDiff / 6) * 6);
                        }
			if(tDiff == 0){
                               	tDiff = -1;
                       	}
                }
               	else if(document.getElementById('fieldOpt').value == 'precip12'){
                       	var diff = (((tNow - initT) / 3600000) / 12) - Math.floor(((tNow - initT) / 3600000) / 12);
                        if(diff != 0){
                               	tDiff = (Math.floor(tDiff / 12) * 12) + 12;
                       	}
                        else{
                               	tDiff = (Math.floor(tDiff / 12) * 12);
                        }
			if(tDiff == 0){
                               	tDiff = -1;
                       	}
                }

               	var imgName = document.getElementById('memberOpt').value + '_' + document.getElementById('fieldOpt').value + '_' + document.getElementById('initOpt').value + 'f0' + pad(Math.abs(tDiff)) + '.png';
               	var imgPath = 'realtime/efp/images/' + document.getElementById('initOpt').value + '/' + document.getElementById('memberOpt').value + '/' + imgName;
                return [imgName, imgPath, imgBounds, modelHours, maxFields, tDiff, hFactor, minute];
	}

	function displayGFS(){
		var idx = document.getElementById('memberOpt').selectedIndex - 1;
               	if(idx >= 0){
                       	timeDelta = gfsEnsemble['interval'][idx] * 60;
               	}
               	else{
                       	timeDelta = 3600;
               	}
               	var imgBounds = gfsEnsemble['bounds'];
               	var modelHours = gfsEnsemble['hours'];
		var maxFields = [];
		var hFactor = 0;
		var minute = '00';
               	goToModelTime();

                var tNow = new Date(timeCanvasVal.getAttr('time') * 1000);
		var initT = Date.UTC(document.getElementById('initOpt').value.slice(0,4),document.getElementById('initOpt').value.slice(4,6) - 1,document.getElementById('initOpt').value.slice(6,8),document.getElementById('initOpt').value.slice(8,10));
               	var tDiff = Math.floor(((tNow - initT) / 3600000) / 3) * 3;

		// account for missing precip accum images
		if(document.getElementById('fieldOpt').value == 'precip03'){
			var diff = (((tNow - initT) / 3600000) / 3) - Math.floor(((tNow - initT) / 3600000) / 3);
			if(diff != 0){
				tDiff = tDiff + 3;
			}
			if(tDiff == 0){
                               	tDiff = -1;
                       	}
		}
		else if(document.getElementById('fieldOpt').value == 'precip06'){
			var diff = (((tNow - initT) / 3600000) / 6) - Math.floor(((tNow - initT) / 3600000) / 6);
			if(diff != 0){
				tDiff = (Math.floor(tDiff / 6) * 6) + 6;
			}
			else{
				tDiff = (Math.floor(tDiff / 6) * 6);
			}
			if(tDiff == 0){
                               	tDiff = -1;
                       	}
		}
		else if(document.getElementById('fieldOpt').value == 'precip12'){
			var diff = (((tNow - initT) / 3600000) / 12) - Math.floor(((tNow - initT) / 3600000) / 12);
			if(diff != 0){
				tDiff = (Math.floor(tDiff / 12) * 12) + 12;
                        }
			else{
				tDiff = (Math.floor(tDiff / 12) * 12);
                       	}
			if(tDiff == 0){
                               	tDiff = -1;
                       	}
		}

               	var imgName = document.getElementById('memberOpt').value + '_' + document.getElementById('fieldOpt').value + '_' + document.getElementById('initOpt').value + 'f0' + pad(Math.abs(tDiff)) + '.png';
               	var imgPath = 'realtime/efp/images/' + document.getElementById('initOpt').value + '/' + document.getElementById('memberOpt').value + '/' + imgName;
                return [imgName, imgPath, imgBounds, modelHours, maxFields, tDiff, hFactor, minute];
	}

	function displayOBS(){
		if(document.getElementById('memberOpt').value == 'satellite'){
                        var imgBounds = conusObs['satBounds'];
                        timeDelta = 3600;
			var tDiff = timeCanvasNow.getAttr('time') - timeCanvasVal.getAttr('time');
			var tNowC = new Date(timeCanvasNow.getAttr('time') * 1000);
                        if(tDiff < 0 || Math.abs(tDiff < 1200) && tNowC.getUTCMinutes() >= 45 || Math.abs(tDiff < 1200) && tNowC.getUTCMinutes() < 5){
                               	return;
                       	}
                        var tNowC = new Date(timeCanvasVal.getAttr('time') * 1000);
                        var minutes = tNowC.getUTCMinutes();
                        //if(minutes >= 15 && minutes < 45){
                        //        var minute = '15';
                        //        var hFactor = 0;
                       	//}
                        //else if(minutes >= 0 && minutes < 15){
			if(minutes >= 0 && minutes < 45){
                                var minute = '45';
                                var hFactor = 1;
                       	}
                       	else{
                                var minute = '45';
                                var hFactor = 0;
                       	}
               	}
                else{
                        var imgBounds = conusObs['bounds'];
                       	timeDelta = 3600;
			var minute = '00';
			var hFactor = 0;
                }
		var modelHours = 9999999999999;
		var maxFields = [];

		/*
		if(imgName == imgNameLast && map2Bool == null){
	                if(document.getElementById('legend') != null){
	                        document.getElementById('legend').innerHTML = '<img src="images/color_scale_' + document.getElementById('fieldOpt').value + '.png" />';
	                }
	                return;
	        }
	        else if(map.layers.indexOf(modelLayer) != -1){
	                map.removeLayer(modelLayer);
	        }
		*/

		var now = new Date(timeCanvasNow.getAttr('time') * 1000);
                var tSlider = new Date(timeCanvasVal.getAttr('time') * 1000);
                var tDiff = timeCanvasNow.getAttr('time') - timeCanvasVal.getAttr('time');
                if(timeCanvasVal.getAttr('time') > timeCanvasNow.getAttr('time') && radarObs.indexOf(document.getElementById('fieldOpt').value) != -1){
			// stick radar obs when slider time is greater than current time (i.e., well into the future)
			var tNow = new Date((timeCanvasNow.getAttr('time') - (hFactor * 3600)) * 1000);
	               	var dateStamp = String(tNow.getUTCFullYear()) + String(pad(tNow.getUTCMonth() + 1)) + String(pad(tNow.getUTCDate())) + String(pad(tNow.getUTCHours()));
	               	var timeStamp = dateStamp + minute;
			var imgName = document.getElementById('fieldOpt').value + '__' + document.getElementById('modelOpt').value + '_' + timeStamp + '.png';
	                var imgPath = 'realtime/efp/obs/' + dateStamp.slice(0,-2) + '/' + imgName;
                }
                else if(document.getElementById('memberOpt').value != 'satellite' && tDiff > 0 && tDiff < 420 && tSlider.getUTCMinutes() < 7 && now.getUTCMinutes() < 7){
			// display nothing if waiting on obs to be generated
			if(hourMaxFields.indexOf(document.getElementById('fieldOpt').value) != -1){
				var tNow = new Date((timeCanvasVal.getAttr('time') + 3600 - (hFactor * 3600)) * 1000);
			}
			else{
				var tNow = new Date((timeCanvasVal.getAttr('time') - (hFactor * 3600)) * 1000);
			}
			var dateStamp = String(tNow.getUTCFullYear()) + String(pad(tNow.getUTCMonth() + 1)) + String(pad(tNow.getUTCDate())) + String(pad(tNow.getUTCHours()));
	                var timeStamp = dateStamp + minute;
			var imgName = document.getElementById('fieldOpt').value + '__' + document.getElementById('modelOpt').value + '_' + timeStamp + '.png';
			var imgPath = 'realtime/efp/obs/' + dateStamp.slice(0,-2) + '/' + imgName;
                }
                else if(document.getElementById('memberOpt').value == 'satellite' && tDiff < -900){
                       	// display nothing if waiting on satellite obs to be generated
			var tNow = new Date((timeCanvasVal.getAttr('time') - (hFactor * 3600)) * 1000);
			var dateStamp = String(tNow.getUTCFullYear()) + String(pad(tNow.getUTCMonth() + 1)) + String(pad(tNow.getUTCDate())) + String(pad(tNow.getUTCHours()));
                        var timeStamp = dateStamp + minute;
                       	var imgName = document.getElementById('fieldOpt').value + '__' + document.getElementById('modelOpt').value + '_' + timeStamp + '.png';
                       	var imgPath = 'realtime/efp/obs/' + dateStamp.slice(0,-2) + '/' + imgName;
               	}
               	else if(radarObs.indexOf(document.getElementById('fieldOpt').value) == -1 && timeCanvasVal.getAttr('time') > (timeCanvasNow.getAttr('time') - 3600) && document.getElementById('memberOpt').value != 'satellite'){
			// stick RAP obs if waiting on data to be generated
			var tNow = new Date((parseInt(timeCanvasNow.getAttr('time')) - 3600 - (hFactor * 3600)) * 1000);
	                var dateStamp = String(tNow.getUTCFullYear()) + String(pad(tNow.getUTCMonth() + 1)) + String(pad(tNow.getUTCDate())) + String(pad(tNow.getUTCHours()));
	                var timeStamp = dateStamp + minute;
			var imgName = document.getElementById('fieldOpt').value + '__' + document.getElementById('modelOpt').value + '_' + timeStamp + '.png';
	                var imgPath = 'realtime/efp/obs/' + dateStamp.slice(0,-2) + '/' + imgName;
               	}
		else{
			// display obs for given slider time
			if(hourMaxFields.indexOf(document.getElementById('fieldOpt').value) != -1){
                               	var tNow = new Date((timeCanvasVal.getAttr('time') + 3600 - (hFactor * 3600)) * 1000);
                       	}
                       	else{
                               	var tNow = new Date((timeCanvasVal.getAttr('time') - (hFactor * 3600)) * 1000);
                       	}
			var dateStamp = String(tNow.getUTCFullYear()) + String(pad(tNow.getUTCMonth() + 1)) + String(pad(tNow.getUTCDate())) + String(pad(tNow.getUTCHours()));
		        var timeStamp = dateStamp + minute;
			var imgName = document.getElementById('fieldOpt').value + '__' + document.getElementById('modelOpt').value + '_' + timeStamp + '.png';
	                var imgPath = 'realtime/efp/obs/' + dateStamp.slice(0,-2) + '/' + imgName;
		}
		return [imgName, imgPath, imgBounds, modelHours, maxFields, 999, hFactor, minute];
	}

	function updateNCPOptions(){
		/*
		link = 'getInitTimes.php?model=nssl_4km_14';
               	var dataRequest = new XMLHttpRequest();
               	dataRequest.open('GET', link, false);
               	dataRequest.send();
               	initOpts_nsslwrf14 = dataRequest.responseText.split(",");

               	link = 'getInitTimes.php?model=nssl_4km_15';
               	var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();
                initOpts_nsslwrf15 = dataRequest.responseText.split(",");
		*/

		link = 'getInitTimes.php?model=nssl_4km_17';
               	var dataRequest = new XMLHttpRequest();
               	dataRequest.open('GET', link, false);
               	dataRequest.send();
               	initOpts_nsslwrf17 = dataRequest.responseText.split(",");

		/*
		link = 'getInitTimes.php?model=ouMap';
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();
                initOpts_ouMap = dataRequest.responseText.split(",");
                initOpts_ouMap1km = dataRequest.responseText.split(",");
		initOpts_ouMapProb = dataRequest.responseText.split(",");
		initOpts_ouMapSpag = dataRequest.responseText.split(",");

                link = 'getInitTimes.php?model=ukmet';
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();
                initOpts_ukmet = dataRequest.responseText.split(",");

                link = 'getInitTimes.php?model=WoF';
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();
                initOpts_wof = dataRequest.responseText.split(",");
		*/

                link = 'getInitTimes.php?model=hrrr';
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();
                initOpts_hrrr = dataRequest.responseText.split(",");

		link = 'getInitTimes.php?model=hrrre';
               	var dataRequest = new XMLHttpRequest();
               	dataRequest.open('GET', link, false);
               	dataRequest.send();
               	initOpts_hrrre = dataRequest.responseText.split(",");

		/*
		link = 'getInitTimes.php?model=nam';
               	var dataRequest = new XMLHttpRequest();
               	dataRequest.open('GET', link, false);
               	dataRequest.send();
               	initOpts_nam = dataRequest.responseText.split(",");

               	link = 'getInitTimes.php?model=gfs';
               	var dataRequest = new XMLHttpRequest();
               	dataRequest.open('GET', link, false);
               	dataRequest.send();
               	initOpts_gfs = dataRequest.responseText.split(",");
		*/
	}

	function updateInitOptions(){
		// when the user hovers over the model init times, update the list before they click on it
		var initOpt = document.getElementById('initOpt');
		var idx = initOpt.options.selectedIndex;
		var selectedValue = initOpt.options[idx].value;
		var newIdx = 0;
		initOpt.options.length = 0;
		for(var i=0;i<initOpts.length;i++){
			var newOption = document.createElement("option");
			newOption.value = initOpts[i];
			newOption.innerHTML = initOpts[i];
			initOpt.options.add(newOption);
			if(initOpts[i] == selectedValue){
				newIdx = i;
			}
		}
		initOpt.options.selectedIndex = newIdx;
		selectedValue = initOpt.options[newIdx].value;
		var model = document.getElementById('modelOpt').value;
		if(model == 'wof' && selectedValue.slice(-4) == '1900'){
			document.getElementById('memberOpt').selectedIndex = 2;
		}
		else{
			document.getElementById('memberOpt').selectedIndex = 1;
		}
	}
