	/*

        Copyright (c) 2014 Cooperative Institute for Mesoscale Meteorological Studies (CIMMS) and the University of Oklahoma

        Author:         Dr. Chris Karstens
        Email:          chris.karstens@noaa.gov
        Description:    Contains the following:
				1. uses an input lat/lon to move the "user point" on the map.
				2. reads and displays the server generated grids for PHI threat objects
				3. functions for displaying various color schemes for gridded data
				4. functions for generating accumlated probabilities for a point or grid of points
				5. function for determining which active threats will pass over a particular point on the map
				6. function for generating an estimated answer to basic questions for threat objects
				7. function for exporting the preview grid to the server (deprecated)
				8. function for changing the preview grid opacity
				9. function for rendering the grid slider when the display tab is active.

        */

	// user location
	function defineUserPoint(){
		userLoc.removeAllFeatures();
		lat = parseFloat(document.getElementById('uLat').value);
		lon = parseFloat(document.getElementById('uLon').value);
		userPoint = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(lon,lat).transform(geographicProj, mercatorProj),{'color':'rgb(0,0,0)'});
		userLoc.addFeatures([userPoint]);
	}

	// read/display accumulated grid
	var grids = [];
	var gridData = [];
	function readGrid(gridTime){
		return;
		if(grids.indexOf(gridTime) == -1){
			var geojson_format = new OpenLayers.Format.GeoJSON();
			url = 'getThreatGrids.php?gridTime=' + gridTime + '&user=' + user;
			var dataRequest = new XMLHttpRequest();
			dataRequest.open('GET', url, false);
			dataRequest.send();
			if(dataRequest.responseText != 'none'){
				gridCells = dataRequest.responseText.split("\n");
				gridFeatures = [];
				for(i4=0;i4<gridCells.length;i4++){
					if(gridCells[i4].length > 0){
						gridCell = geojson_format.read(gridCells[i4]);
						gridCell[0].geometry.transform(geographicProj,mercatorProj);
						gridFeatures.push(gridCell[0]);
					}
				}
				gridData.push(gridTime);
				gridData[gridTime] = [];
				gridData[gridTime].push(new OpenLayers.Layer.Vector(gridTime));
				gridData[gridTime][0].addFeatures(gridFeatures);
				grids.push(gridTime);
			}
		}
	}

	// read/display probabilities generated in NCP
	function readIssuedProbs(){
		link = 'readEFP_probs.php?user=' + user;
		var dataRequest = new XMLHttpRequest();
               	dataRequest.open('GET', link, false);
               	dataRequest.send();
		//alert(dataRequest.responseText);
		contours = dataRequest.responseText.split("\n");		
		var geojson_format = new OpenLayers.Format.GeoJSON();
		cts = [];
		fTimes = [];
		var issueTypes = false;
		for(k7=0;k7<contours.length;k7++){
			if(contours[k7].length > 0){
				contour = geojson_format.read(contours[k7]);
                               	contour[0].geometry.transform(geographicProj,mercatorProj);
                               	cts.push(contour[0]);
				cTimes = [contour[0].attributes.startTime,contour[0].attributes.endTime];
				if(fTimes.indexOf(cTimes) == -1){
					fTimes.push(cTimes);
					insertNCPRecord(contour[0].clone(),'Issued');
					if(contour[0].attributes.issueType == 'afternoon'){
						issueTypes = true;
					}
				}
			}
		}
		activeProbs.addFeatures(cts);
		if(issueTypes){
                        for(var k3=0;k3<threatStore.data.items.length;k3++){
                                if(threatStore.data.items[k3].get('fname').split('_')[0] == 'morning'){
                                        showNCPProbs(k3, false);
					threatStore.data.items[k3].set('show',false);
                                }
                        }
		}
		changeTime();
	}

	// read/display automated background probabilities
       	var background = [];
       	var backgroundData = [];
       	function readBackground(backgroundChecked){
               	//if(backgrounds.indexOf(backgroundTime) == -1){
		if(backgroundChecked){
			background_area.removeAllFeatures();
			deletePendingRecords();
                       	url = 'getBackgroundLog.php?user=' + user;
                       	var dataRequest = new XMLHttpRequest();
                       	dataRequest.open('GET', url, false);
                       	dataRequest.send();
                       	//if(dataRequest.responseText != 'none'){
				document.getElementById("backgroundConfig").innerHTML = '';
				//alert(dataRequest.responseText);
				//if(dataRequest.responseText.split("\n")[dataRequest.responseText.split("\n").length - 2].split(":")[0] != "Time elapsed"){
				//	return;
				//}
				loadBackground(drawType);

				hazardSel = document.getElementById('hazardType');
                                for(j4=0;j4<hazardSel.options.length;j4++){
                                        if(hazardSel.options[j4].value == hazOpt){
                                                hazardSel.selectedIndex = j4;
                                                break;
                                        }
                                }
                                hazardSel.disabled = true;

				var geojson_format = new OpenLayers.Format.GeoJSON();
				url = 'getBackgroundData.php?user=' + user;
	                        var dataRequest = new XMLHttpRequest();
	                        dataRequest.open('GET', url, false);
	                        dataRequest.send();
				//alert(dataRequest.responseText);
                               	backgroundCells = dataRequest.responseText.split("\n");
                               	backgroundFeatures = [];
				var parser = new jsts.io.OpenLayersParser();
				reader = new OpenLayers.Format.JSON();
				bBox = parser.read(threat_lines.features[0].geometry.clone());
				cCount = 0;
                               	for(i4=0;i4<backgroundCells.length;i4++){
                                       	if(backgroundCells[i4].length > 0){
						pending = true;
                                               	backgroundCell = geojson_format.read(backgroundCells[i4]);
						//attrs = reader.read(backgroundCell[0].attributes);
						backgroundCell[0].geometry.transform(geographicProj,mercatorProj);
						poly = new OpenLayers.Geometry.Polygon(new OpenLayers.Geometry.LinearRing(backgroundCell[0].geometry.getVertices()));
			                       	//poly2 = parser.read(poly);
			                       	//poly2 = bBox.intersection(poly2);
			                       	//poly = parser.write(poly2);
						//backgroundCell[0].geometry = poly;
                                               	//backgroundCell[0].geometry.transform(geographicProj,mercatorProj);
						if(poly.getArea() > 0){
							cCount++;
							linearRing = new OpenLayers.Geometry.LinearRing(poly.getVertices());
							backgroundCell[0].geometry = linearRing;
							//feat = new OpenLayers.Feature.Vector(linearRing,{'prob':backgroundCell[0].attributes.prob,'color':backgroundCell[0].attributes.color});
	                                               	backgroundFeatures.push(backgroundCell[0]);
							contourNumber = backgroundCell[0].attributes.probID;
							fstart = backgroundCell[0].attributes.fStart;
							fend = backgroundCell[0].attributes.fEnd;
							timeCanvasVal.setAttr('time',backgroundCell[0].attributes.startTime);
							backgroundCell[0].attributes.show = true;
							backgroundCell[0].attributes.user = user;
							backgroundCell[0].attributes.probID = cCount;
							loadContours(backgroundCell[0].attributes.probID,backgroundCell[0].attributes.prob);
							contourSel = document.getElementById('contourVal' + backgroundCell[0].attributes.probID);
							for(j4=0;j4<contourSel.options.length;j4++){
					                       	if(contourSel.options[j4].value == backgroundCell[0].attributes.prob){
					                               	contourSel.selectedIndex = j4;
					                                break;
					                       	}
					               	}
							loadContourColor(backgroundCell[0].attributes.probID);
							insertNCPRecord(backgroundCell[0].clone(),'Pending');
						}
                                       	}
                               	}
				moveSliderTime();
				loadContours(contourNumber + 1);
				periodSel = document.getElementById('periodVal');
				for(j4=0;j4<periodSel.options.length;j4++){
					if(periodSel.options[j4].value == selOpt){
						periodSel.selectedIndex = j4;
						break;
					}
				}
				periodSel.disabled = true;
				
                               	//backgroundData.push(backgroundTime);
                               	//backgroundData[backgroundTime] = [];
                               	//backgroundData[backgroundTime].push(new OpenLayers.Layer.Vector(backgroundTime));
                               	//backgroundData[backgroundTime][0].addFeatures(backgroundFeatures);
                               	//backgrounds.push(backgroundTime);
				background_area.addFeatures(backgroundFeatures);
				backgroundCheck = false;
				selectGrid();
				changeTime();
				//document.getElementById("backgroundConfig").innerHTML = 'Done!';
                       	//}
               	}
       	}

	// get color based on probability in grid box (not used)
	function getColor2(val){
		if(val <= 25){
			r = 0;
			g = parseInt((val / 25) * 255);
			b = parseInt(255 - ((val / 25) * 255));
		}
		else if(val <= 50){
			r = parseInt(255 - (((50 - val) / 25) * 255));
			g = 255;
			b = 0;
		}
		else if(val <= 75){
			r = 255;
			g = parseInt(((75 - val) / 25) * 255);
			b = 0;
		}
		else if(val <= 100){
			r = 255;
			g = 0;
			b = parseInt(255 - (((100 - val) / 25) * 255));
		}
		else{
			r = g = b = 0;
		}
		return 'rgb(' + r + ',' + g + ',' + b + ')';
	}

	function getStandardColor2(val){
		if(val <= 20){
			var color = '#179617';
		}
		else if(val <= 40){
			var color = '#FFFF00';
		}
		else if(val <= 60){
			var color = '#FF9900';
		}
		else if(val <= 80){
			var color = '#FF0000';
		}
		else if(val <= 100){
			var color = '#FF00FF';
		}
		else{
			var color = '#000000';
		}
		return color;
	}

	function getStandardColor(val){
			if(val <= 20){
                                r = 0;
                                g = 204;
                               	b = 0;
                        }
                        else if(val < 40){
                                r = 255;
                               	g = 255;
                                b = 0;
                        }
                       	else if(val < 60){
                                r = 255;
                               	g = 128;
                                b = 0;
                        }
                       	else if(val < 80){
                               	r = 255;
                                g = 0;
                               	b = 0;
                       	}
                        else if(val <= 100){
                                r = 255;
                               	g = 0;
                                b = 255;
                        }
                       	else{
                                r = g = b = 0;
                        }
			return 'rgb(' + r + ',' + g + ',' + b + ')';
	}

	// return color based on active color scale and probability value
	function getColor(val){
		if(colorScale == '5Levels'){
			if(val <= 20){
				r = 0;
				g = 204;
				b = 0;
			}
			else if(val < 40){
				r = 255;
				g = 255;
				b = 0;
			}
			else if(val < 60){
				r = 255;
				g = 128;
				b = 0;
			}
			else if(val < 80){
				r = 255;
				g = 0;
				b = 0;
			}
			else if(val <= 100){
				r = 255;
				g = 0;
				b = 255;
			}
			else{
				r = g = b = 0;
			}
		}
		else if(colorScale == 'NHC'){
			if(val < 10){
	                        r = 0;
	                        g = 204;
	                        b = 0;
	                }
	                else if(val < 20){
	                        r = 0;
	                        g = 138;
	                        b = 0;
	                }
	                else if(val < 30){
	                        r = 128;
	                        g = 255;
	                        b = 0;
	                }
	                else if(val < 40){
	                        r = 255;
	                        g = 255;
	                        b = 0;	
        	        }
                	else if(val < 50){
                	        r = 255;
                	        g = 213;
                	        b = 0;
                	}
	                else if(val < 60){
	                        r = 204;
	                        g = 129;
	                        b = 0;
	                }
	                else if(val < 70){
	                        r = 255;
	                        g = 123;
	                        b = 0;
	                }
	                else if(val < 80){
	                        r = 204;
	                        g = 0;
	                        b = 0;
	                }
			else if(val < 90){
	                        r = 138;
	                        g = 0;
	                        b = 0;
	                }
	                else if(val <= 100){
	                        r = 138;
	                        g = 0;
	                        b = 138;
	                }
	                else{
	                        r = g = b = 0;
	                }
		}
		else if(colorScale == 'full'){
			if(val <= 25){
	                        r = 0;
	                        g = parseInt((val / 25) * 255);
	                        b = parseInt(255 - ((val / 25) * 255));
	                }
	                else if(val <= 50){
	                        r = parseInt(255 - (((50 - val) / 25) * 255));
	                        g = 255;
	                        b = 0;
	                }
	                else if(val <= 75){
	                        r = 255;
	                        g = parseInt(((75 - val) / 25) * 255);
	                        b = 0;
	                }
	                else if(val <= 100){
	                        r = 255;
	                        g = 0;
	                        b = parseInt(255 - (((100 - val) / 25) * 255));
	                }
	                else{
	                        r = g = b = 0;
	                }
		}
		else if(colorScale == 'gray'){
			r = Math.round((1 - (val / 100)) * 255);
			g = Math.round((1 - (val / 100)) * 255);
			b = Math.round((1 - (val / 100)) * 255);
                }
		return 'rgb(' + r + ',' + g + ',' + b + ')';
	}

	function getColorAll(val){
		if(val <= 25){
                       	r = 0;
                       	g = parseInt((val / 25) * 255);
                       	b = parseInt(255 - ((val / 25) * 255));
               	}
               	else if(val <= 50){
                        r = parseInt(255 - (((50 - val) / 25) * 255));
                        g = 255;
                      	b = 0;
                }
                else if(val <= 75){
                       	r = 255;
                        g = parseInt(((75 - val) / 25) * 255);
                       	b = 0;
                }
                else if(val <= 100){
                       	r = 255;
                        g = 0;
                       	b = parseInt(255 - (((100 - val) / 25) * 255));
                }
                else{
                       	r = g = b = 0;
               	}
		return 'rgb(' + r + ',' + g + ',' + b + ')';
	}

	// spc tornado color table
	function getSPCTornadoColor(val){
	        if(val == 2){
	                r = 0;
	                g = 139;
	                b = 0;
	        }
		else if(val == 5){
	                r = 139;
	                g = 71;
	                b = 38;
	        }
		else if(val == 10){
	                r = 255;
	                g = 200;
	                b = 0;
	        }
		else if(val == 15){
	                r = 255;
	                g = 0;
	                b = 0;
	        }
		else if(val == 30){
	                r = 255;
	                g = 0;
	                b = 255;
	        }
		else if(val == 45){
	                r = 145;
	                g = 44;
	                b = 238;
	        }
		else if(val == 60){
	                r = 16;
	                g = 78;
	                b = 139;
		}
	        else{
	                r = g = b = 0;
		}
	        return 'rgb(' + r + ',' + g + ',' + b + ')';
	}

	// spc color table
        function getSPCColor(val){
                if(val == 5){
                        r = 139;
                        g = 71;
                        b = 38;
                }
                else if(val == 15){
                        r = 255;
                        g = 200;
                        b = 0;
                }
                else if(val == 30){
                        r = 255;
                        g = 0;
                        b = 0;
                }
                else if(val == 45){
                        r = 255;
                        g = 0;
                        b = 255;
                }
                else if(val == 60){
                        r = 145;
                        g = 44;
                        b = 238;
                }
                else{
                        r = g = b = 0;
                }
                return 'rgb(' + r + ',' + g + ',' + b + ')';
        }

	// PECAN color table
	function getPecanColor(val){
               	if(val == 'Low'){
                       	r = 0;
                       	g = 139;
                       	b = 0;
               	}
		else if(val == 'Moderate'){
			r = 255;
                       	g = 0;
                       	b = 0;
		}
		else if(val == 'High'){
			r = 255;
                       	g = 0;
                       	b = 255;
		}
		else{
			r = g = b = 0;
		}
		return 'rgb(' + r + ',' + g + ',' + b + ')';
	}

	// generate accumulated probability grid (not used)
	function lightUpGrid(selectedFeature,selectedFeature2,prob){
		ndfd_grid.removeAllFeatures();
		threat_lines.removeAllFeatures();
		trace0 = new OpenLayers.Feature.Vector(selectedFeature2.clone(),{'color':'rgb(0,0,0)'});
		threat_lines.addFeatures([trace0]);
		if(threat_points.features.length > 0){
			prob = Math.round(threat_points.features[ftime].attributes.prob,0);
		}
		else{
			selectedFeature = selectedFeature.geometry;
		}
		var boxBounds = selectedFeature.getBounds().transform(mercatorProj,geographicProj);
                var b = String(boxBounds).split(',');
               	ll_lon = b[0];
               	ll_lat = b[1];
                ur_lon = b[2];
                ur_lat = b[3];
		for(k=Math.floor(ll_lon * 10) / 10;k<=Math.ceil(ur_lon * 10) / 10;k=k+spacing){
                        for(j2=Math.floor(ll_lat * 10) / 10;j2<=Math.ceil(ur_lat * 10) / 10;j2=j2+spacing){
	                        point1 = new OpenLayers.Geometry.Point(k,j2);
	                        point2 = new OpenLayers.Geometry.Point(k + spacing,j2);
	                       	point3 = new OpenLayers.Geometry.Point(k + spacing,j2 + spacing);
	                        point4 = new OpenLayers.Geometry.Point(k,j2 + spacing);
	                       	points = [point1,point2,point3,point4,point1];
	                       	linearRing = new OpenLayers.Geometry.LinearRing(points);
	                        grid_point_box = new OpenLayers.Geometry.Polygon([linearRing]);
				grid_point_box.transform(geographicProj,mercatorProj);
				center = grid_point_box.getCentroid();
				if(selectedFeature2.containsPoint(center)){
					color = getColor(prob);
                                        ndfd_grid_point = new OpenLayers.Feature.Vector(grid_point_box,{'prob':prob,'probs':[prob],'times':[0],'color':color,'x':k,'y':j2});
                                       	ndfd_grid.addFeatures([ndfd_grid_point]);
				}
				else if(selectedFeature.containsPoint(center)){
					seg1 = center.distanceTo(selectedFeature2);
                                       	seg2 = center.distanceTo(selectedFeature);
                                       	dis_norm = seg2 / (seg1 + seg2);
                                       	// sine interpolation between threat prob and background prob
                                       	//prob = Math.round(((prob - 35) * Math.sin((dis_norm * 90) * Math.PI / 180)) + 35);
                                       	//newProb = Math.round(((prob - 35) * (1 - Math.cos((dis_norm * 90) * Math.PI / 180))) + 35);
					// gaussian interpolation
					newProb = Math.round(((prob - 0) * ((dis_norm * dis_norm))) + 0);
					color = getColor(newProb);
	                               	ndfd_grid_point = new OpenLayers.Feature.Vector(grid_point_box,{'prob':newProb,'probs':[newProb],'times':[0],'color':color,'x':k,'y':j2});
	                               	ndfd_grid.addFeatures([ndfd_grid_point]);
				}
				else if(selectedFeature.intersects(grid_point_box)){
					newProb = 0;
					color = getColor(newProb);
                                        ndfd_grid_point = new OpenLayers.Feature.Vector(grid_point_box,{'prob':newProb,'probs':[newProb],'times':[0],'color':color,'x':k,'y':j2});
                                        ndfd_grid.addFeatures([ndfd_grid_point]);
				}
			}
		}
		boxBounds = boxBounds.transform(geographicProj,mercatorProj);
	}

	// remove ndfd grid cells based on time slider value
	function removeGridCells(){
		now = timeCanvasVal.getAttr('time');
		badCells = [];
               	for(k3=0;k3<ndfd_grid.features.length;k3++){
                        if(now < ndfd_grid.features[k3].attributes.start || now > ndfd_grid.features[k3].attributes.end){
                        	badCells.push(ndfd_grid.features[k3]);
                        }
                }
		ndfd_grid.removeFeatures(badCells);
	}

	// display accumulated ndfd grid based on time slider value
       	function lightUpGridAccum(selectedFeature,selectedFeature2,idx,prob){
		if(modifyFeature == null || modifyFeature.feature == null){
			return;
		}
		ndfd_grid.removeAllFeatures();
		newGrid = [];
		now = timeCanvasVal.getAttr('time');
		for(k3=0;k3<swaths.features.length;k3++){
			if(grids.indexOf(swaths.features[k3].attributes.issue) != -1){
				for(j3=0;j3<gridData[swaths.features[k3].attributes.issue][0].features.length;j3++){
					//if(swaths.features[k3].geometry.intersects(gridData[swaths.features[k3].attributes.issue][0].features[j3].geometry)){
					if(now >= gridData[swaths.features[k3].attributes.issue][0].features[j3].attributes.start && now < gridData[swaths.features[k3].attributes.issue][0].features[j3].attributes.end){
						newGrid.push(gridData[swaths.features[k3].attributes.issue][0].features[j3].clone());
					}
				}
			}
		}
		ndfd_grid.addFeatures(newGrid);
		//ndfd_grid.redraw();
        }

	function clearGridPreview(){
		try{
			gridPreview = false;
			ndfd_grid2.removeAllFeatures();
			document.getElementById('previewGridButton').value = 'Preview Grid';
	               	document.getElementById('previewGridButton').onclick = lightUpGridAccum2(true);
		}
		catch(err){

		}
	}

	function lightUpGridAccumNew(){
		ndfd_grid2.removeAllFeatures();
		lightUpGridAccum2(true);
	}

	// generate preview of accumulated probabilities for current threat
        function lightUpGridAccum2(render){
		var geojson_format = new OpenLayers.Format.JSON();
		if(modifyFeature == null || modifyFeature.feature == null || gridAttrs == geojson_format.read(JSON.stringify(modifyFeature.feature.attributes)) || ndfd_grid2.features.length > 0 || !gridState){
			if(render || !gridState){
	                	return;
			}
                }
		console.log('grid');
		try{
			document.getElementById('previewGridButton').value = 'Generating';
		}
		catch(err){

		}
		if(render){
			var boxBounds = threat_region.features[0].geometry.getBounds().transform(mercatorProj,geographicProj);
		}
		else{
			var boxBounds = swathEDD.getBounds().transform(mercatorProj,geographicProj);			
		}
                var b = String(boxBounds).split(',');
		var ll_lon = checkEven(Math.floor((b[0] - 0.02) * 100));
                var ll_lat = checkEven(Math.floor((b[1] - 0.02) * 100));
                var ur_lon = checkEven(Math.ceil((parseFloat(b[2]) + 0.02) * 100));
                var ur_lat = checkEven(Math.ceil((parseFloat(b[3]) + 0.02) * 100));
		var ndfd_features = {};
                // generate null ndfd grid
		spacing = 2;
		for(var k3=ll_lon;k3<=ur_lon;k3=k3+spacing){
                        for(var j2=ll_lat;j2<=ur_lat;j2=j2+spacing){
				key1 = String(k3);
				key2 = String(j2);
				point1 = new OpenLayers.Geometry.Point(k3/100,j2/100);
                                point2 = new OpenLayers.Geometry.Point((k3 + spacing)/100,j2/100);
                                point3 = new OpenLayers.Geometry.Point((k3 + spacing)/100,(j2 + spacing)/100);
                                point4 = new OpenLayers.Geometry.Point((k3/100),(j2 + spacing)/100);
                                points = [point1,point2,point3,point4,point1];
                                linearRing = new OpenLayers.Geometry.LinearRing(points);
                                grid_point_box = new OpenLayers.Geometry.Polygon([linearRing]);
                                grid_point_box.transform(geographicProj,mercatorProj);
				//var keys = getNDFDKeys(k3, j2);
                               	//var key1 = keys.split(',')[0];
                               	//var key2 = keys.split(',')[1];
				if(j2 == ll_lat){
					ndfd_features[key1] = {};
				}
				if(render){
					ndfd_features[key1][key2] = new OpenLayers.Feature.Vector(grid_point_box,{'prob':-1,'probs':[],'times':[],'color':'rgb(0,0,0)','x':k3/100,'y':j2/100,'dis':0,'issue':modifyFeature.feature.attributes.data['issue'],'duration':modifyFeature.feature.attributes.data['duration']});
				}
				else{
					ndfd_features[key1][key2] = new OpenLayers.Feature.Vector(grid_point_box,{'prob':-1,'probs':[],'times':[],'color':'rgb(0,0,0)','x':k3/100,'y':j2/100,'dis':0,'issue':featEDD.attributes.data['issue'],'duration':featEDD.attributes.data['duration']});
				}
				for(var k=0;k<=ndfd_features[key1][key2].attributes.duration;k++){
					ndfd_features[key1][key2].attributes.probs.push(0);
					ndfd_features[key1][key2].attributes.times.push(k);
				}
			}
		}
		var boxBounds = boxBounds.transform(geographicProj,mercatorProj);
		// iterate through all 1-min objects
		for(var k=0;k<allThreatObjects.length;k++){
			if((k%2) != 0 && render){
				continue; // skip every other object for improved performance
			}
			var segs = [];
			var maxDis = 0;
			var probVal = allProbVals[k];
			var poly = allThreatObjects[k];
			var c = get_polygon_centroid(poly.getVertices());
			var polyCentroid = new OpenLayers.Geometry.Point(c.x, c.y);
			boxBounds = poly.getBounds().transform(mercatorProj,geographicProj);
			b = String(boxBounds).split(',');
	                ll_lon = checkEven(Math.floor((b[0] - 0.02) * 100));
	                ll_lat = checkEven(Math.floor((b[1] - 0.02) * 100));
	                ur_lon = checkEven(Math.ceil((parseFloat(b[2]) + 0.02) * 100));
	                ur_lat = checkEven(Math.ceil((parseFloat(b[3]) + 0.02) * 100));
			var zeros_x = [];
			var zeros_y = [];
			var keys1 = [];
			var keys2 = [];
			var i = -1;
			// perform point in polygon, store zeros
			for(var k3=ll_lon;k3<=ur_lon;k3=k3+spacing){
				i++;
				var j = -1;
                                for(var j2=ll_lat;j2<=ur_lat;j2=j2+spacing){
					j++;
					key1 = String(k3);
					key2 = String(j2);
					if(i == 0){
						keys2.push(key2);
					}
					try{
						if(probVal < ndfd_features[key1][key2].attributes.prob){
	                                               	continue;
	                                       	}
					}
					catch(err){
						continue;
					}
                                       	uPoint2 = ndfd_features[key1][key2].geometry.getCentroid();
                                       	//if(poly.containsPoint(uPoint)){
                                       	if(pointLocation(uPoint2, poly)){
						ndfd_features[key1][key2]['dis'] = 1.0
					}
					else{
						zeros_x.push(i);
						zeros_y.push(j)
					}
				}
				keys1.push(key1);
			}
			var maxVal = 0;
			// perform euclidean distance transform, store max value for normalization
			for(var i=0;i<keys1.length;i++){
				for(var j=0;j<keys2.length;j++){
					key1 = keys1[i];
					key2 = keys2[j];
					try{
						if(ndfd_features[key1][key2]['dis'] == 0){
							continue;
						}
					}
					catch(err){
						continue;
					}
					var vals = [];
					for(var m=0; m < zeros_x.length; m++){
						var xDiff = i - zeros_x[m];
						var yDiff = j - zeros_y[m];
						var diff = Math.sqrt(Math.pow(xDiff,2) + Math.pow(yDiff,2))
						vals.push(diff);
					}
					ndfd_features[key1][key2]['dis'] = vals.min();
					if(vals.min() > maxVal){
						maxVal = vals.min();
					}
				}
			}
			// normalize distances and input into 2D Gaussian
			for(var i=0;i<keys1.length;i++){
                               	for(var j=0;j<keys2.length;j++){
                                       	key1 = keys1[i];
                                       	key2 = keys2[j];
					try{
						if(ndfd_features[key1][key2]['dis'] == 0){
	                                                continue;
	                                        }
					}
					catch(err){
						continue;
					}
					var normDis = (ndfd_features[key1][key2]['dis'] / maxVal) * 1475;
					prob = Math.ceil(probVal - probVal * Math.exp((Math.pow(normDis,2) / -2) / Math.pow(500,2)));
					//if(prob <= 0){
					//	prob = 1
					//}
					if(prob > ndfd_features[key1][key2].attributes.prob){
						ndfd_features[key1][key2].attributes.prob = prob;
					}
					ndfd_features[key1][key2].attributes.probs[k] = prob;
					ndfd_features[key1][key2].attributes.times[k] = k;
					ndfd_features[key1][key2]['dis'] = 0;
				}
			}
			boxBounds = boxBounds.transform(geographicProj,mercatorProj);
                }
		for(var key1 in ndfd_features){
			for(var key2 in ndfd_features[key1]){
				try{
					if(ndfd_features[key1][key2].attributes.prob >= 0){
						if(render){
							color = getColor(ndfd_features[key1][key2].attributes.prob);
							ndfd_features[key1][key2].attributes.color = color;
							ndfd_grid2.addFeatures([ndfd_features[key1][key2]]);
						}
						else{
							// test if in point, return values
							if(pointLocation(uPoint, ndfd_features[key1][key2].geometry)){
								var startSet = false;
								startTime2 = new Date();
								endTime2 = new Date();
								for(var k=0;k<ndfd_features[key1][key2].attributes.probs.length;k++){
									var tVal = ((k * 60) + parseInt(featEDD.attributes.data['valid_start'])) * 1000;
									if(ndfd_features[key1][key2].attributes.probs[k] > 0){
					                                	if(!startSet){
										        startTime2 = new Date(tVal);
											startSet = true;
										}
	                        	               				endTime2 = new Date(tVal);
									}
								}
								return ndfd_features[key1][key2];
							}
						}
					}
				}
				catch(err){
					continue;
				}
			}
		}
		if(!render){
			console.log('could not find matching grid point - likely on edge');
			return null;
		}
		ndfd_grid2.redraw();
		if(render){
			gridAttrs = geojson_format.read(JSON.stringify(modifyFeature.feature.attributes));
		}
		ndfd_features = {};
		//document.getElementById("previewGrid").innerHTML = '<input type="button" value="Preview Grid" onClick="lightUpGridAccum2();" />';
		try{
			document.getElementById('previewGridButton').value = 'Clear';
	                document.getElementById('previewGridButton').onclick = clearGridPreview;
		}
		catch(err){

		}
        }

	// return list of threats progged to cross a point
	function getUserThreats(uPoint){
		if(uPoint == null){
			return;
		}
		var uDur = document.getElementById('uDur').value;
		var legacyHTML = '<b><u>Warnings/Advisories:</u></b>';
		var innerHTML = ' <b><u>Hazard Events:</u></b> ';
		var allFeats = [];
		//allFeats = allFeats.concat(probSevereObjects.features, azShearObjects.features, lightning.features);
		allFeats = allFeats.concat(probSevere.features, azShear.features, lightning.features);
		featList = [];
		var cList = [];
		var userThreatCount = 0;
		for(var i=(allFeats.length - 1);i>=0;i--){
			if(featList.indexOf(allFeats[i].attributes.data['id']) != -1){
				continue;
			}
			var feat = allFeats[i].clone();
			var geojson_format = new OpenLayers.Format.JSON();
                        var attrs = geojson_format.read(JSON.stringify(feat.attributes));
                       	var linearRing = new OpenLayers.Geometry.LinearRing(feat.geometry.getVertices());
                       	feat = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([linearRing]),attrs);
			var k2 = -1;
			var dur = feat.attributes.data['duration'];
			if(uDur > 0){
				dur = uDur;
			}
			for(var k=0;k<=dur;k++){
				if((k%5) == 0){
					k2++;
	                                probVal = feat.attributes.data['probs'][0][k2];
	                                speedVal = feat.attributes.data['speeds'][k2];
	                                dirVal = feat.attributes.data['dirs'][k2];
	                                spdUVal = feat.attributes.data['spd'][k2];
	                                dirUVal = feat.attributes.data['dir'][k2];        
	                        }
	                        else{
	                                slp = (feat.attributes.data['probs'][0][k2+1] - feat.attributes.data['probs'][0][k2]) / 5;
	                                y_int = feat.attributes.data['probs'][0][k2] - ((k2 * 5) * slp);       
	                                probVal = (k * slp) + y_int;     
	                                slp = (feat.attributes.data['speeds'][k2+1] - feat.attributes.data['speeds'][k2]) / 5;
	                                y_int = feat.attributes.data['speeds'][k2] - ((k2 * 5) * slp);
	                                speedVal = (k * slp) + y_int;  
	                                slp = (feat.attributes.data['spd'][k2+1] - feat.attributes.data['spd'][k2]) / 5;
	                                y_int = feat.attributes.data['spd'][k2] - ((k2 * 5) * slp);
	                                spdUVal = (k * slp) + y_int;   
	                                slp = (feat.attributes.data['dir'][k2+1] - feat.attributes.data['dir'][k2]) / 5;   
	                                y_int = feat.attributes.data['dir'][k2] - ((k2 * 5) * slp);
	                                dirUVal = (k * slp) + y_int;
	
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
	                                        dirVal = (k * slp) + y_int;
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
	                                        dirVal = (k * slp) + y_int;
	                                }
	                        }
	                        if(k == 0){    
	                                dirValLast = dirVal;
	                        }
	                        else{
	                                distance = 60 * speedVal * 0.514444444;
					x_dis2 = 60 * spdUVal * 0.514444444;              
	                                x_dis = distance * Math.cos((270 - dirVal) * Math.PI / 180);
	                                y_dis = distance * Math.sin((270 - dirVal) * Math.PI / 180);
	                                y_dis2 = distance * Math.tan((dirUVal) * Math.PI / 180);
	                                feat.geometry.move(x_dis,y_dis);
	                                nowPoint = feat.geometry.getCentroid();
	                                feat.geometry.rotate((dirValLast - dirVal),nowPoint); 
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
	                                dirValLast = dirVal;
	                        }
	                        if(feat.geometry.containsPoint(uPoint.geometry.getCentroid())){
					userThreatCount += 1;
					innerHTML += '<input type="button" id="' + allFeats[i].attributes.data['id'] + '1" value="' + allFeats[i].attributes.data['types'][0].capitalize().slice(0,-1) + ' #' + String(allFeats[i].attributes.data['id']).slice(-3) + '" onClick="lightUpPoint(' + allFeats[i].attributes.data['id'] + ');" />';
					legacyHTML += '<input type="button" id="' + allFeats[i].attributes.data['id'] + '2" value="' + allFeats[i].attributes.data['types'][0].capitalize().slice(0,-1) + '" onClick="lightUpPoint(' + allFeats[i].attributes.data['id'] + ');" />';
					featList.push(allFeats[i].attributes.data['id']);
					cList.push(allFeats[i].geometry.getCentroid())
					break;
				}
			}
		}
		//innerHTML += '<input type="button" onClick="killPopup();" value="Clear"/>';
		legacyHTML += '<hr color="#000000">';
		innerHTML += '<hr color="#000000">';
		var legacyPanel = Ext.getCmp('legacyPanel');
                if(legacyPanel.isVisible()){
			if(featList.length > 0){
				document.getElementById('userThreatsLegacy').innerHTML = legacyHTML;
				lightUpPoint(featList[0],cList[0]);
			}
			else{
				legacyHTML += 'None';
				document.getElementById('userThreatsLegacy').innerHTML = legacyHTML;
			}
			legacyPanel.doLayout();
                }
		else{
			if(featList.length > 0){
				document.getElementById('userThreatsHazSimp1').innerHTML = innerHTML;
				lightUpPoint(featList[0],cList[0]);
			}
			else{
				innerHTML += 'None';
				document.getElementById('userThreatsHazSimp1').innerHTML = innerHTML;
			}
			var hazSimpPanel1 = Ext.getCmp('hazSimpPanel1');
			hazSimpPanel1.doLayout();
		}
	}

       	// generate accumulated probabilities at a given point
       	function lightUpPoint(inID,inFeat){
                var allFeats = [];
		var indexes = [];
		allFeats = allFeats.concat(probSevere.features, azShear.features, lightning.features);
		for(var i=0;i<allFeats.length;i++){
			if(allFeats[i].attributes.data['id'] == inID){
				var clickIndex = i;
				indexes.push(i);
				try{
					document.getElementById(allFeats[i].attributes.data['id'] + '1').style.backgroundColor = '#FFFF00';
				}
				catch(err){

				}
				try{
					document.getElementById(allFeats[i].attributes.data['id'] + '2').style.backgroundColor = '#FFFF00';
				}
                               	catch(err){

                               	}
				break;
			}
		}
		for(var i=0;i<allFeats.length;i++){
			if(featList.indexOf(allFeats[i].attributes.data['id']) != -1 && indexes.indexOf(i) == -1){
				//indexes.push(i);
				try{
					document.getElementById(allFeats[i].attributes.data['id'] + '1').style.backgroundColor = '#FFFFFF';
				}
                               	catch(err){

                               	}
				try{
					document.getElementById(allFeats[i].attributes.data['id'] + '2').style.backgroundColor = '#FFFFFF';
				}
                               	catch(err){

                               	}
			}
		}
		var uDur = document.getElementById('uDur').value;
		var legacyPanel = Ext.getCmp('legacyPanel');
		var allTimes = [];
		var allProbs = [];
		var allDurs = [];
		var allStarts = [];
		allProbVals = [];
                allThreatObjects = [];;
		for(var i=0;i<indexes.length;i++){
			var index = indexes[i];
			var feat = allFeats[index].clone();
			var feat2 = allFeats[index].clone();
			var objCenter = allFeats[index].geometry.getCentroid();
			var geojson_format = new OpenLayers.Format.JSON();
	               	var attrs = geojson_format.read(JSON.stringify(feat.attributes));
	               	var linearRing = new OpenLayers.Geometry.LinearRing(feat.geometry.getVertices());
	               	feat = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([linearRing]),attrs);
			uPoint = userLoc.features[0].geometry.getCentroid();
			var probs = [];
			var times = [];
			var pList = {};
			var startTrip = false;
			var startTrip2 = false;
			var startTime = null;
			var endTime = null;
			var tnow = timeCanvasVal.getAttr('time');
			var timeDiff = tnow - parseInt(feat.attributes.data['valid_start']);
	                var iterLength = Math.floor(timeDiff / 60);
	                var addSecs = timeDiff - (iterLength * 60);
	                var k2 = Math.floor(iterLength / 5) - 1;
			if(allFeats[index].attributes.data['prediction'] == 'persistence'){
				iterLength = 0;
				addSecs = 0;
				k2 = 0;
			}
			var dur = feat.attributes.data['duration'];
			if(uDur > 0){
				dur = uDur;
			}
			for(var k=iterLength;k<=(dur + iterLength);k++){
				if((k%5) == 0 || k2 == -1){
	                                k2++;
	                        }
				if(allFeats[index].attributes.data['prediction'] == 'persistence'){
					probVal = feat.attributes.data['probs'][0][0];
				}
				else{
					slp = (feat.attributes.data['probs'][0][k2+1] - feat.attributes.data['probs'][0][k2]) / 5;
		                        y_int = feat.attributes.data['probs'][0][k2] - ((k2 * 5) * slp);       
					probVal = Math.round(((k + (addSecs / 60)) * slp) + y_int);
				}
				if(probVal <= 0){
					probVal = 1; // override for extending duration manually.  Won't calc TOA/TOD if prob=0
				}
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
	                                dirValLast = dirVal;
					poly = feat.geometry;
					center = poly.getCentroid().transform(mercatorProj,geographicProj);
					newCenter = new OpenLayers.Geometry.Point(center.x,center.y);
					newCenter.transform(geographicProj,mercatorProj);
					//try{
					//	reader = new OpenLayers.Format.JSON();
					//	req = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + center.y + ',' + center.x + '&sensor=false';
					//	dataRequest.send();
			                //	geoLoc = reader.read(dataRequest.responseText);
					//	town = new OpenLayers.Geometry.Point(geoLoc['results'][1]['geometry']['location']['lng'],geoLoc['results'][1]['geometry']['location']['lat']);
					//	town.transform(geographicProj,mercatorProj);
					//	town_distance = Math.round(town.distanceTo(newCenter) / 1609.34);
					//	bearing = getDirection(Math.atan2((newCenter.y - town.y), (newCenter.x - town.x)) * 180 / Math.PI);
					//	town_name = geoLoc['results'][1]['formatted_address'].split(',')[0] + ', ' + geoLoc['results'][1]['formatted_address'].split(',')[1].split(' ')[1];
					//	tSpeed = Math.round(speedVal * 1.15077945);
					//}
					//catch(err){
					//	town_name = 'UNK';
	                                //        town_distance = 'UNK';
	                                //        tSpeed = Math.round(speedVal * 1.15077945);
	                                //       	bearing = 'UNK';
					//}
	                        }
	                        else{
	                                distance = 60 * speedVal * 0.514444444;
					x_dis2 = 60 * spdUVal * 0.514444444;              
	                                x_dis = distance * Math.cos((270 - dirVal) * Math.PI / 180);
	                                y_dis = distance * Math.sin((270 - dirVal) * Math.PI / 180);
	                                y_dis2 = distance * Math.tan((dirUVal) * Math.PI / 180);
	                                feat.geometry.move(x_dis,y_dis);
	                                feat2.geometry.move(x_dis,y_dis);
	                                nowPoint = feat.geometry.getCentroid();
	                                feat.geometry.rotate((dirValLast - dirVal),nowPoint);
	                                feat2.geometry.rotate((dirValLast - dirVal),nowPoint);
					newFeat = feat.clone();
					newFeat.geometry.rotate(-1 * (270 - dirValLast),nowPoint);
	                                var verts = newFeat.geometry.getVertices();
	                                var coords = new Array();            
	                                for(var i2=0;i2<verts.length;i2++){
	                                        dir = Math.atan2(verts[i2].y - nowPoint.y,verts[i2].x - nowPoint.x);
	                                        x = (Math.cos(dir) * (x_dis2));
	                                        y = (Math.sin(dir) * (y_dis2));
	                                        verts[i2].move(x,y);
	                                        coords.push(verts[i2]);
	                                }
	                                attrs = newFeat.attributes;
	                                linearRing = new OpenLayers.Geometry.LinearRing(coords);
					poly = new OpenLayers.Geometry.Polygon([linearRing]);
	                                feat = new OpenLayers.Feature.Vector(poly,attrs);
					feat.geometry.rotate((270 - dirValLast),nowPoint);
	                                dirValLast = dirVal;
				}
				//var seg1 = uPoint.distanceTo(poly.getCentroid());
				//var seg2 = uPoint.distanceTo(poly);
				//var dis_norm = (seg2 / (seg1 + seg2)) * 1475;
				//var probInterp = Math.ceil(probVal - probVal * Math.exp((Math.pow(dis_norm,2) / -2) / Math.pow(500,2)));
				// start - adding this to compute true 2D Gaussian
				if(allFeats[index].attributes.data['prediction'] == 'persistence'){
                                        pList[k-iterLength] = {'obj':poly.clone(), 'prob': probVal, 'speed': speedVal, 'dir': dirVal, 'time': k}; // could also use feat2 here instead of poly
					allProbVals.push(probVal);
	                                allThreatObjects.push(poly.clone());
					continue;
                               	}
				else{
					pList[k-iterLength] = {'obj':feat.geometry.clone(), 'prob': probVal, 'speed': speedVal, 'dir': dirVal, 'time': k};
					allProbVals.push(probVal);
                                        allThreatObjects.push(feat.geometry.clone());
                                        continue;
				}
				// end
				/*
				else if(feat2.geometry.containsPoint(uPoint)){
					prob = probInterp;
					tVal = ((k * 60) + parseInt(allFeats[index].attributes.data['valid_start'])) * 1000;
					if(!startTrip){
	                                        startTime = new Date(tVal);
	                                        startTrip = true;
	                                }
	                                endTime = new Date(tVal);
					if(poly.containsPoint(uPoint)){
						if(!startTrip2){
		                                       	startTime2 = new Date(tVal);
		                                       	startTrip2 = true;
		                                }
		                                endTime2 = new Date(tVal);
					}
				}
				else if(poly.containsPoint(uPoint)){
	                               	//seg1 = uPoint.distanceTo(feat2.geometry);
	                               	//seg2 = uPoint.distanceTo(poly);
	                               	//dis_norm = seg2 / (seg1 + seg2);
	                               	// linear interpolation between threat prob and background prob
	                               	//prob = Math.round(((probVal - 35) * dis_norm) + 35);
					//alert(seg1 + ',' + seg2 + ',' + dis_norm + ',' + prob);
	                               	// sine interpolation between threat prob and background prob
	                               	//prob = Math.round(((probVal - 35) * Math.sin((dis_norm * 90) * Math.PI / 180)) + 35);
					//prob = Math.round(((probVal - 35) * (1 - Math.cos((dis_norm * 90) * Math.PI / 180))) + 35);
					//prob = Math.round(((probVal - 35) * (Math.asin(dis_norm) / (90 * Math.PI / 180))) + 35);
					// gaussian interpolation
	                                //prob = Math.round(((probVal - 0) * ((dis_norm * dis_norm))) + 0);
					// exponential
					//prob = Math.round(((probVal - 35) * ((Math.exp(dis_norm) - 1)) / (Math.exp(1) - 1)) + 35);
					// no change from original
	                               	//prob = probVal;
					//if(feat.attributes.data['prediction'] != 'persistence'){
						prob = probInterp;
					//}
					tVal = ((k * 60) + parseInt(allFeats[index].attributes.data['valid_start'])) * 1000;
					if(!startTrip2){
	                                       	startTime2 = new Date(tVal);
	                                       	startTrip2 = true;
	                               	}
	                               	endTime2 = new Date(tVal);
	                       	}
				else{
					prob = 0;
				}
				probs.push(prob);
				times.push(k);
				*/
			}
			// start - add code here to compute true 2D Gaussian
			var geojson_format = new OpenLayers.Format.JSON();
			var len = Object.keys(pList).length - 1;
                        var parser = new jsts.io.OpenLayersParser();
                        swathEDD = parser.read(pList[iterLength]['obj']);
			for(var k=+1;k<len;k++){
                                // first aggregate all objects into total swath
                                cloneSwath = parser.read(pList[k]['obj']);
                                swathEDD = swathEDD.union(cloneSwath);

                        }
			swathEDD = parser.write(swathEDD);
			featEDD = allFeats[index].clone();
			var gridPoint = lightUpGridAccum2(false);
			if(gridPoint == null){
				return; // not sure what to do about this....
			}
			times = gridPoint.attributes.times;
			probs = gridPoint.attributes.probs;
			console.log(gridPoint);
			// end
			/*
			if(allFeats[index].attributes.data['prediction'] == 'persistence'){
				// advect stored objects, record max at each time
				var pProbs = {};
				var len = Object.keys(pList).length - 1;
				for(var k=0;k<=len;k++){
					pProbs[k] = 0;
				}
				for(var k=0;k<=len;k++){
					var aPoly = pList[k]['obj'];
					var probVal = pList[k]['prob'];
					var hit = false;
					for(var k2=0;k2<=len;k2++){
						if(k > 0){
							continue; // comment this out to compute total probability
						}
						var speedVal = pList[k2]['speed'];
	                                       	var dirVal = pList[k2]['dir'];
						
						var distance = 60 * speedVal * 0.514444444;
                                        	var x_dis = distance * Math.cos((270 - dirVal) * Math.PI / 180);
                                        	var y_dis = distance * Math.sin((270 - dirVal) * Math.PI / 180);
                                       		aPoly.move(x_dis,y_dis);

						if(aPoly.containsPoint(uPoint)){
							console.log('hit');
							hit = true;
							var seg1 = uPoint.distanceTo(aPoly.getCentroid());
			                                var seg2 = uPoint.distanceTo(aPoly);
			                                var dis_norm = (seg2 / (seg1 + seg2)) * 1475;
			                                var probInterp = Math.ceil(probVal - probVal * Math.exp((Math.pow(dis_norm,2) / -2) / Math.pow(500,2)));
							if(probInterp > pProbs[k2]){
								pProbs[k2] = probInterp;
							}
						}
						else if(hit){
							break;
						}
					}
                                }
				var len2 = Object.keys(pProbs).length - 1;
				for(var k=0;k<=len2;k++){
					times.push(k);
					probs.push(pProbs[k]);
					tVal = ((k * 60) + parseInt(allFeats[index].attributes.data['valid_start'])) * 1000;
					if(pProbs[k] > 0){
						startTime2 = new Date(tVal);
						startTrip2 = true;
					}
					else if(startTrip2){
						endTime2 = new Date(tVal);
					}
				}
				if(!startTrip2){
					tVal = parseInt(allFeats[index].attributes.data['valid_start']) * 1000;
					startTime2 = new Date(tVal);
					endTime2 = new Date(tVal);
				}
			}
			*/
			if(index == clickIndex && legacyPanel.isVisible()){
				// conditions to legacy warning/advisory generation
				var adv = false;
				if(allFeats[index].attributes.data['types'][0] == 'lightning1'){
					if(allFeats[index].attributes.data['elements']['alertLevel'] == 'takeAction' && allFeats[index].attributes.data['elements']['severity'] == 'frequentLightning'){
						adv = true;
					}
					else{
						document.getElementById('legacyText').innerHTML = 'None';
						return;
					}
				}
				else{
					if(allFeats[index].attributes.data['elements']['alertLevel'] == 'beAware'){
						adv = true;
					}
					else if(allFeats[index].attributes.data['elements']['alertLevel'] == 'takeAction' && Math.max.apply(Math, probs) < allFeats[index].attributes.data['elements']['warningThresh']){
						adv = true;
					}

				}
				var randomInt = String(parseInt(Math.random() * 1000));
		                var tNow = new Date(timeCanvasNow.getAttr('time') * 1000);
				var tIssue = new Date(allFeats[index].attributes.data['issue'] * 1000);
				var vStart = new Date(allFeats[index].attributes.data['valid_start'] * 1000);
				var vEnd = new Date((allFeats[index].attributes.data['valid_start'] + (dur * 60)) * 1000);

				var tStamp1 = String(pad(tIssue.getUTCDate())) + String(pad(tIssue.getUTCHours())) + String(pad(tIssue.getUTCMinutes()));
				var tStamp2 = String(tIssue.getUTCFullYear()).substring(2,4) + String(pad(tIssue.getUTCMonth() + 1)) + String(pad(tIssue.getUTCDate())) + 'T' + String(pad(tIssue.getUTCHours())) + String(pad(tIssue.getUTCMinutes()));
				var tStamp3 = String(vEnd.getUTCFullYear()).substring(2,4) + String(pad(vEnd.getUTCMonth() + 1)) + String(pad(vEnd.getUTCDate())) + 'T' + String(pad(vEnd.getUTCHours())) + String(pad(vEnd.getUTCMinutes()));
				var tStamp4 = formatAMPM(tIssue) + ' CDT ' + String(getDay(tIssue.getUTCDay())) + ' ' + String(getMon(tIssue.getUTCMonth())) + ' ' + String(pad(tIssue.getUTCDate())) + ' ' + String(tIssue.getUTCFullYear());

				objCenter.transform(mercatorProj,geographicProj);
                                req = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + objCenter.y + ',' + objCenter.x + '&sensor=false';
                                reader = new OpenLayers.Format.JSON();
                                var dataRequest = new XMLHttpRequest();
                                dataRequest.open('GET', req, false);
                                try{
                                        dataRequest.send();
                                        geoLoc = reader.read(dataRequest.responseText);
                                        if(geoLoc['results'][1]['types'][0] == 'postal_code'){
                                                var idx = 1;
                                        }
                                        else{
                                                var idx = 2;
                                        }
                                        uTown = new OpenLayers.Geometry.Point(geoLoc['results'][idx]['geometry']['location']['lng'],geoLoc['results'][idx]['geometry']['location']['lat']);
                                        uTown.transform(geographicProj,mercatorProj);
                                        uTownDistance = Math.round(uTown.distanceTo(newCenter) / 1609.34);
					uBearing = getDirection(Math.atan2((newCenter.y - uTown.y), (newCenter.x - uTown.x)) * 180 / Math.PI);
                                        uTownName = geoLoc['results'][idx]['formatted_address'].split(',')[0] + ', ' + geoLoc['results'][idx]['formatted_address'].split(',')[1].split(' ')[1];
                                        uSpeed = Math.round(speedVal * 1.15077945);
                                }
                                catch(err){
                                        uTownName = 'UNK';
                                        uTownDistance = 'UNK';
                                        uSpeed = Math.round(speedVal * 1.15077945);
                                        uBearing = 'UNK';
                                }				

				if(adv){
					var innerHTML = randomInt + '<br>';
                                        innerHTML += 'WUUS82 ' + allFeats[index].attributes.data['site'] + ' ' + tStamp1 + '<br>';
					innerHTML = 'SPS' + allFeats[index].attributes.data['site'].substring(1,4) + '<br>';
					innerHTML += 'HAZARDOUS WEATHER TESTBED NORMAN OKLAHOMA<br>';
					innerHTML += tStamp4 + '<br><br>';
					innerHTML += '...SIGNIFICANT WEATHER ADVISORY FOR YOUR COUNTY CONTINUES UNTIL ' + formatAMPM(vEnd) + ' CDT...<br><br>';
					innerHTML += 'AT ' + formatAMPM(vStart) + ' CDT...A STRONG THUNDERSTORM WAS LOCATED ' + uTownDistance + ' MILES ' + uBearing.toUpperCase() + ' OF ' + uTownName.toUpperCase(); 
					innerHTML += '...MOVING ' + getDirection(270 - allFeats[index].attributes.data['dirs'][0]).toUpperCase() + ' AT ' + parseInt(Math.round(allFeats[index].attributes.data['speeds'][0] * 1.15078)) + ' MPH.<br><br>';
					if(allFeats[index].attributes.data['types'][0] == 'severe1'){
                                                var s = allFeats[index].attributes.data['elements']['severity'].split('|');
                                                if(s.length == 2 && s[0] != '' && s[1] != ''){
                                                        var what = s[0] + ' INCH HAIL AND ' + s[1] + ' MPH WINDS';
                                                }
						else if(s.length == 2 && s[1] != ''){
							var what = s[1] + ' MPH WINDS';
						}
                                                else if(s[0] != ''){
                                                        var what = s[0] + ' INCH HAIL';
                                                }
                                                else{
                                                        var what = 'SMALL HAIL AND/OR STRONG WINDS';
                                                }
						var impact = 'PEOPLE OUTDOORS SHOULD SEEK SHELTER IMMEDIATELY. EXPECT MINOR DAMAGE TO TREE LIMBS AND BLOWING AROUND OF LIGHT...UNSECURED OBJECTS. ELECTRICAL APPLIANCES SHOULD NOT BE USED UNLESS IN AN EMERGENCY.';
                                        }
					else if(allFeats[index].attributes.data['types'][0] == 'lightning1'){
						var what = 'FREQUENT LIGHTNING';
						var impact = 'FREQUENT CLOUD TO GROUND LIGHTNING IS OCCURRING WITH THESE STORMS. LIGHTNING CAN STRIKE 10 MILES AWAY FROM A THUNDERSTORM. SEEK A SAFE SHELTER INSIDE A BUILDING OR VEHICLE.';
					}
                                        else{
                                                var what = 'POSSIBLE TORNADO';
						var impact = 'PEOPLE OUTDOORS SHOULD SEEK SHELTER IMMEDIATELY.';
                                        }
					innerHTML += 'HAZARD...' + what + '<br><br>'; 
                                        //innerHTML += 'IMPACT...' + allFeats[index].attributes.data['elements']['impacts'].toUpperCase() + '<br><br>';
					innerHTML += 'IMPACT...' + impact + '<br><br>';
					innerHTML += '$$<br><br>';
				}
				else{
					var innerHTML = randomInt + '<br>';
					innerHTML += 'WUUS53 ' + allFeats[index].attributes.data['site'] + ' ' + tStamp1 + '<br>';
					if(allFeats[index].attributes.data['types'][0] == 'severe1'){
						innerHTML += 'SVR' + allFeats[index].attributes.data['site'].substring(1,4) + '<br>';
						innerHTML += '/T.NEW.' + allFeats[index].attributes.data['site'] + '.SV.W.0001.' + tStamp2 + 'Z-' + tStamp3 + 'Z/<br><br>';
					}
					else{
						innerHTML += 'TOR' + allFeats[index].attributes.data['site'].substring(1,4) + '<br>';
						innerHTML += '/T.NEW.' + allFeats[index].attributes.data['site'] + '.TO.W.0001.' + tStamp2 + 'Z-' + tStamp3 + 'Z/<br><br>';
					}
					innerHTML += 'BULLETIN - IMMEDIATE BROADCAST REQUESTED<br>';
					if(allFeats[index].attributes.data['types'][0] == 'severe1'){
						innerHTML += 'SEVERE THUNDERSTORM WARNING<br>';
					}
					else{
						innerHTML += 'TORNADO WARNING<br>';
					}
					innerHTML += 'HAZARDOUS WEATHER TESTBED NORMAN OKLAHOMA<br>';
					innerHTML += tStamp4 + '<br><br>';
					innerHTML += 'THE HAZARDOUS WEATHER TESTBED IN NORMAN HAS ISSUED A<br><br>';
					if(allFeats[index].attributes.data['types'][0] == 'severe1'){
						innerHTML += '* SEVERE THUNDERSTORM WARNING FOR...<br>';
					}
					else{
						innerHTML += '* TORNADO WARNING FOR...<br>';
					}
					innerHTML += '&nbsp;&nbsp;&nbsp;YOUR COUNTY.<br><br>';
					innerHTML += '* UNTIL ' + formatAMPM(vEnd) + ' CDT<br><br>';
					if(allFeats[index].attributes.data['types'][0] == 'severe1'){
						innerHTML += '* AT ' + formatAMPM(vStart) + ' CDT...A SEVERE THUNDERSTORM WAS LOCATED ' + uTownDistance + ' MILES ' + uBearing.toUpperCase() + ' OF ' + uTownName.toUpperCase() + '...MOVING ' + getDirection(270 - allFeats[index].attributes.data['dirs'][0]).toUpperCase() + ' AT ' + parseInt(Math.round(allFeats[index].attributes.data['speeds'][0] * 1.15078)) + ' MPH.<br><br>';
						var s = allFeats[index].attributes.data['elements']['severity'].split('|');
	                                        if(s.length == 2 && s[0] != '' && s[1] != ''){
	                                                var what = s[0] + ' INCH HAIL AND ' + s[1] + ' MPH WINDS';
							var tag = 'HAIL...' + s[0] + 'IN<br>' + 'WIND...' + s[1] + 'MPH';
	                                        }
	                                        else if(s.length == 2 && s[1] != ''){
							var what = s[1] + ' MPH WINDS';
                                                        var tag = 'WIND...' + s[1] + 'MPH';
						}
						else if(s[0] != ''){
	                                                var what = s[0] + ' INCH HAIL';
							var tag = 'HAIL...' + s[0] + 'IN';
	                                        }
						else{
							var what = 'UNK';
							var tag = '';
						}

						tag += '<br><br>';
						var impact = 'PEOPLE OUTDOORS SHOULD SEEK SHELTER IMMEDIATELY. EXPECT MINOR DAMAGE TO TREE LIMBS AND BLOWING AROUND OF LIGHT...UNSECURED OBJECTS. ELECTRICAL APPLIANCES SHOULD NOT BE USED UNLESS IN AN EMERGENCY.';
					}
					else{
						innerHTML += '* AT ' + formatAMPM(vStart) + ' CDT...A TORNADO WAS LOCATED ' + uTownDistance + ' MILES ' + uBearing.toUpperCase() + ' OF ' + uTownName.toUpperCase() + '...MOVING ' + getDirection(270 - allFeats[index].attributes.data['dirs'][0]).toUpperCase() + ' AT ' + parseInt(Math.round(allFeats[index].attributes.data['speeds'][0] * 1.15078)) + ' MPH.<br><br>';
						var what = 'TORNADO';
						var tag = '';
						if(allFeats[index].attributes.data['elements']['source'] != ''){
							tag = 'TORNADO...' + getSource(allFeats[index].attributes.data['elements']['source']).toUpperCase() + '<br><br>'
						}
						var impact = 'FLYING DEBRIS WILL BE DANGEROUS TO THOSE CAUGHT WITHOUT SHELTER. MOBLIE HOMES WILL BE DAMAGED OR DESTROYED. DAMAGE TO ROOFS...WINDOWS...AND VEHICLES WILL OCCUR. TREE DAMAGE IS LIKELY.';
					}
	
					innerHTML += 'HAZARD...' + what + '.<br><br>'; 
					innerHTML += 'SOURCE...' + getSource(allFeats[index].attributes.data['elements']['source']).toUpperCase() + '.<br><br>'; 
					//innerHTML += 'IMPACT...' + allFeats[index].attributes.data['elements']['impacts'].toUpperCase() + '<br><br>';
					innerHTML += 'IMPACT...' + impact + '<br><br>';
					innerHTML += '* LOCATIONS IMPACTED INCLUDE...<br>';
					innerHTML += '&nbsp;&nbsp;&nbsp;YOUR LOCATION.<br><br>';
					innerHTML += 'PRECAUTIONARY/PREPAREDNESS ACTIONS...<br><br>';
					//innerHTML += allFeats[index].attributes.data['elements']['actions'].toUpperCase() + '<br><br>';
					innerHTML += 'SEEK SHELTER IMMEDIATELY.<br><br>';
					innerHTML += '&&<br><br>';
					innerHTML += tag;
					innerHTML += '$$<br><br>';
				}

				document.getElementById('legacyText').innerHTML = innerHTML;
			}
			else if(index == clickIndex){
				uPoint.transform(mercatorProj,geographicProj);
				req = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + uPoint.y + ',' + uPoint.x + '&sensor=false';
                                reader = new OpenLayers.Format.JSON();
                               	var dataRequest = new XMLHttpRequest();
                                dataRequest.open('GET', req, false);
                                try{
                                        dataRequest.send();
                                        geoLoc = reader.read(dataRequest.responseText);
					if(geoLoc['results'][1]['types'][0] == 'postal_code'){
						var idx = 1;
					}
					else{
						var idx = 2;
					}
                                       	uTown = new OpenLayers.Geometry.Point(geoLoc['results'][idx]['geometry']['location']['lng'],geoLoc['results'][idx]['geometry']['location']['lat']);
                                        uTown.transform(geographicProj,mercatorProj);
                                        uTownDistance = Math.round(uTown.distanceTo(newCenter) / 1609.34);
                                        uBearing = getDirection(Math.atan2((newCenter.y - uTown.y), (newCenter.x - uTown.x)) * 180 / Math.PI);
                                        uTownName = geoLoc['results'][idx]['formatted_address'].split(',')[0] + ', ' + geoLoc['results'][idx]['formatted_address'].split(',')[1].split(' ')[1];
                                        uSpeed = Math.round(speedVal * 1.15077945);
                                }
                                catch(err){
                                       	uTownName = 'UNK';
                                        uTownDistance = 'UNK';
                                        uSpeed = Math.round(speedVal * 1.15077945);
                                        uBearing = 'UNK';
                               	}
				if(startTime == null){
	                               	startTime = startTime2;
	                       	}
				if(endTime == null){
                                       	endTime = endTime2;
                                }
				var iTime = new Date(parseInt(allFeats[index].attributes.data['issue']) * 1000);
				var issueTime = iTime.toLocaleString().replace(/:\d+ /, ' ');
				start1 = startTime2.toLocaleTimeString().replace(/:\d+ /, ' ');
				//start2 = startTime.toLocaleTimeString().replace(/:\d+ /, ' ');
				//end1 = endTime.toLocaleTimeString().replace(/:\d+ /, ' ');
				end2 = endTime2.toLocaleTimeString().replace(/:\d+ /, ' ');
				//diff_min = (endTime - startTime) / 60000;
				//diff_max = (endTime2 - startTime2) / 60000;
				var now = parseInt(timeCanvasNow.getAttr('time'));
				var sDiff1 = Math.max(0,parseInt(((startTime2.getTime() / 1000) - now) / 60));
				//var sDiff2 = Math.max(0,parseInt(((startTime.getTime() / 1000) - now) / 60));
				//var eDiff1 = Math.max(0,parseInt(((endTime.getTime() / 1000) - now) / 60));
				var eDiff2 = Math.max(0,parseInt(((endTime2.getTime() / 1000) - now) / 60));
				if(allFeats[index].attributes.data['types'][0] == 'severe1'){
					if(allFeats[index].attributes.data['elements']['severity'] == ''){
						var what = 'Severe Hail, Winds, and/or Tornadoes';
					}
					else{
						var s = allFeats[index].attributes.data['elements']['severity'].split('|');
				                if(s.length == 2 && s[0] != '' && s[1] != ''){
							var what = 'Severe Hail and Winds';
						}
						else if(s.length == 2 && s[1] != ''){
							var what = 'Severe Wind';
                                                }
						else if(s[0] != ''){
                                                        var what = 'Severe Hail';
                                                }
						else{
							var what = 'Severe Hail, Winds, and/or Tornadoes';
						}
					}
				}
				else{
					var what = allFeats[index].attributes.data['types'][0].capitalize().slice(0,-1);
				}
				if(allFeats[index].attributes.data['elements']['alertLevel'] == 'beAware'){
					var alertLevel = "BE AWARE";
				}
				else{
					var alertLevel = "TAKE ACTION";
				}
				var alertColor = getStandardColor2(Math.max.apply(Math, probs));
				//innerHTML = '<b><u>' + allFeats[index].attributes.data['types'][0].capitalize() + ' Threat Information</u>: (' + lat + ',' + lon + ')</b><br>';
				
				//innerHTML = '<hr color="#000000"><b>Question: </b><select id="question" onChange="genAnswer(this.value);">';
				//innerHTML += '<option value=""><-- Select A Question --></option>';
				//innerHTML += '<option value="Approximately ' + town_distance + ' miles ' + bearing + ' of ' + town_name + '">Where is it?</option>';
				//innerHTML += '<option value="Approximately ' + tSpeed + ' mph">How fast is it moving?</option>';
				//innerHTML += '<option value="Between ' + start1  + ' and ' + start2 + '">When will it get here?</option>';
				//innerHTML += '<option value="Between ' + end1 + ' and ' + end2 + '">When will it be over?</option>';
				//innerHTML += '<option value="About ' + diff_min + ' to ' + diff_max + ' minutes">How long will it last?</option>';
				//innerHTML += '<option value="At this time, ' + Math.max.apply(Math, probs) + '%">What is the chance of it impacting me?</option>';
				//innerHTML += '</select><br><div id="answer"><b>Best Estimate:</b></div>';
				
				innerHTML = '<hr color="#000000"><table cellpadding="0" cellspacing="2" border="0" width="100%"><tr>';
				innerHTML += '<tr><td>BULLETIN - EAS ACTIVATION REQUESTED</td></tr>';
				if(alertColor == '#FFFF00'){
					innerHTML += '<tr><td><b style="font-size: 135%; color:' + alertColor + '; text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000;">' + allFeats[index].attributes.data['types'][0].toUpperCase().slice(0,-1) + ' MESSAGE</b></td></tr>';
				}
				else{
					innerHTML += '<tr><td><b style="font-size: 135%; color:' + alertColor + ';">' + allFeats[index].attributes.data['types'][0].toUpperCase().slice(0,-1) + ' MESSAGE</b></td></tr>';

				}
				innerHTML += '<tr><td>Audience: Public</td></tr>';
				innerHTML += '<tr><td>Source: Hazardous Weather Testbed</td></tr>';
				innerHTML += '<tr><td>Issued: ' + issueTime + '<br><br></td></tr>';
				if(alertColor == '#FFFF00'){
					innerHTML += '<tr><td><b><u>Alert Level</u>:</b><b style="font-size: 100%; color:' + alertColor + '; text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000;"> ' + alertLevel + '</b></td></tr>';
				}
				else{
					innerHTML += '<tr><td><b><u>Alert Level</u>:</b><b style="font-size: 100%; color:' + alertColor + ';"> ' + alertLevel + '</b></td></tr>';
				}
				innerHTML += '<tr><td><b><u>What</u>:</b> ' + what + '</td></tr>';
				innerHTML += '<tr><td><b><u>Where</u>:</b> ' + uTownDistance + ' miles ' + uBearing + ' of ' + uTownName + '</td></tr>';
				innerHTML += '<tr><td><b><u>When</u>:</b> Between ' + start1 + ' and ' + end2 + ' (' + sDiff1 + ' to ' + eDiff2 + ' min. from now)<br><br></td></tr>';
				//if(start1 != start2 || end1 != end2){
				//	innerHTML += '<tr><td width="50%"><b><u>When (Likely)</u>:</b> Between ' + start2 + ' and ' + end1 + ' (' + sDiff2 + ' to ' + eDiff1 + ' min. from now)</td></tr>';
				//}
				//innerHTML += '<tr><td><b><u>Recommended Actions</u>:</b> ' + allFeats[index].attributes.data['elements']['actions'] + '<br><br></td></tr>';
				//innerHTML += '<tr><td><b><u>Expected Impacts</u>:</b> ' + allFeats[index].attributes.data['elements']['impacts'] + '</td></tr>';
				innerHTML += '<tr><td><b><u>Forecast Severity</u>:</b> ' + getSeverity(allFeats[index].attributes.data['elements']['severity']) + '</td></tr>';

				// slight change to handle user defined duration, will return NaN for long lead-times, so override returned value to 1.
				var maxProb = Math.max.apply(Math, probs);
				if(isNaN(maxProb)){
					maxProb = 1;
				}
				innerHTML += '<tr><td><b><u>Forecast Likelihood</u>:</b> ' + maxProb + '% (see chart for more details)</td></tr>';
				innerHTML += '<tr><td><b><u>Forecast Confidence</u>:</b> ' + getConfidence(allFeats[index].attributes.data['elements']['confidence']) + '</td></tr>';
				innerHTML += '<tr><td><b><u>Source</u>:</b> ' + getSource(allFeats[index].attributes.data['elements']['source']) + '<br><br></td></tr>';
				innerHTML += '<tr><td><b><u>Discussion</u>:</b> ' + allFeats[index].attributes.data['discussion'] + '</td></tr>';
				innerHTML += '</table>';
				document.getElementById('hazSimpText1').innerHTML = innerHTML;
			}
			allTimes.push(times);
			allProbs.push(probs);
			//allDurs.push(parseInt(allFeats[index].attributes.data['duration']));
			allDurs.push(parseInt(dur));
			allStarts.push(parseInt(allFeats[index].attributes.data['valid_start']));
		}
		if(!legacyPanel.isVisible()){
			pointChart(allTimes, allProbs, allDurs, allStarts);
		}
	}

	function getConfidence(val){
		var c = '';
		if(val == 'low'){
			c = 'Low';
		}
		else if(val == 'lowMedium'){
			c = 'Medium-Low';
		}
                else if(val == 'medium'){
                        c = 'Medium';
                }
                else if(val == 'mediumHigh'){
                        c = 'Medium-High';
                }
                else if(val == 'high'){
                        c = 'High';
                }
		return c;
	}

	function getSeverity(val){
		var s = '';
		val = val.split('|');
		if(val.length == 2){
			if(val[0] != '' && val[1] != ''){
				s = 'Hail up to ' + val[0] + ' inches in diameter and winds up to ' + val[1] + ' mph';
			}
			else if(val[0] != '' && val[1] == ''){
				s = 'Hail up to ' + val[0] + ' inches in diameter';
			}
			else if(val[0] == '' && val[1] != ''){
				s = 'Winds up to ' + val[1] + ' mph';
			}
		}
		else{
			if(val == 'weakTornado'){
				s = 'Weak Tornado';
			}
			else if(val == 'strongTornado'){
				s = 'Strong Tornado';
			}
			else if(val == 'sparseLightning'){
                                s = 'Sparse Lightning';
                        }
			else if(val == 'frequentLightning'){
                                s = 'Frequent Lightning';
                        }
		}
		return s;
	}

	function getSource(val){
		var s = '';
		if(val == 'radarIndicated'){
			s = 'Radar Indicated';
		}
		else{
			s = val.capitalize();
		}
		return s;
	}

	// generate estimated answer to fundamental question
	function genAnswer(answer){
		document.getElementById('answer').innerHTML = '<b>Best Estimate:</b> ' + answer;
	}

	// function to return cardinal direction
	function getDirection(val){
		if(val < 0){
			val = val + 360;
		}
		if(val >= 360){
			val = val - 360;
		}
		if(val >= 0 && val < 11.25){
			dir = 'east';
		}
		else if(val < 33.75){
			dir = 'east-northeast';
		}
		else if(val < 56.25){
			dir = 'northeast';
		}
		else if(val < 78.75){
			dir = 'north-northeast';
		}
		else if(val < 101.25){
                        dir = 'north';
                }
		else if(val < 123.75){
			dir = 'north-northwest';
		}
		else if(val < 146.25){
                        dir = 'northwest';
                }
		else if(val < 168.75){
			dir = 'west-northwest';
		}
		else if(val < 191.25){
                        dir = 'west';
                }
		else if(val < 213.75){
			dir = 'west-southwest';
		}
		else if(val < 236.25){
                        dir = 'southwest';
                }
		else if(val < 258.75){
			dir = 'south-southwest';
		}
		else if(val < 281.25){
                        dir = 'south';
                }
		else if(val < 303.75){
			dir = 'south-southeast';
		}
		else if(val < 326.25){
                        dir = 'southeast';
                }
		else if(val < 348.75){
			dir = 'east-southeast';
		}
		else if(val < 360){
                        dir = 'east';
                }
		else{
			dir = 'UNK';
		}
		return dir;
	}

	// export ndfd grid to text file on server
	function exportGrid(){
		lats = [];
		lons = []
		probs = [];
		for(i=0;i<ndfd_grid.features.length;i++){
			lats.push((ndfd_grid.features[i].attributes.y).toFixed(2));
			lons.push((Math.abs(ndfd_grid.features[i].attributes.x)).toFixed(2));
			probs.push(ndfd_grid.features[i].attributes.prob);
		}
		link = 'write_grid.php?time=' + timeCanvasVal.getAttr('time') + '&info=' + lons.join();
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();
		link = 'write_grid.php?time=' + timeCanvasVal.getAttr('time') + '&info=' + lats.join();
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();
		link = 'write_grid.php?time=' + timeCanvasVal.getAttr('time') + '&info=' + probs.join();
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();
		alert(dataRequest.responseText);
	}

	// control grid display based on zoom threshold (not used)
	function reLabelGrid(){
		return;
		zoom = map.getZoom();
		if(zoom > 10){
			ndfd_grid.styleMap = styleMapGrid;
		}
		else{
			ndfd_grid.styleMap = styleMapGrid2;
		}
		ndfd_grid.redraw();
	}

	// change grid opacity
	function setGridOpacity(){
		if(document.getElementById('gridType').selectedIndex == 1){
			newVal = ndfd_grid.opacity * 100;
			gridOpacitySlider.setValue(newVal);
		}
	}

	// renders grid slider when display tab is active
	function renderGridSlider(){
		gridOpacitySlider = new Slider(document.getElementById("gridSlider-slider"), document.getElementById("gridSlider-slider-input"));
                gridOpacitySlider.setMaximum(100);
                gridOpacitySlider.setMinimum(0);
                gridOpacitySlider.onchange = function () {
                        if(gridIndex == 2){
                                ndfd_grid.setOpacity(gridOpacitySlider.getValue() / 100);
                                ndfd_grid.redraw();
                        }
                        else if(gridIndex == 3){
                                ndfd_grid.setOpacity(gridOpacitySlider.getValue() / 100);
                                ndfd_grid.redraw();
                                threat_lines.setOpacity(gridOpacitySlider.getValue() / 100);
                                threat_lines.redraw();
                        }
                        document.getElementById("gridSlider-input").innerHTML = gridOpacitySlider.getValue() + '%';
                };
                gridOpacitySlider.setValue(100);
		document.getElementById('legend').innerHTML = '<img src="images/color_scale_' + product + '.png" />';
	}

	function renderOpacitySlider(){
                opacitySlider = new Slider(document.getElementById("opacitySlider-slider"), document.getElementById("opacitySlider-slider-input"));
                opacitySlider.setMaximum(100);
                opacitySlider.setMinimum(0);
                opacitySlider.onchange = function () {
			if(map.layers.indexOf(modelLayer) != -1){
				modelLayer.setOpacity(opacitySlider.getValue() / 100);
			}
			if(obsMap && map2.layers.indexOf(obsLayer) != -1){
				obsLayer.setOpacity(opacitySlider.getValue() / 100);
			}
			modelOpacity = opacitySlider.getValue() / 100;
                        document.getElementById("opacitySlider-input").innerHTML = opacitySlider.getValue() + '%';
                };
                opacitySlider.setValue(100);
        }

	function renderRadarOpacitySlider(){
                opacitySlider = new Slider(document.getElementById("opacitySlider-slider"), document.getElementById("opacitySlider-slider-input"));
                opacitySlider.setMaximum(100);
                opacitySlider.setMinimum(0);
                opacitySlider.onchange = function () {
			/*
			for(k3=0;k3<scans.length;k3++){
				for(k4=0;k4<scans[k3].length;k4++){
					eval(scans[k3][k4] + '.setOpacity(opacitySlider.getValue() / 100)');;
				}
			}
			*/
			if(radarImageLast != ''){
				eval(radarImageLast + '.setOpacity(opacitySlider.getValue() / 100)');
			}
                        radarOpacity = opacitySlider.getValue() / 100;
                        document.getElementById("opacitySlider-input").innerHTML = opacitySlider.getValue() + '%';
                };
                opacitySlider.setValue(100);
        }

	function get_polygon_centroid(pts) {
	   var first = pts[0], last = pts[pts.length-1];
	   if (first.x != last.x || first.y != last.y) pts.push(first);
	   var twicearea=0,
	   x=0, y=0,
	   nPts = pts.length,
	   p1, p2, f;
	   for ( var i=0, j=nPts-1 ; i<nPts ; j=i++ ) {
	      p1 = pts[i]; p2 = pts[j];
	      f = p1.x*p2.y - p2.x*p1.y;
	      twicearea += f;          
	      x += ( p1.x + p2.x ) * f;
	      y += ( p1.y + p2.y ) * f;
	   }
	   f = twicearea * 3;
	   return { x:x/f, y:y/f };
	}

	function pointOnVertex(point, vertices){
		for(var i=0;i<vertices.length;i++){
			if(point == vertices[i]){
				return true;
			}
		}
		return false;
	}

	function pointLocation(point, polygon){
		var vertices = polygon.getVertices();
		
		// Check if the point is inside the polygon or on the boundary
		var intersections = 0;
		var vertices_count = vertices.length;
		for(var i=0;i<vertices_count;i++){
			if(i == 0){
				var vertex1 = vertices[vertices_count - 1];
			}
			else{
				var vertex1 = vertices[i-1];
			}
			var vertex2 = vertices[i];
			// Check if point is on an horizontal polygon boundary
			if(vertex1.y == vertex2.y && vertex1.y == point.y && point.x > [vertex1.x, vertex2.x].min() && point.x < [vertex1.x, vertex2.x].max()){
				return true;
			}
			if(point.y > [vertex1.y, vertex2.y].min() && point.y <= [vertex1.y, vertex2.y].max() && point.x <= [vertex1.x, vertex2.x].max() && vertex1.y != vertex2.y){
				var xinters = (point.y - vertex1.y) * (vertex2.x - vertex1.x) / (vertex2.y - vertex1.y) + vertex1.x;
				// Check if point is on the polygon boundary (other than horizontal)
				if(xinters == point.x){
					return true;
				}
				if(vertex1.x == vertex2.x || point.x <= xinters){
					intersections++;
				}
			}
		}
		// If the number of edges we passed through is odd, then it's in the polygon.
		if(intersections % 2 != 0){
			return true;
		}
		else{
			return false;
		}
	}

	function getNDFDKeys(k3, j2){
		var key1 = String(k3);
               	if(k3 > -100){
                       	key1 = key1.slice(0,6);
                       	if(key1.length == 5){
                               	key1 = key1 + '0';
                       	}
                       	else if(key1.length == 4){
                               	key1 = key1 + '00';
                       	}
                       	else if(key1.length == 3){
                               	key1 = key1 + '.00';
                       	}
               	}
               	else{
                       	key1 = key1.slice(0,7);
                       	if(key1.length == 6){
                               	key1 = key1 + '0';
                       	}
                       	else if(key1.length == 5){
                               	key1 = key1 + '00';
                      	}
                       	else if(key1.length == 4){
                               	key1 = key1 + '.00';
                       	}
               	}
               	var key2 = String(j2);
               	key2 = key2.slice(0,5);
               	if(key2.length == 4){
                       	key2 = key2 + '0';
               	}
               	else if(key2.length == 3){
                       	key2 = key2 + '00';
               	}
               	else if(key2.length == 2){
                       	key2 = key2 + '.00';
		}
		return key1 + ',' + key2;
	}

	function checkEven(val){
		if(val % 2){
			return val+1;
		}
		else{
			return val;
		}
	}


	function clearPHIOutput(){
		try{
			document.getElementById('userThreatsLegacy').innerHTML = '';
			document.getElementById('userThreatsHazSimp1').innerHTML = '';
			document.getElementById('chart4').innerHTML = '';
			document.getElementById('legacyText').innerHTML = '';
			document.getElementById('hazSimpText1').innerHTML = '';
			uPointFeature = null;
		}
                catch(err){

                }
	}

	function renderWarningTabs(){
                Ext.create('Ext.tab.Panel', {
                    activeTab: 0,
                    items: [
                        {
			    title: 'HazSimp Prototypes',
                            id: 'hazSimpPanel1',
                            html : '<span id="userThreatsHazSimp1"></span><center><div id="chart4" style="width:450px;height:270px;"></div></center><div id="hazSimpText1"></div>'
                        },
			{
                            title: 'Legacy Warnings/Advisories',
                            id: 'legacyPanel',
                            html : '<span id="userThreatsLegacy"></span><div id="legacyText"></div>'
                        }
                    ],
                    renderTo : 'threatText',
                    listeners: {
                            'tabchange': function(tabPanel, tab) {
                                getUserThreats(uPointFeature);       
                            }
                        }
                });
	}

	function getMon(val){
		var mon = '';
		if(val == 0){
			mon = 'JAN';
		}
		else if(val == 1){
			mon = 'FEB';
		}
		else if(val == 2){
                        mon = 'FEB';
                }
		else if(val == 3){
                        mon = 'MAR';
                }
                else if(val == 4){
                        mon = 'MAY';
                }
                else if(val == 5){
                        mon = 'JUN';
                }
                else if(val == 6){
                        mon = 'JUL';
                }
                else if(val == 7){
                        mon = 'AUG';
                }
                else if(val == 8){
                        mon = 'SEP';
                }
                else if(val == 9){
                        mon = 'OCT';
                }
                else if(val == 10){
                        mon = 'NOV';
                }
                else if(val == 11){
                        mon = 'DEC';
                }
		return mon;
	}

	function getDay(val){
		var day = '';
		if(val == 0){
			day = 'SUN';
		}
		else if(val == 1){
			day = 'MON';
		}
                else if(val == 2){
                        day = 'TUE';
                }
                else if(val == 3){
                        day = 'WED';
                }
                else if(val == 4){
                        day = 'THU';
                }
                else if(val == 5){
                        day = 'FRI';
                }
                else if(val == 6){
                        day = 'SAT';
                }
		return day;
	}

	function formatAMPM(date) {
  		var hours = date.getHours();
  		var minutes = date.getMinutes();
  		var ampm = hours >= 12 ? 'PM' : 'AM';
  		hours = hours % 12;
  		hours = hours ? hours : 12; // the hour '0' should be '12'
  		minutes = minutes < 10 ? '0'+String(minutes) : String(minutes);
  		var strTime = String(hours) + minutes + ' ' + ampm;
  		return strTime;
	}


	// link objects
        function linkObjectsInit(){
               	if(drawType != null){
                       	alert('You must deactivate other controls first');
                       	return;
               	}
               	linkObjects = true;
               	drawType = 'link';
		linkTime = currentTime;
               	document.getElementById("linkHazard").src = "images/boreButtonSelect.png";
               	document.getElementById("linkHazard").onclick = stopLink;
               	document.getElementById("linkHazard").onmouseout = function(){this.src = "images/boreButtonSelect.png";}
               	document.getElementById("linkHazard").onmouseover = function(){this.src = "images/boreButtonSelect.png";}
                document.getElementById("warningConfig").innerHTML = '<font size="5"><b>Click on First (original/old) Object --></b></font>';
        }

	// stop linking of objects
        function stopLink(){
               	document.getElementById("warningConfig").innerHTML = '';
               	linkObjects = false;
                drawType = null;
		linkObj1 = null;
		linkTime1 = null;
		linkThreat1 = null;
		linkIssue1 = null;
		linkAuto1 = null;
		linkObj2 = null;
		linkTime2 = null;
		linkGeom = null;
                document.getElementById("linkHazard").onclick = function(){linkObjectsInit();}
               	document.getElementById("linkHazard").onmouseout = function(){this.src = "images/boreButton.png";}
               	document.getElementById("linkHazard").onmouseover = function(){this.src = "images/boreButtonHighlight.png";}
               	document.getElementById("linkHazard").src = "images/boreButton.png";
        }

	// optional button in popup to initiate linkage of objects
	function runLink(objIssue,objID){
		var allFeats = [];
               	//allFeats = allFeats.concat(probSevere.features, azShear.features, lightning.features);
		allFeats = allFeats.concat(probSevereObjects.features, azShearObjects.features, lightningObjects.features);
		var idx = -1;
		for(var i=0;i<allFeats.length;i++){
			if(allFeats[i].attributes.data['issue'] == objIssue && allFeats[i].attributes.data['id'] == objID){
				idx = i;
				break;
			}
		}
		if(idx == -1){
			alert('Could not find object, try again.');
			return;
		}
		var threatPanel = Ext.getCmp('threatPanel');
		threatPanel.show();
		linkObjectsInit();
		linkObj1 = objID;
                linkTime1 = timeCanvasVal.getAttr('time');
                linkThreat1 = allFeats[idx].attributes.data['types'][0].slice(0,-1);
		linkIssue1 = objIssue;
		linkAuto1 = allFeats[idx].attributes.data['automated'];
		linkGeom = allFeats[idx].geometry.clone();
		var geojson_format = new OpenLayers.Format.JSON();
                linkAttrs = geojson_format.read(JSON.stringify(allFeats[idx].attributes));
                document.getElementById("warningConfig").innerHTML = '<font size="5"><b>Object #' + linkObj1 + ' selected...<br>Click on Second (target) Object --></b></font>';	
	}

	// optional button in popup to initiate linkage of objects
       	function releaseObject(objIssue,objID){
               	var allFeats = [];
                allFeats = allFeats.concat(probSevereObjects.features, azShearObjects.features, lightningObjects.features);
                var idx = -1;
                for(var i=0;i<allFeats.length;i++){
                       	if(allFeats[i].attributes.data['issue'] == objIssue && allFeats[i].attributes.data['id'] == objID){
                                idx = i;
                                break;
                       	}
                }
                if(idx == -1){
                       	alert('Could not find object, try again.');
                       	return;
                }
		var proceed = confirm('Release Object #' + objID + ' to Automation?');
                if(!proceed){
			return;
		}
		var newThreat = allFeats[idx].clone();
		for(var key in newThreat.attributes.data.modified){
			newThreat.attributes.data.modified[key] = 0;
		}
		var threat = newThreat.attributes.data['types'][0];
		var tVal = timeCanvasVal.getAttr('time');
                newThreat.attributes.data['valid_start'] = tVal;
		newThreat.attributes.data['valid_end'] = tVal;
		newThreat.attributes.data['automated'] = 1;
                allFeats[idx].attributes.data['valid_end'] = tVal;
                newThreat.geometry.transform(proj2,proj);
                geoJsonParser = new OpenLayers.Format.GeoJSON();
                geoJson = geoJsonParser.write(newThreat);
	        link = 'write_threats.php?threat=' + threat + '&id=' + newThreat.attributes.data['id'] + '&case=' + acase + '&user=' + user + '&geojson=' + geoJson + '&inputTime=' +  currentTime + '&state=deactivate';
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
		killPopup();
                changeTime();
	}
