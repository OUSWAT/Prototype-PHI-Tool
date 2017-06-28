	/*

        Copyright (c) 2014 Cooperative Institute for Mesoscale Meteorological Studies (CIMMS) and the University of Oklahoma

        Author:         Dr. Chris Karstens
        Email:          chris.karstens@noaa.gov
        Description:    Contains the following:
				1. geolocation control & events
				2. function for swapping controls
				3. ellipse & polygon controls
				4. modify feature control

        */

	// user location control
	var geolocate = new OpenLayers.Control.Geolocate({
	    bind: false,
	    geolocationOptions: {
	        enableHighAccuracy: false,
	        maximumAge: 0,
	        timeout: 7000
	    }
	});
	map.addControl(geolocate);

	// geolocation events
	geolocate.events.register("locationupdated",geolocate,function(e) {
		userLoc.removeAllFeatures();
		lat = e.point.y;
		lon = e.point.x;
		userPoint = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(lon,lat),{'color':'rgb(0,0,0)'});
		userLoc.addFeatures([userPoint]);
		lonlat = new OpenLayers.LonLat(lon,lat);
		map.panTo(lonlat);
		geolocate.deactivate();
		selectGrid();
	});

	// activate geolocation control
	function locateUserPoint(){
                modifyFeature.deactivate();
                selectControl.deactivate();
                geolocate.activate();
        }

	// select control
	var selectControl = new OpenLayers.Control.SelectFeature([ndfd_grid,userLoc,myrorss_objects,kmeans_objects,activeWof,threat_points,radar_sites,activeThreats,uhObjectsShow,azShearObjects,probSevereObjects,lightningObjects], {
        	onSelect: genPopup,
        	onUnselect: killPopup
   	});
   	map.addControl(selectControl);
	selectControl.activate();

	// reset select control
	function resetSelectControl(){
		return;
		selectControl.destroy();
	        selectControl = new OpenLayers.Control.SelectFeature([ndfd_grid,userLoc,myrorss_objects,kmeans_objects,activeWof,threat_points,radar_sites,activeThreats,uhObjectsShow,azShearObjects,probSevereObjects,lightningObjects], {
	                onSelect: genPopup,
	                onUnselect: killPopup
	        });
	        map.addControl(selectControl);
	        selectControl.activate();
	}

	// swap controls
	function selectGrid(how){
		if(how == 'config'){
			ndfd_grid.removeAllFeatures();
			gridIndex = document.getElementById('gridType').selectedIndex;
		}
		if(threat_area.features.length > 0){
			if(modifyFeature.feature != null){
				selectControl.deactivate();
				modifyFeature2.deactivate();
				modifyFeature3.deactivate();
				modifyFeature.activate();
				threat_area.setZIndex(9999);
				setHistory = false;
				if(modifyFeatureDrawn){
					modifyThreat();
				}
			}
			if(gridIndex == 3){
				modifyFeature.deactivate();
				modifyFeature2.deactivate();
				modifyFeature3.deactivate();
				selectControl.activate();
			}
			else{
				selectControl.deactivate();
				modifyFeature2.deactivate();
				modifyFeature3.deactivate();
				modifyFeature.activate();
				threat_area.setZIndex(9999);
			}
		}
		else if(background_area.features.length > 0){
			if(modifyFeature2.feature != null){
				selectControl.deactivate();
				modifyFeature.deactivate();
				modifyFeature3.deactivate();
                                modifyFeature2.activate();
				background_area.setZIndex(9999);
				//modifyFeature2.createVertices = true;
				//modifyFeature2.moveLayerToTop();
                        }
                        else if(gridIndex == 3){
				modifyFeature.deactivate();
                                modifyFeature2.deactivate();
				modifyFeature3.deactivate();
                                selectControl.activate();
                        }
                        else{
                                selectControl.deactivate();
				modifyFeature.deactivate();
                                modifyFeature3.deactivate();
				modifyFeature2.activate();
				background_area.setZIndex(9999);
				//modifyFeature2.createVertices = true;
				//modifyFeature2.moveLayerToTop();
                        }
		}
		else if(boreLine.features.length > 0){
                        selectControl.deactivate();
                        modifyFeature.deactivate();
			modifyFeature2.deactivate();
                        modifyFeature3.activate();
                        boreLine.setZIndex(9999);
		}
		else{
			modifyFeature.deactivate();
			modifyFeature2.deactivate();
			modifyFeature3.deactivate();
			if(!selectControl.active){
	                        selectControl.activate();
			}
		}
		changeTime();
	}

	// create ellipse and polygon controls
	var polyOptions = {sides: 40, irregular: true};
        var ellipseControl = new OpenLayers.Control.DrawFeature(threat_area,OpenLayers.Handler.RegularPolygon,{handlerOptions: polyOptions});
	map.addControl(ellipseControl);
	polygonControl = new OpenLayers.Control.DrawFeature(threat_area,OpenLayers.Handler.Polygon,{handlerOptions: {sides: 40}});
       	map.addControl(polygonControl);
	polygonControl3 = new OpenLayers.Control.DrawFeature(threat_area,OpenLayers.Handler.Polygon,{handlerOptions: {sides: 40}});
        map.addControl(polygonControl3);
	polygonControl2 = new OpenLayers.Control.DrawFeature(background_area,OpenLayers.Handler.Polygon);
        map.addControl(polygonControl2);
	polygonControl5 = new OpenLayers.Control.DrawFeature(background_area,OpenLayers.Handler.Path);
        map.addControl(polygonControl5);
	ellipseControl.events.register('featureadded', '', featureDrawn);
        polygonControl.events.register('featureadded', '', featureDrawn);
	polygonControl3.events.register('featureadded', '', finishRedefineThreat);
        polygonControl2.events.register('featureadded', '', backgroundDrawn);
	polygonControl5.events.register('featureadded', '', backgroundDrawn);
	
	var ellipseControl3 = new OpenLayers.Control.DrawFeature(threat_area,OpenLayers.Handler.RegularPolygon,{handlerOptions: polyOptions});
       	map.addControl(ellipseControl3);
	ellipseControl3.events.register('featureadded', '', finishRedefineThreat);
	
	var lineControl = new OpenLayers.Control.DrawFeature(background_area,OpenLayers.Handler.Path);
        map.addControl(lineControl);
	lineControl.events.register('featureadded', '', trackDrawn);

	// modify feature
        modifyFeature = new OpenLayers.Control.TransformFeature(threat_area,{
                renderIntent: "transform",
		//irregular: true,
                rotationHandleSymbolizer: "rotate"
        });
        map.addControl(modifyFeature);
	modifyFeature.events.register('beforetransform','',assignValidStart);
        modifyFeature.events.register('transform','',function(){
		if(timeCanvasVal.getAttr('time') == parseInt(modifyFeature.feature.attributes.data['valid_start'])){
                       	adjustObjOffset();
			bufMove = true;
			console.log('object is not modified');
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
        });

	// modify feature (background)
        var modifyFeature2 = new OpenLayers.Control.ModifyFeature(background_area,{
		vertexRenderIntent: "modification",
	});
	//modifyFeature2.mode = OpenLayers.Control.ModifyFeature.DRAG;
	//modifyFeature2.createVertices = true;
        map.addControl(modifyFeature2);
	//modifyFeature2.activate();

	var modifyFeature3 = new OpenLayers.Control.ModifyFeature(boreLine,{
                vertexRenderIntent: "modification",
		dragComplete: setBorePoints
        });
	modifyFeature3.createVertices = false;
	map.addControl(modifyFeature3);

	var pointControl = new OpenLayers.Control.DrawFeature(trackPoints,OpenLayers.Handler.Point);
	map.addControl(pointControl);
	pointControl.deactivate();
	pointControl.events.register('featureadded', '', pointAdded);

	function addNavigation(){
	    if(map.getControl(Navigation) != null){
		return;
	    }
	    Navigation = new OpenLayers.Control.Navigation({
		defaultDblClick: function(e){
			if(modifyFeature2.feature != null){
				var lonlat = map.getLonLatFromPixel(e.xy);
				probID = modifyFeature2.feature.attributes.probID;
		                var parser = new jsts.io.OpenLayersParser();
		                var geojson_format = new OpenLayers.Format.JSON();
		                featureAttrs = JSON.stringify(modifyFeature2.feature.attributes);
		                verts = modifyFeature2.feature.geometry.getVertices();
		                coords = new Array();
		                for(var i2=0;i2<verts.length;i2++){
					dis = Math.sqrt(Math.pow(verts[i2].x - lonlat.lon,2) + Math.pow(verts[i2].y - lonlat.lat,2));
					zoomFactor = (map.getResolution() / 100) * 1000;
					if(dis > zoomFactor){
			                        coords.push(verts[i2]);
					}
		                }
		                lineString = new OpenLayers.Geometry.LineString(coords);
		                newLine = new OpenLayers.Feature.Vector(lineString,geojson_format.read(featureAttrs));
				modifyFeature2.unselectFeature(modifyFeature2.feature);
		                for(var i2=0;i2<background_area.features.length;i2++){
		                        if(background_area.features[i2].attributes.probID == probID){
		                                background_area.removeFeatures([background_area.features[i2]]);
		                        }
		                }
		                background_area.addFeatures([newLine]);
		                modifyFeature2.selectFeature(background_area.features[background_area.features.length - 1]);
				connectLines();
			}
		},
		'zoomWheelEnabled': false
	    });
	    //Navigation.disableZoomWheel();
	    map.addControl(Navigation);
	}

	function removeNavigation(){
		if(map.getControl(Navigation) != null){
                	return;
	        }
		map.removeControl(Navigation);
		Navigation = null;
	}

	function swapAutomation(autoObj){
		if(autoObj && modifyFeature.renderIntent == "transformed"){
			return;
		}
		else if(!autoObj && modifyFeature.renderIntent == "transform"){
			return;
		}
		var geojson_format = new OpenLayers.Format.JSON();
		var obj = modifyFeature.feature.geometry.clone();
		var tempAttrs = geojson_format.read(JSON.stringify(modifyFeature.feature.attributes));
		modifyFeature.unsetFeature();
	        modifyFeature.feature = null;
		modifyFeature.deactivate();
		modifyFeature.destroy();
	        if(autoObj){
			modifyFeature = new OpenLayers.Control.TransformFeature(threat_area,{
                               	renderIntent: "transformed",
                               	rotationHandleSymbolizer: "rotated"  
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
			console.log('transform active');
		}
		else{
			modifyFeature = new OpenLayers.Control.TransformFeature(threat_area,{
                               	renderIntent: "transform",
                               	rotationHandleSymbolizer: "rotate"  
                       	});
                       	map.addControl(modifyFeature);  
                       	modifyFeature.events.register('beforetransform','',assignValidStart);
                       	modifyFeature.events.register('transform','',function(){
                               	if(timeCanvasVal.getAttr('time') == parseInt(modifyFeature.feature.attributes.data['valid_start'])){
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
			console.log('transform not active');
		}
		var newObj = new OpenLayers.Feature.Vector(obj,tempAttrs);
                threat_area.removeAllFeatures();
                threat_area.addFeatures([newObj]);
                threat_area.redraw();
		console.log(threat_area.features[threat_area.features.length-1].attributes);
		modifyFeature.setFeature(threat_area.features[threat_area.features.length-1]);
	}
