function startBore(){
	// swap button functions
	document.getElementById("boreButton").onclick = function(){endBore();}
	document.getElementById("boreButton").src = "images/boreButtonSelect.png";
        document.getElementById("boreButton").onmouseout = function(){this.src = "images/boreButtonSelect.png";}
        document.getElementById("boreButton").onmouseover = function(){this.src = "images/boreButtonSelect.png";}

	// add points to layer
	var p1 = new OpenLayers.Geometry.Point(boreStartX,boreStartY).transform(proj,proj2);
	var p2 = new OpenLayers.Geometry.Point(boreEndX,boreEndY).transform(proj,proj2);
	var point1 = new OpenLayers.Feature.Vector(p1, {'color':'cyan','sname':'Cool Side'});
	var point2 = new OpenLayers.Feature.Vector(p2, {'color':'red','sname':'Warm Side'});
        borePoints.addFeatures([point1, point2]);

	// add connector line to layer
	var line = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([p1, p2]),{'color':'black'});
	boreLine.addFeatures([line]);

	// activate controls
	modifyFeature3.activate();
	modifyFeature3.selectFeature(boreLine.features[boreLine.features.length - 1]);
        setLayerIndexes();
        selectGrid();
	document.getElementById('boreGen').innerHTML = '<input type="button" value="Generate Bore Diagnostics" onClick="genBore();" />';
}

function endBore(){
	// return to start
	modifyFeature3.deactivate();
	borePoints.removeAllFeatures();
	boreLine.removeAllFeatures();
	document.getElementById("boreButton").onclick = function(){startBore();}
        document.getElementById("boreButton").onmouseout = function(){this.src = "images/boreButton.png";}
        document.getElementById("boreButton").onmouseover = function(){this.src = "images/boreButtonHighlight.png";}
        document.getElementById("boreButton").src = "images/boreButton.png";
	document.getElementById('boreGen').innerHTML = '';
}

function setBorePoints(){
	var verts = boreLine.features[0].geometry.getVertices();
	var vert1 = verts[0].transform(proj2,proj);
	var vert2 = verts[1].transform(proj2,proj);
	boreStartX = vert1.x;
	boreStartY = vert1.y;
	boreEndX = vert2.x;
        boreEndY = vert2.y;
	vert1.transform(proj,proj2);
	vert2.transform(proj,proj2);
	modifyFeature3.unselectFeature(boreLine.features[boreLine.features.length - 1]);
	var p1 = new OpenLayers.Geometry.Point(boreStartX,boreStartY).transform(proj,proj2);
        var p2 = new OpenLayers.Geometry.Point(boreEndX,boreEndY).transform(proj,proj2);
	var point1 = new OpenLayers.Feature.Vector(p1, {'color':'cyan','sname':'Cool Side'});
        var point2 = new OpenLayers.Feature.Vector(p2, {'color':'red','sname':'Warm Side'});
	borePoints.removeAllFeatures();
        borePoints.addFeatures([point1, point2]);
        var line = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([p1, p2]),{'color':'black'});
	boreLine.removeAllFeatures();
        boreLine.addFeatures([line]);
	modifyFeature3.selectFeature(boreLine.features[boreLine.features.length - 1]);
}

function genBore(){
	//alert('Much to come!!');
	//return;

	try{
		var init = document.getElementById('initOpt').value;
		var model = document.getElementById('modelOpt').value;
		var member = document.getElementById('memberOpt').value;
		reqTime = timeCanvasNow.getAttr('time');
		var currentDate = new Date(timeCanvasVal.getAttr('time') * 1000);
		var initDate = Date.UTC(parseInt(init.slice(0,4)), parseInt(init.slice(4,6)) - 1, parseInt(init.slice(6,8)), parseInt(init.slice(8,10)),0,0,0);
		//var fTime = currentDate.getUTCFullYear() + '-' + pad(currentDate.getUTCMonth() + 1) + '-' + pad(currentDate.getUTCDate()) + '_' + pad(currentDate.getUTCHours()) + ':00:00';
		var fHour = parseInt((currentDate - initDate) / (1000 * 3600));

		//console.log(parseInt(init.slice(0,4)) + ',' + parseInt(init.slice(4,6)) + ',' + parseInt(init.slice(6,8)) + ',' + parseInt(init.slice(8,10)));
		//console.log(init + ',' + model + ',' + member + ',' + fHour);
	}
	catch(err){
		alert('No model data selected, try again.');
		return;
	}

	if(model == 'ouMap' || model == 'ouMap1km' || model == 'hrrr'){
		// do nothing
	}
	else{
		alert('This tool currently only works with the HRRR or the OU Map datasets.');
		return;
	}

	var link = 'genBore.php?x1=' + boreStartX + '&y1=' + boreStartY + '&x2=' + boreEndX + '&y2=' + boreEndY + '&model=' + model + '&member=' + member + '&init=' + init + '&fHour=' + fHour + '&rTime=' + reqTime;
        var dataRequest = new XMLHttpRequest();
        dataRequest.open('GET', link, false);
        dataRequest.send();

	alert('Please stand by while the Bore Diagnostic is generated.  When finished, the diagnostic information will automatically appear in a new tab.');

	getBore = true;

}

function getBoreImage(){

	var request = new XMLHttpRequest();
	request.open('GET', 'bore/' + reqTime + '.txt', false);
	request.onreadystatechange = function(){
		if(request.readyState === 4){
			if(request.status === 200 || request.status == 0){
				getBore = false;
		               	boreURL = 'http://www.nssl.noaa.gov/projects/facets/phi/bore.php?link=' + request.responseText.split("\n")[0] + '&reqTime=' + reqTime;
				openBore = true;
			}
		}
	}
	request.send(null);
}

function openBoreWindow(){
	getBore = false;
	openBore = false;
	var win = window.open(boreURL, '_blank');
	//setTimeout(win.focus, 0);
	win.focus();
}
