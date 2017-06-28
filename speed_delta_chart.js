$.jqplot.config.enablePlugins = true;
function speedDeltaChart(pid) {
 
  //s1 = [['23-May-08',20],['24-May-08',70],['25-May-08',40],['26-May-08',30]];
  s1 = [];
  for(c=0;c<tempSpd.length;c++){
	if((c * 5) > threat_points.features.length){
		break;
	}
	else{
		s1.push([c * 5,tempSpd[c]]);
	}
  }
  stimes = [];
  for(c=0;c<=120;c+=5){
        stimes.push(c);
  }
  s2 = [];
  if(stimes.indexOf(ftime) == -1){
	  s2 = [[ftime,threat_points.features[ftime].attributes.spdu]];
  }

  document.getElementById('chart5').innerHTML = '';
  document.getElementById('chart1').style.display = 'none';
  document.getElementById('chart2').style.display = 'none';
  document.getElementById('chart3').style.display = 'none';
  document.getElementById('chart5').style.display = 'block';
  document.getElementById('chart6').style.display = 'none';
  evtType = 'spdu';

  plot5 = $.jqplot('chart5',[s1,s2],{
     title: 'Speed Uncertainty Evolution',
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
	     rendererOptions: { forceTickAt0: true, forceTickAt20: true },
	     min:0,
             max:20,
             tickOptions: {
		 showGridline: true,
		 mark: 'inside',
                 formatString: '%.0f'
             }
         }
     },
     series:[{
	color:'#00FF00',
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
         tooltipFormatString: '<b><i><span style="color:green;">SpdU = </span></i></b> %.0f kts',
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

function speedDeltaChartDrag(){
	if(ftime != 0){
                alert('Changes cannot be made while previewing threat evolution');
        }
       	new_spds = [];
       	trip_val = null;
       	for(i=0;i<modifyFeature.feature.attributes.data['spd'].length;i++){
               	if(i < plot5.series[0].data.length){
                       	if(plot5.series[0].data[i][1] != modifyFeature.feature.attributes.data['spd'][i] && ftime == 0){
                               	new_spds.push(Math.round(plot5.series[0].data[i][1]));
                               	trip_val = Math.round(plot5.series[0].data[i][1]);
                       	}
                       	else if(trip_val != null){
                               	new_spds.push(trip_val);
                       	}
                       	else{     
                               	new_spds.push(modifyFeature.feature.attributes.data['spd'][i]);
                       	}
               	}
               	else if(trip_val != null){
                       	new_spds.push(trip_val);
               	}
               	else{
                       	new_spds.push(modifyFeature.feature.attributes.data['spd'][i]);
               	}
       	}
	if(wofR){
                j = -1;
                for(i=0;i<wof_points.features.length;i++){
                        if((i%5) == 0){
                                j++;
                        }
                        slp = (new_spds[j+1] - new_spds[j]) / 5;
                        y_int = new_spds[j] - ((j * 5) * slp);
                        spdVal = (i * slp) + y_int;
                        wof_points.features[i].attributes.spdu = spdVal
                }
        }
	decoupleVector();
       	modifyFeature.feature.attributes.data['spd'] = new_spds;
        modifyThreat(false);
}
