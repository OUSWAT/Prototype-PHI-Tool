	/*

	Copyright (c) 2014 Cooperative Institute for Mesoscale Meteorological Studies (CIMMS) and the University of Oklahoma

	Author:         Dr. Chris Karstens
	Email:          chris.karstens@noaa.gov
	Description:    Contains the following:
				1. tile retrieving function
				2. styling rules
				3. style maps for vector displays
				4. map constructor and map layers
				5. map z-order reset function
				6. primary onload function

	*/

	// function for retrieving tiles (credit: Daryl Herzmann (akrherz@iastate.edu))
	function get_my_url (bounds) {
                var res = this.map.getResolution();
                var y = Math.round ((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
                var x = Math.round ((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
                var z = this.map.getZoom();
                var path = "&z="+z+  "&x=" + x + "&y=" + y;
                var url = this.url;
                if (url instanceof Array) {
                        url = this.selectUrl(path, url);
                }
                return url + path;
        }

	// style rules
	var rules = [
		new OpenLayers.Rule({
			symbolizer: {strokeColor: threatColor,strokeWidth: 2,fillColor: threatColor,fillOpacity: 0.3},
			elseFilter: true
		})
	];
	var rules2 = [
		new OpenLayers.Rule({
			symbolizer: {strokeColor: threatColor,strokeWidth: 6,fillColor: threatColor,fillOpacity: 0.3},
			elseFilter: true
		})
	];
	var obsContext = {
		getObRadius: function(feature){
			var zoom = map.getZoom() - 1;
			if(parseInt(feature.attributes.prior) < zoom){
				return 2;
			}
			else{
				return 0;
			}
		},
		getLabel: function(feature){
			var zoom = map.getZoom() - 1;
			if(parseInt(feature.attributes.prior) < zoom){
				return c2f(feature.attributes.temp) + '\n' + c2f(feature.attributes.dewp);
			}
			else{
				return '';
			}
		},
		getIcon: function(feature){
			var zoom = map.getZoom() - 1;
                       	if(parseInt(feature.attributes.prior) < zoom){
				var params = [];
				var url = 'http://www.aviationweather.gov/gis/scripts/stationicon.php?';
				if(feature.attributes.cover != undefined){
					params.push('cover=' + feature.attributes.cover);
				}
				if(feature.attributes.wspd != undefined){
	                               	params.push('wspd=' + feature.attributes.wspd);
	                       	}
				if(feature.attributes.wdir != undefined){
	                               	params.push('wdir=' + feature.attributes.wdir);
	                       	}
				if(feature.attributes.wgst != undefined){
	                               	params.push('wgst=' + feature.attributes.wgst);
	                       	}
				url = url + params.join('&');
				return url;
			}
			else{
				return '';
			}
		}
	};

	// style maps

	var styleMapSPC = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    strokeColor: "${color}",
                    strokeWidth: 3
                })
        });

	var styleMapPoint4 = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
			externalGraphic:"${getIcon}",
			backgroundGraphic: "${getIcon}",
                        backgroundWidth: 70,
			backgroundHeight: 70,
			pointRadius: "${getObRadius}",
                       	label: '${getLabel}',
                        labelXOffset: "-12",
                       	labelYOffset: "0",
			labelOutlineColor: '#FFFFFF',
			labelOutlineWidth: 2
                }, { 
                        context: obsContext

                })
        });

	var styleMapThreat = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                        strokeColor: "${color}",
                        strokeWidth: 3,
                        fillColor: "${color}",
                        fillOpacity: 0.0
                }),
                'select':new OpenLayers.Style({
                    strokeWidth: 6,
                    fillOpacity: 0.3
                })
        });

	var styleMapThreat3 = new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({
			strokeColor: '${getThreatColor}',     
			strokeWidth: 5,
			strokeOpacity: 1,
			fillColor: '${getThreatColor2}',                 
			label: '${getLabelID}',
			labelSelect: true,
                        labelAllign: 'rt',
                       	labelOutlineColor: '#000000',
                       	labelOutlineWidth: 4,
                       	fontColor: '${getThreatColor2}',
                       	fontSize: "18px",
                        fontWeight: "bold",
                        labelXOffset: '${getLableOffsetX}', 
               	        labelYOffset: '${getLableOffsetY}',
                       	fillOpacity: 0.0
                }, { 
                        context: { 
                                getDisplay: function(feature) {
                                        // hide the resize handle at the south-east corner
                                       	return feature.attributes.role === "se-resize" ? "none" : "";
                               	},
				getLabelID: function(feature){
					try{
						if(feature.attributes.data['types'][0] == 'severe1' && showPT){
							var prob = parseInt(feature.attributes.data.ProbSevere['probTor']);
						}
						else if(feature.attributes.data['prediction'] != 'persistence'){
							if('prob_start' in feature.attributes.data){
								var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300);
                                                                var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300) - tNow) * 5;
							}
							else{
								var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300);
		                                                var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300) - tNow) * 5;
							}
	                                                var prbs = feature.attributes.data['probs'][0];
	                                                var slp = (prbs[tNow+1] - prbs[tNow]) / 5;
	                                                var y_int = prbs[tNow] - ((tNow * 5) * slp);
	                                                var prob = parseInt(Math.round((((tNow * 5) + inc) * slp) + y_int));
						}
						else{
							var prob = parseInt(Math.round(feature.attributes.data['probs'][0][0]));
						}
						if(feature.attributes.data['automated'] == 0){
							var mFound = false;
							for(var key in feature.attributes.data.modified){
								if(feature.attributes.data.modified[key] == 0){
									mFound = true;
									break;
								}
							}
							if(!mFound){
								return feature.attributes.data['user'] + '-' + feature.attributes.data['id'] % 1000 + '-L1\n' + prob + '%';
							}
							else{
								return feature.attributes.data['user'] + '-' + feature.attributes.data['id'] % 1000 + '-L2\n' + prob + '%';
							}
						}
						else if(feature.attributes.data['automated'] == 2 && feature.attributes.data['allow'] == 1){
                                                       	return feature.attributes.data['user'] + '-' + feature.attributes.data['id'] % 1000 + '-L3\n' + prob + '%';
                                                }
                                                else{
                                                       	return feature.attributes.data['id'] % 1000 + '-L4\n' + prob + '%';
                                               	}
					}
					catch(err){
						return '';
					}
				},
				getLableOffsetX: function(feature) {
                                       	var verts = feature.geometry.getVertices();
                                       	var topY = 0;
                                       	var topX;
                                       	for(var i=0;i<verts.length;i++){
                                               	if(verts[i].y > topY){
                                                       	topY = verts[i].y;
                                                       	topX = verts[i].x;
                                               	}
                                       	}
                                       	var diff = map.getPixelFromLonLat(new OpenLayers.LonLat(topX,topY)).x - map.getPixelFromLonLat(new OpenLayers.LonLat(feature.geometry.getCentroid().x,feature.geometry.getCentroid().y)).x;
                                       	return diff;
                               	},
                               	getLableOffsetY: function(feature) {
                                       	var verts = feature.geometry.getVertices();
                                       	var topY = 0;
                                       	var topX;
                                       	for(var i=0;i<verts.length;i++){
                                               	if(verts[i].y > topY){
                                                       	topY = verts[i].y;
                                                       	topX = verts[i].x;
                                               	}
                                       	}
                                       	var diff = -1 * (map.getPixelFromLonLat(new OpenLayers.LonLat(topX,topY)).y - map.getPixelFromLonLat(new OpenLayers.LonLat(feature.geometry.getCentroid().x,feature.geometry.getCentroid().y)).y);
                                       	return diff;
                               	},
				getThreatColor: function(feature){
					try{
						if(feature.attributes.data['types'][0] == 'severe1' && showPT){
                                                        var prob = parseInt(feature.attributes.data.ProbSevere['probTor']);
                                                }
                                                else if(feature.attributes.data['prediction'] != 'persistence'){
							if('prob_start' in feature.attributes.data){
                                                               	var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300);
                                                               	var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300) - tNow) * 5;
                                                       	}
                                                        else{
                                                                var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300);
                                                                var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300) - tNow) * 5;
                                                       	}
							var prbs = feature.attributes.data['probs'][0];
							var slp = (prbs[tNow+1] - prbs[tNow]) / 5;
		                                        var y_int = prbs[tNow] - ((tNow * 5) * slp);
		                                        var prob = (((tNow * 5) + inc) * slp) + y_int;
						}
						else{
							var prob = parseInt(Math.round(feature.attributes.data['probs'][0][0]));
						}
						if(timeCanvasVal.getAttr('time') >= scans[volumes][0].split('_')[1] && feature.attributes.data['automated'] != 0){
							if(feature.attributes.data['types'][0].slice(0,-1) == 'severe' && prob < validProbMinSevere || feature.attributes.data['types'][0].slice(0,-1) == 'severe' && prob > validProbMaxSevere || feature.attributes.data['types'][0].slice(0,-1) == 'tornado' && prob < validProbMinTornado || feature.attributes.data['types'][0].slice(0,-1) == 'tornado' && prob > validProbMaxTornado || feature.attributes.data['types'][0].slice(0,-1) == 'lightning' && prob < validProbMinLightning || feature.attributes.data['types'][0].slice(0,-1) == 'lightning' && prob > validProbMaxLightning){
                                                               	if(feature.attributes.data['allow'] == 0){
                                                                       	var color = 'rgb(150,150,150)';
                                                               	}
                                                               	else{
                                                                       	var color = 'rgb(255,255,255)';
                                                               	}
                                                       	}
                                                       	else if(feature.attributes.data['allow'] == 0){
                                                               	var color = 'rgb(255,255,255)';
                                                       	}
                                                       	else{
                                                               	var color = getStandardColor(prob);
                                                       	}
                                               	}
                                               	else if(feature.attributes.data['allow'] == 0){
                                                       	var color = 'rgb(150,150,150)';
                                               	}
                                               	else{
                                                       	var color = getStandardColor(prob);
                                               	}
						return color;
					}
					catch(err){
						return feature.attributes.threatColor;
					}
				},
				getThreatColor2: function(feature){
                                        try{
						if(feature.attributes.data['types'][0] == 'severe1' && showPT){
                                                        var prob = parseInt(feature.attributes.data.ProbSevere['probTor']);
                                                }
                                                else if(feature.attributes.data['prediction'] != 'persistence'){
							if('prob_start' in feature.attributes.data){
                                                               	var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300);
                                                               	var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300) - tNow) * 5;
                                                       	}
                                                        else{
                                                                var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300);
                                                                var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300) - tNow) * 5;
                                                       	}
	                                                var prbs = feature.attributes.data['probs'][0];
	                                                var slp = (prbs[tNow+1] - prbs[tNow]) / 5;
	                                                var y_int = prbs[tNow] - ((tNow * 5) * slp);
	                                               	var prob = (((tNow * 5) + inc) * slp) + y_int;
						}
						else{
							var prob = parseInt(Math.round(feature.attributes.data['probs'][0][0]));
						}
						if(timeCanvasVal.getAttr('time') >= scans[volumes][0].split('_')[1] && feature.attributes.data['automated'] != 0){
							if(feature.attributes.data['types'][0].slice(0,-1) == 'severe' && prob < validProbMinSevere || feature.attributes.data['types'][0].slice(0,-1) == 'severe' && prob > validProbMaxSevere || feature.attributes.data['types'][0].slice(0,-1) == 'tornado' && prob < validProbMinTornado || feature.attributes.data['types'][0].slice(0,-1) == 'tornado' && prob > validProbMaxTornado || feature.attributes.data['types'][0].slice(0,-1) == 'lightning' && prob < validProbMinLightning || feature.attributes.data['types'][0].slice(0,-1) == 'lightning' && prob > validProbMaxLightning){
                                                               	if(feature.attributes.data['allow'] == 0){
                                                                       	// blocked on interface and server
                                                                       	return 'rgb(150,150,150)';
                                                                }
                                                               	else{
                                                                       	// allowed through by user
                                                                       	return 'rgb(255,255,255)';
                                                               	}
                                                        }
                                                        else if(feature.attributes.data['allow'] == 0){
                                                                return 'rgb(255,255,255)';
                                                        }
                                                        else{
                                                                return feature.attributes.threatColor;
                                                        }
                                                }
                                                else if(feature.attributes.data['allow'] == 0){
                                                       	return 'rgb(150,150,150)';
                                                }
                                                else{
                                                       	return feature.attributes.threatColor;
                                               	}
                                        }
                                        catch(err){
                                                return feature.attributes.threatColor;
                                       	}
                                }
			}                           
		}),
		"select": new OpenLayers.Style({
			labelOutlineWidth: 6,
			fontSize: "24px"  
		}, {               
			context: {   
				getDisplay: function(feature) {
					// hide the resize handle at the south-east corner
					return feature.attributes.role === "se-resize" ? "none" : "";
				}           
			}            
		}),
		"transform": new OpenLayers.Style({
			display: "${getDisplay}",          
			cursor: "${role}",
			pointRadius: 5,
			fillColor: "white",
			fillOpacity: 1,
			strokeColor: "black",
			title: 'Resize'
		}, {
			context: {
				getDisplay: function(feature) {
					// hide the resize handle at the south-east corner
					return feature.attributes.role === "se-resize" ? "none" : "";
				}
			}
		}),
		"rotate": new OpenLayers.Style({
			display: "${getDisplay}",
			pointRadius: 10,
			fillColor: "#ddd",
			fillOpacity: 1,
			strokeColor: "black",
			title: 'Rotate (+Ctrl Swath)'
		}, {             
			context: {
				getDisplay: function(feature) {
					// only display the rotate handle at the south-east corner
					return feature.attributes.role === "se-rotate" ? "" : "none";
				}          
			}                  
		})
	});

	OpenLayers.Renderer.symbol.lightning = [0, 0, 4, 2, 6, 0, 10, 5, 6, 3, 4, 5, 0, 0];
	OpenLayers.Renderer.symbol.dash = [0, 0, 10, 0, 10, 2, 0, 2, 0, 0];
	var styleMapNLDN = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                        strokeColor: 'rgb(0,0,0)',
                        strokeWidth: 1,
                        strokeOpacity: 1,
                        fillColor: 'rgb(0,0,0)',
                        fillOpacity: 1,
                       	pointRadius: 6,
			graphicName: '${getGraphic}'
                }, { 
                       	context: {
                                getGraphic: function(feature){
                                        if(feature.attributes.peak >= 0){
                                               	var graphic = 'cross';
                                       	}
                                       	else{
                                                var graphic = 'dash';
                                        }
                                        return graphic;
                                }
                        }
                }),
               	"select": new OpenLayers.Style({
                       	fontSize: "24px"  
               	}, {
                       	context: {   
                               	getDisplay: function(feature) {
                                       	// hide the resize handle at the south-east corner
                                       	return feature.attributes.role === "se-resize" ? "none" : "";
                               	}
                       	}            
               	})
       	});

	var styleMapWofTracks = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                        strokeColor: '${color}',     
                        strokeWidth: '${getSW}',
			//strokeOpacity: 1,
                        strokeOpacity: '${opacity}',
                        //fillColor: '${getTimeColor}',
			fillColor: '${getFillColor}',
                        fillOpacity: 0.5,
			//pointRadius: 6,
			label: '${getTimeLabel}',
			labelXOffset: 0,
			labelYOffset: 0
                }, {
                        context: {
				getTimeColor: function(feature){
					var tNow = parseInt(timeCanvasVal.getAttr('time'));
                                        var tDiff = feature.attributes.epoch - tNow;
                                        if(tDiff >= 0){
                                                var color = 'rgb(255,0,0)';
                                        }
                                        else{
                                                var color = 'rgb(100,100,100)';
                                        }
                                        return color;
				},
				getSW: function(feature){
					if(wofLayer == 'points'){
						var sw = 1;
					}
					else{
						var sw = 6;
					}
					return sw;
				},
				getFillColor: function(feature){
					if(wofLayer == 'points'){
						//var c = getStandardColor((feature.attributes.count / 18) * 100);
						if(wofType == 'uh'){
							var c = getStandardColor((feature.attributes.max / 300) * 100);
						}
						else{
							var c = getStandardColor((feature.attributes.max / 15) * 100);
						}
					}
					else{
						var c = 'rgb(0,0,0)';
					}
					return c;
				},
				getTimeLabel:function(feature){
                                        if(wofLayer == 'points' && map.getZoom() >= 10){
                                                var tNow = parseInt(timeCanvasVal.getAttr('time'));
						var c = Math.round((parseInt(feature.attributes.maxTime) - tNow) / 60);
                                       	}
                                        else{
                                                var c = '';
                                        }
                                        return c;
                                }
			}
		}),
                "select": new OpenLayers.Style({
                        fontSize: "24px"  
                }, {
                        context: {   
                                getDisplay: function(feature) {
                                        // hide the resize handle at the south-east corner
                                        return feature.attributes.role === "se-resize" ? "none" : "";
                                }
                        }            
                })
	});

	var styleMapWofObjects = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                        strokeColor: '${color}',     
                        strokeWidth: 2,
                        strokeOpacity: 1,
                        fillOpacity: 0
                }, { 
                        context: {
                                getTimeColor: function(feature){
					var tNow = parseInt(timeCanvasVal.getAttr('time'));
                                        var tDiff = feature.attributes.epoch - tNow;
                                        if(tDiff >= 0){
                                                var color = 'rgb(255,0,0)';
                                        }
                                        else{
                                                var color = 'rgb(100,100,100)';
                                        }
                                        return color;
                                }
                        }
                }),
                "select": new OpenLayers.Style({
                        fontSize: "24px"  
                }, {
                        context: {   
				getDisplay: function(feature) {
                                        // hide the resize handle at the south-east corner
                                        return feature.attributes.role === "se-resize" ? "none" : "";
                                }
                        }            
                })
        });

	var styleMapThreat3_3 = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                        strokeColor: '${getThreatColor2}',     
                        strokeWidth: '${getStrokeWidth}',
                        strokeOpacity: 1,
			strokeDashstyle: '${getDashStyle}',
                        fillColor: '${getThreatColor2}',
                        label: '${getLabelID}',
                        labelSelect: true,
                        labelAllign: 'rt',
                        labelOutlineColor: '#000000',
                        labelOutlineWidth: 4,
                        fontColor: '${getThreatColor}',
                        fontSize: "18px",
                        fontWeight: "bold",
                        labelXOffset: '${getLableOffsetX}', 
                        labelYOffset: '${getLableOffsetY}',
                        fillOpacity: 0.0
                }, { 
                        context: { 
                                getDisplay: function(feature) {
                                        // hide the resize handle at the south-east corner
                                        return feature.attributes.role === "se-resize" ? "none" : "";
                                },
                                getLabelID: function(feature){
                                        try{
						var recProb = null;
						if(feature.attributes.data['types'][0] == 'severe1' && feature.attributes.data.ProbSevere['prob'] > 0){
							if(showPT){
								recProb = parseInt(feature.attributes.data.ProbSevere['probTor']);
							}
							else{
								recProb = feature.attributes.data.ProbSevere['prob'];
							}
						}
						else if(feature.attributes.data['types'][0] == 'lightning1' && feature.attributes.data.Lightning['prob1'] > 0){
							recProb = feature.attributes.data.Lightning['prob1'];
						}
                                                if(feature.attributes.data['prediction'] != 'persistence'){
							if('prob_start' in feature.attributes.data){
                                                               	var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300);
                                                               	var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300) - tNow) * 5;
                                                       	}
                                                        else{
                                                                var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300);
                                                                var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300) - tNow) * 5;
                                                       	}
	                                                var prbs = feature.attributes.data['probs'][0];
	                                                var slp = (prbs[tNow+1] - prbs[tNow]) / 5;
	                                                var y_int = prbs[tNow] - ((tNow * 5) * slp);
	                                                var prob = parseInt(Math.round((((tNow * 5) + inc) * slp) + y_int));
						}
						else{
							var prob = parseInt(Math.round(feature.attributes.data['probs'][0][0]));
						}
						if(feature.attributes.data['prediction'] == 'explicit'){
							var pred = 'E';
						}
						else{
							var pred = 'P';
						}
						if(feature.attributes.data['automated'] == 0){
                                                       	var mFound = false;
                                                        for(var key in feature.attributes.data.modified){
                                                               	if(feature.attributes.data.modified[key] == 0){
                                                                       	mFound = true;
                                                                       	break;
                                                               	}
                                                       	}
							var ago = Math.round((timeCanvasNow.getAttr('time') - feature.attributes.data['issue']) / 60);
                                                       	if(!mFound){
                                                                return feature.attributes.data['user'] + '-' + feature.attributes.data['id'] % 1000 + '-' + pred + '1\n' + prob + '% - ' + ago + 'min';
                                                       	}
							else if(recProb != null){
								return feature.attributes.data['user'] + '-' + feature.attributes.data['id'] % 1000 + '-' + pred + '2\n' + prob + '% (' + recProb + '%) - ' + ago + 'min';
							}
                                                       	else{
                                                               	return feature.attributes.data['user'] + '-' + feature.attributes.data['id'] % 1000 + '-' + pred + '2\n' + prob + '% - ' + ago + 'min';
                                                       	}
                                                }
                                                else if(feature.attributes.data['automated'] == 2 && feature.attributes.data['allow'] == 1){
							var ago = Math.round((timeCanvasNow.getAttr('time') - feature.attributes.data['issue']) / 60);
							if(recProb != null){
								return feature.attributes.data['user'] + '-' + feature.attributes.data['id'] % 1000 + '-' + pred + '3\n' + prob + '% (' + recProb + '%) - ' + ago + 'min';
							}
							else{
	                                                       	return feature.attributes.data['user'] + '-' + feature.attributes.data['id'] % 1000 + '-' + pred + '3\n' + prob + '% - ' + ago + 'min';
							}
                                               	}
                                                else{
							if(feature.attributes.data['types'][0] == 'severe1' && showPT){
								prob = parseInt(feature.attributes.data.ProbSevere['probTor']);
							}
                                                       	return feature.attributes.data['id'] % 1000 + '-' + pred + '4\n' + prob + '%';
                                               	}
                                        }
                                        catch(err){
                                                return '';
                                        }
                                },
                                getLableOffsetX: function(feature) {
					var verts = feature.geometry.getVertices();
					var topY = 0;
					var topX;
					for(var i=0;i<verts.length;i++){
						if(verts[i].y > topY){
							topY = verts[i].y;
							topX = verts[i].x;
						}
					}
					var diff = map.getPixelFromLonLat(new OpenLayers.LonLat(topX,topY)).x - map.getPixelFromLonLat(new OpenLayers.LonLat(feature.geometry.getCentroid().x,feature.geometry.getCentroid().y)).x;
                                        return diff;
                                },
                                getLableOffsetY: function(feature) {
                                        var verts = feature.geometry.getVertices();
                                       	var topY = 0;
                                       	var topX;
                                        for(var i=0;i<verts.length;i++){
                                               	if(verts[i].y > topY){
                                                       	topY = verts[i].y;
                                                       	topX = verts[i].x;
                                               	}
                                       	}
					var diff = -1 * (map.getPixelFromLonLat(new OpenLayers.LonLat(topX,topY)).y - map.getPixelFromLonLat(new OpenLayers.LonLat(feature.geometry.getCentroid().x,feature.geometry.getCentroid().y)).y);
					return diff;
                                },
				getStrokeWidth: function(feature){
                                        if(feature.attributes.data['automated'] == 1){
                                                return 3;
                                        }
                                       	else{
                                                return 5;
                                        }
                                },
				getDashStyle: function(feature){
					if(feature.attributes.data['automated'] == 1){
						return 'dash';
					}
					else if(feature.attributes.data.elements['alertLevel'] == 'beAware' && feature.attributes.data['types'][0] != 'lightning1'){
						return 'longdash';
					}
					else{
						return 'solid';
					}
				},
                                getThreatColor: function(feature){
                                        try{
						if(feature.attributes.data['types'][0] == 'severe1' && showPT){
                                                        var prob = parseInt(feature.attributes.data.ProbSevere['probTor']);
                                                }
                                                else if(feature.attributes.data['prediction'] != 'persistence'){
							if('prob_start' in feature.attributes.data){
                                                               	var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300);
                                                               	var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300) - tNow) * 5;
                                                       	}
                                                        else{
                                                                var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300);
                                                                var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300) - tNow) * 5;
                                                       	}
	                                                var prbs = feature.attributes.data['probs'][0];
	                                                var slp = (prbs[tNow+1] - prbs[tNow]) / 5;
	                                                var y_int = prbs[tNow] - ((tNow * 5) * slp);
	                                                var prob = (((tNow * 5) + inc) * slp) + y_int;
						}
						else{
                                                        var prob = parseInt(Math.round(feature.attributes.data['probs'][0][0]));
                                                }
						if(timeCanvasVal.getAttr('time') >= scans[volumes][0].split('_')[1] && feature.attributes.data['automated'] != 0){
							if(feature.attributes.data['types'][0].slice(0,-1) == 'severe' && prob < validProbMinSevere || feature.attributes.data['types'][0].slice(0,-1) == 'severe' && prob > validProbMaxSevere || feature.attributes.data['types'][0].slice(0,-1) == 'tornado' && prob < validProbMinTornado || feature.attributes.data['types'][0].slice(0,-1) == 'tornado' && prob > validProbMaxTornado || feature.attributes.data['types'][0].slice(0,-1) == 'lightning' && prob < validProbMinLightning || feature.attributes.data['types'][0].slice(0,-1) == 'lightning' && prob > validProbMaxLightning){
								if(feature.attributes.data['automated'] == 1 || feature.attributes.data['automated'] == 2 && feature.attributes.data['allow'] == 0){
									var color = 'rgb(255,255,255)';
                                                                }
								else{
									var color = getStandardColor(prob);
								}
							}
							else if(feature.attributes.data['allow'] == 0){
								var color = 'rgb(255,255,255)';
	                                               	}
							else{
								var color = getStandardColor(prob);
							}
						}
						else if(feature.attributes.data['allow'] == 0){
							var color = 'rgb(150,150,150)';
						}
						else{
							var color = getStandardColor(prob);
						}
                                                return color;
					}
                                        catch(err){
                                                return feature.attributes.threatColor;
                                        }
                                },
				getThreatColor2: function(feature){
                                       	try{
						if(feature.attributes.data['types'][0] == 'severe1' && showPT){
                                                        var prob = parseInt(feature.attributes.data.ProbSevere['probTor']);
                                                }
                                                else if(feature.attributes.data['prediction'] != 'persistence'){
							if('prob_start' in feature.attributes.data){
                                                               	var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300);
                                                               	var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300) - tNow) * 5;
                                                       	}
                                                        else{
                                                                var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300);
                                                                var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300) - tNow) * 5;
                                                       	}
                                               		var prbs = feature.attributes.data['probs'][0];
                                               		var slp = (prbs[tNow+1] - prbs[tNow]) / 5;
                                               		var y_int = prbs[tNow] - ((tNow * 5) * slp);
                                               		var prob = (((tNow * 5) + inc) * slp) + y_int;
						}
						else{
                                                        var prob = parseInt(Math.round(feature.attributes.data['probs'][0][0]));
                                                }
						if(timeCanvasVal.getAttr('time') >= scans[volumes][0].split('_')[1] && feature.attributes.data['automated'] != 0){
							if(feature.attributes.data['types'][0].slice(0,-1) == 'severe' && prob < validProbMinSevere || feature.attributes.data['types'][0].slice(0,-1) == 'severe' && prob > validProbMaxSevere || feature.attributes.data['types'][0].slice(0,-1) == 'tornado' && prob < validProbMinTornado || feature.attributes.data['types'][0].slice(0,-1) == 'tornado' && prob > validProbMaxTornado || feature.attributes.data['types'][0].slice(0,-1) == 'lightning' && prob < validProbMinLightning || feature.attributes.data['types'][0].slice(0,-1) == 'lightning' && prob > validProbMaxLightning){
								if(feature.attributes.data['automated'] == 1 || feature.attributes.data['automated'] == 2 && feature.attributes.data['allow'] == 0){
									return 'rgb(255,255,255)';
                                                                }
								else{
									return feature.attributes.threatColor;
								}
							}
							else if(feature.attributes.data['allow'] == 0){
								return 'rgb(255,255,255)';
							}
							else{
								return feature.attributes.threatColor;
							}
						}
						if(feature.attributes.data['allow'] == 0){
							// blocked by user on latest scan 
                                                        return 'rgb(150,150,150)';
                                                }
						else{
							// allowed by user on latest scan
							return feature.attributes.threatColor;
						}
					}
                                       	catch(err){
                                               	return feature.attributes.threatColor;
                                       	}
                               	}
                        }                           
                }),
                "select": new OpenLayers.Style({
			labelOutlineWidth: 6,
                        fontSize: "24px"  
                }, {               
                        context: {   
                                getDisplay: function(feature) {
                                        // hide the resize handle at the south-east corner
                                        return feature.attributes.role === "se-resize" ? "none" : "";
                                }           
                        }            
                }),
                "transform": new OpenLayers.Style({
                        display: "${getDisplay}",          
                        cursor: "${role}",
                        pointRadius: 5,
                        fillColor: "white",
                        fillOpacity: 1,
                        strokeColor: "black",
                        title: 'Resize'
                }, {
                        context: {
                                getDisplay: function(feature) {
                                        // hide the resize handle at the south-east corner
                                        return feature.attributes.role === "se-resize" ? "none" : "";
                                }
                        }
                }),
                "rotate": new OpenLayers.Style({
                        display: "${getDisplay}",
                        pointRadius: 10,
                        fillColor: "#ddd",
                        fillOpacity: 1,
			strokeColor: "black",
                        title: 'Rotate (+Ctrl Swath)'
                }, {             
                        context: {
                                getDisplay: function(feature) {
                                        // only display the rotate handle at the south-east corner
                                        return feature.attributes.role === "se-rotate" ? "" : "none";
                                }          
                        }                  
                })
        });


       	var styleMapThreat3_2 = new OpenLayers.StyleMap({
               	"default": new OpenLayers.Style({
                       	strokeColor: '${getThreatColor2}',     
                       	strokeWidth: 5,
                       	strokeOpacity: 0.4,
                       	fillColor: '${getThreatColor2}',
                       	label: '${getLabelID}',
                       	labelSelect: true,
                       	labelAllign: 'rt',
                       	labelOutlineColor: '#000000',
                       	labelOutlineWidth: 4,
                       	fontColor: '${getThreatColor}',
                       	fontSize: "18px",
                       	fontWeight: "bold",
                       	labelXOffset: '${getLableOffsetX}', 
                       	labelYOffset: '${getLableOffsetY}',
			labelOutlineOpacity: 0.4,
			fontOpacity: 0.4,
                       	fillOpacity: 0.0
               	}, { 
                       	context: { 
                               	getDisplay: function(feature) {
                                       	// hide the resize handle at the south-east corner
                                       	return feature.attributes.role === "se-resize" ? "none" : "";
                               	},
                               	getLabelID: function(feature){
                                       	try{
						if(feature.attributes.data['types'][0] == 'severe1' && showPT){
                                                        var prob = parseInt(feature.attributes.data.ProbSevere['probTor']);
                                                }
                                                else if(feature.attributes.data['prediction'] != 'persistence'){
							if('prob_start' in feature.attributes.data){
                                                               	var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300);
                                                               	var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300) - tNow) * 5;
                                                       	}
                                                        else{
                                                                var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300);
                                                                var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300) - tNow) * 5;
                                                       	}
	                                               	var prbs = feature.attributes.data['probs'][0];
	                                               	var slp = (prbs[tNow+1] - prbs[tNow]) / 5;
	                                               	var y_int = prbs[tNow] - ((tNow * 5) * slp);
	                                               	var prob = parseInt(Math.round((((tNow * 5) + inc) * slp) + y_int));
						}
						else{
							var prob = parseInt(Math.round(feature.attributes.data['probs'][0][0]));
						}
						if(feature.attributes.data['automated'] == 0){
							var mFound = false;
                                                        for(var key in feature.attributes.data.modified){
                                                               	if(feature.attributes.data.modified[key] == 0){
                                                                        mFound = true;
                                                                        break;
                                                               	}
                                                       	}
                                                       	if(!mFound){
                                                                return feature.attributes.data['user'] + '-' + feature.attributes.data['id'] % 1000 + '-L1\n' + prob + '%';
                                                       	}
                                                       	else{
                                                               	return feature.attributes.data['user'] + '-' + feature.attributes.data['id'] % 1000 + '-L2\n' + prob + '%';
                                                       	}
                                                }
                                                else if(feature.attributes.data['automated'] == 2 && feature.attributes.data['allow'] == 1){
                                                       	return feature.attributes.data['user'] + '-' + feature.attributes.data['id'] % 1000 + '-L3\n' + prob + '%';
                                               	}
                                                else{
                                                       	return feature.attributes.data['id'] % 1000 + '-L4\n' + prob + '%';
                                               	}
                                       	}
                                       	catch(err){
                                               	return '';
                                       	}
                               	},
				getLableOffsetX: function(feature) {
                                       	var verts = feature.geometry.getVertices();
                                       	var topY = 0;
                                       	var topX;
                                       	for(var i=0;i<verts.length;i++){
                                               	if(verts[i].y > topY){
                                                       	topY = verts[i].y;
                                                       	topX = verts[i].x;
                                               	}
                                       	}
                                       	var diff = map.getPixelFromLonLat(new OpenLayers.LonLat(topX,topY)).x - map.getPixelFromLonLat(new OpenLayers.LonLat(feature.geometry.getCentroid().x,feature.geometry.getCentroid().y)).x;
                                       	return diff;
                               	},
                               	getLableOffsetY: function(feature) {
                                       	var verts = feature.geometry.getVertices();
                                       	var topY = 0;
                                       	var topX;
                                       	for(var i=0;i<verts.length;i++){
                                               	if(verts[i].y > topY){
                                                       	topY = verts[i].y;
                                                       	topX = verts[i].x;
                                               	}
                                       	}
	                              	var diff = -1 * (map.getPixelFromLonLat(new OpenLayers.LonLat(topX,topY)).y - map.getPixelFromLonLat(new OpenLayers.LonLat(feature.geometry.getCentroid().x,feature.geometry.getCentroid().y)).y);
                                       	return diff;
                               	},
                               	getThreatColor: function(feature){
                                       	try{
						if(feature.attributes.data['types'][0] == 'severe1' && showPT){
                                                        var prob = parseInt(feature.attributes.data.ProbSevere['probTor']);
                                                }
                                                else if(feature.attributes.data['prediction'] != 'persistence'){
							if('prob_start' in feature.attributes.data){
                                                               	var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300);
                                                               	var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300) - tNow) * 5;
                                                       	}
                                                        else{
                                                                var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300);
                                                                var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300) - tNow) * 5;
                                                       	}
	                                               	var prbs = feature.attributes.data['probs'][0];
	                                               	var slp = (prbs[tNow+1] - prbs[tNow]) / 5;
	                                               	var y_int = prbs[tNow] - ((tNow * 5) * slp);
	                                               	var prob = (((tNow * 5) + inc) * slp) + y_int;
						}
                                                else{
                                                        var prob = parseInt(Math.round(feature.attributes.data['probs'][0][0]));
                                                }
                                               	if(timeCanvasVal.getAttr('time') >= scans[volumes][0].split('_')[1] && feature.attributes.data['automated'] != 0){
                                                       	if(feature.attributes.data['types'][0].slice(0,-1) == 'severe' && prob < validProbMinSevere || feature.attributes.data['types'][0].slice(0,-1) == 'severe' && prob > validProbMaxSevere || feature.attributes.data['types'][0].slice(0,-1) == 'tornado' && prob < validProbMinTornado || feature.attributes.data['types'][0].slice(0,-1) == 'tornado' && prob > validProbMaxTornado || feature.attributes.data['types'][0].slice(0,-1) == 'lightning' && prob < validProbMinLightning || feature.attributes.data['types'][0].slice(0,-1) == 'lightning' && prob > validProbMaxLightning){
                                                               	if(feature.attributes.data['automated'] == 1 || feature.attributes.data['automated'] == 2 && feature.attributes.data['allow'] == 0){
                                                                       	var color = 'rgb(255,255,255)';
                                                               	}
                                                               	else{
                                                                       	var color = getStandardColor(prob);
                                                               	}
                                                       	}
                                                       	else if(feature.attributes.data['allow'] == 0){
                                                               	var color = 'rgb(255,255,255)';
                                                       	}
                                                       	else{
                                                               	var color = getStandardColor(prob);
                                                       	}
                                               	}
                                               	else if(feature.attributes.data['allow'] == 0){
                                                       	var color = 'rgb(150,150,150)';
                                               	}
                                               	else{
                                                       	var color = getStandardColor(prob);
                                               	}
                                               	return color;
                                       	}
                                       	catch(err){
                                               	return feature.attributes.threatColor;
                                       	}
                               	},
                               	getThreatColor2: function(feature){
                                       	try{
						if(feature.attributes.data['types'][0] == 'severe1' && showPT){
                                                        var prob = parseInt(feature.attributes.data.ProbSevere['probTor']);
                                                }
                                                else if(feature.attributes.data['prediction'] != 'persistence'){
							if('prob_start' in feature.attributes.data){
                                                               	var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300);
                                                               	var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['prob_start']) / 300) - tNow) * 5;
                                                       	}
                                                        else{
                                                                var tNow = parseInt((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300);
                                                                var inc = (((timeCanvasVal.getAttr('time') - feature.attributes.data['valid_start']) / 300) - tNow) * 5;
                                                       	}
	                                               	var prbs = feature.attributes.data['probs'][0];
	                                               	var slp = (prbs[tNow+1] - prbs[tNow]) / 5;
	                                               	var y_int = prbs[tNow] - ((tNow * 5) * slp);
	                                               	var prob = (((tNow * 5) + inc) * slp) + y_int;
						}
                                                else{
                                                        var prob = parseInt(Math.round(feature.attributes.data['probs'][0][0]));
                                                }
                                               	if(timeCanvasVal.getAttr('time') >= scans[volumes][0].split('_')[1] && feature.attributes.data['automated'] != 0){
                                                       	if(feature.attributes.data['types'][0].slice(0,-1) == 'severe' && prob < validProbMinSevere || feature.attributes.data['types'][0].slice(0,-1) == 'severe' && prob > validProbMaxSevere || feature.attributes.data['types'][0].slice(0,-1) == 'tornado' && prob < validProbMinTornado || feature.attributes.data['types'][0].slice(0,-1) == 'tornado' && prob > validProbMaxTornado || feature.attributes.data['types'][0].slice(0,-1) == 'lightning' && prob < validProbMinLightning || feature.attributes.data['types'][0].slice(0,-1) == 'lightning' && prob > validProbMaxLightning){
                                                               	if(feature.attributes.data['automated'] == 1 || feature.attributes.data['automated'] == 2 && feature.attributes.data['allow'] == 0){
                                                                       	return 'rgb(255,255,255)';
                                                               	}
                                                               	else{
                                                                       	return feature.attributes.threatColor;
                                                               	}
                                                       	}
                                                       	else if(feature.attributes.data['allow'] == 0){
                                                               	return 'rgb(255,255,255)';
                                                       	}
                                                       	else{
                                                               	return feature.attributes.threatColor;
                                                       	}
                                               	}
                                               	if(feature.attributes.data['allow'] == 0){
                                                       	// blocked by user on latest scan 
                                                       	return 'rgb(150,150,150)';
                                               	}
                                               	else{
                                                       	// allowed by user on latest scan
                                                       	return feature.attributes.threatColor;
                                               	}
                                       	}
                                       	catch(err){
                                               	return feature.attributes.threatColor;
                                       	}
                               	}
                       	}
               	}),
               	"select": new OpenLayers.Style({
                       	labelOutlineWidth: 6,
			fontSize: "24px"  
               	}, {
                       	context: {   
                               	getDisplay: function(feature) {
                                       	// hide the resize handle at the south-east corner
                                        return feature.attributes.role === "se-resize" ? "none" : "";
                                }           
                       	}            
               	}),
               	"transform": new OpenLayers.Style({
                       	display: "${getDisplay}",          
                       	cursor: "${role}",
                       	pointRadius: 5,
                       	fillColor: "white",
                       	fillOpacity: 1,
                       	strokeColor: "black",
                       	title: 'Resize'
               	}, {
                       	context: {
                               	getDisplay: function(feature) {
                                       	// hide the resize handle at the south-east corner
                                       	return feature.attributes.role === "se-resize" ? "none" : "";
                               	}
                       	}
               	}),
               	"rotate": new OpenLayers.Style({
                       	display: "${getDisplay}",
                       	pointRadius: 10,
                       	fillColor: "#ddd",
                       	fillOpacity: 1,
                       	strokeColor: "black",
                       	title: 'Rotate (+Ctrl Swath)'
               	}, {             
                       	context: {
                               	getDisplay: function(feature) {
                                       	// only display the rotate handle at the south-east corner
                                       	return feature.attributes.role === "se-rotate" ? "" : "none";
                               	}          
                       	}
               	})
       	});

	var styleMapThreat4 = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                        strokeColor: '#000000',     
                        strokeWidth: '${getSW}',
			strokeOpacity: 1,
                       	fillColor: '${threatColor}',
                        fillOpacity: 0.0
                }, {
                        context: {   
                                getDisplay: function(feature) {
                                       	// hide the resize handle at the south-east corner
                                       	return feature.attributes.role === "se-resize" ? "none" : "";
                               	},
				getSW: function(feature){
                                       	if(feature.attributes.data['automated'] == 1){
                                               	return 5;
                                       	}
                                       	else{
                                               	return 7;
                                       	}
                               	}           
                       	}            
		})
        });

	var styleMapThreat4_2 = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                        strokeColor: '#000000',     
                        strokeWidth: 7,
                       	strokeOpacity: 0.4,
                        fillColor: '${threatColor}',
                       	fillOpacity: 0.0
                }, { 
                       	context: { 
                                getDisplay: function(feature) {
                                        // hide the resize handle at the south-east corner
                                       	return feature.attributes.role === "se-resize" ? "none" : "";
                                }
                        }
                }),
                "select": new OpenLayers.Style({
                        strokeWidth: 8  
                }, {
                        context: {   
                                getDisplay: function(feature) {
                                       	// hide the resize handle at the south-east corner
                                       	return feature.attributes.role === "se-resize" ? "none" : "";
                               	}           
                       	}            
                }),
                "transform": new OpenLayers.Style({
                        display: "${getDisplay}",          
                        cursor: "${role}",
                        pointRadius: 5,
                        fillColor: "white",
                       	fillOpacity: 1,
                       	strokeColor: "black",
                        title: 'Resize'
                }, {
                        context: {
                                getDisplay: function(feature) {
                                       	// hide the resize handle at the south-east corner
                                       	return feature.attributes.role === "se-resize" ? "none" : "";
                               	}
                        }
                }),
               	"rotate": new OpenLayers.Style({
                       	display: "${getDisplay}",
                       	pointRadius: 10,
                       	fillColor: "#ddd",
                       	fillOpacity: 1,
                       	strokeColor: "black",
                       	title: 'Rotate (+Ctrl Swath)'
               	}, {             
                       	context: {
                                getDisplay: function(feature) {
                                       	// only display the rotate handle at the south-east corner
                                        return feature.attributes.role === "se-rotate" ? "" : "none";
                                }          
                        }
                })
        });

	var styleMapThreat2 = new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({
			strokeColor: '${threatColor}',
			strokeWidth: 5,
			fillColor: '${threatColor}',                 
			fillOpacity: 0.3,
			graphicZIndex: '${zindex}'
			//title: 'Move'
		}, {
			context: {
				getDisplay: function(feature) {
					// hide the resize handle at the south-east corner
					return feature.attributes.role === "se-resize" ? "none" : "";
				}
			}
		}),
		"select": new OpenLayers.Style({
			strokeWidth: 8
		}, {      
			context: {
				getDisplay: function(feature) {
					// hide the resize handle at the south-east corner
					return feature.attributes.role === "se-resize" ? "none" : "";
				}           
			}            
		}),
		"transform": new OpenLayers.Style({
			display: "${getDisplay}",
			cursor: "${role}",
			pointRadius: 5,
			fillColor: "white",
			fillOpacity: 1,
			strokeColor: "#333333",
			strokeWidth: 3,
			graphicZIndex: 2,
			title: 'Resize'
		}, {
			context: {
				getDisplay: function(feature) {
					// hide the resize handle at the south-east corner
					return feature.attributes.role === "se-resize" ? "none" : "";
				}
			}
		}),
		"rotate": new OpenLayers.Style({
			display: "${getDisplay}",
			pointRadius: 10,
			fillColor: "#ddd",
			fillOpacity: 1,
			strokeColor: "black",
			strokeWidth: 3,
			graphicZIndex: 2,
			title: 'Rotate (+Ctrl Swath)'
		}, {
			context: {
				getDisplay: function(feature) {
					// only display the rotate handle at the south-east corner
					return feature.attributes.role === "se-rotate" ? "" : "none";
				}
			}
		//}),
		//"transformed": new OpenLayers.Style({
		//}),
		//"rotated": new OpenLayers.Style({
               	})
	});

	var styleMapGrid = new OpenLayers.StyleMap({
		'default': new OpenLayers.Style({
		    strokeWidth: 0,
		    strokeColor: "${color}",
		    fillColor: "${color}",
		    fillOpacity: 0.4,
		    //label: '${prob}',
		    pointRadius: 10
		}),
		'select': new OpenLayers.Style({
		    strokeWidth: 3,
		    strokeColor: "#000000"
		})
	});

	var styleMapGrid2 = new OpenLayers.StyleMap({
		'default': new OpenLayers.Style({
			strokeWidth: 0,
			strokeColor: "#000000",
			fillColor: "#000000",
			fillOpacity: 0.4,
			pointRadius: 10
		}),
		'select': new OpenLayers.Style({
			strokeWidth: 3,
			strokeColor: "#000000"
		})
	});

	var styleMapGrid3 = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    strokeWidth: 0,
                    strokeColor: "${color}",
                    fillColor: "${color}",
                    fillOpacity: 0.4,
                    label: '${prob}',
                    pointRadius: 10
                }),
                'select': new OpenLayers.Style({
                    strokeWidth: 3,
                    strokeColor: "#000000"
                })
        });

	var styleMapPoint = new OpenLayers.StyleMap({
		'default': new OpenLayers.Style({
			fillColor: "${color}",
			strokeColor: "#333333",
			pointRadius: 6,
			labelXOffset: "${x}",
			labelYOffset: "${y}",
			label: "${label}",
			labelOutlineColor: '#FFFFFF',
			fontColor: "#000000",
			fontSize: "18px",
			fontWeight: "bold"
		})
	});

	var styleMapPoint2 = new OpenLayers.StyleMap({
		'default': new OpenLayers.Style({
			fillColor: "${color}",
			strokeColor: "#333333",
			pointRadius: 6
		})
	});

	var styleMapPoint3 = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                       	fillColor: "${color}",
                        strokeColor: "#333333",
                        pointRadius: 6,
                        labelXOffset: "${x}",
               	        labelYOffset: "${y}",
                        label: "${label}",
                        labelOutlineColor: '#FFFFFF',
			fontColor: "#FFFFFF",
                       	fontSize: "18px",
                       	fontWeight: "bold"
               	})
       	});

	var styleMapPoint44 = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                        fillColor: "rgb(255,0,0)",
                        strokeColor: "rgb(0,0,0)",
                        pointRadius: 6
                })
        });

	var styleMapUserPoint = new OpenLayers.StyleMap({
		'default': {
			fillColor: "rgb(255,255,255)",
		    strokeColor: "rgb(0,0,0)",
			pointRadius: 12,
		    strokeWidth: 2,
		    graphicName: "star"
		},
		'select': {
		    fillColor:'rgb(255,255,0)'
		}
	});

	var styleMapBlank = new OpenLayers.StyleMap({          
		'default': new OpenLayers.Style({                
		    strokeWidth: 0,
		    fillColor: '#FFFFFF',
		    fillOpacity: 0.0
		})
	});

	var styleMapNull = new OpenLayers.StyleMap({          
                'default': new OpenLayers.Style({
                    strokeWidth: 0,
                    fillOpacity: 0.0
                }),
		'select': new OpenLayers.Style({
                    fillOpacity: 0
                }),
                'modification': new OpenLayers.Style({
                    strokeWidth: 0,
                    pointRadius: 8,
                    fillOpacity: 0
                })
        });
	
	var styleMapLine = new OpenLayers.StyleMap({
		'default': new OpenLayers.Style({
		    strokeColor: "${color}",
		    //fillColor: "${color}",
		    //strokeColor: "#000000",
		    strokeDashstyle: 'longdash',
		    strokeWidth: 5,
		    fillOpacity: 0.0
		})
	});

	var styleMapPoly = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    strokeColor: "rgb(255,0,0)",
                    strokeWidth: 3
                })
        });

	var styleMapOutline = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    strokeColor: "#000000",
                    strokeDashstyle: 'solid',
                    strokeWidth: 7,
                    fillOpacity: 0.0
                })
        });

	var styleMapBackgroundLabel = new OpenLayers.StyleMap({
		'default': new OpenLayers.Style({
                    strokeColor: "${color}",
		    fillColor: "${color}",
                    strokeWidth: 6,
		    pointRadius: 8,
		    fillOpacity: 0,
		    label: "${getLabelID}",
		    labelXOffset: '${getLableOffsetX}', 
                    labelYOffset: '${getLableOffsetY}',
		    fontSize: "18px",
                    fontWeight: "bold"
		}, { 
                        context: {
                                getLabelID: function(feature){
				    try{
					if(feature.attributes.user.split('-')[1] == 'NSSL'){
						var labelID = feature.attributes.prob.split('_')[0];
						if(Number(labelID) >= 24){
							labelID = String(Number(labelID) - 24);
						} 
						return pad(labelID) + 'Z';
					}
					else{
						return '';
					}
				    }
                                    catch(err){

                                    }
                                },
				getLableOffsetX: function(feature) {
                                    try{
				        var verts = feature.geometry.getVertices();
                                        var topY = 0;
                                        var topX;
                                        for(var i=0;i<verts.length;i++){
                                                if(verts[i].y > topY){
                                                        topY = verts[i].y;
                                                        topX = verts[i].x;
                                                }
                                        }
                                        var diff = map.getPixelFromLonLat(new OpenLayers.LonLat(topX,topY)).x - map.getPixelFromLonLat(new OpenLayers.LonLat(feature.geometry.getCentroid().x,feature.geometry.getCentroid().y)).x;
                                        return diff;
				    }
                                    catch(err){

                                    }
                                },
                                getLableOffsetY: function(feature) {
				    try{
                                        var verts = feature.geometry.getVertices();
                                        var topY = 0;
                                        var topX;
                                        for(var i=0;i<verts.length;i++){
                                                if(verts[i].y > topY){
                                                        topY = verts[i].y;
                                                        topX = verts[i].x;
                                                }
                                        }
	                                var diff = -1 * (map.getPixelFromLonLat(new OpenLayers.LonLat(topX,topY)).y - map.getPixelFromLonLat(new OpenLayers.LonLat(feature.geometry.getCentroid().x,feature.geometry.getCentroid().y)).y);
                                        return diff + 15;
				    }
				    catch(err){

				    }
                                }
                        }
                }),
		'select': new OpenLayers.Style({
		    fillOpacity: 0
                }),
                'modification': new OpenLayers.Style({
		    strokeColor: "#000000",
		    fillColor: "#000000",
                    strokeWidth: 4,
                    pointRadius: 8,
                    fillOpacity: 0
		})

        });

	var styleMapBackground = new OpenLayers.StyleMap({
		'default': new OpenLayers.Style({
                    strokeColor: "${color}",
		    fillColor: "${color}",
                    strokeWidth: 6,
		    pointRadius: 8,
		    fillOpacity: 0
		}),
		 'select': new OpenLayers.Style({
		    fillOpacity: 0
                }),
                'modification': new OpenLayers.Style({
		    strokeColor: "#000000",
		    fillColor: "#000000",
                    strokeWidth: 4,
                    pointRadius: 8,
                    fillOpacity: 0
		})
        });

	var styleMapBackground2 = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    strokeColor: "${color}",
                    fillColor: "${color}",
                    strokeWidth: 6,
                    pointRadius: 8,
                    fillOpacity: 0
                }),
                 'select': new OpenLayers.Style({
                    fillOpacity: 0
                }),
                'modification': new OpenLayers.Style({
                    strokeColor: "#FFFFFF",
                    fillColor: "#FFFFFF",
                    strokeWidth: 4,
                    pointRadius: 8,
                    fillOpacity: 0
                })
        });

	var styleMapMYRORSS = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    strokeColor: "${color}",
                    //fillColor: "${color}",
                    //strokeColor: "#000000",
                    strokeDashstyle: 'solid',
                    strokeWidth: 4,
                    fillOpacity: 0.0
                }),
                'select': new OpenLayers.Style({
                        strokeWidth: 6
                })
        });

	var styleMapKmeans = new OpenLayers.StyleMap({
               	'default': new OpenLayers.Style({
                    fillColor: "${color}",
		    strokeColor: 'black',
                    strokeWidth: 2,
               	    pointRadius: 10,
                    graphicZIndex: 99999999,
                    strokeOpacity: 1,
                    graphicName: 'triangle'
                }),
               	'select': new OpenLayers.Style({
                    //pointRadius: 15
               	})
       	});

	var styleMapUHObjects = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    fillColor: "${COLOR}",
                    fillOpacity: 0.4,
                    strokeColor: "${COLOR}",
                    strokeWidth: 2
               	}),
                'select': new OpenLayers.Style({
                    strokeWidth: 5 
                })
        });

	var styleMapUHPoint = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                        graphicName: 'x',
                        fillColor: "black",
                        strokeColor: "black",
                        pointRadius: 10
                })
        });

	var styleMapActiveThreats = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    strokeColor: "${threatColor}",
                    strokeDashstyle: 'solid',
                    strokeWidth: 4,
                    fillOpacity: 0.0
               	}),
               	'select': new OpenLayers.Style({
                       	strokeWidth: 6
               	})
       	});

	var styleMapSite = new OpenLayers.StyleMap({
	        'default': {
		   fillColor: '${color}',
		   strokeColor: 'black',
		   strokeWidth: 2,
		   pointRadius: 7,
		   strokeOpacity: 1,
		   label: '${sname}',
		   labelXOffset: '22',
		   labelYOffset: '-12',
		   fontColor: '${color}',
		   fontFamily: "Arial",
		   fontWeight: "bold",
		   fontSize: "12px",
		   labelOutlineColor: 'black',
		   labelOutlineWidth: 4
		},
		'select': {
		   fillOpacity: 1
		   //strokeColor: 'black',
		   //fillColor: 'yellow',
		   //fontColor: 'yellow'
		}
	});
	
	var styleMapTrackPoint = new OpenLayers.StyleMap({
	       	'default': {
	           fillColor: '${color}',
	           strokeColor: 'black',
	           strokeWidth: 2,
	           pointRadius: 10,
	           strokeOpacity: 1,
	           label: '${sname}',
	           labelXOffset: '35',
	           labelYOffset: '18',
	           fontColor: '${color}',
	           fontFamily: "Arial",
	           fontWeight: "bold",
	           fontSize: "14px",
	           labelOutlineColor: 'black',
	           labelOutlineWidth: 3
	       	},
	       	'select': {
	           fillColor: 'yellow',
	           fontColor: 'yellow'
	       	}
	});

	var styleMapLegacyBack2 = new OpenLayers.StyleMap({
               	'default': new OpenLayers.Style({
                    fillOpacity: 0,
                    strokeColor: "${getColor}",
		    strokeOpacity: 0.4,
               	    strokeWidth: 3
		}, { 
                       	context: { 
                               	getColor: function(feature) {
                                        return feature.attributes.data.color;
                               	}
                       	}
               	})
       	});

        var styleMapLegacy2 = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
               	    fillOpacity: 0,
                    strokeColor: "rgb(0,0,0)",
                    strokeDashstyle: 'dot',
		    strokeOpacity: 0.4,
               	    strokeWidth: 2
                }, { 
                       	context: { 
                               	getColor: function(feature) {
                                       	return feature.attributes.data.color;
                               	}
                        }
                })
        });

	var styleMapLegacyBack = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    fillOpacity: 0,
                    strokeColor: "${getColor}",
                    strokeWidth: 3
               	}, { 
                       	context: { 
                               	getColor: function(feature) {
					if(feature.attributes.data.alertLevel == 'beAware'){
	                                       	//return feature.attributes.data.color;
						return "rgb(0,0,0)";
					}
					else{
						return "rgb(0,0,0)";
					}
                               	},
				getDashStyle: function(feature) {
                                       	if(feature.attributes.data.alertLevel == 'beAware'){
                                               	var s = 'dash';
                                       	}
                                       	else{
                                               	var s = 'solid';
                                       	}
                                       	return s;
                               	}
                       	}
                })
        });

	var styleMapLegacy = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    fillOpacity: 0,
                    strokeColor: "${getColor}",
              	    strokeDashstyle: '${getDashStyle}',
		    strokeWidth: 2
		}, { 
                       	context: { 
                               	getColor: function(feature) {
					if(feature.attributes.data.alertLevel == 'beAware'){
						//return "rgb(0,0,0)";
						return feature.attributes.data.color;
                                       	}
                                       	else{
						return feature.attributes.data.color;
                                       	}
                                },
				getDashStyle: function(feature) {
					if(feature.attributes.data.alertLevel == 'beAware'){
						var s = 'longdash';
					}
					else{
						var s = 'solid';
					}
					return s;
				}
			}
               	})
        });

	var styleMapCWAs = new OpenLayers.StyleMap({
		'default': new OpenLayers.Style({
		    fillOpacity: 0,
			strokeColor: "#000000",
			strokeWidth: 3
		})
	});

	var styleMapCWAs2 = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    fillOpacity: 0,
                        strokeColor: "#FFFFFF",
                        strokeWidth: 3
                })
        });

	var styleMapCounties = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    fillOpacity: 0,
                        strokeColor: "#000000",
                        strokeWidth: 1
                })
        });
        var styleMapCounties2 = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    fillOpacity: 0,
                        strokeColor: "#009900",
                        strokeWidth: 1
                })
        });

	var styleMapStates = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    fillOpacity: 0,
                        strokeColor: "#000000",
                        strokeWidth: 2
                })
        });
        var styleMapStates2 = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    fillOpacity: 0,
                        strokeColor: "#009900",
                        strokeWidth: 2
                })
        });

	var options = {isBaseLayer: false, displayInLayerSwitcher:true};
        var styleMapTracks = new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    fillColor: "${color}",
                    fillOpacity: 0.2,
                    strokeColor: "${color}",
                    strokeWidth: 2,
                    strokeOpacity: 1
                })
        });

	// create map object
	map = new OpenLayers.Map( 'map',{
		projection: new OpenLayers.Projection('EPSG:900913'),
		displayProjection: new OpenLayers.Projection('EPSG:4326'),
		units: 'm',
		wrapDateLine: false,
		numZoomLevels: 18
	});

	// google layers

	/*
	var gmap = new OpenLayers.Layer.Google("Google Streets", {'sphericalMercator': true, visibility: false});

	var gsat = new OpenLayers.Layer.Google(
		"Google Satellite",
		{type: google.maps.MapTypeId.SATELLITE, visibility: false}
	);

	var gphy = new OpenLayers.Layer.Google(
		"Google Physical",
		{type: google.maps.MapTypeId.TERRAIN, visibility: false}
	);

	
	var gstreets = new OpenLayers.Layer.TMS("Google Streets", "http://mt1.google.com/vt/lyrs=h@132&hl=en&s=sphericalMercator",
		{ 'type':'png',
		'getURL':get_my_url ,
		isBaseLayer: false,
		visibility: false
	});
	*/

	var osm = new OpenLayers.Layer.OSM();
	//var arc = new OpenLayers.Layer.ArcIMS();

	// create and add layers to map
	//map.addLayers([osm,gphy,gsat,gmap]);
	map.addLayers([osm]);
	//map.setBaseLayer(osm);

	dark = new OpenLayers.Layer.XYZ("ESRI Dark Gray", "http://server.arcgisonline.com/ArcGIS/rest/services/canvas/World_Dark_Gray_Base/MapServer/tile/${z}/${y}/${x}",
    {
      visibility : false,
      sphericalMercator : true,
      isBaseLayer : true,
      wrapDateLine : true
    });

    darkReference = new OpenLayers.Layer.XYZ("ESRI Dark Gray Reference", "http://server.arcgisonline.com/ArcGIS/rest/services/canvas/World_Dark_Gray_Reference/MapServer/tile/${z}/${y}/${x}",
    {
      visibility : false,
      sphericalMercator : true,
      isBaseLayer : false,
      wrapDateLine : true
    });

	map.addLayers([dark,darkReference]);
	dark.setZIndex(0);
	darkReference.setZIndex(9999);

	blankBounds = new OpenLayers.Bounds(-135,20,-62,55).transform(proj,proj2);
        var blank = new OpenLayers.Layer.Image('AWIPS View','images/blank.png',blankBounds,new OpenLayers.Size(1, 1),{isBaseLayer: true, transparent: true, visibility: false, displayInLayerSwitcher: true, opacity: 1});
        map.addLayer(blank);
	//blank.setZIndex(0);

	// change some layer styles if blank background is on/off
	blank.events.register("visibilitychanged", map , function(e){
		changeBlank();
        });

	function formatLatLon(lonLat){
		if(acase != 'ncp'){
			//return '<b><u>Lat</u>: ' + (Math.round(lonLat.lat * 1000000) / 1000000)  + '<u>Lon</u>: ' + (Math.round(lonLat.lon * 1000000) / 1000000) + '</b>';
			mouseLat = lonLat.lat;
			mouseLon = lonLat.lon;
	                x = Math.abs(clon - lonLat.lon) * Math.cos(lonLat.lat * Math.PI / 180) * 111.325;
	                y = Math.abs(clat - lonLat.lat) * 111.325;
	                r = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
	                //return '<b><u>Lat</u>: ' + (Math.round(lonLat.lat * 1000000) / 1000000).toPrecision(4)  + '&nbsp;&nbsp;&nbsp;&nbsp;<u>Lon</u>: ' + (Math.round(lonLat.lon * 1000000) / 1000000).toPrecision(4) + '&nbsp;&nbsp;&nbsp;&nbsp;<u>Range</u>: ' + (Math.round(r * 100) / 100).toPrecision(4) + ' km</b>';
			return '<b><u>Lat</u>:<br>' + (Math.round(lonLat.lat * 1000000) / 1000000).toPrecision(4)  + '<br><br><u>Lon</u>:<br>' + (Math.round(lonLat.lon * 1000000) / 1000000).toPrecision(4) + '<br><br><u>Range</u>: ' + (Math.round(r * 100) / 100).toPrecision(4) + ' km</b>';
		}
		else{
			return false;
		}
        }
        var mouseControl = new OpenLayers.Control.MousePosition();
        map.addControl(mouseControl);

	map.addControl(new OpenLayers.Control.LayerSwitcher());
	var scalebar = new OpenLayers.Control.ScaleBar({
		maximized: true
	});
	scalebar.displaySystem = 'english';
	scalebar.minWidth = 220;
	scalebar.maxWidth = 400;
	map.addControl(scalebar);
	var overview1 = new OpenLayers.Control.OverviewMap();
	overview1.size = new OpenLayers.Size(300,200);
	map.addControl(overview1);

	var states = new OpenLayers.Layer.Vector('U.S. States', {
                projection: "EPSG:4326",
                strategies: [new OpenLayers.Strategy.Fixed()],
                styleMap: styleMapStates,
                protocol: new OpenLayers.Protocol.HTTP({
                    url: "js/usStates.json",
                    format: new OpenLayers.Format.GeoJSON()
                })
            },
	    {isBaseLayer: false, transparent: true, displayInLayerSwitcher:true, opacity: 1}
        );
        map.addLayer(states);
        states.setVisibility(false);

	var usCounties = new OpenLayers.Layer.Image(
                'U.S. Counties',
                'images/US_Counties.png?' + (new Date()).getTime(),
                new OpenLayers.Bounds(-16370839.73,2333279.527,-6042974.947,7189168.229),
                new OpenLayers.Size(1, 1),
                {isBaseLayer: false, transparent: true, displayInLayerSwitcher:true, opacity: 1}
                );
        map.addLayer(usCounties);
        map.setLayerIndex(usCounties,9999);
	usCounties.setVisibility(false);


	var ndfd_grid = new OpenLayers.Layer.Vector("Dynamic NDFD Grid",{styleMap:styleMapGrid,displayInLayerSwitcher:false,rendererOptions: {zIndexing: true}});
	map.addLayer(ndfd_grid);
	var ndfd_grid2 = new OpenLayers.Layer.Vector("NDFD Grid Preview",{styleMap:styleMapGrid,displayInLayerSwitcher:false});
	map.addLayer(ndfd_grid2);
	var swathsBack = new OpenLayers.Layer.Vector("Threat Swaths",{styleMap:styleMapThreat4,displayInLayerSwitcher:false});
        map.addLayer(swathsBack);
	var swaths = new OpenLayers.Layer.Vector("Threat Swaths",{styleMap:styleMapThreat3,displayInLayerSwitcher:false});
	map.addLayer(swaths);
	var threat_area = new OpenLayers.Layer.Vector("Threat Area",{styleMap:styleMapThreat2,rendererOptions: {zIndexing: true},displayInLayerSwitcher:false});
	map.addLayer(threat_area);
	var threat_region = new OpenLayers.Layer.Vector("Threat Region",{styleMap:styleMapBlank,displayInLayerSwitcher:false});
	map.addLayer(threat_region);
	var track_points = new OpenLayers.Layer.Vector("Track Points",{projection: "EPSG:4326",styleMap:styleMapPoint2,displayInLayerSwitcher:false});
	map.addLayer(track_points);
	var activeThreatsBack = new OpenLayers.Layer.Vector("Active Threats",{styleMap:styleMapThreat4,displayInLayerSwitcher:false});
	map.addLayer(activeThreatsBack);
	var threat_lines_out = new OpenLayers.Layer.Vector("Threat Outlines",{projection: "EPSG:4326",styleMap:styleMapOutline,displayInLayerSwitcher:false});
        map.addLayer(threat_lines_out);
	var threat_lines = new OpenLayers.Layer.Vector("Threat Lines",{projection: "EPSG:4326",styleMap:styleMapLine,displayInLayerSwitcher:false});
	map.addLayer(threat_lines);
	var activeThreats = new OpenLayers.Layer.Vector("Active Threats",{styleMap:styleMapThreat3_3,displayInLayerSwitcher:false});
	//var activeThreats = new OpenLayers.Layer.Vector("Active Threats",{styleMap:styleMapThreat3,displayInLayerSwitcher:false});
	//var activeThreats = new OpenLayers.Layer.Vector("Active Threats",{projection: "EPSG:4326",styleMap:styleMapActiveThreats,rendererOptions: {zIndexing: true},displayInLayerSwitcher:false});
	map.addLayer(activeThreats);
	var activeThreatClones = new OpenLayers.Layer.Vector("Active Threat Clones");
	var activeThreatClones2 = new OpenLayers.Layer.Vector("Active Threat Clones2");
	var activeThreatsTemp = new OpenLayers.Layer.Vector("Active Threats Temp");
	var userLoc = new OpenLayers.Layer.Vector("User Location",{projection: "EPSG:4326",styleMap:styleMapUserPoint});
	map.addLayer(userLoc);
	var myrorss_points = new OpenLayers.Layer.Vector("MYRORSS Objects",{projection: "EPSG:4326",styleMap:styleMapMYRORSS});
	var myrorss_objects = new OpenLayers.Layer.Vector("MYRORSS Objects",{projection: "EPSG:4326",styleMap:styleMapMYRORSS,rendererOptions: {zIndexing: true},displayInLayerSwitcher:false});
	map.addLayer(myrorss_objects);
	var kmeans_lines = new OpenLayers.Layer.Vector("K-means Lines",{projection: "EPSG:4326",styleMap:styleMapMYRORSS,rendererOptions: {zIndexing: true},displayInLayerSwitcher:false});
       	map.addLayer(kmeans_lines);
	var kmeans_points = new OpenLayers.Layer.Vector("K-means Objects",{projection: "EPSG:4326",styleMap:styleMapKmeans});
        var kmeans_objects = new OpenLayers.Layer.Vector("K-means Objects",{projection: "EPSG:4326",styleMap:styleMapKmeans,displayInLayerSwitcher:false});
        map.addLayer(kmeans_objects);
	var wof = new OpenLayers.Layer.Vector("Warn-on-Forecast Probs",{styleMap:styleMapThreat2,rendererOptions: {zIndexing: true}});
	var activeWof = new OpenLayers.Layer.Vector("Warn-on-Forecast Probs",{styleMap:styleMapThreat2,rendererOptions: {zIndexing: true},displayInLayerSwitcher:false});
        map.addLayer(activeWof);
	var wof_points = new OpenLayers.Layer.Vector("WoF Points",{styleMap:styleMapPoint});
	var uhObjectsShow = new OpenLayers.Layer.Vector("UH Objects",{styleMap:styleMapUHObjects,rendererOptions: {zIndexing: true},displayInLayerSwitcher:false});
	map.addLayer(uhObjectsShow);
	var uhObjects = new OpenLayers.Layer.Vector("UH Objects",{styleMap:styleMapUHObjects,rendererOptions: {zIndexing: true},displayInLayerSwitcher:false});
	var uhTrack = new OpenLayers.Layer.Vector("UH Points",{projection: "EPSG:4326",styleMap:styleMapUHPoint,displayInLayerSwitcher:false});
        map.addLayer(uhTrack);
	var threat_points = new OpenLayers.Layer.Vector("Threat Points",{projection: "EPSG:4326",styleMap:styleMapPoint,displayInLayerSwitcher:false});
        map.addLayer(threat_points);
	var nwsTorWarnings = new OpenLayers.Layer.Vector("NWS Tornado Warnings",{projection: "EPSG:4326",styleMap:styleMapBlank,displayInLayerSwitcher:false});
        map.addLayer(nwsTorWarnings);
	nwsTorWarnings.setVisibility(false);
	var nwsSvrWarnings = new OpenLayers.Layer.Vector("NWS Svr. T-Storm Warnings",{projection: "EPSG:4326",styleMap:styleMapBlank,displayInLayerSwitcher:false});
        map.addLayer(nwsSvrWarnings);
	nwsSvrWarnings.setVisibility(false);
	var nwsWarnings = new OpenLayers.Layer.Vector("NWS Warnings",{projection: "EPSG:4326",displayInLayerSwitcher:false,styleMap:styleMapLine});
        map.addLayer(nwsWarnings);
	var background_area = new OpenLayers.Layer.Vector("Prelim. Background Contours",{projection: "EPSG:4326",styleMap:styleMapBackground,displayInLayerSwitcher:false,rendererOptions: {zIndexing: true}});
	map.addLayer(background_area);
	var background_area_null = new OpenLayers.Layer.Vector("Prelim. Background Contours",{projection: "EPSG:4326",styleMap:styleMapBackground,displayInLayerSwitcher:false,rendererOptions: {zIndexing: true}});
	var activeProbs = new OpenLayers.Layer.Vector("Background Contours",{projection: "EPSG:4326",styleMap:styleMapBackground,displayInLayerSwitcher:false,rendererOptions: {zIndexing: true}});
	var activeProbsShow = new OpenLayers.Layer.Vector("Background Contours",{projection: "EPSG:4326",styleMap:styleMapBackgroundLabel,displayInLayerSwitcher:false,rendererOptions: {zIndexing: true}});
        map.addLayer(activeProbsShow);
	var background_line = new OpenLayers.Layer.Vector("Prelim. Background Contours",{projection: "EPSG:4326",styleMap:styleMapBackground,displayInLayerSwitcher:false,rendererOptions: {zIndexing: true}});
        map.addLayer(background_line);
	//map.addLayer(gstreets);
        var radar_sites = new OpenLayers.Layer.Vector('Radar Sites',{styleMap:styleMapSite,isBaseLayer: false, displayInLayerSwitcher:true, rendererOptions: {zIndexing: true}});
	map.addLayer(radar_sites);
	var trackPoints = new OpenLayers.Layer.Vector('Track Points',{styleMap:styleMapTrackPoint,isBaseLayer: false, displayInLayerSwitcher:false,rendererOptions: {zIndexing: true}});
	map.addLayer(trackPoints);
	var boreLine = new OpenLayers.Layer.Vector('Bore Line',{projection: "EPSG:4326",styleMap:styleMapBackground,isBaseLayer: false, displayInLayerSwitcher:false,rendererOptions: {zIndexing: true}});
        map.addLayer(boreLine);
	var borePoints = new OpenLayers.Layer.Vector('Bore Points',{styleMap:styleMapTrackPoint,isBaseLayer: false, displayInLayerSwitcher:false,rendererOptions: {zIndexing: true}});
        map.addLayer(borePoints);

	// Legacy Warning Polygons layer
        var refreshLegacy = new OpenLayers.Strategy.Refresh({ force: true, active: true });
        var legacyStrategies = [new OpenLayers.Strategy.Fixed(), refreshLegacy];
        var legacyProtocol =  new OpenLayers.Protocol.HTTP({
                url: "realtime/ewp/blank.json",
                format: new OpenLayers.Format.GeoJSON()
        });
	var legacyBack = new OpenLayers.Layer.Vector('Legacy Warning/Adv Polygons',{
                projection: "EPSG:4326",
                styleMap: styleMapLegacyBack,
                isBaseLayer: false, 
                displayInLayerSwitcher: false,
               	visibility: true,
        });
	map.addLayer(legacyBack);
       	var legacy = new OpenLayers.Layer.Vector('Legacy Warning/Adv Polygons',{
                projection: "EPSG:4326",
                styleMap: styleMapLegacy,
                isBaseLayer: false, 
                displayInLayerSwitcher: true,
                strategies: legacyStrategies,
                visibility: true,
                protocol: legacyProtocol
        });
       	map.addLayer(legacy);
	legacy.events.register("featuresadded",legacy,function(){
		legacyFeaturesBack = [];
                for(var i=0;i<legacy.features.length;i++){
			legacyFeaturesBack.push(legacy.features[i].clone());
               	}
               	legacyBack.removeAllFeatures();
                legacyBack.addFeatures(legacyFeaturesBack);		
	});

	// NLDN layer
	var refreshNLDN = new OpenLayers.Strategy.Refresh({ force: true, active: true });
       	var nldnStrategies = [new OpenLayers.Strategy.Fixed(), refreshNLDN];
       	var nldnProtocol =  new OpenLayers.Protocol.HTTP({
               	url: "realtime/ewp/blank.json",
               	format: new OpenLayers.Format.GeoJSON()
       	});
       	var nldn = new OpenLayers.Layer.Vector('NLDN CG Strikes',{
               	projection: "EPSG:4326",
               	styleMap: styleMapNLDN,
               	isBaseLayer: false, 
                displayInLayerSwitcher: true,
               	strategies: nldnStrategies,
                visibility: false,
               	protocol: nldnProtocol
        });
        map.addLayer(nldn);

	// lightning Objects layers
        var lightningObjectsBack = new OpenLayers.Layer.Vector("Lightning Objects Background",{
                styleMap:styleMapThreat4,
                displayInLayerSwitcher:false
        });
        map.addLayer(lightningObjectsBack);

        var lightningObjects = new OpenLayers.Layer.Vector("Lightning Objects",{
                styleMap: styleMapThreat3_3,
                displayInLayerSwitcher: false,
                visibility: true
        });
        map.addLayer(lightningObjects);

        var refreshlightning = new OpenLayers.Strategy.Refresh({ force: true, active: true });
        var lightningStrategies = [new OpenLayers.Strategy.Fixed(), refreshlightning];
        var lightningProtocol =  new OpenLayers.Protocol.HTTP({
                url: "realtime/ewp/blank.json",
                format: new OpenLayers.Format.GeoJSON()
        });
        var lightning = new OpenLayers.Layer.Vector('Lightning',{
                projection: "EPSG:4326",
                styleMap: styleMapNull,
                isBaseLayer: false, 
                displayInLayerSwitcher: false,
                strategies: lightningStrategies,
                visibility: true,
                protocol: lightningProtocol
        });
        map.addLayer(lightning);
        lightning.events.register("refresh",lightning,function(){
                checkProbLayerCount();
        });
        lightning.events.register("featuresadded",lightning,function(){
                // interpolate base on time
                lightningFeatures = [];
                lightningFeaturesBack = [];
                for(var i=0;i<lightning.features.length;i++){
                        renderObjects(lightning.features[i].clone(), now, lightningFeatures, lightningFeaturesBack);
                }
                lightningObjects.removeAllFeatures();
                lightningObjectsBack.removeAllFeatures();
                lightningObjects.addFeatures(lightningFeatures);
                lightningObjectsBack.addFeatures(lightningFeaturesBack);
                getActiveCounts();
        });

	// lightning Objects layers
        var probSevereObjectsBack = new OpenLayers.Layer.Vector("ProbSevere Objects Background",{
                styleMap:styleMapThreat4,
                displayInLayerSwitcher:false
        });
        map.addLayer(probSevereObjectsBack);

        var probSevereObjects = new OpenLayers.Layer.Vector("ProbSevere Objects",{
                styleMap: styleMapThreat3_3,
                displayInLayerSwitcher: false,
                visibility: true
        });
        map.addLayer(probSevereObjects);

        var refreshProbSevere = new OpenLayers.Strategy.Refresh({ force: true, active: true });
        var probSevereStrategies = [new OpenLayers.Strategy.Fixed(), refreshProbSevere];
        var probSevereProtocol =  new OpenLayers.Protocol.HTTP({
                url: "realtime/ewp/ewpProbs.php",
                format: new OpenLayers.Format.GeoJSON()
        });
        var probSevere = new OpenLayers.Layer.Vector('ProbSevere',{
                projection: "EPSG:4326",
                styleMap: styleMapNull,
                isBaseLayer: false, 
                displayInLayerSwitcher: false,
                strategies: probSevereStrategies,
                visibility: true,
                protocol: probSevereProtocol
        });
        map.addLayer(probSevere);
	probSevere.events.register("refresh",probSevere,function(){
		checkProbLayerCount();
	});
	probSevere.events.register("featuresadded",probSevere,function(){
                // interpolate base on time
                probSevereFeatures = [];
                probSevereFeaturesBack = [];
                for(var i=0;i<probSevere.features.length;i++){
                        renderObjects(probSevere.features[i].clone(), now, probSevereFeatures, probSevereFeaturesBack);
                }
		probSevereObjects.removeAllFeatures();
                probSevereObjectsBack.removeAllFeatures();
                probSevereObjects.addFeatures(probSevereFeatures);
                probSevereObjectsBack.addFeatures(probSevereFeaturesBack);
		getActiveCounts();
        });

	// azShear objects layers
	var azShearObjectsBack = new OpenLayers.Layer.Vector("AzShear Objects Background",{
                styleMap:styleMapThreat4,
                displayInLayerSwitcher:false
        });
        map.addLayer(azShearObjectsBack);

	var azShearObjects = new OpenLayers.Layer.Vector("AzShear Objects",{
                styleMap: styleMapThreat3_3,
                displayInLayerSwitcher: false,
                visibility: true
        });
        map.addLayer(azShearObjects);

	var refreshAzShear = new OpenLayers.Strategy.Refresh({ force: true, active: true });
       	var azShearStrategies = [new OpenLayers.Strategy.Fixed(), refreshAzShear];
        var azShearProtocol =  new OpenLayers.Protocol.HTTP({
                url: "realtime/ewp/ewpProbs.php",
                format: new OpenLayers.Format.GeoJSON()
        });
        var azShear = new OpenLayers.Layer.Vector('AzShear',{
                projection: "EPSG:4326",
                styleMap: styleMapNull,
                isBaseLayer: false, 
                displayInLayerSwitcher: false,
                strategies: azShearStrategies,
                visibility: true,
                protocol: azShearProtocol
        });
        map.addLayer(azShear);
	azShear.events.register("refresh",azShear,function(){
		checkProbLayerCount();
	});
	azShear.events.register("featuresadded",azShear,function(){
		// interpolate base on time
                azShearFeatures = [];
		azShearFeaturesBack = [];
                for(var i=0;i<azShear.features.length;i++){
                        renderObjects(azShear.features[i].clone(), now, azShearFeatures, azShearFeaturesBack);
                }
		azShearObjects.removeAllFeatures();
                azShearObjectsBack.removeAllFeatures();
                azShearObjects.addFeatures(azShearFeatures);
		azShearObjectsBack.addFeatures(azShearFeaturesBack);
		getActiveCounts();
	});

	// WoF objects layers
        var wofObjectsBack = new OpenLayers.Layer.Vector("WoF Objects Background",{
                styleMap:styleMapNull,
                displayInLayerSwitcher:false
        });
        map.addLayer(wofObjectsBack);

	var wofObjects = new OpenLayers.Layer.Vector("WoF Objects",{
                styleMap: styleMapWofObjects,
                //stypeMap: styleMapPoly,
		displayInLayerSwitcher: false,
                visibility: true
        });
        map.addLayer(wofObjects);

	var wofTracksBack = new OpenLayers.Layer.Vector("WoF Tracks Background",{
                styleMap:styleMapNull,
                displayInLayerSwitcher:false
        });
        map.addLayer(wofTracksBack);

	var wofTracks = new OpenLayers.Layer.Vector("WoF Tracks",{
                styleMap: styleMapWofTracks,
                displayInLayerSwitcher: false,
                visibility: true
        });
        map.addLayer(wofTracks);

        var refreshWof1 = new OpenLayers.Strategy.Refresh({ force: true, active: true });
        var wofStrategies1 = [new OpenLayers.Strategy.Fixed(), refreshWof1];
        var wofProtocol1 =  new OpenLayers.Protocol.HTTP({
                url: "wof.php",
                format: new OpenLayers.Format.GeoJSON()
        });
        var wof1 = new OpenLayers.Layer.Vector('WoF',{
                projection: "EPSG:4326",
                styleMap: styleMapNull,
                isBaseLayer: false, 
                displayInLayerSwitcher: false,
                strategies: wofStrategies1,
                visibility: true,
                protocol: wofProtocol1
        });
        map.addLayer(wof1);
        wof1.events.register("refresh",wof1,function(){
                checkProbLayerCount();
        });
        wof1.events.register("featuresadded",wof1,function(){
		loadWoFViz();
		/*
                // interpolate base on time
                wofTracksFeatures = [];
                wofTracksFeaturesBack = [];
		if(showW){
	                renderWoFObjects(wof1.features, now, wofTracksFeatures, wofTracksFeaturesBack);
		}
                wofTracks.removeAllFeatures();
                //wofTracksBack.removeAllFeatures();
                //wofTracks.addFeatures(wof1.features);
		wofTracks.addFeatures(wofTracksFeatures);
                //wofTracksBack.addFeatures(wofFeaturesBack1);
                //getActiveCounts();
		//console.log(wofTracksFeatures);
		*/
        });

	/*
	var refreshWof2 = new OpenLayers.Strategy.Refresh({ force: true, active: true });
        var wofStrategies2 = [new OpenLayers.Strategy.Fixed(), refreshWof2];
        var wofProtocol2 =  new OpenLayers.Protocol.HTTP({
                url: "wof.php",
                format: new OpenLayers.Format.GeoJSON()
        });
        var wof2 = new OpenLayers.Layer.Vector('WoF',{
                projection: "EPSG:4326",
                styleMap: styleMapNull,
                isBaseLayer: false, 
                displayInLayerSwitcher: false,
                strategies: wofStrategies2,
                visibility: true,
                protocol: wofProtocol2
        });
        map.addLayer(wof2);
        wof2.events.register("refresh",wof2,function(){
                checkProbLayerCount();
        });
	wof2.events.register("featuresadded",wof2,function(){
                wofTracks.removeAllFeatures();
                wofTracksBack.removeAllFeatures();
		wofTracksFeatures = [];
		wofTracksFeaturesBack = [];
		//renderWoFObjects(wof1.features, now, wofTracksFeatures, wofTracksFeaturesBack);
		for(var i=0;i<wof2.features.length;i++){
			wofTracksFeatures.push(wof2.features[i].clone());
		}
                wofTracks.addFeatures(wofTracksFeatures);
                //wofObjectsBack.addFeatures(wofTracksFeaturesBack);
		
		//getActiveCounts();
        });	
	*/

	var refreshLSRs = new OpenLayers.Strategy.Refresh({ force: true, active: true });
       	var lsrStrategies = [new OpenLayers.Strategy.Fixed(), refreshLSRs];
       	var lsrProtocol =  new OpenLayers.Protocol.HTTP({
               	url: "realtime/ewp/history/reports/blank.json",
               	format: new OpenLayers.Format.GeoJSON()
        });
        var lsrs = new OpenLayers.Layer.Vector('LSRs',{
               	projection: "EPSG:4326",
                styleMap: styleMapPoint2,
               	isBaseLayer: false, 
                displayInLayerSwitcher: false,
                strategies: lsrStrategies,
                visibility: false,
                protocol: lsrProtocol
        });
        map.addLayer(lsrs);
	lsrs.events.register("featuresadded",lsrs,function(){
		genHistory(objIDLast, objTypeLast, objTitleLast, objUnitsLast, objKeyLast);
		objIDLast2 = objIDLast;
	});

	var refreshObs = new OpenLayers.Strategy.Refresh({ force: true, active: true });
	var obsStrategies = [new OpenLayers.Strategy.Fixed(), refreshObs];
	var obsProtocol =  new OpenLayers.Protocol.HTTP({
		url: "realtime/efp/obs/20150120/metars__obs_201501200000.txt",
		format: new OpenLayers.Format.GeoJSON()
	});
	var sfcObs = new OpenLayers.Layer.Vector('METAR Observations',{
		projection: "EPSG:4326",
		styleMap: styleMapPoint4,
		isBaseLayer: false, 
		displayInLayerSwitcher: true,
		strategies: obsStrategies,
		visibility: false,
		protocol: obsProtocol
	});
        map.addLayer(sfcObs);

	var refreshSPC = new OpenLayers.Strategy.Refresh({ force: true, active: true });
        var SPCStrategies = [new OpenLayers.Strategy.Fixed(), refreshSPC];
       	var SPCProtocol =  new OpenLayers.Protocol.HTTP({
                url: "realtime/efp/spc.php?d=201404281200&type=CATEGORICAL&day=1",
                format: new OpenLayers.Format.GeoJSON()
        });
        var spc = new OpenLayers.Layer.Vector('SPC Day 1 Outlooks',{
                projection: "EPSG:4326",
                styleMap: styleMapSPC,
                isBaseLayer: false, 
                displayInLayerSwitcher: true,
                strategies: SPCStrategies,
		visibility: false,
                protocol: SPCProtocol
        });
        map.addLayer(spc);

	var refreshNSSL = new OpenLayers.Strategy.Refresh({ force: true, active: true });
        var NSSLStrategies = [new OpenLayers.Strategy.Fixed(), refreshNSSL];
        var NSSLProtocol =  new OpenLayers.Protocol.HTTP({
                url: "realtime/efp/efpProbs.php?d=201404281200&type=svr&org=nssl",
                format: new OpenLayers.Format.GeoJSON()
        });
        var nsslOutlooks = new OpenLayers.Layer.Vector('EFP NSSL Outlooks',{
                projection: "EPSG:4326",
                styleMap: styleMapSPC,
                isBaseLayer: false, 
                displayInLayerSwitcher: true,
                strategies: NSSLStrategies,
                visibility: false,
                protocol: NSSLProtocol
        });
        map.addLayer(nsslOutlooks);
	nsslOutlooks.events.register("visibilitychanged",nsslOutlooks,function(){
		loadEFPNSSL();
	});

	var refreshSPCTorn1hr = new OpenLayers.Strategy.Refresh({ force: true, active: true });
        var SPCTorn1hrStrategies = [new OpenLayers.Strategy.Fixed(), refreshSPCTorn1hr];
        var SPCTorn1hrProtocol =  new OpenLayers.Protocol.HTTP({
                url: "realtime/efp/efpProbs.php?d=201404281200&type=torn1hr&org=spc",
                format: new OpenLayers.Format.GeoJSON()
        });
        var SPCTorn1hrOutlooks = new OpenLayers.Layer.Vector('EFP SPC Hourly Tornado Outlooks',{
                projection: "EPSG:4326",
                styleMap: styleMapSPC,
                isBaseLayer: false, 
                displayInLayerSwitcher: true,
                strategies: SPCTorn1hrStrategies,
                visibility: false,
                protocol: SPCTorn1hrProtocol
        });
        map.addLayer(SPCTorn1hrOutlooks);
	SPCTorn1hrOutlooks.events.register("visibilitychanged",SPCTorn1hrOutlooks,function(){
                loadEFPSPCTorn1hr();
        });


	var refreshSPCTorn = new OpenLayers.Strategy.Refresh({ force: true, active: true });
        var SPCTornStrategies = [new OpenLayers.Strategy.Fixed(), refreshSPCTorn];
        var SPCTornProtocol =  new OpenLayers.Protocol.HTTP({
                url: "realtime/efp/efpProbs.php?d=201404281200&type=torn&org=spc",
                format: new OpenLayers.Format.GeoJSON()
        });
        var SPCTornOutlooks = new OpenLayers.Layer.Vector('EFP SPC Tornado Outlooks',{
                projection: "EPSG:4326",
                styleMap: styleMapSPC,
                isBaseLayer: false, 
                displayInLayerSwitcher: true,
                strategies: SPCTornStrategies,
                visibility: false,
                protocol: SPCTornProtocol
        });
        map.addLayer(SPCTornOutlooks);
	SPCTornOutlooks.events.register("visibilitychanged",SPCTornOutlooks,function(){
                loadEFPSPCTorn();
        });

	var refreshSPCHail = new OpenLayers.Strategy.Refresh({ force: true, active: true });
        var SPCHailStrategies = [new OpenLayers.Strategy.Fixed(), refreshSPCHail];
        var SPCHailProtocol =  new OpenLayers.Protocol.HTTP({
                url: "realtime/efp/efpProbs.php?d=201404281200&type=hail&org=spc",
                format: new OpenLayers.Format.GeoJSON()
        });
        var SPCHailOutlooks = new OpenLayers.Layer.Vector('EFP SPC Hail Outlooks',{
                projection: "EPSG:4326",
                styleMap: styleMapSPC,
                isBaseLayer: false, 
                displayInLayerSwitcher: true,
                strategies: SPCHailStrategies,
                visibility: false,
                protocol: SPCHailProtocol
        });
        map.addLayer(SPCHailOutlooks);
	SPCHailOutlooks.events.register("visibilitychanged",SPCHailOutlooks,function(){
                loadEFPSPCHail();
        });

	var refreshSPCWind = new OpenLayers.Strategy.Refresh({ force: true, active: true });
        var SPCWindStrategies = [new OpenLayers.Strategy.Fixed(), refreshSPCWind];
        var SPCWindProtocol =  new OpenLayers.Protocol.HTTP({
                url: "realtime/efp/efpProbs.php?d=201404281200&type=wind&org=spc",
                format: new OpenLayers.Format.GeoJSON()
        });
        var SPCWindOutlooks = new OpenLayers.Layer.Vector('EFP SPC Wind Outlooks',{
                projection: "EPSG:4326",
                styleMap: styleMapSPC,
                isBaseLayer: false, 
                displayInLayerSwitcher: true,
                strategies: SPCWindStrategies,
                visibility: false,
                protocol: SPCWindProtocol
        });
        map.addLayer(SPCWindOutlooks);
	SPCWindOutlooks.events.register("visibilitychanged",SPCWindOutlooks,function(){
                loadEFPSPCWind();
        });

	// reset layer z indexes
	function setLayerIndexes(){
                swaths.setZIndex(999);
                activeThreats.setZIndex(999);
                threat_points.setZIndex(999);
                threat_lines.setZIndex(999);
                threat_area.setZIndex(999);
                ndfd_grid.setZIndex(4);
		radar_sites.setZIndex(4);
		//blank.setZIndex(0);
		//gstreets.setZIndex(3);
		//kmeans_objects.setZIndex(999);
		if(archive){
                	//torTracks.setZIndex(999);
		}
		if(map.layers.indexOf(modelLayer) != -1){
			modelLayer.setZIndex(200);
                }
		//if(radarImageLast != ''){
		//	eval(radarImageLast + '.setZIndex(1)');
		//}
        }

	function changeBlank(){
		//map.removeControl(scalebar);
		//scalebar.destroy();
		if(modifyFeature2.feature){
			modifyFeature2.unselectFeature(modifyFeature2.feature);
		}
		if(blank.getVisibility()){
			if(acase != 'ncp'){
	                        cwa_layer.styleMap = styleMapCWAs2;
	                        counties_layer.styleMap = styleMapCounties2;
				counties_layer.setVisibility(true);
				counties_layer.redraw();
				cwa_layer.redraw();
			}
                        //gstreets.setVisibility(false);
			states.setVisibility(true);
			states.styleMap = styleMapStates2;
			background_area.styleMap = styleMapBackground2;
			threat_points.styleMap = styleMapPoint3;
                }
                else{
			if(acase != 'ncp'){
                        	cwa_layer.styleMap = styleMapCWAs;
                        	counties_layer.styleMap = styleMapCounties;
				counties_layer.setVisibility(false);
				counties_layer.redraw();
				cwa_layer.redraw();
                        }
			//gstreets.setVisibility(true);
			states.setVisibility(false);
                        states.styleMap = styleMapStates;
			background_area.styleMap = styleMapBackground;
			threat_points.styleMap = styleMapPoint;
                }
		modifyFeature2.destroy();
		modifyFeature2 = new OpenLayers.Control.ModifyFeature(background_area,{
	                vertexRenderIntent: "modification",
	                onModification: connectLines,
	                onModificationStart: editContourOn,
	                onModificationEnd: editContourOff
	        });
		map.addControl(modifyFeature2);
		//document.getElementsByClassName('olControlScaleBar').color = "#FFFFFF";
                //document.getElementsByClassName('olControlScaleBarBar').background = "#FFFFFF";
		//document.getElementsByClassName('olControlScaleBarBarAlt').background = "#FFFFFF";
		//document.getElementsByClassName('olControlScaleBarMarkerMajor').background = "#FFFFFF";
		//document.getElementsByClassName('olControlScaleBarMarkerMinor').background = "#FFFFFF";
		//scalebar = new OpenLayers.Control.ScaleBar();
	        //scalebar.displaySystem = 'english';
	        //scalebar.minWidth = 220;
	        //scalebar.maxWidth = 400;
	        //map.addControl(scalebar);
		states.redraw();
		threat_points.redraw();
		background_area.redraw();
                selectGrid();
		setLayerIndexes();
	}

	// register map events and properties
	map.events.register("click", map , function(e){
		if(acase == 'ncp'){
			return;
		}
                resetThreat('all');
                unhighlightThreat();
                selectGrid();
		displayPanel = Ext.getCmp('displayPanel');
		if(displayPanel.isVisible()){
			var position = this.events.getMousePosition(e);
			position = map.getLonLatFromPixel(position).transform(proj2,proj);
			document.getElementById('uLon').value = position.lon;
			document.getElementById('uLat').value = position.lat;
		}
		if(copyThreat){
			if(drawType == 'copy'){
				alert('No Threat Selected to Copy, try again!');
			}
			else{
				var position = this.events.getMousePosition(e);
				copyObjectEdit();
			}
		}
        });

	map.events.on({"zoomend": function(){
                //changeTime();
                //reLabelGrid();
		//selectGrid();
		//lightUpGridAccum2();
            }
        });

	map.events.register("mousemove", map, function(e) {
		pos = this.events.getMousePosition(e);
		pos = map.getLonLatFromPixel(pos).transform(proj2,proj)
                var position = formatLatLon(pos);
		if(!position){
			return;
		}
                document.getElementById("mapCoords").innerHTML = position;
        });

	map.events.on({"moveend": function(){
                changeTime();
            }
        });

        map.Z_INDEX_BASE['Popup'] = 10000;
	map.panMethod = null;

	// primary function to data to map panel after User/Case is selected
	function loadMap(){

	        if(win){
			invalid = [' ','&','$','%','#','@','!','*','^','(',')','_','-','EWP9','EWP10','EWP11','EWP12','EWP13','EWP14','PHI'];
			if(document.getElementById('userSelect').value == ''){
                                alert('No Username Given!');
                                return;
                        }
			/*
			else if(document.getElementById('userSelect').value != 'Karstens'){
				if(document.getElementById('userSelect').value != 'Harrison'){
					return;
				}
			}
			*/
			for(i=0;i<invalid.length;i++){
				if(document.getElementById('userSelect').value.indexOf(invalid[i]) != -1){
					alert('Invalid character used in username, try again.');
					return;
				}
			}
			user = document.getElementById('userSelect').value;
			acase = document.getElementById('caseSelect').value;
			site = document.getElementById('siteSelect').value;
			opMode = document.getElementById('opMode').value;

			if(user != 'Karstens'){
                                //return;
                       	}

			// check if time log exists
			if(opMode == 'archive'){
				link = 'getArchiveTime.php?user=' + user + '&case=' + acase + '&site=' + site;
		                var dataRequest = new XMLHttpRequest();
		               	dataRequest.open('GET', link, false);
		               	dataRequest.send();
				tCheck = dataRequest.responseText;
				if(tCheck != 'none'){
					msg = 'Restore previous session (OK) or delete everything and start new (Cancel)?';
					var proceed = confirm(msg);
			               	if(!proceed){
						win.destroy();
			                       	win = null;
		                                //link = 'setArchiveTime.php?user=' + user + '&case=' + acase + '&site=' + site + '&inTime=' + (parseInt((new Date()) / 1000));
		                                //var dataRequest = new XMLHttpRequest();
		                                //dataRequest.open('GET', link, false);
		                                //dataRequest.send();
						if(acase == 'ncp'){
			 	                        loadNCP();
				                }
				                else{
							// delete old objects
                                                        link = 'delete_all_threats.php?case=' + acase + '&user=' + user;
                                                        var dataRequest = new XMLHttpRequest();
                                                        dataRequest.open('GET', link, false);
                                                        dataRequest.send();

				                       	loadWFO();
				                }
						logTime = parseInt((new Date()) / 1000);
						var caseTime = caseStartTimes[acase] / 1000;
						if(Math.abs(logTime - caseTime) < 86400){
	                                               	//logTime = caseTime; // use for DRTs in HWT
	                                               	startPause = true; // DRT mode in HWT
	                                               	console.log('Starting paused...');
	                                       	}
						var url = 'recordTime.php?user=' + user + '&case=' + acase + '&site=' + site + '&inTime=' + logTime;
	                                        var dataRequest = new XMLHttpRequest();
	                                       	dataRequest.open('GET', url, false);
	                                       	dataRequest.send();
			                       	return;
			               	}
					logTime = parseInt(tCheck);
				}
				else{
					logTime = parseInt((new Date()) / 1000); // pull cpu time, use for anything running in real-time
					var caseTime = caseStartTimes[acase] / 1000;
					if(Math.abs(logTime - caseTime) < 86400){
						//logTime = caseTime; // use for DRTs in HWT
						startPause = true; // DRT mode in HWT
						console.log('Starting paused...');
					}
					var url = 'recordTime.php?user=' + user + '&case=' + acase + '&site=' + site + '&inTime=' + logTime;
			                var dataRequest = new XMLHttpRequest();
                			dataRequest.open('GET', url, false);
                			dataRequest.send();
				}
			}

			win.destroy();
			win = null;
	        }

		if(acase == 'ncp'){
			loadNCP();
                }
                else{
			loadWFO();
		}
	}

	function loadWFO(){
		// set archive mode
		if(opMode == 'archive'){
                       	archive = true;
			floaterSites.push(site);
			if(acase == '20130805' || acase == '20120613'){
				kmeans = true;
			}
                }
		else if(opMode == 'analysis'){
			archive = false;
			analysis = true;
			floaterSites.push(site);
		}
                else{
                       	archive = false;
			kmeans = true;
			field = 'Reflectivity';
			product = field;
			link = 'getUserId.php?user=' + user;
	               	var dataRequest = new XMLHttpRequest();
	                dataRequest.open('GET', link, false);
	                dataRequest.send();
	                id = parseInt(dataRequest.responseText);
                }

		// get CWA and Counties Polygons
		loadCounties();
		loadCWA();

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
		if(archive || analysis){
			link = 'getSiteCoordsFloater.php?site=' + site;
	               	var dataRequest = new XMLHttpRequest();
	               	dataRequest.open('GET', link, false);
	               	dataRequest.send();
	               	var coords = dataRequest.responseText.split(",");
	               	boundsSWLon2 = coords[0];
	               	boundsSWLat2 = coords[1];
	               	boundsNELon2 = coords[2];
	               	boundsNELat2 = coords[3];
			floaterBounds = new OpenLayers.Bounds(boundsSWLon2,boundsSWLat2,boundsNELon2,boundsNELat2).transform(proj,proj2);
		}
		//floaterBounds = new OpenLayers.Bounds(floaterBoundsSWLon,floaterBoundsSWLat,floaterBoundsNELon,floaterBoundsNELat).transform(proj,proj2);
		//map.setOptions({restrictedExtent: bounds});

		specialCases = ['20130520','20110524'];
		if(archive){
			/*
			// for now, blow away all previously data generated by user
			// if not, when reloading, it could freeze the browser
			link = 'delete_all_threats.php?case=' + acase + '&user=' + user;
	               	var dataRequest = new XMLHttpRequest();
	               	dataRequest.open('GET', link, false);
	               	dataRequest.send();
			*/
			if(specialCases.indexOf(acase) != -1){
				bounds = new OpenLayers.Bounds(-99.278,33.308,-95.278,37.308).transform(proj,proj2);
			}
		}

		specialConfig();
	        setHTML();

	        var viewport = Ext.create('Ext.Viewport', {
	            layout: 'border',
	            html: mainHTML,
	            items:[{
	               	region: 'west',
	               	title: 'Hazard Information',
			id: 'threatsPanel',
	               	split: true,
	               	width: 525,
	               	minWidth: 525,
	               	collapsible: true,
	               	margin: '30 0 0 5',
			listeners: {
			    resize: function(){
				map.updateSize();
			    },
			    hide: function(){
				map.updateSize();
			    },
			    show: function(){
				map.updateSize();
			    },
			    collapse: function(){
				map.updateSize();
			    },
			    expand: function(){
				map.updateSize();
			    }
			},
	               	items: [{
	                    extend: 'Ext.tab.Panel',
	                    xtype: 'tabpanel',
			    id: 'tabPanel',
	                    activeTab: 0,
	                    border: false,
			    height: window.innerHeight - 275,
			    layout: 'fit',
	                    padding: '0 0 0 0',
	                    items:[{
	                       	title: 'PHI Configuration',
	                        border: false,
				id: 'threatPanel',
				layout: 'fit',
				autoScroll: true,
	                       	html: threatTabHTML,
				listeners:{
                                    afterrender: function(dv, record, item, index, e){
					if(modifyFeature != null && modifyFeature.feature != null){
						//modifyThreat(false);
					}
                                    }
                                }
			    },{
                                title: 'Object History',
                                border: false,
                                //xtype: 'tabpanel',
                                id: 'historyPanel',
                                html: historyTabHTML,
                                layout: 'fit',
				autoScroll: true,
                                listeners:{
                                    afterrender: function(dv, record, item, index, e){
                                        //renderWoFTab();
                                    }
                                }
	               	    },{
                                title: 'WoF',
                                border: false,
                                //xtype: 'tabpanel',
                                id: 'wofPanel',
                                html: wofTabHTML,
                                layout: 'fit',
                                listeners:{
                                    afterrender: function(dv, record, item, index, e){
					renderWoFTab();
                                    }
                                }
			    },{
	                        title: 'PHI Output',
	                        border: false,
				//xtype: 'tabpanel',
				id: 'displayPanel',
	                       	html: displayTabHTML,
				layout: 'fit',
				listeners:{
				    afterrender: function(dv, record, item, index, e){
					//renderGridSlider();
					renderWarningTabs();
				    }
				}
	               	    },{
				title: 'Legend',
                                border: false,
                                id: 'legendPanel',
                                html: legendTabHTML,
                                layout: 'fit'
			    }],
			    listeners: {
				    tabchange: function(tabPanel, newTab) {
					if(newTab.id == 'threatPanel'){
	                                        if(modifyFeature != null && modifyFeature.feature != null){
	                                                modifyThreat(false);
	                                        }
                                        	//else if(chartFeature != null){
                                        	//       	genHistory(chartFeature, objTypeLast, objTitleLast, objUnitsLast, objKeyLast);
                                        	//}
					}
					else if(newTab.id == 'historyPanel' && chartFeature != null){
						genHistory(chartFeature, objTypeLast, objTitleLast, objUnitsLast, objKeyLast);
					}
                                    }
			    }
	               	}]
	            },{
	               	region: 'center',
	               	margin: '30 60 0 0',
	                html: mapHTML,
			listeners:{
                            afterrender: function(dv, record, item, index, e){
                                renderRadarOpacitySlider();
				renderProbSlider();
				if(showW){
					document.getElementById('autoProbType').selectedIndex = 2;
				}
				if(showL){
                                        document.getElementById('autoProbType').selectedIndex = 1;
                                }
                       	    }
                       	}
	            },{
	               	region: 'south',
	               	title: 'Hazard Services Console',
			id: 'hPanel',
	               	margin: '0 5 5 5',
	               	split: true,
	               	height:200,
	                collapsible: true,
			listeners: {
                            resize: function(){
                               	map.updateSize();
				hPanel = Ext.getCmp('hPanel');
		               	tabPanel = Ext.getCmp('tabPanel');
		                tabPanel.setHeight(window.innerHeight - hPanel.getHeight() - 66);
                            },
                            hide: function(){
                               	map.updateSize();
				hPanel = Ext.getCmp('hPanel');
                                tabPanel = Ext.getCmp('tabPanel');
                                tabPanel.setHeight(window.innerHeight - hPanel.getHeight() - 66);
                            },
                            show: function(){
                               	map.updateSize();
				hPanel = Ext.getCmp('hPanel');
                                tabPanel = Ext.getCmp('tabPanel');
                                tabPanel.setHeight(window.innerHeight - hPanel.getHeight() - 66);
                            },
                       	    collapse: function(){
                               	map.updateSize();
				hPanel = Ext.getCmp('hPanel');
                                tabPanel = Ext.getCmp('tabPanel');
                                tabPanel.setHeight(window.innerHeight - hPanel.getHeight() - 66);
                       	    },
                       	    expand: function(){
                               	map.updateSize();
				hPanel = Ext.getCmp('hPanel');
                                tabPanel = Ext.getCmp('tabPanel');
                                tabPanel.setHeight(window.innerHeight - hPanel.getHeight() - 66);
                       	    }
                       	},
			layout: {
	                    type: 'table',
	                    columns: 2,
	                    tdAttrs: { style: 'padding: 3px;', valign:'top' }
	                },
	               	//html: temporalDisplayHTML
	                items: [{
	                    extend: 'Ext.Container',
	                    xtype: 'basic-panels',
	                    border: false,
	                    height: 30,
	                    width: 525,
			    layout: {
                               	type: 'table',
                               	tdAttrs: { valign:'top', align: 'center'}
                            },
			    html: '<div id="deactivate"></div>'
	                },{
	                    extend: 'Ext.Container',
	                    xtype: 'basic-panels',
	                    border: false,
	                    height: 30,
	                    layout: {
	                        type: 'table',
	                        tdAttrs: { valign:'top', align: 'center'}
	                    },
	                    html: timeButtons
	               	},{
			    extend: 'Ext.Container',
                            xtype: 'basic-panels',
                            border: false,
			    width: 525,
                            height: 525,
			    autoscroll: false,
                            layout: {
                                type: 'table',
                                tdAttrs: { valign:'top'}
                            },
                            html: '<span id="gridDiv"></span>'
			},{
	                    extend: 'Ext.Container',
	                    xtype: 'basic-panels',
	                    border: false,
	                    height: 525,
	               	    id: 'timeDiv',
	               	    autoScroll: true,
	                    layout: {
	                        type: 'table',
	                        tdAttrs: { valign:'top'}
	                    },
	                    html: timePanel
	               	}]
	            }]
	        });

		Ext.create('Ext.grid.Panel', {
                    store: threatStore,
		    id: 'gridPanel',
                    border: false,
		    allowDeselect: true,
                    width: 525,
		    forceFit: true,
                    columns: [{
                        text: 'ID',
                        width: 45,
                        height: 60,
                        //locked: true,
                        dataIndex: 'eventID',
			tdCls: 'x-cell'
                    },{
                        text: 'Hazard',
                        width: 65,
                        dataIndex: 'hazardType',
			tdCls: 'x-cell'
                    },{
                        text: 'State',
                        width: 65,
                        dataIndex: 'status'
                    },{
			text: 'Probability',
                        width: 70,
                        dataIndex: 'prob'
		    },{
                        text: 'Start Time',
                        width: 115,
                        dataIndex: 'startTime'
                    },{
                        text: 'End Time',
                        width: 115,
                        dataIndex: 'endTime'
		    },{
                       	text: 'Time Left',
                       	width: 110,
                        dataIndex: 'timeLeft',
                    }],
		    listeners: {
			select: function(dv, record, item, index, e){
			    // zoom to feature
			    //highlightThreat(record.get('issue'),'single');
			    innerHTML = '<input type="button" id="deactivateThreat" value="Deactivate Selected Threat" onClick="deactivateThreat();" />';
			    innerHTML += '<input type="button" id="copyThreat" value="Copy Selected Threat" onClick="copyThreatObject();" />';
			    if(archive){
				    //innerHTML += '<input type="button" id="deleteThreat" value="Delete Selected Threat" onClick="deleteThreat();" />';
				    //innerHTML += '<input type="button" id="deleteAllThreats" value="Delete All Threats" onClick="deleteAllThreats();" />';
			    }
			    //document.getElementById('deactivate').innerHTML = innerHTML;
			},
			deselect: function(dv, record, item, index, e){
				drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
			},
			itemdblclick: function(dv, record, item, index, e){
			    // edit active threat
			    //highlightThreat(record.get('issue'),'double');
                       	},
			sortchange: function(){
			    // redraw threat sliders
			    drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
			}
		    },
		    viewConfig: {
			stripeRows: false,
			trackOver: false,
			getRowClass: function(record, index) {
			    return setRowColor(record);
		        }
		    },
		    renderTo: 'gridDiv'
  	    	});


		//var store = threatStore.products();
		//gridPanel.getView().bindStore(store);

		document.getElementById('productsSelect').innerHTML = selectOptions;
		loadTimeCanvas();

		window.onresize = function(event){
                        //stage.setWidth(window.innerWidth - 524);
	       	}

		map.render('map');

                loadInit();
		if(analysis){

		}
		else{
			timerInt = setInterval(timer,1000);
		}

		link = 'getAllSitesCoords.php?sites=' + floaterSites;
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();
		siteCoords = dataRequest.responseText.split("\n");

		for(var im=0;im<siteCoords.length;im++){
			coords = siteCoords[im].split(',');
			if(floaterSites[im] == site){
				radar_site = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(parseFloat(coords[0]),parseFloat(coords[1])).transform(proj, proj2),{'sname':floaterSites[im],'color':'cyan'});

				// set center at radar site and set zoom elevation
			        var point = new OpenLayers.LonLat(parseFloat(coords[0]), parseFloat(coords[1]));
			        point.transform(proj, proj2);
				try{
				        map.setCenter(point, 9);
					clat = parseFloat(coords[1]);
		                        clon = parseFloat(coords[0]);
				}
				catch(err){
					clat = 40;
					clon = -95;
					//var point = new OpenLayers.LonLat(clon, clat);
		                       	//point.transform(proj, proj2);
        		                //map.setCenter(point, 5);
				}
                        }
			else{
				radar_site = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(parseFloat(coords[0]),parseFloat(coords[1])).transform(proj, proj2),{'sname':floaterSites[im],'color':'white'});
			}
			radar_sites.addFeatures([radar_site]);
                }
		keys = getKeys(data);
		if(keys.length > 0){
			//timeCanvasStart = parseInt(scans[0][0].split('_')[1]);
			//timeMin = parseInt(scans[0][0].split('_')[1]);
			timeCanvasStart = timeCanvasVal.getAttr('time') - 900;
			timeMin = timeCanvasVal.getAttr('time') - 900;
		}
		else{
			timeCanvasStart = parseInt((new Date()) / 1000);
			//timeMin = parseInt((new Date()) / 1000);
		}
		timeCanvasEnd = timeCanvasStart + 7200;
		if(!analysis){
			//timeCanvasNow.setAttr('time',(timeCanvasStart + timeCanvasEnd)/2);
			if(archive){
	                        //currentTime = parseInt((new Date() - initTime) / 1000) + parseInt(initArchiveTime) + logTime;
	                        var uTime = parseInt((new Date()) / 1000)
	                       	var currentTime = parseInt(initArchiveTimeOrig) + (uTime - logTime);
	                }
	                else{
	                        var currentTime = parseInt((new Date()) / 1000);
	               	}
	               	timeCanvasNow.setAttr('time',currentTime);
		}
		moveCurrentTime();
		drawTimeCanvas(timeCanvasStart,timeCanvasEnd);

	        //else{
			// real-time (if doing this, need to set times on time panel (currently nothing is done)
	        //        timeNow = new Date();
	        //        secsNow = parseInt(timeNow.getTime() / 1000);
	                //master_time_slider.setMinimum(parseInt(secsNow));
	                //master_time_slider.setMaximum(parseInt(secsNow + 7200));
	        //}
	
		selectGrid();
		//loadNWSWarnings();
		showWoF();
		changeScale(1);

		$('#chart1').bind('jqplotDragStart',
		        function (seriesIndex, pointIndex, pixelposition, data2) {
		                dragStart = true;
		        }
		);

		$('#chart1').bind('jqplotDragStop',
		        function (seriesIndex, pointIndex, pixelposition, data2) {
		                probChartDrag(seriesIndex, pointIndex, pixelposition, data2);
		        }
		);

		$('#chart1').bind('jqplotMouseMove',
		        function (ev, seriesIndex, pointIndex, data2) {
		                probChartMouseMove(ev, seriesIndex, pointIndex, data2);
		        }
		);

		$('#chart1').bind('jqplotMouseLeave',
                       	function (ev, seriesIndex, pointIndex, data2) {
				probInterp(ev, seriesIndex, pointIndex, data2);
                       	}
               	);

		$('#chart1').bind('jqplotMouseEnter',
                       	function (ev, seriesIndex, pointIndex, data2) {
                                //probInterp(ev, seriesIndex, pointIndex, data2);
				//if(!gridPreview){
				//	lightUpGridAccum2();
				//}
                       	}
                );

		$('#chart2').bind('jqplotDragStop',
		        function (seriesIndex, pointIndex, pixelposition, data) {
		                speedChartDrag(seriesIndex, pointIndex, pixelposition, data);
		        }
		);

		$('#chart3').bind('jqplotDragStart',
		        function (seriesIndex, pointIndex, pixelposition, data) {
		                dragging = true;
		        }
		);
		
		$('#chart3').bind('jqplotMouseMove',
		        function (seriesIndex, pointIndex, pixelposition, data) {
		                if(dragging){
		                        //dirChartDrag(seriesIndex, pointIndex, pixelposition, data);
	                }
			        }
		);
		
		$('#chart3').bind('jqplotDragStop',
		        function (seriesIndex, pointIndex, pixelposition, data) {
		                dragging = false;
		                dirChartDrag(seriesIndex, pointIndex, pixelposition, data);
		        }
		);

		$('#chart5').bind('jqplotDragStop',
		        function (seriesIndex, pointIndex, pixelposition, data) {
		                speedDeltaChartDrag(seriesIndex, pointIndex, pixelposition, data);
		        }
		);

		$('#chart6').bind('jqplotDragStop',
		  	function (seriesIndex, pointIndex, pixelposition, data) {
		        	dirDeltaChartDrag(seriesIndex, pointIndex, pixelposition, data);
		  	}
		);


		if(archive){
			// Tornado Tracks
			/*
		       	url = 'archive/' + acase + '/tracks.json';
		        torTracks = new OpenLayers.Layer.Vector('Tornado Tracks', {
		                projection: "EPSG:4326",
		                strategies: [new OpenLayers.Strategy.Fixed()],
		                styleMap: styleMapTracks,
		                protocol: new OpenLayers.Protocol.HTTP({
		                    url: url,
		                    format: new OpenLayers.Format.GeoJSON()
		                })
		            },
		            options
		        );
		        map.addLayer(torTracks);
		        torTracks.setVisibility(false);
			*/
		}
		else{
			//changeKmeansScale(1);
		}
		map.updateSize();
		loadingpanel = new OpenLayers.Control.LoadingPanel();
		map.addControl(loadingpanel);

		hPanel = Ext.getCmp('hPanel');
		tabPanel = Ext.getCmp('tabPanel');
               	tabPanel.setHeight(window.innerHeight - hPanel.getHeight() - 66);

		// set lat/lon
               	lon = map.getCenter().transform(proj2,proj).x;
                lat = map.getCenter().transform(proj2,proj).y;
               	//document.getElementById('uLon').value = lon;
               	//document.getElementById('uLat').value = lat;
               	//defineUserPoint();

		//readThreats('insert');
		if(analysis){
			loadAnalysisConfig();
		}
	}

	function loadNCP(){
		setNCPHTML();
		updateNCPOptions();

                var viewport = Ext.create('Ext.Viewport', {
                    layout: 'border',
                    html: mainHTML,
                    items:[{
                       	region: 'west',
                       	title: 'Hazard Information',
                       	split: true,
                       	width: 500,
                       	minWidth: 500,
                       	collapsible: true,
                       	margin: '30 0 0 5',
                        listeners: {
                       	    resize: function(){
                               	map.updateSize();
				if(obsMap){
					map2.updateSize();
				}
                            },
                       	    hide: function(){
                               	map.updateSize();
                                if(obsMap){
                                        map2.updateSize();
                                }
                            },
                            show: function(){
                               	map.updateSize();
                                if(obsMap){
                                        map2.updateSize();
                                }
                            },
                            collapse: function(){
                                map.updateSize();
                                if(obsMap){
                                        map2.updateSize();
                                }
                       	    },
                            expand: function(){
                               	map.updateSize();
                                if(obsMap){
                                        map2.updateSize();
                                }
                       	    }
                       	},
                        items: [{
                            extend: 'Ext.tab.Panel',
                            xtype: 'tabpanel',
                            activeTab: 0,
                            border: false,
                            height: window.innerHeight - 300,
                            layout: 'fit',
                            padding: '0 0 0 0',
                            items:[{
                                title: 'Probability Configuration',
                               	border: false,
                               	id: 'backgroundPanel',
                                layout: 'fit',
				autoScroll: true,
                                html: backgroundTabHTML
                            },{
                                title: 'Legend',
                                border: false,
                                id: 'displayPanel',
                                html: '<center><div id="legend"></div></center>',
                               	layout: 'fit',
                               	listeners:{
                                    afterrender: function(dv, record, item, index, e){
                                       	loadField();
                                    }
                                }
                            }]
                        }]
                    },{
                       	region: 'center',
                       	margin: '30 5 0 0',
                       	html: mapHTML,
			listeners:{
                            afterrender: function(dv, record, item, index, e){
                               	renderOpacitySlider();
                            }
                        }
                    },{
                       	region: 'south',
                       	title: 'Hazard Services Console',
                       	margin: '0 5 5 5',
                       	split: true,
                       	height:200,
                       	collapsible: true,
                        listeners: {
                       	    resize: function(){
                               	map.updateSize();
                                if(obsMap){
                                        map2.updateSize();
                                }
                            },
                       	    hide: function(){
                               	map.updateSize();
                                if(obsMap){
                                        map2.updateSize();
                                }
                            },
                            show: function(){
                               	map.updateSize();
                                if(obsMap){
                                        map2.updateSize();
                                }
                            },
                            collapse: function(){
                                map.updateSize();
                                if(obsMap){
                                        map2.updateSize();
                                }
                       	    },
                            expand: function(){
                               	map.updateSize();
                                if(obsMap){
                                        map2.updateSize();
                                }
                       	    }
                       	},
                        layout: {
                            type: 'table',
                            columns: 2,
                            tdAttrs: { style: 'padding: 3px;', valign:'top' }
                        },
                        //html: temporalDisplayHTML
                        items: [{
                            extend: 'Ext.Container',
                            xtype: 'basic-panels',
                            border: false,
                            height: 30,
                            width: 500,
                            layout: {
                                type: 'table',
                                tdAttrs: { valign:'top', align: 'center'}
                            },
                            html: '<div id="deactivate"></div>'
                        },{
                            extend: 'Ext.Container',
                            xtype: 'basic-panels',
                            border: false,
                            height: 30,
                            layout: {
                                type: 'table',
                                tdAttrs: { valign:'top', align: 'center'}
                            },
                            html: timeButtons
                        },{
                            extend: 'Ext.Container',
                            xtype: 'basic-panels',
                            border: false,
                            width: 500,
                            height: 500,
                            autoscroll: false,
                            layout: {
                               	type: 'table',
                               	tdAttrs: { valign:'top'}
                       	    },
                       	    html: '<span id="gridDiv"></span>'
                       	},{
                            extend: 'Ext.Container',
                       	    xtype: 'basic-panels',
                       	    border: false,
                       	    height: 500,
                       	    id: 'timeDiv',
                       	    autoScroll: true,
                       	    layout: {
                                type: 'table',
                       	        tdAttrs: { valign:'top'}
                            },
                            html: timePanel
                       	}]
                    }]
                });

                Ext.create('Ext.grid.Panel', {
                    renderTo: 'gridDiv',
                    store: threatStore,
                    id: 'gridPanel',
                    border: false,
                    allowDeselect: true,
                    width: 500,
		    forceFit: true,
                    columns: [{
			text: 'Show',
			xtype: 'checkcolumn',
                       	width: 40,
			height: 60,
                       	dataIndex: 'show',
			listeners:{
			    checkchange: function(column, recordIndex, checked){
				showNCPProbs(recordIndex, checked);
				changeTime();
			    }
			}
		    },{
                       	text: 'Event ID',
                        width: 100,
                        //locked: true,
                        dataIndex: 'eventID'
                    },{
                        text: 'Hazard Type',
                        width: 90,
                        dataIndex: 'hazardType'
                    },{
                        text: 'Start Time',
                        width: 135,
                        dataIndex: 'startTime'
                    },{
                        text: 'End Time',
                        width: 135,
                        dataIndex: 'endTime'
                    }],
                    listeners: {
                        select: function(dv, record, item, index, e){
                            // zoom to feature
                            //highlightThreat(record.get('issue'),'single');
                            //innerHTML = '<input type="button" id="deactivateThreat" value="Deactivate Selected Threat" onClick="deactivateThreat();" />';
                            if(archive){
                                    //innerHTML += '<input type="button" id="deleteThreat" value="Delete Selected Threat" onClick="deleteThreat();" />';
                                    //innerHTML += '<input type="button" id="deleteAllThreats" value="Delete All Threats" onClick="deleteAllThreats();" />';
                            }
                            //document.getElementById('deactivate').innerHTML = innerHTML;
                        },
                        deselect: function(dv, record, item, index, e){
                                document.getElementById('deactivate').innerHTML = '';
                        },
                        itemdblclick: function(dv, record, item, index, e){
                            // edit active threat
                       	    //highlightThreat(record.get('issue'),'double');
                       	},
                       	sortchange: function(){
                            // redraw threat sliders
                       	    drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
                       	} 
                    } 
                });

		initTime = new Date();
                initArchiveTime = parseInt((new Date()) / 1000);

		loadTimeCanvas();

		timeCanvasStart = parseInt((new Date()) / 1000) - 3600;
                timeCanvasEnd = timeCanvasStart + 90000;
                timeCanvasVal.setAttr('time',initArchiveTime);
                timeCanvasNow.setAttr('time',initArchiveTime);
		moveSliderTime();
		moveCurrentTime();
                drawTimeCanvas(timeCanvasStart,timeCanvasEnd);

		setInterval(timerNCP,1000);

		map.events.on({"move": function(){
                        if(!updatingMap1 && obsMap && !updatingMap2){
                               	c10 = this.getCenter();
                                z10 = this.getZoom();
                               	updatingMap1 = true;
                                map2.panTo(c10);
                                map2.zoomTo(z10);
                                //changeTime();
                                updatingMap1 = false;
                        }
                    }
                });

		map.render('map');

		// set center
		link = 'getCenterPoint.php';
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', link, false);
                dataRequest.send();
		if(dataRequest.responseText.length > 0 && site != 'pecan'){
	                coords = dataRequest.responseText.split(",");
			var point = new OpenLayers.LonLat(coords[1],coords[2]);
                        point.transform(proj, proj2);
                        map.setCenter(point, 6);
			boxCoords = [];
			boxCoords.push(new OpenLayers.Geometry.Point((point.lon - 550000),(point.lat - 550000)));
			boxCoords.push(new OpenLayers.Geometry.Point((point.lon - 550000),(point.lat + 550000)));
			boxCoords.push(new OpenLayers.Geometry.Point((point.lon + 550000),(point.lat + 550000)));
			boxCoords.push(new OpenLayers.Geometry.Point((point.lon + 550000),(point.lat - 550000)));
			boxCoords.push(new OpenLayers.Geometry.Point((point.lon - 550000),(point.lat - 550000)));
			linearRing = new OpenLayers.Geometry.LinearRing(boxCoords);
			box = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([linearRing]),{color:'#000000'});
			threat_lines.addFeatures([box]);
		}
		else{
			var point = new OpenLayers.LonLat(-95,40);
	               	point.transform(proj, proj2);
	                map.setCenter(point, 5);
		}

		map.updateSize();
		overview1.maximized = false;

		//gstreets.setVisibility(false);
		states.setVisibility(true);

		modifyFeature2.onModification = connectLines;
		modifyFeature2.onModificationStart = editContourOn;
                modifyFeature2.onModificationEnd = editContourOff;
		addNavigation();

		readIssuedProbs();

		/*
		options = {isBaseLayer: false, transparent: true, visibility: true, displayInLayerSwitcher:true, opacity: 1};
		testBounds = new OpenLayers.Bounds(-84.14,34.67,-76.14,40,67).transform(proj,proj2);;
		wdssii = new OpenLayers.Layer.Image('wdssii image','MergedReflectivityQCComposite_20140415-183239.png',testBounds,new OpenLayers.Size(1, 1),options);
		map.addLayer(wdssii);
		//testBounds = new OpenLayers.Bounds(-84.14,34.68,-76.15,40,67).transform(proj,proj2);;
		basemap = new OpenLayers.Layer.Image('basemap image','refl_test.png',testBounds,new OpenLayers.Size(1, 1),options);
                map.addLayer(basemap);
		*/		
	}

	function loadObsMap(){
		if(document.getElementById('obsMap').checked){
			document.getElementById("map").style.width = '50%';
			document.getElementById("map2").style.width = '50%';
			map.updateSize();

			 // create map object
			map2 = new OpenLayers.Map( 'map2',{
		                projection: new OpenLayers.Projection('EPSG:900913'),
		                displayProjection: new OpenLayers.Projection('EPSG:4326'),
		                units: 'm',
		                wrapDateLine: false,
		                numZoomLevels: 18,
				controls: []
		        });

			// google layers
                        /*
			gphy2 = new OpenLayers.Layer.Google(
                                "Google Physical",
                                {type: google.maps.MapTypeId.TERRAIN, visibility: false, displayInLayerSwitcher:false}
                        );

                        gstreets2 = new OpenLayers.Layer.TMS("Google Streets", "http://mt1.google.com/vt/lyrs=h@132&hl=en&s=sphericalMercator",
                                { 'type':'png',
                                'getURL':get_my_url ,
                                isBaseLayer: false,
                                visibility: false,
				displayInLayerSwitcher:false
                        });
			*/

			gphy2 = new OpenLayers.Layer.OSM();

                        //scalebar2 = new OpenLayers.Control.ScaleBar();
                        //scalebar2.displaySystem = 'english';
                        //scalebar2.minWidth = 220;
                        //scalebar2.maxWidth = 400;

                        states2 = new OpenLayers.Layer.Vector('U.S. States', {
                                projection: "EPSG:4326",
                                strategies: [new OpenLayers.Strategy.Fixed()],
                                styleMap: styleMapStates,
                                protocol: new OpenLayers.Protocol.HTTP({
                                    url: "js/usStates.json",
                                    format: new OpenLayers.Format.GeoJSON()
                                })
                            },
                            {isBaseLayer: false, transparent: true, displayInLayerSwitcher:false, opacity: 1}
                        );

                        map2.addLayers([gphy2]);
                        //map2.addControl(new OpenLayers.Control.LayerSwitcher());
                        //map2.addControl(scalebar2);
                        map2.addLayer(states2);
                        states2.setVisibility(true);

			/*
                        map.events.register("move", map, function() {
                                if(!updatingMap1 && obsMap){
                                        c10 = this.getCenter();
                                        z10 = this.getZoom();
                                        updatingMap1 = true;
                                        map2.panTo(c10);
                                        map2.zoomTo(z10);
                                        //changeTime();
                                        updatingMap1 = false;
                                }
                        });
			*/
                        //map2.events.register("move", map2, function() {
			/*
			map2.events.on({"move": function(){
                                if(!updatingMap2 && obsMap && !updatingMap1 && !map.dragging){
                                        c20 = this.getCenter();
                                        z20 = this.getZoom();
                                        updatingMap2 = true;
					//alert('move');
                                        map.panTo(c20);
                                        map.zoomTo(z20);
                                       // changeTime();
                                        updatingMap2 = false;
                                }
                        }});
			*/

			map2.render('map2');
			map2.updateSize();
		        var point = new OpenLayers.LonLat(-95,40);
		        point.transform(proj, proj2);  
		        map2.setCenter(point, 5);
			map2.panTo(map.getCenter());
			map2.zoomTo(map.getZoom());
			obsMap = true;
			loadField(true);
		} 
                else{
			obsMap = false;
			map2.removeLayer(states2);
			states2.destroy();
			//map2.removeControl(scalebar2);
                        //scalebar2.destroy();
			map2.removeLayer(gphy2);
                        gphy2.destroy();
			//map2.removeLayer(gstreets2);
                        //gstreets2.destroy();

			map2.destroy();
                        document.getElementById("map").style.width = '100%';
                        document.getElementById("map2").style.width = '0%';
                        map.updateSize();

			loadField();
                }
        }

	var map2;
	var states2, scalebar2;
	var gphy2, gstreets2;
	var c10, c20, z10, z20;
        var updatingMap1 = false;
        var updatingMap2 = false;
	var obsMap = false;

	function setRowColor(record){
		var c = record.get('threatColor');
		var p = record.get('prob');
		var t = parseInt(record.get('timeLeft').split(' ')[0]);
		var s = parseInt(record.get('timeLeft').split(' ')[2]);
		if(t < 5 && (s%2) == 0){
	                if (c == 'rgb(255,0,0)') {
		               	return 'cell-color-red-black';
	                } 
	                else if (c == 'rgb(0,204,0)') {
	                        return 'cell-color-green-black';
	                }
	                else if (c == 'rgb(0,0,255)') {
	                       	return 'cell-color-blue-black';
	                }
	                else if (c == 'rgb(255,255,0)') {
	                        return 'cell-color-yellow-black';
	                }
			else if (c == 'rgb(255,128,0)') {
                                return 'cell-color-orange-black';
			}
		}
		else if(t < 5){
			if (c == 'rgb(255,0,0)') {
                               	return 'cell-color-red-white';
                       	} 
                       	else if (c == 'rgb(0,204,0)') {
                               	return 'cell-color-green-white';
                       	}
                       	else if (c == 'rgb(0,0,255)') {
                               	return 'cell-color-blue-white';
                       	}
                       	else if (c == 'rgb(255,255,0)') {
                               	return 'cell-color-yellow-white';
                       	}
			else if (c == 'rgb(255,128,0)') {
                                return 'cell-color-orange-white';
                        }
		}
		else if(newScanHere){
			if (c == 'rgb(255,0,0)') {
                               	return 'cell-color-red-black';
                       	} 
                       	else if (c == 'rgb(0,204,0)') {
                               	return 'cell-color-green-black';
                       	}
                       	else if (c == 'rgb(0,0,255)') {
                               	return 'cell-color-blue-black';
                       	}
                       	else if (c == 'rgb(255,255,0)') {
                               	return 'cell-color-yellow-black';
                       	}
			else if (c == 'rgb(255,128,0)') {
                                return 'cell-color-orange-black';
                        }
		}
		else{
			if (c == 'rgb(255,0,0)') {
                                return 'cell-color-red';
                       	} 
                        else if (c == 'rgb(0,204,0)') {
                                return 'cell-color-green';
                       	}
                        else if (c == 'rgb(0,0,255)') {
                                return 'cell-color-blue';
                       	}
                        else if (c == 'rgb(255,255,0)') {
                                return 'cell-color-yellow';
                       	}
			else if (c == 'rgb(255,128,0)') {
                                return 'cell-color-orange';
                        }
		}
	}

Ext.define('AlwaysVisibleTip', {
    extend: 'Ext.slider.Tip',
    
    init: function(slider) {
        var me = this;
        me.callParent(arguments);
        slider.removeListener('dragend', me.hide, me);
        slider.on({
            scope: me,
            change: me.onSlide,
            afterrender: {
                fn: function() {
                    me.onSlide(slider, null, slider.thumbs[0]);
                },
                delay: 100
            }
        });
    }
});

