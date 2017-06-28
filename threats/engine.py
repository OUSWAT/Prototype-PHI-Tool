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

parser = OptionParser()
parser.add_option("-i", "--input_file", dest="input_file", type="string", help="input geoJSON file")
parser.add_option("-t", "--input_time", dest="input_time", type="string", help="input valid start time")
parser.add_option("-s", "--shapefile", dest="shapefile", action="store_true", help="output shapefiles")
parser.add_option("-k", "--kml", dest="kml", action="store_true", help="output kmls")
parser.add_option("-n", "--netcdf", dest="netcdf", action="store_true", help="output netcdf grid")
parser.add_option("-G", "--grib", dest="grib", action="store_true", help="output grib2 grid")
parser.add_option("-g", "--geojson", dest="geojson", action="store_true", help="output geoJSON grid")

(options, args) = parser.parse_args()

if options.input_file == None or options.input_time == None:
	parser.print_help()
	sys.exit(0)
if options.shapefile:
	import shapefile
if options.kml:
	import simplekml
if options.netcdf:
	import netCDF4

path = os.path.abspath(os.path.dirname(__file__))

def getColor(val):
	if val <= 20:
                r = 0
                g = 204
                b = 0
        elif val < 40:
                r = 255
                g = 255
                b = 0
        elif val < 60:
                r = 255
                g = 128
                b = 0
        elif val < 80:
                r = 255
                g = 0
                b = 0
        elif val <= 100:
                r = 255
                g = 0
                b = 255
        else:
                r = g = b = 0
        return 'rgb(' + str(r) + ',' + str(g) + ',' + str(b) + ')'

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
		if (i%5) == 0:
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
                probVal = ((i + (addSecs / 60.0)) * slp) + y_int
                slp = (nextSpeed - gjson.properties['data']['speeds'][i2]) / 5.0
                y_int = gjson.properties['data']['speeds'][i2] - ((i2 * 5.0) * slp)
                speedVal = ((i + (addSecs / 60.0)) * slp) + y_int
                slp = (nextSpd - gjson.properties['data']['spd'][i2]) / 5.0
                y_int = gjson.properties['data']['spd'][i2] - ((i2 * 5.0) * slp)
                spdUVal = ((i + (addSecs / 60.0)) * slp) + y_int
                slp = (nextDir - gjson.properties['data']['dir'][i2]) / 5.0
                y_int = gjson.properties['data']['dir'][i2] - ((i2 * 5.0) * slp)
                dirUVal = ((i + (addSecs / 60.0)) * slp) + y_int
		if nextDirs >= 270 and gjson.properties['data']['dirs'][i2] <= 90 or nextDirs >= 270 and gjson.properties['data']['dirs'][i2+1] <= 90:
	                angDiff = (gjson.properties['data']['dirs'][i2] - nextDirs)
	                if angDiff < 0:
	                        angDiff = (360 + angDiff) * -1.0
	                else:
	                        angDiff = 360 - angDiff
	                slp = angDiff / 5.0
	                y_int = gjson.properties['data']['dirs'][i2] - ((i2 * 5.0) * slp)
	                dirVal = ((i + (addSecs / 60.0)) * slp) + y_int
	                if dirVal >= 360:
	                        dirVal = dirVal - 360
	                elif dirVal < 0:
	                        dirVal = dirVal + 360
	        else:
	        	slp = (nextDirs - gjson.properties['data']['dirs'][i2]) / 5.0
	                y_int = gjson.properties['data']['dirs'][i2] - ((i2 * 5.0) * slp)
	                dirVal = ((i + (addSecs / 60.0)) * slp) + y_int

	if i == 0:
		threats_projected.append(so.transform(proj_latlon,threat))
		threats_original.append(so.transform(proj_latlon,threat_orig))
		dirValLast = dirVal
	else:
		dis = 60.0 * speedVal * 0.514444444
		xDis = dis * math.cos(math.radians(270.0 - dirVal))
		yDis = dis * math.sin(math.radians(270.0 - dirVal))
		xDis2 = 60.0 * spdUVal * 0.514444444
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
	now += delta
	i += 1

# create swaths
allSwaths = []
if options.shapefile:
	os.system('rm shp/*')
	shpSwath = shapefile.Writer(shapefile.POLYGON)
	shpThreat = shapefile.Writer(shapefile.POLYGON)
if options.kml:
	os.system('rm kml/*')
	kml = simplekml.Kml()
	kmlSwath = kml.newfolder(name='Swath')
	kmlThreat = kml.newfolder(name='Threat')
for i in range(gjson.properties['data']['duration'] + 1):
	# blend threat areas to create swaths
	union = so.cascaded_union(threats_projected[i:i + gjson.properties['data']['duration'] + 1])
	swath = np.array(union.exterior.coords)
	allSwaths.append(union)
	threat = np.array(threats_projected[i].exterior.coords)

	# generate shapefile
	if options.shapefile:
		shpSwath.poly(parts=[swath])
		shpThreat.poly(parts=[threat])
		if i == 0:
			shpSwath.field('TYPE','C',50)
			shpSwath.field('TIME','C',50)
			shpThreat.field('TYPE','C',50)
			shpThreat.field('TIME','C',50)
		shpSwath.record(TYPE='SWATH',TIME=str(times[i]) + ' UTC')
		shpThreat.record(TYPE='THREAT',TIME=str(times[i]) + ' UTC')

	# generate kml
	if options.kml:
		polySwath = kmlSwath.newpolygon(name='Threat Swath')
		polySwath.outerboundaryis = map(tuple,swath)
		polySwath.style.linestyle.color = simplekml.Color.red
		polySwath.style.linestyle.width = 3
		polySwath.style.polystyle.fill = 0
		polySwath.style.polystyle.outline = 1
		polySwath.timespan.begin = times[i].strftime('%Y-%m-%dT%H:%M:%SZ')
		polySwath.timespan.end = (times[i] + (delta2 * 59)).strftime('%Y-%m-%dT%H:%M:%SZ')
		polyThreat = kmlThreat.newpolygon(name='Threat')
	        polyThreat.outerboundaryis = map(tuple,threat)
		polyThreat.style.polystyle.color = '990000ff'
		polyThreat.style.polystyle.fill = 1
		polyThreat.style.polystyle.outline = 0
	        #polyThreat.timestamp.when = times[i].strftime('%Y-%m-%dT%H:%M:%SZ')
		polyThreat.timespan.begin = times[i].strftime('%Y-%m-%dT%H:%M:%SZ')
	        polyThreat.timespan.end = (times[i] + (delta2 * 59)).strftime('%Y-%m-%dT%H:%M:%SZ')

if options.kml:
	kml.save('kml/' + options.input_time + '_' + str(i).zfill(2) + '.kml')
if options.shapefile:
	shpSwath.save('shp/' + options.input_time + '_swath_' + str(i).zfill(2))
	prj = open('shp/' + options.input_time + '_swath_' + str(i).zfill(2) + '.prj', 'w')
	prj.write(epsg)
	prj.close()
	shpThreat.save('shp/' + options.input_time + '_threat_' + str(i).zfill(2))
	prj = open('shp/' + options.input_time + '_threat_' + str(i).zfill(2) + '.prj', 'w')
	prj.write(epsg)
	prj.close()

# create grids
if options.netcdf or options.grib or options.geojson:
	masterSwath = so.cascaded_union(allSwaths)
	factor = 3000 * 6200
	xMin1 = -127.
	xMax1 = xMin1 + (0.01 * 6200)
	yMax1 = 51.
	yMin1 = yMax1 - (0.01 * 3000)
	#xMin1 = math.floor((masterSwath.bounds[0] * 100.0)) / 100.0
	#xMax1 = math.ceil((masterSwath.bounds[2] * 100.0)) / 100.0
	#yMin1 = math.floor((masterSwath.bounds[1] * 100.0)) / 100.0
	#yMax1 = math.ceil((masterSwath.bounds[3] * 100.0)) / 100.0
	x = np.arange(xMin1,xMax1,0.01)
	y = np.arange(yMin1+0.01,yMax1+0.01,0.01)
	lons,lats = np.meshgrid(x,y)
	probability = np.zeros((len(y), len(x))) - 99900.
	starts = np.zeros((len(y), len(x))) - 99900.
	ends = np.zeros((len(y), len(x))) - 99900.
	pixels = np.arange(factor).reshape(lats.shape[0],lats.shape[1])
	#print xMin1, xMax1, yMin1, yMax1
	#print len(lons), len(lons[0]), len(lats), len(lats[0]), len(probability), len(probability[0])
	#sys.exit()

	for k in range(len(threats_projected)):
		xMin = math.floor((threats_projected[k].bounds[0] * 100.0)) / 100.0
		xMax = math.ceil((threats_projected[k].bounds[2] * 100.0)) / 100.0
		yMin = math.floor((threats_projected[k].bounds[1] * 100.0)) / 100.0
		yMax = math.ceil((threats_projected[k].bounds[3] * 100.0)) / 100.0
		x = np.arange(xMin,xMax+0.01,0.01)
		y = np.arange(yMin,yMax+0.01,0.01)
		x,y = np.meshgrid(x,y)
		center = so.transform(proj_google,threats_original[k].centroid)
		for i in range(len(x)-1):
		        for j in range(len(x[i])-1):
				xIndex = 2999 - int((51.0 - y[i][j]) * 100.0)
				yIndex = int((x[i][j] - (-1 * 127.0)) * 100.0)
				#print x[i][j], y[i][j], lons[xIndex][yIndex], lats[xIndex][yIndex], xIndex, yIndex
				#if probability[xIndex][yIndex] >= int(round(probs[k],0)):
				#	ends[xIndex][yIndex] = int(options.input_time) + (60 * (k+1))
				#	continue
				point = sg.Point([(x[i][j],y[i][j])])
				if point.within(threats_original[k]):
					if probs[k] > probability[xIndex][yIndex]:
						probability[xIndex][yIndex] = int(round(probs[k],0))
						#probArray[i][j] = probs[k]
					if starts[xIndex][yIndex] == -99900.0:
						startTime = int(gjson.properties['data']['valid_start']) + (60 * k) - (60 * gjson.properties['data']['duration'])
                                                if startTime < int(gjson.properties['data']['valid_start']):
                                                        startTime = int(gjson.properties['data']['valid_start'])
                                                starts[xIndex][yIndex] = startTime
                                        ends[xIndex][yIndex] = int(gjson.properties['data']['valid_start']) + (60 * (k+1))
				elif point.within(threats_projected[k]):
					point2 = so.transform(proj_google,point)
					point3 = sg.Point(point2.x + ((point2.x - center.x) * 10.0),point2.y + ((point2.y - center.y) * 10.0))
					line = sg.LineString([(center.x,center.y),(point3.x,point3.y)])
					pointInner = line.intersection(so.transform(proj_google,threats_original[k].boundary))
					pointOuter = line.intersection(so.transform(proj_google,threats_projected[k].boundary))
					disInner = pow((pow(point2.x - pointInner.x,2) + pow(point2.y - pointInner.y,2)),0.5)
					disOuter = pow((pow(point2.x - pointOuter.x,2) + pow(point2.y - pointOuter.y,2)),0.5)
					disNorm = disOuter / (disInner + disOuter)
					newProb = int(round((((probs[k] - bkgd) * pow(disNorm,2)) + bkgd),0))
					if newProb > probability[xIndex][yIndex]:
	                                        probability[xIndex][yIndex] = newProb
						#prbs[str(x[i][j])][str(y[i][j])] = probs[k]
						#probArray[i][j] = newProb
                                        if starts[xIndex][yIndex] == -99900.0:
						startTime = int(gjson.properties['data']['valid_start']) + (60 * k) - (60 * gjson.properties['data']['duration'])
						if startTime < int(gjson.properties['data']['valid_start']):
							startTime = int(gjson.properties['data']['valid_start'])
                                                starts[xIndex][yIndex] = startTime
                                        ends[xIndex][yIndex] = int(gjson.properties['data']['valid_start']) + (60 * (k+1))


	# generate 1D array of probs
	pixels_x = np.arange(6200)
	pixels_y = np.arange(2999,-1,-1)
	y, x = np.meshgrid(pixels_x, pixels_y)
	lonArray = x.reshape((factor))
        latArray = y.reshape((factor))
        probArray = probability.reshape((factor))
	starts = starts.reshape((factor))
	ends = ends.reshape((factor))
	lats_1d = lats.reshape((factor))
	lons_1d = lons.reshape((factor))
	mask = probArray > -99900.
	lonArray = lonArray[mask]
	latArray = latArray[mask]
	probArray = probArray[mask]
	starts = starts[mask]
	ends = ends[mask]
	lats_1d = lats_1d[mask]
	lons_1d = lons_1d[mask]
	pixelCount = np.zeros(len(probArray)) + 1

	# create netCDF
	if options.netcdf:
		nc = netCDF4.Dataset(path + '/Probability/' + timestamp + '.netcdf','w',format='NETCDF3_CLASSIC')
		nc.createDimension('Lat', len(lats))
		nc.createDimension('Lon', len(lats[0]))
		nc.createDimension('pixel', len(probArray))
		#nc.createDimension('Time',1)

		nc.TypeName = "Probability"
		nc.DataType = "SparseLatLonGrid"
		nc.Latitude = yMax1
		nc.Longitude = xMin1
		nc.Height = 0.
		nc.Time = int(options.input_time)
		nc.attributes = " ColorMap Unit"
		nc.__setattr__("Unit-unit","dimensionless")
		nc.__setattr__("Unit-value","%")
		nc.__setattr__("ColorMap-unit","dimensionless")
		nc.__setattr__("ColorMap-value","Probability")
		nc.LatGridSpacing = 0.01
		nc.LonGridSpacing = 0.01
		nc.MissingData = -99900.
		nc.RangeFolded = -99901.
		nc.ul_lat = yMax1
		nc.ul_lon = xMin1
		nc.lr_lat = yMin1
		nc.lr_lon = xMax1

		#probability = nc.createVariable('Probability', 'f4', ('lon','lat',))
                probability = nc.createVariable('Probability', 'i4', ('pixel',))
		#probability.BackgroundValue = -99900.
                probability.units = "%"
		#probability.NumValidRuns = len(probArray)
		#latitude = nc.createVariable('latitude', 'f4', ('lon','lat',))
		latitude = nc.createVariable('pixel_y', 'h4', ('pixel',))
		#latitude.units = "degrees"
		#longitude = nc.createVariable('longitude', 'f4', ('lon','lat',))
		longitude = nc.createVariable('pixel_x', 'h4', ('pixel',))
		#longitude.units = "degrees"
		pixel_count =  nc.createVariable('pixel_count', 'i4', ('pixel',))
		
		#latitude[:,:] = latArray
		#longitude[:,:] = lonArray
		#probability[:,:] = probArray
		latitude[:] = latArray
                longitude[:] = lonArray
		pixel_count[:] = pixelCount
                probability[:] = probArray

		nc.close()

	# create geoJSON (vectorized grid)
	if options.geojson:
		geoJSON = []
		inc = 0.005
		for i in range(len(probArray)):
			ll = ['%.3f' % round(lons_1d[i] - inc,3),'%.3f' % round(lats_1d[i] - inc,3)]
			ul = ['%.3f' % round(lons_1d[i] - inc,3),'%.3f' % round(lats_1d[i] + inc,3)]
			ur = ['%.3f' % round(lons_1d[i] + inc,3),'%.3f' % round(lats_1d[i] + inc,3)]
			lr = ['%.3f' % round(lons_1d[i] + inc,3),'%.3f' % round(lats_1d[i] - inc,3)]
			coords = str([[ll,ul,ur,lr]]).replace("\'","")
			json = {}
			json["type"] = "Feature"
			json["properties"] = {}
                        json["properties"]["prob"] = int(probArray[i])
                        json["properties"]["color"] = getColor(probArray[i])
			json["properties"]["start"] = int(starts[i])
			json["properties"]["end"] = int(ends[i])
			json["properties"]["issue"] = gjson.properties['data']['issue']
			json["geometry"] = {}
                        json["geometry"]["coordinates"] = coords
			json["geometry"]["type"] = "Polygon"
			json = str(json).replace("'",'"')
			json2 = json.split('"')
			js = []
			for j in range(len(json2)):
				if  j == 8:
					js.append(json2[8] + json2[9] + json2[10])
				elif j != 9 and j != 10:
					js.append(json2[j])
			
			geoJSON.append('"'.join(js))

		fh = open(path + '/json/' + options.input_time + '.json','w')
		fh.write('\n'.join(geoJSON))
		fh.close()
