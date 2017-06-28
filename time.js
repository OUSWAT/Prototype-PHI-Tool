	/*

        Copyright (c) 2014 Cooperative Institute for Mesoscale Meteorological Studies (CIMMS) and the University of Oklahoma

        Author:         Dr. Chris Karstens
        Email:          chris.karstens@noaa.gov
        Description:    Contains the following:
				1. time button functions
				2. previous/next radar scan functions
				3. threat object/swath interpolation
				4. master time change function
				5. timer function called every second
				6. onmouseover event function for radar tilt table

        */

	// time buttons
        var playLoop;
        var play = false;
        var play2 = false;
        var delay = 100;
        var delay_orig = 100;
        function playButton(){
                play2 = true;
                play = true;
                playLoop = setTimeout(advanceScan,delay);
        }
        function stopButton(){
                play2 = false;
                play = false;
        }
        function increaseDelay(){
                delay = delay * 2;
        }
        function decreaseDelay(){
                delay = delay / 2;
        }
        function goToNow(){
                timeCanvasVal.setAttr('time',currentTime);
		if(currentTime < timeCanvasStart || currentTime > timeCanvasEnd){
			tDiff = Math.round((timeCanvasEnd - timeCanvasStart) / 2);
			timeCanvasStart = currentTime - tDiff;
                        timeCanvasEnd = currentTime + tDiff;
		}
                moveSliderTime();
		moveCurrentTime();
		drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
                changeTime();
        }

	// beginning/end scan buttons
	function goToStart(){
		if(acase == 'ncp'){
                        tSet = timeCanvasVal.getAttr('time') - 86400;
                        timeCanvasVal.setAttr('time',tSet);
			if(tSet < timeCanvasStart){
                                timeCanvasStart = timeCanvasStart - 86400;
				timeCanvasEnd = timeCanvasEnd - 86400;
                        }
                        moveSliderTime();
			moveCurrentTime();
			drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
                        changeTime();
                        return;
                }
		keys = getKeys(data);
               	if(keys.length == 0){
                       	return;
               	}
		tSet = parseInt(scans[0][0].split('_')[1]);
		timeCanvasVal.setAttr('time',tSet);
                moveSliderTime();
                changeTime();
	}
	function goToEnd(){
		if(acase == 'ncp'){
			tSet = timeCanvasVal.getAttr('time') + 86400;
			timeCanvasVal.setAttr('time',tSet);
			if(tSet > timeCanvasEnd){
                                timeCanvasEnd = timeCanvasEnd + 86400;
				timeCanvasStart = timeCanvasStart + 86400;
                        }
			moveSliderTime();
			moveCurrentTime();
			drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
	                changeTime();
			return;
		}
		keys = getKeys(data);
		vIndex = volumes;
		if(keys.length == 0){
			return;
		}
		if(keys.length <= volumes){
			vIndex = keys.length - 1;
		}
		tSet = parseInt(scans[vIndex][0].split('_')[1]);
		timeCanvasVal.setAttr('time',tSet);
                moveSliderTime();
                changeTime();
		newScanHere = false;
	}

	// previous/next radar scan function
        function advanceScan(scanDir){
		if(acase == 'ncp'){
			if(scanDir == 'back'){
				var div = timeCanvasVal.getAttr('time') / timeDelta;
                                if(parseInt(div) != div && !document.getElementById('memberOpt')){
					var frac = parseInt(Math.round((div - parseInt(div)) * timeDelta));
		                        tSet = timeCanvasVal.getAttr('time') - frac;
				}
				else if(document.getElementById('memberOpt') && document.getElementById('memberOpt').value == 'satellite'){
					var frac = parseInt(Math.round((div - parseInt(div)) * timeDelta));
                                       	if(frac == 2700){
						frac = 3600;
					}
					else if(frac > 2700){
                                               	frac -= 2700;
                                       	}
                                       	else{
                                               	frac += 900;
                                       	}
					tSet = timeCanvasVal.getAttr('time') - frac;
				}
				else{
					tSet = timeCanvasVal.getAttr('time') - timeDelta;
				}
			}
			else{
				var div = timeCanvasVal.getAttr('time') / timeDelta;
                               	if(parseInt(div) != div && !document.getElementById('memberOpt')){
					var frac = parseInt(Math.round((div - parseInt(div)) * timeDelta));
					tSet = timeCanvasVal.getAttr('time') + frac;
				}
				else if(document.getElementById('memberOpt') && document.getElementById('memberOpt').value == 'satellite'){
					var frac = parseInt(Math.round((div - parseInt(div)) * timeDelta));
					if(frac == 2700){
						frac = 3600;
					}
					else if(frac < 2700){
						frac = 2700 - frac;
					}
					else{
						frac = (3600 - frac) + 2700;
					}
                                       	tSet = timeCanvasVal.getAttr('time') + frac;
				}
				else{
					tSet = timeCanvasVal.getAttr('time') + timeDelta;
				}
			}
                        timeCanvasVal.setAttr('time',tSet);
			if(tSet < timeCanvasStart){
				timeCanvasStart = timeCanvasStart - timeDelta;
				timeCanvasEnd = timeCanvasEnd - timeDelta;
			}
			else if(tSet > timeCanvasEnd){
				timeCanvasEnd = timeCanvasEnd + timeDelta;
				timeCanvasStart = timeCanvasStart + timeDelta;
			}
                        moveSliderTime();
			moveCurrentTime();
			drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
                        changeTime();
                        return;
                }
		keys = getKeys(data);
                if(!play || keys.length == 0){
                        return;
                }
                now = timeCanvasVal.getAttr('time');
                pause = true;
                if(scanDir == null && (scans.length) >= 0){
                        tilt = currentTilt.split('_')[2];
                        if(tilt > (scans[scans.length - 1].length - 1)){
                                tilt = scans[scans.length - 1].length - 1;
                        }
                        now = now + 1;
                        if(now > parseInt(scans[scans.length - 1][tilt].split('_')[1])){
                                now = timeMin - 1;
                                new_delay = delay;
                        }
                        else if((scans.length - 2) >= 0 && now > parseInt(scans[scans.length - 2][tilt].split('_')[1])){
                                new_delay = 1000;
                        }
                        else{
                                new_delay = delay;
                        }
                }
                if(scanDir == 'back'){
                        for(var i2=(scans.length - 1);i2>=0;i2--){
                                tilt = currentTilt.split('_')[2];
				if(tilt == -1){
                                       	return;
                               	}
                                else if(tilt > (scans[i2].length - 1)){
                                        tilt = scans[i2].length - 1;
                                }
                                lyrTime = scans[i2][tilt].split('_')[1];
                                if(now > lyrTime){
                                        timeCanvasVal.setAttr('time',parseInt(lyrTime));
                                        moveSliderTime();
                                        changeTime();
                                        break;
                                }
                        }
                }
                else{
                        for(var i2=0;i2<scans.length;i2++){
                                tilt = currentTilt.split('_')[2];
				if(tilt == -1){
					return;
				}
                                else if(tilt > (scans[i2].length - 1)){
                                        tilt = scans[i2].length - 1;
                                }
                                lyrTime = scans[i2][tilt].split('_')[1];
                                if(now < lyrTime){
                                        timeCanvasVal.setAttr('time',parseInt(lyrTime));
                                        moveSliderTime();
                                        changeTime('test');
                                        break;
                                }
                        }
                }
                if(play2){
		        playLoop = setTimeout(advanceScan,new_delay);
                }
        }

	// interpolate between stored threat geometries
	function interpolateThreat(tnow,index,index2){
		clone = null;
		for(var i4=0;i4<activeThreatClones.features.length;i4++){
			if(activeThreatClones.features[i4].attributes.data['issue'] == index){
				activeThreats.removeFeatures([activeThreats.features[index2]]);
				clone = activeThreatClones.features[i4].clone();
				clone_orig = activeThreatClones.features[i4].clone();
				break;
			}
		}
		if(clone == null){
			// shouldn't go here
			return;
		}
		
		timeDiff = tnow - clone.attributes.data['valid_start'];
		iterLength = Math.floor(timeDiff / 60);
		addSecs2 = timeDiff - (iterLength * 60);
		addSecs = 0;
		k2 = -1;
		for(k=0;k<=(iterLength + 1);k++){
			if((k%5) == 0 && k != (iterLength + 1)){
				k2++;
			}
			if(k == (iterLength + 1)){
				addSecs = -1 * (60 - addSecs2);
			}
			slp = (clone.attributes.data['probs'][0][k2+1] - clone.attributes.data['probs'][0][k2]) / 5;
			y_int = clone.attributes.data['probs'][0][k2] - ((k2 * 5) * slp);
			probVal = ((k + (addSecs / 60)) * slp) + y_int;
			slp = (clone.attributes.data['speeds'][k2+1] - clone.attributes.data['speeds'][k2]) / 5;
			y_int = clone.attributes.data['speeds'][k2] - ((k2 * 5) * slp);
			speedVal = ((k + (addSecs / 60)) * slp) + y_int;
			slp = (clone.attributes.data['spd'][k2+1] - clone.attributes.data['spd'][k2]) / 5;
			y_int = clone.attributes.data['spd'][k2] - ((k2 * 5) * slp);
			spdUVal = ((k + (addSecs / 60)) * slp) + y_int;
			slp = (clone.attributes.data['dir'][k2+1] - clone.attributes.data['dir'][k2]) / 5;
			y_int = clone.attributes.data['dir'][k2] - ((k2 * 5) * slp);
			dirUVal = ((k + (addSecs / 60)) * slp) + y_int;
			
			if(clone.attributes.data['dirs'][k2+1] >= 270 && clone.attributes.data['dirs'][k2] <= 90 || clone.attributes.data['dirs'][k2] >= 270 && clone.attributes.data['dirs'][k2+1] <= 90){
				angDiff = (clone.attributes.data['dirs'][k2] - clone.attributes.data['dirs'][k2+1]);
				if(angDiff < 0){
					angDiff = (360 + angDiff) * -1;
				}
				else{
					angDiff = 360 - angDiff;
				}
				slp = angDiff / 5;
				y_int = clone.attributes.data['dirs'][k2] - ((k2 * 5) * slp);
				dirVal = ((k + (addSecs / 60)) * slp) + y_int;
				if(dirVal >= 360){
					dirVal = dirVal - 360;
				}
				else if(dirVal < 0){
					dirVal = dirVal + 360;
				}
			}
			else{
				slp = (clone.attributes.data['dirs'][k2+1] - clone.attributes.data['dirs'][k2]) / 5;
				y_int = clone.attributes.data['dirs'][k2] - ((k2 * 5) * slp);
				dirVal = ((k + (addSecs / 60)) * slp) + y_int;
			}
			
			if(k == 0){
				dirValLast = dirVal;
			}
			distance = 60 * speedVal * 0.514444444;
			x_dis2 = 60 * spdUVal * 0.514444444;
			if(k == (iterLength + 1)){
				distance = addSecs * speedVal * 0.514444444;
				x_dis2 = addSecs * spdUVal * 0.514444444;
				prob = Math.round(((addSecs / 60) * (clone.attributes.data['probs'][0][k2+1] - clone.attributes.data['probs'][0][k2])) + clone.attributes.data['probs'][0][k2]);
			}
			x_dis = distance * Math.cos((270 - dirVal) * Math.PI / 180);
			y_dis = distance * Math.sin((270 - dirVal) * Math.PI / 180);
			y_dis2 = distance * Math.tan((dirUVal) * Math.PI / 180);
			clone.geometry.move(x_dis,y_dis);
			clone_orig.geometry.move(x_dis,y_dis);
			nowPoint = clone.geometry.getCentroid();
			clone.geometry.rotate((dirValLast - dirVal),nowPoint);
			clone_orig.geometry.rotate((dirValLast - dirVal),nowPoint);
			clone.geometry.rotate(-1 * (270 - dirValLast),nowPoint);
			verts = clone.geometry.getVertices();
			coords = new Array();
			coords2 = new Array();
			for(i5=0;i5<verts.length;i5++){
				dir = Math.atan2(verts[i5].y - nowPoint.y,verts[i5].x - nowPoint.x);
				x = (Math.cos(dir) * (x_dis2));
				y = (Math.sin(dir) * (y_dis2));
				verts[i5].move(x,y);
				coords.push(verts[i5]);
				coords2.push(verts[i5]);
			}
			attrs = clone.attributes;
			linearRing = new OpenLayers.Geometry.LinearRing(coords);
			clone = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([linearRing]),attrs);
			clone.geometry.rotate((270 - dirValLast),nowPoint);
			if(coords2[0] != coords2[coords2.length -1]){
				coords2.push(coords2[0]);
			}
			lineString = new OpenLayers.Geometry.LineString(coords2);
			clone2 = new OpenLayers.Feature.Vector(lineString,attrs);
			//clone2.geometry.rotate((270 - dirValLast),nowPoint);
			dirValLast = dirVal;
		}
		backClone = clone.clone();
		backClone.attributes.id = backClone.attributes.data['id'];
		clone2.attributes.id = clone2.attributes.data['id'];
		activeThreatsBack.addFeatures([backClone]);
		activeThreats.addFeatures([clone2.clone()]);
		activeThreatClones2.addFeatures(clone_orig.clone());
		activeThreats.features[activeThreats.features.length - 1].style = null;
		if(gridIndex == 2){
			lightUpGrid(clone.clone(),clone_orig.geometry.clone(),probVal);
		}
		else if(gridIndex == 1 || gridIndex == 3){
			interpolateSwath(clone.clone(),clone_orig.clone(),clone.attributes.data['threatColor']);
		}
	}

	// interpolate swath area for given feature
	function interpolateSwath(feat,feat3,newColor){
		tnow = timeCanvasVal.getAttr('time');
		feat = feat.clone();
		feat2 = feat.clone();
		feat3 = feat3.clone();
		feat4 = feat.clone();
		timeDiff = tnow - feat.attributes.data['valid_start'];
		iterLength = Math.floor(timeDiff / 60);
		addSecs = timeDiff - (iterLength * 60);
		k2 = Math.floor(iterLength / 5);
		for(k=iterLength;k<=(feat.attributes.data['duration'] + iterLength);k++){
			if((k%5) == 0 && k != iterLength){
				k2++;
			}
			slp = (feat.attributes.data['probs'][0][k2+1] - feat.attributes.data['probs'][0][k2]) / 5;
			y_int = feat.attributes.data['probs'][0][k2] - ((k2 * 5) * slp);
			probVal = ((k + (addSecs / 60)) * slp) + y_int;
			slp = (feat.attributes.data['speeds'][k2+1] - feat.attributes.data['speeds'][k2]) / 5;
			y_int = feat.attributes.data['speeds'][k2] - ((k2 * 5) * slp);
			speedVal = ((k + (addSecs / 60)) * slp) + y_int;
			slp = (feat.attributes.data['spd'][k2+1] - feat.attributes.data['spd'][k2]) / 5;
			y_int = feat.attributes.data['spd'][k2] - ((k2 * 5) * slp);
			spdUVal = ((k + (addSecs / 60)) * slp) + y_int;
			slp = (feat.attributes.data['dir'][k2+1] - feat.attributes.data['dir'][k2]) / 5;
			y_int = feat.attributes.data['dir'][k2] - ((k2 * 5) * slp);
			dirUVal = ((k + (addSecs / 60)) * slp) + y_int;

			if(feat.attributes.data['dirs'][k2+1] >= 270 && feat.attributes.data['dirs'][k2] <= 90 || feat.attributes.data['dirs'][k2] >= 270 && feat.attributes.data['dirs'][k2+1] <= 90){
				angDiff = (feat.attributes.data['dirs'][k2] - feat.attributes.data['dirs'][k2+1]);
				if(angDiff < 0){
					angDiff = (360 + angDiff) * -1;
				}
				else{
					angDiff = 360 - angDiff;
				}
				slp = angDiff / 5;
				y_int = feat.attributes.data['dirs'][k2] - ((k2 * 5) * slp);
				dirVal = ((k + (addSecs / 60)) * slp) + y_int;
				if(dirVal >= 360){
					dirVal = dirVal - 360;
				}
				else if(dirVal < 0){
					dirVal = dirVal + 360;
				}
			}
			else{
				slp = (feat.attributes.data['dirs'][k2+1] - feat.attributes.data['dirs'][k2]) / 5;
				y_int = feat.attributes.data['dirs'][k2] - ((k2 * 5) * slp);
				dirVal = ((k + (addSecs / 60)) * slp) + y_int;
			}
			if(k == iterLength){
				var parser = new jsts.io.OpenLayersParser();
				union = parser.read(feat.geometry);
				dirValLast = dirVal;
			}
			else{
				distance = 60 * speedVal * 0.514444444;
				//alert(distance);
				x_dis2 = 60 * spdUVal * 0.514444444;
				x_dis = distance * Math.cos((270 - dirVal) * Math.PI / 180);
				y_dis = distance * Math.sin((270 - dirVal) * Math.PI / 180);
				y_dis2 = distance * Math.tan((dirUVal) * Math.PI / 180);
				feat.geometry.move(x_dis,y_dis);
				feat2.geometry.move(x_dis,y_dis);
				nowPoint = feat.geometry.getCentroid();
				feat.geometry.rotate((dirValLast - dirVal),nowPoint);
				feat2.geometry.rotate((dirValLast - dirVal),nowPoint);
				feat.geometry.rotate(-1 * (270 - dirValLast),nowPoint);
				verts = feat.geometry.getVertices();
				coords = new Array();
				for(i2=0;i2<verts.length;i2++){
					dir = Math.atan2(verts[i2].y - nowPoint.y,verts[i2].x - nowPoint.x);
					x = (Math.cos(dir) * (x_dis2));
					y = (Math.sin(dir) * (y_dis2));
					verts[i2].move(x,y);
					coords.push(verts[i2]);
				}
				attrs = feat.attributes;
				linearRing = new OpenLayers.Geometry.LinearRing(coords);
				feat = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([linearRing]),attrs);	
				feat.geometry.rotate((270 - dirValLast),nowPoint);				
				parseFeat = parser.read(feat.geometry);
				union = union.union(parseFeat);
				dirValLast = dirVal;
			}
		}
		union = parser.write(union);
		newUnion = union.clone();
		if(newColor == null){
			swath = new OpenLayers.Feature.Vector(newUnion,{'threatColor': 'rgb(180,180,180)','valid_start': feat.attributes.data['valid_start'],'issue':feat.attributes.data['issue']});
		}
		else{
			swath = new OpenLayers.Feature.Vector(newUnion,{'threatColor': newColor,'valid_start': feat.attributes.data['valid_start'],'issue':feat.attributes.data['issue']});
		}
		swathsBack.addFeatures([swath.clone()]);
		swaths.addFeatures([swath]);
		if(gridIndex == 3){
			if(Math.abs(timeCanvasVal.getAttr('time') - currentTimeLast) > 59 || valid_start_last != feat3.attributes.data['valid_start'] || gridsLength != grids.length){
				currentTimeLast = timeCanvasVal.getAttr('time');
				valid_start_last = feat3.attributes.data['valid_start'];
				lightUpGridAccum(feat3,feat4,swath.clone());
				gridsLength = grids.length;
			}
			else if(timeCanvasVal.getAttr('time') >= feat3.attributes.data['valid_start'] && timeCanvasVal.getAttr('time') <= (feat3.attributes.data['valid_start'] + (60 * 2 * feat3.attributes.data['duration'])) && ndfd_grid.features.length == 0){
				currentTimeLast = timeCanvasVal.getAttr('time');
                               	valid_start_last = feat3.attributes.data['valid_start'];
                                lightUpGridAccum(feat3,feat4,swath.clone());
                                gridsLength = grids.length;
			}
		}
	}

	// time slider function
	function changeTime(test){
		if(acase == 'ncp'){
			now = timeCanvasVal.getAttr('time');
			activeProbsShow.removeAllFeatures();
			for(var i6=(activeProbs.features.length - 1);i6>=0;i6--){
                               	if(now >= activeProbs.features[i6].attributes.startTime && now < activeProbs.features[i6].attributes.endTime && activeProbs.features[i6].attributes.show){
					if(background_area.features.length > 0){
						if(background_area.features[0].attributes.startTime != activeProbs.features[i6].attributes.startTime && background_area.features[0].attributes.endTime != activeProbs.features[i6].attributes.endTime || document.getElementById("hazardType").value == 'isochrone' && activeProbs.features[i6].attributes.hazType != 'isochrone'){
							activeProbsShow.addFeatures([activeProbs.features[i6].clone()]);
						}
					}
					else if(background_area_null.features.length > 0){
						if(background_area_null.features[0].attributes.startTime != activeProbs.features[i6].attributes.startTime && background_area_null.features[0].attributes.endTime != activeProbs.features[i6].attributes.endTime){
							activeProbsShow.addFeatures([activeProbs.features[i6].clone()]);
						}
					}
					else{
						activeProbsShow.addFeatures([activeProbs.features[i6].clone()]);
					}
                               	}
                       	}
			if(background_area.features.length > 0){
				if(now < background_area.features[0].attributes.startTime || now >= background_area.features[0].attributes.endTime){
					if(modifyFeature2.feature){
				                modifyFeature2.unselectFeature(modifyFeature2.feature);
				        }
					for(i6=(background_area.features.length - 1);i6>=0;i6--){
						background_area_null.addFeatures([background_area.features[i6].clone()]);
					}
					background_area.removeAllFeatures();
				}
			}
			else if(background_area_null.features.length > 0){
				if(now >= background_area_null.features[0].attributes.startTime && now < background_area_null.features[0].attributes.endTime){
					for(i6=(background_area_null.features.length - 1);i6>=0;i6--){
						background_area.addFeatures([background_area_null.features[i6].clone()]);
					}
					background_area_null.removeAllFeatures();
				}
			}
			loadField();
			loadSfcObs();
			loadEFPNSSL();
			loadSPC();
			showUHObjects();
			blank.setZIndex(0);
			dark.setZIndex(0);
			if(map.layers.indexOf(modelLayer) != -1){
				modelLayer.setZIndex(200);
			}
		}
		else{
			now = timeCanvasVal.getAttr('time');
			if(analysis){
				currentTime = now;
			}
			if(scans[0] != null){
				lyrTimeNext = true;
				found = false;
				options = {isBaseLayer: false, transparent: true, visibility: true, displayInLayerSwitcher:false, opacity: radarOpacity};
				for(var i6=(scans.length - 1);i6>=0;i6--){
					for(var j3=(scans[i6].length - 1);j3>=0;j3--){
						lyrTime = scans[i6][j3].split('_')[1];					
						if(lyrTime <= now && lyrTimeNext && j3 == currentTilt.split('_')[2] && showRadar){
							var p2 = product.split('-')[product.split('-').length - 1];
							if((p2 + '_' + scans[i6][j3]) != radarImageLast){
								if(p2 == 'Reflectivity' || p2 == 'Velocity'){
									eval(p2 + '_' + scans[i6][j3] + ' = new OpenLayers.Layer.Image(\'' + scans[i6][j3] + '\',\'' + radarImages[i6][j3] + '\',bounds,new OpenLayers.Size(1, 1),options)');
								}
								else{
									eval(p2 + '_' + scans[i6][j3] + ' = new OpenLayers.Layer.Image(\'' + scans[i6][j3] + '\',\'' + radarImages[i6][j3] + '\',floaterBounds,new OpenLayers.Size(1, 1),options)');
								}
			                                        eval('map.addLayer(' + p2 + '_' + scans[i6][j3] + ')');
								eval(p2 + '_' + scans[i6][j3] + '.display(true)');
								eval(p2 + '_' + scans[i6][j3] + '.setZIndex(100)');
								lyrTimeNext = false;
								lyrTimePrevScan = lyrTime;
								if((i6 + 1) < scans.length && j3 < scans[i6+1].length){
									lyrTimeCurScan = scans[i6+1][j3].split('_')[1];
								}
								else{
									lyrTimeCurScan = timeCanvasEnd;
								}
								try{
									eval('map.removeLayer(' + radarImageLast + ');');
								}
								catch(err){
									// nothing
								}								
								radarImageLast = p2 + '_' + scans[i6][j3];
								if(chartFeature != null){
					                               	genHistory(chartFeature, objTypeLast, objTitleLast, objUnitsLast, objKeyLast);
					                       	}
							}
							else if(radarImageLast != ''){
								eval(radarImageLast + '.setZIndex(100)');
							}
							found = true;
							break;
						}
					}
					if(found){
						break;
					}
				}
				tiltTable();
			}
			else{
				lyrTimePrevScan = null;
				lyrTimeCurScan = null;
			}
			swathsBack.removeAllFeatures();
			swaths.removeAllFeatures();
			activeThreatClones2.removeAllFeatures();
			//activeThreatsBack.removeAllFeatures();
			if(threat_area.features.length == 0){
				threat_lines.removeAllFeatures();
			}
			removeGridCells();
			/*
			for(var i6=(activeThreats.features.length - 1);i6>=0;i6--){
				if(activeThreats.features[i6].attributes.data && now >= activeThreats.features[i6].attributes.data['valid_start'] && now < activeThreats.features[i6].attributes.data['valid_end']){
					interpolateThreat(now,activeThreats.features[i6].attributes.data['issue'],i6);
				}
				else{
					activeThreats.features[i6].style = { display: 'none' };
				}
			}
			if(!map.dragging){
				activeThreats.redraw();
			}
			*/
			threat_lines.redraw();
			swaths.redraw();
			//if(lyrTimePrevScan != null){
			//	showMYRORSS(lyrTimePrevScan,lyrTimeCurScan);
			//	showKmeans(lyrTimePrevScan,lyrTimeCurScan);
			//}
			wofStart = null;
			activeWof.removeAllFeatures();
			for(var i=(wof.features.length - 1);i>=0;i--){
				if(now >= wof.features[i].attributes.start_time && now <= wof.features[i].attributes.end_time){
					if(wof.features[i].attributes.start_time == wofStart || wofStart == null){
						activeWof.addFeatures([wof.features[i].clone()]);
						wofStart = wof.features[i].attributes.start_time;
					}
				}
			}
			loadAzShear(now);
			loadProbSevere(now);
			loadLightning(now);
			loadNLDN(now);
			loadLegacy(now);
			loadWof(now);
			loadWoFViz();
			loadSPC();
			loadEFPNSSL();
			loadEFPSPCTorn();
			loadEFPSPCTorn1hr();
			loadEFPSPCHail();
			loadEFPSPCWind();
			displayWoF1();
			//displayWoF2();
			moveThreat();
			showNWSWarnings();
			activeWof.setZIndex(4);
			ndfd_grid.setZIndex(4);
			//gstreets.setZIndex(3);
			blank.setZIndex(0);
			dark.setZIndex(0);
			if(validProbMinTornado == null){
				renderProbSlider();
			}
			var validProbsSlider = Ext.getCmp('validProbs');
			try{
				if(timeCanvasVal.getAttr('time') == scans[volumes][0].split('_')[1] && !analysis){
					validProbsSlider.show();
					document.getElementById('validProbMinLabel').innerHTML = validProbMin + '%';
			                document.getElementById('validProbMaxLabel').innerHTML = validProbMax + '%';
					document.getElementById('productSelect').disabled = false;
				}
				else{
					validProbsSlider.hide();
					document.getElementById('validProbMinLabel').innerHTML = '';
			                document.getElementById('validProbMaxLabel').innerHTML = '';
					if(!analysis){
						document.getElementById('productSelect').disabled = true;
					}
				}
			}
			catch(err){
				try{
					if(timeCanvasVal.getAttr('time') == scans[scans.length-1][0].split('_')[1] && !analysis){
						validProbsSlider.show();
	                                        document.getElementById('validProbMinLabel').innerHTML = validProbMin + '%';
	                                        document.getElementById('validProbMaxLabel').innerHTML = validProbMax + '%';
						document.getElementById('productSelect').disabled = false;
					}
					else{
						validProbsSlider.hide();
		                                document.getElementById('validProbMinLabel').innerHTML = '';
		                                document.getElementById('validProbMaxLabel').innerHTML = '';
						if(!analysis){
							document.getElementById('productSelect').disabled = true;
						}
					}
				}
				catch(err){
					
				}
			}
			//var threatStore = Ext.getCmp('threatStore');
			if(threatStore.isFiltered()) {
                		threatStore.filter(threatStore.myLastFilter);
	            	}
			if(!updateThreat){
				//threat_area.setZIndex(9999);
			}
			//myrorss_objects.setZIndex(9999);
			if(radarImageLast != ''){
	                       	eval(radarImageLast + '.setZIndex(100)');
                       	}
			changeTimeNowLast = now;
		}
	}

	// function called every second
	function timer(){
		if(archive){
			//currentTime = parseInt((new Date() - initTime) / 1000) + parseInt(initArchiveTime) + logTime;
			var uTime = parseInt((new Date()) / 1000)
			currentTime = parseInt(initArchiveTimeOrig) + (uTime - logTime);
		}
		else{
			currentTime = parseInt((new Date()) / 1000);
		}
		timeCanvasNow.setAttr('time',currentTime);
		moveCurrentTime();
		readBackground(backgroundCheck);
		currentDate = new Date(currentTime * 1000);
		//tString = currentDate.getUTCFullYear() + '-' + pad(currentDate.getUTCMonth() + 1) + '-' + pad(currentDate.getUTCDate()) + ' ' + pad(currentDate.getUTCHours()) + ':' + pad(currentDate.getUTCMinutes()) + ':' + pad(currentDate.getUTCSeconds()) + ' Z';
		tString = '<font size="2">' + pad(currentDate.getUTCDate()) + ' ' + monthNames[currentDate.getUTCMonth()] + ' ' + currentDate.getUTCFullYear() + ' </font>'; 
                tString += pad(currentDate.getUTCHours()) + ':' + pad(currentDate.getUTCMinutes()) + ':' + pad(currentDate.getUTCSeconds()) + ' Z';
		archive_time_val.innerHTML = tString;
		if(site == 'MPAR'){
			updateRadar(currentTime);
			if(String(currentTime).slice(-1) != '0'){
				changeTime();
			}
		}
		if(initReadThreats){
			readIssuedObjects('init');
                        //readThreats('insert');
			checkActiveThreats();
			changeTime();
                        initReadThreats = false;
                }
		if(String(currentTime).slice(-1) == '0'){
			if(site != 'MPAR'){
				updateRadar(currentTime);
			}
			//if(archive){
			//	recordTime();
			//}
			checkActiveThreats();
			//loadMYRORSS();
			//loadKmeans();
			//loadWOF();
			changeTime();
		}
		checkProbLayerCount();
		getActiveCounts();
		for(var d3=0;d3<threatStore.data.items.length;d3++){
			secAll = threatStore.data.items[d3].get('valid_end') - timeCanvasNow.getAttr('time');
			if(secAll < 0){
				return;
			}
	                minDiff = parseInt(Math.floor(secAll / 60));
	                secDiff = parseInt(secAll - (minDiff * 60));
	                threatStore.data.items[d3].set('timeLeft',minDiff + ' min. ' + secDiff + ' sec.');
		}
		if(startPause){
                       	pauseSimulation();
               	}
	}

	function timerPause(){
		initArchiveTime--;
	}

	function timerNCP(){
		currentTime = parseInt((new Date()) / 1000);
		currentDate = new Date(currentTime * 1000);
		timeCanvasNow.setAttr('time',currentTime);
		moveCurrentTime();
		//tString = currentDate.getUTCFullYear() + '-' + pad(currentDate.getUTCMonth() + 1) + '-' + pad(currentDate.getUTCDate()) + ' ' + pad(currentDate.getUTCHours()) + ':' + pad(currentDate.getUTCMinutes()) + ':' + pad(currentDate.getUTCSeconds()) + ' Z';
		tString = '<font size="2">' + pad(currentDate.getUTCDate()) + ' ' + monthNames[currentDate.getUTCMonth()] + ' ' + currentDate.getUTCFullYear() + ' </font>'; 
		tString += pad(currentDate.getUTCHours()) + ':' + pad(currentDate.getUTCMinutes()) + ':' + pad(currentDate.getUTCSeconds()) + ' Z';
		archive_time_val.innerHTML = tString;
		readBackground(backgroundCheck);
		if(ncpMinutes.indexOf(currentDate.getUTCMinutes()) != -1 && currentDate.getUTCSeconds() == 0){
			updateNCPOptions();
		}
		if(getBore){
			getBoreImage();
		}
		if(openBore){
			openBoreWindow();
		}
	}

	// onmouseover event with radar tilt table    
        function changeTilt(scan,tilt,curTilt,timeVal){
		keys = getKeys(data);
		if(keys.length == 0 || maxTilt == -1 || document.getElementById(curTilt) == null || document.getElementById(lastTilt) == null){
			return;
		}
		if(curTilt.split('_')[2] > maxTilt){
			curTilt = 'td_tilt_' + maxTilt;
			lastTilt = 0;
		}
                document.getElementById(curTilt).style.background="#000099";
                document.getElementById(curTilt).style.color="#FFFFFF";
                if(lastTilt != 0 && curTilt != lastTilt){
                        document.getElementById(lastTilt).style.background="#FFFFFF";
                        document.getElementById(lastTilt).style.color="#000000";
                }
		currentTilt = curTilt;
                timeCanvasVal.setAttr('time',timeVal);
                moveSliderTime();
                lastTilt = curTilt;
        }

	function pauseSimulation(){
		clearInterval(timerInt);
		timerInt = setInterval(timerPause,1000);
		document.getElementById('pauseSim').innerHTML = '<input type="button" value="Resume Simulation" onClick="resumeSimulation();" />';
		pauseTime = parseInt((new Date()) / 1000);
	}

	function resumeSimulation(){
		startPause = false;
		clearInterval(timerInt);
		timerInt = setInterval(timer,1000);
		document.getElementById('pauseSim').innerHTML = '<input type="button" value="Pause Simulation" onClick="pauseSimulation();" />';
		resumeTime = parseInt((new Date()) / 1000) + 1;
		logTime = logTime + (resumeTime - pauseTime);
               	var url = 'recordTime.php?user=' + user + '&case=' + acase + '&site=' + site + '&inTime=' + logTime;
                var dataRequest = new XMLHttpRequest();
               	dataRequest.open('GET', url, false);
               	dataRequest.send();
	}

	function recordTime(){
		var tCheck = currentTime - parseInt(initArchiveTimeOrig);
		var url = 'recordTime.php?user=' + user + '&case=' + acase + '&site=' + site + '&inTime=' + tCheck;
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', url, false);
                dataRequest.send();
	}

	function showUHObjects(){
		now = timeCanvasVal.getAttr('time');
		uhObjectsShow.removeAllFeatures();
		if(uhObjects.features.length > 0){
                        t = document.getElementById('initOpt').value;
                        tNow = parseInt(Date.UTC(parseInt(t.slice(0,4)),parseInt(t.slice(4,6)) - 1,parseInt(t.slice(6,8)),parseInt(t.slice(8,10))));
                        for(i6=0;i6<uhObjects.features.length;i6++){
                                start = parseInt(tNow / 1000) + (parseInt(uhObjects.features[i6].attributes.STARTHR) * 3600);
                                end = parseInt(tNow / 1000) + (parseInt(uhObjects.features[i6].attributes.ENDHR) * 3600);
                                if(now >= start && now <= end){
                                        uhObjectsShow.addFeatures(uhObjects.features[i6].clone());
                                }
                        }
                }
	}

	function loadNLDN(){
                var now = timeCanvasVal.getAttr('time');
                if(now == nldnTimeLast || now > timeCanvasNow.getAttr('time')){
                        return;
                }

                var tNow = new Date(now * 1000);
                var nldnDate = String(tNow.getUTCFullYear()) + String(pad(tNow.getUTCMonth() + 1)) + String(pad(tNow.getUTCDate())) + String(pad(tNow.getUTCHours())) + String(pad(tNow.getUTCMinutes())) + String(pad(tNow.getUTCSeconds()));
                if(nldnDate == nldnDateLast){
                        return;
                }

		if(archive || analysis){
			var url = 'realtime/ewp/getNLDN.php?d=' + nldnDate + '&case=' + acase + '&site=' + site + '&archive=1';
		}
		else{
	                var url = 'realtime/ewp/getNLDN.php?d=' + nldnDate;
		}
                nldnProtocol.options.url = url;
                refreshNLDN.refresh({force: true});

                nldnDateLast = nldnDate;
                nldnTimeLast = now;
        }

	function loadLegacy(){
                var now = timeCanvasVal.getAttr('time');
                if(now == legacyTimeLast || now > timeCanvasNow.getAttr('time')){
                       	return;
                }

                var tNow = new Date(now * 1000);
                var legacyDate = String(tNow.getUTCFullYear()) + String(pad(tNow.getUTCMonth() + 1)) + String(pad(tNow.getUTCDate())) + String(pad(tNow.getUTCHours())) + String(pad(tNow.getUTCMinutes())) + String(pad(tNow.getUTCSeconds()));
                if(legacyDate == legacyDateLast){
                        return;
                }

		if(archive){
			if(showT && !showS){
                                var url = 'realtime/ewp/getLegacy.php?d=' + now + '&type=tornado&auto=0&archive=' + acase + '&site=' + site;
                       	}
                        else if(showS && !showT){
                                var url = 'realtime/ewp/getLegacy.php?d=' + now + '&type=severe&auto=0&archive=' + acase + '&site=' + site;
                       	}
                        else if(showT && showS){
                                var url = 'realtime/ewp/getLegacy.php?d=' + now + '&type=tornadosevere&auto=0&archive=' + acase + '&site=' + site;
                       	}
                       	else{
                                var url = 'realtime/ewp/blank.json';
                       	}
		}
		else{
			if(showT && !showS){
				var url = 'realtime/ewp/getLegacy.php?d=' + now + '&type=tornado&auto=0';
			}
			else if(showS && !showT){
				var url = 'realtime/ewp/getLegacy.php?d=' + now + '&type=severe&auto=0';
			}
			else if(showT && showS){
				var url = 'realtime/ewp/getLegacy.php?d=' + now + '&type=tornadosevere&auto=0';
			}
			else{
				var url = 'realtime/ewp/blank.json';
			}
		}

		legacyBack.removeAllFeatures();
                legacyProtocol.options.url = url;
                refreshLegacy.refresh({force: true});

                legacyDateLast = legacyDate;
                legacyTimeLast = now;
        }

	function loadSfcObs(){
		var now = timeCanvasVal.getAttr('time');
		if(now == obsTimeLast || now > timeCanvasNow.getAttr('time')){
                       	return;
               	}

		var tNow = new Date(now * 1000);
                var obsDate = tNow.getUTCFullYear() + pad(tNow.getUTCMonth() + 1) + pad(tNow.getUTCDate()) + pad(tNow.getUTCHours()) + '00';
		if(obsDate == obsDateLast){
			return;
		}

		var url = 'realtime/efp/obs/' + tNow.getUTCFullYear() + pad(tNow.getUTCMonth() + 1) + pad(tNow.getUTCDate()) + '/metars__obs_' + obsDate + '.txt';
		obsProtocol.options.url = url;
		refreshObs.refresh({force: true});

		obsDateLast = obsDate;
		obsTimeLast = now;
	}

	function loadSPC(){
		if(!spc.getVisibility()){
                        return;
                }

		// realtime/efp/spc.php?d=201404281200&type=CATEGORICAL&day=1
		var now = timeCanvasVal.getAttr('time');
		if(now == spcTimeLast || now > timeCanvasNow.getAttr('time')){
                        return;
                }

		var tNow = new Date(now * 1000);
		if(tNow.getUTCHours() >= 20 && tNow.getUTCHours() < 24){
			var spcDate = tNow.getUTCFullYear() + pad(tNow.getUTCMonth() + 1) + pad(tNow.getUTCDate()) + '2000';
		}
		else if(tNow.getUTCHours() >= 16 && tNow.getUTCMinutes() >= 30 && tNow.getUTCHours() < 20 || tNow.getUTCHours() > 16 && tNow.getUTCHours() < 20){
	                var spcDate = tNow.getUTCFullYear() + pad(tNow.getUTCMonth() + 1) + pad(tNow.getUTCDate()) + '1630';
		}
		else if(tNow.getUTCHours() >= 13 && tNow.getUTCHours() <= 16 && tNow.getUTCMinutes() < 30){
			var spcDate = tNow.getUTCFullYear() + pad(tNow.getUTCMonth() + 1) + pad(tNow.getUTCDate()) + '1300';
		}
		else if(tNow.getUTCHours() >= 12 && tNow.getUTCHours() < 13){
                        var spcDate = tNow.getUTCFullYear() + pad(tNow.getUTCMonth() + 1) + pad(tNow.getUTCDate()) + '1200';
                }
		else if(tNow.getUTCHours() >= 1 && tNow.getUTCHours() < 12){
                        var spcDate = tNow.getUTCFullYear() + pad(tNow.getUTCMonth() + 1) + pad(tNow.getUTCDate()) + '0100';
                }
		else{
			tNow = new Date((now - 86400) * 1000);
			var spcDate = tNow.getUTCFullYear() + pad(tNow.getUTCMonth() + 1) + pad(tNow.getUTCDate()) + '2000';
		}
                if(spcDate == spcDateLast){
                        return;
                }

		var url = 'realtime/efp/spc.php?d=' + spcDate + '&type=CATEGORICAL&day=1'
		SPCProtocol.options.url = url;
                refreshSPC.refresh({force: true});

                spcDateLast = spcDate;
                spcTimeLast = now;
	}

	function loadLightning(now){
                var tDiff = Math.abs((new Date()).getTime() - lastRequestTime);
                if(now == lightningTimeLast || now > timeCanvasNow.getAttr('time') || !showL){
                        return;
                }
                lastRequestTime = (new Date()).getTime();

                var tNow = new Date(now * 1000);
		var lightningDate = String(tNow.getUTCFullYear()) + String(pad(tNow.getUTCMonth() + 1)) + String(pad(tNow.getUTCDate())) + String(pad(tNow.getUTCHours())) + String(pad(tNow.getUTCMinutes())) + String(pad(tNow.getUTCSeconds()));
                if(lightningDate == lightningDateLast){
                        return;
                }

		lightning.removeAllFeatures();
		lightningObjects.removeAllFeatures();
               	lightningObjectsBack.removeAllFeatures();
		getActiveCounts();
                if(archive){
                        var url = 'realtime/ewp/ewpProbs.php?d=' + lightningDate + '&fcstr=' + user + '&type=lightning&block=' + showBlock + '&archive=1&' + (new Date()).getTime();
                }
		else if(analysis){
			var url = 'realtime/ewp/ewpProbs.php?d=' + lightningDate + '&fcstr=' + user + '&type=lightning&block=' + showBlock + '&archive=0&analysis=1&' + (new Date()).getTime();
		}
                else{
                       	var url = 'realtime/ewp/ewpProbs.php?d=' + lightningDate + '&fcstr=' + user + '&type=lightning&block=' + showBlock + '&archive=0';
                }
                lightningProtocol.options.url = url;
                refreshlightning.refresh({force: true});

                lightningDateLast = lightningDate;
                lightningTimeLast = now;
        }

	function loadAzShear(now){
		var tDiff = Math.abs((new Date()).getTime() - lastRequestTime);
                if(now == azShearTimeLast || now > timeCanvasNow.getAttr('time') || !showT){
                        return;
               	}
		lastRequestTime = (new Date()).getTime();

                var tNow = new Date(now * 1000);
		var azShearDate = String(tNow.getUTCFullYear()) + String(pad(tNow.getUTCMonth() + 1)) + String(pad(tNow.getUTCDate())) + String(pad(tNow.getUTCHours())) + String(pad(tNow.getUTCMinutes())) + String(pad(tNow.getUTCSeconds()));
               	if(azShearDate == azShearDateLast){
                       	return;
               	}

		azShear.removeAllFeatures();
		azShearObjects.removeAllFeatures();
               	azShearObjectsBack.removeAllFeatures();
		getActiveCounts();
		if(archive){
	               	var url = 'realtime/ewp/ewpProbs.php?d=' + azShearDate + '&fcstr=' + user + '&type=tornado&block=' + showBlock + '&archive=1&' + (new Date()).getTime();
		}
		else if(analysis){
			var url = 'realtime/ewp/ewpProbs.php?d=' + azShearDate + '&fcstr=' + user + '&type=tornado&block=' + showBlock + '&archive=0&analysis=1&' + (new Date()).getTime();
               	}
		else{
			var url = 'realtime/ewp/ewpProbs.php?d=' + azShearDate + '&fcstr=' + user + '&type=tornado&block=' + showBlock + '&archive=0';
		}
               	azShearProtocol.options.url = url;
               	refreshAzShear.refresh({force: true});

		azShearDateLast = azShearDate;
                azShearTimeLast = now;

	}

	function loadProbSevere(now){
                var tDiff = Math.abs((new Date()).getTime() - lastRequestTime);
               	if(now == probSevereTimeLast || now > timeCanvasNow.getAttr('time') && !analysis || !showS){
                        return;
               	}
                lastRequestTime = (new Date()).getTime();

                var tNow = new Date(now * 1000);
		var probSevereDate = String(tNow.getUTCFullYear()) + String(pad(tNow.getUTCMonth() + 1)) + String(pad(tNow.getUTCDate())) + String(pad(tNow.getUTCHours())) + String(pad(tNow.getUTCMinutes())) + String(pad(tNow.getUTCSeconds()));
               	if(probSevereDate == probSevereDateLast){
                       	return;
               	}

		probSevere.removeAllFeatures();
		probSevereObjects.removeAllFeatures();
               	probSevereObjectsBack.removeAllFeatures();
		getActiveCounts();
               	if(archive){
                       	var url = 'realtime/ewp/ewpProbs.php?d=' + probSevereDate + '&fcstr=' + user + '&type=severe&block=' + showBlock + '&archive=1&' + (new Date()).getTime();
               	}
		else if(analysis){
			var url = 'realtime/ewp/ewpProbs.php?d=' + probSevereDate + '&fcstr=' + user + '&type=severe&block=' + showBlock + '&archive=0&analysis=1&' + (new Date()).getTime();
               	}
               	else{
                       	var url = 'realtime/ewp/ewpProbs.php?d=' + probSevereDate + '&fcstr=' + user + '&type=severe&block=' + showBlock + '&archive=0';
               	}
               	probSevereProtocol.options.url = url;
               	refreshProbSevere.refresh({force: true});

               	probSevereDateLast = probSevereDate;
               	probSevereTimeLast = now;
       	}

	function loadWof(now){
                var tDiff = Math.abs((new Date()).getTime() - lastRequestTime);
		var tNow = new Date(now * 1000);
		if(wofTimeLast != null){
			var tLast = new Date(wofTimeLast * 1000);
		}
                if(now == wofTimeLast || now > timeCanvasNow.getAttr('time') || !showW){
                        return;
                }
		else if(wofTimeLast != null && tLast.getUTCMinutes() < 30 && tNow.getUTCMinutes() < 30 && tLast.getUTCHours() == tNow.getUTCHours()){
			return;
		}
		else if(wofTimeLast != null && tLast.getUTCMinutes() < 60 && tLast.getUTCMinutes() >= 30 && tNow.getUTCMinutes() < 60 && tNow.getUTCMinutes() >= 30 && tLast.getUTCHours() == tNow.getUTCHours()){
                        return;
                }
                lastRequestTime = (new Date()).getTime();

                var wofDate = String(tNow.getUTCFullYear()) + String(pad(tNow.getUTCMonth() + 1)) + String(pad(tNow.getUTCDate())) + String(pad(tNow.getUTCHours())) + String(pad(tNow.getUTCMinutes())) + String(pad(tNow.getUTCSeconds()));
                if(wofDate == wofDateLast){
                        return;
                }

		wofObjects.removeAllFeatures();
                wofObjectsBack.removeAllFeatures();
                if(archive || analysis){
                        var url1 = 'wof.php?d=' + wofDate + '&type=' + wofType + '&archive=1&layer=' + wofLayer;
			//var url2 = 'wof.php?d=' + wofDate + '&type=tracks&archive=1';
                }
                else{
			var url1 = 'wof.php?d=' + wofDate + '&type=' + wofType + '&archive=0&layer=' + wofLayer;
                        //var url2 = 'wof.php?d=' + wofDate + '&type=tracks&archive=0';
                }
                wofProtocol1.options.url = url1;
                refreshWof1.refresh({force: true});
		//wofProtocol2.options.url = url2;
                //refreshWof2.refresh({force: true});

                wofDateLast = wofDate;
                wofTimeLast = now;

        }

	function renderWoFTracks(feats, now, arr1, arr2){
		var lines = {};
		for(var i=0;i<feats.length;i++){
			if(feats[i].attributes.epoch >= now){
				if(!lines.hasOwnProperty(feats[i].attributes.objID)){
					lines[feats[i].attributes.objID] = {};
				}
				if(!lines[feats[i].attributes.objID].hasOwnProperty(feats[i].attributes.member)){
                                       	lines[feats[i].attributes.objID][feats[i].attributes.member] = {};
                               	}
				if(!lines[feats[i].attributes.objID][feats[i].attributes.member].hasOwnProperty(feats[i].attributes.time)){
					lines[feats[i].attributes.objID][feats[i].attributes.member][feats[i].attributes.time] = [];
                                }
				for(var j=0;j<feats[i].geometry.coordinates.length;j++){
					lines[feats[i].attributes.objID][feats[i].attributes.member][feats[i].attributes.time].push(feats[i].geometry.coordinates[j]);
				}
			}
		}
		console.log(lines);
	}

	function renderWoFObjects2(feats, now, arr1, arr2){
		return;
		// sort features by object id
		var reader = new jsts.io.WKTReader();
                var parser = new jsts.io.OpenLayersParser();
		var wofObjectsPast = {};
		var wofObjectsFuture = {};

		for(var i=0;i<feats.length;i++){
			if(feats[i].attributes.epoch >= now){
				if(!wofObjectsFuture.hasOwnProperty(feats[i].attributes.objID)){
                                        wofObjectsFuture[feats[i].attributes.objID] = [];
                                }
                                wofObjectsFuture[feats[i].attributes.objID].push(feats[i].geometry);
			}
			else{
				if(!wofObjectsPast.hasOwnProperty(feats[i].attributes.objID)){
                                        wofObjectsPast[feats[i].attributes.objID] = [];
                                }
                                wofObjectsPast[feats[i].attributes.objID].push(feats[i].geometry);
			}
		}
		for(var objID in wofObjectsPast){
			for(var i=0;i<wofObjectsPast[objID].length;i++){
				var cloneGeometry = parser.read(wofObjectsPast[objID][i]);
				if(i == 0){
					var union = cloneGeometry;
				}
				else{
	                                union = union.union(cloneGeometry);
				}
			}
			union = parser.write(union);
                        var pastRegion = new OpenLayers.Feature.Vector(union,{'color': 'rgb(100,100,100)'});
			arr1.push(pastRegion.clone());
			arr2.push(pastRegion.clone());
		}
		for(var objID in wofObjectsFuture){
                        for(var i=0;i<wofObjectsFuture[objID].length;i++){
                                var cloneGeometry = parser.read(wofObjectsFuture[objID][i]);
                                if(i == 0){
                                        var union = cloneGeometry;
                                }
                                else{
                                        union = union.union(cloneGeometry);
                                }
                        }
                        union = parser.write(union);
                        var futureRegion = new OpenLayers.Feature.Vector(union,{'color': 'rgb(255,0,0)'});
                        arr1.push(futureRegion.clone());
			arr2.push(futureRegion.clone());
                }
	}

	function renderObjects(obj, now, arr1, arr2){
		var newObj = obj;
		if(obj.attributes.data.hasOwnProperty('buffer') && obj.attributes.data['buffer'] != 0){
			var geojson_format = new OpenLayers.Format.JSON();
		       	var parser = new jsts.io.OpenLayersParser();
			var tempAttrs = geojson_format.read(JSON.stringify(obj.attributes));
			if(obj.attributes.data['bufDir'] >= 0){
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
		               	var tempObj = parser.read(obj.geometry);
		               	for(var i=0;i<clones.length;i++){
		                       	var c = parser.read(clones[i]);
		                       	tempObj = tempObj.union(c);
		               	}
		               	tempObj = parser.write(tempObj);
				console.log('buffered direction');
			}
			else{
				var tempObj = parser.read(obj.geometry);
               			tempObj = tempObj.buffer(obj.attributes.data['buffer'] * 1000); // convert to meters
               			tempObj = parser.write(tempObj);
				console.log('buffered');
			}
			var verts = tempObj.getVertices();
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
		               	tempObj = new OpenLayers.Geometry.Polygon([linearRing]);
		       	}
			var obj = new OpenLayers.Feature.Vector(tempObj,tempAttrs);
		}
		if(obj.attributes.data.hasOwnProperty('objOffsetX') && obj.attributes.data['objOffsetX'] != 0 || obj.attributes.data.hasOwnProperty('objOffsetY') && obj.attributes.data['objOffsetY'] != 0){
                       	console.log(obj.attributes.data['objOffsetX'] + ',' + obj.attributes.data['objOffsetY']);
                        obj.geometry.move(obj.attributes.data['objOffsetX']*1000,obj.attributes.data['objOffsetY']*1000);
                        console.log('moved');
                }
		var timeDiff = now - obj.attributes.data['valid_start'];
               	var iterLength = Math.floor(timeDiff / 60);
               	var addSecs2 = timeDiff - (iterLength * 60);
               	var addSecs = 0;
                var k2 = -1;
		var k3 = -1;
		//console.log(timeDiff + ',' + iterLength + ',' + addSecs2 + ',' + now + ',' + obj.attributes.data['valid_start']);
		if(iterLength < 0){
			return;
		}
               	for(var k=0;k<=(iterLength + 1);k++){
                       	if((k%5) == 0 && k != (iterLength + 1)){
				k2++;
                       	}
                       	if(k == (iterLength + 1)){
                               	addSecs = -1 * (60 - addSecs2);
                       	}
                       	var slp = (obj.attributes.data['speeds'][k2+1] - obj.attributes.data['speeds'][k2]) / 5;
                       	var y_int = obj.attributes.data['speeds'][k2] - ((k2 * 5) * slp);
                       	var speedVal = ((k + (addSecs / 60)) * slp) + y_int;
                       	slp = (obj.attributes.data['spd'][k2+1] - obj.attributes.data['spd'][k2]) / 5;
                       	y_int = obj.attributes.data['spd'][k2] - ((k2 * 5) * slp);
                       	var spdUVal = ((k + (addSecs / 60)) * slp) + y_int;
                       	slp = (obj.attributes.data['dir'][k2+1] - obj.attributes.data['dir'][k2]) / 5;
                       	y_int = obj.attributes.data['dir'][k2] - ((k2 * 5) * slp);
                       	var dirUVal = ((k + (addSecs / 60)) * slp) + y_int;

                       	if(obj.attributes.data['dirs'][k2+1] >= 270 && obj.attributes.data['dirs'][k2] <= 90 || obj.attributes.data['dirs'][k2] >= 270 && obj.attributes.data['dirs'][k2+1] <= 90){
                               	angDiff = (obj.attributes.data['dirs'][k2] - obj.attributes.data['dirs'][k2+1]);
                               	if(angDiff < 0){
                                       	angDiff = (360 + angDiff) * -1;
                               	}
                               	else{
                                       	angDiff = 360 - angDiff;
                               	}
                               	slp = angDiff / 5;
                               	y_int = obj.attributes.data['dirs'][k2] - ((k2 * 5) * slp);
                               	var dirVal = ((k + (addSecs / 60)) * slp) + y_int;
                               	if(dirVal >= 360){
                                       	dirVal = dirVal - 360;
                               	}
                               	else if(dirVal < 0){
                                       	dirVal = dirVal + 360;
                               	}
                       	}
                       	else{
                               	slp = (obj.attributes.data['dirs'][k2+1] - obj.attributes.data['dirs'][k2]) / 5;
                               	y_int = obj.attributes.data['dirs'][k2] - ((k2 * 5) * slp);
                               	dirVal = ((k + (addSecs / 60)) * slp) + y_int;
                       	}
                       	if(k == 0){
                               	var dirValLast = dirVal;
                       	}
                       	var distance = 60 * speedVal * 0.514444444;
                       	var x_dis2 = 60 * spdUVal * 0.514444444;
                       	if(k == (iterLength + 1)){
                               	distance = addSecs * speedVal * 0.514444444;
                               	x_dis2 = addSecs * spdUVal * 0.514444444;
                       	}
                       	var x_dis = distance * Math.cos((270 - dirVal) * Math.PI / 180);
                       	var y_dis = distance * Math.sin((270 - dirVal) * Math.PI / 180);
                       	var y_dis2 = distance * Math.tan((dirUVal) * Math.PI / 180);
                       	obj.geometry.move(x_dis,y_dis);
                       	var nowPoint = obj.geometry.getCentroid();
                       	obj.geometry.rotate((dirValLast - dirVal),nowPoint);
			if(obj.attributes.data['prediction'] != 'persistence'){
                       		obj.geometry.rotate(-1 * (270 - dirValLast),nowPoint);
	                       	var verts = obj.geometry.getVertices();
	                       	var coords = new Array();
	                       	for(var j=0;j<verts.length;j++){
	                               	var dir = Math.atan2(verts[j].y - nowPoint.y,verts[j].x - nowPoint.x);
	                               	var x = (Math.cos(dir) * (x_dis2));
	                               	var y = (Math.sin(dir) * (y_dis2));
	                               	verts[j].move(x,y);
	                               	coords.push(verts[j]);
	                       	}
	                       	var attrs = obj.attributes;
	                       	var linearRing = new OpenLayers.Geometry.LinearRing(coords);
				var geom = new OpenLayers.Geometry.Polygon([linearRing]);

	                       	newObj = new OpenLayers.Feature.Vector(geom,attrs);
	                       	newObj.geometry.rotate((270 - dirValLast),nowPoint);
			}
			else{
				newObj = obj.clone();
			}
                       	dirValLast = dirVal;
               	}
		arr1.push(newObj);
		arr2.push(newObj.clone());
	}

	function checkProbLayerCount(){
		if(probSevere.features.length == 0){
                        probSevereObjects.removeAllFeatures();
                        probSevereObjectsBack.removeAllFeatures();
                }
		if(azShear.features.length == 0){
                        azShearObjects.removeAllFeatures();
                       	azShearObjectsBack.removeAllFeatures();
                }
		if(lightning.features.length == 0){
                       	lightningObjects.removeAllFeatures();
                        lightningObjectsBack.removeAllFeatures();
                }
		//if(wof2.features.length == 0){
		//	wofTracks.removeAllFeatures();
                //        wofTracksBack.removeAllFeatures();
		//}
		if(wof1.features.length == 0){
                        wofObjects.removeAllFeatures();
                        wofObjectsBack.removeAllFeatures();
                }

	}

	function loadEFPNSSL(){
		if(!nsslOutlooks.getVisibility()){
			return;
		}

		var now = timeCanvasVal.getAttr('time');
                var tNow = new Date(now * 1000);

		var nsslDate = tNow.getUTCFullYear() + pad(tNow.getUTCMonth() + 1) + pad(tNow.getUTCDate()) + pad(tNow.getUTCHours()) + '00';
		if(nsslDate == nsslDateLast){
			return;
		}

		var url = 'realtime/efp/efpProbs.php?d=' + nsslDate + '&type=svr' + nsslPeriod + '&org=nssl'
                NSSLProtocol.options.url = url;
                refreshNSSL.refresh({force: true});

		nsslDateLast = nsslDate;
	}

	function loadEFPSPCTorn(){
                if(!SPCTornOutlooks.getVisibility()){
                        return;
                }

                var now = timeCanvasVal.getAttr('time');
                var tNow = new Date(now * 1000);

                var spcTornDate = tNow.getUTCFullYear() + pad(tNow.getUTCMonth() + 1) + pad(tNow.getUTCDate()) + pad(tNow.getUTCHours()) + '00';
                if(spcTornDate == spcTornDateLast){
                        return;
                }

                var url = 'realtime/efp/efpProbs.php?d=' + spcTornDate + '&type=torn&org=spc'
                SPCTornProtocol.options.url = url;
                refreshSPCTorn.refresh({force: true});

                spcTornDateLast = spcTornDate;
        }

	function loadEFPSPCTorn1hr(){
                if(!SPCTorn1hrOutlooks.getVisibility()){
                        return;
                }

                var now = timeCanvasVal.getAttr('time');
                var tNow = new Date(now * 1000);

                var spcTorn1hrDate = tNow.getUTCFullYear() + pad(tNow.getUTCMonth() + 1) + pad(tNow.getUTCDate()) + pad(tNow.getUTCHours()) + '00';
                if(spcTorn1hrDate == spcTorn1hrDateLast){
                        return;
                }

                var url = 'realtime/efp/efpProbs.php?d=' + spcTorn1hrDate + '&type=torn1hr&org=spc'
                SPCTorn1hrProtocol.options.url = url;
                refreshSPCTorn1hr.refresh({force: true});

                spcTorn1hrDateLast = spcTorn1hrDate;
        }

	function loadEFPSPCHail(){
                if(!SPCHailOutlooks.getVisibility()){
                        return;
                }

                var now = timeCanvasVal.getAttr('time');
                var tNow = new Date(now * 1000);

                var spcHailDate = tNow.getUTCFullYear() + pad(tNow.getUTCMonth() + 1) + pad(tNow.getUTCDate()) + pad(tNow.getUTCHours()) + '00';
                if(spcHailDate == spcHailDateLast){
                        return;
                }

                var url = 'realtime/efp/efpProbs.php?d=' + spcHailDate + '&type=hail&org=spc'
                SPCHailProtocol.options.url = url;
                refreshSPCHail.refresh({force: true});

                spcHailDateLast = spcHailDate;
        }

	function loadEFPSPCWind(){
                if(!SPCWindOutlooks.getVisibility()){
                        return;
                }

                var now = timeCanvasVal.getAttr('time');
                var tNow = new Date(now * 1000);

                var spcWindDate = tNow.getUTCFullYear() + pad(tNow.getUTCMonth() + 1) + pad(tNow.getUTCDate()) + pad(tNow.getUTCHours()) + '00';
                if(spcWindDate == spcWindDateLast){
                        return;
                }

                var url = 'realtime/efp/efpProbs.php?d=' + spcWindDate + '&type=wind&org=spc'
                SPCWindProtocol.options.url = url;
                refreshSPCWind.refresh({force: true});

                spcWindDateLast = spcWindDate;
        }
