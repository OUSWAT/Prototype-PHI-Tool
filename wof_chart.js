function wof_chart(times,vals,title,units,now) {

	if(title == 'Tracked Feature Direction' || vals[0].length == 1){
		dirBool1 = false;
		dirBool2 = true;
	}
	else{
		dirBool1 = true;
		dirBool2 = false;
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

	plot9 = $.jqplot('chart9',arrays,{
		title: title + ' Trend (' + units + ')',
		axesDefaults: {
			//pad: pad,
			labelRenderer: $.jqplot.CanvasAxisLabelRenderer
		},
		axes: {
			xaxis: {
				renderer: $.jqplot.DateAxisRenderer,
				tickRenderer:$.jqplot.CanvasAxisTickRenderer,
		                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
				label: 'time',
				tickOptions: {
					fontWeight: 'bold',
                 			formatString: '%R Z',
			                angle:-30,
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
};

