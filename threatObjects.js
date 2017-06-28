	/*

        Copyright (c) 2014 Cooperative Institute for Mesoscale Meteorological Studies (CIMMS) and the University of Oklahoma

        Author:         Dr. Chris Karstens
        Email:          chris.karstens@noaa.gov
        Description:    Contains the following:
				1.  threat object activation
				2.  threat object deactivation 
				3.  threat object deletion (development version only)
				4.  threat object highlighting in non-timeline header table (when active)
				5.  threat object unhightlighting in non-timeline header table (when active)
				6.  threat object modification function
				7.  threat object initialization
				8.  threat object resetting
				9.  read threat objects from server
				10. function for calculating anisotropic Gaussian (deprecated)

        */

	// activate threat button
	function activateThreat(){
		if(modifyFeature == null || modifyFeature.feature == null){
	                alert('Changes cannot be made while previewing threat evolution');
	                //time_slider.setValue(0);
			return;
	        }
		var proceed = confirm("Activate Currently Selected Threat?");
		if(!proceed){
			return;
		}
		deletePendingRecords();
		updateThreat = false;
		threat = document.getElementById("threat1").value;
		console.log(modifyFeature.feature.attributes.data);
		newThreat = modifyFeature.feature.clone();
		newThreat.attributes.data['issue'] = currentTime;
		if(newThreat.attributes.data.modified['automated'] == 3){
			if(newThreat.attributes.data.modified['object'] == 1){
				newThreat.attributes.data.modified['automated'] = 0;
			}
			else{
				newThreat.attributes.data.modified['automated'] = 2;
			}
		}
		if(newThreat.attributes.data.modified['object'] == 1){
			newThreat.attributes.data['objOffsetX'] = 0;
			newThreat.attributes.data['objOffsetY'] = 0;
		}
		if('prob_start' in newThreat.attributes.data){
			newThreat.attributes.data['prob_start'] = newThreat.attributes.data['valid_start'];
		}
		newThreat.attributes.data['site'] = site;
		if(newThreat.attributes.data['automated'] == 1){
			if(newThreat.attributes.data.modified['object'] == 1){
				// decouple from automation if object geometry is modified
				newThreat.attributes.data['automated'] = 0;
			}
			else{
				// will allow changes to persist through object lifetime
				newThreat.attributes.data['automated'] = 2;
			}
		}
		txt = document.getElementById('discussion');
		if(txt.value != 'Recognized text will be copied here (or type manually).' && txt.value != 'Type discussion here.' && txt.value != ''){
			var disc = txt.value;
                        var s = disc.split('"');
                        if(s.length > 1){
                                disc = s.join('');
                        }
                        var s = disc.split("'");
                        if(s.length > 1){
                                disc = s.join('');
                        }
			var s = disc.split("\n");
                        if(s.length > 1){
                                disc = s.join(' ');
                        }
			newThreat.attributes.data['discussion'] = disc;
			newThreat.attributes.data.modified['discussion'] = 1;
		}
		else{
			newThreat.attributes.data['discussion'] = '';
		}
		/*
		txt = document.getElementById('actions');
                if(txt.value != 'Type actions here.' && txt.value != ''){
                        var disc = txt.value;
                        var s = disc.split('"');
                        if(s.length > 1){
                                disc = s.join('');
                        }
                        var s = disc.split("'");
                        if(s.length > 1){
                                disc = s.join('');
                        }
                        var s = disc.split("\n");
                        if(s.length > 1){
                                disc = s.join(' ');
                        }
                        newThreat.attributes.data['elements']['actions'] = disc;
                        newThreat.attributes.data.modified['actions'] = 1;
                }
                else{
                        newThreat.attributes.data['elements']['actions'] = '';
                }

		txt = document.getElementById('impacts');
                if(txt.value != 'Type impacts here.' && txt.value != ''){
                        var disc = txt.value;
                        var s = disc.split('"');
                        if(s.length > 1){
                                disc = s.join('');
                        }
                        var s = disc.split("'");
                        if(s.length > 1){
                                disc = s.join('');
                        }
                        var s = disc.split("\n");
                        if(s.length > 1){
                                disc = s.join(' ');
                        }
                        newThreat.attributes.data['elements']['impacts'] = disc;
                        newThreat.attributes.data.modified['impacts'] = 1;
                }
                else{
                        newThreat.attributes.data['elements']['impacts'] = '';
                }
		*/

		// update default motion vector attributes
		updates++;
		weight = 1 / updates;
		for(var k=0;k<newThreat.attributes.data['dirs'].length;k++){
			default_dirs[k] = Math.round((newThreat.attributes.data['dirs'][k] * weight) + (default_dirs[k] * (1 - weight)));
			default_dirs_orig[k] = Math.round((newThreat.attributes.data['dirs_orig'][k] * weight) + (default_dirs_orig[k] * (1 - weight)));
			default_speeds[k] = Math.round((newThreat.attributes.data['speeds'][k] * weight) + (default_speeds[k] * (1 - weight)));
		}

		newThreat.geometry.transform(proj2,proj);
		geoJsonParser = new OpenLayers.Format.GeoJSON();
		geoJson = geoJsonParser.write(newThreat);
		link = 'write_threats.php?threat=' + threat + '&id=' + newThreat.attributes.data['id'] + '&case=' + acase + '&user=' + user + '&geojson=' + geoJson + '&inputTime=' +  newThreat.attributes.data['issue'];
		var dataRequest = new XMLHttpRequest();
		dataRequest.open('GET', link, false);
		dataRequest.send();

		var link = 'writeValidProbs.php?user=' + user + '&type=allow&inputTime=' + timeCanvasVal.getAttr('time') + '&id=' + newThreat.attributes.data['id'] + '&threat=' + newThreat.attributes.data['types'][0].slice(0,-1) + '&archive=' + acase;
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();

		newThreat.geometry.transform(proj,proj2);
		//readThreats('insert');
		azShearTimeLast = 0;
		azShearDateLast = 0;
		probSevereTimeLast = 0;
               	probSevereDateLast = 0;
		lightningTimeLast = 0;
		lightningDateLast = 0;
		readIssuedObjects();
		checkActiveThreats();
		clearGridPreview();
		unloadConfigPanel();
	}

	// deactivate threat button
	function deactivateThreat(evIssue, evID){
		if(!linkObjects){
			var proceed = confirm("Deactivate Object #" + evID + "?");
	                if(!proceed){
	                        return;
	                }
		}
		var gridPanel = Ext.getCmp('gridPanel');
		var allFeats = [];
		allFeats = allFeats.concat(probSevere.features, azShear.features, lightning.features);
		if(evID != null){
			for(var k3=0;k3<threatStore.data.items.length;k3++){
		                if(threatStore.data.items[k3].get('issue') == evIssue && threatStore.data.items[k3].get('eventID') == evID){
					var index = k3;
					break;
				}
			}
			for(var j=0;j<allFeats.length;j++){
                                if(allFeats[j].attributes.data['issue'] == evIssue && allFeats[j].attributes.data['id'] == evID){
					var index2 = j;
                                        var newThreat = allFeats[j].clone();
                                       	break;
                               	}
                        }
		}
		else{
	                var selection = gridPanel.getSelectionModel();
	                for(var i=0;i<gridPanel.store.getCount();i++){
	                       	if(selection.isSelected(i)){
					var index = i;
					for(var j=0;j<allFeats.length;j++){
						if(allFeats[j].attributes.data['issue'] == gridPanel.store.getAt(i).data.issue && allFeats[j].attributes.data['id'] == gridPanel.store.getAt(i).data.id){
							var index2 = j;
	                		               	var newThreat = allFeats[j].clone();
	                               			break;
						}
					}
					break;
				}
			}
		}
		if(newThreat.attributes.data['automated'] == 0){
			// purely human generated objects
			var threat = newThreat.attributes.data['types'][0];
	                newThreat.attributes.data['valid_end'] = currentTime - 1;
			allFeats[index2].attributes.data['valid_end'] = currentTime - 1;
	                newThreat.geometry.transform(proj2,proj);
	                geoJsonParser = new OpenLayers.Format.GeoJSON();
	                geoJson = geoJsonParser.write(newThreat);
	                link = 'write_threats.php?threat=' + threat + '&id=' + newThreat.attributes.data['id'] + '&case=' + acase + '&user=' + user + '&geojson=' + geoJson + '&inputTime=' +  currentTime + '&state=deactivate';
	                var dataRequest = new XMLHttpRequest();
	                dataRequest.open('GET', link, false);
	                dataRequest.send();

			var link = 'writeValidProbs.php?user=' + user + '&type=block&inputTime=' + timeCanvasVal.getAttr('time') + '&id=' + newThreat.attributes.data['id'] + '&threat=' + newThreat.attributes.data['types'][0].slice(0,-1) + '&archive=' + acase;
                       	var dataRequest = new XMLHttpRequest();
                       	dataRequest.open('GET', link, false);
                       	dataRequest.send();

			newThreat.geometry.transform(proj,proj2);
			try{
				threatStore.remove(gridPanel.store.getAt(index));
				for(var i=0;i<records.length;i++){
					if(records[i].eventID == newThreat.attributes.data['id'] && records[i].issue == newThreat.attributes.data['issue']){
				                records.splice(i,1);
					}
				}
			}
			catch(err){}
		}
		else{
			// automated or partially automated objects
			// put on block-list
			if(newThreat.attributes.data['automated'] == 1){
				var bTime = newThreat.attributes.data['valid_start'];
			}
			else{
				var bTime = timeCanvasVal.getAttr('time');
			}
			var link = 'writeValidProbs.php?user=' + user + '&type=block&inputTime=' + bTime + '&id=' + newThreat.attributes.data['id'] + '&threat=' + newThreat.attributes.data['types'][0].slice(0,-1) + '&archive=' + acase;
	                var dataRequest = new XMLHttpRequest();
	                dataRequest.open('GET', link, false);
	                dataRequest.send();

			var geojson_format = new OpenLayers.Format.JSON();
	                allFeats[index2].attributes.data['allow'] = geojson_format.read(0);
	                probSevereObjects.redraw();
	                azShearObjects.redraw();
			lightningObjects.redraw();
		}
		document.getElementById('deactivate').innerHTML = '';
		//readThreats();
		azShearTimeLast = 0;
               	azShearDateLast = 0;
               	probSevereTimeLast = 0;
               	probSevereDateLast = 0;
		lightningTimeLast = 0;
		lightningDateLast = 0;
		readIssuedObjects();
                checkActiveThreats();
                drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
		changeTime();
		//alert('Object Deactivated');
	}

	// activate automated object below/above auto-object prob threshold
	function reactivateThreat(evIssue, evID){
		// put on allow-list
		var allFeats = [];
                allFeats = allFeats.concat(probSevere.features, azShear.features, lightning.features);
		for(var j=0;j<allFeats.length;j++){
                       	if(allFeats[j].attributes.data['issue'] == evIssue && allFeats[j].attributes.data['id'] == evID){
                               	var index2 = j;
                               	var newThreat = allFeats[j].clone();
                               	break;
                       	}
               	}
		var link = 'writeValidProbs.php?user=' + user + '&type=allow&inputTime=' + newThreat.attributes.data['valid_start'] + '&id=' + newThreat.attributes.data['id'] + '&threat=' + newThreat.attributes.data['types'][0].slice(0,-1) + '&archive=' + acase;
		var dataRequest = new XMLHttpRequest();
		dataRequest.open('GET', link, false);
		dataRequest.send();

		var geojson_format = new OpenLayers.Format.JSON();
		allFeats[index2].attributes.data['allow'] = geojson_format.read(1);
		azShearTimeLast = 0;
                azShearDateLast = 0;
                probSevereTimeLast = 0;
                probSevereDateLast = 0;
		lightningTimeLast = 0;
		lightningDateLast = 0;
		changeTime();

		alert('Object Activated');
	}

	// delete threat button
	function deleteThreat(){
		var proceed = confirm("Delete Currently Selected Threat?");
               	if(!proceed){
                       	return;
               	}
		var gridPanel = Ext.getCmp('gridPanel');
		var selection = gridPanel.getSelectionModel();
		for(i=0;i<gridPanel.store.getCount();i++){
			if(selection.isSelected(i)){
				fname = gridPanel.store.getAt(i).data.fname;
		                link = 'delete_threat.php?threat=' + fname + '&case=' + acase + '&user=' + user;
		                var dataRequest = new XMLHttpRequest();
		                dataRequest.open('GET', link, false);
		                dataRequest.send();
				threatStore.remove(gridPanel.store.getAt(i));
				//knobs[i][0].remove();
	                       	//knobs[i][1].remove();
	                       	//knobs.splice(i,1);
	                       	records.splice(i,1);
			}
		}
		readThreats();
		drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
	}

	// delete all threat objects for user/case
	function deleteAllThreats(){
		var proceed = confirm("Delete all of your threats for this case?");
               	if(!proceed){
                       	return;
               	}
		var gridPanel = Ext.getCmp('gridPanel');
               	var selection = gridPanel.getSelectionModel();
		link = 'delete_all_threats.php?case=' + acase + '&user=' + user;
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();
               	for(i=0;i<gridPanel.store.getCount();i++){
                       	threatStore.remove(gridPanel.store.getAt(i));
                       	knobs[i][0].remove();
                       	knobs[i][1].remove();
                       	knobs.splice(i,1);
                       	records.splice(i,1);
               	}
               	readThreats();
               	drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
		//alert(dataRequest.responseText);
	}

	// determine new motion uncertainty metrics using past positions of object
	// alternative method - not used
	function getMotU(featID,newX,newY,curD,curS){
                xu = [];
                yu = [];
                for(f=0;f<activeThreatClones.features.length;f++){
                        if(featID == activeThreatClones.features[f].attributes.data['id']){
                                xu.push(activeThreatClones.features[f].geometry.getCentroid().x);
                                yu.push(activeThreatClones.features[f].geometry.getCentroid().y);
                        }
                }
		//xu.push(newX);
		//yu.push(newY);
                if(xu.length == 1){
			newDirU = curD;
                        newSpeedU = curS;
		}
		else{
	                xDiff = xu.max() - xu.min();
	                yDiff = yu.max() - yu.min();
	                newDirU = du.max() - du.min();
	                newSpeedU = su.max() - su.min();
			if(newDirU > 180){
				newDirU = 360 - newDirU;
			}
		}
                return {
			dir: newDirU, 
			spd: newSpeedU
		};
	}

	// select threat when highlighted in list
	function highlightThreat(featIssue,featID,clickType,prd){
		if(bufClone != null){
			threatPanel = Ext.getCmp('threatPanel');
                        threatPanel.show();
			return;
		}

		var allFeats = [];
		if(prd != 'persistence'){
	                //allFeats = allFeats.concat(probSevere.features, azShear.features, lightning.features);
		}
		else{
			//allFeats = allFeats.concat(probSevereObjects.features, azShearObjects.features, lightningObjects.features);
		}
		allFeats = allFeats.concat(probSevere.features, azShear.features, lightning.features);
		if(clickType == 'single'){
			for(var i=0;i<allFeats.length;i++){
	                        if(featIssue == allFeats[i].attributes.data['issue'] && featID == allFeats[i].attributes.data['id']){
	                                var idx = i;
	                                var fidx = allFeats[i].attributes.data['id'];
	                                var panPoint = allFeats[idx].geometry.getCentroid();
	                                var lonlat = new OpenLayers.LonLat(panPoint.x,panPoint.y);
	                                map.panTo(lonlat);
	                                break;
	                        }
	                }
			timeCanvasVal.setAttr('time',timeValTilt);
                        moveSliderTime();
                        changeTime();
			return;
		}
		for(var i=0;i<threat_area.features.length;i++){
			if(threat_area.features[i].attributes.data && threat_area.features[i].attributes.data['issue'] == featIssue && threat_area.features[i].attributes.data['id'] == featID){
				unloadConfigPanel();				
				//goToNow();
				return;
			}
		}
		if(threat_area.features.length > 0){
			alert('Cannot modify more than one object at a time.');
			return;
		}
		if(currentTilt.split('_')[2] != 0){
			alert('Currently, PHI threat object updates are not permitted on elevations scans other than base scans.  Mouse-over the base elevation scan, and try again.');
			return;
		}

		//motU = getMotU(fidx);
		//alert(motU.dir + ',' + motU.spd);

		// calculate time-based threat object attributes
		for(var f=(allFeats.length - 1);f>=0;f--){
			if(featIssue == allFeats[f].attributes.data['issue'] && featID == allFeats[f].attributes.data['id']){
				modifyFeature.deactivate();
				updateThreat = false;
				if(document.getElementById('gridType') != null){
					document.getElementById('gridType').selectedIndex = 0;
					gridIndex = 0;
				}
				var clone = allFeats[f].clone();
				//modifiedCentroid = clone.geometry.getCentroid();
				startPoint = clone.geometry.getCentroid();
				//interpolateSwath(clone,clone.clone());
				var timeDiff = timeCanvasVal.getAttr('time') - clone.attributes.data['valid_start'];
				var timeDiff2 = timeCanvasVal.getAttr('time') - clone.attributes.data['valid_start'];
				if('prob_start' in clone.attributes.data){
					var timeDiff2 = timeCanvasVal.getAttr('time') - clone.attributes.data['prob_start'];
				}
				var geojson_format = new OpenLayers.Format.JSON();
				//clone.attributes.data['valid_start'] = parseInt(geojson_format.read(parseInt(scans[scans.length - 1][0].split('_')[1])));
				//clone.attributes.data['valid_end'] = parseInt(geojson_format.read(parseInt(scans[scans.length - 1][0].split('_')[1]) + (60 * parseInt(clone.attributes.data['duration']))));
				clone.attributes.data['allow'] = geojson_format.read(1);
				clone.attributes.data['user'] = user;
				clone.attributes.data['initiated'] = currentTime;
				var probs = [];
				var speeds = [];
				var dirs = [];
				var dirs_orig = [];
				var dir = [];
				var spd = [];
				var iterLength = Math.floor(timeDiff / 300);
				var addSecs = timeDiff - (iterLength * 300);
				var fraction = 300 / addSecs;
				var iterLength2 = Math.floor(timeDiff2 / 300);
                                var addSecs2 = timeDiff2 - (iterLength2 * 300);
                                var fraction2 = 300 / addSecs2;
				// interpolate time-based attributes (for now)
				// later, this will need to fill with auto-generated data, perhaps via jquery
				for(var i2=0;i2<clone.attributes.data['probs'][0].length;i2++){
					if((i2 + iterLength2) < (clone.attributes.data['probs'][0].length - 1)){
						if(clone.attributes.data['prediction'] != 'persistence'){
							probs.push(clone.attributes.data['probs'][0][i2 + iterLength2] + ((clone.attributes.data['probs'][0][i2 + iterLength2 + 1] - clone.attributes.data['probs'][0][i2 + iterLength2]) / fraction2));
							spd.push(clone.attributes.data['spd'][i2 + iterLength] + ((clone.attributes.data['spd'][i2 + iterLength + 1] - clone.attributes.data['spd'][i2 + iterLength]) / fraction));
	                                                dir.push(clone.attributes.data['dir'][i2 + iterLength] + ((clone.attributes.data['dir'][i2 + iterLength + 1] - clone.attributes.data['dir'][i2 + iterLength]) / fraction));
						}
						else{
							probs.push(clone.attributes.data['probs'][0][i2]);
                                                        spd.push(clone.attributes.data['spd'][i2]);
                                                        dir.push(clone.attributes.data['dir'][i2]);
						}
						speeds.push(clone.attributes.data['speeds'][i2 + iterLength] + ((clone.attributes.data['speeds'][i2 + iterLength + 1] - clone.attributes.data['speeds'][i2 + iterLength]) / fraction));
						if(clone.attributes.data['dirs'][i2+1] >= 270 && clone.attributes.data['dirs'][i2] <= 90 || clone.attributes.data['dirs'][i2] >= 270 && clone.attributes.data['dirs'][i2+1] <= 90){
							var angDiff = (clone.attributes.data['dirs'][i2] - clone.attributes.data['dirs'][i2+1]);
							if(angDiff < 0){
								angDiff = (360 + angDiff) * -1;
							}
							else{
								angDiff = 360 - angDiff;
							}
							var slp = angDiff / 5;
							var y_int = tempDirs[j] - ((j * 5) * slp);
							var newDirs = (i * slp) + y_int;
							if(newDirs >= 360){
								newDirs = newDirs - 360;
							}
							else if(newDirs < 0){
								newDirs = newDirs + 360;
							}
							var newDirsOrig = newDirs;
						}
						else{
							var newDirs = clone.attributes.data['dirs'][i2 + iterLength] + ((clone.attributes.data['dirs'][i2 + iterLength + 1] - clone.attributes.data['dirs'][i2 + iterLength]) / fraction);
							var newDirsOrig = clone.attributes.data['dirs_orig'][i2 + iterLength] + ((clone.attributes.data['dirs_orig'][i2 + iterLength + 1] + clone.attributes.data['dirs_orig'][i2 + iterLength]) / fraction);
						}
						dirs.push(Math.round(newDirs));
						dirs_orig.push(Math.round(newDirsOrig));

						dirsLast = dirs[dirs.length - 1];
						speedLast = speeds[speeds.length - 1];
						dirsOrigLast = dirs_orig[dirs_orig.length - 1];
						dirLast = dir[dir.length - 1];
						spdLast = spd[spd.length - 1];
					}
					else if((i2 + iterLength2) == (clone.attributes.data['probs'][0].length - 1)){
						//newData['probs'].push(clone.attributes.data['probs'][i2 + iterLength] + ((clone.attributes.data['probs'][i2 + iterLength] - 50) / fraction));
						probs.push((clone.attributes.data['probs'][0][i2 + iterLength2] + 0) / 2);
						speeds.push(speedLast);
						dirs.push(dirsLast);
						dirs_orig.push(dirsOrigLast);
						spd.push(spdLast);
						dir.push(dirLast);
					}
					else{
						probs.push(0);
						speeds.push(speedLast);
						dirs.push(dirsLast);
						dirs_orig.push(dirsOrigLast);
						spd.push(spdLast);
						dir.push(dirLast);
					}
				}

				clone.attributes.data['centers'] = geojson_format.read(JSON.stringify({}));
                                clone.attributes.data['probs'] = geojson_format.read(JSON.stringify([probs]));
                                clone.attributes.data['speeds'] = geojson_format.read(JSON.stringify(speeds));
                                clone.attributes.data['dirs'] = geojson_format.read(JSON.stringify(dirs));
                                clone.attributes.data['dirs_orig'] = geojson_format.read(JSON.stringify(dirs_orig));
                                clone.attributes.data['spd'] = geojson_format.read(JSON.stringify(spd));

				if(bufClone == null){
					bufClone = clone.geometry.clone();
					bufCloneTime = clone.attributes.data['valid_start'];
				}

				// swap attributes for rendering
				var swap = false;
				if(clone.attributes.data['automated'] == 0){
					var pred = clone.attributes.data['prediction'];
					clone.attributes.data['prediction'] = 'persistence';
					swap = true;
				}

				var arr1 = [];
			        var arr2 = [];
			        renderObjects(clone, now, arr1, arr2);
				clone = arr1[0];

				clone.attributes.data['valid_start'] = parseInt(geojson_format.read(parseInt(scans[scans.length - 1][0].split('_')[1])));
                               	clone.attributes.data['valid_end'] = parseInt(geojson_format.read(parseInt(scans[scans.length - 1][0].split('_')[1]) + (60 * parseInt(clone.attributes.data['duration']))));
				if(swap){
					clone.attributes.data['prediction'] = pred;
				}

				// null out variables
				if(clone.attributes.data.ProbSevere.hasOwnProperty('probInterp')){
					clone.attributes.data.ProbSevere['probInterp'] = null;
				}
				if(clone.attributes.data.ProbSevere.hasOwnProperty('probHailInterp')){
                                        clone.attributes.data.ProbSevere['probHailInterp'] = null;
                                }
				if(clone.attributes.data.ProbSevere.hasOwnProperty('probWindInterp')){
                                        clone.attributes.data.ProbSevere['probWindInterp'] = null;
                                }
				if(clone.attributes.data.ProbSevere.hasOwnProperty('probTorInterp')){
                                        clone.attributes.data.ProbSevere['probTorInterp'] = null;
                                }
				if(clone.attributes.data.hasOwnProperty('peakShearVal')){
                                        clone.attributes.data.ProbSevere['peakShearVal'] = null;
                                }
				if(clone.attributes.data.hasOwnProperty('peakShearProb')){
                                        clone.attributes.data['peakShearProb'] = null;
                                }

				//if(bufClone == null){
                                //        bufClone = clone.geometry.clone();
                               	//}

				/*
				//if(clone.attributes.data['prediction'] != 'persistence'){
					var k2 = -1;
	                                var iterLength = Math.floor(timeDiff / 60);
	                                var addSecs2 = timeDiff - (iterLength * 60);
	                                var addSecs = 0;
	                                for(var k=0;k<=(iterLength + 1);k++){
	                                        if((k%5) == 0 && k != (iterLength + 1)){
	                                                k2++;
	                                        }
	                                        if(k == (iterLength + 1)){
	                                                addSecs = -1 * (60 - addSecs2);
	                                        }
	                                        var slp = (clone.attributes.data['speeds'][k2+1] - clone.attributes.data['speeds'][k2]) / 5;
	                                        var y_int = clone.attributes.data['speeds'][k2] - ((k2 * 5) * slp);
	                                        var speedVal = ((k + (addSecs / 60)) * slp) + y_int;
	                                        slp = (clone.attributes.data['spd'][k2+1] - clone.attributes.data['spd'][k2]) / 5;
	                                        y_int = clone.attributes.data['spd'][k2] - ((k2 * 5) * slp);
	                                        var spdUVal = ((k + (addSecs / 60)) * slp) + y_int;
	                                        slp = (clone.attributes.data['dir'][k2+1] - clone.attributes.data['dir'][k2]) / 5;
	                                        y_int = clone.attributes.data['dir'][k2] - ((k2 * 5) * slp);
	                                        var dirUVal = ((k + (addSecs / 60)) * slp) + y_int;
                
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
	                                                var dirVal = ((k + (addSecs / 60)) * slp) + y_int;
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
	                                                var dirValLast = dirVal;
	                                        }
	                                        var distance = 60 * speedVal * 0.514444444;
	                                        if(k == (iterLength + 1)){
	                                                distance = addSecs * speedVal * 0.514444444;
	                                        }
	                                        var x_dis = distance * Math.cos((270 - dirVal) * Math.PI / 180);
	                                        var y_dis = distance * Math.sin((270 - dirVal) * Math.PI / 180);
	                                        clone.geometry.move(x_dis,y_dis);
	                                        dirValLast = dirVal;
	                                }
				//}
				*/

				/*
				var k2 = -1;
				var k3 = 0;
				var iterLength = Math.floor(timeDiff / 60);
		                var addSecs2 = timeDiff - (iterLength * 60);
		                var addSecs = 0;
				for(var k=0;k<=(iterLength + 1);k++){
					if((k%5) == 0 && k != (iterLength + 1)){
		                                k2++;
		                        }
					if(clone.attributes.data['prediction'] != 'persistence' && (k%5) == 0 && k != (iterLength + 1)){
						k3++;
					}
		                        if(k == (iterLength + 1)){
		                                addSecs = -1 * (60 - addSecs2);
        		                }
		                        var slp = (clone.attributes.data['speeds'][k2+1] - clone.attributes.data['speeds'][k2]) / 5;
		                        var y_int = clone.attributes.data['speeds'][k2] - ((k2 * 5) * slp);
		                        var speedVal = ((k + (addSecs / 60)) * slp) + y_int;
		                        slp = (clone.attributes.data['spd'][k2+1] - clone.attributes.data['spd'][k2]) / 5;
		                        y_int = clone.attributes.data['spd'][k2] - ((k2 * 5) * slp);
		                        var spdUVal = ((k + (addSecs / 60)) * slp) + y_int;
		                        slp = (clone.attributes.data['dir'][k2+1] - clone.attributes.data['dir'][k2]) / 5;
		                        y_int = clone.attributes.data['dir'][k2] - ((k2 * 5) * slp);
		                        var dirUVal = ((k + (addSecs / 60)) * slp) + y_int;
		
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
		                                var dirVal = ((k + (addSecs / 60)) * slp) + y_int;
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
		                                var dirValLast = dirVal;
		                        }
		                        var distance = 60 * speedVal * 0.514444444;
		                        if(k == (iterLength + 1)){
						distance = addSecs * speedVal * 0.514444444;
		                        }
		                        var x_dis = distance * Math.cos((270 - dirVal) * Math.PI / 180);
		                        var y_dis = distance * Math.sin((270 - dirVal) * Math.PI / 180);
		                        clone.geometry.move(x_dis,y_dis);
					dirValLast = dirVal;
				}
				*/

				threat_area.addFeatures([clone]);
				threatPanel = Ext.getCmp('threatPanel');
		                threatPanel.show();
				modifyFeature.setFeature(threat_area.features[threat_area.features.length - 1]);
				if(clone.attributes.data['types'][0] == 'tornado1'){
					document.getElementById("tornadoButton").src = "images/tornadoButtonSelect.png";
		                        document.getElementById("tornadoButton").onclick = unloadConfigPanel;
		                        document.getElementById("tornadoButton").onmouseout = function(){this.src = "images/tornadoButtonSelect.png";}
		                        document.getElementById("tornadoButton").onmouseover = function(){this.src = "images/tornadoButtonSelect.png";}
					drawType = 'tornado';
				}
				else if(clone.attributes.data['types'][0] == 'severe1'){
                                        document.getElementById("severeButton").src = "images/severeButtonSelect.png";
                                        document.getElementById("severeButton").onclick = unloadConfigPanel;
                                        document.getElementById("severeButton").onmouseout = function(){this.src = "images/severeButtonSelect.png";}
                                        document.getElementById("severeButton").onmouseover = function(){this.src = "images/severeButtonSelect.png";}
                                        drawType = 'severe';
                                }
				else if(clone.attributes.data['types'][0] == 'hail1'){
					document.getElementById("hailButton").src = "images/hailButtonSelect.png";
                                        document.getElementById("hailButton").onclick = unloadConfigPanel;
                                        document.getElementById("hailButton").onmouseout = function(){this.src = "images/hailButtonSelect.png";}
                                        document.getElementById("hailButton").onmouseover = function(){this.src = "images/hailButtonSelect.png";}
					drawType = 'hail';
				}
				else if(clone.attributes.data['types'][0] == 'wind1'){
                                        document.getElementById("windButton").src = "images/windButtonSelect.png";
                                        document.getElementById("windButton").onclick = unloadConfigPanel;
                                        document.getElementById("windButton").onmouseout = function(){this.src = "images/windButtonSelect.png";}
                                        document.getElementById("windButton").onmouseover = function(){this.src = "images/windButtonSelect.png";}
					drawType = 'wind';
                                }
				else if(clone.attributes.data['types'][0] == 'lightning1'){
                                        document.getElementById("lightningButton").src = "images/lightningButtonSelect.png";
                                        document.getElementById("lightningButton").onclick = unloadConfigPanel;
                                        document.getElementById("lightningButton").onmouseout = function(){this.src = "images/lightningButtonSelect.png";}
                                        document.getElementById("lightningButton").onmouseover = function(){this.src = "images/lightningButtonSelect.png";}
					drawType = 'lightning';
                                }
				selectGrid();
				loadConfigPanel();
				if(clone.attributes.data['discussion'] != ''){
					document.getElementById('discussion').value = clone.attributes.data['discussion'];
				}
				//if(clone.attributes.data['actions'] != ''){
                                //        document.getElementById('actions').value = clone.attributes.data['elements']['actions'];
                                //}
				//if(clone.attributes.data['impacts'] != ''){
                                //        document.getElementById('impacts').value = clone.attributes.data['elements']['impacts'];
                                //}
				document.getElementById('radio_ellipse').disabled = true;
		               	document.getElementById('radio_polygon').disabled = true;
				//decoupleVector();
				modifiedObject = true;
				//adjustBuffer();
				break;
			}
		}
	}

	function unhighlightThreat(){
		// need to update with threat store and grid
		//activeList = document.getElementById('activeThreats');
		//for(i=0;i<activeList.options.length;i++){
		//	activeList.options[i].selected = false;
		//}
	}

	// initiate threat object from K-means cluster object
	function initiateThreat(threatID, init){
                // check if myrorss object is current
                if(init < parseInt(scans[scans.length - 2][0].split('_')[1])){
                        alert('K-Means Cluster Object is old.  Advance to latest scan.  If no object available, you must wait. (shrugs shoulders)');
                        return;
                }

                // obtain most recent kmeans object
		if(kmeans){
			myrorss_points.removeAllFeatures();
			if(threatID == 'lightning'){
				// genereate 15 mile buffer
				var parser = new jsts.io.OpenLayersParser();
				poly = kmeans_lines.features[kmeans_lines.features.length - 1].geometry.clone();
	                        poly2 = parser.read(poly);
	                        poly2 = poly2.buffer(24140.2);
	                        poly = parser.write(poly2);
				kmeans_lines.features[kmeans_lines.features.length - 1].geometry = poly;
			}
			myrorss_points.addFeatures([kmeans_lines.features[kmeans_lines.features.length - 1].clone()]);
			kindex = 0;
		}
		else{
	                for(i=0;i<myrorss_points.features.length;i++){
	                        if(String(myrorss_points.features[i].attributes.RowName) == threatID && myrorss_points.features[i].attributes.init == init){
	                                kindex = i;
	                                break;
	                        }
	                }
		}

		// destroy popup
                killPopup();
		selectControl.deactivate();

                // derive object attributes
                //myrorss_speed = eval('myrorss_points.features[' + kindex + '].attributes.Speed_scale' + threatID.split(':')[0]);
                myrorss_points.features[kindex].attributes.data = {};
                myrorss_points.features[kindex].attributes.data['probs'] = [[]];
                myrorss_points.features[kindex].attributes.data['speeds'] = [];
                myrorss_points.features[kindex].attributes.data['dirs'] = [];
                myrorss_points.features[kindex].attributes.data['dirs_orig'] = [];
                myrorss_points.features[kindex].attributes.data['dir'] = [];
                myrorss_points.features[kindex].attributes.data['spd'] = [];
		if(kmeans && threatID == 'hail'){
			p = myrorss_points.features[kindex].attributes.OrtegaHailProb;
			myrorss_points.features[kindex].attributes.data['types'] = ['hail1'];
			myrorss_points.features[kindex].attributes.data['threatColor'] = 'rgb(0,204,0)';
		}
		else if(kmeans && threatID == 'lightning'){
                        p = myrorss_points.features[kindex].attributes.LightningProbabilityNext30min;
			myrorss_points.features[kindex].attributes.data['types'] = ['lightning1'];
			myrorss_points.features[kindex].attributes.data['threatColor'] = 'rgb(255,255,0)';
                }
		else{
			p = myrorss_points.features[kindex].attributes.POSH;
			myrorss_points.features[kindex].attributes.data['types'] = ['hail1'];
			myrorss_points.features[kindex].attributes.data['threatColor'] = 'rgb(0,204,0)';
		}
		myrorss_points.features[kindex].attributes.data['recommender_id'] = myrorss_points.features[kindex].attributes.RowName;
		myrorss_points.features[kindex].attributes.data['recommender_value'] = p;
		myrorss_points.features[kindex].attributes.data['recommender_scale'] = myrorss_points.features[kindex].attributes.Scale;
		myrorss_points.features[kindex].attributes.data['recommender_time'] = myrorss_points.features[kindex].attributes.InitTime;
		myrorss_points.features[kindex].attributes.data['initiated'] = currentTime;
		myrorss_points.features[kindex].attributes.data['valid_start'] = parseInt(scans[scans.length - 1][0].split('_')[1]);
                for(i=0;i<default_dirs.length;i++){
                       	if((i * 5) <= default_duration && p > 0){
                               	prob_val = Math.round(p * Math.sin(((((default_duration - (i * 5)) / default_duration) * 90)) * Math.PI / 180));
                               	//dis_norm = (default_duration - (i * 5)) / default_duration;
                               	//prob_val = Math.round(((myrorss_points.features[kindex].attributes.POSH - 0) * ((dis_norm * dis_norm))) + 0);
                        }
                       	else{
                               	prob_val = 0;
                       	}
                       	myrorss_points.features[kindex].attributes.data['probs'][0].push(prob_val);
                       	myrorss_points.features[kindex].attributes.data['speeds'].push(myrorss_points.features[kindex].attributes.speed);
                       	myrorss_points.features[kindex].attributes.data['dirs'].push(myrorss_points.features[kindex].attributes.Direction);
                       	myrorss_points.features[kindex].attributes.data['dirs_orig'].push(myrorss_points.features[kindex].attributes.Direction);
                       	myrorss_points.features[kindex].attributes.data['dir'].push(15);
                       	myrorss_points.features[kindex].attributes.data['spd'].push(8);
               	}
		//alert(myrorss_points.features[kindex].attributes.data['probs']);

               	// generate threat
		if(kmeans && threatID == 'hail'){
	               	document.getElementById("hailButton").src = "images/hailButtonSelect.png";
	               	document.getElementById("hailButton").onclick = unloadConfigPanel;
	               	document.getElementById("hailButton").onmouseout = function(){this.src = "images/hailButtonSelect.png";}
	               	document.getElementById("hailButton").onmouseover = function(){this.src = "images/hailButtonSelect.png";}
			drawType = 'hail';
		}
		else if(kmeans && threatID == 'lightning'){
			document.getElementById("lightningButton").src = "images/lightningButtonSelect.png";
                       	document.getElementById("lightningButton").onclick = unloadConfigPanel;
                       	document.getElementById("lightningButton").onmouseout = function(){this.src = "images/lightningButtonSelect.png";}
                       	document.getElementById("lightningButton").onmouseover = function(){this.src = "images/lightningButtonSelect.png";}
                       	drawType = 'lightning';
		}
		else{
			document.getElementById("hailButton").src = "images/hailButtonSelect.png";
                       	document.getElementById("hailButton").onclick = unloadConfigPanel;
                       	document.getElementById("hailButton").onmouseout = function(){this.src = "images/hailButtonSelect.png";}
                       	document.getElementById("hailButton").onmouseover = function(){this.src = "images/hailButtonSelect.png";}
                       	drawType = 'hail';
		}
               	timeCanvasVal.setAttr('time',parseInt(scans[scans.length - 1][0].split('_')[1]));
               	moveSliderTime();
               	changeTime();
               	threat_area.addFeatures([myrorss_points.features[kindex].clone()]);
               	newFeature = true;
               	//drawType = 'ellipse';
               	featureDrawn('myrorss');
       	}

	// main function called for rapid threat area modification
	function modifyThreat(threatUpdate){
		activeThreatsBack.styleMap = styleMapThreat4_2;
               	activeThreats.styleMap = styleMapThreat3_2;
		probSevereObjects.styleMap = styleMapThreat3_2;
		probSevereObjectsBack.styleMap = styleMapThreat4_2;
		probSevereObjects.redraw();
		probSevereObjectsBack.redraw();
		azShearObjects.styleMap = styleMapThreat3_2;
                azShearObjectsBack.styleMap = styleMapThreat4_2;
		azShearObjects.redraw();
		azShearObjectsBack.redraw();
		lightningObjects.styleMap = styleMapThreat3_2;
                lightningObjectsBack.styleMap = styleMapThreat4_2;
                lightningObjects.redraw();
                lightningObjectsBack.redraw();
		legacy.styleMap = styleMapLegacy2;
                legacyBack.styleMap = styleMapLegacyBack2;
                legacy.redraw();
                legacyBack.redraw();
		if(threatUpdate != true && threatUpdate != false){
			if(!updateThreat){
				threatUpdate = false;
			}
			else{
				threatUpdate = true;
			}
		}
		if(document.getElementById('gridType') != null){
			document.getElementById('gridType').selectedIndex = 0;
	                gridIndex = 0;
		}
		if(assigningStart && !cloneSet){
			alert('A new volume scan has arrived.  You might consider updating the threat object on the map.  ;)');
                       	return;
               	}
		if(modifyFeature.feature != null){
			if(modifyFeature.feature.attributes.data == null){
				return;
			}
			if(typeof modifyFeature.feature.attributes.data['types'] === 'string'){
				modType = modifyFeature.feature.attributes.data['types'].split('_')[0];
			}
			else{
				modType = modifyFeature.feature.attributes.data['types'][0].split('_')[0];
			}
			if(bufClone == null){
        		       	bufClone = modifyFeature.feature.geometry.clone();
				bufCloneTime = modifyFeature.feature.attributes.data['valid_start'];
		       	}
			if(bufClone2 == null){
				bufClone2 = modifyFeature.feature.geometry.clone();
			}
		}
		//alert(parseInt(modifyFeature.feature.attributes.data['types'][0].split('_')[0]) + ' | ' + modifyFeature.feature.attributes.data['id'] + ' | ' + newFeature + ' | ' + threatUpdate + ' | ' + updateThreat);
		if(modifyFeature.feature != null && modType == modifyFeature.feature.attributes.data['id'] && !newFeature && !threatUpdate && !updateThreat){
			for(i=0;i<threat_area.features.length;i++){
                                if(threat_area.features[i].attributes.data && threat_area.features[i].attributes.data['types'].split('_')[0] != modifyFeature.feature.attributes.data['id']){
					index = i;
					break;       
				}
			}
			cloneCenter = modifyFeature.feature.geometry.getCentroid();
			if(!modifyFeature.feature.attributes.data['centers'].hasOwnProperty(timeCanvasVal.getAttr('time')) && setHistory){
				modifyFeature.feature.attributes.data['centers'][timeCanvasVal.getAttr('time')] = {};
				modifyFeature.feature.attributes.data['centers'][timeCanvasVal.getAttr('time')]['x'] = cloneCenter.x;
                                modifyFeature.feature.attributes.data['centers'][timeCanvasVal.getAttr('time')]['y'] = cloneCenter.y;
				centers = modifyFeature.feature.attributes.data['centers'];
			}
			else if(setHistory){
				modifyFeature.feature.attributes.data['centers'][timeCanvasVal.getAttr('time')]['x'] = cloneCenter.x;
				modifyFeature.feature.attributes.data['centers'][timeCanvasVal.getAttr('time')]['y'] = cloneCenter.y;
				centers = modifyFeature.feature.attributes.data['centers'];

				xs = [];
				ys = [];
				ts = [];
				keys = Object.keys(modifyFeature.feature.attributes.data['centers']);
				keys.sort();
				for(i=0;i<keys.length;i++){
					if(i == 0){
						xLast = modifyFeature.feature.attributes.data['centers'][keys[i]]['x'];
						yLast = modifyFeature.feature.attributes.data['centers'][keys[i]]['y'];
						tLast = parseInt(keys[i]);
					}
					else{
						xs.push(modifyFeature.feature.attributes.data['centers'][keys[i]]['x'] - xLast);
						ys.push(modifyFeature.feature.attributes.data['centers'][keys[i]]['y'] - yLast);
						ts.push(tLast - parseInt(keys[i]));
						xLast = modifyFeature.feature.attributes.data['centers'][keys[i]]['x'];
	                                        yLast = modifyFeature.feature.attributes.data['centers'][keys[i]]['y'];
						tLast = parseInt(keys[i]);
					}
				}
				computeObjectErrorStats(xs,ys,8,15);
			}
			setHistory = true;
	 		deriveVector = true;
			cloneCenterLast = cloneCenter.clone();
			cloneTime = timeCanvasVal.getAttr('time');
		}
               	//newScanHere = false;

		if(deriveVector || !deriveVector){
			manual_dir = true;
			//ndfd_grid.removeAllFeatures();
			//ndfd_grid2.removeAllFeatures();
			threat_region.removeAllFeatures();
			threat_lines.removeAllFeatures();
			threat_lines_out.removeAllFeatures();
			polys = [];

			if(ftime == 0 && !tSlide && !deriveVector){
				// linearly adjust direction array attribute if feature is rotated
				rot = modifyFeature.rotation;
				if(rot != 0 && !threatRotate){
					for(var i=0;i<modifyFeature.feature.attributes.data['dirs'].length;i++){
						modifyFeature.feature.attributes.data['dirs'][i] = modifyFeature.feature.attributes.data['dirs_orig'][i] - rot;
						if(modifyFeature.feature.attributes.data['dirs'][i] >= 360){         
								modifyFeature.feature.attributes.data['dirs'][i] = modifyFeature.feature.attributes.data['dirs'][i] - 360;
						}	
						else if(modifyFeature.feature.attributes.data['dirs'][i] < 0){
								modifyFeature.feature.attributes.data['dirs'][i] = modifyFeature.feature.attributes.data['dirs'][i] + 360;
						}
					}
				}
				else if(modifyFeature.feature.attributes.data['dirs_orig'] != modifyFeature.feature.attributes.data['dirs'] && !threatRotate){
					for(var i=0;i<modifyFeature.feature.attributes.data['dirs'].length;i++){
						modifyFeature.feature.attributes.data['dirs_orig'][i] = modifyFeature.feature.attributes.data['dirs'][i];
					}
				}

				// pull attributes
				var geojson_format = new OpenLayers.Format.JSON();
		                tempAttrs = geojson_format.read(JSON.stringify(modifyFeature.feature.attributes));
				centroid = modifyFeature.feature.geometry.getCentroid();
				tempId = modifyFeature.feature.attributes.data['id'];
				tempDuration = modifyFeature.feature.attributes.data['duration'];
				tempProbs = modifyFeature.feature.attributes.data['probs'][probIdx];
				tempSpeeds = modifyFeature.feature.attributes.data['speeds'];
				tempDirs = modifyFeature.feature.attributes.data['dirs'];
				tempDirs_orig = modifyFeature.feature.attributes.data['dirs_orig'];
				tempThreatColor = modifyFeature.feature.attributes.data['threatColor'];
				tempSpd = modifyFeature.feature.attributes.data['spd'];
				tempDir = modifyFeature.feature.attributes.data['dir'];
				tempValidStart = parseInt(modifyFeature.feature.attributes.data['valid_start']);
				tempValidEnd = parseInt(modifyFeature.feature.attributes.data['valid_end']);
				tempPrediction = modifyFeature.feature.attributes.data['prediction'];

				if(wofR){
					setWofAttributes();
				}

				if(!modifyFeature.feature.attributes.data['centers'].hasOwnProperty(timeCanvasVal.getAttr('time'))){
	                               	modifyFeature.feature.attributes.data['centers'][timeCanvasVal.getAttr('time')] = {};
	                        }
				if(timeCanvasVal.getAttr('time') == centroidTime || centroidTime == 0){
	                                modifyFeature.feature.attributes.data['centers'][timeCanvasVal.getAttr('time')]['x'] = centroid.x;
	                               	modifyFeature.feature.attributes.data['centers'][timeCanvasVal.getAttr('time')]['y'] = centroid.y;
				}
				centroidTime = timeCanvasVal.getAttr('time');

				keys = Object.keys(modifyFeature.feature.attributes.data['centers']);
				keys.sort();
				if(keys.length > 1 && timeCanvasVal.getAttr('time') == centroidTime){
	                                centers = modifyFeature.feature.attributes.data['centers'];
					xs = [];
		                        ys = [];
		                        ts = [];
		                        for(var i=0;i<keys.length;i++){
		                               	if(i == 0){
		                                       	xLast = modifyFeature.feature.attributes.data['centers'][keys[i]]['x'];
		                                        yLast = modifyFeature.feature.attributes.data['centers'][keys[i]]['y'];
		                                       	tLast = parseInt(keys[i]);
		                                }
		                                else{
		                                        xs.push(modifyFeature.feature.attributes.data['centers'][keys[i]]['x'] - xLast);
		                                        ys.push(modifyFeature.feature.attributes.data['centers'][keys[i]]['y'] - yLast);
		                                        ts.push(tLast - parseInt(keys[i]));
		                                        xLast = modifyFeature.feature.attributes.data['centers'][keys[i]]['x'];
		                                       	yLast = modifyFeature.feature.attributes.data['centers'][keys[i]]['y'];
		                                       	tLast = parseInt(keys[i]);
		                                }
		                        }
	                                computeObjectErrorStats(xs,ys,8,15);
				}
			}

			// if time slider engaged after feature is drawn, propigate feature along forecast track (and BACK!!)
			if(!newFeature && tSlide){
				resetPoly = true;
				centroid = threat_points.features[0].geometry.getCentroid();
				for(var i=0;i<threat_area.features.length;i++){
					if(threat_area.features[i].attributes.data['valid_start'] == tempValidStart){
						idxm = i;
						break;
					}
				}
				if(ftime != 0 && modifyFeature.feature != null){
					modifyFeature.unsetFeature();
					modifyFeature.setFeature(threat_area.features[idxm]);
					modifyFeature.unsetFeature();
				}
				
				//modifyFeature.unsetFeature();
				if(ftime > ftime_last){
					for(var i=ftime_last;i<ftime;i++){
						nowPoint = threat_points.features[i].geometry.getCentroid();
						nextPoint = threat_points.features[i+1].geometry.getCentroid();
						x_dis = nextPoint.x - nowPoint.x;
						y_dis = nextPoint.y - nowPoint.y;
						distance = Math.sqrt(Math.pow(x_dis,2) + Math.pow(y_dis,2));
						threat_area.features[idxm].geometry.move(x_dis,y_dis);
						threat_area.features[idxm].geometry.rotate((threat_points.features[i].attributes.dir - threat_points.features[i+1].attributes.dir),nextPoint);
						threat_area.features[idxm].geometry.rotate(-1 * (270 - threat_points.features[i+1].attributes.dir),nextPoint);
						y_dis = distance * Math.tan((threat_points.features[i+1].attributes.diru) * Math.PI / 180);
						x_dis = 60 * threat_points.features[i+1].attributes.spdu * 0.514444444;
						verts = threat_area.features[idxm].geometry.getVertices();         
						coords = new Array();
						for(var i2=0;i2<verts.length;i2++){
							dir = Math.atan2(verts[i2].y - nextPoint.y,verts[i2].x - nextPoint.x);
							x = (Math.cos(dir) * (x_dis));
							y = (Math.sin(dir) * (y_dis));
							verts[i2].move(x,y);
							coords.push(verts[i2]);
						}
						linearRing = new OpenLayers.Geometry.LinearRing(coords);
						newPoly = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([linearRing]),threat_area.features[idxm].attributes);
						newPoly.geometry.rotate((270 - threat_points.features[i+1].attributes.dir),nextPoint);
						threat_area.removeFeatures([threat_area.features[idxm]]);
						threat_area.addFeatures([newPoly]);
						if((idxm%2) == 0){
							//idxm++;
						}
					}
				}
				else if(ftime < ftime_last){
					for(var i=ftime_last;i>ftime;i--){
						nowPoint = threat_points.features[i].geometry.getCentroid();
						nextPoint = threat_points.features[i-1].geometry.getCentroid();
						x_dis = nextPoint.x - nowPoint.x;
						y_dis = nextPoint.y - nowPoint.y;
						distance = Math.sqrt(Math.pow(x_dis,2) + Math.pow(y_dis,2)) * -1;
						threat_area.features[idxm].geometry.move(x_dis,y_dis);
						threat_area.features[idxm].geometry.rotate((threat_points.features[i].attributes.dir - threat_points.features[i-1].attributes.dir),nextPoint);
						threat_area.features[idxm].geometry.rotate(-1 * (270 - threat_points.features[i-1].attributes.dir),nextPoint);
						y_dis = distance * Math.tan((threat_points.features[i].attributes.diru) * Math.PI / 180);
						x_dis = -60 * threat_points.features[i].attributes.spdu * 0.514444444;
						verts = threat_area.features[idxm].geometry.getVertices();         
						coords = new Array();
						for(i2=0;i2<verts.length;i2++){
							dir = Math.atan2(verts[i2].y - nextPoint.y,verts[i2].x - nextPoint.x);
							x = (Math.cos(dir) * (x_dis));
							y = (Math.sin(dir) * (y_dis));
							verts[i2].move(x,y);
							coords.push(verts[i2]);
						}
						linearRing = new OpenLayers.Geometry.LinearRing(coords);
						newPoly = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([linearRing]),threat_area.features[idxm].attributes);
						newPoly.geometry.rotate((270 - threat_points.features[i-1].attributes.dir),nextPoint);
						threat_area.removeFeatures([threat_area.features[idxm]]);
						threat_area.addFeatures([newPoly]);
						if((idxm%2) == 0){
                                                        //idxm++;
                                                }
					}
				}
				threat_area.redraw();
				//timeCanvasVal.setAttr('time',threat_area.features[idxm].attributes.data['valid_start'] + (60 * ftime));
				//modifyFeature.setFeature(threat_area.features[idxm]);
				if(ftime == 0){
					modifyFeature.setFeature(threat_area.features[idxm]);
				}
				resetPoly = false;
			}

			// if feature has been adjusted in any way, recompute track attriubtes
			if(newFeature || tempDuration != duration_last || centroid_last != centroid){
				threat_points.removeAllFeatures();
				track_points.removeAllFeatures();
				allThreatObjects = [];
				allProbVals = [];
				duration_last = tempDuration;
				var reader = new jsts.io.WKTReader();
                                var parser = new jsts.io.OpenLayersParser();
				var j = -1;
				var j2 = 0;
				clones = new Array();
				// first, create new threat points (points are needed to back propigate clone if necessary)
				for(var i=0;i<=(tempDuration + ftime);i++){
					// 3 if/else blocks:
					//   1. Determine speed/direction/probability values from sparse object attribute arrays, interpolate if needed
					//   2. Create threat points using speed/direction/probability values from 1.
					//   3. Clone threat area and propigate clone downstream while unioning cloned threat geometries
					if(wofR){
						probVal = wof_points.features[i - ftime].attributes.prob;
						speedVal = wof_points.features[i - ftime].attributes.speed;
						//speedVal = 44;
						dirVal = wof_points.features[i - ftime].attributes.dir;
						spdUVal = wof_points.features[i - ftime].attributes.spdu;
						dirUVal = wof_points.features[i - ftime].attributes.diru;
						if(i == ftime){
                                                        color = '#FFFFFF';
                                                }
                                                else{
                                                        color = getColor(probVal);
                                                }
					}
					else if((i%5) == 0){
						// pull values from attribute arrays, mark current point as white
						j++;
						if(tempPrediction == 'persistence'){
							j2++;
						}
						else{
							j2++;
						}
						probVal = tempProbs[j];
						speedVal = tempSpeeds[j];
						dirVal = tempDirs[j];
						spdUVal = tempSpd[j];
						dirUVal = tempDir[j];
						if(i == ftime){
							color = '#FFFFFF';
						}
						else{
							color = getColor(probVal);
						}
					}
					else{
						// interpolate between attribute array values
						slp = (tempProbs[j+1] - tempProbs[j]) / 5;
						y_int = tempProbs[j] - ((j * 5) * slp);
						probVal = (i * slp) + y_int;
						slp = (tempSpeeds[j+1] - tempSpeeds[j]) / 5;
						y_int = tempSpeeds[j] - ((j * 5) * slp);
						speedVal = (i * slp) + y_int;
						slp = (tempSpd[j+1] - tempSpd[j]) / 5;
						y_int = tempSpd[j] - ((j * 5) * slp);
						spdUVal = (i * slp) + y_int;
						slp = (tempDir[j+1] - tempDir[j]) / 5;
						y_int = tempDir[j] - ((j * 5) * slp);
						dirUVal = (i * slp) + y_int;

						// cheesy alg to deal with 359 to 0 (vice versa) issue  :p
						if(tempDirs[j+1] >= 270 && tempDirs[j] <= 90 || tempDirs[j] >= 270 && tempDirs[j+1] <= 90){
							angDiff = (tempDirs[j] - tempDirs[j+1]);
							if(angDiff < 0){
								angDiff = (360 + angDiff) * -1;
							}
							else{
								angDiff = 360 - angDiff;
							}
							slp = angDiff / 5;
							y_int = tempDirs[j] - ((j * 5) * slp);
							dirVal = (i * slp) + y_int;
							if(dirVal >= 360){
								dirVal = dirVal - 360;
							}
							else if(dirVal < 0){
								dirVal = dirVal + 360;
							}
						}
						else{
							slp = (tempDirs[j+1] - tempDirs[j]) / 5;
							y_int = tempDirs[j] - ((j * 5) * slp);
							dirVal = (i * slp) + y_int;
						}
						if(i == ftime){
							color = '#FFFFFF';
						}
						else{
							color = getColor(probVal);
						}
					}
					if(updateThreat && threatUpdate && modifyFeature.feature.attributes.data['timeDiff'] != 0){
						// use centroid distances & time diff to compute speed/direction
						// could also probably use history info to adjust motion uncertainty
						// would likely need to append position/time info as object attributes
						for(var m=0;m<activeThreatClones.features.length;m++){
							if(activeThreatClones.features[m].attributes.data['issue'] == modifyFeature.feature.attributes.data['issue'] && activeThreatClones.features[m].attributes.data['types'][0].split('_')[0] != modifyFeature.feature.attributes.data['id']){
								index = m;
								break;       
							}    
						}
						if(i == 0){
							newDirs = [];
							newSpeeds = [];
							cloneCenter = activeThreatClones.features[index].geometry.getCentroid();
							threatCenter = modifyFeature.feature.geometry.getCentroid();
							trace = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([cloneCenter,threatCenter]),{'color':'rgb(0,0,0)'});
							threat_lines_out.addFeatures([trace.clone()]);
							threat_lines.addFeatures([trace]);
						}
						xDiff = threatCenter.x - cloneCenter.x;
						yDiff = threatCenter.y - cloneCenter.y;
						dirVal = 270 - Math.round(Math.atan2(yDiff,xDiff) * 180 / Math.PI);
						if(dirVal >= 360){
							dirVal = dirVal - 360;
						}
						else if(dirVal < 0){
							dirVal = dirVal + 360;
						}
						speedVal = Math.round((Math.sqrt((xDiff * xDiff) + (yDiff * yDiff))/ modifyFeature.feature.attributes.data['timeDiff']) * 1.94384);
						if((i%5) == 0){
							newDirs.push(dirVal);
							newSpeeds.push(speedVal);
						}
					}
					if(i == 0){
						// convert threat area centroid as first threat point
						if(i == ftime){
							x = 17 * Math.cos((360 - dirVal) * Math.PI / 180);
							y = 17 * Math.sin((360 - dirVal) * Math.PI / 180);
							ldate = new Date(tempValidStart * 1000);
							label = pad(ldate.getUTCHours()) + ':' + pad(ldate.getUTCMinutes()) + ':' + pad(ldate.getUTCSeconds()) + ' Z';
							label = ''; // de-cluttering
						}
						else{
							x = 0;
							y = 0;
							label = '';
						}
						x_point1 = centroid.x;
						y_point1 = centroid.y;
						point_1 = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(x_point1,y_point1),{'color':color,'prob':probVal,'speed':speedVal,'dir':dirVal,'spdu':spdUVal,'diru':dirUVal,'duration':tempDuration,'x':x,'y':y,'label':label});
						threat_points.addFeatures([point_1]);
						newSpeed = speedVal;
						newDir = dirVal;
						if(timeCanvasVal.getAttr('time') == moveThreatTime){
                                                        startPoint = centroid.clone();
                                                }
					}
					else{
						// determine next threat point position
						prevPoint = threat_points.features[threat_points.features.length-1].geometry.getCentroid();
						distance = 60 * speedVal * 0.514444444;
						if(wofR){
							x_point = wof_points.features[i - ftime].geometry.getCentroid().x;
							y_point = wof_points.features[i - ftime].geometry.getCentroid().y;
						}
						else{
							x_point = prevPoint.x + (Math.cos((270 - dirVal) * Math.PI / 180) * distance);
							y_point = prevPoint.y + (Math.sin((270 - dirVal) * Math.PI / 180) * distance);
						}
						if(i == ftime){
							x = 34 * Math.cos((360 - dirVal) * Math.PI / 180);
							y = 34 * Math.sin((360 - dirVal) * Math.PI / 180);
							ldate = new Date((tempValidStart + (60 * i)) * 1000);
							label = pad(ldate.getUTCHours()) + '' + pad(ldate.getUTCMinutes()) + ':' + pad(ldate.getUTCSeconds()) + ' Z';
						}
						else if((i%10) == 0){
							x = 17 * Math.cos((360 - dirVal) * Math.PI / 180);
							y = 17 * Math.sin((360 - dirVal) * Math.PI / 180);
							label = String(i);
						}
						else{
							x = 0;
							y = 0;
							label = '';
						}
						point_1 = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(x_point,y_point),{'color':color,'prob':probVal,'speed':speedVal,'dir':dirVal,'spdu':spdUVal,'diru':dirUVal,'duration':tempDuration,'x':x,'y':y,'label':label});
						threat_points.addFeatures([point_1]);
					}
					if(i == ftime){
						// create clone of threat area
						if(ftime == 0 && !deriveVector){
							clone = modifyFeature.feature.geometry.clone();
							clone2 = modifyFeature.feature.geometry.clone();
							if(timeCanvasVal.getAttr('time') == moveThreatTime){
								startClone = modifyFeature.feature.clone();
								console.log('startClone3');
							}
							console.log('clone1');
						}
						else if(ftime == 0 && deriveVector){
							clone = startClone.geometry.clone();
                                                        clone2 = startClone.geometry.clone();
							console.log('clone2');
						}
						else{
							clone = threat_area.features[idxm].geometry.clone();
							clone2 = threat_area.features[idxm].geometry.clone();
							if(timeCanvasVal.getAttr('time') == moveThreatTime){
                                                                startClone = threat_area.features[idxm].clone();
								console.log('startClone4');
                                                        }
							console.log('clone3');
						}

						// create polygon for accumulated threat area
						console.log(clone.getCentroid().x);
						union = parser.read(clone);
						allProbVals.push(probVal);
						allThreatObjects.push(clone.clone());
					}
					else if(i > ftime){
						// move/rotate/resize cloned threat area using "motion uncertainty"
						// threat expansion is achieved by displacing each vertex a % of the max distances using sin on max y and cos on max x
						// then recreating the geometry.  Similar logic is applied when moving forward/back in time (above)
						prevPoint = threat_points.features[i-1].geometry.getCentroid();
						nowPoint = threat_points.features[i].geometry.getCentroid();
						x_dis = nowPoint.x - prevPoint.x;
						y_dis = nowPoint.y - prevPoint.y;
						distance = Math.sqrt(Math.pow(x_dis,2) + Math.pow(y_dis,2));
						clone.move(x_dis,y_dis);
						clone2.move(x_dis,y_dis);
						clone.rotate((threat_points.features[i-1].attributes.dir - threat_points.features[i].attributes.dir),nowPoint);
						clone2.rotate((threat_points.features[i-1].attributes.dir - threat_points.features[i].attributes.dir),nowPoint);
						clone.rotate(-1 * (270 - threat_points.features[i-1].attributes.dir),nowPoint);
						y_dis2 = distance * Math.tan((threat_points.features[i-1].attributes.diru) * Math.PI / 180);
						x_dis2 = 60 * threat_points.features[i-1].attributes.spdu * 0.514444444;
						verts = clone.getVertices();         
						coords = new Array();
						for(i2=0;i2<verts.length;i2++){
							dir = Math.atan2(verts[i2].y - nowPoint.y,verts[i2].x - nowPoint.x);
							x = (Math.cos(dir) * (x_dis2));
							y = (Math.sin(dir) * (y_dis2));
							verts[i2].move(x,y);
							coords.push(verts[i2]);
						}
						linearRing = new OpenLayers.Geometry.LinearRing(coords);
						clone = new OpenLayers.Geometry.Polygon([linearRing]);
						clone.rotate((270 - threat_points.features[i-1].attributes.dir),nowPoint);
						
						// create polygon for accumulated threat area (would like to use Cascaded Polygon Union, but can't get it to work!)
						if((i%2) == 0){
							allThreatObjects.push(clone.clone());
							allProbVals.push(probVal);
						}
						cloneGeometry = parser.read(clone);
						union = union.union(cloneGeometry);
					}
				}

				// vectorize union as accumulated threat area
				union = parser.write(union);
				region = new OpenLayers.Feature.Vector(union,{'color': tempThreatColor});
				threat_region.addFeatures([region]);
				threat_lines_out.addFeatures([region.clone()]);
				threat_lines.addFeatures([region]);

				// add bread-crumb trail
				for(key in centers){
					if(parseInt(key) != centroidTime && centers[key].hasOwnProperty('x')){
						if(parseInt(key) == timeCanvasVal.getAttr('time')){
							point_1 = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(centers[key]['x'],centers[key]['y']),{'color':'yellow'});
						}
						else{
							point_1 = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(centers[key]['x'],centers[key]['y']),{'color':'white'});
						}
	                                	track_points.addFeatures([point_1]);
					}
				}
			}

			if(updateThreat && threatUpdate && modifyFeature.feature.attributes.data['timeDiff'] != 0){
				for(var i=0;i<modifyFeature.feature.attributes.data['dirs'].length;i++){
					modifyFeature.feature.attributes.data['dirs'][i] = newDirs[0];
					modifyFeature.feature.attributes.data['speeds'][i] = newSpeeds[0];
				}
			}
			modifyFeature.feature.attributes.data['Direction'] = modifyFeature.feature.attributes.data['dirs'][0];
			modifyFeature.feature.attributes.data['Speed'] = modifyFeature.feature.attributes.data['speeds'][0];
			var idate = new Date(modifyFeature.feature.attributes.data['valid_start'] * 1000);
                        var itime = idate.getUTCFullYear() + pad(idate.getUTCMonth() + 1) + pad(idate.getUTCDate()) + '-' + pad(idate.getUTCHours()) + pad(idate.getUTCMinutes()) + pad(idate.getUTCSeconds());
			modifyFeature.feature.attributes.data['InitTime'] = itime;
			//console.log(modifyFeature.feature.attributes.data['user']);

			// check what was changed and update keys
			if(modifyFeature.feature.attributes.data['dirs'][0] != tempAttrs.data['dirs'][0]){
				console.log(modifyFeature.feature.attributes.data['dirs'][0] + ',' + tempAttrs.data['dirs'][0]);
				modifyFeature.feature.attributes.data.modified['direction'] = 1;
				console.log('direction modified');
			}
			if(modifyFeature.feature.attributes.data['speeds'][0] != tempAttrs.data['speeds'][0]){
                                modifyFeature.feature.attributes.data.modified['speed'] = 1;
				console.log('speed modified');
                        }

			rot_last = rot;
			centroid_last = centroid.clone();
			if(gridIndex == 0){
				ndfd_grid.removeAllFeatures();
			}
			//if(evtType == 'prob' && config && document.getElementById(oldButton)){
			if(config && document.getElementById(oldButton)){
				document.getElementById(oldButton).click();
			}
			else if(evtType == 'speed'){
				//speedChart();
			}
			else if(evtType == 'dir'){
				//dirChart();
			}
			else if(evtType == 'spdu'){
                                //speedDeltaChart();
                        }
                        else if(evtType == 'diru'){
                                //dirDeltaChart();
                        }
			ftime_last = ftime;
			idLast = tempId;
			manual_dir = false;
			newFeature = false;
			activeThreats.redraw();
			//clearGridPreview();
			if(deriveVector){
				threat_area.redraw();
				threat_points.redraw();
			}
			if(document.getElementById('motionVectorSpeed')){
				document.getElementById('motionVectorDir').value = tempDirs[0];
				document.getElementById('motionVectorSpeed').value = tempSpeeds[0];
			//	//document.getElementById('motionVector').innerHTML = tempDirs[0] + '° @ ' + tempSpeeds[0] + ' kts';
			}
			//else{
			//	deriveVector = false;
			//	return;
			//}
			if(ftime == 0 && !deriveVector){
                        	attrs = JSON.stringify(modifyFeature.feature.attributes);
                        }
                        else if(ftime == 0 && deriveVector){
                                attrs = JSON.stringify(threat_area.features[index].attributes);
                        }
                        else{
                                attrs = JSON.stringify(threat_area.features[idxm].attributes);
			}
			if(!undoing && attrs != attrsLast){
				objHistory.push(attrs);
				attrsLast = attrs;
			}
			deriveVector = false;

			if(tempProbs != tempProbsLast){
				drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
				tempProbsLast = tempProbs;
			}
		}
		console.log(modifyFeature.feature.attributes.data['user'] + '2');
	}

	// compute error statistics for threat object
	function computeObjectErrorStats(xs,ys,spdDiff,angDiff){
		// Compute average error in direction
               	xErr = [];
                yErr = [];
                angs = [];
                xDiff = xs.average();
              	yDiff = ys.average();
               	timeDiff = ts.average();
                for(i=0;i<xs.length;i++){
	                xErr.push(Math.abs(xDiff - xs[i]));
                        yErr.push(Math.abs(yDiff - ys[i]));
                        ang = 270 - (Math.atan2(ys[i],xs[i]) * 180 / Math.PI);
                        if(ang >= 360){
                              	ang = ang - 360;
                        }
                        else if(ang < 0){
                                ang = ang + 360;
                        }
                       	angs.push(ang);
              	}
                angAvg = angs.average();
                angDiffs = [];
                for(var i=0;i<angs.length;i++){
                      	ang = Math.abs(angs[i] - angAvg);
	               	if(ang >= 360){
                                ang = ang - 360;
                       	}
                       	else if(ang < 0){
                                ang = ang + 360;
                        }
                       	angDiffs.push(ang);
                }
              	ang = Math.round(angDiffs.average());
                if(ang > angDiff && ang < 45){
                        angDiff = ang;
                }

		// Compute Motion Vector
                newDir = 270 - Math.round(Math.atan2(yDiff,xDiff) * 180 / Math.PI);
                if(newDir >= 360){
                        newDir = newDir - 360;
                }
                else if(newDir < 0){
                        newDir = newDir + 360;
                }
                newSpeed = -1 * Math.round((Math.sqrt((xDiff * xDiff) + (yDiff * yDiff))/ timeDiff) * 1.94384);
		if(newSpeed > 100){
			newSpeed = 100;
		}
                for(var i=0;i<tempSpeeds.length;i++){
                        tempSpeeds[i] = newSpeed;
                        tempDirs[i] = newDir;
                }

          	// Compute average error in speed
                xStd = xErr.average();
                yStd = yErr.average();
                newSpd = Math.round((Math.sqrt((xStd * xStd) + (yStd * yStd))/ (-1 * timeDiff)) * 1.94384);
                if(newSpd > spdDiff && newSpd < newSpeed){
	                spdDiff = newSpd;
                }
               	newDir = Math.round(Math.atan2(yStd,xStd) * 180 / Math.PI);
                for(var i=0;i<tempSpd.length;i++){
                        tempSpd[i] = spdDiff;
                        tempDir[i] = angDiff;
               	}
	}

	// move threat when time is changed
	function moveThreat(){
		keys = getKeys(data);
		if(newFeature2 || updateThreat || wofRecommender || assigningStart || keys.indexOf(String(timeCanvasVal.getAttr('time'))) == -1){
			return;
		}
		cloneSet = false;
		if(threat_area.features.length > 0){
			setHistory = false;
			//modifyFeatureDrawn = false;
			if(startPoint != null && timeCanvasVal.getAttr('time') == moveThreatTime || moveThreatTime == null){
				moveThreatTime = timeCanvasVal.getAttr('time');
                                return;
                        }
			var idx4 = -999;
			for(var i4=0;i4<threat_area.features.length;i4++){
				if(typeof threat_area.features[i4].attributes.data['types'] === 'string'){
	                               	modType = threat_area.features[i4].attributes.data['types'];
	                       	}
	                       	else{
	                               	modType = threat_area.features[i4].attributes.data['types'][0];
	                        }
	                        if(threat_area.features[i4].attributes.data){
					if(modType.split('_')[0] == threat_area.features[i4].attributes.data['id']){
						idx4 = i4;
						break;
					}
					else if(types.indexOf(modType) != -1){
		                                idx4 = i4;
						break;
					}
	                	}
	                }
			if(idx4 == -999 || moveThreatTime > threat_area.features[idx4].attributes.data['valid_start']){
				moveThreatTime = timeCanvasVal.getAttr('time');
				modifyFeatureDrawn = true;
				return;
			}
			if(modifyFeature != null && modifyFeature.feature != null){
				var scanTimes = [];
				for(var i=0;i<=volumes;i++){
					scanTimes.push(parseInt(scans[i][0].split('_')[1]));
				}
				if(scanTimes.indexOf(parseInt(timeCanvasVal.getAttr('time'))) != -1 && timeCanvasVal.getAttr('time') > modifyFeature.feature.attributes.data['valid_start']){
					newScanHere = false;
					assignValidStart();
				}
				if(modifyFeature.feature.attributes.data['dirs'][0] != modifyFeature.feature.attributes.data['dirs_orig'][0]){
					modifyFeature.feature.attributes.data['dirs_orig'] = modifyFeature.feature.attributes.data['dirs'];
					resetThreat('all');
			                unhighlightThreat();
	        		        //selectGrid();
					//modifyFeature.setFeature(threat_area.features[idx4]);
				}
				modifyFeature.unsetFeature();
				setHistory = false;
                               	modifyFeature.feature = null;
				//alert(timeCanvasVal.getAttr('time') + ',' + threat_area.features[idx4].attributes.data['valid_start'] + ',' + moveThreatTime + ',' + idx4);
				if(timeCanvasVal.getAttr('time') == threat_area.features[idx4].attributes.data['valid_start']){
					//document.getElementById('warningConfig').style.display = 'block';
					//loadConfigPanel();
					if(moveThreatTime == timeCanvasVal.getAttr('time')){
						startPoint = threat_area.features[idx4].geometry.getCentroid();
						startClone = threat_area.features[idx4].clone();
						console.log('startClone1');
					}
				}
				else if(timeCanvasVal.getAttr('time') < threat_area.features[idx4].attributes.data['valid_start']){
					document.getElementById('warningConfig').innerHTML = '';
					document.getElementById('chart1').innerHTML = '';
			                document.getElementById('chart2').innerHTML = '';
	                		document.getElementById('chart3').innerHTML = '';
	                		document.getElementById('chart5').innerHTML = '';
	                		document.getElementById('chart6').innerHTML = '';
	                		document.getElementById('attrButtons').innerHTML = '';
	                		document.getElementById('activateThreat').innerHTML = '';
					config = false;
				}
			}
			else if(timeCanvasVal.getAttr('time') == threat_area.features[idx4].attributes.data['valid_start'] && moveThreatTime == timeCanvasVal.getAttr('time')){
				startPoint = threat_area.features[idx4].geometry.getCentroid();
				startClone = threat_area.features[idx4].clone();
				console.log('startClone2');
			}
			if(objTypeMove == null){
                               	objTypeMove = threat_area.features[idx4].attributes.data['types'][0];
                       	}
                	if(timeCanvasVal.getAttr('time') < parseInt(threat_area.features[idx4].attributes.data['valid_start'])){
				if(featureTypes.length == 0){
					var geojson_format = new OpenLayers.Format.JSON();
	                                featureTypes = JSON.stringify(threat_area.features[idx4].attributes.data['types']);
					newID = '"' + threat_area.features[idx4].attributes.data['id'] + '_1"';
                                        threat_area.features[idx4].attributes.data['types'] = geojson_format.read([newID]);
	                        }
	                }
	                else if(featureTypes.length > 0){
	                        var geojson_format = new OpenLayers.Format.JSON();
	                        threat_area.features[idx4].attributes.data['types'] = geojson_format.read(featureTypes);
				featureTypes = [];
			}
			tStart = parseInt(threat_area.features[idx4].attributes.data['valid_start']);
			timeDiff = timeCanvasVal.getAttr('time') - threat_area.features[idx4].attributes.data['valid_start'];
			centerPoint = threat_area.features[idx4].geometry.getCentroid();
			if(startPoint == null){
				startPoint = threat_area.features[idx4].geometry.getCentroid();
			}
	
			var idx = -99;
			if(threat_area.features[idx4].attributes.data.modified['object'] == -99){
				var jsonFormat = new OpenLayers.Format.GeoJSON();
				var geojson_format = new OpenLayers.Format.JSON();
				var objID = threat_area.features[idx4].attributes.data['id'];
			       	if(objTypeMove == 'severe1'){
			               	var objType = 'probSevere';
					var hType = 'severe';
			       	}
			       	else if(objTypeMove == 'lightning1'){
			               	var objType = 'lightning';
					var hType = 'lightning';
			       	}
			       	//var link = 'realtime/ewp/getObjectReset.php?objID=' + objID + '&archive=' + acase + '&site=' + site + '&now=' + timeCanvasVal.getAttr('time') + '&type=' + objType;
				var tNow = new Date(timeCanvasVal.getAttr('time') * 1000);
				var probSevereDate = String(tNow.getUTCFullYear()) + String(pad(tNow.getUTCMonth() + 1)) + String(pad(tNow.getUTCDate())) + String(pad(tNow.getUTCHours())) + String(pad(tNow.getUTCMinutes())) + String(pad(tNow.getUTCSeconds()));
				if(archive){
					var link = 'realtime/ewp/ewpProbs.php?d=' + probSevereDate + '&fcstr=' + user + '&type=' + hType + '&block=1&archive=1';
				}
				else{
					var link = 'realtime/ewp/ewpProbs.php?d=' + probSevereDate + '&fcstr=' + user + '&type=' + hType + '&block=1&archive=0';
				}
			       	var dataRequest = new XMLHttpRequest();
			       	dataRequest.open('GET', link, false);
			       	dataRequest.send();
			       	var objData = jsonFormat.read(dataRequest.responseText);
				for(var i=0;i<objData.length;i++){
					if(objData[i].attributes.data['id'] == objID){
						if(objData[i].attributes.data.modified['object'] == 0){
							var idx = i;
						}
						break;
					}
				}
				if(idx != -99){
				        var ob = objData[idx].geometry.clone();
					if(ob.getCentroid().y < 90){
					        ob = ob.transform(proj,proj2);
					}
					// if block retains orginal object shape/pos throughout movement
					if(timeCanvasVal.getAttr('time') == parseInt(geojson_format.read(parseInt(scans[scans.length - 1][0].split('_')[1])))){
						if(threat_area.features[idx4].attributes.data.hasOwnProperty('buffer')){
							objData[idx].attributes.data['buffer'] = threat_area.features[idx4].attributes.data['buffer'];
						}
						if(threat_area.features[idx4].attributes.data.hasOwnProperty('bufDir')){
	                                               	objData[idx].attributes.data['bufDir'] = threat_area.features[idx4].attributes.data['bufDir'];
	                                       	}
						if(threat_area.features[idx4].attributes.data.hasOwnProperty('objOffsetX')){
	                                               	objData[idx].attributes.data['objOffsetX'] = objOffsetX;
							objData[idx].attributes.data['objOffsetY'] = objOffsetY;
	                                       	}
					}
					var bufObj = new OpenLayers.Feature.Vector(ob,objData[idx].attributes);
					var tempAttrs = geojson_format.read(JSON.stringify(threat_area.features[idx4].attributes));
					var a1 = [];
				       	var a2 = [];
				        renderObjects(bufObj.clone(), now, a1, a2);
				        bufObj = a1[0];
					bufObj = new OpenLayers.Feature.Vector(bufObj.geometry.clone(),tempAttrs);
					if(timeCanvasVal.getAttr('time') == parseInt(geojson_format.read(parseInt(scans[scans.length - 1][0].split('_')[1])))){
						bufClone = ob.clone();
						bufCloneTime = objData[idx].attributes.data['valid_start'];
                                                startPoint = bufObj.geometry.getCentroid();
                                                startClone = bufObj.clone();
                                                console.log('startClone5');
                                       	}
					if(threat_area.features[idx4].attributes.data['centers'].hasOwnProperty(timeCanvasVal.getAttr('time'))){
                                                var x = threat_area.features[idx4].attributes.data['centers'][timeCanvasVal.getAttr('time')]['x'] - bufObj.geometry.getCentroid().x;
                                               	var y = threat_area.features[idx4].attributes.data['centers'][timeCanvasVal.getAttr('time')]['y'] - bufObj.geometry.getCentroid().y;
                                                if(!isNaN(x) && !isNaN(y)){
							bufObj.geometry.move(x,y);
						}
                                       	}
					threat_area.removeAllFeatures();
                                        threat_area.addFeatures([bufObj]);
                                        idx4 = threat_area.features.length-1;
				}
			}
			if(idx == -99){
				threat_area.features[idx4].geometry.move(startPoint.x - centerPoint.x,startPoint.y - centerPoint.y);
	                        if(threat_area.features[idx4].attributes.data['centers'].hasOwnProperty(timeCanvasVal.getAttr('time')) && threat_area.features[idx4].attributes.data['centers'].hasOwnProperty(tStart) && timeCanvasVal.getAttr('time') != tStart){
	                                x = threat_area.features[idx4].attributes.data['centers'][timeCanvasVal.getAttr('time')]['x'] - threat_area.features[idx4].attributes.data['centers'][tStart]['x'];
	                                y = threat_area.features[idx4].attributes.data['centers'][timeCanvasVal.getAttr('time')]['y'] - threat_area.features[idx4].attributes.data['centers'][tStart]['y'];
	                        }
	                        else{
	                                dis = threat_area.features[idx4].attributes.data['speeds'][0] * timeDiff * 0.514444;
	                                x = Math.cos((270 - threat_area.features[idx4].attributes.data['dirs'][0]) * Math.PI / 180) * dis;
	                                y = Math.sin((270 - threat_area.features[idx4].attributes.data['dirs'][0]) * Math.PI / 180) * dis;
	                        }
				threat_area.features[idx4].geometry.move(x,y);
			}

			if(ftime == 0){
				configPanelLoaded = false;
				setHistory = false;
				modifyFeature.setFeature(threat_area.features[idx4]);
			}
			else{
				threat_area.redraw();
			}
			drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
			moveThreatTime = timeCanvasVal.getAttr('time');
			setHistory = true;
			modifyFeatureDrawn = true;
			if(radarImageLast != ''){
                        	eval(radarImageLast + '.setZIndex(1)');
                        }
		}
	}

	// event fired when threat area drawn
	function featureDrawn(feat){
		var parser = new jsts.io.OpenLayersParser();
               	geom = parser.read(threat_area.features[threat_area.features.length - 1].geometry);
		if(!geom.isValid()){
			alert('Invalid Geometry!  Try again.');
			threat_area.removeAllFeatures();
			return;
		}
		else{
			// check area of threat object
			area = threat_area.features[threat_area.features.length - 1].geometry.getArea();
			console.log('Area: ' + area);
			if(area < 25000000){
				center = threat_area.features[threat_area.features.length - 1].geometry.getCentroid();
				newVerts = new Array();
                                for(var i=0;i<=360;i+=10){
                                       	x = center.x + (Math.cos(i * Math.PI / 180) * (5000));
                                       	y = center.y + (Math.sin(i * Math.PI / 180) * (5000));
					vert = new OpenLayers.Geometry.Point(x,y);
                                        newVerts.push(vert);
                               	}
                               	linearRing = new OpenLayers.Geometry.LinearRing(newVerts);
                               	newFeat = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([linearRing]));
                               	//threat_area.removeFeatures([threat_area.features[threat_area.features.length - 1]]);
				threat_area.removeAllFeatures();
                                threat_area.addFeatures([newFeat]);
			}
		}
		id = id + 1;
		
		if(drawType == 'tornado'){
			document.getElementById("tornadoButton").onclick = unloadConfigPanel;
		}
		else if(drawType == 'severe'){
                        document.getElementById("severeButton").onclick = unloadConfigPanel;
                }
		else if(drawType == 'hail'){
                        document.getElementById("hailButton").onclick = unloadConfigPanel;
                }
		else if(drawType == 'wind'){
                        document.getElementById("windButton").onclick = unloadConfigPanel;
                }
		else if(drawType == 'lightning'){
                        document.getElementById("lightningButton").onclick = unloadConfigPanel;
                }

		if(controlType == 'ellipse'){
			ellipseControl.deactivate();
		}
		else if(controlType == 'polygon'){
			polygonControl.deactivate();
			// reduce number of points (if needed)
			verts = threat_area.features[threat_area.features.length - 1].geometry.getVertices();
			if(verts.length > 40){
				fraction = verts.length / 40;
				fraction_orig = verts.length / 40;
				count = 0;
				newVerts = new Array();
				for(i=0;i<verts.length;i++){
					count++;
					if(i >= fraction){
						newVerts.push(verts[i]);
						fraction = fraction + fraction_orig;
					}
				}
				newVerts.push(verts[0]);
				linearRing = new OpenLayers.Geometry.LinearRing(newVerts);
                                newFeat = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([linearRing]));
				threat_area.removeFeatures([threat_area.features[threat_area.features.length - 1]]);
				threat_area.addFeatures([newFeat]);
			}
		}
		//document.getElementById("createWarning").disabled = false;
		if(feat != 'myrorss'){
			threat_area.features[threat_area.features.length - 1].attributes.data = {};
			if(drawType == 'tornado'){
				threat_area.features[threat_area.features.length - 1].attributes.data['threatColor'] = 'rgb(255,0,0)';
			}
			else if(drawType == 'severe'){
                                threat_area.features[threat_area.features.length - 1].attributes.data['threatColor'] = 'rgb(255,255,0)';
                        }
			else if(drawType == 'hail'){
                                threat_area.features[threat_area.features.length - 1].attributes.data['threatColor'] = 'rgb(0,204,0)';
                        }
			else if(drawType == 'wind'){
                                threat_area.features[threat_area.features.length - 1].attributes.data['threatColor'] = 'rgb(0,0,255)';
                        }
			else if(drawType == 'lightning'){
                                threat_area.features[threat_area.features.length - 1].attributes.data['threatColor'] = 'rgb(255,128,0)';
                        }
			threat_area.features[threat_area.features.length - 1].attributes.data['types'] = [drawType + String(1)];
		}
		if(threat_area.features[threat_area.features.length - 1].attributes.data['duration'] == null){
                        threat_area.features[threat_area.features.length - 1].attributes.data['duration'] = default_duration;
               	}
		threat_area.features[threat_area.features.length - 1].attributes.data['id'] = id;
		threat_area.features[threat_area.features.length - 1].attributes.data['timeDiff'] = 0;
		threat_area.features[threat_area.features.length - 1].attributes.data['issue'] = '';
		threat_area.features[threat_area.features.length - 1].attributes.data['initiated'] = currentTime;
		threat_area.features[threat_area.features.length - 1].attributes.data['wfo'] = radarLocs[site];
		threat_area.features[threat_area.features.length - 1].attributes.data['site'] = site;
		threat_area.features[threat_area.features.length - 1].attributes.data['centers'] = {};
		threat_area.features[threat_area.features.length - 1].attributes.threatColor = threat_area.features[threat_area.features.length - 1].attributes.data['threatColor'];
                threat_area.features[threat_area.features.length - 1].attributes.zindex = 1;
		//if(archive){
                        threat_area.features[threat_area.features.length - 1].attributes.data['valid_start'] = parseInt(scans[scans.length - 1][0].split('_')[1]);
                        threat_area.features[threat_area.features.length - 1].attributes.data['valid_end'] = parseInt(scans[scans.length - 1][0].split('_')[1] + (60 * default_duration));
                //}
		if(feat != 'myrorss'){
			threat_area.features[threat_area.features.length - 1].attributes.data['recommender_id'] = id; // needed for object discussion retension
			threat_area.features[threat_area.features.length - 1].attributes.data['recommender_value'] = -999;
			threat_area.features[threat_area.features.length - 1].attributes.data['recommender_scale'] = -999;
                        threat_area.features[threat_area.features.length - 1].attributes.data['recommender_time'] = -999;
			threat_area.features[threat_area.features.length - 1].attributes.data['automated'] = 0;
			threat_area.features[threat_area.features.length - 1].attributes.data['allow'] = 1;
			threat_area.features[threat_area.features.length - 1].attributes.data['prediction'] = 'persistence';
			threat_area.features[threat_area.features.length - 1].attributes.data['elements'] = {'severity':'','warningType':'probability','warningThresh':0,'alertLevel':'takeAction','confidence':'','source':'radarIndicated','actions':'','impacts':''};
			threat_area.features[threat_area.features.length - 1].attributes.data['modified'] = {"direction":1,"speed":1,"duration":1,"probs":1,"discussion":1,"object":1,"severity":1,"warningType":1,"warningThresh":1,"alertLevel":1,"confidence":1,"source":1,"actions":1,"impacts":1,"prediction":1,"objShape":1,"objPosition":1};
			threat_area.features[threat_area.features.length - 1].attributes.data['ProbSevere'] = {"cape":"","shear":"","mesh":"","growth":"","glaciation":"","flashRate":"","lightningJump":"","prob":"","duration4":"","duration5":"","besttrack":0,"probHail":0,"probWind":0,"probTor":0,"mlcape":0,"mlcin":0,"srh01km":0,"mWind79":0,"vilDensity":0,"flashDensity":0,"maxllaz":0,"p98llaz":0,"p98mlaz":0,"wb0":0,"lr75":0,"rh7045":0,"abh":0};
			threat_area.features[threat_area.features.length - 1].attributes.data['AzShear'] = {"3-6kmAGL":"","0-2kmAGL":""};
			threat_area.features[threat_area.features.length - 1].attributes.data['Lightning'] = {"prob1":0,"prob2":0,"prob3":0,"prob4":0};
			threat_area.features[threat_area.features.length - 1].attributes.data['user'] = user;
			threat_area.features[threat_area.features.length - 1].attributes.data['init'] = -999;
			threat_area.features[threat_area.features.length - 1].attributes.data['InitTime'] = -999;
                        threat_area.features[threat_area.features.length - 1].attributes.data['Age'] = -999;
                        threat_area.features[threat_area.features.length - 1].attributes.data['LatRadius'] = -999;
                        threat_area.features[threat_area.features.length - 1].attributes.data['LonRadius'] = -999;
                        threat_area.features[threat_area.features.length - 1].attributes.data['Latitude'] = -999;
			threat_area.features[threat_area.features.length - 1].attributes.data['Longitude'] = -999;
			threat_area.features[threat_area.features.length - 1].attributes.data['MotionEast'] = -999;
			threat_area.features[threat_area.features.length - 1].attributes.data['MotionSouth'] = -999;
			threat_area.features[threat_area.features.length - 1].attributes.data['RowName'] = -999;
			threat_area.features[threat_area.features.length - 1].attributes.data['Size'] = -999;
			threat_area.features[threat_area.features.length - 1].attributes.data['Speed'] = -999;
			threat_area.features[threat_area.features.length - 1].attributes.data['Orientation'] = -999;
			threat_area.features[threat_area.features.length - 1].attributes.data['Direction'] = -999;
			threat_area.features[threat_area.features.length - 1].attributes.data['discussion'] = '';
			threat_area.features[threat_area.features.length - 1].attributes.data['Scale'] = -999; // gets overriden on transfer to other levels
			threat_area.features[threat_area.features.length - 1].attributes.data['buffer'] = 0;
			threat_area.features[threat_area.features.length - 1].attributes.data['bufDir'] = -1;
			threat_area.features[threat_area.features.length - 1].attributes.data['objOffsetX'] = 0;
			threat_area.features[threat_area.features.length - 1].attributes.data['objOffsetY'] = 0;
			threat_area.features[threat_area.features.length - 1].attributes.data['probs'] = [[]];
			threat_area.features[threat_area.features.length - 1].attributes.data['speeds'] = [];
			threat_area.features[threat_area.features.length - 1].attributes.data['dirs'] = [];
			threat_area.features[threat_area.features.length - 1].attributes.data['dirs_orig'] = [];
			threat_area.features[threat_area.features.length - 1].attributes.data['dir'] = [];
			threat_area.features[threat_area.features.length - 1].attributes.data['spd'] = [];
			for(i=0;i<default_dirs.length;i++){
				threat_area.features[threat_area.features.length - 1].attributes.data['probs'][0].push(default_probs[i]);
				threat_area.features[threat_area.features.length - 1].attributes.data['speeds'].push(default_speeds[i]);
	                        threat_area.features[threat_area.features.length - 1].attributes.data['dirs'].push(default_dirs[i]);
	                        threat_area.features[threat_area.features.length - 1].attributes.data['dirs_orig'].push(default_dirs_orig[i]);
				threat_area.features[threat_area.features.length - 1].attributes.data['dir'].push(15);
	                        threat_area.features[threat_area.features.length - 1].attributes.data['spd'].push(8);
			}
		}
		threat_area.redraw();
		tempId = threat_area.features[threat_area.features.length - 1].attributes.data['id'];
		tempDuration = threat_area.features[threat_area.features.length - 1].attributes.data['duration'];
		tempProbs =  threat_area.features[threat_area.features.length - 1].attributes.data['probs'][0];
		tempSpeeds = threat_area.features[threat_area.features.length - 1].attributes.data['speeds'];
		tempDirs = threat_area.features[threat_area.features.length - 1].attributes.data['dirs'];
		tempDirs_orig = threat_area.features[threat_area.features.length - 1].attributes.data['dirs_orig'];
		tempThreatColor = threat_area.features[threat_area.features.length - 1].attributes.data['threatColor'];
		tempSpd = threat_area.features[threat_area.features.length - 1].attributes.data['spd'];
		tempDir = threat_area.features[threat_area.features.length - 1].attributes.data['dir'];

		clone = threat_area.features[threat_area.features.length - 1].clone();
		moveThreatTime = parseInt(scans[scans.length - 1][0].split('_')[1]);
		//gstreets.setZIndex(3);
               	setLayerIndexes();
		threat_area.removeAllFeatures();
		threat_area.addFeatures([clone]);
		threatPanel = Ext.getCmp('threatPanel');
		threatPanel.show();
		modifyFeature.setFeature(threat_area.features[threat_area.features.length - 1]);
		loadConfigPanel(modifyFeature.feature.attributes.data['id']);
		vdate = new Date(modifyFeature.feature.attributes.data['valid_start'] * 1000);
		vtime = pad(vdate.getUTCHours()) + ':' + pad(vdate.getUTCMinutes()) + ':' + pad(vdate.getUTCSeconds()) + ' UTC';
                document.getElementById("threatTime").innerHTML = vtime;
		document.getElementById('radio_ellipse').disabled = true;
                document.getElementById('radio_polygon').disabled = true;
		selectGrid();
		newFeature2 = false;
		//changeTime();
		probChart(drawType + String(1), '');
		modifyFeatureDrawn = true;
		drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
		//eval(radarImageLast + '.setZIndex(1)');
	}

	// copy threat
	function copyThreatInit(){
		if(drawType != null){
			//modifyFeature.deactivate();
			//selectControl.activate();
			//resetSelectControl();
			//switchActiveThreats();
                        alert('Click on an object to transfer attributes into this editing session, otherwise re-click the "Copy Hazard Event" button to cancel');
                }
		else{
			drawType = 'copy';
			document.getElementById("warningConfig").innerHTML = '<font size="5"><b>Click on Threat Object to Copy  --></b></font>';
		}
		copyThreat = true;
		document.getElementById("copyButton2").src = "images/copyButtonSelect2.png";
                document.getElementById("copyButton2").onclick = stopCopy;
                document.getElementById("copyButton2").onmouseout = function(){this.src = "images/copyButtonSelect2.png";}
                document.getElementById("copyButton2").onmouseover = function(){this.src = "images/copyButtonSelect2.png";}
	}

	// copy object while in editing session
	function copyObjectEdit(){
		var clickPoint = new OpenLayers.Geometry.Point(mouseLon, mouseLat);
		clickPoint.transform(proj,proj2);
		var allFeats = [];
		var featAttrs = null;
                allFeats = allFeats.concat(probSevereObjects.features, azShearObjects.features, lightningObjects.features);
		for(var i=0;i<allFeats.length;i++){
			if(i == 0){
				console.log(mouseLon + ',' + mouseLat);
				console.log(clickPoint);
			}
			if(clickPoint.intersects(allFeats[i].geometry)){
				featAttrs = allFeats[i].attributes;
				break;
			}
		}
		if(featAttrs == null){
			alert('Could not find object, try again');
			return;
		}
		var geojson_format = new OpenLayers.Format.JSON();
		var tempAttrs = geojson_format.read(JSON.stringify(modifyFeature.feature.attributes));
               	var tempObj = modifyFeature.feature.geometry.clone();
		modifyFeature.unsetFeature();
                modifyFeature.feature = null;
		tempAttrs.data['dirs'] = featAttrs.data['dirs'];
		tempAttrs.data['dirs_orig'] = featAttrs.data['dirs_orig'];
		tempAttrs.data['dir'] = featAttrs.data['dir'];
		tempAttrs.data['spd'] = featAttrs.data['spd'];
		tempAttrs.data['speeds'] = featAttrs.data['speeds'];
		tempAttrs.data['probs'] = featAttrs.data['probs'];
		for(var mKey in tempAttrs.data.modified){
			tempAttrs.data.modified[mKey] = 1;
		}
		tempAttrs.data['prediction'] = featAttrs.data['prediction'];
		tempAttrs.data['discussion'] = featAttrs.data['discussion'];
		tempAttrs.data.elements = featAttrs.data.elements;
		tempAttrs.data['duration'] = featAttrs.data['duration'];
		tempAttrs.data['init'] = -999;
		tempAttrs.data['RowName'] = -999;
		tempAttrs.data['automated'] = 0;
		tempAttrs.data['initiated'] = currentTime;
		var tempFeat = new OpenLayers.Feature.Vector(bufClone,tempAttrs); // bufclone?
		threat_area.removeAllFeatures();
                threat_area.addFeatures([tempFeat]);
		modifyFeature.setFeature(threat_area.features[threat_area.features.length-1]);
		ndfd_grid2.removeAllFeatures();
                lightUpGridAccum2(true);
		stopCopy();
	}

	// copy threat
	function copyThreatObject(evIssue,evID){
                var gridPanel = Ext.getCmp('gridPanel');
		var allFeats = [];
                allFeats = allFeats.concat(probSevereObjects.features, azShearObjects.features, lightningObjects.features);
                if(evID != null){
                        for(var k3=0;k3<threatStore.data.items.length;k3++){
                                if(threatStore.data.items[k3].get('issue') == evIssue && threatStore.data.items[k3].get('eventID') == evID){
                                        var index = k3;
                                        break;
                                }
                        }
                        for(var j=0;j<allFeats.length;j++){
                                if(allFeats[j].attributes.data['issue'] == evIssue && allFeats[j].attributes.data['id'] == evID){
                                        var index2 = j;
                                        var newThreat = allFeats[j].clone();
                                        break;
                                }
                        }
                }
                else{
                        var selection = gridPanel.getSelectionModel();
                        for(var i=0;i<gridPanel.store.getCount();i++){
                                if(selection.isSelected(i)){
                                        var index = i;
                                        for(var j=0;j<allFeats.length;j++){
						if(allFeats[j].attributes.data['issue'] == gridPanel.store.getAt(i).data.issue && allFeats[j].attributes.data['id'] == gridPanel.store.getAt(i).data.id){
                                                        var index2 = j;
                                                        var newThreat = allFeats[j].clone();
                                                        break;
                                                }
                                        }
                                        break;
                                }
                        }
                }
		stopCopy();
               	drawType = newThreat.attributes.data['types'][0].slice(0,-1);
		var geojson_format = new OpenLayers.Format.JSON();
                attrs = geojson_format.read(JSON.stringify(newThreat.attributes));
                linearRing = new OpenLayers.Geometry.LinearRing(newThreat.geometry.getVertices());
                tempFeat = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([linearRing]),attrs);
		tempFeat.attributes.data['buffer'] = 0;
		tempFeat.attributes.data['bufDir'] = -1;
		tempFeat.attributes.data['objOffsetX'] = 0;
		tempFeat.attributes.data['objOffsetY'] = 0;
		tempFeat.attributes.data.modified['objShape'] = 1;
		tempFeat.attributes.data.modified['objPosition'] = 1;
                tempFeat.attributes.data.modified['object'] = 1;
		tempFeat.attributes.data['automated'] = 0;
		tempFeat.attributes.data['init'] = -999;
		tempFeat.attributes.data['RowName'] = -999;
		tempFeat.attributes.data['initiated'] = currentTime;
		for(var mKey in tempFeat.attributes.data.modified){
                        tempFeat.attributes.data.modified[mKey] = 1;
                }
		threat_area.addFeatures([tempFeat.clone()]);
               	threatPanel = Ext.getCmp('threatPanel');
               	threatPanel.show();
              	featureDrawn('myrorss');
	}

	// stop copy
	function stopCopy(){
		if(drawType == 'copy'){
			document.getElementById("warningConfig").innerHTML = '';
			drawType = null;
		}
		copyThreat = false;
		document.getElementById("copyButton2").onclick = function(){copyThreatInit();}
                document.getElementById("copyButton2").onmouseout = function(){this.src = "images/copyButton2.png";}
                document.getElementById("copyButton2").onmouseover = function(){this.src = "images/copyButtonHighlight2.png";}
                document.getElementById("copyButton2").src = "images/copyButton2.png";
	}

	// draw threat
	function drawThreat(controlType2){
		killPopup();
		if(drawType != null){
			//alert('You must deactivate other controls first');
			//return;
			if(drawType == controlType2){
				ellipseControl3.deactivate();
			       	polygonControl3.deactivate();
				ellipseControl.deactivate();
				polygonControl.deactivate();
				unloadConfigPanel();
				return;
			}
			else if(drawType == 'tornado'){
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
			if(!newFeature){
				if(controlType2 == "tornado"){
			               	threatColor = "rgb(255,0,0)";
					drawType = 'tornado';
			       	}
				else if(controlType2 == "severe"){
                                        threatColor = "rgb(255,255,0)";
                                        drawType = 'severe';
                                }
			       	else if(controlType2 == "hail"){
			               	threatColor = "rgb(0,204,0)";
			               	drawType = 'hail';
			       	}
			       	else if(controlType2 == "wind"){
			                threatColor = "rgb(0,0,255)";
			                drawType = 'wind';
			        }
			       	else if(controlType2 == "lightning"){
			               	threatColor = "rgb(255,128,0)";
			               	drawType = 'lightning';
			        }

			        button = drawType + "Button";
			        document.getElementById(button).src = "images/" + drawType + "ButtonSelect.png";
			        document.getElementById(button).onclick = unloadConfigPanel;
			        document.getElementById(button).onmouseout = function(){this.src = "images/" + drawType + "ButtonSelect.png";}
        			document.getElementById(button).onmouseover = function(){this.src = "images/" + drawType + "ButtonSelect.png";}

				if(drawTypeOrig != null){
					var geojson_format = new OpenLayers.Format.JSON();
               				tempAttrs = geojson_format.read(objectAttrs);
					tempAttrs.data['threatColor'] = threatColor;
				       	tempAttrs.threatColor = tempAttrs.data['threatColor'];
					tp = drawType + '1';
				       	tempAttrs.data['types'] = [tp];
					objectAttrs = JSON.stringify(tempAttrs);
				}
				else{
					document.getElementById("threat1").value = drawType + '1';
					addOpts(1); 
					changeThreatColor(modifyFeature.feature); 
					loadThreats(2);
					loadChartButtons();
					oldButton = 'prob1'; 
					document.getElementById(oldButton).click();
					modifyFeature.feature.attributes.data['elements']['severity'] = '';
					genSeverityHTML();
				}
			        return;
			}
			drawType = controlType2;
		}
		else if(!timeValTrip){
			//alert('Please advance to the latest base elevation scan and try again. Shrugs shoulders.');
			//return;
			goToEnd();
			drawType = controlType2;
		}
		else{
			drawType = controlType2;
		}
		if(drawTypeOrig != null){
			drawTypeOrig = drawType;
		}
		//selectControl.deactivate();
		//polygonControl2.deactivate();
		modifyFeature.deactivate();
		goToEnd();
		if(drawType == 'tornado'){
			document.getElementById("tornadoButton").src = "images/tornadoButtonSelect.png";
	                //document.getElementById("tornadoButton").onclick = unloadConfigPanel;
	                document.getElementById("tornadoButton").onmouseout = function(){this.src = "images/tornadoButtonSelect.png";}
	                document.getElementById("tornadoButton").onmouseover = function(){this.src = "images/tornadoButtonSelect.png";}
		}
		else if(drawType == 'severe'){
                        document.getElementById("severeButton").src = "images/severeButtonSelect.png";
                        //document.getElementById("severeButton").onclick = unloadConfigPanel;
                        document.getElementById("severeButton").onmouseout = function(){this.src = "images/severeButtonSelect.png";}
                        document.getElementById("severeButton").onmouseover = function(){this.src = "images/severeButtonSelect.png";}
                }
		else if(drawType == 'hail'){
                        document.getElementById("hailButton").src = "images/hailButtonSelect.png";
                        //document.getElementById("hailButton").onclick = unloadConfigPanel;
                        document.getElementById("hailButton").onmouseout = function(){this.src = "images/hailButtonSelect.png";}
                        document.getElementById("hailButton").onmouseover = function(){this.src = "images/hailButtonSelect.png";}
                }
		else if(drawType == 'wind'){
                        document.getElementById("windButton").src = "images/windButtonSelect.png";
                        //document.getElementById("windButton").onclick = unloadConfigPanel;
                        document.getElementById("windButton").onmouseout = function(){this.src = "images/windButtonSelect.png";}
                        document.getElementById("windButton").onmouseover = function(){this.src = "images/windButtonSelect.png";}
                }
		else if(drawType == 'lightning'){
                        document.getElementById("lightningButton").src = "images/lightningButtonSelect.png";
                        //document.getElementById("lightningButton").onclick = unloadConfigPanel;
                        document.getElementById("lightningButton").onmouseout = function(){this.src = "images/lightningButtonSelect.png";}
                        document.getElementById("lightningButton").onmouseover = function(){this.src = "images/lightningButtonSelect.png";}
                }

		if(drawTypeOrig != null){
			return;
		}
		
		if(document.getElementById('radio_ellipse').checked){
			polygonControl.deactivate();
			controlType = 'ellipse';
			ellipseControl.activate();
                        document.getElementById("warningConfig").innerHTML = '<font size="5"><b>Click and Drag on Map to Draw Polygon  --></b></font>';
		}
		else if(document.getElementById('radio_polygon').checked){
			ellipseControl.deactivate();
			controlType = 'polygon';
			polygonControl.activate();
                        document.getElementById("warningConfig").innerHTML = '<font size="5"><b>Click on Map to Draw Polygon  --></b></font>';
		}

		//document.getElementById('radio_ellipse').disabled = true;
                //document.getElementById('radio_polygon').disabled = true;
		
		newFeature = true;
		newFeature2 = true;
		activeThreatsBack.styleMap = styleMapThreat4_2;
               	activeThreats.styleMap = styleMapThreat3_2;
		//probSevereObjects.styleMap.strokeOpacity = 0.4;
                //probSevereObjectsBack.styleMap.strokeOpacity = 0.4;
               	//azShearObjects.styleMap.strokeOpacity = 0.4;
               	//azShearObjectsBack.styleMap.strokeOpacity = 0.4;
		probSevereObjects.styleMap = styleMapThreat3_2;
		probSevereObjectsBack.styleMap = styleMapThreat4_2;
		probSevereObjects.redraw();
		probSevereObjectsBack.redraw();
		azShearObjects.styleMap = styleMapThreat3_2;
		azShearObjectsBack.styleMap = styleMapThreat4_2;
		azShearObjects.redraw();
		azShearObjectsBack.redraw();
		lightningObjects.styleMap = styleMapThreat3_2;
                lightningObjectsBack.styleMap = styleMapThreat4_2;
                lightningObjects.redraw();
                lightningObjectsBack.redraw();
		legacy.styleMap = styleMapLegacy2;
                legacyBack.styleMap = styleMapLegacyBack2;
                legacy.redraw();
                legacyBack.redraw();
		changeTime();
	}

	function switchControl(){
		if(drawTypeOrig != null){
                        if(document.getElementById('radio_ellipse').checked){
                                polygonControl3.deactivate();
                                //controlType = 'ellipse';
                                ellipseControl3.activate();
                                document.getElementById("warningConfig").innerHTML = '<font size="5"><b>Click and Drag on Map to Draw Polygon  --></b></font>';
                       	}
                       	else if(document.getElementById('radio_polygon').checked){
                                ellipseControl3.deactivate();
                                //controlType = 'polygon';
                                polygonControl3.activate();
                                document.getElementById("warningConfig").innerHTML = '<font size="5"><b>Click on Map to Draw Polygon  --></b></font>';
                        }
                }
		else if(drawType != null){
			if(document.getElementById('radio_ellipse').checked){
	                       	polygonControl.deactivate();
				controlType = 'ellipse';
	                       	ellipseControl.activate();
	                       	document.getElementById("warningConfig").innerHTML = '<font size="5"><b>Click and Drag on Map to Draw Polygon  --></b></font>';
	               	}
	               	else if(document.getElementById('radio_polygon').checked){
				ellipseControl.deactivate();
	                       	controlType = 'polygon';
		                polygonControl.activate();
       	                	document.getElementById("warningConfig").innerHTML = '<font size="5"><b>Click on Map to Draw Polygon  --></b></font>';
        	       	}
		}
		changeTime();
	}

	function setNoHistory(){
		setHistory = false;
		//alert('hist');
	}

	// clear threat object
	function unBuildWarning(how){
		resetThreat();
		eval('map.removeLayer(' + radarImageLast + ');');
		radarImageLast = '';
		threat_area.removeAllFeatures();
		threat_region.removeAllFeatures();
		threat_points.removeAllFeatures();
		track_points.removeAllFeatures();
		threat_lines.removeAllFeatures();
		threat_lines_out.removeAllFeatures();
		swaths.removeAllFeatures();
		deletePendingRecords();
		revertUpdate();
		threat_orig = null;
		switchActiveThreats();
		p1 = null;
		p2 = null;
		controlType = null;
		modifyFeatureDrawn = false;
		durationValLast = 60;
		document.getElementById('radio_ellipse').disabled = false;
		document.getElementById('radio_polygon').disabled = false;
		centroid_last = null;
		ndfd_grid.removeAllFeatures();
		//ndfd_grid2.removeAllFeatures();
		updateThreat = false;
		document.getElementById('chart1').innerHTML = '';
		document.getElementById('chart2').innerHTML = '';
		document.getElementById('chart3').innerHTML = '';
		document.getElementById('chart5').innerHTML = '';
		document.getElementById('chart6').innerHTML = '';
		document.getElementById('attrButtons').innerHTML = '';
		document.getElementById('activateThreat').innerHTML = '';
		//selectGrid();
		readThreats();
		goToEnd();
		selectGrid();
	}

	// check if threat object should be reset
	function checkReset(){
		if(!newFeature2){
			setHistory = false;
			modifyThreat(updateThreat);
			if(modifyFeature.feature.attributes.data['valid_start'] == timeCanvasVal.getAttr('time')){
				loadConfigPanel(modifyFeature.feature.attributes.data['id']);
			}
		}
	}	

	// reset threat object
	function resetThreat(how){
		if(modifyFeature.feature != null && time_slider != null){
			//console.log('resetThreat');
			idLast = null;
			wofR = false;
			gridIndex = 0;
			//time_slider.setValue(0);
			ndfd_grid.removeAllFeatures();
			modifyFeature.unsetFeature();
			modifyFeature.feature = null;
			modifyFeature.destroy();
			threat_lines.removeAllFeatures();
                        threat_lines_out.removeAllFeatures();
			threat_points.removeAllFeatures();
                        threat_region.removeAllFeatures();
			config = false;
			p1 = null;
			p2 = null;      
			direction_slider = null;
			document.getElementById('chart1').innerHTML = '';
			document.getElementById('chart2').innerHTML = '';
			document.getElementById('chart3').innerHTML = '';
			document.getElementById('chart5').innerHTML = '';
			document.getElementById('chart6').innerHTML = '';
			document.getElementById('attrButtons').innerHTML = '';
			document.getElementById("warningConfig").innerHTML = "";
			document.getElementById('activateThreat').innerHTML = '';
			modifyFeature = new OpenLayers.Control.TransformFeature(threat_area,{
                                renderIntent: "transform",                          
                                rotationHandleSymbolizer: "rotate"  
                       	});
			map.addControl(modifyFeature);  
			modifyFeature.events.register('beforetransform','',assignValidStart);
			modifyFeature.events.register('transform','',function(){
				if(timeCanvasVal.getAttr('time') == parseInt(modifyFeature.feature.attributes.data['valid_start'])){
					adjustObjOffset();
					bufMove = true;
					console.log('object was not modified');
				}
				modifyThreat();
			});
			modifyFeature.events.register('transformcomplete','',lightUpGridAccumNew);
			modifyFeature.events.register('beforesetfeature','',setNoHistory);
			modifyFeature.events.register('setfeature','',function(){
				if(!resetPoly){
					checkReset();
				}
				if(config && document.getElementById(oldButton)){
					document.getElementById(oldButton).click();
				}
			});
			resetSelectControl();
			selectGrid();
			if(how == 'all'){
	                        //modifyFeature.activate();
			}
		}
	}

	function readIssuedObjects(initRead){
		var geojson_format = new OpenLayers.Format.GeoJSON();
		var tNow = new Date(now * 1000);
                var tNowDate = tNow.getUTCFullYear() + pad(tNow.getUTCMonth() + 1) + pad(tNow.getUTCDate()) + pad(tNow.getUTCHours()) + pad(tNow.getUTCMinutes()) +pad(tNow.getUTCSeconds());
		activeIDs = [];
		if(archive){
                        var url1 = 'realtime/ewp/ewpProbs.php?d=' + tNowDate + '&fcstr=' + user + '&type=severe&archive=1&automated=0';
			var url2 = 'realtime/ewp/ewpProbs.php?d=' + tNowDate + '&fcstr=' + user + '&type=tornado&archive=1&automated=0';
			var url3 = 'realtime/ewp/ewpProbs.php?d=' + tNowDate + '&fcstr=' + user + '&type=lightning&archive=1&automated=0';
                }
                else{
                        var url1 = 'realtime/ewp/ewpProbs.php?d=' + tNowDate + '&fcstr=' + user + '&type=severe&archive=0&automated=0';
			var url2 = 'realtime/ewp/ewpProbs.php?d=' + tNowDate + '&fcstr=' + user + '&type=tornado&archive=0&automated=0';
			var url3 = 'realtime/ewp/ewpProbs.php?d=' + tNowDate + '&fcstr=' + user + '&type=lightning&archive=0&automated=0';
                }

		// get severe objects
		var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', url1, false);
                dataRequest.send();

		var severeObjects = geojson_format.read(dataRequest.responseText.split("\n")[0]);
		for(var i=0;i<severeObjects.length;i++){
			var feat = severeObjects[i];
			if(feat.attributes.data['user'] == user){
				insertRecord(feat,'Issued','insert');
				activeIDs.push(String(feat.attributes.data['id']));
			}
		}

		// get tornado objects
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', url2, false);
                dataRequest.send();

                var tornadoObjects = geojson_format.read(dataRequest.responseText.split("\n")[0]);
                for(var i=0;i<tornadoObjects.length;i++){
                        var feat = tornadoObjects[i];
                        if(feat.attributes.data['user'] == user){
				insertRecord(feat,'Issued','insert');
				activeIDs.push(String(feat.attributes.data['id']));
			}
                }

		// get lightning objects
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', url3, false);
                dataRequest.send();

                var lghtObjects = geojson_format.read(dataRequest.responseText.split("\n")[0]);
                for(var i=0;i<lghtObjects.length;i++){
                        var feat = lghtObjects[i];
                        if(feat.attributes.data['user'] == user){
                                insertRecord(feat,'Issued','insert');
				activeIDs.push(String(feat.attributes.data['id']));
                        }
                }

		if(initRead == 'init'){
			// getIDCount.php
			url = 'getIDCount.php?user=' + user + '&case=' + acase;
			var dataRequest = new XMLHttpRequest();
	                dataRequest.open('GET', url, false);
	                dataRequest.send();
			id = parseInt(dataRequest.responseText);
		}

	}

	// read/display prior threats
        function readThreats(insert){
		return;
		if(insert == null && !archive){
			return;
		}
                featureList = new Array();
                var geojson_format = new OpenLayers.Format.GeoJSON();
		tCheck = currentTime - parseInt(initArchiveTimeOrig);
		//alert(currentTime + ',' + initArchiveTime + ',' + logTime + ',' + tCheck);
                url = 'get_threats.php?user=' + user + '&case=' + acase + '&site=' + site + '&inTime=' + tCheck;
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', url, false);
                dataRequest.send();
		if(insert == null){
                       	return;
               	}
                links = dataRequest.responseText.split(',');
                issuedThreats = [];
                //activeThreats.removeAllFeatures();
                //activeThreatClones.removeAllFeatures();
                idLast = 0;
                for(var i3=0;i3<links.length;i3++){
                        if(links[i3].length > 0 && links[i3].indexOf(user) != -1){
				if(archive){
	                                url = 'threats/' + acase + '/' + links[i3] + '?' + (new Date()).getTime();
				}
				else{
					url = 'realtime/ewp/threats/' + links[i3] + '?' + (new Date()).getTime();
				}
                                var dataRequest = new XMLHttpRequest();
                                dataRequest.open('GET', url, false);
                                dataRequest.send();
                                threats = dataRequest.responseText.split("\n");
                                var j2 = 0;
                                for(var j=(threats.length - 1);j>=0;j--){
                                        if(threats[j].length > 0){
                                                threatFeature = geojson_format.read(threats[j]);
                                                if((currentTime - threatFeature[0].attributes.data['issue']) < 43200){
                                                        j2++;
                                                        if(j2 == 1){
								timeLast = threatFeature[0].attributes.data['valid_end'];
                                                        }
                                                        else{
								if(threatFeature[0].attributes.data['valid_end'] > timeLast){
									if(banList.indexOf(threatFeature[0].attributes.data['id']) == -1){
										banList.push(threatFeature[0].attributes.data['id']);
									}
									//break;
								}
								threatFeature[0].attributes.data['valid_end'] = newValidEnd;
								if(grids.indexOf(threatFeature[0].attributes.issue) != -1 && gridData[threatFeature[0].attributes.issue][0].features[0].attributes.end != (newValidEnd - 1)){
									for(j3=0;j3<gridData[threatFeature[0].attributes.issue][0].features.length;j3++){
										gridData[threatFeature[0].attributes.issue][0].features[j3].attributes.end = (newValidEnd - 1);
									}
								}
                                                        }
                                                        threatFeature[0].geometry.transform(proj,proj2);
                                                        //activeThreats.addFeatures([threatFeature[0]]);
                                                        //activeThreatClones.addFeatures([threatFeature[0]]);
                                                        var newValidEnd = threatFeature[0].attributes.data['valid_start'];
                                                        readGrid(threatFeature[0].attributes.data['issue']);
                                                }
                                                if(threatFeature[0].attributes.data['id'] > idLast){
                                                        id = threatFeature[0].attributes.data['id'];
                                                        idLast = id;
                                                }
                                        }
                                }
				for(var j=0;j<threats.length;j++){
					if(threats[j].length > 0){
                                                threatFeature = geojson_format.read(threats[j]);
                                               	if((currentTime - threatFeature[0].attributes.data['issue']) < 43200 && banList.indexOf(threatFeature[0].attributes.data['id']) == -1){
							if(insert != null){
                                                               	insertRecord(threatFeature[0].clone(),'Issued',insert);
                                                        }
                                                        else{
                                                               	insertRecord(threatFeature[0].clone(),'Issued');
                                                        }
						}
					}
				}
                        }
                }
        }

	// start redefining threat area geometry
	function startRedefineThreat(){
		if(startPoint == null){
			alert('Must be editing an object to redraw it');
			return;
		}
		decoupleVector();
		clone = threat_area.features[0].clone();

		// store object attributes
                objectAttrs = JSON.stringify(modifyFeature.feature.attributes);
		try{
			autoObjCheck = document.getElementById('autoObject').checked;
		}
		catch(err){
			autoObjCheck = false;
		}

		// clear current threat
		drawTypeOrig = drawType;
		//updateThreatOrig = updateThreat;
		//drawType = null;
		unloadConfigPanel();
		threat_area.removeAllFeatures();

		// switch controls
		document.getElementById('radio_ellipse').disabled = false;
                document.getElementById('radio_polygon').disabled = false;
		modifyFeature.deactivate();
		switchControl();

		document.getElementById("redrawHazard").src = "images/drawButtonSelect.png";
                document.getElementById("redrawHazard").onclick = stopRedraw;
                document.getElementById("redrawHazard").onmouseout = function(){this.src = "images/drawButtonSelect.png";}
                document.getElementById("redrawHazard").onmouseover = function(){this.src = "images/drawButtonSelect.png";}

		//document.getElementById("warningConfig").innerHTML = '<font size="5"><b>Click on Map to Draw Polygon  --></b></font>';
	}

	function stopRedraw(){
		finishRedefineThreat();
	}

	// finish redefining threat area geometry
	function finishRedefineThreat(){
		// check validity of geometry
		var parser = new jsts.io.OpenLayersParser();
		var featRedrawn = true;
		if(threat_area.features.length == 0){
			threat_area.addFeatures([clone.clone()]);
			featRedrawn = false;
		}
               	geom = parser.read(threat_area.features[0].geometry);
                if(!geom.isValid()){
                       	alert('Invalid Geometry!  Try again.');
                        threat_area.removeAllFeatures();
                        return;
                }
		else{
			// check area of threat object
                        area = threat_area.features[threat_area.features.length - 1].geometry.getArea();
                        console.log('New Area: ' + area);
                        if(area < 25000000){
                                center = threat_area.features[threat_area.features.length - 1].geometry.getCentroid();
                                newVerts = new Array();
                                for(var i=0;i<=360;i+=10){
                                        x = center.x + (Math.cos(i * Math.PI / 180) * (5000));
                                        y = center.y + (Math.sin(i * Math.PI / 180) * (5000));
                                        vert = new OpenLayers.Geometry.Point(x,y);
                                        newVerts.push(vert);
                                }
                                linearRing = new OpenLayers.Geometry.LinearRing(newVerts);
                                newFeat = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([linearRing]));
                                //threat_area.removeFeatures([threat_area.features[threat_area.features.length - 1]]);
                                threat_area.removeAllFeatures();
                                threat_area.addFeatures([newFeat]);
                        }
		}
		// switch controls
		document.getElementById('radio_ellipse').disabled = true;
                document.getElementById('radio_polygon').disabled = true;
                ellipseControl3.deactivate();
		polygonControl3.deactivate();
		modifyFeature.activate();
		drawType = drawTypeOrig;
		drawTypeOrig = null;
		//updateThreat = updateThreatOrig;

		// reduce geometry vertices
		clone = threat_area.features[0].clone();
		threat_area.removeAllFeatures();
		verts = clone.geometry.getVertices();
                if(verts.length > 40){
                        fraction = verts.length / 40;
                        fraction_orig = verts.length / 40;
                        count = 0;
                        newVerts = new Array();
                        for(i=0;i<verts.length;i++){
                                count++;
                               	if(i >= fraction){
                                        newVerts.push(verts[i]);
                                      	fraction = fraction + fraction_orig;
                               	}
                       	}
                       	newVerts.push(verts[0]);
                       	linearRing = new OpenLayers.Geometry.LinearRing(newVerts);
                       	clone = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([linearRing]));
               	}
		else{
			linearRing = new OpenLayers.Geometry.LinearRing(verts);
			clone = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([linearRing]));
		}

		// reassign object attributes
		var geojson_format = new OpenLayers.Format.JSON();
		clone.attributes = geojson_format.read(objectAttrs);
		if(featRedrawn){
			clone.attributes.data.modified['object'] = 1;
		}
		clone.attributes.data['valid_start'] = timeCanvasVal.getAttr('time');
		clone.attributes.data['valid_end'] = timeCanvasVal.getAttr('time') + (clone.attributes.data['duration'] * 60);
		clone.attributes.data['centers'] = {};
	        centers = {};
		threat_area.addFeatures([clone]);

		// reset threat modification
		modifyFeature.setFeature(threat_area.features[0]);
		swapAutomation(autoObjCheck);
                selectGrid();
                changeTime();
		document.getElementById("redrawHazard").onclick = function(){startRedefineThreat();}
                document.getElementById("redrawHazard").onmouseout = function(){this.src = "images/drawButton.png";}
                document.getElementById("redrawHazard").onmouseover = function(){this.src = "images/drawButtonHighlight.png";}
                document.getElementById("redrawHazard").src = "images/drawButton.png";
	}

	// decouple Motion Vector
	function decoupleVector(){
		updateThreat = false;
		modifyFeature.feature.attributes.data['centers'] = {};
		centers = {};
		checkReset();
		lightUpGridAccum2(true);
	}

	// anisotropic gaussian function
	function anisotropicGaussian(x,y,sigma_x,sigma_y,max_prob){
		max = (1 / 2 * Math.PI * sigma_x * sigma_y) * Math.exp(-1 * ((0/(2 * sigma_x * sigma_x)) + (0/(2 * sigma_y * sigma_y))));
		val =  (1 / 2 * Math.PI * sigma_x * sigma_y) * Math.exp(-1 * ((x * x/(2 * sigma_x * sigma_x)) + (y * y/(2 * sigma_y * sigma_y))));
		return Math.round((val / max) * max_prob);
	}

	// assign a new valid_start time if object is repositioned on map
	function assignValidStart(){
		ndfd_grid2.removeAllFeatures();
		if(newScanHere){
			return;
		}
		cloneSet = true;
		keys = getKeys(data);
		if(document.getElementById("threatTime") && parseInt(scans[scans.length - 1][0].split('_')[1]) != modifyFeature.feature.attributes.data['valid_start']){
			assigningStart = true;
			//decoupleVector();  // comment to retain past object positions while editing
			//updateThreat = false;  //  un-comment to retain past object positions while editing
			if(timeCanvasVal.getAttr('time') != parseInt(scans[scans.length - 1][0].split('_')[1])){
				// this is a problem - if a forecaster tries to edit the object on a scan that is not the latest (after switching to new product),
				// the code gets angry.  Temp solution is to advance to latest scan for them.
				goToEnd();
				changeTilt(0,0,'td_tilt_0',parseInt(scans[scans.length - 1][0].split('_')[1]));
				if(document.getElementById('autoObject') && document.getElementById('autoObject').checked){
					modifyAutoObject();
				}
				else{
					decoupleVector();
				}
			}
			else if(document.getElementById('autoObject') && document.getElementById('autoObject').checked){
				modifyAutoObject();
			}
			else{
				decoupleVector();  // comment to retain past object positions while editing
			}
			modifyFeature.feature.attributes.data['valid_start'] = parseInt(scans[scans.length - 1][0].split('_')[1]);
			vdate = new Date(modifyFeature.feature.attributes.data['valid_start'] * 1000);
                        vtime = pad(vdate.getUTCHours()) + ':' + pad(vdate.getUTCMinutes()) + ':' + pad(vdate.getUTCSeconds()) + ' UTC';
			document.getElementById("threatTime").innerHTML = vtime;
			deletePendingRecords();
			insertRecord(modifyFeature.feature.clone(),'Pending','insert');
			startPoint = null;
			assigningStart = false;
		}
		else if(timeCanvasVal.getAttr('time') > parseInt(scans[scans.length - 1][0].split('_')[1]) && keys.indexOf(String(timeCanvasVal.getAttr('time'))) == -1){
			assigningStart = true;
			changeTilt(0,0,'td_tilt_0',parseInt(scans[scans.length - 1][0].split('_')[1]));
			assigningStart = false;
		}
		else if(timeCanvasVal.getAttr('time') < parseInt(scans[scans.length - 1][0].split('_')[1]) && keys.indexOf(String(timeCanvasVal.getAttr('time'))) == -1){
			assigningStart = true;
			for(var k3=0;k3<scans.length;k3++){
				if(parseInt(scans[k3][0].split('_')[1]) > timeCanvasVal.getAttr('time')){
					break;
				}
				scanNum = k3;
			}
                       	changeTilt(0,0,'td_tilt_0',parseInt(scans[scanNum][0].split('_')[1]));
                        assigningStart = false;
		}
	}

	function showActiveThreats(){
		if(document.getElementById('showActiveThreats').checked){
			showAT = true;
			activeThreats.setVisibility(true);
			activeThreatsBack.setVisibility(true);
		}
		else{
			showAT = false;
			activeThreats.setVisibility(false);
			activeThreatsBack.setVisibility(false);
		}
		activeThreats.redraw();
		activeThreatsBack.redraw();
		changeTime();
	}

	function showTornado(){
                if(document.getElementById('showTornado').checked){
                        showT = true;
                        azShearObjects.setVisibility(true);
                        azShearObjectsBack.setVisibility(true);
                }
                else{
                        showT = false;
                        azShearObjects.setVisibility(false);
                        azShearObjectsBack.setVisibility(false);
                }
		legacyDateLast = null;
               	legacyTimeLast = null;
                azShearObjects.redraw();
                azShearObjectsBack.redraw();
                changeTime();
        }

	function showSevere(){
                if(document.getElementById('showSevere').checked){
                        showS = true;
                        probSevereObjects.setVisibility(true);
                        probSevereObjectsBack.setVisibility(true);
                }
                else{
                        showS = false;
                        probSevereObjects.setVisibility(false);
                        probSevereObjectsBack.setVisibility(false);
                }
		legacyDateLast = null;
                legacyTimeLast = null;
                probSevereObjects.redraw();
                probSevereObjectsBack.redraw();
                changeTime();
        }

	function showProbTor(){
		if(document.getElementById('showProbTor').checked){
			showPT = true;
		}
		else{
			showPT = false;
		}
                legacyDateLast = null;
                legacyTimeLast = null;
                probSevereObjects.redraw();
                probSevereObjectsBack.redraw();
                changeTime();
        }

	function showLightning(){
                if(document.getElementById('showLightning').checked){
                       	showL = true;
                       	lightningObjects.setVisibility(true);
                       	lightningObjectsBack.setVisibility(true);
			nldn.setVisibility(true);
                }
                else{
                        showL = false;
                        lightningObjects.setVisibility(false);
                        lightningObjectsBack.setVisibility(false);
			nldn.setVisibility(false);
               	}
               	lightningObjects.redraw();
                lightningObjectsBack.redraw();
               	changeTime();
        }

	function showBlocked(){
		if(document.getElementById('showBlock').checked){
			showBlock = 1;
			showB = true;
		}
		else{
			showBlock = 0;
			showB = false;
		}
		azShearTimeLast = 0;
                azShearDateLast = 0;
                probSevereTimeLast = 0;
               	probSevereDateLast = 0;
               	lightningTimeLast = 0;
               	lightningDateLast = 0;
		changeTime();
	}

	/*
	function switchActiveThreats(){
		if(document.getElementById('activeType').checked){
			activeStyle = true;
			activeThreats.styleMap = styleMapThreat3_3;
                }
                else{
			activeStyle = false;
			activeThreats.styleMap = styleMapThreat3;
                }
		activeThreatsBack.styleMap = styleMapThreat4;
                activeThreats.redraw();
                activeThreatsBack.redraw();
                changeTime();
	}
	*/

	function switchActiveThreats(){
                activeStyle = true;
                azShearObjects.styleMap = styleMapThreat3_3;
		probSevereObjects.styleMap = styleMapThreat3_3;
		lightningObjects.styleMap = styleMapThreat3_3;
                azShearObjectsBack.styleMap = styleMapThreat4;
                azShearObjects.redraw();
                azShearObjectsBack.redraw();
		probSevereObjectsBack.styleMap = styleMapThreat4;
                probSevereObjects.redraw();
                probSevereObjectsBack.redraw();
		lightningObjectsBack.styleMap = styleMapThreat4;
                lightningObjects.redraw();
                lightningObjectsBack.redraw();
		legacy.styleMap = styleMapLegacy;
                legacyBack.styleMap = styleMapLegacyBack;
                legacy.redraw();
                legacyBack.redraw();
                //changeTime();
        }

	function renderProbSlider(){

		try{
			var link = 'getValidProbs.php?user=' + user + '&apType=' + autoProbType + '&now=' + timeCanvasVal.getAttr('time');
		}
		catch(err){
			return;
		}
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();
		validProbs = dataRequest.responseText.split(',');
		if(autoProbType == 'severe'){
			validProbMinSevere = parseInt(validProbs[0]);
			validProbMaxSevere = parseInt(validProbs[1]);
			autoSpdSevere = parseInt(validProbs[2]);
			autoDirSevere = parseInt(validProbs[3].split("\n")[0]);
			var sel = document.getElementById('autoProbType');
			sel.style.backgroundColor='yellow';
		}
		else if(autoProbType == 'tornado'){
			validProbMinTornado = parseInt(validProbs[0]);
                        validProbMaxTornado = parseInt(validProbs[1]);
			autoSpdTornado = parseInt(validProbs[2]);
                       	autoDirTornado = parseInt(validProbs[3].split("\n")[0]);
			var sel = document.getElementById('autoProbType');
                       	sel.style.backgroundColor='red';
		}
		else if(autoProbType == 'lightning'){
                        validProbMinLightning = parseInt(validProbs[0]);
                        validProbMaxLightning = parseInt(validProbs[1]);
			autoSpdLightning = parseInt(validProbs[2]);
                       	autoDirLightning = parseInt(validProbs[3].split("\n")[0]);
                        var sel = document.getElementById('autoProbType');
                        sel.style.backgroundColor='orange';
                }
		validProbMin = parseInt(validProbs[0]);
		validProbMax = parseInt(validProbs[1]);
		autoSpd = parseInt(validProbs[2]);
		autoDir = parseInt(validProbs[3].split("\n")[0]);

		var createMulti = true;
		var validProbsSlider = Ext.getCmp('validProbs');
		if(validProbsSlider){
			createMulti = false;
		}
		else{
			// element hasn't been created, pull valid probs for tornado & lightning
			var link = 'getValidProbs.php?user=' + user + '&apType=tornado&now=' + timeCanvasVal.getAttr('time');
			var dataRequest = new XMLHttpRequest();
	               	dataRequest.open('GET', link, false);
	               	dataRequest.send();
	               	validProbs = dataRequest.responseText.split(',');
			validProbMinTornado = parseInt(validProbs[0]);
                       	validProbMaxTornado = parseInt(validProbs[1]);
			autoSpdTornado = parseInt(validProbs[2]);
			autoDirTornado = parseInt(validProbs[3].split("\n")[0]);

			var link = 'getValidProbs.php?user=' + user + '&apType=lightning&now=' + timeCanvasVal.getAttr('time');
                        var dataRequest = new XMLHttpRequest();
                        dataRequest.open('GET', link, false);
                        dataRequest.send();
                        validProbs = dataRequest.responseText.split(',');
                        validProbMinLightning = parseInt(validProbs[0]);
                        validProbMaxLightning = parseInt(validProbs[1]);
			autoSpdLightning = parseInt(validProbs[2]);
			autoDirLightning = parseInt(validProbs[3].split("\n")[0]);

			var link = 'getValidProbs.php?user=' + user + '&apType=severe&now=' + timeCanvasVal.getAttr('time');
                        var dataRequest = new XMLHttpRequest();
                        dataRequest.open('GET', link, false);
                        dataRequest.send();
                        validProbs = dataRequest.responseText.split(',');
                        validProbMinSevere = parseInt(validProbs[0]);
                        validProbMaxSevere = parseInt(validProbs[1]);
                        autoSpdSevere = parseInt(validProbs[2]);
                        autoDirSevere = parseInt(validProbs[3].split("\n")[0]);
		}

		if(createMulti){
			Ext.create('Ext.slider.Multi', {
			        renderTo: 'probSlider',
				id: 'validProbs',
			        //hideLabel: true,
			        width: 110,
			        minValue: 0,
			        maxValue: 100,
			        values: [validProbMin, validProbMax],
				listeners: {
	                            changecomplete: function(slider, newValue, thumb){
					updateValidProbs(thumb.index, newValue);
	                            },
				    change: function(slider, newValue, thumb){
					if(thumb.index == 0){
						if(autoProbType == 'severe'){
			                                validProbMinSevere = newValue;
			                        }
			                       	else if(autoProbType == 'tornado'){
			                                validProbMinTornado = newValue;
			                       	}
						else if(autoProbType == 'lightning'){
                                                        validProbMinLightning = newValue;
                                                }
			                        validProbMin = newValue;
			               	}
			               	else{
						if(autoProbType == 'severe'){
			                                validProbMaxSevere = newValue;
			                       	}
			                       	else if(autoProbType == 'tornado'){
			                               	validProbMaxTornado = newValue;
			                        }
						else if(autoProbType == 'lightning'){
                                                        validProbMaxLightning = newValue;
                                                }
			                       	validProbMax = newValue;
			                }
					document.getElementById('validProbMinLabel').innerHTML = validProbMin + '%';
					document.getElementById('validProbMaxLabel').innerHTML = validProbMax + '%';
					probSevereObjects.redraw();
					azShearObjects.redraw();
					lightningObjects.redraw();
				    }
				}
		    	});
		}
		else{
			validProbsSlider.setValue(0, validProbMin);
			validProbsSlider.setValue(1, validProbMax);
		}

		document.getElementById('validProbMinLabel').innerHTML = validProbMin + '%';
                document.getElementById('validProbMaxLabel').innerHTML = validProbMax + '%';
		document.getElementById('autoSpd').value = autoSpd;
		document.getElementById('autoDir').value = autoDir;
	}

	function updateValidProbs(thumb, newValue){
		if(thumb == 0){
			if(autoProbType == 'severe'){
				validProbMinSevere = newValue;
			}
			else if(autoProbType == 'tornado'){
				validProbMinTornado = newValue;
			}
			else if(autoProbType == 'lightning'){
                                validProbMinLightning = newValue;
                        }
			validProbMin = newValue;
		}
		else{
			if(autoProbType == 'severe'){
				validProbMaxSevere = newValue;
			}
                       	else if(autoProbType == 'tornado'){
				validProbMaxTornado = newValue;
			}
			else if(autoProbType == 'lightning'){
                                validProbMaxLightning = newValue;
                        }
			validProbMax = newValue;
		}
		document.getElementById('validProbMinLabel').innerHTML = validProbMin + '%';
               	document.getElementById('validProbMaxLabel').innerHTML = validProbMax + '%';

		var link = 'writeValidProbs.php?user=' + user + '&type=range&min=' + validProbMin + '&max=' + validProbMax + '&spd=' + autoSpd + '&dir=' + autoDir + '&inputTime=' + timeCanvasVal.getAttr('time') + '&apType=' + autoProbType + '&archive=' + acase;
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();
	}

	function loadAutoProbRange(){
		autoProbType = document.getElementById('autoProbType').value;
		renderProbSlider();
	}

	function domainOverride(){
		autoSpd = document.getElementById('autoSpd').value;
		autoDir = document.getElementById('autoDir').value;
		if(isNaN(parseFloat(autoSpd)) || autoSpd < -1){
			alert('Non-valid number entered for speed, try again');
			return;
		}
		if(isNaN(parseFloat(autoDir)) || autoDir < -1){
                       	alert('Non-valid number entered for direction, try again');
                       	return;
               	}
		if(autoProbType == 'severe'){
                       	autoSpdSevere = autoSpd;
			autoDirSevere = autoDir;
               	}
		else if(autoProbType == 'tornado'){
			autoSpdTornado = autoSpd;
                       	autoDirTornado = autoDir;
		}
		else if(autoProbType == 'lightning'){
			autoSpdLightning = autoSpd;
                       	autoDirLightning = autoDir;
		}
		var link = 'writeValidProbs.php?user=' + user + '&type=range&min=' + validProbMin + '&max=' + validProbMax + '&spd=' + autoSpd + '&dir=' + autoDir + '&inputTime=' + timeCanvasVal.getAttr('time') + '&apType=' + autoProbType + '&archive=' + acase;
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();
		alert('Domain direction = ' + autoDir + ' degrees and domain speed = ' + autoSpd);
	}
