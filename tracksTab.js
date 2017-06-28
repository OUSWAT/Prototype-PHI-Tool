/*

Copyright (c) 2014 Cooperative Institute for Mesoscale Meteorological Studies (CIMMS) and the University of Oklahoma

Author:         Dr. Chris Karstens
Email:          chris.karstens@noaa.gov
Description:    Contains the following:

*/

function drawTrack(){
        if(drawType != null){
                alert('You must deactivate other controls first');
                return;
        }

	drawType = 'line';
        document.getElementById("drawButton").src = "images/drawButtonSelect.png";
        document.getElementById("drawButton").onmouseout = function(){this.src = "images/drawButtonSelect.png";}
        document.getElementById("drawButton").onmouseover = function(){this.src = "images/drawButtonSelect.png";}
                
        controlType = 'line';
        lineControl.activate();

	trackPanel = Ext.getCmp('tracksPanel');
        trackPanel.show();
        innerHTML = 'hi';
        document.getElementById("trackConfig").innerHTML = innerHTML;
}

function trackDrawn(){
	document.getElementById("drawButton").onclick = unloadDrawPanel;
	lineControl.deactivate();
	modifyFeature2.activate();
	idx = background_area.features.length - 1;
        background_area.features[idx].attributes.color = '#FF0000';
	modifyFeature2.selectFeature(background_area.features[idx]);
	setLayerIndexes();
        selectGrid();
}

function unloadDrawPanel(){
	drawType = null;
	controlType = null;
	modifyFeature2.deactivate();
	background_area.removeAllFeatures();
	document.getElementById("drawButton").onclick = function(){drawTrack();}
        document.getElementById("drawButton").onmouseout = function(){this.src = "images/drawButton.png";}
        document.getElementById("drawButton").onmouseover = function(){this.src = "images/drawButtonHighlight.png";}
        document.getElementById("drawButton").src = "images/drawButton.png";
}
