	/*

        Copyright (c) 2014 Cooperative Institute for Mesoscale Meteorological Studies (CIMMS) and the University of Oklahoma

        Author:         Dr. Chris Karstens
        Email:          chris.karstens@noaa.gov
        Description:    Contains the following:
				1. loads CWA polygon used for filtering data (e.g., NWS warnings, K-means clusters)
				2. loads NWS warnings from server
				3. controls temporal display of NWS warnings on map

        */
	
	// load CWA
	function loadCWA(){
		if(cwa_layer != null){
			cwa_layer.removeAllFeatures();
			cwa_layer.destroy();
		}
		cwa_layer = new OpenLayers.Layer.Vector("CWA Border",{projection: "EPSG:4326",styleMap:styleMapCWAs});
		map.addLayer(cwa_layer);
		var geojson_format = new OpenLayers.Format.GeoJSON();

		// get counties
                cwa = radarLocs[site];

		// pull cwa polygon
		url = 'js/cwas/' + cwa + '.json';
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', url, false);
                dataRequest.send();
                cwa_json = dataRequest.responseText;

		// set cwa layer
		cwa = geojson_format.read(cwa_json);
		cwa[0].geometry.transform(proj,proj2);
		cwa_layer.addFeatures([cwa[0]]);
	}

	// load counties for radar site
	function loadCounties(){
		if(counties_layer != null){
                        counties_layer.removeAllFeatures();
                        counties_layer.destroy();
                }
                var geojson_format = new OpenLayers.Format.GeoJSON();

                // pull counties polygon
		counties_layer = new OpenLayers.Layer.Vector(site + ' Counties', {
	                projection: "EPSG:4326",
	                strategies: [new OpenLayers.Strategy.Fixed()],
	                styleMap: styleMapCounties,
	                protocol: new OpenLayers.Protocol.HTTP({
	                    url: "js/counties/" + site.toLowerCase() + ".json",
	                    format: new OpenLayers.Format.GeoJSON()
	                })
	            },
	            {isBaseLayer: false, transparent: true, displayInLayerSwitcher:true, opacity: 1}
	        );
		map.addLayer(counties_layer);
		counties_layer.setVisibility(true);
        }	

	// load NWS warnings for archived case
	function loadNWSWarnings(){
		if(archive){
	                var geojson_format = new OpenLayers.Format.GeoJSON();

			// Tornado
			url = 'archive/warnings/' + acase.slice(0,4) + '/TOR/' + acase + '.json';
	                var dataRequest = new XMLHttpRequest();
	                dataRequest.open('GET', url, false);
	                dataRequest.send();
	                objects = dataRequest.responseText.split("\n");
	                for(j=0;j<objects.length;j++){
	                	if(objects[j].length > 0){
	                        	object = geojson_format.read(objects[j]);
					object[0].geometry.transform(proj,proj2);
					nwsTorWarnings.addFeatures([object[0]]);
	                        }
	                }

			// Severe T-Storm
	                url = 'archive/warnings/' + acase.slice(0,4) + '/SVR/' + acase + '.json';
	                var dataRequest = new XMLHttpRequest();
	                dataRequest.open('GET', url, false);
	                dataRequest.send();
	                objects = dataRequest.responseText.split("\n");
	                for(j=0;j<objects.length;j++){
	                        if(objects[j].length > 0){
	                                object = geojson_format.read(objects[j]);
	                                object[0].geometry.transform(proj,proj2);
	                                nwsSvrWarnings.addFeatures([object[0]]);
	                        }
	                }
		}		
        }

	// show NWS warnings based on current time
	function showNWSWarnings(){
		timeVal = timeCanvasVal.getAttr('time');
		nwsWarnings.removeAllFeatures();
		if(nwsTorWarnings.getVisibility()){
			etn = [];
			indices = [];
			issues = [];
			for(i=0;i<nwsTorWarnings.features.length;i++){
				d = new Date(nwsTorWarnings.features[i].attributes.issue);
				issue = d.getTime() / 1000;
				d = new Date(nwsTorWarnings.features[i].attributes.expire);
				expire = d.getTime() / 1000;
				if(etn.indexOf(nwsTorWarnings.features[i].attributes.etn) == -1 && timeVal <= expire && timeVal >= issue){
					etn.push(nwsTorWarnings.features[i].attributes.etn);
					indices.push(i);
					issues.push(issue);
				}
				else if(etn.indexOf(nwsTorWarnings.features[i].attributes.etn) != -1 && timeVal <= expire && timeVal >= issue){
					index = etn.indexOf(nwsTorWarnings.features[i].attributes.etn);
					if(issue > issues[index]){
						indices[index] = i;
						issues[index] = issue;
					}
				}
			}
			for(i=0;i<indices.length;i++){
	                        nwsWarnings.addFeatures([nwsTorWarnings.features[indices[i]].clone()]);
	                }
		}
		if(nwsSvrWarnings.getVisibility()){
			etn = [];
                        indices = [];
                        issues = [];
			for(i=0;i<nwsSvrWarnings.features.length;i++){
                        	d = new Date(nwsSvrWarnings.features[i].attributes.issue);
                                issue = d.getTime() / 1000;
                                d = new Date(nwsSvrWarnings.features[i].attributes.expire);
                                expire = d.getTime() / 1000;
                                if(etn.indexOf(nwsSvrWarnings.features[i].attributes.etn) == -1 && timeVal <= expire && timeVal >= issue){
                                        etn.push(nwsSvrWarnings.features[i].attributes.etn);
                                        indices.push(i);
                                        issues.push(issue);
                                }
                                else if(etn.indexOf(nwsSvrWarnings.features[i].attributes.etn) != -1 && timeVal <= expire && timeVal >= issue){
                                        index = etn.indexOf(nwsSvrWarnings.features[i].attributes.etn);
                                        if(issue > issues[index]){
                                                indices[index] = i;
                                                issues[index] = issue;
                                        }
                                }
        	        }
			for(i=0;i<indices.length;i++){
                                nwsWarnings.addFeatures([nwsSvrWarnings.features[indices[i]].clone()]);
                        }
		}
	}
