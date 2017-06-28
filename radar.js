	/*

        Copyright (c) 2014 Cooperative Institute for Mesoscale Meteorological Studies (CIMMS) and the University of Oklahoma

        Author:         Dr. Chris Karstens
        Email:          chris.karstens@noaa.gov
        Description:    Contains the following:
				1. function for read/parsing a WDSSII code index and storing as a javascript object
				2. inital function call for loading radar data
				3. function for reloading a new radar data product
				4. function for creating/regenerating the tilt table
				5. function for showing/hiding radar data
				6. function for updating radar data in memory

        */

	// retrieve and parse code index
	function readCodeIndex(){
		/*
		// old code
		if(!archive){
			dataLink = 'archive/' + acase + '/' + site + '/' + field + '_index.xml?' + (new Date()).getTime();
			var dataRequest = new XMLHttpRequest();
			dataRequest.open('GET', dataLink, false);
			dataRequest.send();
			code_index = dataRequest.responseText.split('\n');
			data = {};
			tilt_last = 99;
			for(var i=0;i<code_index.length;i++){
				if(code_index[i].split(' ')[1] == '<params>netcdf'){
					if(code_index[i].split(' ')[4] == 'at00.50'){
	                                       	tilt = code_index[i].split(' ')[4].slice(2);
	                               	}
	                               	else{
	                                       	tilt = code_index[i].split(' ')[4];
	                               	}
					tnow = new Date(Date.UTC(code_index[i].split(' ')[5].slice(0,4),code_index[i].split(' ')[5].slice(4,6) - 1,code_index[i].split(' ')[5].slice(6,8),code_index[i].split(' ')[5].slice(9,11),code_index[i].split(' ')[5].slice(11,13),code_index[i].split(' ')[5].slice(13,15)));
					if(parseFloat(tilt) < parseFloat(tilt_last) || code_index[i].split(' ')[4] == 'at00.50'){
						index = tnow.getTime() / 1000;
						data[index] = {};
					}
					data[index][tilt] = {'time':tnow.getTime() / 1000,'image':field + '_' + code_index[i].split(' ')[5].slice(0,15) + '.png'};
					tilt_last = tilt;
				}
			}
		}
		else{
		*/
			dataLink = 'getImages.php?site=' + site + '&product=' + field + '&case=' + acase;
                        var dataRequest = new XMLHttpRequest();
                        dataRequest.open('GET', dataLink, false);
                        dataRequest.send();
			floaterImages = dataRequest.responseText.split(",");
			data = {};
			tilt_last = 99;
			if(floaterImages.length == 1 && dataRequest.responseText == ''){
				alert('There are apparently no radar data available for this site.  Please wait for the data to arrive.  If after a while no data appear, pick a different site.');
				return;
			}
			for(var i=0;i<floaterImages.length;i++){
				tilt = floaterImages[i].split('_')[floaterImages[i].split('_').length - 1].slice(0,5);
				if(data == {} && tilt != '00.50' || data == {} && tilt != '00.51' || data == {} && tilt != '00.00'){
					continue;
				}
				tnow = new Date(Date.UTC(floaterImages[i].split('_')[1].slice(0,4),floaterImages[i].split('_')[1].slice(4,6) - 1,floaterImages[i].split('_')[1].slice(6,8),floaterImages[i].split('_')[1].slice(9,11),floaterImages[i].split('_')[1].slice(11,13),floaterImages[i].split('_')[1].slice(13,15)));
				if(tilt == '00.00' || tilt == '00.50' || tilt == '00.51' || parseFloat(tilt) < parseFloat(tilt_last)){
					tiltIndex = tnow.getTime() / 1000;
					data[tiltIndex] = {};
				}
				data[tiltIndex][tilt] = {'time':tnow.getTime() / 1000,'image':floaterImages[i]};
				tilt_last = tilt;
			}
			if(analysis){
                               	keys = getKeys(data);
                               	volumes = keys.length - 1;
                       	}
		//}
	}

	// function called after page is loaded to load/store inital set of radar data from code index
	function loadInit(){
		readCodeIndex();
		var i = 0;
		if(archive || analysis){
			image_path = 'archive/' + acase + '/' + site + '/' + field;
			keys = getKeys(data);
			initTime = new Date();
			var initCase = String(initTime.getUTCFullYear()) + String(initTime.getUTCMonth()+1) + String(initTime.getUTCDate());
			if(initCase == acase){
				tnow = initTime.getTime() / 1000; // for HWT machines in DRT mode, use system clock
			}
			else{
				try{
					tnow = caseStartTimes[acase] / 1000; // otherwise, use a case start time if it exists
				}
				catch(err){
					//tnow = keys[keys.length-1];
					tnow = keys[0]; // last resort use first data layer time
				}
			}
			if(archive){
				initArchiveTime = tnow;
                               	initArchiveTimeOrig = tnow;
                                currentTime = tnow;
				for(scan in data){
                                        if(scan >= tnow){
                                                var idx = i - (volumes + 1);
                                                first_scan = keys[idx];
						//console.log(idx + ',' + first_scan);
						tnow = keys[i-1];
						break;
                                       	}
                                       	i++;
                               	}
				timeCanvasVal.setAttr('time',parseInt(tnow));
                               	moveSliderTime();
				currentScanTime = tnow;
                       	}
                       	else{
                                first_scan = keys[0];
				timeCanvasVal.setAttr('time',parseInt(tnow));
				timeCanvasNow.setAttr('time',parseInt(keys[keys.length-1]));
				moveSliderTime();
	                       	initArchiveTime = tnow;
	                       	initArchiveTimeOrig = tnow;
	                       	currentScanTime = tnow;
				currentTime = tnow;
				tnow = keys[keys.length-1];
			}
		}
		else if(archive){
			// old code
                       	image_path = 'archive/' + acase + '/' + site + '/' + field;
                       	for(scan in data){
                                i++;
                                if(i == 1){
                                        first_scan = scan;
                                }
                                else if(i == (volumes + 1)){
                                        tnow = scan;
                                        timeCanvasVal.setAttr('time',parseInt(scan));
                                        moveSliderTime();
                                       	initTime = new Date();
                                       	initArchiveTime = tnow;
                                       	initArchiveTimeOrig = tnow;
                                       	currentScanTime = tnow;
                                        break;
                                }
                       	}
                }
		else{
			image_path = 'realtime/ewp/floater/' + field;
			scanTimes = [];
			tiltTimes = [];
			for(scan in data){
				scanTimes.push(parseInt(scan));
				for(tilt in data[scan]){
					tiltTimes.push(parseInt(data[scan][tilt]['time']));
				}
			}
			keys = getKeys(data);
			if(keys.length <= volumes){
				first_scan = scanTimes[0];
			}
			else{
				first_scan = scanTimes[scanTimes.length - (volumes + 1)];
			}
			tnow = tiltTimes.max();
			//alert(scanTimes + '|' + first_scan);
			//alert(tiltTimes + '|' + tnow);
			keys = getKeys(data);
			if(keys.length > 0){
	                        timeCanvasVal.setAttr('time',scanTimes[scanTimes.length - 1]);
			}
			else{
				timeCanvasVal.setAttr('time',parseInt((new Date()) / 1000));
			}
                        moveSliderTime();
                        initTime = new Date();
                        initArchiveTime = tnow;
			initArchiveTimeOrig = tnow;
                        currentScanTime = tnow;
		}
		if(logTime != 0){
			//currentTime = parseInt((new Date() - initTime) / 1000) + parseInt(initArchiveTime) + logTime;
			currentTime = parseInt(initArchiveTimeOrig) + (parseInt((new Date()) / 1000) - logTime);
			loadNewProduct('init');
			return;
		}
		options = {isBaseLayer: false, transparent: true, visibility: true, displayInLayerSwitcher:false, opacity: radarOpacity};
		scans = new Array();
		radarImages = new Array();
		//for(i=0;i<scans.length;i++){
		//	scans[i] = new Array();
		//}
		allScans = new Array();
		i = -1;
		for(scan in data){
			scanInc = true;
			for(tilt in data[scan]){
				if(data[scan][tilt]['time'] >= first_scan && data[scan][tilt]['time'] <= tnow){
					if(scanInc){
						i++;
						scans[i] = new Array();
						radarImages[i] = new Array();
						scanInc = false;
					}
					image = data[scan][tilt]['image'];
					lyrName = image.split('_')[0] + '_' + data[scan][tilt]['time'];
					scans[i].push(lyrName);
					radarImages[i].push(image_path + '/' + image);
					allScans.push(lyrName);
					//eval(lyrName + ' = new OpenLayers.Layer.Image(\'' + lyrName + '\',\'' + image_path + '/' + image  + '?' + (new Date()).getTime() + '\',bounds,new OpenLayers.Size(1, 1),options)');
					//eval('map.addLayer(' + lyrName + ')');
					//eval(lyrName + '.display(false)');
					//eval(lyrName + '.setZIndex(1)');
				}
			}
			if(i == volumes){
				break;
			}
		}
		/*
		if(i != volumes){
			scans2 = new Array(volumes + 1);
			for(j=i;j<=volumes;j++){
				scans2[j] = new Array();
			}
			for(j=0;j<i;j++){
				scans2[j] = scans[j];
			}
			scans = scans2;
		}
		*/
		//gstreets.setZIndex(3);
		tiltTable();
	}

	function loadNewProduct(init){
		if(modifyFeature.feature != null){
			if(timeCanvasVal.getAttr('time') < modifyFeature.feature.attributes.data['valid_start']){
				pSelect = document.getElementById('productSelect');
		                for(j,k=0;j=pSelect[k];k++){
		                        if(j.value == field){
		                                pSelect.selectedIndex = k;
		                                break;
		                        }
		                }
				alert('Must be on latest data frame time to complete this operation.');
				return;
			}
			modifyFeature.feature.attributes.data['centers'] = {};
	                centers = {};
			//decoupleVector();
		}
		if(archive || analysis){
			product = document.getElementById('productSelect').value;
                        field = product;
		}
		else{
			// get products for site if changing sites
			product = document.getElementById('productSelect').value;
                       	field = product;
			if(archive || analysis){
				url = 'get_products.php?case=' + acase + '&site=' + site + '&product=' + product + '&archive=true';
			}
			else{
				url = 'get_products.php?case=' + acase + '&site=' + site + '&product=' + product + '&archive=false';
			}
		       	var dataRequest = new XMLHttpRequest();
		        dataRequest.open('GET', url, false);
		        dataRequest.send();
		        selectOptions = '<select id="productSelect" onChange="loadNewProduct();">' + dataRequest.responseText + '</select>&nbsp;&nbsp;&nbsp;&nbsp;';
			document.getElementById('productsSelect').innerHTML = selectOptions;
		}

		// load color scale
		//document.getElementById('colorScale').innerHTML = '<img src="images/' + product + '.png" />';
		if(document.getElementById('legend') != null){
			document.getElementById('legend').innerHTML = '<img src="images/color_scale_' + product + '.png" />';
		}

		// delete current product
		//for(var i=0;i<scans.length;i++){
		//	for(j=0;j<scans[i].length;j++){
				//eval(scans[i][j] + '.destroy()');
		//	}
		//}

		// reload code index
		readCodeIndex();

		// determine min time
		if(analysis){
			keys = getKeys(data);
			currentTime = keys[keys.length-1];
		}
		scanTimes = [];
		var i = -1;
		for(scan in data){
			i++;
                        tnow = currentTime;
			if(parseInt(scan) >= currentTime){
				break
			}
			scanTimes.push(parseInt(scan));
		}
		keys = getKeys(data);
		if(analysis || keys.length <= volumes){
			mTime = scanTimes[0];
		}
		else if(archive){
                        mTime = scanTimes[i - (volumes + 1)];
                }
		else{
			mTime = scanTimes[i - volumes];
		}
		//alert(keys + '|' + mTime);

		// get product images from server
		if(archive || analysis){
	               	image_path = 'archive/' + acase + '/' + site + '/' + field;
		}
		else{
			image_path = 'realtime/ewp/floater/' + field;
		}
               	//bounds = new OpenLayers.Bounds(-99.278,33.308,-95.278,37.308).transform(proj,proj2);
               	options = {isBaseLayer: false, transparent: true, visibility: true, displayInLayerSwitcher:false, opacity: radarOpacity};
               	scans = new Array();
		radarImages = new Array();
		//for(i=0;i<scans.length;i++){
                //        scans[i] = new Array();
                //}
		var i = -1;
		allScans = new Array();
               	for(scan in data){
			if(parseInt(scan) >= mTime){
				i++;
	                        scans.push(new Array());
				radarImages.push(new Array());
	                       	for(tilt in data[scan]){
	                               	if(data[scan][tilt]['time'] <= tnow){
	                                       	image = data[scan][tilt]['image'];
	                                       	lyrName = image.split('_')[0] + '_' + data[scan][tilt]['time'];
	                                       	scans[i].push(lyrName);
						radarImages[i].push(image_path + '/' + image);
	                                       	allScans.push(lyrName);
						if(image.split('_')[0] == 'Floater'){
							//eval(lyrName + ' = new OpenLayers.Layer.Image(\'' + lyrName + '\',\'' + image_path + '/' + image  + '?' + (new Date()).getTime() + '\',floaterBounds,new OpenLayers.Size(1, 1),options)');
						}
						else{
	                                       		//eval(lyrName + ' = new OpenLayers.Layer.Image(\'' + lyrName + '\',\'' + image_path + '/' + image  + '?' + (new Date()).getTime() + '\',bounds,new OpenLayers.Size(1, 1),options)');
						}
	                                       	//eval('map.addLayer(' + lyrName + ')');
	                                       	//eval(lyrName + '.display(false)');
	                                       	//eval(lyrName + '.setZIndex(1)');
	                               	}
				}
	                        if(i == volumes && !analysis){
					if(init != null){
						timeCanvasVal.setAttr('time',parseInt(scan));
	                                       	moveSliderTime();
					}
	                               	break;
				}	
                        }
                }
                //gstreets.setZIndex(3);
		//updateRadar(currentTime);
		if(modifyFeature != null && modifyFeature.feature != null){
			//if(parseInt(scans[scans.length - 1][0].split('_')[1]) != modifyFeature.feature.attributes.data['valid_start']){
				//assigningStart = true;
				newScanHere = true;
				console.log('hear now');
				modifyFeature.feature.attributes.data['valid_start'] = parseInt(scans[scans.length - 1][0].split('_')[1]);
				startPoint = null;
				startClone = null;
				goToEnd();
				decoupleVector();
			//}
			//else{
			//	assigningStart = false;
			//}
			//goToEnd();
		}
		else if(init == null && !analysis){
			goToEnd();
		}
		if(radarImageLast != '' && !analysis){
	               	eval(radarImageLast + '.setZIndex(100)');
               	}
		if(analysis){
			changeTime();
		}
	}

	// create/regenerate tilt table
	function tiltTable(){
		tnow = timeCanvasVal.getAttr('time');
		scan_last = -999;
		timeValTrip = false;
		t2 = -1;
		innerHTML = '';
		keys = getKeys(data);
		if(keys.length <= volumes){
			vIndex = keys.length - 1;
		}
		else{
			vIndex = volumes-1;
		}
		for(scan in data){
			t2++;
			if(tnow >= scan){
				t = -1;
				scan_last = scan;
				innerHTML = '<center><u><b>Tilts</u>:</b><br></center><table cellpadding="2" cellspacing="0" border="1">';
				for(tilt in data[scan]){
					// needs attention
					if(data[scan][tilt]['time'] < timeMin){
						break;
					}
					t++;
					if(data[scan][tilt]['time'] <= currentTime){
						innerHTML += '<tr><td id="td_tilt_' + t + '" align="center" style="background:#FFFFFF;color:#000000" onClick="setMouse(this); changeTilt(' + scan + ',\'' + tilt + '\',\'td_tilt_' + t + '\',' + data[scan][tilt]['time'] + '); changeTime();">' + tilt + '</td></tr>';
						tiltMax = t;
						currentScan = t2;
					}
					else{
						innerHTML += '<tr><td id="td_tilt_' + t + '" align="center" style="background:#FFFFFF;color:#CCCCCC" onClick="setMouse(this);">' + tilt + '</td></tr>';
					}
					if(data[scan][tilt]['time'] >= scans[vIndex][0].split('_')[1]){
						timeValTilt = scans[vIndex][0].split('_')[1];
						timeValTrip = true;
					}
				}
				maxTilt = t;
				//if(currentTilt.split('_')[2] > t){
				//	currentTilt = 'td_tilt_' + t;
				//	lastTilt = currentTilt;
				//}
				//break;
			}
			else{
				break;
			}
		}
		if(innerHTML.length > 0){
			innerHTML += '</table>';
			if(showRadar){
				innerHTML += '<center><input type="checkbox" id="showRadar" onChange="maskRadar();" checked>show</input></center>';
			}
			else{
				innerHTML += '<center><input type="checkbox" id="showRadar" onChange="maskRadar();">show</input></center>';
			}
		}
		document.getElementById('tiltTable').innerHTML = innerHTML;
		changeTilt(0,0,currentTilt,timeCanvasVal.getAttr('time'));
	}

	// show/hide radar data
	function maskRadar(){
		if(document.getElementById('showRadar').checked){
			showRadar = true;
		}
		else{
			showRadar = false;
		}
		changeTime();
	}

	// function to update radar data in memory
	function updateRadar(tnow){
		keys = getKeys(data);
		if(archive || analysis){
			image_path = 'archive/' + acase + '/' + site + '/' + field;
		}
		else{
			image_path = 'realtime/ewp/floater/' + field;

			// update data object
			dataLink = 'getImages.php?user=' + user + '&site=' + site + '&product=' + field + '&last=' + floaterImages[floaterImages.length - 1] + '&validProbMinSevere=' + validProbMinSevere + '&validProbMaxSevere=' + validProbMaxSevere + '&validProbMinTornado=' + validProbMinTornado + '&validProbMaxTornado=' + validProbMaxTornado + '&validProbMinLightning=' + validProbMinLightning + '&validProbMaxLightning=' + validProbMaxLightning + '&autoSpdSevere=' + autoSpdSevere + '&autoDirSevere=' + autoDirSevere + '&autoSpdTornado=' + autoSpdTornado + '&autoDirTornado=' + autoDirTornado + '&autoSpdLightning=' + autoSpdLightning + '&autoDirLightning=' + autoDirLightning;
                        var dataRequest = new XMLHttpRequest();
                        dataRequest.open('GET', dataLink, false);
                        dataRequest.send();

			// update floater if msg says so
			if(dataRequest.responseText.split(' ')[0] == 'NW'){
				updateFloater(dataRequest.responseText);
				return;
			}
			else if(dataRequest.responseText.split(',')[0] == 'severe'){
				validProbMinSevere = parseInt(dataRequest.responseText.split(',')[1]);
				validProbMaxSevere = parseInt(dataRequest.responseText.split(',')[2]);
				autoSpdSevere = parseInt(dataRequest.responseText.split(',')[3]);
				autoDirSevere = parseInt(dataRequest.responseText.split(',')[4]);
				renderProbSlider();
				return;
			}
			else if(dataRequest.responseText.split(',')[0] == 'tornado'){
				validProbMinTornado = parseInt(dataRequest.responseText.split(',')[1]);
                               	validProbMaxTornado = parseInt(dataRequest.responseText.split(',')[2]);
				autoSpdTornado = parseInt(dataRequest.responseText.split(',')[3]);
                               	autoDirTornado = parseInt(dataRequest.responseText.split(',')[4]);
				renderProbSlider();
				return;
			}
			else if(dataRequest.responseText.split(',')[0] == 'lightning'){
                                validProbMinLightning = parseInt(dataRequest.responseText.split(',')[1]);
                                validProbMaxLightning = parseInt(dataRequest.responseText.split(',')[2]);
				autoSpdLightning = parseInt(dataRequest.responseText.split(',')[3]);
                               	autoDirLightning = parseInt(dataRequest.responseText.split(',')[4]);
                                renderProbSlider();
                                return;
                        }

			// otherwise process returned images
                        images = dataRequest.responseText.split(",");
			for(var im=0;im<images.length;im++){
				if(floaterImages.indexOf(images[im]) == -1 && images[im].length > 0){
					tilt = images[im].split('_')[images[im].split('_').length - 1].slice(0,5);
	                                tnow2 = new Date(Date.UTC(images[im].split('_')[1].slice(0,4),images[im].split('_')[1].slice(4,6) - 1,images[im].split('_')[1].slice(6,8),images[im].split('_')[1].slice(9,11),images[im].split('_')[1].slice(11,13),images[im].split('_')[1].slice(13,15)));
	                                if(tilt == '00.50' || tilt == '00.51' || tilt == '00.00'){
	                                        tiltIndex = tnow2.getTime() / 1000;
	                                       	data[tiltIndex] = {};
	                               	}
					else if(keys.length == 0){
						tiltIndex = tnow2.getTime() / 1000;
                                               	data[tiltIndex] = {};
						//timeMin = tiltIndex - 1;
					}
	                                data[tiltIndex][tilt] = {'time':tnow2.getTime() / 1000,'image':images[im]};
					floaterImages.push(images[im]);
				}
			}
		}
		//bounds = new OpenLayers.Bounds(-99.278,33.308,-95.278,37.308).transform(proj,proj2);
		keys = getKeys(data);
               	if(keys.length <= volumes){
                       	vIndex = keys.length - 1;
			if(vIndex > (scans.length - 1)){
				scans.push(new Array());
			}
               	}
               	else{
                       	vIndex = volumes;
               	}
		options = {isBaseLayer: false, transparent: true, visibility: true, displayInLayerSwitcher:false, opacity: radarOpacity};
		//console.log(scans);
		//console.log(vIndex);
		for(scan in data){
			if(vIndex == volumes && scans[volumes][0].length > 0 && scan > scans[volumes][0].split('_')[1] && tnow >= scan){
				for(var i=0;i<=volumes;i++){
					if(i == 0){
						for(var j=0;j<scans[i].length;j++){
                                                        //eval(scans[i][j] + '.destroy()');
						}
					}
					else if(i == 1){
						minTime = scans[i][0].split('_')[1];
					}
					scans[i] = new Array();
					radarImages[i] = new Array();
					if(i < volumes){
						for(j=0;j<scans[i+1].length;j++){
							scans[i].push(scans[i+1][j]);
							radarImages[i].push(radarImages[i+1][j]);
						}
					}
					else{
						for(tilt in data[scan]){
							image = data[scan][tilt]['image'];
			                                lyrName = image.split('_')[0] + '_' + data[scan][tilt]['time'];
							//master_time_slider.setMaximum(parseInt(data[scan][tilt]['time']) + 3600);
							//master_time_slider.setMaximum(parseInt(data[scan][tilt]['time']));
                                		       	scans[volumes].push(lyrName);
							radarImages[volumes].push(image_path + '/' + image)
                        		               	allScans.push(lyrName);
							if(image.split('_')[0] == 'Floater'){
								//eval(lyrName + ' = new OpenLayers.Layer.Image(\'' + lyrName + '\',\'' + image_path + '/' + image  + '?' + (new Date()).getTime() + '\',floaterBounds,new OpenLayers.Size(1, 1),options)');
							}
							else{
	                        		                //eval(lyrName + ' = new OpenLayers.Layer.Image(\'' + lyrName + '\',\'' + image_path + '/' + image  + '?' + (new Date()).getTime() + '\',bounds,new OpenLayers.Size(1, 1),options)');
							}
                        		               	//eval('map.addLayer(' + lyrName + ')');
                		                        //eval(lyrName + '.display(false)');
							//eval(lyrName + '.setZIndex(0)');
        		                               	tiltTable();
							timeMin = minTime;
							//master_time_slider.setMinimum(parseInt(minTime));
							keys = getKeys(data);
							if(modifyFeature.feature != null && timeCanvasVal.getAttr('time') < modifyFeature.feature.attributes.data['valid_start']){
								assigningStart = true;
								timeDiff = parseInt(scans[scans.length - 1][0].split('_')[1]) - modifyFeature.feature.attributes.data['valid_start'];
								dis = modifyFeature.feature.attributes.data['speeds'][0] * timeDiff * 0.514444;
								x = Math.cos((270 - modifyFeature.feature.attributes.data['dirs'][0]) * Math.PI / 180) * dis;
				                               	y = Math.sin((270 - modifyFeature.feature.attributes.data['dirs'][0]) * Math.PI / 180) * dis;
								//alert(timeDiff + ',' + dis + ',' + x + ',' + y);
                					       	startClone.geometry.move(x,y);
								startPoint.move(x,y);
								centroid.move(x,y);
								modifyFeature.feature.attributes.data['centers'][parseInt(scans[scans.length - 1][0].split('_')[1])] = {};
					                       	modifyFeature.feature.attributes.data['centers'][parseInt(scans[scans.length - 1][0].split('_')[1])]['x'] = startClone.geometry.getCentroid().x;
					                       	modifyFeature.feature.attributes.data['centers'][parseInt(scans[scans.length - 1][0].split('_')[1])]['y'] = startClone.geometry.getCentroid().y;
					                       	centers = modifyFeature.feature.attributes.data['centers'];
								moveThreatTime = parseInt(scans[scans.length - 1][0].split('_')[1]);
								centroidTime = parseInt(scans[scans.length - 1][0].split('_')[1]);
								modifyFeature.feature.attributes.data['valid_start'] = parseInt(scans[scans.length - 1][0].split('_')[1]);
								modifyFeature.feature.attributes.data['valid_end'] = parseInt(modifyFeature.feature.attributes.data['valid_start']) + (60 * parseInt(modifyFeature.feature.attributes.data['duration']));
								startClone.attributes.data['valid_start'] = parseInt(scans[scans.length - 1][0].split('_')[1]);
								startClone.attributes.data['valid_end'] = parseInt(startClone.attributes.data['valid_start']) + (60 * parseInt(startClone.attributes.data['duration']));
								//console.log(modifyFeature.feature.attributes);
								deletePendingRecords();
								insertRecord(modifyFeature.feature.clone(),'Pending','insert');
								drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
								assigningStart = false;
								modifyThreat(updateThreat);
							}
							if(timeCanvasVal.getAttr('time') == scans[volumes - 1][0].split('_')[1] && !play){
								if(modifyFeature.feature != null){
									// took this away and added drawtype check below
									// when new scan comes in and forecaster is editing an object, no radar data are updated until object is issued or killed
	                                                               	//assigningStart = true;
									newScanHere = true;
								}
								if(drawType == null){
	                                                               	play = true;
	                                                               	advanceScan('forward');
	                                                               	play = false;
								}
                                                        }
							//gstreets.setZIndex(3);
		                                       	return;
						}
					}
				}
			}
                        for(tilt in data[scan]){
				image = data[scan][tilt]['image'];
                                lyrName = image.split('_')[0] + '_' + data[scan][tilt]['time']
				// else statement needs attention (timeCanvasStart)
				if(data[scan][tilt]['time'] > tnow){
					tiltTable();
                                       	return;
                                }
                               	else if(allScans.indexOf(lyrName) == -1 && data[scan][tilt]['time'] <= tnow && data[scan][tilt]['time'] > timeMin){
                                        scans[vIndex].push(lyrName);
					radarImages[vIndex].push(image_path + '/' + image);
					allScans.push(lyrName);
					if(image.split('_')[0] == 'Floater'){
						//eval(lyrName + ' = new OpenLayers.Layer.Image(\'' + lyrName + '\',\'' + image_path + '/' + image  + '?' + (new Date()).getTime() + '\',floaterBounds,new OpenLayers.Size(1, 1),options)');
					}
					else{
	                                        //eval(lyrName + ' = new OpenLayers.Layer.Image(\'' + lyrName + '\',\'' + image_path + '/' + image  + '?' + (new Date()).getTime() + '\',bounds,new OpenLayers.Size(1, 1),options)');
					}
                                        //eval('map.addLayer(' + lyrName + ')');
                                        //eval(lyrName + '.display(false)');
					//eval(lyrName + '.setZIndex(0)');
					if((vIndex - 1) >= 0 && scans[vIndex].length <= scans[vIndex - 1].length){
						if(timeCanvasVal.getAttr('time') == scans[vIndex - 1][(scans[vIndex].length - 1)].split('_')[1] && !play){
							play = true;
							//advanceScan('forward');
							play = false;
	                                        }
					}
					//gstreets.setZIndex(3);
					//return;
                               	}
                       	}
               	}
	}

	function updateFloater(floaterInfo){
		/*
		// check if floater has been updated
		url = 'realtime/ewp/PHI_Floater_Info.txt?' + (new Date()).getTime();
                var dataRequest = new XMLHttpRequest();
                dataRequest.open('GET', url, false);
                dataRequest.send();
               	if(phiFloaterInfo == dataRequest.responseText){
			return;
		}
		*/
		alert('Updating Floater');

		// update floater bounds
		wfos = {};
	       	floaterSites = [];
		lines = floaterInfo.split("\n");
               	for(i=0;i<lines.length;i++){
                       	if(i == 0){
				floaterBoundsNELat = lines[i].split(' ')[2];
                               	floaterBoundsSWLon = lines[i].split(' ')[3];
                       	}
                       	else if(i == 1){
				//centerLat = (parseFloat(floaterBoundsNELatTemp) + parseFloat(lines[i].split(' ')[2])) / 2;
                               	//offset = (centerLat - 10) * 0.003958264;
                               	//floaterBoundsNELat = floaterBoundsNELatTemp - (offset / 2);
                               	//floaterBoundsSWLat = lines[i].split(' ')[2] - (offset / 3);
                               	floaterBoundsSWLat = lines[i].split(' ')[2];
				floaterBoundsNELon = lines[i].split(' ')[3];
				floaterBounds = new OpenLayers.Bounds(floaterBoundsSWLon,floaterBoundsSWLat,floaterBoundsNELon,floaterBoundsNELat).transform(proj,proj2);
                        }
                        else if(i == 2){
                                fSites = lines[i].split(' ');
                                for(j=1;j<fSites.length;j++){
                                       	if(wfos.hasOwnProperty(radarLocs[fSites[j]])){
                                                wfos[radarLocs[fSites[j]]].push(fSites[j]);
                                        }
                                        else{
                                                wfos[radarLocs[fSites[j]]] = [];
                                               	wfos[radarLocs[fSites[j]]].push(fSites[j]);
                                        }
                                        floaterSites.push(fSites[j]);
                                }
                       	}
               	}

		// update list of sites
		// will attempt to keep current site, else default to first in list
		//caseSelectOptions = '<u>User</u>: ' + user + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                caseSelectOptions = '<u>Site</u>: <select id="siteSelect" onKeyDown="ignoreKeys();" onChange="resetSite();">';
               	for(j=0;j<floaterSites.length;j++){
                        if(floaterSites[j] == site){
                                caseSelectOptions += '<option value="' + floaterSites[j] + '" selected>' + floaterSites[j] + '</option>';
                        }
                        else{
                                caseSelectOptions += '<option value="' + floaterSites[j] + '">' + floaterSites[j] + '</option>';
                        }
               	}
                caseSelectOptions += '</select>';
		document.getElementById('caseSelectOptions').innerHTML = caseSelectOptions;
		site = document.getElementById('siteSelect').value;

		// reload radar sites
               	radar_sites.removeAllFeatures();
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
                               	map.setCenter(point, 9);
				clat = parseFloat(coords[1]);
	                        clon = parseFloat(coords[0]);
                       	}
                       	else{
                               	radar_site = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(parseFloat(coords[0]),parseFloat(coords[1])).transform(proj, proj2),{'sname':floaterSites[im],'color':'white'});
                       	}
                       	radar_sites.addFeatures([radar_site]);
               	}

		// reload radar imagery
               	product = document.getElementById('productSelect').value;
               	field = product;
               	loadNewProduct();

               	// adject site selection menu
               	siteSelect = document.getElementById('siteSelect');
               	for(j,k=0;j=siteSelect[k];k++){
                       	if(j.value == site){
                               	siteSelect.selectedIndex = k;
                               	break;
                       	}
               	}
               	selectControl.unselectAll();

		//phiFloaterInfo = phiFloaterInfoTemp;

	}

	function jumpToSite(){
		var point = new OpenLayers.LonLat(clon,clat);
                point.transform(proj, proj2);
                map.setCenter(point, map.getZoom());
	}
