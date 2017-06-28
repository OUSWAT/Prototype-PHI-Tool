var buttonValLast;
var indexLast;
var seriesIndexLast;

$.jqplot.config.enablePlugins = true;
function probChart(threat1,threat2){

  if(newFeature){
	return;
  }

  var index = -999;
  for(var i=0;i<threat_area.features.length;i++){
        if(threat_area.features[i].attributes.data && threat_area.features[i].attributes.data['id'] != threat_area.features[i].attributes.data['types'][0].split('_')[0]){
                index = i;
        	break;
	}
  }
  if(index == -999){
	return;
  }

  stimes = [];
  for(var c=0;c<=120;c+=5){
        stimes.push(c);
  }

  var idx1 = 99;
  if(threat1 != null && threat1 != '' && threat1 != 0){
	  //alert(threat1 + ',' + threat_area.features[index].attributes.data['types']);
	  idx1 = threat_area.features[index].attributes.data['types'].indexOf(threat1);
	  //alert(threat_area.features[index].attributes.data['probs'] + ' | ' + index + ' | ' + idx1);
	  if(idx1 >= threat_area.features[index].attributes.data['probs'].length || idx1 == -1){
		return;
	  }
	  s1 = [];
	  if(idx1 < 0){
		//return;
	  }
	  for(var c=0;c<threat_area.features[index].attributes.data['probs'][idx1].length;c++){
	        if((c * 5) > threat_points.features.length){
	               	break;
	       	}
	       	else{
	                s1.push([c * 5,threat_area.features[index].attributes.data['probs'][idx1][c]]);
	        }
	  }
  	  s2 = [];
  	  if(stimes.indexOf(ftime) == -1){
		  s2 = [[ftime,threat_points.features[ftime].attributes.prob]];
	  }
	  toPlot = [s1,s2];
  }
  else{
	return;
  }

  if(threat2 != null && threat2 != '' && threat2 != 0){
	idx2 = threat_area.features[index].attributes.data['types'].indexOf(threat2);
	s3 = [];
	for(var c=0;c<threat_area.features[index].attributes.data['probs'][idx2].length;c++){
	        if((c * 5) > threat_points.features.length){
	                break;
	        }
	        else{
	                s3.push([c * 5,threat_area.features[index].attributes.data['probs'][idx2][c]]);
	        }
	}
	toPlot = [s1,s2,s3];
  }

  document.getElementById('chart1').innerHTML = '';
  document.getElementById('chart1').style.display = 'block';
  document.getElementById('chart2').style.display = 'none';
  document.getElementById('chart3').style.display = 'none';
  document.getElementById('chart5').style.display = 'none';
  document.getElementById('chart6').style.display = 'none';

  evtType = 'prob';

  if(threat_area.features[index].attributes.data['types'][0] == 'tornado1'){
	var title = 'Forecast Confidence of Tornado Occurrence';
  }
  else if(threat_area.features[index].attributes.data['types'][0] == 'severe1'){
	var title = 'Forecast Confidence of Any Severe Occurrence';
  }
  else if(threat_area.features[index].attributes.data['types'][0] == 'lightning1'){
	var title = 'Forecast Confidence of Lightning Occurrence';
  }
  else{
	var title = 'Forecast Confidence of Event Occurrence';
  }

  plot1 = $.jqplot('chart1',toPlot,{
     title: title,
     axesDefaults: {
         //pad: 1.01
     },
     axes: {
         xaxis: {
             pad: 1.01,
	     //renderer: $.jqplot.DateAxisRenderer,
             tickOptions: {
		 showGridline: true,
		 mark: 'inside',
		 fontWeight: 'bold'
                 //formatString: '%#m/%#d/%y'
             }
             //numberTicks: 4
         },
         yaxis: {
	     pad: 0,
	     //max: 100,
	     //min: 0,
	     rendererOptions: { forceTickAt0: true, forceTickAt100: true },
             tickOptions: {
		 showGridline: true,
		 mark: 'inside',
                 formatString: '%.0f%'
             }
         }
     },
     canvasOverlay: {
            show: true,
            objects: [
               	{ 
                    rectangle: { 
                       	xmin: -20, 
                       	xmax: (c * 5) + 20, 
                       	ymin: 0, 
                       	ymax: 20,
                       	xminOffset: "0px", 
                       	xmaxOffset: "0px", 
                       	yminOffset: "0px", 
                       	ymaxOffset: "0px",
                       	color: "rgba(0, 204, 0, 0.6)", 
                       	showTooltip: true, 
                       	tooltipFormatString: "Low",
			tooltipLocation: 'e'
                    }
               	},
               	{
                    rectangle: { 
                       	xmin: -20, 
                       	xmax: (c * 5) + 20, 
                       	ymin: 20, 
                       	ymax: 40,
                       	xminOffset: "0px", 
                       	xmaxOffset: "0px", 
                       	yminOffset: "0px", 
                       	ymaxOffset: "0px",
                       	color: "rgba(255, 255, 0, 0.6)", 
                       	showTooltip: true, 
                       	tooltipFormatString: "Guarded",
			tooltipLocation: 'e'
                    }
               	},
               	{ 
                    rectangle: { 
                       	xmin: -20, 
                       	xmax: (c * 5) + 20, 
                       	ymin: 40, 
                       	ymax: 60,
                       	xminOffset: "0px", 
                       	xmaxOffset: "0px", 
                       	yminOffset: "0px", 
                        ymaxOffset: "0px",
                        color: "rgba(255, 128, 0, 0.6)", 
                        showTooltip: true, 
                        tooltipFormatString: "Elevated" ,
			tooltipLocation: 'e'
                    }
                },
                { 
                    rectangle: { 
                       	xmin: -20, 
                       	xmax: (c * 5) + 20, 
                        ymin: 60, 
                        ymax: 80,
                        xminOffset: "0px", 
                        xmaxOffset: "0px", 
                        yminOffset: "0px", 
                       	ymaxOffset: "0px",
                       	color: "rgba(255, 0, 0, 0.6)", 
                       	showTooltip: true, 
                       	tooltipFormatString: "High",
			tooltipLocation: 'e' 
                    }
                },
               	{ 
                    rectangle: { 
                       	xmin: -20, 
                       	xmax: (c * 5) + 20, 
                       	ymin: 80, 
                       	ymax: 100,
                       	xminOffset: "0px", 
                       	xmaxOffset: "0px", 
                       	yminOffset: "0px", 
                       	ymaxOffset: "0px",
                       	color: "rgba(255, 0, 255, 0.6)", 
                       	showTooltip: true, 
                       	tooltipFormatString: "Severe",
			tooltipLocation: 'e' 
                    } 
               	} 
           ]
     },
     series:[{
	color:'#000000',
	pointLabels: { show:false },
	markerOptions: { size: 14},
	rendererOptions: {
	    //smooth: true
	},
	dragable: {
            constrainTo: 'y'
    	}
     },{
	color: '#000000',
	showLine:false,
        markerOptions: { size: 7, style:"x" },
	pointLabels: { show:true,edgeTolerance: 5 }
     },{
        color:'#000000',
        pointLabels: { show:false },
        markerOptions: { size: 14},
        rendererOptions: {
            //smooth: true
        },
        dragable: {
            constrainTo: 'y'
        }
     }],
     highlighter: {
         sizeAdjust: 10,
         tooltipLocation: 'n',
         tooltipAxes: 'y',
         tooltipFormatString: '<b><i><span style="color:black;">Prob = </i></b> %.0f%</span>',
         useAxesFormatters: false
     },
     grid: {
	 drawGridLines: true,
	 gridLineColor: 'rgb(0,0,0)',
	 background: 'transparent',
	 borderColor: 'rgb(0,0,0)',
	 shadow: false
     },
     cursor: {
         show: true
     }
  });
};

var dragStart = false;
var feat_x;
var feat_y;

function probChartDrag(){
	// lots of nasty code because cannot find series index in returned objects.  Boo!
	if(ftime != 0){
                alert('Changes cannot be made while previewing threat evolution');
        }
	idxs = [];
	buttonVal = document.getElementById(oldButton).value;
	if(buttonVal == 'P(Tornado)'){
		if(types.indexOf('tornado1') != -1){
			idxs.push(types.indexOf('tornado1'));
		}
		if(types.indexOf('tornado2') != -1){
                        idxs.push(types.indexOf('tornado2'));
                }
	}
	else if(buttonVal == 'P(Severe)'){
                if(types.indexOf('severe1') != -1){
                        idxs.push(types.indexOf('severe1'));
                }
                if(types.indexOf('severe2') != -1){
                        idxs.push(types.indexOf('severe2'));
                }
        }
	else if(buttonVal == 'P(Hail)'){
		if(types.indexOf('hail1') != -1){
                        idxs.push(types.indexOf('hail1'));
                }
                if(types.indexOf('hail2') != -1){
                        idxs.push(types.indexOf('hail2'));
                }
        }
        else if(buttonVal == 'P(Wind)'){
		if(types.indexOf('wind1') != -1){
                        idxs.push(types.indexOf('wind1'));
                }
                if(types.indexOf('wind2') != -1){
                        idxs.push(types.indexOf('wind2'));
                }
        }
        else if(buttonVal == 'P(Lightning)'){
		if(types.indexOf('lightning1') != -1){
                        idxs.push(types.indexOf('lightning1'));
                }
                if(types.indexOf('lightning2') != -1){
                        idxs.push(types.indexOf('lightning2'));
                }
        }
	var k2 = 0;
	for(var k=0;k<idxs.length;k++){
		if(document.getElementsByName('gridType').selectedIndex == 1){
			if(selFeature != null){
				feat_x = selFeature.attributes.x;
				feat_y = selFeature.attributes.y;
				selectControl.unselectAll();
			}
			for(var i=0;i<threat_area.features.length;i++){
		                if(threat_area.features[i].attributes.data['id'] == tempId){
		                       	index = i;
		                       	break;
		        	}
		        }
			new_probs = [];
			for(var i=0;i<threat_area.features[index].attributes.data['probs'][idxs[k]].length;i++){
				if(i < plot1.series[k2].data.length){
					if(plot1.series[k2].data[i][1] != threat_area.features[index].attributes.data['probs'][idxs[k]][i] && ftime == 0){
						if(k2 == 2 && plot1.series[k2].data[i][1] > threat_area.features[index].attributes.data['probs'][idxs[k-1]][i]){
							new_probs.push(threat_area.features[index].attributes.data['probs'][idxs[k-1]][i]);
						}
						else if(k2 == 0 && idxs.length > 1 && plot1.series[k2].data[i][1] < threat_area.features[index].attributes.data['probs'][idxs[k+1]][i]){
							new_probs.push(threat_area.features[index].attributes.data['probs'][idxs[k+1]][i]);
						}
						else{
							new_probs.push(Math.round(plot1.series[k2].data[i][1]));
						}
					}
					else{
						new_probs.push(threat_area.features[index].attributes.data['probs'][idxs[k]][i]);
					}
				}
				else{
					new_probs.push(threat_area.features[index].attributes.data['probs'][idxs[k]][i]);
				}
			}
			threat_area.features[index].attributes.data['probs'][idxs[k]] = new_probs;
			if(threat_area.features[index].attributes.data['automated'] != 0){
				threat_area.features[index].attributes.data.modified['probs'] = 1;
				threat_area.features[index].attributes.data.modified['duration'] = 1;
				console.log('probs modified');
			}
			if(k == (idxs.length - 1)){
				setHistory = false;
				modifyThreat(false);
				ndfd_grid2.removeAllFeatures();
				lightUpGridAccum2(true);
			}
			if(feat_x != null){
				for(var i=0;i<ndfd_grid.features.length;i++){
					if(ndfd_grid.features[i].attributes.x == feat_x && ndfd_grid.features[i].attributes.y == feat_y){
						selectControl.select(ndfd_grid.features[i]);
						feat_x = null;
						feat_y = null;
						continue;
					}
				}
			}
		}
		else{
			new_probs = [];
		       	for(var i=0;i<modifyFeature.feature.attributes.data['probs'][idxs[k]].length;i++){
		               	if(i < plot1.series[k2].data.length){
		                       	if(plot1.series[k2].data[i][1] != modifyFeature.feature.attributes.data['probs'][idxs[k]][i] && ftime == 0){
						if(k2 == 2 && plot1.series[k2].data[i][1] > modifyFeature.feature.attributes.data['probs'][idxs[k-1]][i]){
							new_probs.push(modifyFeature.feature.attributes.data['probs'][idxs[k-1]][i]);
						}
						else if(k2 == 0 && idxs.length > 1 && plot1.series[k2].data[i][1] < modifyFeature.feature.attributes.data['probs'][idxs[k+1]][i]){
							new_probs.push(modifyFeature.feature.attributes.data['probs'][idxs[k+1]][i]);
						}
						else{
			                               	new_probs.push(Math.round(plot1.series[k2].data[i][1]));
						}
		                       	}
		                       	else{
		                               	new_probs.push(modifyFeature.feature.attributes.data['probs'][idxs[k]][i]);
		                       	}
		                }
		               	else{
		                       	new_probs.push(modifyFeature.feature.attributes.data['probs'][idxs[k]][i]);
		                }
		        }
			if(wofR){
				var j = -1;
				for(var i=0;i<wof_points.features.length;i++){
					if((i%5) == 0){
						j++;
					}
					slp = (new_probs[j+1] - new_probs[j]) / 5;
		                        y_int = new_probs[j] - ((j * 5) * slp);
		                        probVal = (i * slp) + y_int;
					wof_points.features[i].attributes.prob = probVal
				}
			}
		        modifyFeature.feature.attributes.data['probs'][idxs[k]] = new_probs;
			if(modifyFeature.feature.attributes.data['automated'] != 0){
                                modifyFeature.feature.attributes.data.modified['probs'] = 1;
				modifyFeature.feature.attributes.data.modified['duration'] = 1;
				console.log('probs modified');
                        }
			if(k == (idxs.length - 1)){
				setHistory = false;
				modifyThreat(false);
				ndfd_grid2.removeAllFeatures();
				lightUpGridAccum2(true);
			}
		}
		k2 += 2;
	}
	dragStart = false;
	checkPrediction();
}

	var chartX = [];
	var chartY = [];
	function probChartMouseMove(ev, seriesIndex, pointIndex, data2){
		if(drawProbs){
			chartX.push(pointIndex.xaxis);
			chartY.push(pointIndex.yaxis);
		}
		else if(data2 != null && !dragStart && drawProbs != null){
			for(var i=0;i<threat_area.features.length;i++){
	                        if(threat_area.features[i].attributes.data['id'] == tempId){
	                                var index = i;
	                                break;
	                        }
	                }
			buttonVal = document.getElementById(oldButton).value;
			if(buttonVal == buttonValLast && index == indexLast && data2.seriesIndex == seriesIndexLast){
				return;
			}
			buttonValLast = buttonVal;
			indexLast = index;
			seriesIndexLast = data2.seriesIndex;
		        if(buttonVal == 'P(Tornado)'){
				if(data2.seriesIndex == 2){
		                        probIdx = types.indexOf('tornado2');
		                }
				else if(data2.seriesIndex == 0){
		                        probIdx = types.indexOf('tornado1');
		                }
		        }
			else if(buttonVal == 'P(Severe)'){
                                if(data2.seriesIndex == 2){
                                        probIdx = types.indexOf('severe2');
                                }
                                else if(data2.seriesIndex == 0){
                                        probIdx = types.indexOf('severe1');
                                }
                        }
		        else if(buttonVal == 'P(Hail)'){
				if(data2.seriesIndex == 2){
	                                probIdx = types.indexOf('hail2');
	                        }
				else if(data2.seriesIndex == 0){
	                                probIdx = types.indexOf('hail1');
	                        }
		        }
		        else if(buttonVal == 'P(Wind)'){	
				if(data2.seriesIndex == 2){
	                                probIdx = types.indexOf('wind2');
	                        }
				else if(data2.seriesIndex == 0){
	                                probIdx = types.indexOf('wind1');
	                        }
		        }
		        else if(buttonVal == 'P(Lightning)'){
	                        if(data2.seriesIndex == 2){
	                                probIdx = types.indexOf('lightning2');
	                        }
	                        else if(data2.seriesIndex == 0){
	                                probIdx = types.indexOf('lightning1');
	                        }
		        }
			setHistory = false;
			modifyThreat(false);
			ndfd_grid2.removeAllFeatures();
			lightUpGridAccum2(true);
		}
	}

function setProbIdx(){
	for(var i=0;i<threat_area.features.length;i++){
                if(threat_area.features[i].attributes.data['id'] == tempId){
                        index = i;
                	break;
        	}
        }
        buttonVal = document.getElementById(oldButton).value;
	if(buttonVal == buttonValLast){
		return;
	}
	buttonValLast = buttonVal;
	if(buttonVal == 'P(Tornado)'){
		probIdx = types.indexOf('tornado1');
	}
	else if(buttonVal == 'P(Severe)'){
                probIdx = types.indexOf('severe1');
        }
	else if(buttonVal == 'P(Hail)'){
		probIdx = types.indexOf('hail1');
	}
	else if(buttonVal == 'P(Wind)'){
		probIdx = types.indexOf('wind1');
	}
	else if(buttonVal == 'P(Lightning)'){
		probIdx = types.indexOf('lightning1');
	}
	setHistory = false;
	//modifyThreat(false);
	//lightUpGridAccum2(true);
}

function interpolateTrend(interp){
	end = modifyFeature.feature.attributes.data['duration']	/ 5;
	firstVal = modifyFeature.feature.attributes.data['probs'][0][0];
	lastVal = modifyFeature.feature.attributes.data['probs'][0][parseInt(end)];
	diff = (lastVal - firstVal) / end;
	newProbs = [];
	var idx = -99
	if(interp == 'prob' && modifyFeature.feature.attributes.data['types'][0] == 'severe1'){
		var obj = getAutoGeometry();
                if(obj != null){
			var newProbs = obj.attributes.data['probs'][0];
			modifyFeature.feature.attributes.data['probs'][0] = newProbs;
		        modifyFeature.feature.attributes.data.modified['probs'] = 1;
		        modifyFeature.feature.attributes.data.modified['duration'] = 1;
		        setHistory = false;
		        modifyThreat(false);
		        ndfd_grid2.removeAllFeatures();
		        lightUpGridAccum2(true);
		        checkPrediction();
			return;
		}
	}
	if(interp == 'prob' || interp == 'probHail' || interp == 'probWind'){
		firstVal = parseInt(modifyFeature.feature.attributes.data.ProbSevere[interp]);
		modifyFeature.feature.attributes.data.ProbSevere[interp + 'Interp'] = firstVal; // record that forecaster looked at it
		interp = 'linear';
                lastVal = 0;
                diff = (lastVal - firstVal) / end;
	}
	else if(interp == 'probTor'){
		if(modifyFeature.feature.attributes.data.ProbSevere['prob'] == 0){
			for(var i=0;i<probSevereObjects.features.length;i++){
				if(modifyFeature.feature.geometry.intersects(probSevereObjects.features[i].geometry)){
					idx = i;
					break;
				}
			}
			if(idx == -99){
				alert('Could not find matching ProbSevere object - make sure the object is placed over a ProbSevere object and try again');
				return;
			}
			firstVal = parseInt(probSevereObjects.features[idx].attributes.data.ProbSevere['probTor']);
		}
		else{
			firstVal = parseInt(modifyFeature.feature.attributes.data.ProbSevere['probTor']);
		}
		modifyFeature.feature.attributes.data.ProbSevere[interp + 'Interp'] = firstVal; // record that forecaster looked at it
		interp = 'linear';
		lastVal = 0;
		diff = (lastVal - firstVal) / end;
	}
	if(interp == 'bell'){
		maxVal = modifyFeature.feature.attributes.data['probs'][0].max();
		hitMaxVal = false;
		end2 = modifyFeature.feature.attributes.data['probs'][0].indexOf(maxVal);
	}
	for(var i=0;i<modifyFeature.feature.attributes.data['probs'][0].length;i++){
		if(i <= end){
			if(interp == 'linear'){
				newVal = parseInt(firstVal + (i * diff));
			}
			else if(interp == 'decay'){
				disNorm = (i / end);
				newVal = parseInt(((lastVal - firstVal) * (disNorm * disNorm)) + firstVal);
			}
			else if(interp == 'exp'){
                                disNorm = 1 - (i / end);
                                newVal = parseInt(((firstVal - lastVal) * (disNorm * disNorm)) + lastVal);
                        }
			else if(interp == 'obs'){
				firstVal = 100;
				lastVal = 0;
				disNorm = (i / end);
                                newVal = parseInt(((lastVal - firstVal) * (disNorm * disNorm)) + firstVal);
				if(i == 0){
					document.getElementById('src').value = 'observed';
				}
                       	}
			else if(interp == 'plus5'){
                               	newVal = modifyFeature.feature.attributes.data['probs'][0][i] + 5;
                       	}
			else if(interp == 'minus5'){
                               	newVal = modifyFeature.feature.attributes.data['probs'][0][i] - 5;
                       	}
			else if(interp == 'bell'){
				if(modifyFeature.feature.attributes.data['probs'][0][i] == maxVal){
					hitMaxVal = true;
					newVal = modifyFeature.feature.attributes.data['probs'][0][i];
				}
				else if(hitMaxVal){
					disNorm = ((i - end2) / (end - end2));
					newVal = parseInt(((lastVal - maxVal) * (disNorm * disNorm)) + maxVal);
				}
				else{
					disNorm = 1 - (i / end2);
                                       	newVal = parseInt(((firstVal - maxVal) * (disNorm * disNorm)) + maxVal);
				}
			}
			if(newVal > 100){
				newVal = 100;
			}
			if(newVal < 0){
				newVal = 0;
			}
			newProbs.push(newVal);
			if(i == end){
				probDiff = newVal - newProbs[newProbs.length - 2];
			}
		}
		else{
			newVal = newVal + probDiff;
			if(newVal > 100){
				newVal = 100;
			}
			if(newVal < 0){
				newVal = 0;
			}
			newProbs.push(newVal);
		}
	}
	modifyFeature.feature.attributes.data['probs'][0] = newProbs;
	modifyFeature.feature.attributes.data.modified['probs'] = 1;
	modifyFeature.feature.attributes.data.modified['duration'] = 1;
        //console.log('probs modified');
	setHistory = false;
	modifyThreat(false);
	ndfd_grid2.removeAllFeatures();
	lightUpGridAccum2(true);
	checkPrediction();
}

function checkPrediction(){
	// error reduction code - my favorite (not)
	var pred = document.getElementById('pred').value;
	if(pred == 'explicit' || predFound){
		return;
	}
	var vals = [modifyFeature.feature.attributes.data['probs'][0][0]];
	for(var i=1;i<(modifyFeature.feature.attributes.data['duration']/5);i++){
		for(var j=0;j<vals.length;j++){
			if(modifyFeature.feature.attributes.data['probs'][0][i] > vals[j]){
				predFound = true;
				break;
			}
		}
		if(predFound){
			break;
		}
		vals.push(modifyFeature.feature.attributes.data['probs'][0][i]);
	}
	if(predFound){
		alert('Warning: Your forecast confidence trend contains an increase with the persistence prediction option selected.  It is recommended to 1) forecast a monotonically decreasing confidence trend with persistence prediction or 2) change the prediction to explicit.  See training web site for further information.');
	}
}

function drawProbsInit(){
	if(!drawProbs){
		chartX = [];
		chartY = []; 
		drawProbs = true; 
		document.getElementById('drawProbsButton').value = 'DRAWING';
	}
}

function probInterp(ev, seriesIndex, pointIndex, data2){
	if(drawProbs){
		drawProbs = false;
		chartMin = chartX.min();
		chartMax = chartX.max();
		if(chartMin > 0 || chartMax < modifyFeature.feature.attributes.data['duration']){
			alert('Not enough data to create trend, try again.');
			document.getElementById('drawProbsButton').value = 'Draw';
			return;
		}
		newProbs = [];
		end = modifyFeature.feature.attributes.data['duration'] / 5;
		for(var i=0;i<modifyFeature.feature.attributes.data['probs'][0].length;i++){
			if(i <= end){
				for(var j=0;j<chartX.length;j++){
					if(Math.round(chartX[j]) == (i * 5)){
						newVal = Math.round(chartY[j]);
						break;
					}
				}
				newProbs.push(newVal);
			}
			else{
				newProbs.push(newVal);
			}
		}
		modifyFeature.feature.attributes.data['probs'][0] = newProbs;
		modifyFeature.feature.attributes.data.modified['probs'] = 1;
		modifyFeature.feature.attributes.data.modified['duration'] = 1;
	       	console.log('probs modified');
	        setHistory = false;
		modifyThreat(false);
		ndfd_grid2.removeAllFeatures();
		lightUpGridAccum2(true);
		chartX = [];
		chartY = [];
		document.getElementById('drawProbsButton').value = 'Draw';
		checkPrediction();
	}
	else{
		//clearGridPreview();
	}
}

function computePeakShearProbs(){
	shearVal = parseFloat(document.getElementById('peakShear').value);
	var probVal = null;
	for(var key in peakShearLookupTable){
		if(key > shearVal){
			var slp = (peakShearLookupTable[key] - val1) / (key - key1);
                        var y_int = val1 - (key1 * slp);
                        probVal = parseInt((shearVal * slp) + y_int);
			break;
		}
		var val1 = peakShearLookupTable[key];
		var key1 = key;
	}

	if(probVal == null){
		if(shearVal >= 85){
			probVal = 100;
		}
		else{
			return;
		}
	}

	var idx = parseInt(modifyFeature.feature.attributes.data['duration'] / 5);
	modifyFeature.feature.attributes.data['probs'][0][0] = probVal;
	modifyFeature.feature.attributes.data['probs'][0][idx] = 0;
	modifyFeature.feature.attributes.data['peakShearVal'] = shearVal;
	modifyFeature.feature.attributes.data['peakShearProb'] = probVal;
	interpolateTrend('linear');
}
