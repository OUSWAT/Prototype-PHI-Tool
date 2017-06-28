function kmeans_chart(times,vals,title,units,now) {

	if(title == 'Tracked Feature Direction' || vals[0].length == 1){
		dirBool1 = false;
		dirBool2 = true;
	}
	else{
		dirBool1 = true;
		dirBool2 = false;
	}

	if(title == 'Ortega Hail Probability'){
		yChartMin = 0;
		yChartMax = 100;
	}
	else if(title == 'Tracked Feature Direction'){
		yChartMin = 0;
                yChartMax = 360;
	}
	else if(title == 'Tracked Feature Speed'){
		yChartMin = 0;
                yChartMax = 80;
	}
	else if(title == 'Tracked Feature Size'){
		yChartMin = 0;
                yChartMax = 1000;
	}
	else if(title == 'MESH'){
		yChartMin = 0;
                yChartMax = 6;
	}
	else{
		yChartMin = 0;
		yChartMax = 100;
	}

	s2 = [];
	s3 = [];
	s4 = [];
	s5 = [];
	max = -99999999999999;
	min = 99999999999999;
	num = 1;
	for(i=0;i<vals.length;i++){
		num++;
		for(j=0;j<=times.length;j++){
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
	s1 = [[now,min],[now,max]];

	if(num == 2){
		arrays = [s1,s2];
	}
	else if(num == 3){
		arrays = [s1,s2,s3];
	}
	else if(num == 4){
                arrays = [s1,s2,s3,s4];
        }
	else if(num == 5){
                arrays = [s1,s2,s3,s4,s5];
        }

	evtType = 'prob';
	document.getElementById('chart9').innerHTML = '';

	if(title == 'Ortega Hail Probability' || title == 'Probability of Lightning in 30 min.'){
	plot9 = $.jqplot('chart9',arrays,{
                title: title + ' Trend (' + units + ')',
                axesDefaults: {
                        //pad: pad,
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
                                pad: 0,
                                //min: yChartMin,
                                //max: yChartMax,
                                rendererOptions: { forceTickAt0: true, forceTickAt20: true, forceTickAt40: true,forceTickAt60: true, forceTickAt80: true, forceTickAt100: true },
                                tickOptions: {
                                        pad: 1,
                                        showGridline: true,
                                        mark: 'inside'
                                }
                        }
                },
                series:[{
                        color: 'rgb(0,153,0)',
                        lineWidth: 3,
                        markerOptions: { show:false},
                        pointLabels: { show:false }
                },{
                        color:'#000000',
                        lineWidth: 5,
                        showLine: dirBool1,
                        markerOptions: { show:dirBool2},
                        pointLabels: { show:false },
                        rendererOptions: {
                                smooth: true
                        }
                },{
                        color:'#FF0000',
                        lineWidth: 5,
                        showLine: dirBool1,
                        markerOptions: { show:dirBool2},
                        pointLabels: { show:false },
                        rendererOptions: {
                                smooth: true
                        }
                },{
                        color:'#0066FF',
                        lineWidth: 5,
                        showLine: dirBool1,
                        markerOptions: { show:dirBool2},
                        pointLabels: { show:false },
			rendererOptions: {
                                smooth: true
                        }
                },{
                        color:'#FF9933',
                        lineWidth: 5,
                        showLine: dirBool1,
                        markerOptions: { show:dirBool2},
                        pointLabels: { show:false },
                        rendererOptions: {
                                smooth: true
                        }
                }],
                highlighter: {
                        sizeAdjust: 10,
                        tooltipLocation: 'n',
                        tooltipAxes: 'y'
                        //tooltipFormatString: '<b><i><span style="color:red;"></span></i></b> %.0f',
                        //useAxesFormatters: false
                },
                grid: {
                        drawGridLines: true,
                        gridLineColor: 'rgb(0,0,0)',
                        background: 'transparent',
                        borderColor: 'rgb(0,0,0)',
                        shadow: false
                },
                legend: {
                        //show: true,
                        //fontSize: '8pt',
                        //labels: ['Test1','Test2','Test3'],
                        //showSwatch: true,
                        //placement: 'insideGrid'
                },
                cursor: {
			show: true
                },	
	canvasOverlay: {
            show: true,
            objects: [
                { 
                    rectangle: { 
                        xmin: -120, 
                        xmax: 20, 
                        ymin: 0, 
                        ymax: 20,
                        xminOffset: "0px", 
                        xmaxOffset: "0px", 
                        yminOffset: "0px", 
                        ymaxOffset: "0px",
                        color: "rgba(0, 204, 0, 0.3)", 
                        showTooltip: true, 
                        tooltipFormatString: "Low",
                        tooltipLocation: 'e'
                    }
                },
                {
                    rectangle: { 
                        xmin: -120, 
                        xmax: 20, 
                        ymin: 20, 
                        ymax: 40,
                        xminOffset: "0px", 
                        xmaxOffset: "0px", 
                        yminOffset: "0px", 
                        ymaxOffset: "0px",
                        color: "rgba(255, 255, 0, 0.3)", 
                        showTooltip: true, 
                        tooltipFormatString: "Guarded",
                        tooltipLocation: 'e'
                    }
                },
		{ 
                    rectangle: { 
                        xmin: -120, 
                        xmax: 20, 
                        ymin: 40, 
                        ymax: 60,
                        xminOffset: "0px", 
                        xmaxOffset: "0px", 
                        yminOffset: "0px", 
                        ymaxOffset: "0px",
                        color: "rgba(255, 128, 0, 0.3)", 
                        showTooltip: true, 
                        tooltipFormatString: "Elevated" ,
                        tooltipLocation: 'e'
                    }
                },
                { 
                    rectangle: { 
                        xmin: -120, 
                        xmax: 20, 
                        ymin: 60, 
                        ymax: 80,
                        xminOffset: "0px", 
                        xmaxOffset: "0px", 
                        yminOffset: "0px", 
                        ymaxOffset: "0px",
                        color: "rgba(255, 0, 0, 0.3)", 
                        showTooltip: true, 
                        tooltipFormatString: "High",
                        tooltipLocation: 'e' 
                    }
                },
		{ 
                    rectangle: { 
                        xmin: -120, 
                        xmax: 20, 
                        ymin: 80, 
                        ymax: 100,
                        xminOffset: "0px", 
                        xmaxOffset: "0px", 
                        yminOffset: "0px", 
                        ymaxOffset: "0px",
                        color: "rgba(255, 0, 255, 0.3)", 
                        showTooltip: true, 
                        tooltipFormatString: "Severe",
                        tooltipLocation: 'e' 
                    } 
                }
		]
	     }
	});
	}
	else{
	plot9 = $.jqplot('chart9',arrays,{
		title: title + ' Trend (' + units + ')',
		axesDefaults: {
			//pad: pad,
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
				pad: 0,
				min: yChartMin,
				max: yChartMax,
				//rendererOptions: { forceTickAt0: true, forceTickAt100: true },
				tickOptions: {
					pad: 1,
					showGridline: true,
					mark: 'inside'
				}
			}
		},
		series:[{
			color: 'rgb(0,153,0)',
                        lineWidth: 3,
                        markerOptions: { show:false},
                        pointLabels: { show:false }
		},{
			color:'#000000',
			lineWidth: 5,
			showLine: dirBool1,
			markerOptions: { show:dirBool2},
			pointLabels: { show:false },
			rendererOptions: {
				smooth: true
			}
		},{
                        color:'#FF0000',
                        lineWidth: 5,
			showLine: dirBool1,
                        markerOptions: { show:dirBool2},
                        pointLabels: { show:false },
                        rendererOptions: {
                                smooth: true
                        }
		},{
                        color:'#0066FF',
                        lineWidth: 5,
			showLine: dirBool1,
                        markerOptions: { show:dirBool2},
                        pointLabels: { show:false },
                        rendererOptions: {
                                smooth: true
                        }
		},{
                        color:'#FF9933',
                        lineWidth: 5,
			showLine: dirBool1,
                        markerOptions: { show:dirBool2},
                        pointLabels: { show:false },
                        rendererOptions: {
                                smooth: true
                        }
		}],
		highlighter: {
			sizeAdjust: 10,
			tooltipLocation: 'n',
			tooltipAxes: 'y'
			//tooltipFormatString: '<b><i><span style="color:red;"></span></i></b> %.0f',
			//useAxesFormatters: false
		},
		grid: {
			drawGridLines: true,
			gridLineColor: 'rgb(0,0,0)',
			background: 'transparent',
			borderColor: 'rgb(0,0,0)',
			shadow: false
		},
		legend: {
			//show: true,
			//fontSize: '8pt',
			//labels: ['Test1','Test2','Test3'],
			//showSwatch: true,
			//placement: 'insideGrid'
		},
		cursor: {
			show: true
		}
	});
	}
};

