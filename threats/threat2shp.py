#!/usr/bin/python

import os, sys, geojson
from optparse import OptionParser
import datetime, math
import numpy as np
from functools import partial
import pyproj
import shapely.geometry as sg
import shapely.affinity as sa
import shapely.ops as so
import calendar
import shapefile

parser = OptionParser()
parser.add_option("-i", "--input_file", dest="input_file", type="string", help="input geoJSON file")
parser.add_option("-t", "--input_time", dest="input_time", type="string", help="input issue time")

(options, args) = parser.parse_args()

if options.input_file == None or options.input_time == None:
	parser.print_help()
	sys.exit(0)

path = os.path.abspath(os.path.dirname(__file__))

proj_google = partial(pyproj.transform,pyproj.Proj(init='epsg:4326'),pyproj.Proj(init='epsg:3857'))
proj_latlon = partial(pyproj.transform,pyproj.Proj(init='epsg:3857'),pyproj.Proj(init='epsg:4326'))
epsg = 'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]]'
bkgd = 35.0

# read in geojson feature
found = False
fh = open(options.input_file,'r')
i = 0
for line in fh:
	i+=1;
	feature = line.rstrip()
	if feature.find(options.input_time) != -1:
		#print 'Input Feature Found!'
		#print i
		found = True
		break
fh.close()
if not found:
	parser.print_help()
        sys.exit(0)

gjson = geojson.loads(feature,object_hook=geojson.GeoJSON.to_instance)
threat = sg.asShape(gjson.geometry)
threat = so.transform(proj_google,threat)
gjson2 = geojson.loads(feature,object_hook=geojson.GeoJSON.to_instance)
threat_orig = sg.asShape(gjson2.geometry)
threat_orig = so.transform(proj_google,threat_orig)

# create all projected threats (with and without motion uncertainty
delta = datetime.timedelta(minutes=1)
delta2 = datetime.timedelta(seconds=1)
start = datetime.datetime.utcfromtimestamp(int(gjson.properties['data']['valid_start']))
timestamp = start.strftime('%Y%m%d-%H%M%S')
end = start + (2 * delta * gjson.properties['data']['duration'])
now = start
i = 0
k = 0
i2 = -1
addSecs = 0
threats_projected = []
threats_original = []
times = []
probs = []
while now <= end:
	#if now.second != 0:
	#	now += delta2 * (60 - now.second)
	#	diff = now - start
	#print now
	diff = now - start

	# pull and interpolate object arrays
	if i <= gjson.properties['data']['duration']:
		if (i%5) == 0 and (k%60) == 0:
			if i != gjson.properties['data']['duration']:
				i2 += 1
				nextProb = gjson.properties['data']['probs'][0][i2+1]
				nextSpeed = gjson.properties['data']['speeds'][i2+1]
				nextDir = gjson.properties['data']['dir'][i2+1]
				nextSpd = gjson.properties['data']['spd'][i2+1]
				nextDirs = gjson.properties['data']['dirs'][i2+1]
			else:
				nextProb = bkgd
			
		slp = (nextProb - gjson.properties['data']['probs'][0][i2]) / 5.0
                y_int = gjson.properties['data']['probs'][0][i2] - ((i2 * 5.0) * slp)
                probVal = (((k / 60.0) + (addSecs / 60.0)) * slp) + y_int
                slp = (nextSpeed - gjson.properties['data']['speeds'][i2]) / 5.0
                y_int = gjson.properties['data']['speeds'][i2] - ((i2 * 5.0) * slp)
                speedVal = (((k / 60.0) + (addSecs / 60.0)) * slp) + y_int
                slp = (nextSpd - gjson.properties['data']['spd'][i2]) / 5.0
                y_int = gjson.properties['data']['spd'][i2] - ((i2 * 5.0) * slp)
                spdUVal = (((k / 60.0) + (addSecs / 60.0)) * slp) + y_int
                slp = (nextDir - gjson.properties['data']['dir'][i2]) / 5.0
                y_int = gjson.properties['data']['dir'][i2] - ((i2 * 5.0) * slp)
                dirUVal = (((k / 60.0) + (addSecs / 60.0)) * slp) + y_int
		if nextDirs >= 270 and gjson.properties['data']['dirs'][i2] <= 90 or nextDirs >= 270 and gjson.properties['data']['dirs'][i2+1] <= 90:
	                angDiff = (gjson.properties['data']['dirs'][i2] - nextDirs)
	                if angDiff < 0:
	                        angDiff = (360 + angDiff) * -1.0
	                else:
	                        angDiff = 360 - angDiff
	                slp = angDiff / 5.0
	                y_int = gjson.properties['data']['dirs'][i2] - ((i2 * 5.0) * slp)
	                dirVal = (((k / 60.0) + (addSecs / 60.0)) * slp) + y_int
	                if dirVal >= 360:
	                        dirVal = dirVal - 360
	                elif dirVal < 0:
	                        dirVal = dirVal + 360
	        else:
	        	slp = (nextDirs - gjson.properties['data']['dirs'][i2]) / 5.0
	                y_int = gjson.properties['data']['dirs'][i2] - ((i2 * 5.0) * slp)
	                dirVal = (((k / 60.0) + (addSecs / 60.0)) * slp) + y_int

	if k == 0:
		threats_projected.append(so.transform(proj_latlon,threat))
		threats_original.append(so.transform(proj_latlon,threat_orig))
		dirValLast = dirVal
	else:
		dis = speedVal * 0.514444444
		xDis = dis * math.cos(math.radians(270.0 - dirVal))
		yDis = dis * math.sin(math.radians(270.0 - dirVal))
		xDis2 = spdUVal * 0.514444444
		yDis2 = dis * math.tan(math.radians(dirUVal))
		threat = sa.translate(threat,xDis,yDis)
		threat_orig = sa.translate(threat_orig,xDis,yDis)
		rot = dirVal - dirValLast
		threat = sa.rotate(threat,rot)
		threat_orig = sa.rotate(threat_orig,rot)
		threat = sa.rotate(threat,(-1 * (270 - dirValLast)))
		coords = threat.exterior.coords
		center = threat.centroid
		newCoords = []
		for c in coords:
			dir = math.atan2(c[1] - center.y,c[0] - center.x)
			x = math.cos(dir) * xDis2
			y = math.sin(dir) * yDis2
			p = sg.Point(c)
			c2 = sa.translate(p,x,y)
			newCoords.append((c2.x,c2.y))
		threat = sg.Polygon(newCoords)
		threat = sa.rotate(threat,(270 - dirValLast))
		threats_projected.append(so.transform(proj_latlon,threat))
                threats_original.append(so.transform(proj_latlon,threat_orig))
		dirValLast = dirVal
	times.append(now)
	probs.append(probVal)
	now += delta2
	k += 1
	if (k%60) == 0:
		print i
		i += 1

# write shapefile
print 'writing shapefile'
shpThreat = shapefile.Writer(shapefile.POLYGON)
shpThreat2 = shapefile.Writer(shapefile.POLYGON)
for i in range(len(threats_original)):
	threat = np.array(threats_original[i].exterior.coords)
        threat2 = np.array(threats_projected[i].exterior.coords)

        # generate shapefile
        shpThreat.poly(parts=[threat])
	shpThreat2.poly(parts=[threat2])
        if i == 0:
                shpThreat.field('TYPE','C',50)
                shpThreat.field('TIME','C',50)
		shpThreat.field('PROB','C',50)
		shpThreat2.field('TYPE','C',50)
                shpThreat2.field('TIME','C',50)
		shpThreat2.field('PROB','C',50)
        shpThreat.record(TYPE='THREAT',TIME=str(calendar.timegm(times[i].timetuple())),PROB=str(probs[i]))
	shpThreat2.record(TYPE='THREAT',TIME=str(calendar.timegm(times[i].timetuple())),PROB=str(probs[i]))

shpThreat.save('shp/' + options.input_time + '_threatOrig')
prj = open('shp/' + options.input_time + '_threatOrig.prj', 'w')
prj.write(epsg)
prj.close()

shpThreat2.save('shp/' + options.input_time + '_threatExpand')
prj = open('shp/' + options.input_time + '_threatExpand.prj', 'w')
prj.write(epsg)
prj.close()

