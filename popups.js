	/*

        Copyright (c) 2014 Cooperative Institute for Mesoscale Meteorological Studies (CIMMS) and the University of Oklahoma

        Author:         Dr. Chris Karstens
        Email:          chris.karstens@noaa.gov
        Description:    Contains the following:
				1. generic function for generating popup windows on the map
				2. function for deleting the popup and associated events
        */

	function genPopup(feature){
		killPopup();
		if(feature.attributes.sname != null){
			if(feature.attributes.sname == site){
				selectControl.unselectAll();
                               	return;
			}
			resetSite(feature.attributes.sname);
			
		}
		else if(feature.attributes.CNTR_VALUE != null){
			if(feature.attributes.HLCL != null && feature.attributes.CNTR_VALUE == 25){
                                chart_values = new Array(5);
                                chart_data = new Array(5);
                                chart_values[0] = feature.attributes.HLCL.split('|');
                                chart_values[1] = feature.attributes.SBCAPE.split('|');
                                chart_values[2] = feature.attributes.MUCAPE.split('|');
                                chart_values[3] = feature.attributes.SRH.split('|');
                                chart_values[4] = feature.attributes.MAXUH.split('|');
                                case_year = parseInt(document.getElementById('initOpt').value.slice(0,4));
                                case_month = parseInt(document.getElementById('initOpt').value.slice(4,6)) - 1;
                                case_day = parseInt(document.getElementById('initOpt').value.slice(6,8));
                                chart_stime2 = new Date(case_year,case_month,case_day);
                                chart_stime2.setTime(chart_stime2.getTime() + (feature.attributes.STARTHR * 3600000 + feature.attributes.STARTMIN * 60000));
                                for(z=0;z<chart_values.length;z++){
                                        chart_stime = new Date(case_year,case_month,case_day);
                                        chart_stime.setTime(chart_stime.getTime() + (feature.attributes.STARTHR * 3600000 + feature.attributes.STARTMIN * 60000));
                                        chart_etime = new Date(case_year,case_month,case_day);
                                        chart_etime.setTime(chart_etime.getTime() + (feature.attributes.ENDHR * 3600000 + feature.attributes.ENDMIN * 60000));chart_data[z] = new Array(chart_values[z].length);
                                        c = -1;
                                        for(ct=chart_stime;ct<=chart_etime;ct.setTime(ct.getTime() + 300000)){
                                                c++;
                                                chart_data[z][c] = new Array(2);
                                                if(ct.getHours() == 0){
                                                        ampm = 'AM';
                                                        chart_hour = 12;
                                                }
                                                else if(ct.getHours() == 12){
                                                        ampm = 'PM';
                                                        chart_hour = 12;
                                                }
                                                else if(ct.getHours() < 13){
                                                        ampm = 'AM';
                                                        chart_hour = ct.getHours();
                                                }
                                                else{
                                                        ampm = 'PM';
                                                        chart_hour = ct.getHours() - 12;
                                                }
                                                now_time = ct.getFullYear() + '-' + pad(ct.getMonth() + 1) + '-' + pad(ct.getDate()) + ' ' + pad(chart_hour) + ':' + pad(ct.getMinutes()) + ampm;
                                                chart_data[z][c][0] = now_time;
                                                chart_data[z][c][1] = chart_values[z][c];
                                        }
                                }
                                popup_msg = '<div style="height:400px; width:500px">';
                                popup_msg += '<b><u>' + feature.attributes.MEMBER + ' WRF Updraft Helicity Object #' + feature.attributes.OBJID + '</u>:</b><br>';
                                popup_msg += "<b>Start:</b> " + chart_stime2.getFullYear() + '-' + pad(chart_stime2.getMonth() + 1) + '-' + pad(chart_stime2.getDate()) + ' ' + pad(chart_stime2.getHours()) + ':' + pad(chart_stime2.getMinutes()) + " UTC<br>";
                                popup_msg += "<b>End:</b> " + chart_etime.getFullYear() + '-' + pad(chart_etime.getMonth() + 1) + '-' + pad(chart_etime.getDate()) + ' ' + pad(chart_etime.getHours()) + ':' + pad(chart_etime.getMinutes()) + " UTC<br>";
                                popup_msg += "<b>Path Length:</b> " + feature.attributes.PATHLEN + " km<br>";
                                popup_msg += "<b>Duration:</b> " + feature.attributes.DURATION + " h<br><br>";
                                popup_msg += '<center>';
                                popup_msg += '<input type="button" value="HLCL" onClick="objectChart(chart_data[0],\'HLCL\',0,3000);"/>';
                                popup_msg += '<input type="button" value="SBCAPE" onClick="objectChart(chart_data[1],\'SBCAPE\',0,9000);"/>';
                                popup_msg += '<input type="button" value="MUCAPE" onClick="objectChart(chart_data[2],\'MUCAPE\',0,9000);"/>';
                                popup_msg += '<input type="button" value="0-3km SRH" onClick="objectChart(chart_data[3],\'SRH\',0,1000);"/>';
                                popup_msg += '<input type="button" value="MAXUH" onClick="objectChart(chart_data[4],\'MAXUH\',0,500);"/><br>';
				popup_msg += '<div class="example-plot" id="chart10" style="height:250px; width:450;"></div>';
                                popup_msg += '</center>';
                                popup_msg += '</div>';
                                x = 500;
                                y = 350;
                                chartGen = true;
                        }
                        else if(feature.attributes.CNTR_VALUE == 25){
                                popup_msg = "<div style='font-size:1.1em'><b><u>Updraft Helicity Object</u>:</b><br>";
                                popup_msg += "<b>Member:</b> " + feature.attributes.MEMBER + "<br>";
                                popup_msg += "<b>Object ID:</b> " + feature.attributes.OBJ_ID + "<br>";
                                popup_msg += "<b>Path Length:</b> " + feature.attributes.PATH_LEN + " km<br>";
                                popup_msg += "<b>Duration:</b> " + feature.attributes.DURATION + " h<br>";
                                popup_msg += "<b>Start:</b> " + feature.attributes.START + " hours after init.<br>";
                                popup_msg += "<b>End:</b> " + feature.attributes.END + " hours after init.<br>";
                                popup_msg += "<b>Contour:</b> " + feature.attributes.CNTR_VALUE + " m<sup>2</sup>s<sup>-2</sup><br>";
				chartGen = false;
                        }
                        else{
                                return;
                        }
	                popup = new OpenLayers.Popup.FramedCloud('chicken',
	                      feature.geometry.getBounds().getCenterLonLat(),
	                      new OpenLayers.Size(500,400),
	                      popup_msg,
	                      null,true,killPopup);
	                //popup.maxSize = new OpenLayers.Size(x,y);
	                popup.minSize = OpenLayers.Size(500,400);
	                popup.fixedRelativePosition = false;
	                //popup.panMapIfOutOfView = false;
	                //popup.keepInMap = true;
	                feature.popup = popup;
		        map.addPopup(popup);
			if(chartGen){
	       	                objectChart(chart_data[0],'HLCL',0,3000);
        	                $('#chart10').bind('jqplotMouseMove',     
        	                        function (ev, seriesIndex, pointIndex, data) {
        	                                if(data != null){
							uhTrack.removeAllFeatures();
        	                                        //alert(ev + ',' + seriesIndex + ',' + pointIndex + ',' + data);
        	                                        //console.log(ev, seriesIndex, pointIndex, data);
        	                                        latc = feature.attributes.LATC.split('|');
        	                                        lonc = feature.attributes.LONC.split('|');
        	                                        track_points1 = feature.attributes.tpoints;
        	                                        //alert(latc[data.pointIndex] + ',' + lonc[data.pointIndex]);
        	                                        point_1 = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(lonc[data.pointIndex],latc[data.pointIndex]).transform(proj,proj2),{'color':'#000000'});
        	                                        uhTrack.addFeatures([point_1]);
        	                                }
        	                                else{
        	                                        uhTrack.removeAllFeatures();
        	                                }
        	                        }
        	                );
			}
                }
		else if(feature.attributes.data != null){
			if(copyThreat && drawType == 'copy'){
				stopCopy();
				drawType = feature.attributes.data['types'][0].slice(0,-1);
				tempFeat1 = feature.clone();
				var geojson_format = new OpenLayers.Format.JSON();
                                attrs = geojson_format.read(JSON.stringify(tempFeat1.attributes));
				linearRing = new OpenLayers.Geometry.LinearRing(tempFeat1.geometry.getVertices());
	                        tempFeat = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([linearRing]),attrs);
				tempFeat.attributes.data['buffer'] = 0;
		                tempFeat.attributes.data['bufDir'] = -1;
		                tempFeat.attributes.data['objOffsetX'] = 0;
		                tempFeat.attributes.data['objOffsetY'] = 0;
		                tempFeat.attributes.data.modified['objShape'] = 0;
		                tempFeat.attributes.data.modified['objPosition'] = 0;
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
			else if(copyThreat && drawType != 'copy'){
				copyObjectEdit(feature.attributes.data['issue'],feature.attributes.data['id']);
			}
			else if(linkObjects){
				if(linkObj1 == null){
					linkObj1 = feature.attributes.data['id'];
					linkTime1 = timeCanvasVal.getAttr('time');
					linkThreat1 = feature.attributes.data['types'][0].slice(0,-1);
					linkIssue1 = feature.attributes.data['issue'];
					linkAuto1 = feature.attributes.data['automated'];
					var geojson_format = new OpenLayers.Format.JSON();
                                	linkAttrs = geojson_format.read(JSON.stringify(feature.attributes));
					linkGeom = feature.geometry.clone();
					document.getElementById("warningConfig").innerHTML = '<font size="5"><b>Object #' + linkObj1 + ' selected...<br>Click on Second (target) Object --></b></font>';
				}
				else{
					linkObj2 = feature.attributes.data['id'];
                                       	linkTime2 = timeCanvasVal.getAttr('time');
					var proceed = confirm('Transfer Object #' + linkObj1 + ' to Object #' + linkObj2 + '?');
                                        if(!proceed){
                                                stopLink();
                                               	return;
                                       	}
					if(linkTime1 > linkTime2){
						alert('Original object is newer than the object it is being paired with, try again...');
						stopLink();
						return;
					}
					else if(timeCanvasVal.getAttr('time') != scans[volumes][0].split('_')[1]){
						alert('Object transferring can only occur on the latest data scan, try again...');
                                                stopLink();
                                                return;
					}

					/*
					// old code to preserve Level of Automation during transfer
					if(linkAttrs.data.modified['object'] == 0){
						// override old geometry with new for L3 objects
						var tempFeat = feature.clone();
						var linearRing = new OpenLayers.Geometry.LinearRing(tempFeat.geometry.getVertices());
						linkGeom = new OpenLayers.Geometry.Polygon([linearRing]);
					}
					else{
						// move L1/L2 object to new position
						var x = feature.geometry.getCentroid().x - linkGeom.getCentroid().x;
						var y = feature.geometry.getCentroid().y - linkGeom.getCentroid().y;
						linkGeom.move(x,y);
					}
					*/

					// new code: forces Level 3 usage during transfer, nulls out buffer/offsetting/etc
					var tempFeat = feature.clone();
                                        var linearRing = new OpenLayers.Geometry.LinearRing(tempFeat.geometry.getVertices());
                                        linkGeom = new OpenLayers.Geometry.Polygon([linearRing]);
					linkAttrs.data.modified['object'] = 0;
					linkAttrs.data.modified['objShape'] = 0;
					linkAttrs.data.modified['objPosition'] = 0;
					linkAttrs.data['buffer'] = 0;
					linkAttrs.data['bufDir'] = -1;
					linkAttrs.data['objOffsetX'] = 0;
					linkAttrs.data['objOffsetY'] = 0;
					linkAttrs.data['automated'] = 2;

			                var newThreat = new OpenLayers.Feature.Vector(linkGeom,linkAttrs);
					newThreat.attributes.data['id'] = feature.attributes.data['id'];
					newThreat.attributes.data['init'] = feature.attributes.data['init'];
					newThreat.attributes.data['RowName'] = feature.attributes.data['RowName'];
					newThreat.attributes.data['Scale'] = feature.attributes.data['Scale']; // important if linking attempted in the future
					newThreat.attributes.data['initiated'] = linkTime;
					newThreat.attributes.data['issue'] = currentTime;
					newThreat.attributes.data['valid_start'] = parseInt(scans[volumes][0].split('_')[1]);
					newThreat.attributes.data['valid_end'] = newThreat.attributes.data['valid_start'] + (newThreat.attributes.data['duration'] * 60);
					newThreat.geometry.transform(proj2,proj);
			                geoJsonParser = new OpenLayers.Format.GeoJSON();
			                var geoJson = geoJsonParser.write(newThreat);
			                link = 'write_threats.php?threat=' + newThreat.attributes.data['types'][0] + '&id=' + newThreat.attributes.data['id'] + '&case=' + acase + '&user=' + user + '&geojson=' + geoJson + '&inputTime=' +  newThreat.attributes.data['issue'];
			                var dataRequest = new XMLHttpRequest();
			                dataRequest.open('GET', link, false);
			                dataRequest.send();

					// activate new object
			                var link = 'writeValidProbs.php?user=' + user + '&type=allow&inputTime=' + timeCanvasVal.getAttr('time') + '&id=' + newThreat.attributes.data['id'] + '&threat=' + newThreat.attributes.data['types'][0].slice(0,-1) + '&archive=' + acase;
			                var dataRequest = new XMLHttpRequest();
			                dataRequest.open('GET', link, false);
			                dataRequest.send();

					// deactivate old object
					deactivateThreat(linkIssue1, linkObj1);

					newThreat.geometry.transform(proj,proj2);
					//alert('Object #' + linkObj2 + ' linked with object #' + linkObj1);
					stopLink();
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
			}
			else{
				historyPanel = Ext.getCmp('historyPanel');
                                historyPanel.show();
				if(!lsrs.getVisibility()){
					lsrs.setVisibility(true);
				}
				if(feature.attributes.data.ProbSevere['cape'] != ''){
					objType = 'probSevere';
				}
				else if(feature.attributes.data.AzShear['3-6kmAGL'] != ''){
					objType = 'azShear';
				}
				else if(feature.attributes.data.Lightning['prob1'] != ''){
					objType = 'lightning';
				}
				else{
					objType = 'human';
				}
				var url = 'realtime/ewp/getLSRs.php?now=' + currentTime + '&hazard=all&objID=' + feature.attributes.data['id'] + '&objType=' + objType + '&analysis=' + analysis;
				//console.log(url);
				lsrProtocol.options.url = url;
		                refreshLSRs.refresh({force: true});

				minElapse = Math.floor((currentTime - feature.attributes.data['valid_start']) / 60);
				secElapse = (currentTime - feature.attributes.data['valid_start']) - (minElapse * 60);
				minLeft = Math.floor((feature.attributes.data['valid_end'] - currentTime) / 60);
				secLeft = (feature.attributes.data['valid_end'] - currentTime) - (minLeft * 60);
				ratio = (currentTime - feature.attributes.data['valid_start']) / (feature.attributes.data['valid_end'] - feature.attributes.data['valid_start']);
				slp = (feature.attributes.data['probs'][0][parseInt(ratio * 5) + 1] - feature.attributes.data['probs'][0][parseInt(ratio * 5)]) / 5;
				y_int = feature.attributes.data['probs'][0][parseInt(ratio * 5)] - ((parseInt(ratio * 5)) * slp);
	                        probVal = parseInt(Math.round(((ratio * 5) * slp) + y_int));
				//if(minLeft < 0){
				//	console.log(currentTime + ',' + feature.attributes.data['valid_end']);
				//	selectControl.unselectAll();
				//	return;
				//}

				if(feature.attributes.data['types'][0] == 'tornado1'){
					var vpMin = validProbMinTornado;
					var vpMax = validProbMaxTornado;
				}
				else if(feature.attributes.data['types'][0] == 'severe1'){
                                       	var vpMin = validProbMinSevere;
                                       	var vpMax = validProbMaxSevere;
				}
				else if(feature.attributes.data['types'][0] == 'lightning1'){
                                       	var vpMin = validProbMinLightning;
                                       	var vpMax = validProbMaxLightning;
				}

				var popup_msg = '<div style="color: ' + feature.attributes.data['threatColor'] + ';font-size: 16px;background-color:#383838;height:100%;"><center>';
				popup_msg += '<table width="100%" style="color: ' + feature.attributes.data['threatColor'] + '">';
				popup_msg += '<tr><td style="text-align:left"><b><u>Object ID</u>:</b> ' + feature.attributes.data['id'] + '</td>';
				//if(timeCanvasVal.getAttr('time') == scans[volumes][0].split('_')[1]){
				if(!analysis){
					popup_msg += '<td style="text-align:right"><input type="button" value="Close" onClick="killPopup(); goToEnd();"></td></tr></table>';
					popup_msg += '<input type="button" value="Modify" onClick="goToEnd(); highlightThreat(' + feature.attributes.data['issue'] + ',' + feature.attributes.data['id'] + ',\'double\',\'' + feature.attributes.data['prediction'] + '\'); killPopup();" />';
					if(feature.attributes.data['automated'] != 1){
						var mFound = false;
                                                for(var key in feature.attributes.data.modified){
                                                       	if(feature.attributes.data.modified[key] == 0){
                                                                mFound = true;
                                                                break;
                                                       	}
                                                }
						if(feature.attributes.data['automated'] == 2 && feature.attributes.data['allow'] == 0 || feature.attributes.data['automated'] == 0 && mFound && feature.attributes.data['allow'] == 0){
							popup_msg += '<input type="button" id="activateThreat" value="Allow" onClick="goToEnd(); killPopup(); reactivateThreat(' + feature.attributes.data['issue'] + ',' + feature.attributes.data['id'] + ');" />';
						}
						else if(feature.attributes.data['automated'] == 2 && feature.attributes.data['allow'] == 1 || feature.attributes.data['automated'] == 0 && mFound && feature.attributes.data['allow'] == 1){
							if(feature.attributes.data['threatColor'] == 'rgb(0,255,255)'){
								popup_msg += '<input type="button" id="deactivateThreat" value="Deactivate" onClick="goToEnd(); killPopup(); deactivateThreat(' + feature.attributes.data['issue'] + ',' + feature.attributes.data['id'] + ');" />';
							}
							else{
								popup_msg += '<input type="button" id="deactivateThreat" value="Block" onClick="goToEnd(); killPopup(); deactivateThreat(' + feature.attributes.data['issue'] + ',' + feature.attributes.data['id'] + ');" />';
							}
							popup_msg += '<input type="button" id="copyThreat" value="Copy" onClick="goToEnd(); killPopup(); copyThreatObject(' + feature.attributes.data['issue'] + ',' + feature.attributes.data['id'] + ');" />';
							if(feature.attributes.data['threatColor'] == 'rgb(0,255,255)'){
								popup_msg += '<input type="button" id="linkObject" value="Transfer Object" onClick="runLink(' + feature.attributes.data['issue'] + ',' + feature.attributes.data['id'] + ');" />';
							}
							else{
								popup_msg += '<input type="button" id="releaseObject" value="Release" onClick="releaseObject(' + feature.attributes.data['issue'] + ',' + feature.attributes.data['id'] + ');" />';
							}
						}
						else{
							popup_msg += '<input type="button" id="deactivateThreat" value="Deactivate" onClick="goToEnd(); killPopup(); deactivateThreat(' + feature.attributes.data['issue'] + ',' + feature.attributes.data['id'] + ');" />';
			                                popup_msg += '<input type="button" id="copyThreat" value="Copy" onClick="goToEnd(); killPopup(); copyThreatObject(' + feature.attributes.data['issue'] + ',' + feature.attributes.data['id'] + ');" />';
						}
					}
					else if(probVal > vpMin && probVal <= vpMax || probVal == 0 && vpMin == 0){
						if(feature.attributes.data['allow'] == 1){
		                                       	popup_msg += '<input type="button" id="deactivateThreat" value="Block" onClick="goToEnd(); killPopup(); deactivateThreat(' + feature.attributes.data['issue'] + ',' + feature.attributes.data['id'] + ');" />';
		                                       	popup_msg += '<input type="button" id="copyThreat" value="Copy" onClick="goToEnd(); killPopup(); copyThreatObject(' + feature.attributes.data['issue'] + ',' + feature.attributes.data['id'] + ');" />';
						}
						else{
							popup_msg += '<input type="button" id="activateThreat" value="Allow" onClick="goToEnd(); killPopup(); reactivateThreat(' + feature.attributes.data['issue'] + ',' + feature.attributes.data['id'] + ');" />';
							popup_msg += '<input type="button" id="copyThreat" value="Copy" onClick="goToEnd(); killPopup(); copyThreatObject(' + feature.attributes.data['issue'] + ',' + feature.attributes.data['id'] + ');" />';
						}
	                               	}
					else{
						popup_msg += '<input type="button" id="activateThreat" value="Allow" onClick="goToEnd(); killPopup(); reactivateThreat(' + feature.attributes.data['issue'] + ',' + feature.attributes.data['id'] + ');" />';
					}
				}
				else{
					popup_msg += '<td style="text-align:right"><input type="button" value="Close" onClick="killPopup();"></td></tr></table>';
				}
				popup_msg += '<br><br>';

				var tempID = feature.attributes.data['id'];
				if(objType == 'human' && feature.attributes.data['types'][0] == 'tornado1'){
					var idx = -99;
		                        for(var i=0;i<probSevereObjects.features.length;i++){
		                               	if(feature.geometry.intersects(probSevereObjects.features[i].geometry)){
		                                        idx = i;
							var tempID = feature.attributes.data['id'];
							feature = probSevereObjects.features[i].clone();
							objType = 'probSevere';
		                                        break;
		                                }
                       			}
                       			if(idx == -99){
						objType = 'human';	
					}
				}
                               	if(objType == 'probSevere'){
					popup_msg += '<table cellpadding="4" border="1" style="color:#FFFFFF;" width="100%"><tr><td align="right">';
					popup_msg += '<u>Env</u>:';
					popup_msg += '</td><td align="center">';
					popup_msg += '<input type="button" style="font-size:11px;" value="MUCAPE" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'MUCAPE\',\'J kg<sup>-1</sup>\',\'cape\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="MLCAPE" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'MLCAPE\',\'J kg<sup>-1</sup>\',\'mlcape\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="MLCIN" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'MLCIN\',\'J kg<sup>-1</sup>\',\'mlcin\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="0-1 km SRH" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'0-1 km SRH\',\'m<sup>2</sup>s<sup>-2</sup>\',\'srh01km\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="EB Shear" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Effective Bulk Shear\',\'s<sup>-1</sup>\',\'shear\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="Wetbulb 0C Hgt" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Wetbulb 0C Hgt\',\'m AGL\',\'wb0\');">';
					popup_msg += '<br>';
					popup_msg += '<input type="button" style="font-size:11px;" value="Mean Wind 700-900 mb" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Mean Wind 700-900 mb\',\'kts\',\'mWind79\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="Lapse Rate 700-500 mb" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Lapse Rate 700-500 mb\',\'C km<sup>-1</sup>\',\'lr75\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="Min Avg RH 700-450 mb" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Min Avg RH 700-450 mb\',\'%\',\'rh7045\');">';
					popup_msg += '</td></tr>';
					popup_msg += '<tr><td align="right">';
					popup_msg += '<u>Radar</u>:';
                                        popup_msg += '</td><td align="center">';
					popup_msg += '<input type="button" style="font-size:11px;" value="MESH" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'MESH\',\'in.\',\'mesh\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="Max LLAzShear" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Max Low-Level AzShear\',\'s<sup>-1</sup>\',\'maxllaz\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="98% LLAzShear" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'98% Low-Level AzShear\',\'s<sup>-1</sup>\',\'p98llaz\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="98% MLAzShear" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'98% Mid-Level AzShear\',\'s<sup>-1</sup>\',\'p98mlaz\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="Avg Beam Hgt" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Avg Beam Hgt\',\'km\',\'abh\');">';
					popup_msg += '<br>';
					popup_msg += '<input type="button" style="font-size:11px;" value="VIL Density" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'VIL Density\',\'g/m<sup>3</sup>\',\'vilDensity\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="Growth" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Growth Rate\',\'per minute\',\'growth\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="Glaciation" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Glaciation Rate\',\'per minute\',\'glaciation\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="Flash Rate" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Flash Rate\',\'flashes/min\',\'flashRate\');">';
                                       	popup_msg += '<input type="button" style="font-size:11px;" value="Flash Density" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Flash Density\',\'flashes/min/km<sup>-2</sup>\',\'flashDensity\');">';
					//popup_msg += '<input type="button" style="font-size:11px;" value="Lightning Jump" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Lightning Jump\',\'sigma\',\'lightningJump\');">';
					popup_msg += '</td></tr>';
                                        popup_msg += '<tr><td align="right">';
					if(tempID != feature.attributes.data['id']){
						popup_msg += '<u>SVR<br>Object</u>:';
					}
					else{
	                                        popup_msg += '<u>Object</u>:';
					}
                                        popup_msg += '</td><td align="center">';
					popup_msg += '<input type="button" style="font-size:11px;" value="ProbSevere" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'ProbSevere\',\'%\',\'probability\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="ProbHail" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'ProbHail\',\'%\',\'probHail\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="ProbWind" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'ProbWind\',\'%\',\'probWind\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="ProbTor" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'ProbTor\',\'%\',\'probTor\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="SVR Wind (Grid in AWIPS-II)" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Severe Wind (Lagerquist) Probability\',\'%\',\'wind\');">';
					popup_msg += '<br>';
					popup_msg += '<input type="button" style="font-size:11px;" value="Speed" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Speed\',\'kts\',\'Speed\');">';
                                       	popup_msg += '<input type="button" style="font-size:11px;" value="Direction" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Direction\',\'degrees\',\'Direction\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="Duration" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Duration\',\'min.\',\'duration4\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="Best Track IDs" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Best Track IDs\',\'#\',\'besttrack\');">';
					popup_msg += '<input type="button" style="font-size:11px;" value="Storm Classification" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'Storm Classification Probability\',\'%\',\'classification\');">';
					if(wofTracks.features.length > 0){
						if(wofType == 'uh'){
							popup_msg += '<input type="button" style="font-size:11px;" value="WoF UH" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'WoF Updraft Helicity\',\'m<sup>2</sup>s<sup>-2</sup>\',\'wofuh\');">';
						}
						else{
							popup_msg += '<input type="button" style="font-size:11px;" value="WoF VOR" onClick="genHistory(' + feature.attributes.data['id'] + ',\'probSevere\',\'WoF Vorticity\',\'s<sup>-1</sup>\',\'wofvor\');">';
						}
					}
					if(tempID != feature.attributes.data['id']){
						popup_msg += '</td></tr>';
	                                        popup_msg += '<tr><td align="right">';
						popup_msg += '<u>TOR<br>Object</u>:';
	                                        popup_msg += '</td><td align="center">';
						popup_msg += '<input type="button" value="Speed" onClick="genHistory(' + tempID + ',\'human\',\'Speed\',\'kts\',\'Speed\');">';
	                                       	popup_msg += '<input type="button" value="Direction" onClick="genHistory(' + tempID + ',\'human\',\'Direction\',\'degrees\',\'Direction\');">';
	                                       	popup_msg += '<input type="button" value="Probability" onClick="genHistory(' + tempID + ',\'human\',\'Probability\',\'%\',\'probability\');">';
					}
					popup_msg += '</td></tr></table><br>';
					var objTitle = 'Probability';
                                        var objUnits = '%';
                                        var objKey = 'probability';
                               	}
                               	else if(objType == 'azShear'){
                                       	//popup_msg += '<b><u>3-6 km AGL AzShear</u>:</b> ' + feature.attributes.data.AzShear['3-6kmAGL'] + '<br>';
					popup_msg += '<input type="button" value="Speed" onClick="genHistory(' + feature.attributes.data['id'] + ',\'azShear\',\'Speed\',\'kts\',\'Speed\');">';
                                	popup_msg += '<input type="button" value="Direction" onClick="genHistory(' + feature.attributes.data['id'] + ',\'azShear\',\'Direction\',\'degrees\',\'Direction\');">';
					popup_msg += '<input type="button" value="Probability" onClick="genHistory(' + feature.attributes.data['id'] + ',\'azShear\',\'Probability\',\'%\',\'probability\');">';
					popup_msg += '<br><br>';
					var objTitle = 'Probability';
                                        var objUnits = '%';
                                        var objKey = 'probability';
                               	}
				else if(objType == 'lightning'){
                                       	popup_msg += '<input type="button" value="Speed" onClick="genHistory(' + feature.attributes.data['id'] + ',\'lightning\',\'Speed\',\'kts\',\'Speed\');">';
                                       	popup_msg += '<input type="button" value="Direction" onClick="genHistory(' + feature.attributes.data['id'] + ',\'lightning\',\'Direction\',\'degrees\',\'Direction\');">';
					popup_msg += '<input type="button" value="ENI IC Count" onClick="genHistory(' + feature.attributes.data['id'] + ',\'lightning\',\'ENI IC Count\',\'2-min\',\'eniIC_count\');">';
					popup_msg += '<input type="button" value="NLDN CG Count" onClick="genHistory(' + feature.attributes.data['id'] + ',\'lightning\',\'NLDN CG Count\',\'2-min\',\'nldnCG_count\');">';
					popup_msg += '<input type="button" value="Total Lightning" onClick="genHistory(' + feature.attributes.data['id'] + ',\'lightning\',\'Total Lightning\',\'2-min\',\'totalLightning\');">';
					popup_msg += '<input type="button" value="All Lightning" onClick="genHistory(' + feature.attributes.data['id'] + ',\'lightning\',\'All Lightning\',\'2-min\',\'allLightning\');">';
                                       	popup_msg += '<input type="button" value="Probability" onClick="genHistory(' + feature.attributes.data['id'] + ',\'lightning\',\'Probability\',\'%\',\'probability\');">';
					popup_msg += '<br><br>';
					var objTitle = 'Probability';
                                        var objUnits = '%';
                                        var objKey = 'probability';
                                }
                               	else{
					popup_msg += '<input type="button" value="Speed" onClick="genHistory(' + feature.attributes.data['id'] + ',\'human\',\'Speed\',\'kts\',\'Speed\');">';
                                        popup_msg += '<input type="button" value="Direction" onClick="genHistory(' + feature.attributes.data['id'] + ',\'human\',\'Direction\',\'degrees\',\'Direction\');">';
					popup_msg += '<input type="button" value="Probability" onClick="genHistory(' + feature.attributes.data['id'] + ',\'human\',\'Probability\',\'%\',\'probability\');">';
					popup_msg += '<br><br>';
					var objTitle = 'Probability';
                                        var objUnits = '%';
                                        var objKey = 'probability';
                               	}

                               	popup_msg += '<center><div id="chart9" style="width:480px; height:250px;"></div>';
				popup_msg += '</center><p style="text-align:left;color:#FFFFFF;"><b><u>Reports</u>:</b></p><center>';
				popup_msg += '<div id="reportsDiv"></div><br>';
				popup_msg += '</center><p style="text-align:left;color:#FFFFFF;"><b><u>Discussions</u>:</b></p><center>';
				popup_msg += '<div id="objectDisc" style="align:center;"></div></center></div>';

				document.getElementById("historyConfig").innerHTML = popup_msg;

				if(objType == objTypeLast){
					genHistory(feature.attributes.data['id'], objTypeLast, objTitleLast, objUnitsLast, objKeyLast);
				}
				else{
					genHistory(feature.attributes.data['id'], objType, objTitle, objUnits, objKey);
				}

				var verts = feature.geometry.getVertices();
                               	var topY = 0;
                               	var topX;
                               	for(var i=0;i<verts.length;i++){
                                       	if(verts[i].y > topY){
                                               	topY = verts[i].y;
                                               	topX = verts[i].x;
                                       	}
                               	}

				popup = new OpenLayers.Popup.FramedCloud('chicken',
	                              new OpenLayers.LonLat(topX,topY),
	                              new OpenLayers.Size(50,100),
	                              popup_msg,
	                              null,true,killPopup);
				popup.panMapIfOutOfView = true;
	                        //feature.popup = popup;
	                       	//map.addPopup(popup);
				chartFeature = feature.attributes.data['id'];
				console.log(feature);
			}
		}
		else if(feature.attributes.end_time != null){
			var geojson_format = new OpenLayers.Format.GeoJSON();
			url = 'archive/' + acase + '/' + site + '/wof/json/' + feature.attributes.start_time + '_centroids.json';
			var dataRequest = new XMLHttpRequest();
	                dataRequest.open('GET', url, false);
	                dataRequest.send();
	                wof_jsons = dataRequest.responseText.split("\n");
			wof_points.removeAllFeatures();
			wof_times = [];
			wof_probs = [];
			for(i=0;i<wof_jsons.length;i++){
				if(wof_jsons[i].length > 0){
                                        object = geojson_format.read(wof_jsons[i]);
					wof_points.addFeatures([object[0]]);
					tNow = new Date((parseInt(object[0].attributes.valid) * 1000));
					wof_times.push((tNow.getTime() + (tNow.getTimezoneOffset() * 60 * 1000)));
					wof_probs.push(object[0].attributes.prob);
				}
			}
			popup_msg = '<div style="height:300px;width:390px;border: 2px solid black;padding:5px;"><center><div id="chart9" style="width:360px; height:250px;" onMouseOut="threat_points.removeAllFeatures();"></div><br><input type="button" value="Initialize WoF Recommender" onClick="initWoF();" /></center></div>';
			popup = new OpenLayers.Popup.FramedCloud('chicken',
                              feature.geometry.getBounds().getCenterLonLat(),
                              new OpenLayers.Size(450,350),
                              popup_msg,
                              null,true,killPopup);
                        feature.popup = popup;
                        map.addPopup(popup);
			tNow = new Date((currentTime * 1000));
			wof_chart(wof_times,[wof_probs],'WoF Probabilities','%',(tNow.getTime() + (tNow.getTimezoneOffset() * 60 * 1000)));
			$('#chart9').bind('jqplotMouseMove',
                                function (ev, seriesIndex, pointIndex, data2) {
					threat_points.removeAllFeatures();
                                        if(data2 != null){
						for(i=0;i<wof_points.features.length;i++){
							if(parseInt(wof_points.features[i].attributes.model_init) == parseInt(feature.attributes.start_time) && parseInt(wof_points.features[i].attributes.valid) == parseInt(feature.attributes.start_time + (data2.pointIndex * 60))){
								threat_points.addFeatures([wof_points.features[i].clone()]);
								threat_points.redraw();
								break;
							}
						}
                                        }
                                }
                        );
		}
		else if(feature.attributes.prob != null){
			// user point click
			popup_msg = '<div style="width:500px;height:400px;border: 2px solid black;padding:5px;"><div id="threatText"></div><center><div id="chart4" style="width:450px;height:270px;position: absolute; bottom: 30; left:20"></div></center></div>';
			popup = new OpenLayers.Popup.FramedCloud('chicken',
	                      feature.geometry.getBounds().getCenterLonLat(),
	                      new OpenLayers.Size(500,450),
	                      popup_msg,
			      null,true,killPopup);
	          	feature.popup = popup;
	          	map.addPopup(popup);
			lightUpPoint(feature.attributes.issue,feature.geometry.getCentroid());
		}
		else if(feature.attributes.POSH != null){
			buttons = ['Avg_20CHt','Avg01Helcy','Avg06Shear','Avg0CHt','AvgLCLHt','AvgMUCAPE','AvgWBZHt','LowLvlShear','MeanRef','MidLvlShear','Size','Speed','Direction','TotalLowAzShear','TotalVIL','FreezeRef','MESH','MESH30','Max06Shear','MaxMUCAPE','MaxRef','MaxSfcDew','MaxSfcTemp','MaxVIL','Min_20CHt','Min0CHt','MinLCLHt','MinWBZHt','POSH','speed'];
			scales = ['Avg_20CHt','Avg01Helcy','Avg06Shear','Avg0CHt','AvgLCLHt','AvgMUCAPE','AvgWBZHt','LowLvlShear','MeanRef','MidLvlShear','Size','Speed','TotalLowAzShear','TotalVIL'];
			evnButtonIDs = ['MUCAPE','0-1km Helicity','Shear','Sfc Dew Point','Sft. Temp','LCL HGHT','0C HGHT','-20C HGHT','WBZ HGHT'];
			radButtonIDs = ['Reflectivity','Az. Shear','MESH','POSH','VIL','Size','Speed','Direction'];
			featData = {};
			for(i=0;i<buttons.length;i++){
				featData[buttons[i]] = [];
			}
			featData['times'] = [];
			for(i=0;i<myrorss_points.features.length;i++){
				if(myrorss_points.features[i].attributes.RowName == feature.attributes.RowName){
					for(j=0;j<buttons.length;j++){
						if(scales.indexOf(buttons[j]) == -1){
							eval("featData['" + buttons[j] + "'].push(myrorss_points.features[i].attributes." + buttons[j] + ")");
						}
						else{
							rowVal = String(myrorss_points.features[i].attributes.RowName);
							eval("featData['" + buttons[j] + "'].push(myrorss_points.features[i].attributes." + buttons[j] + "_scale" + rowVal.split(':')[0] + ")");
						}
					}
					featData['times'].push((myrorss_points.features[i].attributes.init - feature.attributes.init) / 60);
				}
			}
			tNow = (currentTime - feature.attributes.init) / 60;
			rowVal = String(feature.attributes.RowName);
			age = eval('feature.attributes.Age_scale' + rowVal.split(':')[0]);
			age_mins = Math.floor(age / 60);
			age_secs = Math.round(age - (age_mins * 60));
			popup_msg = '<div style="width:500px;height:440px;border: 2px solid black;padding:5px;">';
			popup_msg += '<b><u>Detection Time</u>:</b> ' + feature.attributes.InitTime + ' UTC<br>';
			popup_msg += '<b><u>Start Time</u>:</b> ' + eval('feature.attributes.StartTime_scale' + rowVal.split(':')[0]) + ' UTC<br>';
			popup_msg += '<b><u>Age</u>:</b> ' + age_mins + ' min ' + age_secs + ' secs<br><br><center>';
			popup_msg += '<input type="button" style="width:120px;background:#DDDDDD" id="env" value="ENVIRONMENT" onClick="swapColor(\'env\',\'radar\',[]); loadButtons(\'env\',featData,' + tNow + '); swapColor(\'MUCAPE\',buttonLast,[\'Average\',\'Maximum\']); myrorss_chart(featData[\'times\'],[featData[\'AvgMUCAPE\'],featData[\'MaxMUCAPE\']],\'MUCAPE\',\'J kg<sup>-1</sup>.\',' + tNow + ');" />';
                        popup_msg += '<input type="button" style="width:120px;background:#DDDDDD" id="radar" value="RADAR" onClick="swapColor(\'radar\',\'env\',[]); loadButtons(\'radar\',featData,' + tNow + '); swapColor(\'Reflectivity\',buttonLast,[\'Average\',\'Maximum\',\'Freezing Level\']); myrorss_chart(featData[\'times\'],[featData[\'MeanRef\'],featData[\'MaxRef\'],featData[\'FreezeRef\']],\'Reflectivity\',\'dBZ\',' + tNow + ');" /><center><br>';
			popup_msg += '<table cellpadding="0" cellspacing="0" border="0"><tr><td valign="top" align="center">';
			popup_msg += '<div id="buttonList"></div>';
			popup_msg += '</td><td valign="top"><div id="chart9" style="width:360px; height:250px;" onMouseOut="timeCanvasVal.setAttr(\'time\',timeValue); moveSliderTime(); changeTime();"></div></td></tr>';
			popup_msg += '<tr><td></td><td><center><div id="chartLabels"></div></center></td></tr></table>';
			popup_msg += '<br><center><input type="button" value="Initiate MYRORSS Recommender" onClick="initiateThreat(\'' + feature.attributes.RowName + '\',' + feature.attributes.init + ');" /></center></div>';
			popup = new OpenLayers.Popup.FramedCloud('chicken',
				feature.geometry.getBounds().getCenterLonLat(),
				new OpenLayers.Size(500,450),
				popup_msg,
				null,true,killPopup
			);   
		        feature.popup = popup;
			map.addPopup(popup);
			loadButtons('env',featData,tNow);
			swapColor('env','radar',[]);
			myrorss_chart(featData['times'],[featData['AvgMUCAPE'],featData['MaxMUCAPE']],'MUCAPE','J Kg<sup>-1</sup>',tNow);
			buttonLast = 'Shear';
			swapColor('MUCAPE',buttonLast,['Average','Maximum']);
			timeValue = timeCanvasVal.getAttr('time');
			$('#chart9').bind('jqplotMouseMove',
			        function (ev, seriesIndex, pointIndex, data2) {
			                if(data2 != null){
						val = parseInt(feature.attributes.init) + parseInt((parseFloat(data2.data[0]) * 60));
						timeCanvasVal.setAttr('time',val);
						moveSliderTime();
						changeTime();
			                }
			        }
			);
		}
		else if(feature.attributes.MESH != null){
                       	buttons = ['Size','speed','Direction','MESH','OrtegaHailProb','LightningProbabilityNext30min'];
                       	evnButtonIDs = [];
                       	radButtonIDs = ['MESH','Ortega Hail Prob.','Lightning Prob.','Size','Speed','Direction'];
                       	featData = {};
                       	for(i=0;i<buttons.length;i++){
                               	featData[buttons[i]] = [];
                       	}
                       	featData['times'] = [];
                       	for(i=0;i<kmeans_points.features.length;i++){
                               	if(kmeans_points.features[i].attributes.RowName == feature.attributes.RowName){
                                       	for(j=0;j<buttons.length;j++){
                                               	eval("featData['" + buttons[j] + "'].push(kmeans_points.features[i].attributes." + buttons[j] + ")");
                                       	}
                                       	featData['times'].push((kmeans_points.features[i].attributes.init - feature.attributes.init) / 60);
                               	}
                       	}
                       	tNow = (currentTime - feature.attributes.init) / 60;
                       	rowVal = String(feature.attributes.RowName);
                       	age = feature.attributes.Age;
                       	age_mins = Math.floor(age / 60);
                       	age_secs = Math.round(age - (age_mins * 60));
                       	popup_msg = '<div style="width:500px;height:440px;border: 2px solid black;padding:5px;">';
                       	popup_msg += '<b><u>Detection Time</u>:</b> ' + feature.attributes.InitTime + ' UTC<br>';
                       	popup_msg += '<b><u>Start Time</u>:</b> ' + feature.attributes.StartTime + ' UTC<br>';
                       	popup_msg += '<b><u>Age</u>:</b> ' + age_mins + ' min ' + age_secs + ' secs<br>';
			popup_msg += '<b><u>ID</u>:</b> ' + feature.attributes.RowName + '<br><br><center>';
                       	//popup_msg += '<input type="button" style="width:120px;background:#DDDDDD" id="env" value="ENVIRONMENT" onClick="swapColor(\'env\',\'radar\',[]); loadKmeansButtons(\'env\',featData,' + tNow + '); swapColor(\'MUCAPE\',buttonLast,[\'Average\',\'Maximum\']); kmeans_chart(featData[\'times\'],[featData[\'AvgMUCAPE\'],featData[\'MaxMUCAPE\']],\'MUCAPE\',\'J kg<sup>-1</sup>.\',' + tNow + ');" />';
                       	popup_msg += '<input type="button" style="width:120px;background:#DDDDDD" id="radar" value="RADAR" onClick="swapColor(\'radar\',\'env\',[]); loadKmeansButtons(\'radar\',featData,' + tNow + '); swapColor(\'Reflectivity\',buttonLast,[\'Average\',\'Maximum\',\'Freezing Level\']); kmeans_chart(featData[\'times\'],[featData[\'MeanRef\'],featData[\'MaxRef\'],featData[\'FreezeRef\']],\'Reflectivity\',\'dBZ\',' + tNow + ');" /><center><br>';
                       	popup_msg += '<table cellpadding="0" cellspacing="0" border="0"><tr><td valign="top" align="center">';
                       	popup_msg += '<div id="buttonList"></div>';
                       	popup_msg += '</td><td valign="top"><div id="chart9" style="width:360px; height:250px;" onMouseOut="timeCanvasVal.setAttr(\'time\',timeValue); moveSliderTime(); changeTime();"></div></td></tr>';
                       	popup_msg += '<tr><td></td><td><center><div id="chartLabels"></div></center></td></tr></table>';
                       	popup_msg += '<br><center>';
			popup_msg += '<input type="button" value="Initiate Hail Recommender" onClick="initiateThreat(\'hail\',' + feature.attributes.init + ');" />';
			popup_msg += '<input type="button" value="Initiate Lightning Recommender" onClick="initiateThreat(\'lightning\',' + feature.attributes.init + ');" />';
			popup_msg += '</center></div>';
                       	popup = new OpenLayers.Popup.FramedCloud('chicken',
                               	feature.geometry.getBounds().getCenterLonLat(),
                               	new OpenLayers.Size(500,450),
                               	popup_msg,
                               	null,true,killPopup
                       	);   
                       	feature.popup = popup;
                       	map.addPopup(popup);
                       	loadKmeansButtons('radar',featData,tNow);
                       	swapColor('radar','env',[]);
                       	kmeans_chart(featData['times'],[featData['MESH']],'MESH','in.',tNow);
                       	buttonLast = 'speed';
                       	swapColor('MESH',buttonLast,['Maximum']);
                       	timeValue = timeCanvasVal.getAttr('time');
                       	$('#chart9').bind('jqplotMouseMove',
                               	function (ev, seriesIndex, pointIndex, data2) {
                                       	if(data2 != null){
                                               	val = parseInt(feature.attributes.init) + parseInt((parseFloat(data2.data[0]) * 60));
                                               	timeCanvasVal.setAttr('time',val);
                                               	moveSliderTime();
                                               	changeTime();
                                       	}
                               	}
                       	);
			kmeans_lines.removeAllFeatures();
			coords = [];
			lonRadius = feature.attributes.LonRadius / (111.325 * Math.cos(feature.attributes.Latitude * Math.PI / 180));
			latRadius = feature.attributes.LatRadius / 111.325;
			for(k=0;k<360;k+=9){
				x_increment = Math.cos(k * Math.PI / 180) * lonRadius;
		               	xVal = feature.attributes.Longitude + x_increment;
		               	y_increment = Math.sqrt(Math.pow(latRadius,2) * (1 - (Math.pow(x_increment,2) / Math.pow(lonRadius,2))));
		               	if(k >= 180){
		                       	y_increment = -1 * y_increment;
		                }
		                yVal = feature.attributes.Latitude + y_increment;
		                coords.push(new OpenLayers.Geometry.Point(xVal,yVal).transform(proj,proj2));
			}
			linearRing = new OpenLayers.Geometry.LinearRing(coords);
			poly = new OpenLayers.Geometry.Polygon([linearRing]);
			poly.rotate(-1 * feature.attributes.Orientation,poly.getCentroid());
			//poly.transform(proj,proj2);
                        //var parser = new jsts.io.OpenLayersParser();
                        //poly2 = parser.read(poly);
			//poly2 = poly2.buffer(24140.2);
			//poly = parser.write(poly2);
			//poly.transform(proj2,proj);
			var jsonFormat = new OpenLayers.Format.JSON();
			featureAttrs = JSON.stringify(feature.attributes);
			kmeansEllipse = new OpenLayers.Feature.Vector(poly,jsonFormat.read(featureAttrs));
			kmeans_lines.addFeatures([kmeansEllipse]);
               	}
		else{
			//popup_msg = '<div style="width:500px;height:450px;border: 2px solid black;padding:5px;"><span id="userThreats"></span>';
			//popup_msg += '<hr color="#000000"><div id="threatText"></div><center><div id="chart4" style="width:450px;height:270px;position: absolute; bottom: 30; left:20"></div></center></div>';
			popup_msg = '';
			popup = new OpenLayers.Popup.FramedCloud('chicken',
                              feature.geometry.getBounds().getCenterLonLat(),
                              new OpenLayers.Size(500,450),
                              popup_msg,
                              null,true,killPopup);
                        //feature.popup = popup;
                        //map.addPopup(popup);
			var disPanel = Ext.getCmp('displayPanel');
                        disPanel.show();
			uPointFeature = feature.clone();
			getUserThreats(uPointFeature);
		}
        };

        function killPopup(feature){
		var hisPanel = Ext.getCmp('historyPanel');
		if(popup != null){
			reportsStore.removeAll();
			try{
				reportsPanel.destroy();
			}
			catch(err){

			}
			unhighlightReport();
			clearPHIOutput();
			if(hisPanel.isVisible()){
				document.getElementById("historyConfig").innerHTML = '';
				var threatPanel = Ext.getCmp('threatPanel');
                                threatPanel.show();
			}
			objIDLast2 = -999;
			lsrs.setVisibility(false);
			lsrs.removeAllFeatures();
			kmeans_lines.removeAllFeatures();
	                map.removePopup(popup);
	                popup = null;
			selectControl.unselectAll();
			chartFeature = null;
		}
		else if(hisPanel.isVisible()){
			document.getElementById("historyConfig").innerHTML = '';
		}
        };

        function onPopupClose(evt) {
            	selectControl.unselectAll();
        }

	function genHistory(objID, objType, title, units, key){
		if(key == 'allLightning'){
			var keys = ['eniIC_count','nldnCG_count','totalLightning'];
			var allData = [];
			for(var k=0;k<keys.length;k++){
				var url = 'realtime/ewp/getObjectInfo.php?objID=' + objID + '&now=' + currentTime;
	                        url += '&type=' + objType + '&archive=' + acase + '&site=' + site + '&key=' + keys[k] + '&analysis=' + analysis;
	                        var dataRequest = new XMLHttpRequest();
	                        dataRequest.open('GET', url, false);
	                        dataRequest.send();
	                        var objData = dataRequest.responseText.split("|");
				allData.push(objData[1].split(',').map(Number));
			}
			myrorss_chart(objData[0].split(',').map(Number),allData,title,units,0);
		}
		else if(key == 'classification'){
			// "qlcs": 0.6118827674153346, "supercell": 0.00011013657310659348, "disorganized": 0.3808790044649186, "linear hybrid": 0.004965426364546856, "marginal supercell": 0.0021626651820933996
			var keys = ['qlcs','supercell','disorganized','linear','marginal'];
                        var allData = [];
                        for(var k=0;k<keys.length;k++){
                               	var url = 'realtime/ewp/getObjectInfo.php?objID=' + objID + '&now=' + currentTime;
                               	url += '&type=' + objType + '&archive=' + acase + '&site=' + site + '&key=' + keys[k] + '&analysis=' + analysis;
                               	//var url = 'realtime/ewp/getObjectInfo.php?key=' + keys[k];
                               	var dataRequest = new XMLHttpRequest();
                               	dataRequest.open('GET', url, false);
                               	dataRequest.send();
                               	var objData = dataRequest.responseText.split("|");
                               	allData.push(objData[1].split(',').map(Number));
                        }
                        myrorss_chart(objData[0].split(',').map(Number),allData,title,units,0);
		}
		else if(key == 'wind'){
			var keys = ['wind1','wind2','wind3'];
                        var allData = [];
                        for(var k=0;k<keys.length;k++){
                                var url = 'realtime/ewp/getObjectInfo.php?objID=' + objID + '&now=' + currentTime;
                                url += '&type=' + objType + '&archive=' + acase + '&site=' + site + '&key=' + keys[k] + '&analysis=' + analysis;
                                //var url = 'realtime/ewp/getObjectInfo.php?key=' + keys[k];
				var dataRequest = new XMLHttpRequest();
                                dataRequest.open('GET', url, false);
                                dataRequest.send();
                                var objData = dataRequest.responseText.split("|");
                                allData.push(objData[1].split(',').map(Number));
                        }
                        myrorss_chart(objData[0].split(',').map(Number),allData,title,units,0);
		}
		else if(key == 'wofuh' || key == 'wofvor'){
			var url = 'realtime/ewp/getWoFObjData.php?objID=' + objID + '&now=' + currentTime + '&nowData=' + timeCanvasVal.getAttr('time');
                        url += '&type=' + objType + '&archive=' + acase + '&site=' + site + '&key=' + key + '&analysis=' + analysis;
                        var dataRequest = new XMLHttpRequest();
                        dataRequest.open('GET', url, false);
                        dataRequest.send();
                        var objData = dataRequest.responseText.split("|");
                        myrorss_chart(objData[0].split(',').map(Number),[objData[1].split(',').map(Number)],title,units,0);
		}
		else{
			var allData = [];
			var url = 'realtime/ewp/getObjectInfo.php?objID=' + objID + '&now=' + currentTime;
	               	url += '&type=' + objType + '&archive=' + acase + '&site=' + site + '&key=' + key + '&analysis=' + analysis;
	              	var dataRequest = new XMLHttpRequest();
	               	dataRequest.open('GET', url, false);
	               	dataRequest.send();
	               	var objData = dataRequest.responseText.split("|");
			console.log(key);
			if(key == 'Direction' || key == 'Speed' || key == 'duration4' || key == 'probability'){
				// check if user overrode one of these keys, and if so, add it to the chart for display
				var url = 'realtime/ewp/getObjectInfoMod.php?objID=' + objID + '&now=' + currentTime + '&inTimes=' + objData[0];
	                       	url += '&type=' + objType + '&archive=' + acase + '&site=' + site + '&key=' + key + '&analysis=' + analysis + '&user=' + user;
	                       	var dataRequest = new XMLHttpRequest();
	                       	dataRequest.open('GET', url, false);
	                       	dataRequest.send();
	                       	var objData2 = dataRequest.responseText.split("|");
				if(objData2[0].length > 1){
					allData.push(objData[1].split(',').map(Number));
					allData.push(objData2[1].split(',').map(Number));
					myrorss_chart(objData[0].split(',').map(Number),allData,title,units,0);
				}
				else{
					myrorss_chart(objData[0].split(',').map(Number),[objData[1].split(',').map(Number)],title,units,0);
				}
			}
			else{
		               	myrorss_chart(objData[0].split(',').map(Number),[objData[1].split(',').map(Number)],title,units,0);
			}
			var url = 'realtime/ewp/getObjectDisc.php?objID=' + objID + '&now=' + currentTime;
                        url += '&type=' + objType + '&archive=' + acase + '&site=' + site + '&key=' + key + '&analysis=' + analysis + '&user=' + user;
                       	var dataRequest = new XMLHttpRequest();
                       	dataRequest.open('GET', url, false);
                       	dataRequest.send();
			if(dataRequest.responseText.length > 0){
	                        document.getElementById('objectDisc').innerHTML = '<textarea id="discText" rows="13" cols="60">' + dataRequest.responseText + '</textarea>';
			}
		}
		objIDLast = objID;
		objTypeLast = objType;
		objTitleLast = title;
		objUnitsLast = units;
		objKeyLast = key;

		if(objIDLast == objIDLast2){
			return;
		}
		else if(lsrs.features.length == 0){
			//document.getElementById("reportsDiv").innerHTML = '';
			reportsStore.removeAll();
			return;
		}
		else{
			//document.getElementById("reportsDiv").innerHTML = '';
			reportsStore.removeAll();
		}

		reportsPanel = Ext.create('Ext.grid.Panel', {
			store: reportsStore,
			id: 'reportsPanel',
			border: false,
			width: 490,
			height: 150,
			//bodyStyle:{"background-color":"#383838"},
			forcefit: true,
			columns: [{
			    text: 'Time',
			    width: 40,
			    height: 20,
			    dataIndex: 'time'
			},{
			    text: 'Hazard',
                            width: 50,
                            height: 20,
                       	    dataIndex: 'hazard'
                       	},{
                            text: 'Magnitude',
                            width: 60,
                            height: 20,
                            dataIndex: 'magnitude'
                       	},{
                            text: 'Comments',
                            width: 325,
                            height: 20,
                            dataIndex: 'comments'
			}],
			listeners: {
			    select: function(dv, record, item, index, e){
				highlightReport(record);
			    },
			    deselect: function(dv, record, item, index, e){
				unhighlightReport();
			    }
			},
			viewConfig: {
				itemCls: '#383838'
			},
			afterrender: function(grid){
				grid.getView().refresh();
			},
			renderTo: reportsDiv
		});

		var reports = [];
		for(var i=0;i<lsrs.features.length;i++){
			if(lsrs.features[i].attributes.epoch > currentTime && !analysis){
				continue;
			}
			var report = {
				time: Number(Math.round((lsrs.features[i].attributes.epoch - currentTime) / 60),3),
				hazard: lsrs.features[i].attributes.hazard.capitalize(),
				//magnitude: lsrs.features[i].attributes.method,
				magnitude: lsrs.features[i].attributes.magnitude,
				comments: lsrs.features[i].attributes.comments,
				epoch: lsrs.features[i].attributes.epoch
			};
			reports.push(report);
		}
		if(reports.length == 0){
			return;
		}
		reportsStore.add(reports);
		reportsStore.commitChanges();
		reportsPanel.store.sort({property: 'time',  direction: 'DESC'});

	}

	function highlightReport(report){
		for(var i=0;i<lsrs.features.length;i++){
			if(report.data.magnitude == lsrs.features[i].attributes.magnitude && report.data.hazard == lsrs.features[i].attributes.hazard.capitalize() && report.data.comments == lsrs.features[i].attributes.comments && report.data.epoch == lsrs.features[i].attributes.epoch){
			//if(report.data.hazard == lsrs.features[i].attributes.hazard.capitalize() && report.data.comments == lsrs.features[i].attributes.comments && report.data.epoch == lsrs.features[i].attributes.epoch){
				if(analysis){
					timeCanvasVal.setAttr('time',lsrs.features[i].attributes.epoch);
			               	moveSliderTime();
               				changeTime();
				}
				newLSR = lsrs.features[i].clone();
				newLSR.attributes.color = 'rgb(255,255,0)';
				lsrs.addFeatures([newLSR]);
				lsrs.redraw();
				map.panTo(new OpenLayers.LonLat(newLSR.geometry.x, newLSR.geometry.y));
				break;
			}
		}
	}

	function unhighlightReport(){
		if(newLSR != false){
			lsrs.removeFeatures([newLSR]);
			newLSR = false;
		}
	}
