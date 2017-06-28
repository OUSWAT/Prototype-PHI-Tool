import time
stime = time.time()
import w2py2
import shapely.geometry as sg
import shapely.ops as so
from functools import partial
import pyproj
import numpy as np
from matplotlib.nxutils import points_inside_poly
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.basemap import Basemap
from mpl_toolkits.axes_grid1 import ImageGrid
#import matplotlib.path
import sys, os, datetime
import geojson
from optparse import OptionParser
import netCDF4
from socket import gethostname
import shapefile
import shutil

parser = OptionParser()
parser.add_option("-t", "--input_time", dest="input_time", type="string", help="input valid start time")
parser.add_option("-a", "--archive", dest="archive", action="store_true", help="archive case")
parser.add_option("-H", "--threat_type", dest="threat_type", type="string", help="threat type")
(options, args) = parser.parse_args()

'''
if options.threat_type == None:
	sys.exit()

if options.input_time == None:
	options.input_time = int(datetime.datetime.now().strftime("%s")[:-1] + '0')
'''

if options.archive:
	caseDate = inputTime.strftime('%Y%m%d') # need to fix this (23/00z issue)
	threatDirManual = '/var/www/html/RadarQC/phi_new/threats/threats'
	inDirManual = '/var/www/html/RadarQC/phi_new/threats/binary_' + options.threat_type + '/'
	if options.threat_type == 'tornado':
                threatDirAuto = '/localdata/radarqc/PHI/archive/' + caseDate + '/azShearObjects/objects/'
                inDirAuto = '/localdata/radarqc/PHI/archive/' + caseDate + '/azShearObjects/binary/'
        else:
                threatDirAuto = '/localdata/radarqc/PHI/archive/' + caseDate + '/probSevereObjects/objects/'
                inDirAuto = '/localdata/radarqc/PHI/archive/' + caseDate + '/probSevereObjects/binary/'
	outDir = '/var/www/html/RadarQC/phi_new/threats/PHIGrid_' + options.threat_type.capitalize() + '/00.00'
	imgDir = '/localdata/radarqc/PHI/archive/PHI'
	qpidMachine = "localhost"
else:
	threatDirManual = '/var/www/html/RadarQC/phi_new/realtime/ewp/threats'
	inDirManual = '/var/www/html/RadarQC/phi_new/realtime/ewp/binary_' + options.threat_type + '/'
	if options.threat_type == 'tornado':
		threatDirAuto = '/localdata/radarqc/PHI/floater/azShearObjects/objects/'
		inDirAuto = '/localdata/radarqc/PHI/floater/azShearObjects/binary/'
		statusFile = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusAzShear.txt'
                statusFileLast = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusAzShearLast.txt'
	else:
		threatDirAuto = '/localdata/radarqc/PHI/floater/probSevereObjects/objects/'
	        inDirAuto = '/localdata/radarqc/PHI/floater/probSevereObjects/binary/'
		statusFile = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusProbSevere.txt'
		statusFileLast = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusProbSevereLast.txt'
	outDir = '/var/www/html/RadarQC/phi_new/realtime/ewp/PHIGrid_' + options.threat_type.capitalize() + '/00.00'
	imgDir = '/localdata/radarqc/PHI/floater/PHI'
	qpidMachine = "cpsbn1-hwt"

# get current status file data
fh = open(statusFile,'r')
status = fh.readlines()[0].rstrip().split(',')
fh.close()

# wait for all binaries to arrive (automation)
waitingCount = 0
waiting = True
while waiting:
	binCount = 0
	binFiles = []
	binIDs = []
	files = sorted(os.listdir(inDirAuto),reverse=True)
	for f in files:
		if f.split('_')[0] == status[2]:
			binIDs.append(f.split('_')[1].split('.')[0])
			binFiles.append(f)
			binCount += 1
	if binCount == int(status[0]):
		print str(binCount) + ' of ' + status[0] + ' binaries have arrived!'
		waiting = False
	else:
		waitingCount += 1
		if waitingCount > 20:
			print 'Could not get all files, processing grid anyways...'
			waiting = False
		print str(binCount) + ' of ' + status[0] + ' binaries have arrive, waiting for the others...'
		time.sleep(3)

options.input_time = int(status[1])
proj_latlon = partial(pyproj.transform,pyproj.Proj(init='epsg:3857'),pyproj.Proj(init='epsg:4326'))
delta = datetime.timedelta(minutes=1)
inputTime = datetime.datetime.utcfromtimestamp(options.input_time)
timestamp = inputTime.strftime('%Y%m%d-%H%M%S')

machName = gethostname().split('.')[0]
gribPath = '/localdata/radarqc/PHI/%s'%machName
netcdfPath = '/localdata/radarqc/PHI/%s/netcdf'%machName
threatsManual = sorted(os.listdir(threatDirManual))
threatsAuto = sorted(os.listdir(threatDirAuto))
#probVals = np.zeros((600,800)) - 99900.
probVals = np.zeros((600,800))

# generate list of manually-generated objects
# use this list for checking/overriding manual objects
humanObjects = {}
modifiedObjects = {}
for threat in threatsManual:

	continue

	# ignore threats not of the input type specified
	if options.threat_type not in threat:
                continue

	# read latest object submitted by human
	fh = open(threatDirManual + '/' + threat,'r')
	latestObject = fh.readlines()[-1].rstrip()
	fh.close()

	# convert object to geojson and add to dictionary by object ID
	humanObject = geojson.loads(latestObject,object_hook=geojson.GeoJSON.to_instance)
	if humanObject.properties['data']['automated'] == 0:
		humanObjects[str(humanObject.properties['data']['id']).zfill(6)] = humanObject # object was created purely from human
	elif humanObject.properties['data']['automated'] == 2:
		modifiedObjects[str(humanObject.properties['data']['id']).zfill(6)] = humanObject # object was automated but modified by human

# iterate through auto-generated PHI objects
for threat in threatsAuto:

	# filter based on binary files IDs
	# probSevere_20150413-000835_173938.json
	threatID = threat.split('_')[2].split('.')[0]
	if threatID not in binIDs:
		continue

	# define some variables
	idx = -99
	idx2 = -99
	gjsons = []
	gjsons2 = []

	# read lines from geojson file
	fh = open(threatDirAuto + '/' + threat,'r')
	lines = fh.readlines()
	fh.close()

	# append geojson objects to list
	for line in reversed(lines):
		gjsons.append(geojson.loads(line.rstrip(),object_hook=geojson.GeoJSON.to_instance))
	
	# ignore objects from the "future"
	for i in range(len(gjsons)):
		if options.input_time == int(gjsons[i].properties['data']['valid_start']):
			idx = binIDs.index(threatID)
			autoObject = gjsons[i]
			break

	# if no valid objects, move on
	if idx < 0:
		continue

	# probably need to write logic here to figure out whether human intervened with automated objects
	# or created their own (potentially resulting in duplicated objects)
	# delete keys from manual object dictionary as they are overriding automation, then add any extras
	# not from automation (i.e., completely manually generated) at the end
	if modifiedObjects.has_key(str(autoObject.properties['data']['id']).zfill(6)):
		humanObject = modifiedObjects[str(autoObject.properties['data']['id']).zfill(6)]
		timeDiff = options.input_time - int(autoObject.properties['data']['valid_start'])
		end = int(autoObject.properties['data']['valid_end'])
		if timeDiff < 0 or end < options.input_time:
			gjson = autoObject
			inDir = inDirAuto
		else:
			gjson = humanObject
			modifiedObjects.pop(str(modifiedObjects.properties['data']['RowName']), None)
			inDir = inDirManual
	else:
		gjson = autoObject
		inDir = inDirAuto

	# read attributes from object
	start = datetime.datetime.utcfromtimestamp(int(gjson.properties['data']['valid_start']))
        issue = datetime.datetime.utcfromtimestamp(int(gjson.properties['data']['issue']))
        timestamp2 = issue.strftime('%Y%m%d-%H%M%S')
        end = int(gjson.properties['data']['valid_end'])
        endTime = options.input_time + (60 * gjson.properties['data']['duration'])

	# ignore objects from the future or objects no longer valid
        timeDiff = options.input_time - int(gjson.properties['data']['valid_start'])
        if timeDiff < 0 or end < options.input_time:
                continue

	'''
	# calculate number of seconds that have elapsed between object start time and current time
	# use this value for translating swath (used for clipping grid)
	notUnder = True
	while notUnder:
		if timeDiff < 60:
			addSecs = timeDiff
			notUnder = False
		else:
			timeDiff = timeDiff - 60
	'''

	# try to read automated or manual numpy binary
	# automated binary should always be there
	# manual binary is no guarentee since object 
	# is available immediately, while binary generation
	# lags behind
	#binary = inDir + timestamp2 + '_' + str(gjson.properties['data']['id']).zfill(6) + '.npz'
	binary = inDir + binFiles[idx]
	try:
		nz = np.load(binary)
	        x = nz['arr_0']
	        y = nz['arr_1']
	        vals = nz['arr_2']
	except:
		print 'Could not locate binary, continuing...'
		continue

	'''
	# get translated swath based on current time
	swath = w2py2.translateObject(gjson,options.input_time,endTime,addSecs)

	# mask grid based on translated swath
	x2, y2 = x.flatten(), y.flatten()
	pnts = np.vstack((x2,y2)).T
	mask = points_inside_poly(pnts, swath.exterior.coords)
	#poly = matplotlib.path.Path(swath.exterior.coords)
	#mask = poly.contains_points(pnts)
	nx, ny = len(x[0]), len(x)
	mask = mask.reshape((ny,nx))
	vals[np.invert(mask)] = np.ma.masked
	'''

	# merge to common grid, retaining max value at grid point
	probVals = np.maximum(probVals, vals)	

#print probVals

# convert to sparse grid netcdf
factor = 600 * 800
pixels_x = np.arange(800)
pixels_y = np.arange(600)
y3, x3 = np.meshgrid(pixels_x, pixels_y)
lonArray = x3.reshape((factor))
latArray = y3.reshape((factor))
probArray = probVals.reshape((factor))
mask = probArray > 0.
lonArray = lonArray[mask]
latArray = latArray[mask]
probArray = probArray[mask]
pixelCount = np.zeros(len(probArray)) + 1

if options.archive:
	floaterFile = '/localdata/radarqc/PHI/archive/' + caseDate + '/PHI_Floater_Info.txt'
else:
	floaterFile = '/var/www/html/RadarQC/phi_new/realtime/ewp/PHI_Floater_Info.txt'
fh = open(floaterFile,'r')
c = fh.readline().split()
fh.close()
floaterLat = float(c[2])
floaterLon = float(c[3])

'''
ncPath = outDir + '/' + timestamp + '.netcdf'
nc = netCDF4.Dataset(ncPath,'w',format='NETCDF3_CLASSIC')
nc.createDimension('Lat', 600)
nc.createDimension('Lon', 800)
nc.createDimension('pixel', len(probArray))

nc.TypeName = "PHIGrid_" + options.threat_type.capitalize()
nc.DataType = "SparseLatLonGrid"
nc.Latitude = floaterLat
nc.Longitude = floaterLon
nc.Height = 0.
nc.Time = options.input_time
nc.FractionalTime = 0.
nc.ThreatType =	options.threat_type
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

probability = nc.createVariable('PHIGrid_' + options.threat_type.capitalize(), 'i4', ('pixel',))
probability.units = "%"
latitude = nc.createVariable('pixel_y', 'h4', ('pixel',))
longitude = nc.createVariable('pixel_x', 'h4', ('pixel',))
pixel_count =  nc.createVariable('pixel_count', 'i4', ('pixel',))

latitude[:] = latArray
longitude[:] = lonArray
pixel_count[:] = pixelCount
probability[:] = probArray

nc.close()


# move to staging and convert to grib2
inPath = os.path.dirname(os.path.realpath(__file__))
stagingDir = os.path.join(inPath,"GridStaging_" + options.threat_type.capitalize())
outPath = os.path.join(stagingDir,"PHIGrid_" + options.threat_type.capitalize(),"00.00")
syscmd = "rsync -aP %s %s"%(ncPath,outPath)
os.system(syscmd)
syscmd = "makeIndex.pl %s code_index.xml"%(stagingDir)
print syscmd
os.system(syscmd)
ulLat = float(floaterLat) ; ulLon = float(floaterLon) ; lrLat = ulLat - (600.0*0.01) ; lrLon = ulLon + (800.0 * 0.01)
syscmd = "w2grib2conv -i %s/code_index.xml -o %s/grib -I %s -t \"%s %s\" -b \"%s %s\" -s \"%s %s\" -X %s -P EWP_"%(stagingDir,gribPath,'PHIGrid_' + options.threat_type.capitalize(),ulLat,ulLon,lrLat,lrLon,0.01,0.01,os.path.join(inPath,'grib2conv.xml'))
os.system(syscmd)

syscmd = 'mv ' + ncPath + ' ' + netcdfPath + '/' + options.threat_type
os.system(syscmd)
syscmd = 'rm ' + outPath + '/*.netcdf'
os.system(syscmd) 

gribFile = "EWP_PHIGrid_%s_00.00_%s.grib2"%(options.threat_type.capitalize(),timestamp)

# send to EDEX
import subprocess as sub
syscmd = "sudo su - awips -c '/awips2/python/bin/python /realtime-a2/nssl_dir/PHI/qpidNotify.py %s %s'"%(os.path.join(gribPath,'grib',gribFile),qpidMachine)
#syscmd = "sudo su - awips -c 'cp -v %s /realtime-a2/manual'"%(os.path.join(gribPath,'grib',gribFile))
p = sub.Popen(syscmd,shell=True,stdout=sub.PIPE,stderr=sub.PIPE)
out,err = p.communicate()
'''

# convert to image for PHI tool and EDD

# set up custom colormap
levels = []
r = []
g = []
b = []
r2 = [0,255,255,255,255,0]
g2 = [255,255,128,0,0,0]
b2 = [0,0,0,0,255,0]
j = 0
for i in range(1,101):
	if i == 20 or i == 40 or i == 60 or i == 80 or i == 100:
                j += 1
	levels.append(i)
	r.append(r2[j])
	g.append(g2[j])
	b.append(b2[j])

a = []
for i in range(0,len(levels)):
	if i == 0:
		a.append(0.0)
	else:
	        a.append(1.0)

red = []
green = []
blue = []
alpha = []
for i in range(0,len(levels)):
        if i == 0:
                i2 = i
        else:
                i2 = i - 1
        red.append((float(i)/(len(levels) - 1),float(r[i2])/255.0,float(r[i])/255.0))
        green.append((float(i)/(len(levels) - 1),float(g[i2])/255.0,float(g[i])/255.0))
        blue.append((float(i)/(len(levels) - 1),float(b[i2])/255.0,float(b[i])/255.0))
        alpha.append((float(i)/(len(levels) - 1),a[i2],a[i]))

custom_cmap = {'red':tuple(red),'green':tuple(green),'blue':tuple(blue),'alpha':tuple(alpha)}
plt.register_cmap(name='custom_cmap', data=custom_cmap)
cmap = plt.get_cmap('custom_cmap')
cmap.set_under('k',alpha=0.)

# plot data
urLat = float(floaterLat)
llLon = float(floaterLon)
llLat = float(floaterLat) - (600.0 * 0.01)
urLon = float(floaterLon) + (800.0 * 0.01)
print llLon, llLat, urLon, urLat
lons = np.arange((llLon * 100), (urLon * 100)) / 100.
lats = np.arange((llLat * 100)+1, (urLat * 100)+1) / 100.
m = Basemap(llcrnrlat=llLat, llcrnrlon=llLon, urcrnrlat=urLat, urcrnrlon=urLon, resolution='c', epsg=3857)
x, y = m(*np.meshgrid(lons, lats))

x = (x[1:,1:] + x[:-1,:-1])/2.0 # manipulate to give pcolormesh grid corners (not grid centers)
y = (y[1:,1:] + y[:-1,:-1])/2.0
probVals = probVals[1:,1:]

fig = plt.figure()
igrid = ImageGrid(fig, 111, nrows_ncols=(1,1))
ax = igrid[0]; cax = igrid.cbar_axes[0]
ax.axis('off')
clim = [1,100]
cs = m.pcolormesh(x, y, probVals, ax=ax, clim=clim, vmin=1, vmax=100, cmap=cmap)
# Floater_20150327-192626_MergedReflectivityQCComposite_00.50.png
imgFile = imgDir + '/Floater_' + timestamp + '_PHI-' + options.threat_type + '-' + machName + '_00.00.png'
plt.savefig(imgFile, dpi=400, bbox_inches='tight', pad_inches=0, transparent=True)

# end script
etime = time.time()
print 'Time elapsed: ' + str(etime - stime) + ' seconds'

