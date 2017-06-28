var capsEnsemble = {
	"members":['ssef_s4cn_arw','ssef_s4c0_arw','ssef_s4m3_arw','ssef_s4m4_arw','ssef_s4m5_arw','ssef_s4m6_arw','ssef_s4m7_arw',
		'ssef_s4m8_arw','ssef_s4m9_arw','ssef_s4m10_arw','ssef_s4m11_arw','ssef_s4m12_arw','ssef_s4m13_arw','ssef_s4m14_arw',
		'ssef_s4m16_arw','ssef_s4m17_arw','ssef_s4m18_arw','ssef_s4m20_arw'],
	"names":['SSEF ARW CTL','SSEF ARW C0','SSEF ARW M3','SSEF ARW M4','SSEF ARW M5','SSEF ARW M6','SSEF ARW M7','SSEF ARW M8',
		'SSEF ARW M9','SSEF ARW M10','SSEF ARW M11','SSEF ARW M12','SSEF ARW M13','SSEF ARW M14','SSEF ARW M16','SSEF ARW M17',
		'SSEF ARW M18','SSEF ARW M20'],
	"core":['ssef_s4m3_arw','ssef_s4m4_arw','ssef_s4m5_arw','ssef_s4m6_arw','ssef_s4m7_arw','ssef_s4m8_arw','ssef_s4m9_arw','ssef_s4m10_arw',
		'ssef_s4m11_arw','ssef_s4m12_arw','ssef_s4m13_arw','ssef_s4m14_arw','ssef_s4m15_arw','ssef_s4cn_arw','ssef_s4cn_arps'],
	"mp":['ssef_s4cn_arw','ssef_s4cn_arps','ssef_s4m20_arw','ssef_s4m21_arw','ssef_s4m22_arw','ssef_s4m23_arw','ssef_s4m25_arw'],
	"pbl":['ssef_s4cn_arw','ssef_s4cn_arps','ssef_s4m16_arw','ssef_s4m17_arw','ssef_s4m18_arw','ssef_s4m19_arw','ssef_s4m24_arw'],
	"hours":48,
	"interval":1
};

var nsslwrfEnsemble14 = {
	"members":["nssl_4km","nssl_4km_em_ctl","nssl_4km_em_n1","nssl_4km_em_p1","nssl_4km_nmb_ctl","nssl_4km_nmb_p1",
		"nssl_4km_nmm_ctl","nssl_4km_nmm_n1","nssl_4km_nmm_p1","max"],
	"names":["NSSL WRF","NSSL WRF EM CTL","NSSL WRF EM N1","NSSL WRF EM P1","NSSL WRF NMB CTL","NSSL WRF NMB P1",
		"NSSL WRF NMM CTL","NSSL WRF NMM N1","NSSL WRF NMM P1","Max Any Member"],
	"hours": 36,
	"interval": [60,60,60,60,60,60,60,60,60,60],
	"initHours": [0],
	"bounds": new OpenLayers.Bounds(-15288220.777,2454404.734,-6533934.514,7167833.953),
	"fields": ["mucape","cape","cin","hlcy01","hlcy03","refl","refl1km","t2m","td2m","uphlcy","wind10m","hailcast","uhObjects","stormObjects"],
	"fieldNames":["Most Unstable CAPE","Surface-Based CAPE","Surface-Based CIN","0-1 km SRH","0-3 km SRH","Composite Reflectivity",
		"1 km Reflectivity","2 m Temperature","2 m Dew Point","2-5 km Updraft Helicity","10 m Wind Speeds","Hailcast","UH Objects","Storm Objects"],
	"maxFields":["uphlcy","hailcast","t2m"]
};

// nssl_4km  nssl_4km_em_ctl  nssl_4km_GFS  nssl_4km_nmb_ctl  nssl_4km_nmb_n1  nssl_4km_nmb_p1  nssl_4km_nmb_p2  nssl_4km_nmm_ctl  nssl_4km_nmm_n1  nssl_4km_nmm_p1

var nsslwrfEnsemble15 = {
        "members":["nssl_4km","nssl_4km_em_ctl","nssl_4km_GFS","nssl_4km_nmb_ctl","nssl_4km_nmb_n1","nssl_4km_nmb_p1",
                "nssl_4km_nmb_p2","nssl_4km_nmm_ctl","nssl_4km_nmm_n1","nssl_4km_nmm_p1","max"],
        "names":["NSSL WRF","NSSL WRF EM CTL","NSSL WRF GFS","NSSL WRF NMB CTL","NSSL WRF NMB N1","NSSL WRF NMB P1",
                "NSSL WRF NMB P2","NSSL WRF NMM CTL","NSSL WRF NMM N1","NSSL WRF NMM P1","Max Any Member"],
        "hours": 36,
        "interval": [60,60,60,60,60,60,60,60,60,60,60],
        "initHours": [0],
        "bounds": new OpenLayers.Bounds(-15288220.777,2454404.734,-6533934.514,7167833.953),
        "fields": ["mucape","cape","cin","hlcy01","hlcy03","refl","refl1km","t2m","td2m","uphlcy","wind10m","precip03","precip06","precip12","hailcast","uhObjects","stormObjects"],
        "fieldNames":["Most Unstable CAPE","Surface-Based CAPE","Surface-Based CIN","0-1 km SRH","0-3 km SRH","Composite Reflectivity",
                "1 km Reflectivity","2 m Temperature","2 m Dew Point","2-5 km Updraft Helicity","10 m Wind Speeds","3-hr QPF","6-hr QPF","12-hr QPF","Hailcast","UH Objects","Storm Objects"],
        "maxFields":["uphlcy","hailcast","t2m"]
};

var nsslwrfEnsemble17 = {
	"members":["nssl_4km"],
	"names":["NSSL WRF"],
	"hours": 36,
       	"interval": [60,60],
       	"initHours": [0],
       	"bounds": new OpenLayers.Bounds(-15288220.777,2454404.734,-6533934.514,7167833.953),
	"fields": ["probs","timing"],
	"fieldNames":["12-36 Hr Total Severe Probability","12-36 Hr Max Severe Probability Timing"],
	"maxFields":[]
};

var hrrrEnsembleE = {
       	"members":["hrrre_3km"],
       	"names":["HRRR-E"],
        "hours": 36,
       	"interval": [60,60],
        "initHours": [0],
        "bounds": new OpenLayers.Bounds(-15288220.777,2454404.734,-6533934.514,7167833.953),
       	"fields": ["probs","timing"],
        "fieldNames":["12-36 Hr Total Severe Probability","12-36 Hr Max Severe Probability Timing"],
        "maxFields":[]
};

var ouMapEnsemble = {
        "members":["001","002","003","004","005","006","007","008","009","010","011","012","013","014","015","016","017","018","019","020","ensmean","cross"],
        "names":["Member 01","Member 02","Member 03","Member 04","Member 05","Member 06","Member 07","Member 08","Member 09","Member 10","Member 11","Member 12","Member 13","Member 14","Member 15","Member 16","Member 17","Member 18","Member 19","Member 20","Ensemble Mean","Cross-Sections"],
        "hours": 48,
        "interval": [60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60],
        "initHours": [0],
        "bounds": new OpenLayers.Bounds(-11690105.0062, 3566381.52116, -10279620.2661, 5371508.16614),
    	"fields": ["precip","cape0000m","cape0500m","cape1000m","cape1500m","cape2000m","cape2500m","cape3000m",
		"llj0000m","llj0100m","llj0200m","llj0300m","llj0400m","llj0500m","llj0600m","llj0700m","llj0800m","llj0900m","llj1000m","llj1500m","llj2000m","llj2500m","llj3000m",
		"conv0000m","conv0100m","conv0200m","conv0300m","conv0400m","conv0500m","conv0600m","conv0700m","conv0800m","conv0900m","conv1000m","conv1500m","conv2000m","conv2500m","conv3000m",
		"mb250","mb500","mb700","mb850",
		"zlcl0000m","zlcl0500m","zlcl1000m","zlcl1500m","zlcl2000m","zlcl2500m","zlcl3000m",
		"isentropic345k","isentropic335k","isentropic320k","isentropic315k","isentropic310k","isentropic305k","isentropic300k","isentropic295k",
		"thte1000mb","thte900mb","thte850mb","thte750mb","thte700mb","thte600mb",
		"mucape","pv335","pv345","lapse8","lapse7","mlcape","mmp","srh_3km","srh_1km","srh_eff","dbz_cref","maxuh","dcape","max10m","temp","dewp","uccape","hgtfall","dbz1km","thte800mb"],
        "fieldNames":["precip","cape0000m","cape0500m","cape1000m","cape1500m","cape2000m","cape2500m","cape3000m",
                "llj0000m","llj0100m","llj0200m","llj0300m","llj0400m","llj0500m","llj0600m","llj0700m","llj0800m","llj0900m","llj1000m","llj1500m","llj2000m","llj2500m","llj3000m",
                "conv0000m","conv0100m","conv0200m","conv0300m","conv0400m","conv0500m","conv0600m","conv0700m","conv0800m","conv0900m","conv1000m","conv1500m","conv2000m","conv2500m","conv3000m",  
                "mb250","mb500","mb700","mb850",
                "zlcl0000m","zlcl0500m","zlcl1000m","zlcl1500m","zlcl2000m","zlcl2500m","zlcl3000m",
                "isentropic345k","isentropic335k","isentropic320k","isentropic315k","isentropic310k","isentropic305k","isentropic300k","isentropic295k",
                "thte1000mb","thte900mb","thte850mb","thte750mb","thte700mb","thte600mb",
                "mucape","pv335","pv345","lapse8","lapse7","mlcape","mmp","srh_3km","srh_1km","srh_eff","dbz_cref","maxuh","dcape","max10m","temp","dewp","uccape","hgtfall","dbz1km","thte800mb"]
};

var ouMap1km = {
        "members":["hires"],
        "names":["1 km"],
        "hours": 24,
        "interval": [60],
        "initHours": [0],
        "bounds": new OpenLayers.Bounds(-11593702.3271, 3687623.82337, -10420795.6443, 5233396.02683),
        "fields": ["precip","dbz_cref","maxuh","max10m","temp","dewp","dbz1km","div10m","w1","w5","invhgt"],
        "fieldNames":["precip","dbz_cref","maxuh","max10m","temp","dewp","dbz1km","div10m","w1","w5","invhgt"]
};

var ouMapProb = {
       	"members":["prob"],
       	"names":["Ensemble"],
       	"hours": 48,
       	"interval": [60],
        "initHours": [0],
       	"bounds": new OpenLayers.Bounds(-11690105.0062, 3566381.52116, -10279620.2661, 5371508.16614),
        "fields": ["dbz30","dbz40","dbz50","spd20","spd25","spd30","spd35","uh25","uh50","uh75","uh100","precip01","precip10","precip25","precip50"],
       	"fieldNames":["dbz30","dbz40","dbz50","spd20","spd25","spd30","spd35","uh25","uh50","uh75","uh100","precip01","precip10","precip25","precip50"]
};

var ouMapSpag = {
       	"members":["spag"],
        "names":["Ensemble"],
       	"hours": 48,
       	"interval": [60],
       	"initHours": [0],
       	"bounds": new OpenLayers.Bounds(-11690105.0062, 3566381.52116, -10279620.2661, 5371508.16614),
        "fields": ["dbz_sp30","dbz_sp40","dbz_sp50","spd_sp20","spd_sp25","spd_sp30","spd_sp35","uh_sp25","uh_sp50","uh_sp75","uh_sp100","precip_sp01","precip_sp10","precip_sp25","precip_sp50"],
       	"fieldNames":["dbz_sp30","dbz_sp40","dbz_sp50","spd_sp20","spd_sp25","spd_sp30","spd_sp35","uh_sp25","uh_sp50","uh_sp75","uh_sp100","precip_sp01","precip_sp10","precip_sp25","precip_sp50"]
};

var ukmetEnsemble = {
        "members":["ukmet_2km","ukmet_2Pkm","ukmet_1km"],
        "names":["2.2 km","2.2 km (Parallel)","1 km"],
        "hours": 48,
        "interval": [60,60,60],
        "initHours": [0,0,0],
        "bounds": new OpenLayers.Bounds(-15288220.777,2454404.734,-6533934.514,7167833.953),
        "fields": ["refl","refl1km","t2m","td2m","uphlcy","wind10m"],
        "fieldNames":["Composite Reflectivity","1 km Reflectivity","2 m Temperature","2 m Dew Point","Updraft Helicity","10 m Wind Speeds"]
};

/*
var wofEnsemble = {
       	"members":["WoF_01","WoF_02","WoF_03","WoF_04","WoF_05","WoF_06","WoF_07","WoF_08","WoF_09","WoF_10","WoF_11","WoF_12","WoF_13","WoF_14",
		"WoF_15","WoF_16","WoF_17","WoF_18","WoF_19","WoF_20","WoF_21","WoF_22","WoF_23","WoF_24","WoF_25","WoF_26","WoF_27","WoF_28",
		"WoF_29","WoF_30","WoF_31","WoF_32","WoF_33","WoF_34","WoF_35","WoF_36"],
       	"names":["WoF 01","WoF 02","WoF 03","WoF 04","WoF 05","WoF 06","WoF 07","WoF 08","WoF 09","WoF 10","WoF 11","WoF 12","WoF 13","WoF 14",
               	"WoF 15","WoF 16","WoF 17","WoF 18","WoF 19","WoF 20","WoF 21","WoF 22","WoF 23","WoF 24","WoF 25","WoF 26","WoF 27","WoF 28",
               	"WoF 29","WoF 30","WoF 31","WoF 32","WoF 33","WoF 34","WoF 35","WoF 36"],
       	"minutes": 60,
       	"interval": [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
       	"initHours": [0],
       	"bounds": "unk",
       	"fields": ["refl1km"],
       	"fieldNames":["1 km Reflectivity"]
};

var wofEnsemble = {
        "members":["WoF_Ens"],
        "names":["WoF Ensemble"],
        "minutes": 60,
        "interval": [5],
        "initHours": [0],
        "bounds": "unk",
        "fields": ["reflMean","reflMeanmax","refl35","refl35max","refl1kmMean","refl1kmMeanmax","refl1km35","refl1km35max","uphlcy25","uphlcy25max","wind10mMean","wind10mMeanmax",
	"wind10m25","wind10m25max","t2mMean","t2mMeanmax","td2mMean","td2mMeanmax","shear06Mean","shear06Meanmax","capeMean","capeMeanmax","mlcapeMean","mlcapeMeanmax","mucapeMean",
	"mucapeMeanmax","cinMean","cinMeanmax","mlcinMean","mlcinMeanmax","mucinMean","mucinMeanmax"],
        "fieldNames":["Mean Composite Refl.","Accum. Mean Composite Refl.","% of Refl. > 35 dBZ","Accum. % of Refl. > 35 dBZ","Mean 1 km AGL Refl.","Accum. Mean 1 km AGL Refl.",
	"% of 1 km AGL Refl. > 35 dBZ","Accum. % of 1 km AGL Refl. > 35 dBZ","% of Updraft Helicity > 25 m^2/s^2","Accum. % of Updraft Helicity > 25 m^2/s^2",
	"Mean Lowest-Level Wind Speed","Accum. Mean Lowest-Level Wind Speed","% of LL Wind Speed > 50 kts","Accum. % of LL Wind Speed > 50 kts","Mean 2 m AGL Temp.","Accum. Mean 2 m AGL Temp.",
	"Mean 2 m AGL Dew Point","Accum. Mean 2 m AGL Dew Point","Mean 0-6 km AGL Shear","Accum. 0-6 km AGL Shear","Mean SB-CAPE","Accum. SB-CAPE","Mean ML-CAPE","Accum. ML-CAPE",
	"Mean MU-CAPE","Accum. MU-CAPE","Mean SB-CIN","Accum. SB-CIN","Mean ML-CIN","Accum. ML-CIN","Mean MU-CIN","Accum. MU-CIN"]
};
*/
var wofEnsemble = {
        "members":["WoF_Ens","WoF_MDA"],
        "names":["WoF NEWS-e (RDA)","WoF NEWS-e (MDA)"],
	"minutes": 90,
        "interval": [5,5],
        "initHours": [0,0],
        "bounds": "unk",
        "fields": ["uphlcy25","vort005","refl35","refl1km35","wind10m25","reflMean","refl1kmMean","wind10mMean","precipMean","t2mMean","td2mMean","shear06Mean","capeMean","mlcapeMean","mucapeMean",
		"cinMean","mlcinMean","mucinMean"],
        "fieldNames":["% of 2-5 km AGL Updraft Helicity > 25 m^2/s^2","% of 0-2 km AGL Vorticity > 0.005 s^-1","% of Composite Refl. > 35 dBZ","% of 1 km AGL Refl. > 35 dBZ","% of LL Wind Speed > 50 kts",
		"Mean Composite Refl.","Mean 1 km AGL Refl.","Mean Lowest-Level Wind Speed","Mean Accumulated Precipitation","Mean 2 m AGL Temp.","Mean 2 m AGL Dew Point","Mean 0-6 km AGL Shear","Mean SB-CAPE","Mean ML-CAPE",
		"Mean MU-CAPE","Mean SB-CIN","Mean ML-CIN","Mean MU-CIN"]
}

var hrrrEnsemble = {
       	"members":["hrrr_3km"],
       	"names":["3 km"],
       	"hours": 15,
       	"interval": [60],
       	"initHours": [0],
       	"bounds": new OpenLayers.Bounds(-15288220.777,2454404.734,-6533934.514,7167833.953),
	"fields": ["mucape","cape","cin","hlcy01","hlcy03","refl","refl1km","t2m","td2m","uphlcy","wind10m","precip03","precip06",],
       	"fieldNames":["Most Unstable CAPE","Surface-Based CAPE","Surface-Based CIN","0-1 km SRH","0-3 km SRH","Composite Reflectivity",
               	"1 km Reflectivity","2 m Temperature","2 m Dew Point","2-5 km Updraft Helicity","10 m Wind Speeds","3-hr QPF","6-hr QPF"]
};

var namEnsemble = {
        "members":["nam"],
        "names":["NAM"],
        "hours": 36,
        "interval": [60],
        "initHours": [0],
        "bounds": new OpenLayers.Bounds(-15288220.777,2454404.734,-6533934.514,7167833.953),
        "fields": ["mucape","cape","cin","hlcy03","refl","refl1km","t2m","td2m","wind10m","precip03","precip06","precip12"],
        "fieldNames":["Most Unstable CAPE","Surface-Based CAPE","Surface-Based CIN","0-3 km SRH","Composite Reflectivity",
                "1 km Reflectivity","2 m Temperature","2 m Dew Point","10 m Wind Speeds","3-hr QPF","6-hr QPF","12-hr QPF"]
};

var gfsEnsemble = {
        "members":["gfs"],
        "names":["GFS"],
        "hours": 36,
        "interval": [180],
        "initHours": [0],
        "bounds": new OpenLayers.Bounds(-15288220.777,2454404.734,-6533934.514,7167833.953),
        "fields": ["mucape","cape","cin","hlcy03","t2m","td2m","wind10m","precip03","precip06","precip12"],
        "fieldNames":["Most Unstable CAPE","Surface-Based CAPE","Surface-Based CIN","0-3 km SRH",
                "2 m Temperature","2 m Dew Point","10 m Wind Speeds","3-hr QPF","6-hr QPF","12-hr QPF"]
};

var conusObs = {
        "members":["radar","satellite","analysis"],
        "names":["Radar","Satellite","RAP Analysis"],
        "interval": [60,60,60],
        "bounds": new OpenLayers.Bounds(-15288220.777,2454404.734,-6533934.514,7167833.953),
	"satBounds": new OpenLayers.Bounds(-14026255.839952469,2753408.1093649799,-7347086.3923560558,6446275.8410171578),
        "radarObs": ["refl","refl1km","mesh"],
        "radarObsNames":["Composite Reflectivity","Lowest Alt. Reflectivity","MESH"],
	"satelliteObs":["vis1km","ir4km","wv4km"],
	"satelliteObsNames":["Visible","Infrared","Water Vapor"],
	"analysisObs":["mucape","cape","cin","hlcy01","hlcy03","t2m","td2m","wind10m"],
	"analysisObsNames":["Most Unstable CAPE","Surface-Based CAPE","Surface-Based CIN","0-1 km SRH","0-3 km SRH",
               	"2 m Temperature","2 m Dew Point","10 m Wind Speeds"]
};


function loadBackgroundOpts(){
	if(drawType != null){
               	alert('You must deactivate all other controls first');
               	return;
       	}
       	drawType = 'background';
	document.getElementById("drawButton").src = "images/drawButtonSelect.png";
       	document.getElementById("drawButton").onclick = unloadBackground;
       	document.getElementById("drawButton").onmouseout = function(){this.src = "images/drawButtonSelect.png";}
       	document.getElementById("drawButton").onmouseover = function(){this.src = "images/drawButtonSelect.png";}
       	backGPanel = Ext.getCmp('backgroundPanel');
       	backGPanel.show();
	innerHTML = '<center><input type="button" id="genProbs" value="Generate Probabilities From Ensemble Data" onClick="loadProbsConfig();" /><br>';
	innerHTML += '<input type="button" id="drawProbs" value="Free Hand Draw Probabilities" onClick="loadBackground();" /></center>';
	document.getElementById("backgroundConfig").innerHTML = innerHTML;
}

function loadBackground(inDraw,loadNone){
	if(inDraw != null){
		drawType = null;
	}
	if(drawType != null){
               	alert('You must deactivate all other controls first');
               	return;
       	}
	if(inDraw != null){
	       	drawType = inDraw;
	}
	else{
		drawType = 'background';
	        document.getElementById("drawButton").src = "images/drawButtonSelect.png";
	       	document.getElementById("drawButton").onclick = unloadBackground;
	        document.getElementById("drawButton").onmouseout = function(){this.src = "images/drawButtonSelect.png";}
	        document.getElementById("drawButton").onmouseover = function(){this.src = "images/drawButtonSelect.png";}
	}
       	backGPanel = Ext.getCmp('backgroundPanel');
        backGPanel.show();
	//innerHTML = '<br><b><u>Regional PHI</u>:</b><br><br>';
	innerHTML = '<br><div id="phiOpts"></div><br>';
	for(i=1;i<=40;i++){
		innerHTML += '<div id="contours' + i + '"></div>';
	}
	document.getElementById("backgroundConfig").innerHTML = innerHTML;
	loadPHIOpts(loadNone);
	if(!(document.createElement("input").webkitSpeech === undefined)){
                innerHTML = '<br><b><u>Discussion</u>:</b> <input x-webkit-speech type="text" id="speech" size="0" size="60" placeholder="Use For Speech -->" onwebkitspeechchange="setTextArea(this.value);" /><br><textarea id="discussion" rows="6" cols="65" >Recognized text will be copied here (or type manually).</textarea><br>';
       	}
       	else{
		innerHTML = '<br><b><u>Discussion</u>:</b><br><textarea id="discussion" rows="6" cols="65">Type discussion here.</textarea><br>';
	}
	innerHTML += '<center><input type="button" value="Issue" onClick="activateBackground();"></input></center>';
	document.getElementById("activatebackground").innerHTML = innerHTML;
}

function unloadBackground(){
	if(modifyFeature2.feature){
		modifyFeature2.unselectFeature(modifyFeature2.feature);
	}
	drawType = null;
	document.getElementById("backgroundConfig").innerHTML = '';
	document.getElementById("activatebackground").innerHTML = '';
	document.getElementById("drawButton").onclick = function(){loadBackground();}
        document.getElementById("drawButton").onmouseout = function(){this.src = "images/drawButton.png";}
        document.getElementById("drawButton").onmouseover = function(){this.src = "images/drawButtonHighlight.png";}
        document.getElementById("drawButton").src = "images/drawButton.png";
	//document.getElementById("ensembleButton").onclick = function(){loadProbsConfig();}
       	//document.getElementById("ensembleButton").onmouseout = function(){this.src = "images/ensembleButton.png";}
       	//document.getElementById("ensembleButton").onmouseover = function(){this.src = "images/ensembleButtonHighlight.png";}
       	//document.getElementById("ensembleButton").src = "images/ensembleButton.png";
       	document.getElementById("copyButton").onmouseout = function(){this.src = "images/copyButton.png";}
       	document.getElementById("copyButton").onmouseover = function(){this.src = "images/copyButtonHighlight.png";}
       	document.getElementById("copyButton").src = "images/copyButton.png";
	background_area.removeAllFeatures();
	background_area_null.removeAllFeatures();
	deletePendingRecords();
	modifyFeature2.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
	pending = false;
	revertNCPRecords();
	nsslOutlooks.setVisibility(false);
	selectGrid();
	changeTime();
}

function loadPHIOpts(loadNone){
	if(site == 'hwt'){
		innerHTML = '<b><u>Desk</u>:</b>';
		innerHTML += '<select id="deskType" onChange="loadPeriods(); loadHazards(); reassignIssueType(); loadContours(1)">';
                innerHTML += '<option value="NSSL">NSSL</option>';
                innerHTML += '<option value="SPC">SPC</option>';
                innerHTML += '</select><br>';
		innerHTML += '<div id="hazardOptions"></div>';
		innerHTML += '<b><u>Issuance</u>:</b> ';
                innerHTML += '<select id="issueType" onChange="reassignIssueType();">';
                innerHTML += '<option value="morning">Morning</option>';
                innerHTML += '<option value="afternoon">Afternoon</option>';
                innerHTML += '</select><br>';
		innerHTML += '<div id="periodOptions"></div>';
	}
	else if(site == 'pecan'){
		innerHTML = '<b><u>Issuance</u>:</b> ';
		innerHTML += '<select id="issueType" onChange="reassignIssueType(); reassignHazType();">';
		innerHTML += '<option value="morning">Morning (9am)</option>';
		innerHTML += '<option value="afternoon">Afternoon (3pm)</option>';
                innerHTML += '<option value="evening1">Evening 1 (6pm)</option>';
		innerHTML += '<option value="evening2">Evening 2 (7pm)</option>';
		innerHTML += '<option value="evening3">Evening 3 (8pm)</option>';
		innerHTML += '<option value="evening4">Evening 4 (9pm)</option>';
		innerHTML += '<option value="evening5">Evening 5 (10pm)</option>';
		innerHTML += '<option value="evening6">Evening 6 (11pm)</option>';
		innerHTML += '<option value="evening7">Evening 7 (12am)</option>';
		innerHTML += '</select><br>';
                innerHTML += '<b><u>Hazard</u>:</b> ';
                innerHTML += '<select id="hazardType" onChange="reassignHazType();">';
		innerHTML += '<option value="MCS">MCS Activity</option>';
		innerHTML += '<option value="CI">Pristine Convective Initiation</option>';
		innerHTML += '<option value="BORE">Bore Activity</option>';
		innerHTML += '</select><br>';
		innerHTML += '<div id="periodOptions"></div>';
       	}
	innerHTML += '<div id="editMode"></div>';
	document.getElementById('phiOpts').innerHTML = innerHTML;

	if(site == 'hwt'){
		timeCheck = new Date();
                if(timeCheck.getUTCHours() < 18 && timeCheck.getUTCHours() > 9){
                        document.getElementById('issueType').selectedIndex = 0;
                }
                else{
                        document.getElementById('issueType').selectedIndex = 1;
                        document.getElementById('issueType').options[0].disabled = true;
                }
                loadPeriods();
                loadHazards();

		tNow = new Date(parseInt(timeCanvasVal.getAttr('time')) * 1000);
	        sel1 = document.getElementById('periodVal');
	        idx1 = -99;
	        for(i=0;i<sel1.options.length;i++){
	                hNow = sel1.options[i].value.split('_')[1];
			hSlide = tNow.getUTCHours();
			if(hSlide < 18){
				hSlide = hSlide + 24;
			}
	                if(hSlide == hNow){
	                        idx1 = i;
	                        break;
	                }
	        }
	        if(idx1 != -99){
	                sel1.selectedIndex = idx1;
	        }
	}
	else{
		loadPeriods();
	}

	if(loadNone == null){
		loadContours(1);
	}
	if(loadNone == null){
		contourNumber = 1;
	}
}

function loadHazards(){
	if(site != 'hwt'){
		return;
	}
	
	innerHTML = '<b><u>Hazard</u>:</b> ';
	innerHTML += '<select id="hazardType" onChange="reassignHazType();">';
	if(desk == 'NSSL'){
	        innerHTML += '<option value="coverage">Hourly Report Coverage</option>';
		innerHTML += '<option value="isochrone">Hourly Isochrones</option>';
	}
	else{
	        innerHTML += '<option value="tornado">Tornado (EF0+)</option>';
	        innerHTML += '<option value="hail">Hail (1"+)</option>';
	        innerHTML += '<option value="wind">Wind (50 kts+)</option>';
	}
        innerHTML += '</select><br>';
	document.getElementById('hazardOptions').innerHTML = innerHTML;
	loadEditMode();
}

function loadPeriods(){
	innerHTML = '<b><u>Period</u>:</b> ';
       	innerHTML += '<select id="periodVal" onChange="reassignPeriod();">';
	if(site == 'hwt'){
		now = new Date(currentTime * 1000);
                hStart = Math.floor(now.getUTCHours() / 3) * 3;
		if(document.getElementById('deskType').selectedIndex == 0){
			desk = 'NSSL';
			if(document.getElementById('issueType').selectedIndex == 0){
				innerHTML += '<option value="1_18_30">Day 1 4-hr Periods 1-9 (18-06 UTC)</option>';
				/*
				innerHTML += '<option value="1_18_22">Day 1 4-hr Period 1 (18-22 UTC)</option>';
				innerHTML += '<option value="1_19_23">Day 1 4-hr Period 2 (19-23 UTC)</option>';
				innerHTML += '<option value="1_20_24">Day 1 4-hr Period 3 (20-00 UTC)</option>';
				innerHTML += '<option value="1_21_25">Day 1 4-hr Period 4 (21-01 UTC)</option>';
				innerHTML += '<option value="1_22_26">Day 1 4-hr Period 5 (22-02 UTC)</option>';
				innerHTML += '<option value="1_23_27">Day 1 4-hr Period 6 (23-03 UTC)</option>';
				innerHTML += '<option value="1_24_28">Day 1 4-hr Period 7 (00-04 UTC)</option>';
				innerHTML += '<option value="1_25_29">Day 1 4-hr Period 8 (01-05 UTC)</option>';
				innerHTML += '<option value="1_26_30">Day 1 4-hr Period 9 (02-06 UTC)</option>';
				*/
	                }
	                else{
				//innerHTML += '<option value="1_22_30">Day 1 4-hr Periods 3-5 (22-06 UTC)</option>';
			}
		}
		else{
			desk = 'SPC';
			if(document.getElementById('issueType').selectedIndex == 0){
		       		innerHTML += '<option value="1_18_22">Day 1 4-hr Period 1 (18-22 UTC)</option>';
		        	innerHTML += '<option value="1_22_26">Day 1 4-hr Period 2 (22-02 UTC)</option>';
			}
			else{
				innerHTML += '<option value="1_22_26">Day 1 4-hr Period 2 (22-02 UTC)</option>';
			}
		}
	}
	else if(site == 'pecan'){
		var hIndex = document.getElementById('hazardType').selectedIndex;
		var iIndex = document.getElementById('issueType').selectedIndex;
		if(hIndex == 99){
			// hiding mcs options for now (99)
			innerHTML += '<option value="1_1">Day 1 3-hr Period 1</option>';
			innerHTML += '<option value="1_2">Day 1 3-hr Period 2</option>';
			innerHTML += '<option value="1_3">Day 1 3-hr Period 3</option>';
			innerHTML += '<option value="1_4">Day 1 3-hr Period 4</option>';
			innerHTML += '<option value="1_00_06">Day 1 6-hr Period 1 (00-06 UTC)</option>';
			innerHTML += '<option value="1_06_12">Day 1 6-hr Period 2 (06-12 UTC)</option>';
			innerHTML += '<option value="1_00_12">Day 1 12-hr Full Period (00-12 UTC)</option>';
			innerHTML += '<option value="2_00_12">Day 2 12-hr Full Period (00-12 UTC)</option>';
		}
		else if(iIndex == 0){
			// 9 am
			innerHTML += '<option value="1_00_12">Day 1 12-hr Full Period (00-12 UTC)</option>';
		}
		else if(iIndex == 1 && hIndex == 0){
			// 3 pm
			innerHTML += '<option value="1_00_03">Day 1 3-hr Period 1 (00-03 UTC)</option>';
                       	innerHTML += '<option value="1_03_06">Day 1 3-hr Period 2 (03-06 UTC)</option>';
                       	innerHTML += '<option value="1_06_09">Day 1 3-hr Period 3 (06-09 UTC)</option>';
                       	innerHTML += '<option value="1_09_12">Day 1 3-hr Period 4 (09-12 UTC)</option>';
			innerHTML += '<option value="2_00_12">Day 2 12-hr Full Period (00-12 UTC)</option>';
		}
		else if(iIndex == 1 && hIndex != 0){
			// 3 pm
			innerHTML += '<option value="1_00_06">Day 1 6-hr Period 1 (00-06 UTC)</option>';
                        innerHTML += '<option value="1_06_12">Day 1 6-hr Period 2 (06-12 UTC)</option>';
			innerHTML += '<option value="2_00_12">Day 2 12-hr Full Period (00-12 UTC)</option>';
		}
		else if(iIndex == 2 && hIndex == 0){
			// 6 pm
			innerHTML += '<option value="1_00_03">Day 1 3-hr Period 1 (00-03 UTC)</option>';
                       	innerHTML += '<option value="1_03_06">Day 1 3-hr Period 2 (03-06 UTC)</option>';
                       	innerHTML += '<option value="1_06_09">Day 1 3-hr Period 3 (06-09 UTC)</option>';
                        innerHTML += '<option value="1_09_12">Day 1 3-hr Period 4 (09-12 UTC)</option>';
               	}
		else if(iIndex == 2 && hIndex == 1){
			// 6 pm
			innerHTML += '<option value="1_00_06">Day 1 6-hr Period 1 (00-06 UTC)</option>';
                       	innerHTML += '<option value="1_06_12">Day 1 6-hr Period 2 (06-12 UTC)</option>';
		}
		else if(iIndex == 3 && hIndex == 2){
			// 7 pm
			innerHTML += '<option value="1_00_06">Day 1 6-hr Period 1 (00-06 UTC)</option>';
                       	innerHTML += '<option value="1_06_12">Day 1 6-hr Period 2 (06-12 UTC)</option>';
               	}
		else if(iIndex == 4){
                        // 8 pm
                        innerHTML += '<option value="2_00_12">Day 2 12-hr Full Period (00-12 UTC)</option>';
                }
		else if(iIndex == 5 && hIndex == 2){
			// 9 pm
			innerHTML += '<option value="1_03_06">Day 1 3-hr Period 2 (03-06 UTC)</option>';
                       	//innerHTML += '<option value="1_06_09">Day 1 3-hr Period 3 (06-09 UTC)</option>';
                       	//innerHTML += '<option value="1_09_12">Day 1 3-hr Period 4 (09-12 UTC)</option>';
			innerHTML += '<option value="1_06_12">Day 1 6-hr Period 3 (06-12 UTC)</option>';
               	}
		else if(iIndex == 6 && hIndex == 2){
			// 10 pm
			innerHTML += '<option value="1_06_12">Day 1 6-hr Period 3 (06-12 UTC)</option>';
                       	//innerHTML += '<option value="1_09_12">Day 1 3-hr Period 4 (09-12 UTC)</option>';
			//innerHTML += '<option value="2_00_12">Day 2 12-hr Full Period (00-12 UTC)</option>';
               	}
		else if(iIndex == 6 && hIndex == 1){
                        // 10 pm
                        innerHTML += '<option value="1_06_12">Day 1 6-hr Period 3 (06-12 UTC)</option>';
                }
		else if(iIndex == 7 && hIndex == 2){
			// 11 pm
			innerHTML += '<option value="1_06_12">Day 1 6-hr Period 4 (06-12 UTC)</option>';
                       	//innerHTML += '<option value="2_00_12">Day 2 12-hr Full Period (00-12 UTC)</option>';
		}
		else if(iIndex == 8 && hIndex != 2){
			// 12 am
			innerHTML += '<option value="1_09_12">Day 1 3-hr Period 4 (09-12 UTC)</option>';
		}
	}
        innerHTML += '</select>';
	innerHTML += '<span id="mcsOptions"></span>';
	innerHTML += '<span id="mcsOptions2"></span>';
	document.getElementById('periodOptions').innerHTML = innerHTML;
	//loadMCSOptions();
}

function loadMCSOptions(){
	return;
	if(site != 'pecan'){
		return;
	}
	if(document.getElementById('hazardType').selectedIndex == 0 && document.getElementById('periodVal').selectedIndex != 4){
	       	innerHTML = '<select id="periodValHour" onChange="">';
		for(var i=0;i<=9;i++){
			h2 = i + 3;
			innerHTML += '<option value="' + pad(i) + '_' + pad(h2) + '">' + pad(i) + ' - ' + pad(h2) + ' UTC</option>';
		}
		innerHTML += '</select>';
		document.getElementById('mcsOptions').innerHTML = innerHTML;
	}
	else{
		document.getElementById('mcsOptions').innerHTML = '';
	}
}

function loadContours(cNum,auto){
	if(cNum == null){
		return;
	}
	if(site == 'pecan'){
		if(document.getElementById('hazardType').value == 'MCS'){
			cVals = ['Low','Moderate','High','Line'];
		}
		else{
			cVals = ['Low','Moderate','High'];
			}
		innerHTML = '<span id="bkgd' + cNum + '" style="color:' + getPecanColor(auto) + ';"><b onClick="highlightContour(' + cNum + ');"><u>Contour</u>:</b></span> ';
		per = '';
	}
	else if(desk == 'SPC'){
		if(document.getElementById('hazardType').value == 'tornado' || document.getElementById('hazardType').value == 'all'){
			cVals = [2,5,10,15,30,45,60];
			innerHTML = '<span id="bkgd' + cNum + '" style="color:' + getSPCTornadoColor(auto) + ';"><b onClick="highlightContour(' + cNum + ');"><u>Contour</u>:</b></span> ';
			per = '%';
		}
		else{
			cVals = [5,15,30,45,60];
			innerHTML = '<span id="bkgd' + cNum + '" style="color:' + getSPCColor(auto) + ';"><b onClick="highlightContour(' + cNum + ');"><u>Contour</u>:</b></span> ';
			per = '%';
		}
	}
	else{
		if(document.getElementById('issueType').selectedIndex == 0){
			if(document.getElementById('hazardType').value == 'isochrone'){
				cVals = ['18_22','19_23','20_24','21_25','22_26','23_27','24_28','25_29','26_30'];
			}
			else{
				cVals = ['18_19','19_20','20_21','21_22','22_23','23_24','24_25','25_26','26_27'];
			}
		}
		else{
			cVals = [];
		}
		if(document.getElementById('hazardType').value == 'isochrone'){
			innerHTML = '<span id="bkgd' + cNum + '" style="color:black;"><b onClick="highlightContour(' + cNum + ');"><u>Isochrone</u>:</b></span> ';
		}
		else{
			innerHTML = '<span id="bkgd' + cNum + '" style="color:black;"><b onClick="highlightContour(' + cNum + ');"><u>Coverage</u>:</b></span> ';
		}
		per = '';
	}
	innerHTML += '<select id="contourVal' + cNum + '" onChange="loadContourColor(' + cNum + '); editContourOn();">';
	if(desk == 'NSSL'){
		for(var i=0;i<cVals.length;i++){
			var lbl = fixUTC(cVals[i].split('_')[0]) + ' - ' + fixUTC(cVals[i].split('_')[1]) + ' UTC';
			if(cNum == (i+1)){
				innerHTML += '<option value="' + cVals[i] + '" selected>' + lbl + '</option>';
			}
			else{
				innerHTML += '<option value="' + cVals[i] + '">' + lbl + '</option>';
			}
		}
	}
	else{
		if(auto != null && cVals.indexOf(auto) == -1){
			trip = false;
			for(var i=0;i<cVals.length;i++){
				if(auto > cVals[i]){
					trip = true;
				}
				else if(auto < cVals[i] && trip){
					innerHTML += '<option value="' + auto + '">' + auto + per + '</option>';
					trip = false;
				}
				innerHTML += '<option value="' + cVals[i] + '">' + cVals[i] + per + '</option>';
			}
		}
		else{
			for(var i=0;i<cVals.length;i++){
	                        innerHTML += '<option value="' + cVals[i] + '">' + cVals[i] + per + '</option>';
	               	}
		}
	}
	innerHTML += '</select>';
	if(auto != null){
		innerHTML += '<input type="button" value="Delete" id="deleteContourButton' + cNum + '" onClick="deleteContour(' + cNum + ');" />';
	}
	else{
		innerHTML += '<span id="backgroundConfigure' + cNum + '">';
		innerHTML += '<input type="button" value="Draw" id="drawButton' + cNum + '" onClick="drawBackground(' + cNum + ');" />';
		innerHTML += '</span>';
	}
	innerHTML += '<span id="editContour' + cNum + '"></span>';
	document.getElementById('contours' + cNum).innerHTML = innerHTML;
}

function loadProbsConfigOrig(){
	if(drawType != null){
               	alert('You must deactivate all other controls first');
               	return;
       	}
       	drawType = 'background';
        //document.getElementById("ensembleButton").src = "images/ensembleButtonSelect.png";
       	//document.getElementById("ensembleButton").onclick = unloadBackground;
        //document.getElementById("ensembleButton").onmouseout = function(){this.src = "images/ensembleButtonSelect.png";}
        //document.getElementById("ensembleButton").onmouseover = function(){this.src = "images/ensembleButtonSelect.png";}
       	backGPanel = Ext.getCmp('backgroundPanel');
        backGPanel.show();
	innerHTML = '<b><u>Ensemble</u>:</b><select id="ensemble" onChange="loadMembers();">';
	innerHTML += '<option value="nsslwrf15">NSSL WRF 2015</option>';
	innerHTML += '</select>';
	innerHTML += '<span id="membersConfig"></span><br>';
	innerHTML += '<div id="fhoursConfig"></div>';
	innerHTML += '<b><u>Hazard</u>:</b> ';
        innerHTML += '<select id="hazardType" onChange="">';
	innerHTML += '<option value="all">Total Severe (All)</option>';
        innerHTML += '<option value="tornado">Tornado (EF0+)</option>';
        innerHTML += '<option value="hail">Hail (1"+)</option>';
        innerHTML += '<option value="wind">Wind (50 kts+)</option>';
        innerHTML += '</select><br>';
	innerHTML += '<b><u>Issuance</u>:</b> ';
        innerHTML += '<select id="issueType" onChange="">';
        innerHTML += '<option value="morning">Morning</option>';
       	innerHTML += '<option value="afternoon">Afternoon</option>';
       	innerHTML += '</select><br>';
	innerHTML += '<span id="field1"></span>';
	innerHTML += '<span id="field2"></span>';
	innerHTML += '<span id="field3"></span>';
	innerHTML += '<span id="field4"></span>';
	innerHTML += '<span id="field5"></span>';
	innerHTML += '<span id="field6"></span>';
	innerHTML += '<b><u>Radius of Influence</u>:</b><input id="roi" type="text" size="4" value="25" /> miles of a point<br>';
	innerHTML += '<b><u>Gaussian Filter</u>:</b><input id="sigma" type="text" size="4" value="10" /> sigma<br>';
	//innerHTML += '<b><u>Probability Contour Levels</u>:</b><input id="levels" type="text" size="20" value="2,5,10,15,30,45,60" /><br>';
	innerHTML += '<input type="button" value="Generate" onClick="genProbs();" />';
	document.getElementById("backgroundConfig").innerHTML = innerHTML;
	timeCheck = new Date();
       	if(timeCheck.getUTCHours() < 18 && timeCheck.getUTCHours() > 9){
               	document.getElementById('issueType').selectedIndex = 0;
       	}
       	else{
               	document.getElementById('issueType').selectedIndex = 1;
		document.getElementById('issueType').options[0].disabled = true;
       	}
	loadMembers();
	loadFieldConfig(1);
}

function loadProbsConfig(){
        if(drawType != null){
                alert('You must deactivate all other controls first');
                return;
        }
        drawType = 'background';
        //document.getElementById("ensembleButton").src = "images/ensembleButtonSelect.png";
        //document.getElementById("ensembleButton").onclick = unloadBackground;
        //document.getElementById("ensembleButton").onmouseout = function(){this.src = "images/ensembleButtonSelect.png";}
        //document.getElementById("ensembleButton").onmouseover = function(){this.src = "images/ensembleButtonSelect.png";}
        backGPanel = Ext.getCmp('backgroundPanel');
        backGPanel.show();
        innerHTML = '<b><u>Ensemble</u>:</b><select id="ensemble" onChange="loadMembers();">';
        innerHTML += '<option value="nsslwrf15">NSSL WRF 2015</option>';
        innerHTML += '</select>';
        innerHTML += '<span id="membersConfig"></span><br>';
        innerHTML += '<div id="fhoursConfig"></div>';
        innerHTML += '<b><u>Hazard</u>:</b> ';
        innerHTML += '<select id="hazardType" onChange="">';
        innerHTML += '<option value="all">Total Severe (All)</option>';
        innerHTML += '<option value="tornado">Tornado (EF0+)</option>';
        innerHTML += '<option value="hail">Hail (1"+)</option>';
        innerHTML += '<option value="wind">Wind (50 kts+)</option>';
        innerHTML += '</select><br>';
        innerHTML += '<b><u>Issuance</u>:</b> ';
        innerHTML += '<select id="issueType" onChange="">';
        innerHTML += '<option value="morning">Morning</option>';
        innerHTML += '<option value="afternoon">Afternoon</option>';
        innerHTML += '</select><br>';
        innerHTML += '<span id="field1"></span>';
        innerHTML += '<span id="field2"></span>';
        innerHTML += '<span id="field3"></span>';
        //innerHTML += '<span id="field4"></span>';
        //innerHTML += '<span id="field5"></span>';
        //innerHTML += '<span id="field6"></span>';
        innerHTML += '<b><u>Radius of Influence</u>:</b>';
	innerHTML += '<select id="roi">';
	innerHTML += '<option value="12.5">12.5</option>';
	innerHTML += '<option value="25" selected>25</option>';
	innerHTML += '</select> miles of a point<br>';
        innerHTML += '<b><u>Gaussian Filter</u>:</b>';
	innerHTML += '<select id="sigma">';
        innerHTML += '<option value="10">10</option>';
        innerHTML += '<option value="20" selected>20</option>';
        innerHTML += '</select> sigma<br>';
        //innerHTML += '<b><u>Probability Contour Levels</u>:</b><input id="levels" type="text" size="20" value="2,5,10,15,30,45,60" /><br>';
        innerHTML += '<input type="button" value="Generate" onClick="genProbs();" />';
        document.getElementById("backgroundConfig").innerHTML = innerHTML;
        timeCheck = new Date();
        if(timeCheck.getUTCHours() < 18 && timeCheck.getUTCHours() > 9){
                document.getElementById('issueType').selectedIndex = 0;
        }
        else{
                document.getElementById('issueType').selectedIndex = 1;
                document.getElementById('issueType').options[0].disabled = true;
        }
        loadMembers();
	loadHazards();
        loadFieldConfig(1);
}

function loadEditMode(){
	if(desk == 'SPC' || document.getElementById('hazardType').value == 'coverage'){
		var innerHTML = '<br><b><u>Edit Mode</u>:</b> ';
	        innerHTML += '<select id="contourEditMode" onChange="changeEditMode();">';
	        innerHTML += '<option value="reshape">Reshape Contours</option>';
	        innerHTML += '<option value="drag">Drag Contours</option>';
	        innerHTML += '<option value="resize">Resize Contours</option>';
	        innerHTML += '<option value="rotate">Rotate Contours</option>';
	        innerHTML += '</select><br><br>';
		if(desk == 'SPC'){
			innerHTML += '<input type="button" value="Load Auto Probs" onClick="getAutoProbs(\'auto\')" />';
			innerHTML += '<input type="button" value="Load Calibrated Probs" onClick="getAutoProbs(\'cal\')" />';
		}
		else{
			innerHTML += '<form id="nsslRadio">';
	                innerHTML += '<input type="radio" name="nsslProbs" id="nsslRadio1" value="full" onClick="showNSSLProbs(this.value);" checked />Show Full Period SVR Probs<br>';
	                //innerHTML += '<input type="radio" name="nsslProbs" id="nsslRadio2" value="hour" onClick="showNSSLProbs(this.value);" />Show 4-Hour SVR Probs';
	                innerHTML += '</form>';
		}
	}
	else{
		var innerHTML = '<br><b><u>Edit Mode</u>:</b> ';
                innerHTML += '<select id="contourEditMode" onChange="changeEditMode();">';
                innerHTML += '<option value="reshape">Reshape Line</option>';
                innerHTML += '<option value="drag">Drag Line</option>';
                innerHTML += '<option value="resize">Resize Line</option>';
                innerHTML += '<option value="rotate">Rotate Line</option>';
                innerHTML += '</select><br><br>';
		innerHTML += '<form id="nsslRadio">';
                innerHTML += '<input type="radio" name="nsslProbs" id="nsslRadio1" value="full" onClick="showNSSLProbs(this.value);" checked />Show Full Period SVR Probs<br>';
		//innerHTML += '<input type="radio" name="nsslProbs" id="nsslRadio2" value="hour" onClick="showNSSLProbs(this.value);" />Show 4-Hour SVR Probs';
		innerHTML += '</form>';
	}
	document.getElementById('editMode').innerHTML = innerHTML;
	showNSSLProbs('full');
}

function loadFieldConfigOrig(fieldNum){
	fieldVals = ['uh1','uh2','uh3','hailcast','10mwind','clarkcon'];
	fieldNames = ['Updraft Helicity (2-5 km AGL)','Updraft Helicity (1-6 km AGL)','Updraft Helicity (0-3 km AGL)','Hailcast','10 m wind','Clark Con'];
	fieldLast = fieldNum - 1;
	if(fieldLast >= 1){
		if(document.getElementById("field_" + fieldLast).value == ''){
			document.getElementById("field" + fieldNum).innerHTML = '';
		}
		idx = fieldVals.indexOf('clarkcon');
		fieldVals.splice(idx, 1);
                fieldNames.splice(idx, 1);
		for(i=1;i<fieldNum;i++){
			idx = fieldVals.indexOf(document.getElementById("field_" + i).value);
			if(idx != -1){
				fieldVals.splice(idx, 1);
				fieldNames.splice(idx, 1);
			}
		}
	}
	for(i=fieldNum;i<=6;i++){
		document.getElementById("field" + i).innerHTML = '';
	}
	if(fieldLast >= 1){
		document.getElementById("operatorDiv" + (fieldNum - 1)).style.display = null;
                        document.getElementById("thresholdDiv" + (fieldNum - 1)).style.display = null;
		if(document.getElementById("field_" + fieldLast).value == ''){
			return;
		}
		else if(document.getElementById("field_" + fieldLast).value == 'clarkcon'){
			document.getElementById("operatorDiv" + (fieldNum - 1)).style.display = 'none';
			document.getElementById("thresholdDiv" + (fieldNum - 1)).style.display = 'none';
			innerHTML = '<b><u>Clark Con Field #1</u>:</b><select id="field_' + fieldNum + '">';
			innerHTML += '<option value="uh1">Updraft Helicity (2-5 km AGL)</option>';
			innerHTML += '<option value="uh2">Updraft Helicity (1-6 km AGL)</option>';
			innerHTML += '<option value="uh3">Updraft Helicity (0-3 km AGL)</option>';
			innerHTML += '</select>';
			innerHTML += '<select id="operator' + fieldNum + '"><option value="greaterThan">></option></select>';
		        innerHTML += '<input id="threshold' + fieldNum + '" type="text" size="4" value="" />';
		        innerHTML += '<span id="units' + fieldNum + '"></span><br>';
		        document.getElementById("field" + fieldNum).innerHTML = innerHTML;
			loadFieldVals(fieldNum);

			innerHTML = '<b><u>Clark Con Field #2</u>:</b><select id="field_' + (fieldNum + 1) + '">';
                        innerHTML += '<option value="lcl">LCL Height</option>';
                        innerHTML += '</select>';
                        innerHTML += '<select id="operator' + (fieldNum + 1) + '"><option value="lessThan"><</option></select>';
                        innerHTML += '<input id="threshold' + (fieldNum + 1) + '" type="text" size="4" value="" />';
                        innerHTML += '<span id="units' + (fieldNum + 1) + '"></span><br>';
                        document.getElementById("field" + (fieldNum + 1)).innerHTML = innerHTML;
                        loadFieldVals((fieldNum + 1));

			innerHTML = '<b><u>Clark Con Field #3</u>:</b><select id="field_' + (fieldNum + 2) + '">';
			innerHTML += '<option value="capeRatio">SBCAPE/MUCAPE</option>';
                        innerHTML += '</select>';
			innerHTML += '<select id="operator' + (fieldNum + 2) + '"><option value="greaterThan">></option></select>';
			innerHTML += '<input id="threshold' + (fieldNum + 2) + '" type="text" size="4" value="" />';
                        innerHTML += '<span id="units' + (fieldNum + 2) + '"></span><br>';
                        document.getElementById("field" + (fieldNum + 2)).innerHTML = innerHTML;
			loadFieldVals((fieldNum + 2));
			return;
		}
	}
	innerHTML = '<b><u>Field #' + fieldNum + '</u>:</b><select id="field_' + fieldNum + '" onChange="loadFieldVals(' + fieldNum + '); loadFieldConfig(' + (fieldNum + 1) + ');">';
	innerHTML += '<option value="">Choose Field</option>';
	for(i=0;i<fieldVals.length;i++){
	        innerHTML += '<option value="' + fieldVals[i] + '">' + fieldNames[i] + '</option>';
	}
        innerHTML += '</select>';
        innerHTML += '<span id="operatorDiv' + fieldNum + '"><select id="operator' + fieldNum + '"><option value="greaterThan">></option><option value="lessThan"><</option></select></span>';
        innerHTML += '<span id="thresholdDiv' + fieldNum + '"><input id="threshold' + fieldNum + '" type="text" size="4" value="" /></span>';
	innerHTML += '<span id="units' + fieldNum + '"></span><br>';
	document.getElementById("field" + fieldNum).innerHTML = innerHTML;
}

function loadFieldConfig(fieldNum){
        fieldVals = ['uh1','uh2','uh3','hailcast','10mwind','clarkcon'];
        fieldNames = ['Updraft Helicity (2-5 km AGL)','Updraft Helicity (1-6 km AGL)','Updraft Helicity (0-3 km AGL)','Hailcast','10 m wind','Clark Con'];
        innerHTML = '<b><u>Field #1</u>:</b><select id="field_1" onChange="">';
	innerHTML += '<option value="uh1">Updraft Helicity (2-5 km AGL)</option>';
        innerHTML += '</select>';
	innerHTML += '<select id="operator1"><option value="greaterThan">></option></select>';
	innerHTML += '<select id="threshold1"><option value="50">50</option><option value="75" selected>75</option><option value="100">100</option></select> m<sup>2</sup> s<sup>-2</sup><br>';
	document.getElementById("field1").innerHTML = innerHTML;
	innerHTML = '<b><u>Field #2</u>:</b><select id="field_2" onChange="">';
        innerHTML += '<option value="hailcast">Hailcast</option>';
        innerHTML += '</select>';
        innerHTML += '<select id="operator2"><option value="greaterThan">></option></select>';
        innerHTML += '<select id="threshold2"><option value="1" selected>1</option><option value="2">2</option><option value="3">3</option></select> in.<br>';
	document.getElementById("field2").innerHTML = innerHTML;
	innerHTML = '<b><u>Field #3</u>:</b><select id="field_3" onChange="">';
        innerHTML += '<option value="10mwind">10 m Wind Speed</option>';
        innerHTML += '</select>';
        innerHTML += '<select id="operator3"><option value="greaterThan">></option></select>';
        innerHTML += '<select id="threshold3"><option value="35">35</option><option value="45" selected>45</option></select> kts<br>';
        document.getElementById("field3").innerHTML = innerHTML;
}

function loadFieldVals(fieldNum){
	if(document.getElementById("field_" + fieldNum).value == 'uh1' || document.getElementById("field_" + fieldNum).value == 'uh2' ||document.getElementById("field_" + fieldNum).value == 'uh3'){
		document.getElementById("operator" + fieldNum).value = 'greaterThan';
		document.getElementById("threshold" + fieldNum).value = 75;
		document.getElementById("units" + fieldNum).innerHTML = ' m<sup>2</sup> s<sup>-2</sup>';
	}
	else if(document.getElementById("field_" + fieldNum).value == 'hailcast'){
		document.getElementById("operator" + fieldNum).value = 'greaterThan';
                document.getElementById("threshold" + fieldNum).value = 1;
		document.getElementById("units" + fieldNum).innerHTML = ' in.';
	}
	else if(document.getElementById("field_" + fieldNum).value == '10mwind'){
                document.getElementById("operator" + fieldNum).value = 'greaterThan';
                document.getElementById("threshold" + fieldNum).value = 50;
		document.getElementById("units" + fieldNum).innerHTML = ' kts';
        }
	else if(document.getElementById("field_" + fieldNum).value == 'lcl'){
                document.getElementById("operator" + fieldNum).value = 'lessThan';
                document.getElementById("threshold" + fieldNum).value = 1500;
                document.getElementById("units" + fieldNum).innerHTML = ' m';
        }
	else if(document.getElementById("field_" + fieldNum).value == 'capeRatio'){
                document.getElementById("operator" + fieldNum).value = 'greaterThan';
                document.getElementById("threshold" + fieldNum).value =0.75;
                document.getElementById("units" + fieldNum).innerHTML = '';
        }
	else{
		document.getElementById("operator" + fieldNum).value = 'greaterThan';
                document.getElementById("threshold" + fieldNum).value = null;
                document.getElementById("units" + fieldNum).innerHTML = '';
	}
}

function loadMembers(){
	ensemble = document.getElementById("ensemble").value;
	innerHTML = '';
	if(ensemble == 'caps'){
		innerHTML += '<input type="button" value="All" onClick="changeCheckboxes(\'members\');"/>';
		innerHTML += '<input type="button" value="Core" onClick="changeCheckboxes(\'core\');"/>';
		innerHTML += '<input type="button" value="MP" onClick="changeCheckboxes(\'mp\');"/>';
		innerHTML += '<input type="button" value="PBL" onClick="changeCheckboxes(\'pbl\');"/>';
		innerHTML += '<input type="button" value="None" onClick="changeCheckboxes(\'none\');"/><br>';
		for(i=0;i<capsEnsemble['members'].length;i++){
			innerHTML += '<input type="checkbox" name="members" value="' + capsEnsemble['members'][i] + '" checked />' + capsEnsemble['names'][i] + '&nbsp;&nbsp;&nbsp;&nbsp;';
			if(i%2 != 0 && i >= 1){
				innerHTML += '<br>';
			}
		}
	}
	else if(ensemble == 'nsslwrf14'){
		//innerHTML += '<input type="button" value="All" onClick="changeCheckboxes(\'members\');"/>';
                //innerHTML += '<input type="button" value="None" onClick="changeCheckboxes(\'none\');"/><br>';
		innerHTML += '<table cellpadding="2" cellspacing="0"><tr>';
                for(i=0;i<nsslwrfEnsemble14['members'].length;i++){
			if(nsslwrfEnsemble14['members'][i] == 'max'){
				continue;
			}
                        innerHTML += '<td><input type="checkbox" name="members" value="' + nsslwrfEnsemble14['members'][i] + '" checked />' + nsslwrfEnsemble14['names'][i] + '</td>';
                        if(i%2 != 0 && i >= 1){
                                innerHTML += '</tr><tr>';
                        }
                }
		innerHTML += '</tr></td></table>';
	}
	else if(ensemble == 'nsslwrf15'){
                //innerHTML += '<input type="button" value="All" onClick="changeCheckboxes(\'members\');"/>';
                //innerHTML += '<input type="button" value="None" onClick="changeCheckboxes(\'none\');"/><br>';
                innerHTML += '<table cellpadding="2" cellspacing="0"><tr>';
                for(i=0;i<nsslwrfEnsemble15['members'].length;i++){
                        if(nsslwrfEnsemble15['members'][i] == 'max'){
                                continue;
                        }
                        innerHTML += '<td><input type="checkbox" name="members" value="' + nsslwrfEnsemble15['members'][i] + '" checked />' + nsslwrfEnsemble15['names'][i] + '</td>';
                        if(i%2 != 0 && i >= 1){
                                innerHTML += '</tr><tr>';
                        }
                }
                innerHTML += '</tr></td></table>';
        }
	document.getElementById("membersConfig").innerHTML = innerHTML;
	document.getElementById("fhoursConfig").innerHTML = loadPeriods();

	tNow = new Date(parseInt(timeCanvasVal.getAttr('time')) * 1000);
       	sel1 = document.getElementById('periodVal');
       	idx1 = -99;
       	for(i=0;i<sel1.options.length;i++){
               	hNow = sel1.options[i].value.split('_')[1];
               	hSlide = tNow.getUTCHours();
               	if(hSlide < 18){
                       	hSlide = hSlide + 24;
               	}
               	if(hSlide == hNow){
                       	idx1 = i;
                       	break;
               	}
       	}
       	if(idx1 != -99){
               	sel1.selectedIndex = idx1;
       	}
}

function changeCheckboxes(button){
        for(j=0;j<document.getElementsByName("members").length;j++){
		if(button == 'none'){
			document.getElementsByName("members")[j].checked = false;
		}
                else if(capsEnsemble[button].indexOf(document.getElementsByName("members")[j].value) != -1){
                        document.getElementsByName("members")[j].checked = true;
                }
                else{
                        document.getElementsByName("members")[j].checked = false;
                }
        }
}

function getAutoProbs(model){
	var period = document.getElementById("periodVal").value;
        var hazType = document.getElementById("hazardType").value;
        var issueType = document.getElementById("issueType").value;
	var now = timeCanvasNow.getAttr('time');
	var tNow = new Date(now * 1000);
	var d = String(tNow.getUTCFullYear()) + String(pad(tNow.getUTCMonth() + 1)) + String(pad(tNow.getUTCDate()));
	var link = "getSPCprobs.php?model=" + model + '&period=' + period + '&hazType=' + hazType + '&desk=' + desk + '&user=' + user + '&issueType=' + issueType + '&d=' + d;
	var dataRequest = new XMLHttpRequest();
        dataRequest.open('GET', link, false);
        dataRequest.send();
	var jsonParser = new OpenLayers.Format.GeoJSON();
	var jsonData = jsonParser.read(dataRequest.responseText);
	if(modifyFeature2.feature){
                modifyFeature2.unselectFeature(modifyFeature2.feature);
        }
	background_area.removeAllFeatures();
	deletePendingRecords();
	for(var i=1;i<=40;i++){
		document.getElementById('contours' + i).innerHTML = '';
        }
	var feats = [];
	for(var i=0;i<jsonData.length;i++){
		jsonData[i].geometry.transform(proj,proj2);
		contourNumber = jsonData[i].attributes.probID;
                fstart = jsonData[i].attributes.fStart;
                fend = jsonData[i].attributes.fEnd;
                timeCanvasVal.setAttr('time',jsonData[i].attributes.startTime);
                loadContours(jsonData[i].attributes.probID,jsonData[i].attributes.prob);
                contourSel = document.getElementById('contourVal' + jsonData[i].attributes.probID);
                for(var j=0;j<contourSel.options.length;j++){
                	if(contourSel.options[j].value == jsonData[i].attributes.prob){
                        	contourSel.selectedIndex = j;
				break;
			}
		}
                loadContourColor(jsonData[i].attributes.probID);
                insertNCPRecord(jsonData[i].clone(),'Pending');
		feats.push(jsonData[i].clone());
	}
	moveSliderTime();
        loadContours(contourNumber + 1);
	background_area.addFeatures(feats);
	backgroundCheck = false;
        selectGrid();
	changeTime();
}

function genProbs(){
	mField = document.getElementById("field_1").value;
	if(mField == ''){
		alert('No Field Chosen, try again!');
		return;
	}
	ensemble = document.getElementById("ensemble").value;
	members = [];
	for(j=0;j<document.getElementsByName("members").length;j++){
		if(document.getElementsByName("members")[j].checked){
			members.push(document.getElementsByName("members")[j].value);
		}
	}
	if(members.length <= 1){
		alert('Not enough members checked to compute probabilities.  Try again.');
		return;
	}
	period = document.getElementById("periodVal").value;
	hazType = document.getElementById("hazardType").value;
	issueType = document.getElementById("issueType").value;
	selOpt = period;
	hazOpt = hazType;
	//fstart = document.getElementById("fstart").value;
	//fend = document.getElementById("fend").value;
	pDay = period.split('_')[0];
	fstart = period.split('_')[1];
	fend = period.split('_')[2];
	if(mField == 'clarkcon'){
		inFields = document.getElementById("field_2").value + ',' + document.getElementById("field_3").value + ',' + document.getElementById("field_4").value;
		thresholds = document.getElementById("threshold2").value + ',' + document.getElementById("threshold3").value + ',' + document.getElementById("threshold4").value;
		operators = document.getElementById("operator2").value + ',' + document.getElementById("operator3").value + ',' + document.getElementById("operator4").value;
		selOpt2 = 'tornado';
	}
	else{
		inFields = [];
		thresholds = [];
		operators = [];
		selOpt2 = 'tornado';
		//for(i=1;i<=6;i++){
		for(i=1;i<=3;i++){
			if(document.getElementById("field" + i).innerHTML.length > 0 && document.getElementById('field_' + i).value != ''){
				inFields.push(document.getElementById("field_" + i).value);
				thresholds.push(document.getElementById("threshold" + i).value);
				operators.push(document.getElementById("operator" + i).value);
			}
		}
	}
	//operator = document.getElementById("operator").value;
	//threshold = document.getElementById("threshold").value;
	roi = document.getElementById("roi").value;
	sigma = document.getElementById("sigma").value;
	//levels = document.getElementById("levels").value;
	if(hazType == 'tornado' || hazType == 'all'){
		levels = '2,5,10,15,30,45,60';
	}
	else{
		levels = '5,15,30,45,60';
	}
	//alert(ensemble + ',' + fstart + ',' + fend + ',' + roi + ',' + sigma);
	link = 'requestProbs.php?user=' + user + '&ensemble=' + ensemble + '&members=' + members + '&fstart=' + fstart + '&fend=' + fend;
	link += '&fields=' + inFields + '&thresholds=' + thresholds + '&operators=' + operators + '&roi=' + roi + '&sigma=' + sigma + "&levels=" + levels;
	link += '&issueType=' + issueType + '&hazType=' + hazType;
	//alert(link);
        var dataRequest = new XMLHttpRequest();
        dataRequest.open('GET', link, false);
        dataRequest.send();
	//alert(dataRequest.responseText);
	backgroundCheck = true;
	document.getElementById("backgroundConfig").innerHTML = 'Generating Probabilities... stand by...';
}

function activateBackground(){
	// check if features are available
	if(background_area.features.length == 0){
		if(background_area_null.features.length > 0){
			timeCanvasVal.setAttr('time', background_area_null.features[0].attributes.startTime);
	               	moveSliderTime();
			changeTime();
			
			// confirm issuance
	                msg = 'Issue Regional ' + document.getElementById("hazardType").options[document.getElementById("hazardType").selectedIndex].text + ' Probabilities ';
	                msg += 'for ' + document.getElementById("periodVal").options[document.getElementById("periodVal").selectedIndex].text + '?';
	                var proceed = confirm(msg);
	                if(!proceed){
	                        return;
	                }
		}
		else{
			// confirm issuance
                        msg = 'Issue NULL Regional ' + document.getElementById("hazardType").options[document.getElementById("hazardType").selectedIndex].text + ' Probabilities ';
                        msg += 'for ' + document.getElementById("periodVal").options[document.getElementById("periodVal").selectedIndex].text + '?';
                        var proceed = confirm(msg);
                        if(!proceed){
				console.log('exited');
                                return;
                        }
			else{
				// insert null record ?????
				nullFeat = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(0,0));
				background_area.addFeatures([nullFeat]);
				backgroundDrawn('nullFeat');
			}
		}
	}
	else{
		// confirm issuance
		msg = 'Issue Regional ' + document.getElementById("hazardType").options[document.getElementById("hazardType").selectedIndex].text + ' Probabilities ';
		msg += 'for ' + document.getElementById("periodVal").options[document.getElementById("periodVal").selectedIndex].text + '?';
		var proceed = confirm(msg);
	        if(!proceed){
	               	return;
	        }
	}

	// unset feature if selected
	if(modifyFeature2.feature){
                modifyFeature2.unselectFeature(modifyFeature2.feature);
        }

	// convert polygons to linestrings (if necessary)
	poly2Line();

	// read discussion text
	var txt = document.getElementById('discussion');
        if(txt.value != 'Recognized text will be copied here (or type manually).' && txt.value != 'Type discussion here.' && txt.value != ''){
                txt = txt.value;
		//txt = txt.replace(',','');
		//txt = txt.replace('|','');
        }
        else{
                txt = 'none';
        }

	// clean up active probs
	var probList = [];
	for(var i=0;i<activeProbs.features.length;i++){
		//alert(activeProbs.features[i].attributes.ncpRecord + ' | ' + background_area.features[0].attributes.ncpRecord + ' | ' + activeProbs.features[i].attributes.startTime + ' | ' + background_area.features[0].attributes.startTime + ' | ' + activeProbs.features[i].attributes.endTime + ' | ' + background_area.features[0].attributes.endTime);
		if(activeProbs.features[i].attributes.ncpRecord == background_area.features[0].attributes.ncpRecord && activeProbs.features[i].attributes.startTime == background_area.features[0].attributes.startTime && activeProbs.features[i].attributes.endTime == background_area.features[0].attributes.endTime){
			probList.push(activeProbs.features[i]);
		}
	}
	console.log(probList);
	console.log(background_area.features.length);
	activeProbs.removeFeatures(probList);

	// iterate through features and send to server
	deletePendingRecords();
	var geoJsonParser = new OpenLayers.Format.GeoJSON();
	var jsonParser = new OpenLayers.Format.JSON();
	for(var i=0;i<background_area.features.length;i++){
		background_area.features[i].attributes.discussion = txt;
                featureAttrs = JSON.stringify(background_area.features[i].attributes);
                verts = background_area.features[i].geometry.getVertices();
		if(desk == 'SPC' || document.getElementById("hazardType").value == 'coverage'){
	                var linearRing = new OpenLayers.Geometry.LinearRing(verts);
	                var poly = new OpenLayers.Geometry.Polygon([linearRing]);
	                var newFeature = new OpenLayers.Feature.Vector(poly,jsonParser.read(featureAttrs));
			newFeature.geometry.transform(proj2,proj);
		}
		else{
			var lineString = new OpenLayers.Geometry.LineString(verts);
			var newFeature = new OpenLayers.Feature.Vector(lineString,jsonParser.read(featureAttrs));
			newFeature.geometry.transform(proj2,proj);
		}

		geoJson = geoJsonParser.write(newFeature);
		if(i == 0){
			link = 'writeEFP_Probs.php?first=1&geojson=' + geoJson;
			insertNCPRecord(newFeature.clone(),'Issued');
			if(background_area.features[i].attributes.issueType == 'afternoon'){
				for(var k3=0;k3<threatStore.data.items.length;k3++){
					if(threatStore.data.items[k3].get('fname').split('_')[0] == 'morning'){
						showNCPProbs(k3, false);
						threatStore.data.items[k3].set('show',false);
					}
				}
			}
		}
		else if(i == (background_area.features.length - 1)){
			link = 'writeEFP_Probs.php?last=1&geojson=' + geoJson;
		}
		else{
			link = 'writeEFP_Probs.php?geojson=' + geoJson;
		}
	       	var dataRequest = new XMLHttpRequest();
	       	dataRequest.open('GET', link, false);
	       	dataRequest.send();

		// transfer features to active layer
		newFeature.geometry.transform(proj,proj2);
	       	activeProbs.addFeatures([newFeature.clone()]);
	}

	// reset
	unloadBackground();
}

function reassignPeriod(){
	period = document.getElementById("periodVal").value;
       	pDay = period.split('_')[0];
       	fstart = period.split('_')[1];
       	fend = period.split('_')[2];
	tnow = new Date();
       	modelInitTime = parseInt((Date.UTC(tnow.getUTCFullYear(),tnow.getUTCMonth(),tnow.getUTCDate(),0,0,0)) / 1000);
       	startTime = modelInitTime + (fstart * 3600);
       	endTime = modelInitTime + (fend * 3600);
	for(var i=0;i<background_area.features.length;i++){
		background_area.features[i].attributes.period = period;
               	background_area.features[i].attributes.startTime = startTime;
               	background_area.features[i].attributes.endTime = endTime;
		background_area.features[i].attributes.fStart = fstart;
		background_area.features[i].attributes.fEnd = fend;
		if(i == 0){
			deletePendingRecords();
                       	insertNCPRecord(background_area.features[i].clone(),'Pending');
		}
       	}
	//loadHazards();
	loadMCSOptions();
}

function reassignHazType(){
	if(background_area.features.length > 0){
		return;
	}
	background_area.removeAllFeatures();
	for(i=1;i<=40;i++){
		document.getElementById('contours' + i).innerHTML = '';
	}
	//for(i=0;i<background_area.features.length;i++){
		//background_area.features[i].attributes.hazType = document.getElementById("hazardType").value;
		//if(i == 0){
                //       	deletePendingRecords();
                //       	insertNCPRecord(background_area.features[i].clone(),'Pending');
               	//}
		
	//}
	loadEditMode();
	loadContours(1);
	if(site == 'pecan'){
		loadPeriods();
	}
}

function reassignIssueType(){
	if(background_area.features.length == 0){
                return;
        }
        for(i=0;i<background_area.features.length;i++){
                background_area.features[i].attributes.issueType = document.getElementById("issueType").value;
		if(i == 0){
                       	deletePendingRecords();
                       	insertNCPRecord(background_area.features[i].clone(),'Pending');
               	}
        }
}

function highlightContour(cNum){
	if(modifyFeature2.feature){
                modifyFeature2.unselectFeature(modifyFeature2.feature);
       	}
	for(i=0;i<background_area.features.length;i++){
		if(background_area.features[i].attributes.probID == cNum){
			modifyFeature2.selectFeature(background_area.features[i]);
			break;
		}
	}
}

function changeEditMode(){
	var feat = false;
	if(modifyFeature2.feature){
		var cNum = modifyFeature2.feature.attributes.probID;
		modifyFeature2.unselectFeature(modifyFeature2.feature);
		feat = true;
	}
	var mode = document.getElementById('contourEditMode').value;
	if(mode == 'drag'){
		modifyFeature2.mode = OpenLayers.Control.ModifyFeature.DRAG;
	}
	else if(mode == 'rotate'){
		modifyFeature2.mode = OpenLayers.Control.ModifyFeature.ROTATE;
	}
	else if(mode == 'resize'){
               	modifyFeature2.mode = OpenLayers.Control.ModifyFeature.RESIZE;
       	}
	else if(mode == 'reshape'){
               	modifyFeature2.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
       	}
	if(desk == 'SPC'){
		if(modifyFeature2.mode != 1){
			line2Poly();
		}
		else{
			poly2Line();
		}
	}
	if(feat){
		for(var i=0;i<background_area.features.length;i++){
	                if(background_area.features[i].attributes.probID == cNum){
	                       	modifyFeature2.selectFeature(background_area.features[i]);
	                       	break;
	                }
	        }
	}
}

function line2Poly(){
	var feats = [];
	var geojson_format = new OpenLayers.Format.JSON();
	for(var i=0;i<background_area.features.length;i++){
		if(String(background_area.features[i].geometry.id).split('_')[2] != 'LineString'){
			feats.push(background_area.features[i].clone());
			continue;
		}
		var featureAttrs = JSON.stringify(background_area.features[i].attributes);
		var verts = background_area.features[i].geometry.getVertices();
		var newFeat = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon(new OpenLayers.Geometry.LinearRing(verts)),geojson_format.read(featureAttrs));
		feats.push(newFeat);
	}
	if(feats.length > 0){
		background_area.removeAllFeatures();
		background_area.addFeatures(feats);
	}
}

function poly2Line(){
	var feats = [];
       	var geojson_format = new OpenLayers.Format.JSON();
       	for(var i=0;i<background_area.features.length;i++){
                if(String(background_area.features[i].geometry.id).split('_')[2] != 'Polygon'){
			feats.push(background_area.features[i].clone());
                        continue;
                }
                var featureAttrs = JSON.stringify(background_area.features[i].attributes);
               	var verts = background_area.features[i].geometry.getVertices();
		if(verts[0] != verts[verts.length - 1]){
			verts.push(verts[0]);
		}
                var newFeat = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(verts),geojson_format.read(featureAttrs));
               	feats.push(newFeat);
       	}
	if(feats.length > 0){
	        background_area.removeAllFeatures();
	       	background_area.addFeatures(feats);
	}
}

function startExtrap(){
	if(imgNameLast == null){
		alert('No observations to track!');
		return;
	}
	else if(document.getElementById('modelOpt').value != 'obs'){
               	alert('Must use observations!');
               	return;
       	}
	else if(trackPoints.features.length > 0){
		trackPoints.removeAllFeatures();
		document.getElementById("extrap").style.background = '#DDDDDD';
		return;
	}
	document.getElementById("extrap").src = "images/extrapButtonSelect.png";
       	document.getElementById("extrap").onclick = function(){stopExtrap();}
       	document.getElementById("extrap").onmouseout = function(){this.src = "images/extrapButtonSelect.png";}
       	document.getElementById("extrap").onmouseover = function(){this.src = "images/extrapButtonSelect.png";}
	pointControl.activate();
}

function stopExtrap(){
	document.getElementById("extrap").src = "images/extrapButton.png";
	document.getElementById("extrap").onclick = function(){startExtrap();}
       	document.getElementById("extrap").onmouseout = function(){this.src = "images/extrapButton.png";}
       	document.getElementById("extrap").onmouseover = function(){this.src = "images/extrapButtonHighlight.png";}
	trackPoints.removeAllFeatures();
	pointControl.deactivate();
}

function pointAdded(){
	var idx = trackPoints.features.length - 1;
	// azshear__obs_201412010200.png
	var t = imgNameLast.split('_')[3];
	var timeStamp = Date.UTC(t.slice(0,4),t.slice(4,6) - 1,t.slice(6,8),t.slice(8,10),t.slice(10,12)) / 1000;
	var sName = t.slice(8,12) + 'z';
	trackPoints.features[idx].attributes.time = timeStamp;
	trackPoints.features[idx].attributes.color = 'red';
	trackPoints.features[idx].attributes.sname = sName;
	if(trackPoints.features.length == 2){
		if(timeStamp == trackPoints.features[0].attributes.time){
			trackPoints.removeFeatures([trackPoints.features[1]]);
			alert('Change to a different time.');
			return;
		}
		var timeDiff = trackPoints.features[1].attributes.time - trackPoints.features[0].attributes.time;
		var xDiff = trackPoints.features[1].geometry.x - trackPoints.features[0].geometry.x;
		var yDiff = trackPoints.features[1].geometry.y - trackPoints.features[0].geometry.y;
		var dis = Math.sqrt(Math.pow(xDiff,2) + Math.pow(yDiff,2));
		var ms = dis / timeDiff;
		var dir = Math.round(Math.atan2(yDiff,xDiff) * 180 / Math.PI);
		for(var i=1;i<=3;i++){
			if(i == 1){
				var c = '#00FFFF';
			}
			else if(i == 2){
				var c = '#00FF00';
			}
			else{
				var c = 'yellow';
			}
			var ts = timeStamp + (i * 3600);
			var tNow = new Date(ts * 1000);
			var pDis = (i * 3600) * ms;
			if(timeDiff < 0){
				var x = trackPoints.features[0].geometry.x + (pDis * Math.cos(dir * Math.PI / 180));
                                var y = trackPoints.features[0].geometry.y + (pDis * Math.sin(dir * Math.PI / 180));
			}
			else{
				var x = trackPoints.features[1].geometry.x + (pDis * Math.cos(dir * Math.PI / 180));
				var y = trackPoints.features[1].geometry.y + (pDis * Math.sin(dir * Math.PI / 180));
			}
			var point = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(x,y));
			var sname = pad2(tNow.getUTCHours(),2) + pad2(tNow.getUTCMinutes(),2) + 'z';
			trackPoints.addFeatures([point]);
			trackPoints.features[trackPoints.features.length - 1].attributes.time = ts;
			trackPoints.features[trackPoints.features.length - 1].attributes.color = c;
			trackPoints.features[trackPoints.features.length - 1].attributes.sname = sname;
		}
		pointControl.deactivate();
	}
	trackPoints.redraw();
}

function goToModelTime(){
	var t = document.getElementById("initOpt").value;
	if(document.getElementById('modelOpt').value == 'wof'){
		var timeStamp = Date.UTC(t.slice(0,4),t.slice(4,6) - 1,t.slice(6,8),t.slice(8,10),t.slice(10,12)) / 1000;
	}
	else{
		var timeStamp = Date.UTC(t.slice(0,4),t.slice(4,6) - 1,t.slice(6,8),t.slice(8,10)) / 1000;
	}
	if(timeStamp == timeStampModelLast){
		return;
	}
	timeStampModelLast = timeStamp;
	var tDiff = timeCanvasEnd - timeStamp;
	if(timeCanvasEnd < timeStamp || tDiff > (86400 * 3) || document.getElementById('modelOpt').value == 'wof'){
		timeCanvasStart = timeStamp;
		timeCanvasEnd = timeStamp + (36 * 3600);
		timeCanvasVal.setAttr('time',timeStamp);
		moveSliderTime();
               	moveCurrentTime();
		drawTimeCanvas(timeCanvasStart,timeCanvasEnd);
		changeTime();
	}
}

function showNSSLProbs(sType){
	nsslDateLast = 0;
	nsslPeriod = sType;
	nsslOutlooks.setVisibility(true);
	loadEFPNSSL();
	//document.getElementsByName('nsslProbs').blur();
	try{
		document.getElementById('nsslRadio1').blur();
		document.getElementById('nsslRadio2').blur();
	}
	catch(err){

	}
}
