$.jqplot.config.enablePlugins = true;
function speedChart(pid) {

  //s1 = [['23-May-08',20],['24-May-08',70],['25-May-08',40],['26-May-08',30]];
  s1 = [];
  for(c=0;c<tempSpeeds.length;c++){
	if((c * 5) > threat_points.features.length){
		break;
	}
	else{
		s1.push([c * 5,tempSpeeds[c]]);
	}
  }
  stimes = [];
  for(c=0;c<=120;c+=5){
        stimes.push(c);
  }
  s2 = [];
  if(stimes.indexOf(ftime) == -1){
	  s2 = [[ftime,threat_points.features[ftime].attributes.speed]];
  }

  document.getElementById('chart2').innerHTML = '';
  document.getElementById('chart1').style.display = 'none';
  document.getElementById('chart2').style.display = 'block';
  document.getElementById('chart3').style.display = 'none';
  document.getElementById('chart5').style.display = 'none';
  document.getElementById('chart6').style.display = 'none';
  evtType = 'speed';

  plot2 = $.jqplot('chart2',[s1,s2],{
     title: 'Speed Evolution',
     axesDefaults: {
         pad: 1.01
     },
     axes: {
         xaxis: {
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
	     rendererOptions: { forceTickAt0: true, forceTickAt100: true },
             tickOptions: {
		 showGridline: true,
		 mark: 'inside',
                 formatString: '%.0f'
             }
         }
     },
     series:[{
	color:'#009900',
	markerOptions: { size: 14},
	pointLabels: { show:false },
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
     }],
     highlighter: {
         sizeAdjust: 10,
         tooltipLocation: 'n',
         tooltipAxes: 'y',
         tooltipFormatString: '<b><i><span style="color:green;">Spd = </span></i></b> %.0f kts',
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

function speedChartDrag(){
	if(ftime != 0){
		alert('Changes cannot be made while previewing threat evolution');
	}
	new_speeds = [];
	//for(i=0;i<plot1.series[0].data.length;i++){
	for(i=0;i<modifyFeature.feature.attributes.data['speeds'].length;i++){
		if(i < plot2.series[0].data.length){
			if(plot2.series[0].data[i][1] != modifyFeature.feature.attributes.data['speeds'][i] && ftime == 0){
				new_speeds.push(Math.round(plot2.series[0].data[i][1]));
			}
			else{
				new_speeds.push(modifyFeature.feature.attributes.data['speeds'][i]);
			}
		}
		else{
			new_speeds.push(modifyFeature.feature.attributes.data['speeds'][i]);
		}
	}
	/*
	if(wofR){
                j = -1;
                for(i=0;i<wof_points.features.length;i++){
                        if((i%5) == 0){
                                j++;
                        }
                        slp = (new_speeds[j+1] - new_speeds[j]) / 5;
                        y_int = new_speeds[j] - ((j * 5) * slp);
                        speedVal = (i * slp) + y_int;
                        wof_points.features[i].attributes.speed = speedVal
                }
        }
	*/
	decoupleVector();
	modifyFeature.feature.attributes.data['speeds'] = new_speeds;
	modifyThreat(false);
}
