	/*

	Copyright (c) 2014 Cooperative Institute for Mesoscale Meteorological Studies (CIMMS) and the University of Oklahoma

	Author:		Dr. Chris Karstens
	Email:		chris.karstens@noaa.gov
	Description:	This module contains custom functionality for linking particular
			key strokes with events in the Protytype PHI Tool.  Additionally,
			it contains object-oriented methods.

	*/

	var mouseDown = 0;
	document.onkeydown = checkKey;
	document.onkeyup = checkKeyOff;
	document.onmouseup = checkGraph;
	document.onmousedown = function() { 
		mouseDown = 1;
	}
	//document.body.onmouseup = checkGraph;
	//document.body.onmousedown = function() { 
        //        mouseDown = 1;
        //}
	function checkKey(e) {
		e = e || window.event;
		if(e == null){
                        return true;
                }
		if(document.getElementById('discussion')){
			var disc = document.getElementById('discussion');
		}
		else{
			var disc = null;
		}
		if (e.keyCode == '37') {
			if(disc != null){
				/*
				if(time_slider.getValue() > 0){
					time_slider.setValue(time_slider.getValue() - 1);
				}
				else{
					play = true; advanceScan('back'); play = false;
				}
				*/
				if(document.activeElement != disc){
					play = true; advanceScan('back'); play = false;
				}
			}
			else if(!threatRotate){
                                goToStart();
                        }
			else{
				play = true; advanceScan('back'); play = false;
			}
		}
		else if (e.keyCode == '39') {
			if(disc != null){
				/*
				if(timeCanvasVal.getAttr('time') >= tempValidStart){
	                                time_slider.setValue(time_slider.getValue() + 1);
				}
				else{
					play = true; advanceScan('forward'); play = false;
				}
				*/
				if(document.activeElement != disc){
					play = true; advanceScan('forward'); play = false;
				}
                        }
			else if(!threatRotate){
				goToEnd();
			}
			else{
				play = true; advanceScan('forward'); play = false;
			}
		}
		else if(e.keyCode == '38'){
			if(acase == 'ncp'){
				if(document.getElementById('memberOpt') != null){
					idx = document.getElementById('memberOpt').selectedIndex - 1;
					if(idx < 1){
						return;
					}
					document.getElementById('memberOpt').selectedIndex = idx;
					loadField();
				}
				return;
			}
			else if(disc == null){
				tiltID = parseInt(lastTilt.split('_')[2]) + 1;
				if(tiltID > tiltMax){
					if(currentScan == volumes){
						return;
					}
					play = true; advanceScan('forward'); play = false;
					nextTilt = 'td_tilt_0';
				}
				else{
		                        nextTilt = 'td_tilt_' + tiltID;
				}
	                        document.getElementById(nextTilt).onclick();
			}
		}
		else if(e.keyCode == '40'){
			if(acase == 'ncp'){
                                if(document.getElementById('memberOpt') != null){
                                        idx = document.getElementById('memberOpt').selectedIndex + 1;
                                        if(idx >= document.getElementById('memberOpt').options.length){
                                                return;
                                        }
                                        document.getElementById('memberOpt').selectedIndex = idx;
					loadField();
                                }
                                return;
                        }
			else if(disc == null){
				tiltID = parseInt(lastTilt.split('_')[2]) - 1;
				if(tiltID < 0){
					if(currentScan == 0){
						return;
					}
					play = true; advanceScan('back'); play = false;
					nextTilt = 'td_tilt_' + tiltMax;
				}
				else{
					nextTilt = 'td_tilt_' + tiltID;
				}
				document.getElementById(nextTilt).onclick();
			}
                }
		else if(e.keyCode == '110' || e.keyCode == '190' && !config){
			if(acase != 'ncp'){
				goToNow();
			}
		}
		else if(e.keyCode == '17' && acase != 'ncp'){
			if(modifyFeature.feature != null && threatRotate){
				modifyFeature.rotation = 0;
				controlOptions = {irregular: true, renderIntent: "transform", rotationHandleSymbolizer: "rotate"};
	                       	//modifyFeature.handler.setOptions(controlOptions);
				modifyFeature.irregular = true;
			}
			threatRotate = false;
			polyOptions = {sides: 40, irregular: false};
			ellipseControl.handler.setOptions(polyOptions);
                }
		else if(e.keyCode == '107' || e.keyCode == '61' || e.keyCode == '187'){
	                zoomTimeCanvas(e);
	        }
	        else if(e.keyCode == '109' || e.keyCode == '173' || e.keyCode == '189'){
	                zoomTimeCanvas(e);
	        }
		else if(e.keyCode == '46' && acase == 'ncp'){
			//deleteContour();
			return false;
		}
		//else if(e.keyCode == '46' || e.keyCode == '48'){
		//	return false;
		//}
		else{
			return true;
		}
	}

	function checkKeyOff(e){
		e = e || window.event;
		if(e.keyCode == '17' && acase != 'ncp'){
			if(modifyFeature.feature != null && !threatRotate){
                                modifyFeature.rotation = 0;
				controlOptions = {irregular: false, renderIntent: "transform", rotationHandleSymbolizer: "rotate"};
	                       	//modifyFeature.handler.setOptions(controlOptions);
				modifyFeature.irregular = false;
                        }
                        threatRotate = true;
			polyOptions = {sides: 40, irregular: true};
			ellipseControl.handler.setOptions(polyOptions);
                }
	}

	function ignoreKeys(e) {
		e = e || window.event;
		if(e){
			e.returnValue=false;
		        e.cancel = true;
		}
	}

	function checkGraph(evt) {
	        evt = evt || window.event;
		var button = evt.which || evt.button;
		if(button == 1 && dragStart){
			probChartDrag();
		}
		mouseDown = 0;
	}
	function pad(val){
		if(val < 10){
			return '0' + val;
		}
		else{
			return val;
		}
	}

	function pad2(num, size) {
	    	var s = num+"";
	    	while (s.length < size) s = "0" + s;
	    	return s;
	}

	function setMouse(obj){
		obj.style.cursor='pointer';
	}

	String.prototype.capitalize = function() {
		return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
	};
	Array.prototype.max = function() {
  		return Math.max.apply(null, this);
	};
	Array.prototype.min = function() {
                return Math.min.apply(null, this);  
        };
	Array.prototype.average = function () {
	    	var sum = 0, j = 0; 
	   	for (var i = 0; i < this.length, isFinite(this[i]); i++) { 
	        	sum += parseFloat(this[i]); ++j; 
	    	} 
		return j ? sum / j : 0; 
	};
	Array.prototype.sum = function () {
    		var total = 0;
    		var i = this.length; 

    		while (i--) {
        		total += this[i];
    		}
    		return total;
	}
	function getKeys(obj) {
	    var r = []
	    for (var k in obj) {
	        if (!obj.hasOwnProperty(k)) 
	            continue
	        r.push(k)
	    }
	    return r
	}
	function c2f(temp){
		var f = Math.round(((9/5) * temp) + 32); 
		return f;
	}

	function fixUTC(val){
		if(Number(val) >= 24){
			val = pad(Number(val) - 24);
		}
		return String(val);
	}

