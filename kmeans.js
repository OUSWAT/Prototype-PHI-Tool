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
	function changeKmeansScale(newScale){
		if(!document.getElementById('showKmeans').checked){
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

	// load kmeans objects
	var kmeans_times = [];
	function loadKmeans(){
		if(!kmeans){
			return;
		}
		if(document.getElementById('showKmeans').checked){
			var geojson_format = new OpenLayers.Format.GeoJSON();
			//kmeans_points.removeAllFeatures();
			objectFeatures = [];
		
			// send list of processed kmeans objects and time range
			for(i8=0;i8<kmeans_times.length;i8++){
				if(kmeans_times[i8] < scans[0][0].split('_')[1]){
					kmeans_times.splice(i8,1);
					break;
				}
			}
			if(archive && acase == '20130805' || archive && acase == '20120613'){
				url = 'compareKmeans.php?list=' + kmeans_times.join() + '&site=' + site + '&case=' + acase + '&nowTime=' + currentTime + '&scale=1&minTime=' + scans[0][0].split('_')[1];
				//alert(url);
			}
			else{
				url = 'compareKmeans.php?list=' + kmeans_times.join() + '&scale=1&minTime=' + scans[0][0].split('_')[1];
			}
			var dataRequest = new XMLHttpRequest();
			dataRequest.open('GET', url, false);
			dataRequest.send();
			if(dataRequest.responseText.length == 0){
				return;
			}
		
			// return list of kmeans xmls to pull from server
			kmeansTimes = dataRequest.responseText.split(",");
			//alert(kmeansTimes);
			// loop through list of xmls and pull from server
			for(i8=0;i8<kmeansTimes.length;i8++){
				if(archive && acase == '20130805' || archive && acase == '20120613'){
					url = 'get_kmeans_objects.php?xml_time=' + kmeansTimes[i8] + '&site=' + site + '&case=' + acase;
				}
				else{
					url = 'get_kmeans_objects.php?xml_time=' + kmeansTimes[i8];
				}
				var dataRequest = new XMLHttpRequest();
				dataRequest.open('GET', url, false);
				dataRequest.send();
				objects = dataRequest.responseText.split("\n");
				for(j8=0;j8<objects.length;j8++){
					if(objects[j8].length > 0){
						object = geojson_format.read(objects[j8]);
						object[0].geometry.transform(proj,proj2);
						objectFeatures.push(object[0]);
					}
				}
				kmeans_times.push(kmeansTimes[i8]);
			}
			if(objectFeatures.length > 0){
				kmeans_points.addFeatures(objectFeatures);
			}
		}
	}
	
	// function to display K-means objects based on current time
	function showKmeans(startVal,endVal){
		if(!kmeans){
                       	return;
               	}
		startVal = timeCanvasVal.getAttr('time');
		kmeans_list = [];
		kmeans_objects.removeAllFeatures();
		for(i9=(kmeans_points.features.length - 1);i9>=0;i9--){
			if(kmeans_points.features[i9].attributes.init >= startVal && kmeans_points.features[i9].attributes.init <= endVal && kmeans_points.features[i9].attributes.Scale == lastScale && kmeans_list.indexOf(kmeans_points.features[i9].attributes.RowName) == -1){
				kmeans_objects.addFeatures([kmeans_points.features[i9].clone()]);
				kmeans_list.push(kmeans_points.features[i9].attributes.RowName);
			}
		}
	}

	// loads buttons to K-means popup
	function loadKmeansButtons(buttonID,featData,tNow){
                innerHTML = '';
                if(buttonID == 'env'){
			// nothing yet
                }
                else if(buttonID == 'radar'){
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="MESH" value="MESH" onClick="swapColor(this.id,buttonLast,[\'Maximum\']); kmeans_chart(featData[\'times\'],[featData[\'MESH\']],\'MESH\',\'in.\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="OrtegaHailProb" value="Ortega Hail Prob." onClick="swapColor(this.id,buttonLast,[\'Maximum\']); kmeans_chart(featData[\'times\'],[featData[\'OrtegaHailProb\']],\'Ortega Hail Probability\',\'%\',' + tNow + ');" />';
			innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="LightningProbabilityNext30min" value="Lightning Prob." onClick="swapColor(this.id,buttonLast,[\'Maximum\']); kmeans_chart(featData[\'times\'],[featData[\'LightningProbabilityNext30min\']],\'Probability of Lightning in 30 min.\',\'%\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="Size" value="Size" onClick="swapColor(this.id,buttonLast,[]); kmeans_chart(featData[\'times\'],[featData[\'Size\']],\'Tracked Feature Size\',\'km<sup>2</sup>\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="Speed" value="Speed" onClick="swapColor(this.id,buttonLast,[]); kmeans_chart(featData[\'times\'],[featData[\'speed\']],\'Tracked Feature Speed\',\'kts\',' + tNow + ');" />';
                        innerHTML += '<input type="button" style="width:120px;background:#DDDDDD" id="Direction" value="Direction" onClick="swapColor(this.id,buttonLast,[]); kmeans_chart(featData[\'times\'],[featData[\'Direction\']],\'Tracked Feature Direction\',\'deg.\',' + tNow + ');" />';
                }
                document.getElementById('buttonList').innerHTML = innerHTML;
        }
