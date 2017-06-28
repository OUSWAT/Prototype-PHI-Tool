<?php

$case = isset($_GET["case"]) ? $_GET["case"] : "";
$site = isset($_GET["site"]) ? $_GET["site"] : "";
$user = isset($_GET["user"]) ? $_GET["user"] : "";

?>
<html>
<head>
<title>Prototype PHI Tool</title>
<link rel="stylesheet" type="text/css" href="phi.css">
<link type="text/css" rel="StyleSheet" href="css/ScaleBar.css" />
<link type="text/css" rel="StyleSheet" href="slider/css/swing/swing.css" />
<link type="text/css" rel="StyleSheet" href="js/jqplot/jquery.jqplot.min.css" />
<link type="text/css" rel="StyleSheet" href="ext_style.css" />
<script>
<?php
if(!empty($case) && !empty($site) && !empty($user)){
       	echo "var acase = '".$case."';\nvar site = '".$site."';\nvar user = '".$user."';\n";
}
else{
        echo "var acase;\nvar site;\nvar user;\n";
}
?>
</script>
<script type="text/javascript" src="js/OpenLayers.js"></script>
<script type="text/javascript" src="js/kinetic.js"></script>
<script type="text/javascript" src="js/LoadingPanel.js"></script>
<script type="text/javascript" src="js/ScaleBar.js"></script>
<script type="text/javascript" src="js/jqplot/jquery.min.js"></script>
<script type="text/javascript" src="js/jqplot/jquery.jqplot.min.js"></script>
<script type="text/javascript" src="js/jqplot/plugins/jqplot.dateAxisRenderer.min.js"></script>
<script type="text/javascript" src="js/jqplot/plugins/jqplot.barRenderer.min.js"></script>
<script type="text/javascript" src="js/jqplot/plugins/jqplot.categoryAxisRenderer.min.js"></script>
<script type="text/javascript" src="js/jqplot/plugins/jqplot.cursor.min.js"></script>
<script type="text/javascript" src="js/jqplot//plugins/jqplot.highlighter.min.js"></script>
<script type="text/javascript" src="js/jqplot/plugins/jqplot.dragable.min.js"></script>
<script type="text/javascript" src="js/jqplot/plugins/jqplot.pointLabels.min.js"></script>
<script type="text/javascript" src="js/jqplot/plugins/jqplot.canvasOverlay.js"></script>
<script type="text/javascript" src="js/jqplot/plugins/jqplot.canvasTextRenderer.min.js"></script>
<script type="text/javascript" src="js/jqplot/plugins/jqplot.canvasAxisLabelRenderer.min.js"></script>
<script type="text/javascript" src="js/jqplot/plugins/jqplot.canvasAxisTickRenderer.min.js"></script>
<script type="text/javascript" src="js/jqplot/plugins/jqplot.differentColorMarkerLineRenderer.js"></script>
<script type="text/javascript" src="js/jqplot/plugins/jqplot.dateAxisRenderer.min.js"></script>
<script type="text/javascript" src="js/jsts/lib/javascript.util.js"></script>
<script type="text/javascript" src="js/jsts/lib/jsts.js"></script>
<script type="text/javascript" src="js/ScaleBar.js"></script>
<script type="text/javascript" src="js/attache.array.min.js"></script>
<script type="text/javascript" src="js/CSPL.js"></script>
<script type="text/javascript" src="js/ext/examples/shared/include-ext.js?theme=classic"></script>
<script type="text/javascript" src="js/ext/examples/shared/examples.js"></script>
<script type="text/javascript" src="slider/js/range.js"></script>
<script type="text/javascript" src="slider/js/timer.js"></script>
<script type="text/javascript" src="slider/js/slider.js"></script>

<script type="text/javascript" src="vars.js"></script>
<script type="text/javascript" src="analysis_chart.js"></script>
<script type="text/javascript" src="radarLocs.js"></script>
<script type="text/javascript" src="lookupTables.js"></script>
<script type="text/javascript" src="wof.js"></script>
<script type="text/javascript" src="Map.js"></script>
<script type="text/javascript" src="config.js"></script>
<script type="text/javascript" src="prob_chart.js"></script>
<script type="text/javascript" src="speed_chart.js"></script>
<script type="text/javascript" src="dir_chart.js"></script>
<script type="text/javascript" src="speed_delta_chart.js"></script>
<script type="text/javascript" src="dir_delta_chart.js"></script>
<script type="text/javascript" src="grid_chart.js"></script>
<script type="text/javascript" src="point_chart.js"></script>
<script type="text/javascript" src="myrorss_chart.js"></script>
<script type="text/javascript" src="object_chart.js"></script>
<script type="text/javascript" src="kmeans_chart.js"></script>
<script type="text/javascript" src="wof_chart.js"></script>
<script type="text/javascript" src="ext.js"></script>
<script type="text/javascript" src="threatObjects.js"></script>
<script type="text/javascript" src="threatsTab.js"></script>
<script type="text/javascript" src="backgroundObjects.js"></script>
<script type="text/javascript" src="backgroundTab.js"></script>
<script type="text/javascript" src="tracksTab.js"></script>
<script type="text/javascript" src="popups.js"></script>
<script type="text/javascript" src="time.js"></script>
<script type="text/javascript" src="radar.js"></script>
<script type="text/javascript" src="nws.js"></script>
<script type="text/javascript" src="gis.js"></script>
<script type="text/javascript" src="myrorss.js"></script>
<script type="text/javascript" src="pecan.js"></script>
<script type="text/javascript" src="kmeans.js"></script>
<script type="text/javascript" src="controls.js"></script>
<script type="text/javascript" src="special.js"></script>
</head>
<body>
</body>
</html>
