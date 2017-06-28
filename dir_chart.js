$.jqplot.config.enablePlugins = true;
function dirChart(pid) {

  //s1 = [['23-May-08',20],['24-May-08',70],['25-May-08',40],['26-May-08',30]];
  s1 = [];
  for(c=0;c<tempDirs.length;c++){
	if((c * 5) > threat_points.features.length){
		break;
	}
	else{
		s1.push([c * 5,tempDirs[c]]);
	}
  }
  stimes = [];
  for(c=0;c<=120;c+=5){
        stimes.push(c);
  }
  s2 = [];
  if(stimes.indexOf(ftime) == -1){
	  s2 = [[ftime,threat_points.features[ftime].attributes.dir]];
  }

  document.getElementById('chart3').innerHTML = '';
  document.getElementById('chart1').style.display = 'none';
  document.getElementById('chart2').style.display = 'none';
  document.getElementById('chart3').style.display = 'block';
  document.getElementById('chart5').style.display = 'none';
  document.getElementById('chart6').style.display = 'none';
  evtType = 'dir';

  plot3 = $.jqplot('chart3',[s1,s2],{
     title: 'Direction Evolution',
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
	     rendererOptions: { forceTickAt90: true, forceTickAt180: true },
	     min:0,
       	     max:360,
             tickOptions: {
		 showGridline: true,
		 mark: 'inside',
                 formatString: '%.0f°'
             }
         }
     },
     series:[{
	color:'#0000FF',
	showLine:false,
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
         tooltipFormatString: '<b><i><span style="color:blue;">Dir = </span></i></b> %.0f°',
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

var dragging = false;

function dirChartDrag(){
	if(ftime != 0){
                alert('Changes cannot be made while previewing threat evolution');
        }
	//tempData = [];
	//for(i=0;i<plot3.series[0].data.length;i++){
	//	tempData.push(plot3.series[0].data[i][1]);
	//}
	//alert(modifyFeature.feature.attributes.data['dirs'] + ' | ' + tempData);
	//if(modifyFeature.feature.attributes.data['dirs'] == plot3.series[0].data){
	//	return;
	//}
        new_dirs = [];
	trip_val = null;
        for(i=0;i<modifyFeature.feature.attributes.data['dirs'].length;i++){
		if(i < plot3.series[0].data.length){
	                if(plot3.series[0].data[i][1] != modifyFeature.feature.attributes.data['dirs'][i] && ftime == 0){
	                        new_dirs.push(Math.round(plot3.series[0].data[i][1]));
				trip_val = Math.round(plot3.series[0].data[i][1]);
	                }
			else if(trip_val != null){
				new_dirs.push(trip_val);
			}
	                else{     
	                        new_dirs.push(modifyFeature.feature.attributes.data['dirs'][i]);
	                }
		}
		else if(trip_val != null){
			new_dirs.push(trip_val);
		}
		else{
			new_dirs.push(modifyFeature.feature.attributes.data['dirs'][i]);
		}
        }
	if(modifyFeature.feature.rotation != 0 && ftime == 0){
		for(i=0;i<threat_area.features.length;i++){
			if(threat_area.features[i].attributes.data['id'] == modifyFeature.feature.attributes.data['id']){
				index = i;
				break;
			}
		}
		modifyFeature.unsetFeature();
		modifyFeature.setFeature(threat_area.features[index]);
	}
	decoupleVector();
        modifyFeature.feature.attributes.data['dirs'] = new_dirs;
        modifyThreat(false);
}

/*
$('#chart3').bind('jqplotDragStop',
  function (seriesIndex, pointIndex, pixelposition, data) {
	new_dirs = [];
	//for(i=0;i<plot1.series[0].data.length;i++){
	for(i=0;i<modifyFeature.feature.attributes.dirs.length;i++){
		if(i < plot3.series[0].data.length){
			if(plot3.series[0].data[i][1] != modifyFeature.feature.attributes.dirs[i]){
				new_dirs.push(Math.round(plot3.series[0].data[i][1]));
			}
			else{
				new_dirs.push(modifyFeature.feature.attributes.dirs[i]);
			}
		}
		else{
			new_dirs.push(modifyFeature.feature.attributes.dirs[i]);
		}
	}
	modifyFeature.feature.attributes.dirs = new_dirs;
	modifyThreat();
}); 
*/
