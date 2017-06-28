function myrorss_chart(times,vals,title,units,now) {

	if(title == 'Tracked Feature Direction' || vals[0].length == 1 || title == 'WoF Updraft Helicity' || title == 'WoF Vorticity' || title == 'Direction' || title == 'Best Track IDs'){
		dirBool1 = false;
		dirBool2 = true;
	}
	else{
		dirBool1 = true;
		dirBool2 = false;
	}

	if(title == 'Severe Wind (Lagerquist) Probability' || title == 'ProbSevere' || title == 'ProbHail' || title == 'ProbWind' || title == 'ProbTor' || title == 'Probability' || title == 'Storm Classification Probability'){
		var yMin = 0;
               	var yMax = 100;
	}
	else if(title == 'MESH'){
		var yMin = 0;
               	var yMax = 4;
	}
	else if(title == 'Duration'){
               	var yMin = 0;
               	var yMax = 120;
       	}
	else if(title == 'Direction'){
               	var yMin = 0;
               	var yMax = 360;
       	}
	else if(title == 'Speed'){
               	var yMin = 0;
               	var yMax = 100;
       	}
	else if(title == 'MUCAPE' || title == 'MLCAPE'){
               	var yMin = 0;
               	var yMax = 9000;
       	}
	else if(title == '0-1 km SRH'){
               	var yMin = 0;
               	var yMax = 400;
       	}
	else if(title == 'Max Low-Level AzShear' || title == '98% Low-Level AzShear' || title == '98% Mid-Level AzShear'){
               	var yMin = 0;
               	var yMax = 0.04;
       	}
	else{
		var yMin = null;
		var yMax = null;
	}

	var s2 = [];
	var s3 = [];
	var s4 = [];
	var s5 = [];
	var s6 = [];
	var max = -99999999999999;
	var min = 99999999999999;
	var num = 1;
	for(var i=0;i<vals.length;i++){
		num++;
		for(var j=0;j<=times.length;j++){
			if(vals[i][j] != -99900 && vals[i][j] != -999 && parseInt(vals[i][j]) != -3933 && vals[i][j] != 'NA' && vals[i][j] != -99903){
				eval('s' + num + '.push([times[j],vals[i][j]])');
				if(vals[i][j] > max){
					max = vals[i][j];
				}
				if(vals[i][j] < min){
					min = vals[i][j];
				}
			}
		}
	}
	if(max == -99999999999999){
		max = 1;
	}
	if(min == 99999999999999){
		min = 0;
	}
	if(yMin != null){
		min = yMin;
		max = yMax;
	}
	var s1 = [[now,min],[now,max]];
	if(title == 'Severe Wind (Lagerquist) Probability'){
		var label1 = '0km';
                var label2 = '5km';
                var label3 = '10km';
		var label4 = '';
               	var label5 = '';
		var show2 = true;
		var show3 = true;
		var show4 = false;
               	var show5 = false;
	}
	else if(title == 'Storm Classification Probability'){
		// "qlcs": 0.10607777828493914, "supercell": 0.0002298513193819398, "disorganized": 0.8122640305076906, "linear hybrid": 0.03927241025613414, "marginal supercell": 0.04215592963185424
		var label1 = 'QLCS';
               	var label2 = 'Supercell';
                var label3 = 'Disorganized';
		var label4 = 'Linear Hybrid';
               	var label5 = 'Marginal Supercell';
		var show2 = true;
               	var show3 = true;
		var show4 = true;
		var show5 = true;
	}
	else if(title == 'All Lightning'){
		var label1 = 'IC';
		var label2 = 'CG';
		var label3 = 'Total';
		var label4 = '';
               	var label5 = '';
		var show2 = true;
		var show3 = true;
		var show4 = false;
               	var show5 = false;
	}
	else if(title == 'Direction' && num == 3 || title == 'Speed' && num == 3 || title == 'Duration' && num == 3 || title == 'Probability' && num == 3){
               	var label1 = title;
                var label2 = user;
		var label3 = '';
		var label4 = '';
               	var label5 = '';
                var show2 = true;
                var show3 = false;
		var show4 = false;
               	var show5 = false;
        }
	else{
                var label1 = title;
		var label2 = '';
		var label3 = '';
		var label4 = '';
                var label5 = '';
		var show2 = false;
		var show3 = false;
		var show4 = false;
                var show5 = false;
	}

	// add LSRs as vertical lines
	var hailLSRs = [];
	var windLSRs = [];
	var torLSRs = [];
	var highlightLSRs = []
	for(var i=0;i<lsrs.features.length;i++){
		if(lsrs.features[i].attributes.epoch > currentTime && !analysis){
			continue;
		}
		if(lsrs.features[i].attributes.color == 'rgb(255,255,0)'){
			highlightLSRs.push([(lsrs.features[i].attributes.epoch - currentTime) / 60,min]);
		}
		else if(lsrs.features[i].attributes.hazard == 'wind'){
			windLSRs.push([(lsrs.features[i].attributes.epoch - currentTime) / 60,min]);
		}
		else if(lsrs.features[i].attributes.hazard == 'hail'){
			hailLSRs.push([(lsrs.features[i].attributes.epoch - currentTime) / 60,min]);
		}
		else if(lsrs.features[i].attributes.hazard == 'tornado'){
			torLSRs.push([(lsrs.features[i].attributes.epoch - currentTime) / 60,min]);
		}
	}

	if(num == 2){
		var arrays = [s1,hailLSRs,windLSRs,torLSRs,highlightLSRs,s2];
	}
	else if(num == 3){
		var arrays = [s1,hailLSRs,windLSRs,torLSRs,highlightLSRs,s2,s3];
	}
	else if(num == 4){
                var arrays = [s1,hailLSRs,windLSRs,torLSRs,highlightLSRs,s2,s3,s4];
        }
	else if(num == 5){
                var arrays = [s1,hailLSRs,windLSRs,torLSRs,highlightLSRs,s2,s3,s4,s5];
        }
	else if(num == 6){
               	var arrays = [s1,hailLSRs,windLSRs,torLSRs,highlightLSRs,s2,s3,s4,s5,s6];
        }

	//console.log(arrays);
	evtType = 'prob';
	document.getElementById('chart9').innerHTML = '';

	plot9 = $.jqplot('chart9',arrays,{
		title: {
			text: title + ' Trend (' + units + ')',
			show: true,
			color: 'rgb(255,255,255)'
		},
		axesDefaults: {
			tickOptions: {
				textColor: 'rgb(255,255,255)'
			},
			labelOptions: {
				textColor: '#FFFFFF'
			},
			labelRenderer: $.jqplot.CanvasAxisLabelRenderer
		},
		axes: {
			xaxis: {
				label: 'minutes',
				tickOptions: {
					showGridline: true,
					mark: 'inside',
					fontWeight: 'bold'
				}
			},
			yaxis: {
				//label: units,
				tickOptions: {
					pad: 1,
					showGridline: true,
					mark: 'inside'
				},
				min: yMin,
				max: yMax
			}
		},
		series:[{
			color: 'rgb(255,255,255)',
                        lineWidth: 3,
                        markerOptions: { show:false},
                        pointLabels: { show:false },
			showLabel: false,
			isDragable: false
		},{
			color:'rgb(0,153,0)',
                       	lineWidth: 5,
                        showLine: false,
                        markerOptions: { show:true},
                       	pointLabels: { show:false },
			isDragable: false,
			showLabel: false
                },{
                       	color:'rgb(0,0,255)',
                       	lineWidth: 5,
                       	showLine: false,
                       	markerOptions: { show:true},
                       	pointLabels: { show:false },
			isDragable: false,
			showLabel: false
                },{
                       	color:'rgb(255,0,0)',
                       	lineWidth: 5,
                       	showLine: false,
                       	markerOptions: { show:true},
                       	pointLabels: { show:false },
			isDragable: false,
			showLabel: false
               	},{
                       	color:'rgb(255,255,0)',
                       	lineWidth: 5,
                       	showLine: false,
                       	markerOptions: { show:true},
                       	pointLabels: { show:false },
			isDragable: false,
			showLabel: false
		},{
			color:'#FFFF00',
			lineWidth: 5,
			showLine: dirBool1,
			markerOptions: { show:dirBool2},
			pointLabels: { show:false },
			rendererOptions: {
				smooth: true
			},
			isDragable: false,
			label: label1
		},{
                        color:'#0066FF',
                        lineWidth: 5,
			showLine: dirBool1,
                        markerOptions: { show:dirBool2},
                        pointLabels: { show:false },
                        rendererOptions: {
                                smooth: true
                        },
			label: label2,
			isDragable: false,
			showLabel: show2
		},{
                        color:'#FF9933',
                        lineWidth: 5,
			showLine: dirBool1,
                        markerOptions: { show:dirBool2},
                        pointLabels: { show:false },
                        rendererOptions: {
                                smooth: true
                        },
			label: label3,
			isDragable: false,
			showLabel: show3
		},{
                        color:'#FFFFFF',
                        lineWidth: 5,
			showLine: dirBool1,
                        markerOptions: { show:dirBool2},
                        pointLabels: { show:false },
                        rendererOptions: {
                                smooth: true
                        },
			label: label4,
			isDragable: false,
			showLabel: show4
		},{
                       	color:'#FF33CC',
                       	lineWidth: 5,
                       	showLine: dirBool1,
                       	markerOptions: { show:dirBool2},
                       	pointLabels: { show:false },
                       	rendererOptions: {
                               	smooth: true
                       	},
			label: label5,
                       	isDragable: false,
                       	showLabel: show5
		}],
		highlighter: {
			sizeAdjust: 10,
			tooltipLocation: 'n',
			tooltipAxes: 'y',
			formatString: '<b><i><span style="color:white;">%s</span></i></b>',
			//tooltipFormatString: '<b><i><span style="color:red;"></span></i></b> %.0f',
			//useAxesFormatters: false
		},
		grid: {
			drawGridLines: true,
			gridLineColor: 'rgb(100,100,100)',
			background: 'transparent',
			borderColor: 'rgb(255,255,255)',
			shadow: false
		},
		legend: {
			show: true,
			fontSize: '8pt',
			//labels: ['Test1','Test2','Test3'],
			showSwatch: true,
			placement: 'insideGrid',
			rendererOptions: {
                		numberRows: 1
            		}, 
	        	location:'nw'
		},
		cursor: {
			show: true,
			showHorizontalLine: true,
                       	showVerticalLine: true
		}
	});
};

