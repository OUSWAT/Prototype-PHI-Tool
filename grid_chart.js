$.jqplot.postDrawHooks.push(function() {
        $(".jqplot-overlayCanvas-canvas").css('z-index', '0'); //send overlay canvas to back  
        $(".jqplot-series-canvas").css('z-index', '1'); //send series canvas to front         
        $(".jqplot-highlighter-tooltip").css('z-index', '2'); //make sure the tooltip is over the series
        $(".jqplot-event-canvas").css('z-index', '5'); //must be on the very top since it is responsible for event catching and propagation
});

function gridChart(times,probs,dur) {

  //alert(times + '\n' + probs);
  s2 = [];
  for(i=0;i<=dur;i++){
	idx = times.indexOf(i)
	if(idx != -1){
		s2.push([times[idx],probs[idx]]);
	}
	else{
		s2.push([i,0])
	}
  }

  evtType = 'prob';
  document.getElementById('chart4').innerHTML = '';

  plot4 = $.jqplot('chart4',[s2],{
     title: 'Gridded Threat Evolution',
     axesDefaults: {
         pad: 0
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
                 formatString: '%.0f%'
             }
         }
     },
     canvasOverlay: {
            show: true,
            objects: [
                { 
                    rectangle: { 
                        xmin: 0, 
                       	xmax: tempDuration, 
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
                       	xmin: 0, 
                       	xmax: tempDuration, 
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
                       	xmin: 0, 
                       	xmax: tempDuration, 
                       	ymin: 40, 
                       	ymax: 60,
                       	xminOffset: "0px", 
                        xmaxOffset: "0px", 
                       	yminOffset: "0px", 
                        ymaxOffset: "0px",
                        color: "rgba(255, 128, 0, 0.3)", 
                        showTooltip: true, 
                        tooltipFormatString: "Elevated",
			tooltipLocation: 'e' 
               	    }
		},
		{ 
                    rectangle: { 
                       	xmin: 0, 
                       	xmax: tempDuration, 
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
                       	xmin: 0, 
                       	xmax: tempDuration, 
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
     },
     series:[{
	color:'#000000',
	lineWidth: 5,
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

