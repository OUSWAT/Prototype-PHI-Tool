//test_plot = [['2013-05-19 11:45PM',441],['2013-05-19 11:50PM',445],['2013-05-19 11:55PM',432],['2013-05-20 12:00AM',407],['2013-05-20 12:05AM',288],['2013-05-20 12:10AM',309],['2013-05-20 12:15AM',314],['2013-05-20 12:20AM',340],['2013-05-20 12:25AM',396],['2013-05-20 12:30AM',446],['2013-05-20 12:35AM',445],['2013-05-20 12:40AM',486],['2013-05-20 12:45AM',494],['2013-05-20 12:50AM',497],['2013-05-20 12:55AM',436],['2013-05-20 01:00AM',452],['2013-05-20 01:05AM',72],['2013-05-20 01:10AM',75],['2013-05-20 01:15AM',94],['2013-05-20 01:20AM',96],['2013-05-20 01:25AM',94],['2013-05-20 01:30AM',94]];


$.jqplot.config.enablePlugins = true;
function objectChart(s1,plotVar,ymin,ymax) {

  if(plotVar == 'HLCL'){
	unit = 'm';
	plotColor = '#0000FF';
  }
  else if(plotVar == 'SBCAPE'){
	unit = 'J/Kg';
        plotColor = '#FF0000';
  }
  else if(plotVar == 'MUCAPE'){
	unit = 'J/Kg';
        plotColor = '#FF9933';
  }
  else if(plotVar == 'SRH'){
	unit = 'm<sup>2</sup>/s<sup>2</sup>';
        plotColor = '#009900';
  }
  else if(plotVar == 'MAXUH'){
	unit = 'm<sup>2</sup>/s<sup>2</sup>';
        plotColor = '#CC33FF';
  }
  else{
	unit = '';
	plotColor = '#000000';
  }
 
  document.getElementById('chart10').innerHTML = '';
  //alert(s1);
  plot1 = $.jqplot('chart10',[s1],{
     title: 'Evolution of ' + plotVar,
     axesDefaults: {
         pad: 0,
	 tickRenderer: $.jqplot.CanvasAxisTickRenderer
     },
     axes: {
         xaxis: {
             renderer: $.jqplot.DateAxisRenderer,
             tickOptions: {
		 showGridline: true,
		 //mark: 'inside',
		 fontWeight: 'bold',
		 textColor: 'black',
                 formatString: '%#m/%#d %H:%M',
		 angle: -45
             },
             //min: s1[0][0],
       	     //max: s1[(s1.length - 1)][0],
	     //min: xmin,
	     //max: xmax,
	     label: 'Time (UTC)',
             labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
	     labelOptions: {
                textColor: "black"
             }
         },
         yaxis: {
	     tickOptions: {
		textColor: 'black'
	     },
	     min: ymin,
	     max: ymax,
	     label: plotVar,
	     labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
	     labelOptions: {
		textColor: "black"
	     }
         }
     },
     series:[{
	color: plotColor,
	pointLabels: { show:false },
	rendererOptions: {
	    smooth: true
	}
     },{
	color: '#000000',
	showLine:false,
        markerOptions: { size: 7, style:"x" },
	pointLabels: { show:true,edgeTolerance: 5 }
     }],
     highlighter: {
         sizeAdjust: 10,
         tooltipLocation: 'n',
         //tooltipAxes: 'y',
         //tooltipFormatString: '<b><i><span style="color:red;">' + plotVar + ' = </span></i></b> %.0f',
         tooltipContentEditor: function (str, seriesIndex, pointIndex, plot) {
            date1 = plot.data[seriesIndex][pointIndex][0].split(' ')[1];
	    date2 = date1.split(':');
	    minute = date2[1].slice(0,2);
	    ampm = date2[1].slice(2);
	    hour = date2[0];
	    if(ampm == 'PM' && parseInt(date2[0]) < 12){
		hour = parseInt(date2[0]) + 12;
	    }
	    else if(ampm == 'AM' && date2[0] == '12'){
		hour = '00';
	    }
            var val = plot.data[seriesIndex][pointIndex][1];
            var html = '<div style="font-size: 16pt"><b>' + hour + ':' + minute + 'z<br>' + val + ' ' + unit + '</b></div>';
            return html;
         },
	 useAxesFormatters: false
     },
     grid: {
	 drawGridLines: true,
	 gridLineColor: 'rgb(50,50,50)',
	 background: 'transparent',
	 borderColor: 'rgb(0,0,0)',
	 shadow: false
     },
     cursor: {
         show: false,
	 //zoom: true
     }
  });
};

