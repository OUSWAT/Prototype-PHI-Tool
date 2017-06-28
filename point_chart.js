$.jqplot.postDrawHooks.push(function() {
        $(".jqplot-overlayCanvas-canvas").css('z-index', '0'); //send overlay canvas to back  
        $(".jqplot-series-canvas").css('z-index', '1'); //send series canvas to front         
        $(".jqplot-highlighter-tooltip").css('z-index', '2'); //make sure the tooltip is over the series
        $(".jqplot-event-canvas").css('z-index', '5'); //must be on the very top since it is responsible for event catching and propagation
});

function pointChart(times,probs,dur,start) {

  //alert(times + '\n' + probs);
  var s2s = [];
  var upper = [];
  var lower = [];
  var ticks = [];
  var mins = [0,5,10,15,20,25,30,35,40,45,50,55];
  //end = ((times[0][times[0].length - 1] * 60) + start[0]) * 1000;
  for(var i=0;i<times.length;i++){
	var s2 = [];
	var end = ((times[i][times[i].length - 1] * 60) + start[i]) * 1000;
	var end = 7200000;
	for(var j=0;j<=dur[i];j++){
		var jtime = ((times[i][j] * 60) + start[i]) * 1000;
		s2.push([jtime,probs[i][j]]);
		jdate = new Date(jtime);
		if(i == 0){
			if(j == 0 || j == dur[i]){
		               	//ticks.push(jtime);
			}
			else if(mins.indexOf(jdate.getMinutes()) != -1 && (jtime - start[i]) >= 120000 && (end - jtime) > 120000){
	      		       	ticks.push(jtime);
			}
	               	upper.push([jtime,probs[i][j] + 10]);
	               	lower.push([jtime,probs[i][j] - 10]);
		}
		/*
		else{
			for(var k=0;k<s2.length;k++){
	                       	if(jtime >= (s2[k][0] - 30000) && jtime <= (s2[k][0] + 30000) && s2[k][1] < probs[i][j]){
	                               	s2[k][1] = probs[i][j];
					break;
				}
                        }
               	}
		*/
	}
	s2s.push(s2);
  }
  //console.log(s2);
  //console.log(ticks);
  //console.log(upper);
  //console.log(lower);

  evtType = 'prob';
  try{
	  document.getElementById('chart4').innerHTML = '';
  }
  catch(err){
	return;
  }
  //var allData = [upper, lower];
  var allData = [];
  var xMin = 9999999999999999999;
  var xMax = 0;
  for(var i=0;i<s2s.length;i++){
  	allData.push(s2s[i]);
	if(i == 0){
		allData.push(s2s[i]);
	}
	if(s2s[i][0][0] < xMin){
		xMin = s2s[i][0][0];
	}
	if(s2s[i][s2s[i].length-1][0] > xMax){
               	xMax = s2s[i][s2s[i].length-1][0];
       	}
  }
  var xMax = (s2[0][0] + 7200000);
  console.log(allData);
  //console.log(upper);
  //console.log(lower);
  //console.log(s2s);

  //plot4 = $.jqplot('chart4',[s2],{
  plot4 = $.jqplot('chart4',allData,{
     title: 'Point-Based Hazard Likelihood Trend',
     axesDefaults: {
         //pad: 0
     },
     axes: {
         xaxis: {
             renderer: $.jqplot.DateAxisRenderer,
	     tickRenderer:$.jqplot.CanvasAxisTickRenderer,
	     labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
             tickOptions: {
		 showGridline: true,
		 mark: 'inside',
		 fontWeight: 'bold',
                 formatString: '%#I:%M %p',
		 angle:-30,
		 fontSize:'12pt',
		 fontFamily:'Tahoma',
		 labelPosition: 'left',
		 fontWeight:'bolder'
             },
             //numberTicks: 4,
	     ticks: ticks,
	     min:s2[0][0],
	     //max:s2[(s2.length - 1)][0]
	     max: (s2[0][0] + 7200000)
         },
         yaxis: {
	     rendererOptions: { forceTickAt0: true, forceTickAt20: true, forceTickAt40: true, forceTickAt60: true, forceTickAt80: true, forceTickAt100: true },
             tickOptions: {
		 showGridline: true,
		 mark: 'inside',
                 formatString: '%.0f%',
		 fontFamily:'Tahoma',
		 fontSize:'12pt',
		 fontWeight:'bolder'
             },
	     min:0,
	     max:100,
	     tickInterval:20
         }
     },
     canvasOverlay: {
            show: true,
            objects: [
                { 
                    rectangle: { 
			xmin:xMin,
             		xmax:xMax,
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
			xmin:xMin,
                        xmax:xMax,
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
			xmin:xMin,
                        xmax:xMax,
                       	ymin: 40, 
                       	ymax: 60,
                       	xminOffset: "0px", 
                        xmaxOffset: "0px", 
                       	yminOffset: "0px", 
                        ymaxOffset: "0px",
                        color: "rgba(255, 128, 0, 0.6)", 
                        showTooltip: true, 
                        tooltipFormatString: "Elevated",
			tooltipLocation: 'e' 
               	    }
		},
		{ 
                    rectangle: { 
			xmin:xMin,
                        xmax:xMax,
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
			xmin:xMin,
                        xmax:xMax,
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
     /*
     fillBetween: {
	series1: 0,
	series2: 1,
	color: 'rgba(150,150,150,0.7)',
	baseSeries: 2,
	fill:true
     },
     */
     series:[{
	/*
	show: false,
	pointLabels: { show:false },
        rendererOptions: {
            smooth: true
        }},{
	show: false,
	pointLabels: { show:false },
        rendererOptions: {
            smooth: true
	}},{
	*/
        color:'#000000',
        lineWidth: 7,
	index: 4,
        markerOptions: { show:false},
        pointLabels: { show:false },
        rendererOptions: {
            smooth: true
	}},{
        color:'#FFFF00',
        lineWidth: 5,
	index: 5,
        markerOptions: { show:false},
        pointLabels: { show:false },
        rendererOptions: {
            smooth: true
	}},{
        color:'#000000',
        lineWidth: 5,
       	index: 3,
        markerOptions: { show:false},
        pointLabels: { show:false },
        rendererOptions: {
            smooth: true
	}},{
        color:'#000000',
        lineWidth: 5,
       	index: 2,
        markerOptions: { show:false},
        pointLabels: { show:false },
        rendererOptions: {
            smooth: true

	}},{
        color:'#000000',
        lineWidth: 5,
       	index: 1,
        markerOptions: { show:false},
        pointLabels: { show:false },
        rendererOptions: {
            smooth: true

        }},{
	color:'#000000',
        lineWidth: 5,
       	index: 0,
        markerOptions: { show:false},
        pointLabels: { show:false },
        rendererOptions: {
            smooth: true
        }
     }],
     highlighter: {
         sizeAdjust: 10,
         tooltipLocation: 'n',
         tooltipAxes: 'y',
         tooltipFormatString: '<b><i><span style="color:red;">Prob = </span></i></b> %.0f%',
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

