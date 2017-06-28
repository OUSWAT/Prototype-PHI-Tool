	/*

        Copyright (c) 2014 Cooperative Institute for Mesoscale Meteorological Studies (CIMMS) and the University of Oklahoma

        Author:         Dr. Chris Karstens
        Email:          chris.karstens@noaa.gov
        Description:    Contains the following:
				1. initializes a WoF threat object recommender
				2. loads WoF probabilities from server
				3. sets default attributes on threat object from WoF data
				4. show/hide function

        */


	// initialize WoF threat recommender
	function initWoF(){
		killPopup();
		wofR = true;
		coords = [];
		for(i=0;i<40;i++){
			ang = i * 9;
			x = wof_points.features[0].geometry.x + (5000 * Math.cos(ang * Math.PI / 180));
			y = wof_points.features[0].geometry.y + (5000 * Math.sin(ang * Math.PI / 180));
			coords.push(new OpenLayers.Geometry.Point(x,y));
		}
		linearRing = new OpenLayers.Geometry.LinearRing(coords);
                newFeat = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([linearRing]));
		threat_area.addFeatures([newFeat]);
		newFeature = true;
		drawType = 'tornado';
		wofRecommender = true;
		featureDrawn('wof');
	}

	// load wof probs
        wofTimes = [];
        function loadWOF(){
		if(!wofCase){
                        return;
                }
		if(document.getElementById('showWoF').checked){
	                var geojson_format = new OpenLayers.Format.GeoJSON();
	                //myrorss_points.removeAllFeatures();
	                objectFeatures = [];
                
	                // send list of processed myrorss objects and time range
	                url = 'wof.php?start=' + timeMin + '&end=' + currentTime + '&list=' + wofTimes.join() + '&case=' + acase + '&site=' + site;
	                //alert(url);
			var dataRequest = new XMLHttpRequest();
	                dataRequest.open('GET', url, false);
	                dataRequest.send();
                
	                // return list of myrorss xmls to pull from server
	                wof_jsons = dataRequest.responseText.split(",");
			//alert(wof_jsons);
		                
	                // loop through list of xmls and pull from server
	                for(i=0;i<wof_jsons.length;i++){
				if(wof_jsons[i].length > 0 && wof_jsons[i].split('_').length == 1){
		                        url = 'archive/' + acase + '/' + site + '/wof/json/' + wof_jsons[i] + '.json';
		                        //alert(url);
		                        //break;
		                        var dataRequest = new XMLHttpRequest();
		                        dataRequest.open('GET', url, false);
		                        dataRequest.send();
		                        objects = dataRequest.responseText.split("\n");
					objects.reverse();
		                        for(j=0;j<objects.length;j++){
		                                if(objects[j].length > 0){
		                                        object = geojson_format.read(objects[j]);
		                                        object[0].geometry.transform(proj,proj2);
	                                                objectFeatures.push(object[0]);
		                                }
		                        }
		                        wofTimes.push(wof_jsons[i]);
		                }
			}
	                if(objectFeatures.length > 0){
	                        wof.addFeatures(objectFeatures);
				//alert('hi');
	                }
		}
        }

	// sets default attributes on threat object from WoF data
	function setWofAttributes(){
 	       tempProbs = modifyFeature.feature.attributes.data['probs'][0];
 	       tempSpeeds = modifyFeature.feature.attributes.data['speeds'];
 	       tempDirs = modifyFeature.feature.attributes.data['dirs'];
 	       tempDirs_orig = modifyFeature.feature.attributes.data['dirs_orig'];
 	       tempSpd = modifyFeature.feature.attributes.data['spd'];
 	       tempDir = modifyFeature.feature.attributes.data['dir'];
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

	// show/hide WoF data on map
	function showWoF(){
		if(!wofCase){
			return;
		}
	        if(document.getElementById('showWoF').checked){
	                activeWof.setVisibility(true);
	        }
	        else{
	                activeWof.setVisibility(false);
	        }
	        changeTime();
	}

	function displayWoFProbs1(){
		if(document.getElementById('wofProbs1').checked){
			displayWoFImage1 = true;
			var link = 'realtime/ewp/wof/wofBounds.txt';
                        var dataRequest = new XMLHttpRequest();
                        dataRequest.open('GET', link, false);
                        dataRequest.send();
                        var coords = dataRequest.responseText.split(",");
                        var llLon = coords[0];
                        var llLat = coords[1];
                        var urLon = coords[2];
                        var urLat = coords[3].split("\n")[0];
                        wofBounds = new OpenLayers.Bounds(llLon,llLat,urLon,urLat).transform(proj,proj2);
		}
		else{
			displayWoFImage1 = false;
			wofImageLast1 = null;
			if(map.layers.indexOf(wofImage1) != -1){
                        	map.removeLayer(wofImage1);
                	}
		}
		changeTime();
	}

	function displayWoF1(){
		if(!displayWoFImage1){
			return;
		}

		var tNow = new Date((timeCanvasVal.getAttr('time') + 3600) * 1000);
		var curMin = String(pad(tNow.getUTCMinutes()));
		if(parseInt(curMin.slice(1,2)) >= 5){
			var minute = curMin.slice(0,1) + '5';
		}
		else{
			var minute = curMin.slice(0,1) + '0';
		}
		var wofDate = tNow.getUTCFullYear() + pad(tNow.getUTCMonth() + 1) + pad(tNow.getUTCDate()) + pad(tNow.getUTCHours()) + minute;
		var imgPath = 'realtime/ewp/wof/WoF_Ens_uphlcy25_' + wofDate + '.png' 
		if(imgPath == wofImageLast1 && map.layers.indexOf(wofImage1) != -1){
			return;
		}
		else if(map.layers.indexOf(wofImage1) != -1){
                        map.removeLayer(wofImage1);
                }
		var imgOptions = {isBaseLayer: false, transparent: true, visibility: true, displayInLayerSwitcher:false, opacity: modelOpacity};
	        wofImage1 = new OpenLayers.Layer.Image('wofImage',imgPath,wofBounds,new OpenLayers.Size(1, 1),imgOptions);
	        map.addLayer(wofImage1);
		wofImageLast1 = imgPath;
	}

	function displayWoFProbs2(){
                if(document.getElementById('wofProbs2').checked){
                       	displayWoFImage2 = true;
                        var link = 'realtime/ewp/wof/wofBounds.txt';
                        var dataRequest = new XMLHttpRequest();
                        dataRequest.open('GET', link, false);
                       	dataRequest.send();
                       	var coords = dataRequest.responseText.split(",");
                       	var llLon = coords[0];
                        var llLat = coords[1];
                        var urLon = coords[2];
                        var urLat = coords[3].split("\n")[0];
                        wofBounds = new OpenLayers.Bounds(llLon,llLat,urLon,urLat).transform(proj,proj2);
                }
                else{
                        displayWoFImage2 = false;
			wofImageLast2 = null;
                        if(map.layers.indexOf(wofImage2) != -1){
                                map.removeLayer(wofImage2);
                        }
                }
                changeTime();
        }

        function displayWoF2(){
                if(!displayWoFImage2){
                        return;
                }

                var tNow = new Date((timeCanvasVal.getAttr('time') + 3600) * 1000);
                var curMin = String(pad(tNow.getUTCMinutes()));
                if(parseInt(curMin.slice(1,2)) >= 5){
                        var minute = curMin.slice(0,1) + '5';
                }
                else{
                       	var minute = curMin.slice(0,1) + '0';
                }
                var wofDate = tNow.getUTCFullYear() + pad(tNow.getUTCMonth() + 1) + pad(tNow.getUTCDate()) + pad(tNow.getUTCHours()) + minute;
                var imgPath = 'realtime/ewp/wof/WoF_Ens_vort005_' + wofDate + '.png' 
                if(imgPath == wofImageLast2 && map.layers.indexOf(wofImage2) != -1){
                        return;
                }
                else if(map.layers.indexOf(wofImage2) != -1){
                       	map.removeLayer(wofImage2);
                }
                var imgOptions = {isBaseLayer: false, transparent: true, visibility: true, displayInLayerSwitcher:false, opacity: modelOpacity};
                wofImage2 = new OpenLayers.Layer.Image('wofImage',imgPath,wofBounds,new OpenLayers.Size(1, 1),imgOptions);
                map.addLayer(wofImage2);
                wofImageLast2 = imgPath;
        }

	function renderWoFTab(){
			Ext.create('Ext.slider.Single', {
                                renderTo: 'wofTime',
                                id: 'wofTimeSlider',
				name: 'wofTimeSlider',
                                hideLabel: true,
                                width: 150,
                                minValue: 15,
                                maxValue: 90,
				increment: 5,
                                values: [wofLeadTime],
                                listeners: {
				    dragend: function(slider, e, opts) {
					document.getElementById('wofLeadTimeLabel').focus();
				    },
                                    changecomplete: function(slider, newValue, thumb){
					//wofLeadTime = parseInt(newValue);
					//wofTracksFeatures = [];
			                //wofTracksFeaturesBack = [];
			                //renderWoFObjects(wof1.features, now, wofTracksFeatures, wofTracksFeaturesBack);
			                //wofTracks.removeAllFeatures();
			                //wofTracks.addFeatures(wofTracksFeatures);
                                    },
                                    change: function(slider, newValue, thumb){
					wofLeadTime = parseInt(newValue);
					loadWoFViz();
					var wofText = '';
					if(wof1.features.length > 1){
						var t1 = Math.round((timeCanvasVal.getAttr('time') - wof1.features[0].attributes.initTime) / 60);
						var t2 = Math.round((timeCanvasVal.getAttr('time') + (newValue * 60) - wof1.features[0].attributes.initTime) / 60);
						if(t2 > 90){
							t2 = 90;
						}
						wofText = '<br>(+' + t1 + ' to +' + t2 + ' Forecast minutes)';
					}
					document.getElementById('wofLeadTimeLabel').innerHTML = '<b>' + newValue + ' minutes</b> ' + wofText;
				    }
				}
			});

			Ext.create('Ext.slider.Single', {
                                renderTo: 'wofValue',
                                id: 'wofValSlider',
                                hideLabel: true,
                                width: 150,
                                minValue: wofValMin,
                                maxValue: wofValMax,
                                increment: wofValInc,
                                values: [wofVal],
                                listeners: {
                                    change: function(slider, newValue, thumb){
                                        wofVal = parseInt(newValue);
					wofVal3 = wofVal;
                                        loadWoFViz();
					if(wofType == 'uh'){
		                                document.getElementById('wofValLabel').innerHTML = wofVal + ' ' + wofValUnits;
		                        }
		                        else{
		                                document.getElementById('wofValLabel').innerHTML = wofVal + ' ' + wofValUnits;
		                        }
                                    }
                                }
                        });

			Ext.create('Ext.slider.Single', {
                               	renderTo: 'wofInValue',
                               	id: 'wofInValSlider',
                               	hideLabel: true,
                               	width: 150,
                               	minValue: wofInMin,
                               	maxValue: wofInMax,
                               	increment: wofInInc,
                               	values: [wofIn],
                               	listeners: {
                                    change: function(slider, newValue, thumb){
                                       	wofIn = parseInt(newValue);
                                       	wofIn3 = wofIn;
                                       	loadWoFViz();
                                       	if(wofType == 'uh'){
                                               	document.getElementById('wofInValLabel').innerHTML = wofIn + ' ' + wofInUnits;
                                        }
                                        else{
                                               	document.getElementById('wofInValLabel').innerHTML = wofIn/1000 + ' ' + wofInUnits;
                                        }
                                    }
                               	}
                        });

			if(wofType == 'uh'){
	                        document.getElementById('wofValLabel').innerHTML = wofVal + ' ' + wofValUnits;
			}
			else{
				document.getElementById('wofValLabel').innerHTML = wofVal + ' ' + wofValUnits;
			}

			if(wofType == 'uh'){
                                document.getElementById('wofInValLabel').innerHTML = wofIn + ' ' + wofInUnits;
                       	}
                       	else{
                               	document.getElementById('wofInValLabel').innerHTML = wofIn/1000 + ' ' + wofInUnits;
                       	}
	}

	function renderWoFObjects(feats, now, arr1, arr2){
		try{
			var tNow = timeCanvasVal.getAttr('time');
		}
		catch(err){
			return;
		}
                var geojson_format = new OpenLayers.Format.GeoJSON();
                var reader = new jsts.io.WKTReader();
                var parser = new jsts.io.OpenLayersParser();
                var geomList = [];
		if(wofType == 'vor' || wofType == 'vorml'){
			var wv = parseFloat(wofVal) / 1000;
		}
		else{
			var wv = parseInt(wofVal);
		}
		var arr1_1 = [];
                for(var i=0;i<feats.length;i++){
                        //var attrs = geojson_format.read(JSON.stringify(feats[i].attributes));
                        //var clonePoint = parser.read(feats[i].geometry);
                        //var region = clonePoint.buffer(1800);
                        //var buf = parser.write(region)
			if(feats[i].attributes.leadTime > (tNow + (wofLeadTime * 60) + 30) || feats[i].attributes.leadTime < tNow){
				continue;
			}
			else if(wofLayer == 'lines'){
				arr1.push(feats[i].clone());
			}
                        else if(geomList.indexOf(feats[i].geometry.y) == -1){
                                var buf = new OpenLayers.Geometry.Polygon.createRegularPolygon(feats[i].geometry,2650,4,0);
                                var region = new OpenLayers.Feature.Vector(buf, feats[i].attributes);
                                arr1_1.push(region.clone());
                                geomList.push(feats[i].geometry.y);
                        }
                        else{
                                var idx = geomList.indexOf(feats[i].geometry.y);
                                arr1_1[idx].attributes.count  = arr1_1[idx].attributes.count + 1;
				if(feats[i].attributes.val > arr1_1[idx].attributes.max){
					arr1_1[idx].attributes.max = feats[i].attributes.val;
					arr1_1[idx].attributes.maxTime = feats[i].attributes.maxTime;
				}
                        }
                }

		// prune points based on number of members (2017)
		for(var i=0;i<arr1_1.length;i++){
			if(arr1_1[i].attributes.count >= wofVal && arr1_1[i].attributes.max >= parseInt(wofIn)){
				arr1.push(arr1_1[i].clone());
			}
		}
        }

	function loadWoFViz(){
		wofTracksFeatures = [];
                wofTracksFeaturesBack = [];
		var wofText = '';
		if(showW){
	                renderWoFObjects(wof1.features, now, wofTracksFeatures, wofTracksFeaturesBack);
			if(wof1.features.length > 1){
				var t1 = Math.round((timeCanvasVal.getAttr('time') - wof1.features[0].attributes.initTime) / 60);
                                var t2 = Math.round((timeCanvasVal.getAttr('time') + (wofLeadTime * 60) - wof1.features[0].attributes.initTime) / 60);
				if(t2 > 90){
					t2 = 90;
				}
                                wofText = '<br>(+' + t1 + ' to +' + t2 + ' Forecast minutes)';
			}
		}
		try{
			document.getElementById('wofLeadTimeLabel').innerHTML = '<b>' + wofLeadTime + ' minutes</b>' + wofText;
		}
		catch(err){

		}
                wofTracks.removeAllFeatures();
                wofTracks.addFeatures(wofTracksFeatures);
	}

	function showWoFViz(viz){
		//if(viz == 'lines' && !document.getElementById('showWoFTracks').checked){
		//	showW = false;
		//	loadWoFViz();
		//	return;
		//}
		if(viz == 'points' && !document.getElementById('showWoFProbs').checked){
			showW = false;
			loadWoFViz();
			return;
		}
		else if(viz == 'lines' && document.getElementById('showWoFProbs').checked){
                        document.getElementById('showWoFProbs').checked = false;
			showW = true;
                }
		//else if(viz == 'points' && document.getElementById('showWoFTracks').checked){
                //        document.getElementById('showWoFTracks').checked = false;
		//	showW = true;
                //}
		else{
			showW = true;
		}
		wofLayer = viz;
		wofTimeLast = null;
		wofDateLast = null;
		loadWof(now);
	}

	function changeWoFVal(){
		var wofTypeNew = document.getElementById('wofValSelect').value;		
		if(wofTypeNew != wofType){
			killPopup();
			wofType = wofTypeNew;
			wofVal3 = wofVal;
			//wofVal = wofVal2;
			wofVal2 = wofVal3;
			wofIn3 = wofIn;
                        //wofIn = wofIn2;
                        wofIn2 = wofIn3;
			// commented values are from 2016 thresholding method
			if(wofType == 'uh'){
				//wofValUnits = 'm^2/s^2';
				//wofValMin = 25;
				//wofValMax = 250;
				//wofValInc = 25;
				wofValUnits = 'Member(s)';
				wofValMin = 1;
                               	wofValMax = 18;
                               	wofValInc = 1;
			}
			else{
				wofInUnits = 's<sup>-1</sup>';
				wofInMin = 1;
                               	wofInMax = 15;
                               	wofInInc = 1;
				wofValUnits = 'Member(s)';
				wofValMin = 1;
                                wofValMax = 18;
                                wofValInc = 1;
			}
			var wofValSlider = Ext.getCmp('wofValSlider');
			wofValSlider.destroy();
			Ext.create('Ext.slider.Single', {
                                renderTo: 'wofValue',
                                id: 'wofValSlider',
                                hideLabel: true,
                                width: 150,
                                minValue: wofValMin,
                                maxValue: wofValMax,
                                increment: wofValInc,
				enableKeyNav: false,
                                values: [wofVal],
                                listeners: {
                                    change: function(slider, newValue, thumb){
                                        wofVal = parseInt(newValue);
					wofVal3 = wofVal;
                                        loadWoFViz();
					/*
					if(wofType == 'uh'){
		                                document.getElementById('wofValLabel').innerHTML = wofVal + ' ' + wofValUnits;
		                        }
		                        else{
		                                document.getElementById('wofValLabel').innerHTML = wofVal/1000 + ' ' + wofValUnits;
		                        }
					*/
					document.getElementById('wofValLabel').innerHTML = wofVal + ' ' + wofValUnits;
                                    }
                                }
                        });

			try{
				var wofValSlider = Ext.getCmp('wofInValSlider');
                       		wofValSlider.destroy();
			}
			catch(err){}
			
			Ext.create('Ext.slider.Single', {
                               	renderTo: 'wofInValue',
                               	id: 'wofInValSlider',
                               	hideLabel: true,
                               	width: 150,
                               	minValue: wofInMin,
                               	maxValue: wofInMax,
                               	increment: wofInInc,
                               	enableKeyNav: false,
                               	values: [wofIn],
                               	listeners: {
                                    change: function(slider, newValue, thumb){
                                       	wofIn = parseInt(newValue);
                                       	wofIn3 = wofIn;
                                       	loadWoFViz();
                                       	/*
                                       	if(wofType == 'uh'){
                                               	document.getElementById('wofValLabel').innerHTML = wofVal + ' ' + wofValUnits;
                                        }
                                       	else{
                                               	document.getElementById('wofValLabel').innerHTML = wofVal/1000 + ' ' + wofValUnits;
                                       	}
                                        */
                                        document.getElementById('wofInValLabel').innerHTML = wofIn/1000 + ' ' + wofInUnits;
                               	    }
                               	}
                        });

			/*
			if(wofType == 'uh'){
                                document.getElementById('wofValLabel').innerHTML = wofVal + ' ' + wofValUnits;
                        }
                        else{
                                document.getElementById('wofValLabel').innerHTML = wofVal/1000 + ' ' + wofValUnits;
                        }
			*/
			document.getElementById('wofValLabel').innerHTML = wofVal + ' ' + wofValUnits;
			document.getElementById('wofInValLabel').innerHTML = wofIn/1000 + ' ' + wofInUnits;
		}
		if(!showW){
			return;
		}
                wofTimeLast = null;
                wofDateLast = null;
                loadWof(now);
	}
