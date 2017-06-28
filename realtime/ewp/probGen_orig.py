import time
stime = time.time()
import matplotlib.pyplot as plt
from mpl_toolkits.basemap import Basemap
from mpl_toolkits.axes_grid1 import ImageGrid
import w2py2
import shapefile
import shapely.geometry as sg
import shapely.ops as so
from functools import partial
import pyproj
import numpy as np
from matplotlib.nxutils import points_inside_poly
import sys, os, datetime
import geojson
from optparse import OptionParser
import netCDF4

parser = OptionParser()
parser.add_option("-t", "--input_time", dest="input_time", type="string", help="input valid start time")
parser.add_option("-a", "--archive", dest="archive", type="string", help="archive case")
(options, args) = parser.parse_args()

if options.input_time == None:
        parser.print_help()
        sys.exit()

options.input_time = int(options.input_time)
proj_latlon = partial(pyproj.transform,pyproj.Proj(init='epsg:3857'),pyproj.Proj(init='epsg:4326'))
delta = datetime.timedelta(minutes=1)
inputTime = datetime.datetime.utcfromtimestamp(options.input_time)
timestamp = inputTime.strftime('%Y%m%d-%H%M%S')

if options.archive != None:
	threatDir = '/var/www/html/RadarQC/phi_new/threats/' + options.archive
	inDir = '/var/www/html/RadarQC/phi_new/threats/'
	outDir = '/var/www/html/RadarQC/phi_new/threats/PHIGrid/00.00'
else:
	threatDir = 'threats'
	inDir = ''
	outDir = 'PHIGrid/00.00'
threats = os.listdir(threatDir)
count = 0
valSet = False

for threat in threats:

	count += 1
	fh = open(threatDir + '/' + threat,'r')
	idx = -99
	gjsons = []
	for line in fh:
		gjsons.append(geojson.loads(line.rstrip(),object_hook=geojson.GeoJSON.to_instance))
	fh.close()

	for i in range(len(gjsons)):
		if options.input_time > int(gjsons[i].properties['data']['valid_start']):
			idx = i
	if idx < 0:
		continue
	else:
		gjson = gjsons[idx]

	start = datetime.datetime.utcfromtimestamp(int(gjson.properties['data']['valid_start']))
	issue = datetime.datetime.utcfromtimestamp(int(gjson.properties['data']['issue']))
	timestamp2 = issue.strftime('%Y%m%d-%H%M%S')
	end = int(gjson.properties['data']['valid_end'])
	timeDiff = options.input_time - int(gjson.properties['data']['valid_start'])
	#print timeDiff, end, options.input_time
	if timeDiff < 0 or end < options.input_time:
		continue
	notUnder = True
	while notUnder:
		if timeDiff < 60:
			addSecs = timeDiff
			notUnder = False
		else:
			timeDiff = timeDiff - 60

	nc = inDir + 'PHI/00.00/' + timestamp2 + '.netcdf'
	x,y,vals = w2py2.readSparseGrid(nc,'PHI')
	nx, ny = len(x[0]), len(x)

	endTime = options.input_time + (60 * gjson.properties['data']['duration'])
	threats_projected, threats_original, probs, times = w2py2.translateObject(gjson,options.input_time,endTime,addSecs)

	swath = so.cascaded_union(threats_projected)	

	x2, y2 = x.flatten(), y.flatten()
	pnts = np.vstack((x2,y2)).T

	mask = points_inside_poly(pnts, swath.exterior.coords)
	mask = mask.reshape((ny,nx))
	vals[np.invert(mask)] = np.ma.masked

	if count == 1:
		probVals = vals
		valSet = True
	else:
		probVals = np.maximum(probVals, vals)	

#probVals[probVals < 1] = -99900.

if not valSet:
	print 'found nothing, exiting'
	sys.exit()

factor = 600 * 800
pixels_x = np.arange(800)
#pixels_y = np.arange(599,-1,-1)
pixels_y = np.arange(600)
y3, x3 = np.meshgrid(pixels_x, pixels_y)
lonArray = x3.reshape((factor))
latArray = y3.reshape((factor))
probArray = probVals.reshape((factor))
#lats_1d = lats.reshape((factor))
#lons_1d = lons.reshape((factor))
mask = probArray > 0.
lonArray = lonArray[mask]
latArray = latArray[mask]
probArray = probArray[mask]
#lats_1d = lats_1d[mask]
#lons_1d = lons_1d[mask]
pixelCount = np.zeros(len(probArray)) + 1

if options.archive == None:
	fh = open('PHI_Floater_Info.txt','r')
	c = fh.readline().split()
	fh.close()
	floaterLat = float(c[2])
	floaterLon = float(c[3])

else:
	import subprocess
        cmd = 'php ../../getSiteCoords2.php site=' + gjson.properties['data']['site']
        print cmd
        proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE)
        out = proc.stdout.read()
        c = out.split(',')
        floaterLat = float(c[1]) + 3.0
        floaterLon = float(c[0]) - 4.0
ncPath = outDir + '/' + timestamp + '.netcdf'
nc = netCDF4.Dataset(ncPath,'w',format='NETCDF3_CLASSIC')
nc.createDimension('Lat', len(x))
nc.createDimension('Lon', len(x[0]))
nc.createDimension('pixel', len(probArray))
#nc.createDimension('Time',1)

nc.TypeName = "PHIGrid"
nc.DataType = "SparseLatLonGrid"
nc.Latitude = floaterLat
nc.Longitude = floaterLon
nc.Height = 0.
#nc.TimeValid = options.input_time
nc.Time = options.input_time
nc.FractionalTime = 0.
nc.attributes = " ColorMap Unit"
nc.__setattr__("Unit-unit","dimensionless")
nc.__setattr__("Unit-value","%")
nc.__setattr__("ColorMap-unit","dimensionless")
nc.__setattr__("ColorMap-value","Probability")
nc.LatGridSpacing = 0.01
nc.LonGridSpacing = 0.01
nc.MissingData = -99900.
nc.BackgroundValue = -99900.
nc.RangeFolded = -99901.
nc.ul_lat = float(floaterLat)
nc.ul_lon = float(floaterLon)
nc.lr_lat = float(floaterLat) - (600.0 * 0.01)
nc.lr_lon = float(floaterLon) + (800.0 * 0.01)

probability = nc.createVariable('PHIGrid', 'i4', ('pixel',))
probability.units = "%"
latitude = nc.createVariable('pixel_y', 'h4', ('pixel',))
longitude = nc.createVariable('pixel_x', 'h4', ('pixel',))
pixel_count =  nc.createVariable('pixel_count', 'i4', ('pixel',))

latitude[:] = latArray
longitude[:] = lonArray
pixel_count[:] = pixelCount
probability[:] = probArray

nc.close()


#move to staging and convert to grib2
inPath = os.path.dirname(os.path.realpath(__file__))
stagingDir = os.path.join(inPath,"GridStaging")
outPath = os.path.join(stagingDir,"PHIGrid","00.00")
syscmd = "rsync -aP %s %s"%(ncPath,outPath)
os.system(syscmd)
syscmd = "makeIndex.pl %s code_index.xml"%(stagingDir)
print syscmd
os.system(syscmd)
ulLat = float(floaterLat) ; ulLon = float(floaterLon) ; lrLat = ulLat - (600.0*0.01) ; lrLon = ulLon + (800.0 * 0.01)
syscmd = "w2grib2conv -i %s/code_index.xml -o %s/PHIgrib2 -I %s -t \"%s %s\" -b \"%s %s\" -s \"%s %s\" -X %s -P EWP_"%(stagingDir,inPath,'PHIGrid',ulLat,ulLon,lrLat,lrLon,0.01,0.01,os.path.join(inPath,'grib2conv.xml'))
os.system(syscmd)



etime = time.time()
print 'Time elapsed: ' + str(etime - stime) + ' seconds'

