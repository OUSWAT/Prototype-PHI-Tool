function analysis_chart(accumPlot,warningsSVR,advisoriesSVR,warningsLGT,advisoriesLGT,warningsTOR,advisoriesTOR){

	var arrays = [accumPlot,warningsSVR,advisoriesSVR,warningsLGT,advisoriesLGT,warningsTOR,advisoriesTOR];
	document.getElementById('analysisChart1').innerHTML = '';

	plot99 = $.jqplot('analysisChart1',arrays,{
		title: {
			text: 'Forecasts: ' + user,
			show: true,
			color: 'rgb(0,0,0)'
		},
		axesDefaults: {
			tickOptions: {
				textColor: 'rgb(0,0,0)'
			},
			labelOptions: {
				textColor: '#000000'
			},
			labelRenderer: $.jqplot.CanvasAxisLabelRenderer
		},
		axes: {
			xaxis: {
				label: '(UTC)',
				renderer: $.jqplot.DateAxisRenderer,
				tickOptions: {
					showGridline: true,
					mark: 'inside',
					fontWeight: 'bold',
					formatString: '%H:%M',
					angle: -45
				}
			},
			yaxis: {
				label: 'Active Forecasts',
				min: 0,
				max: 20,
				tickOptions: {
					pad: 1,
					showGridline: true,
					mark: 'inside'
				}
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
			color:'#FFFF00',
			lineWidth: 5,
			showLine: false,
			markerOptions: {
				show: true,
				style: 'filledSquare'
			},
			pointLabels: { show:false },
			rendererOptions: {
				smooth: true
			},
			label: 'SVR',
			isDragable: false,
			showLabel: true,
		},{
                        color:'#FFFF00',
                        lineWidth: 5,
			showLine: false,
                        markerOptions: { show:true},
                        pointLabels: { show:false },
                        rendererOptions: {
                                smooth: true
                        },
			label: 'SVR Adv.',
			isDragable: false,
			showLabel: false
		},{
                       	color:'#FF9933',
                       	lineWidth: 5,
                       	showLine: false,
                       	markerOptions: {
                               	show: true,
                               	style: 'filledSquare'
                       	},
                       	pointLabels: { show:false },
                       	rendererOptions: {
                               	smooth: true
                       	},
                       	label: 'LGT',
			isDragable: false,
                       	showLabel: true,
               	},{
                       	color:'#FF9933',
                       	lineWidth: 5,
                       	showLine: false,
                       	markerOptions: { show:true},
                       	pointLabels: { show:false },
                       	rendererOptions: {
                               	smooth: true
                       	},
                       	label: 'LGT Adv.',
			isDragable: false,
                       	showLabel: false
		},{
                       	color:'#FF0000',
                       	lineWidth: 5,
                       	showLine: false,
                       	markerOptions: {
                               	show: true,
                               	style: 'filledSquare'
                       	},
                       	pointLabels: { show:false },
                       	rendererOptions: {
                               	smooth: true
                       	},
                       	label: 'TOR',
			isDragable: false,
                       	showLabel: true,
               	},{
                       	color:'#FF0000',
                       	lineWidth: 5,
                       	showLine: false,
                       	markerOptions: { show:true},
                       	pointLabels: { show:false },
                       	rendererOptions: {
                               	smooth: true
                       	},
                       	label: 'TOR Adv.',
			isDragable: false,
                       	showLabel: false
		}],
		highlighter: {
			sizeAdjust: 10,
			tooltipLocation: 'n',
			tooltipAxes: 'both',
			formatString: '<b><i><span style="color:white;">%s,%s</span></i></b>',
			useAxesFormatters: true
		},
		grid: {
			drawGridLines: true,
			gridLineColor: 'rgb(170,170,170)',
			background: 'rgb(0,0,0)',
			borderColor: 'rgb(255,255,255)',
			shadow: false
		},
		legend: {
			show: true,
			fontSize: '8pt',
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

