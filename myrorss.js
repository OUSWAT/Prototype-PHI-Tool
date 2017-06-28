	/*

        Copyright (c) 2014 Cooperative Institute for Mesoscale Meteorological Studies (CIMMS) and the University of Oklahoma

        Author:         Dr. Chris Karstens
        Email:          chris.karstens@noaa.gov
        Description:    Contains the following:
				1. function to change the display of K-means cluster scales shown on the map
				2. loads K-means clusters from server
				3. controls the display of K-means clusters on the map

        */

	// scale table
	function changeScale(newScale){
		if(!myrorssCase){
                       	return;
               	}
		if(!document.getElementById('showMYRORSS').checked){
			newScale = -1;	
		}
		else if(newScale == -1){
			newScale = 0;
		}
		for(i=0;i<=3;i++){
			if(i == newScale){
				eval('document.getElementById("scale' + newScale + '").style.background = "#000099"');
				eval('document.getElementById("scale' + newScale + '").style.color = "#FFFFFF"');
			}
			else{
				eval('document.getElementById("scale' + i + '").style.background = "#FFFFFF"');
				eval('document.getElementById("scale' + i + '").style.color = "#000000"');
			}
		}
		lastScale = newScale;
		changeTime();
	}

	// load myrorss objects
	myrorss_times = [];
	function loadMYRORSS(){
		if(!myrorssCase){
			return;
		}
		if(document.getElementById('showMYRORSS').checked){
			var geojson_format = new OpenLayers.Format.GeoJSON();
			//myrorss_points.removeAllFeatures();
			objectFeatures = [];
		
			// send list of processed myrorss objects and time range
			url = 'compare.php?start=' + timeMin + '&end=' + currentTime + '&list=' + myrorss_times.join() + '&case=' + acase + '&scale=0';
			var dataRequest = new XMLHttpRequest();
			dataRequest.open('GET', url, false);
			dataRequest.send();
		
			// return list of myrorss xmls to pull from server
			myrorss_xmls = dataRequest.responseText.split(",");
		
			// loop through list of xmls and pull from server
			for(i=0;i<myrorss_xmls.length;i++){
				url = 'archive/get_myrorss_objects.php?case=' + acase + '&scale=0&xml_time=' + myrorss_xmls[i];
				//alert(url);
				//break;
				var dataRequest = new XMLHttpRequest();
				dataRequest.open('GET', url, false);
				dataRequest.send();
				objects = dataRequest.responseText.split("\n");
				for(j=0;j<objects.length;j++){
					if(objects[j].length > 0){
						object = geojson_format.read(objects[j]);
						object[0].geometry.transform(proj,proj2);
						if(cwa_layer.features[0].geometry.intersects(object[0].geometry.getCentroid())){
							object[0].geometry.rotate(-1 * object[0].attributes.Orientation,object[0].geometry.getCentroid());
							objectFeatures.push(object[0]);
						}
					}
				}
				myrorss_times.push(myrorss_xmls[i]);
			}
			if(objectFeatures.length > 0){
				myrorss_points.addFeatures(objectFeatures);
			}
		}
	}
	
	// function to display MYRORSS objects based on current time
	function showMYRORSS(startVal,endVal){
		if(!myrorssCase){
			return;
		}
		startVal = timeCanvasVal.getAttr('time');
		myrorss_list = [];
		myrorss_objects.removeAllFeatures();
		//for(i=(myrorss_points.features.length - 1);i>=0;i--){
		for(i=0;i<myrorss_points.features.length;i++){
			//alert(startVal + ',' + endVal + ',' + myrorss_points.features[i].attributes.init);
			//break;
			rowID = myrorss_points.features[i].attributes.RowName;
			if(myrorss_points.features[i].attributes.init >= startVal && myrorss_points.features[i].attributes.init <= endVal && myrorss_list.indexOf(myrorss_points.features[i].attributes.RowName) == -1 && rowID.split(':')[0] == lastScale){
				myrorss_objects.addFeatures([myrorss_points.features[i].clone()]);
				myrorss_list.push(myrorss_points.features[i].attributes.RowName);
			}
		}
	}

	// changes button color on MYRORSS popup
	function swapColor(newButton,oldButton,labels){
                if(document.getElementById(oldButton)){
                        document.getElementById(oldButton).style.background = '#DDDDDD';
                        document.getElementById(oldButton).style.color = '#000000';
                }
                document.getElementById(newButton).style.background = '#000099';
                document.getElementById(newButton).style.color = '#FFFFFF';
                if(newButton != 'radar' && newButton != 'env'){
                        buttonLast = newButton;
                }
                if(labels.length > 0){
                        fontColors = ['#000000','#FF0000','#0066FF','#FF9933'];
                        innerHTML = '<span style="font-weight:bold;color:#009933">Current Time</span> ';
                        for(i=0;i<labels.length;i++){
                                innerHTML += '<span style="font-weight:bold;color:' + fontColors[i] + '">' + labels[i] + '</span> ';
                        }
                        document.getElementById('chartLabels').innerHTML = innerHTML;
                }
        }

	// loads buttons to MYRORSS popup
	function loadButtons(buttonID,featData,tNow){
                //evnButtonIDs = ['MUCAPE','0-1km Helicity','Shear','Sfc Dew Point','Sft. Temp','LCL HGHT','0C HGHT','-20C HGHT','WBZ HGHT'];
                //radButtonIDs = ['Reflectivity','Az. Shear','MESH','POSH','VIL','Size','Speed','Direction'];
                innerHTML = '';
                if(buttonID == 'env'){
                        //alert(featData['Avg_20CHt']);
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="MUCAPE" value="MUCAPE" onClick="swapColor(this.id,buttonLast,[\'Average\',\'Maximum\']); myrorss_chart(featData[\'times\'],[featData[\'AvgMUCAPE\'],featData[\'MaxMUCAPE\']],\'MUCAPE\',\'J kg<sup>-1</sup>.\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="0-1 km SRH" value="0-1 km SRH" onClick="swapColor(this.id,buttonLast,[\'Average\']); myrorss_chart(featData[\'times\'],[featData[\'Avg01Helcy\']],\'0-1 km SRH\',\'m<sup>2</sup>s<sup>-2</sup>.\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="Shear" value="Shear" onClick="swapColor(this.id,buttonLast,[\'Average 0-6 km\',\'Maximum 0-6 km\',\'Low-Level\',\'Mid-Level\']); myrorss_chart(featData[\'times\'],[featData[\'Avg06Shear\'],featData[\'Max06Shear\'],featData[\'LowLvlShear\'],featData[\'MidLvlShear\']],\'Shear\',\'s<sup>-1</sup>.\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="Sfc Dew Point" value="Sfc Dew Point" onClick="swapColor(this.id,buttonLast,[\'Maximum\']); myrorss_chart(featData[\'times\'],[featData[\'MaxSfcDew\']],\'Sfc Dew Point\',\'C\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="Sfc Temp" value="Sfc Temp" onClick="swapColor(this.id,buttonLast,[\'Maximum\']); myrorss_chart(featData[\'times\'],[featData[\'MaxSfcTemp\']],\'Sfc Temperature\',\'C\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="LCL HGHT" value="LCL HGHT" onClick="swapColor(this.id,buttonLast,[\'Average\',\'Minimum\']); myrorss_chart(featData[\'times\'],[featData[\'AvgLCLHt\'],featData[\'MinLCLHt\']],\'LCL Height\',\'m\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="0C HGHT" value="0C HGHT" onClick="swapColor(this.id,buttonLast,[\'Average\',\'Minimum\']); myrorss_chart(featData[\'times\'],[featData[\'Avg0CHt\'],featData[\'Min0CHt\']],\'0C Height\',\'m\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="-20C HGHT" value="-20C HGHT" onClick="swapColor(this.id,buttonLast,[\'Average\',\'Minimum\']); myrorss_chart(featData[\'times\'],[featData[\'Avg_20CHt\'],featData[\'Min_20CHt\']],\'-20C Height\',\'m\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="WBZ HGHT" value="WBZ HGHT" onClick="swapColor(this.id,buttonLast,[\'Average\',\'Minimum\']); myrorss_chart(featData[\'times\'],[featData[\'AvgWBZHt\'],featData[\'MinWBZHt\']],\'WBZ Height\',\'m\',' + tNow + ');" />';
                }
                else if(buttonID == 'radar'){
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="Reflectivity" value="Reflectivity" onClick="swapColor(this.id,buttonLast,[\'Average\',\'Maximum\',\'Freezing Level\']); myrorss_chart(featData[\'times\'],[featData[\'MeanRef\'],featData[\'MaxRef\'],featData[\'FreezeRef\']],\'Reflectivity\',\'dBZ\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="Az. Shear" value="Az. Shear" onClick="swapColor(this.id,buttonLast,[\'Total\']); myrorss_chart(featData[\'times\'],[featData[\'TotalLowAzShear\']],\'Total Low-Level Azimuthal Shear\',\'s<sup>-1</sup>\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="MESH" value="MESH" onClick="swapColor(this.id,buttonLast,[\'Maximum\',\'Lifetime Maximum\']); myrorss_chart(featData[\'times\'],[featData[\'MESH\'],featData[\'MESH30\']],\'MESH\',\'in.\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="POSH" value="POSH" onClick="swapColor(this.id,buttonLast,[\'Maximum\']); myrorss_chart(featData[\'times\'],[featData[\'POSH\']],\'POSH\',\'%\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="VIL" value="VIL" onClick="swapColor(this.id,buttonLast,[\'Total\',\'Maximum\']); myrorss_chart(featData[\'times\'],[featData[\'TotalVIL\'],featData[\'MaxVIL\']],\'VIL\',\'kg m<sup>-2</sup>\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="Size" value="Size" onClick="swapColor(this.id,buttonLast,[]); myrorss_chart(featData[\'times\'],[featData[\'Size\']],\'Tracked Feature Size\',\'km<sup>2</sup>\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="Speed" value="Speed" onClick="swapColor(this.id,buttonLast,[]); myrorss_chart(featData[\'times\'],[featData[\'speed\']],\'Tracked Feature Speed\',\'kts\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="Direction" value="Direction" onClick="swapColor(this.id,buttonLast,[]); myrorss_chart(featData[\'times\'],[featData[\'Direction\']],\'Tracked Feature Direction\',\'deg.\',' + tNow + ');" />';
                }
                document.getElementById('buttonList').innerHTML = innerHTML;
        }
