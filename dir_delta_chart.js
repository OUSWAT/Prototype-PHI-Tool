$.jqplot.config.enablePlugins = true;
function dirDeltaChart(pid) {
 
  //s1 = [['23-May-08',20],['24-May-08',70],['25-May-08',40],['26-May-08',30]];
  s1 = [];
  ticks = [];
  for(c=0;c<tempDir.length;c++){
	if((c * 5) > threat_points.features.length){
		break;
	}
	else{
		s1.push([c * 5,tempDir[c]]);
		ticks.push(c * 5);
	}
  }
  stimes = [];
  for(c=0;c<=120;c+=5){
        stimes.push(c);
  }
  s2 = [];
  if(stimes.indexOf(ftime) == -1){
	  s2 = [[ftime,threat_points.features[ftime].attributes.diru]];
  }

  document.getElementById('chart6').innerHTML = '';
  document.getElementById('chart1').style.display = 'none';
  document.getElementById('chart2').style.display = 'none';
  document.getElementById('chart3').style.display = 'none';
  document.getElementById('chart5').style.display = 'none';
  document.getElementById('chart6').style.display = 'block';
  evtType = 'diru';

  plot6 = $.jqplot('chart6',[s1,s2],{
     title: 'Direction Uncertainty Evolution',
     axesDefaults: {
         pad: 1.01
     },
     axes: {
         xaxis: {
             //renderer: $.jqplot.DateAxisRenderer,
	     //min: (s1[0][0] - 2),
             //max: (s1[s1.length - 1][0] + 2),
	     //tickInterval: 5,
	     //ticks: ticks,
             tickOptions: {
		 showGridline: true,
		 mark: 'inside',
		 fontWeight: 'bold'
                 //formatString: '%#m/%#d/%y'
             }
             //numberTicks: 4
         },
         yaxis: {
	     //rendererOptions: { forceTickAt5: true, forceTickAt10: true, forceTickAt15: true, forceTickAt20: true },
	     min:0,
             max:45,
             tickOptions: {
		 showGridline: true,
		 mark: 'inside',
                 formatString: '%.0f°'
             }
         }
     },
     series:[{
	color:'#00CCFF',
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
         tooltipFormatString: '<b><i><span style="color:blue;">DirU = </span></i></b> %.0f kts',
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

function dirDeltaChartDrag(){
	if(ftime != 0){
                alert('Changes cannot be made while previewing threat evolution');
		return;
        }
       	new_dirs = [];
       	trip_val = null;
       	for(i=0;i<modifyFeature.feature.attributes.data['dir'].length;i++){
               	if(i < plot6.series[0].data.length){
                       	if(plot6.series[0].data[i][1] != modifyFeature.feature.attributes.data['dir'][i] && ftime == 0){
                               	new_dirs.push(Math.round(plot6.series[0].data[i][1]));
                               	trip_val = Math.round(plot6.series[0].data[i][1]);
                       	}
                       	else if(trip_val != null){
                               	new_dirs.push(trip_val);
                       	}
                       	else{     
                               	new_dirs.push(modifyFeature.feature.attributes.data['dir'][i]);
                       	}
               	}
               	else if(trip_val != null){
                       	new_dirs.push(trip_val);
               	}
               	else{
                       	new_dirs.push(modifyFeature.feature.attributes.data['dir'][i]);
               	}
       	}
	if(wofR){
                j = -1;
                for(i=0;i<wof_points.features.length;i++){
                        if((i%5) == 0){
                                j++;
                        }
                        slp = (new_dirs[j+1] - new_dirs[j]) / 5;
                        y_int = new_dirs[j] - ((j * 5) * slp);
                        dirVal = (i * slp) + y_int;
                        wof_points.features[i].attributes.diru = dirVal
                }
        }
	decoupleVector();
       	modifyFeature.feature.attributes.data['dir'] = new_dirs;
	modifyThreat(false);
}
