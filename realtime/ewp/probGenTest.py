import time
stime = time.time()
import w2py2
import shapely.geometry as sg
import shapely.ops as so
from functools import partial
import pyproj
import numpy as np
#from matplotlib.nxutils import points_inside_poly
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.basemap import Basemap
from mpl_toolkits.axes_grid1 import ImageGrid
import matplotlib.path
import sys, os, datetime
import geojson
from optparse import OptionParser
import netCDF4
from socket import gethostname
import shapefile
import shutil
import subprocess
from shapely.geometry import Polygon

parser = OptionParser()
parser.add_option("-t", "--input_time", dest="input_time", type="string", help="input valid start time")
parser.add_option("-a", "--archive", dest="archive", action="store_true", help="archive case")
parser.add_option("-H", "--threat_type", dest="threat_type", type="string", help="threat type")
(options, args) = parser.parse_args()

epoch = datetime.datetime.utcfromtimestamp(0)
tNow = datetime.datetime.utcnow()
options.input_time = ((tNow - epoch).days * 86400) + (tNow - epoch).seconds

time.sleep(5)

def getColor(val):
        if val < 20:
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
        return str(r) + ', ' + str(g) + ', ' + str(b) + ', 100'

def contours2legacy(contours, threat, issue, vStart, vEnd, oID, disc, sev, source, aLevel, auto, prob):
	print 'in here!!!!!!'
        g = []
	if auto == 3:
		auto = 1
	for i in range(len(contours.levels)):
                level = contours.levels[i]
                paths = contours.collections[i].get_paths()
                for contour in paths:
                        try:
                            	p = contour.to_polygons()
                                poly = Polygon(contour.vertices)
                                poly = poly.simplify(0.005)
                                simpleCoords = poly.exterior.coords
                                if threat == 'tornado':
					color = "rgb(255,0,0)"
					wType = "Tornado"
				elif threat == 'severe':
					color = "rgb(255,255,0)"
					wType = "Severe Thunderstorm"
				else:
					color = "rgb(255,128,0)"
					wType = "Lightning"
                               	gjson = {"type":"Feature","properties":{"data":{"color":color,"probThresh":level,"warningType":wType,"issue":issue,"validStart":vStart,"validEnd":vEnd,"ID":str(oID).zfill(7),"discussion":str(disc),"severity":str(sev),"source":str(source),'auto':auto,'alertLevel':str(aLevel),'prob':prob}},"geometry":{"type":"Polygon"}}
                                gjson["geometry"]["coordinates"] = [np.array(simpleCoords).tolist()]
                                g.append(gjson)
                                print 'yipppie!!'
                        except Exception as e:
				print str(e)
                               	print 'ruh roh...'
                                continue
        return g

def contours2placefile(contours, hFile):
        s = ''
	l = ''
	h = ''
	for i in range(len(contours.levels)):
                level = contours.levels[i]
                rgb = getColor(level)
                paths = contours.collections[i].get_paths()
                for contour in paths:
                        try:
                            	p = contour.to_polygons()
                                poly = Polygon(contour.vertices)
                                poly = poly.simplify(0.005)
                                coords = []
                                s += 'Polygon:\n'
                                l += 'Color: ' + rgb.split(',')[0] + rgb.split(',')[1] + rgb.split(',')[2] + '\n'
                                l += 'Line: 3, 0, "' + str(level) + '%"\n'
                                for j in range(len(poly.exterior.coords)):
                                        if j == 0:
                                                s += '    ' + str(poly.exterior.coords[j][1]) + ', ' + str(poly.exterior.coords[j][0]) + ', ' + rgb + '\n'
                                        else:
                                             	s += '    ' + str(poly.exterior.coords[j][1]) + ', ' + str(poly.exterior.coords[j][0]) + '\n'
                                        l += '    ' + str(poly.exterior.coords[j][1]) + ', ' + str(poly.exterior.coords[j][0]) + '\n'
                                s += 'End:\n\n'
                                l += 'End:\n\n'
                        except:
                               	continue
        return s + l + h

def processCheck(pScript,thresh):
        bFlag = False
        syscmd = "ps -ef | grep %s | grep -v grep | wc -l"%pScript
        p = subprocess.Popen(syscmd,shell=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
        out,err = p.communicate() ; del err
        proNum = int(out.replace('\n',''))
        print "There are %s processes of %s running..."%(proNum,pScript)
        if proNum > thresh:
                bFlag = True
        return bFlag

if options.archive:
	arch = 1
	caseDate = inputTime.strftime('%Y%m%d') # need to fix this (23/00z issue)
	threatDirManual = '/var/www/html/RadarQC/phi_new/threats/threats'
	inDirManual = '/var/www/html/RadarQC/phi_new/threats/binary_' + options.threat_type + '/'
	if options.threat_type == 'tornado':
                threatDirAuto = '/localdata/radarqc/PHI/archive/' + caseDate + '/azShearObjects/objects/'
                inDirAuto = '/localdata/radarqc/PHI/archive/' + caseDate + '/azShearObjects/binary/'
        elif options.threat_type == 'lightning':
                threatDirAuto = '/localdata/radarqc/PHI/archive/' + caseDate + '/lightningObjects/objects/'
                inDirAuto = '/localdata/radarqc/PHI/archive/' + caseDate + '/lightningObjects/binary/'
	else:
                threatDirAuto = '/localdata/radarqc/PHI/archive/' + caseDate + '/probSevereObjects/objects/'
                inDirAuto = '/localdata/radarqc/PHI/archive/' + caseDate + '/probSevereObjects/binary/'
	outDir = '/var/www/html/RadarQC/phi_new/threats/PHIGrid_' + options.threat_type.capitalize() + '/00.00'
	imgDir = '/localdata/radarqc/PHI/archive/PHI'
	qpidMachine = "localhost"
	floaterFile = '/localdata/radarqc/PHI/archive/' + caseDate + '/PHI_Floater_Info.txt'
else:
	arch = 0
	threatDirManual = '/var/www/html/RadarQC/phi_new/realtime/ewp/threats'
	inDirManual = '/var/www/html/RadarQC/phi_new/realtime/ewp/binary_' + options.threat_type + '/'
	if options.threat_type == 'tornado':
		threatDirAuto = '/localdata/radarqc/PHI/floater/azShearObjects/objects/'
		inDirAuto = '/localdata/radarqc/PHI/floater/azShearObjects/binary/'
		statusFile = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusAzShear.txt'
                statusFileLast = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusAzShearLast.txt'
	elif options.threat_type == 'lightning':
                threatDirAuto = '/localdata/radarqc/PHI/floater/lightningObjects/objects/'
                inDirAuto = '/localdata/radarqc/PHI/floater/lightningObjects/binary/'
                statusFile = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusLightning.txt'
                statusFileLast = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusLightningLast.txt'
		fh = open(statusFile,'r')
		status = fh.readlines()[0].rstrip().split(',')
		fh.close()
		options.input_time = int(status[1])
	else:
		threatDirAuto = '/localdata/radarqc/PHI/floater/probSevereObjects/objects/'
	        inDirAuto = '/localdata/radarqc/PHI/floater/probSevereObjects/binary/'
		statusFile = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusProbSevere.txt'
		statusFileLast = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusProbSevereLast.txt'
		fh = open(statusFile,'r')
                status = fh.readlines()[0].rstrip().split(',')
                fh.close()
                options.input_time = int(status[1])
	outDir = '/var/www/html/RadarQC/phi_new/realtime/ewp/PHIGrid_' + options.threat_type.capitalize() + '/00.00'
	imgDir = '/localdata/radarqc/PHI/floater/PHI'
	qpidMachine = "cpsbn1-hwt"
	floaterFile = '/var/www/html/RadarQC/phi_new/realtime/ewp/PHI_Floater_Info.txt'

# define variables
placefile = 'Title: ' + str(options.threat_type).capitalize() + ' PHI\nRefreshSeconds: 10\nFont: 1, 15, 1, "Courier New"\n\n'
pFile = '/var/www/html/RadarQC/phi_new/realtime/ewp/' + str(options.threat_type).capitalize() + '_PHI.txt'
proj_latlon = partial(pyproj.transform,pyproj.Proj(init='epsg:3857'),pyproj.Proj(init='epsg:4326'))
delta = datetime.timedelta(minutes=1)
inputTime = datetime.datetime.utcfromtimestamp(options.input_time)
timestamp = inputTime.strftime('%Y%m%d-%H%M%S')
machName = gethostname().split('.')[0]
gribPath = '/localdata/radarqc/PHI/%s'%machName
netcdfPath = '/localdata/radarqc/PHI/%s/netcdf'%machName
engineScript = 'newEngine.py'
enginePath = '/localdata/radarqc/PHI/' + engineScript
probVals = np.zeros((600,800))
inPath = os.path.dirname(os.path.realpath(__file__))
timestamp2 = inputTime.strftime('%Y%m%d%H%M%S')
humanObjects = {}
modifiedObjects = {}
autoObjects = {}
humanModifiedBinaries = []
humanModifiedObjects = []
fh = open(floaterFile,'r')
c = fh.readline().split()
fh.close()
floaterLat = float(c[2])
floaterLon = float(c[3])
legacy = []
lFile = '/var/www/html/RadarQC/phi_new/realtime/ewp/floater/humanObjects/legacy/' + options.threat_type + '_' + timestamp + '.json'

# get list of objects and sort accordingly
cmd = 'php /var/www/html/RadarQC/phi_new/realtime/ewp/ewpProbs.php d=' + timestamp2 + ' fcstr=' + machName + ' type=' + options.threat_type + ' archive=' + str(arch) + ' block=1 automated=1'
print cmd
proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE)
out = proc.stdout.read()
gjsons = geojson.loads(out)
letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
ltrIdx = 0
for obj in gjsons['features']:
	if int(obj['properties']['data']['allow']) == 0:
		continue # object blocked or does not meet threshold criteria set by human
	elif obj['properties']['data']['automated'] == 0:
		if not humanObjects.has_key(str(obj['properties']['data']['id']).zfill(7)):
			humanObjects[str(obj['properties']['data']['id']).zfill(7)] = obj # object was created purely from human
		else:
			newID = str(letters[ltrIdx] + str(int(obj['properties']['data']['id']))).zfill(7)
			obj['properties']['data']['id'] = newID
			humanObjects[newID] = obj # object was created purely from human
			ltrIdx += 1
			if ltrIdx == 26:
                                ltrIdx = 0
	elif obj['properties']['data']['automated'] >= 2:
		found = False
		for key in obj['properties']['data']['modified']:
			if obj['properties']['data']['modified'][key] == 1:
				modifiedObjects[str(obj['properties']['data']['id']).zfill(7)] = obj # object was automated but modified by human
				found = True
				break
		if not found:
			autoObjects[str(obj['properties']['data']['id']).zfill(7)] = obj # object is automated with human approval
	else:
		autoObjects[str(obj['properties']['data']['id']).zfill(7)] = obj # object is automated with human approval

# fire off processing of human objects
print 'Processing human objects...'
for objID in humanObjects:

	# make sure not too many instances of newEngine.py are running (capped at 10 processes)
	loopFlag = True
        while loopFlag:
                loopFlag = processCheck(engineScript,10)
                if not loopFlag: 
			break
		time.sleep(2)

	# write geojson to temp file and store binary file path
	tmpObj = inPath + '/tmp/' + timestamp + '_' + objID.zfill(7) + '.json'
	tmpBinary = inPath + '/floater/humanObjects/binary/' + timestamp + '_' + objID + '.npz'
	humanModifiedObjects.append(tmpObj)
	humanModifiedBinaries.append(tmpBinary)
	fh = open(tmpObj,'w')
	fh.write(str(humanObjects[objID]).replace("'",'"'))
	fh.close()

	# launch grid generation script
	syscmd = 'python ' + enginePath + ' -i ' + tmpObj + ' -t ' + str(humanObjects[objID]['properties']['data']['issue']) + ' -o ' + str(options.input_time) + ' -u PHI -r -b -a >& ' + inPath + '/engineOut.txt &'
        print "Running %s... "%syscmd
        os.system(syscmd)

# fire off processing of human-modified objects
print 'Processing modified objects...'
for objID in modifiedObjects:

        # make sure not too many instances of newEngine.py are running (capped at 10 processes)
        loopFlag = True
        while loopFlag:
                loopFlag = processCheck(engineScript,10)
                if not loopFlag:
                        break
                time.sleep(2)

        # write geojson to temp file and store binary file path
        tmpObj = inPath + '/tmp/' + timestamp + '_' + objID + '.json'
        tmpBinary = inPath + '/floater/humanObjects/binary/' + timestamp + '_' + objID + '.npz'
	humanModifiedObjects.append(tmpObj)
        humanModifiedBinaries.append(tmpBinary)
        fh = open(tmpObj,'w')
        fh.write(str(modifiedObjects[objID]).replace("'",'"'))
        fh.close()

        # launch grid generation script
        syscmd = 'python ' + enginePath + ' -i ' + tmpObj + ' -t ' + str(modifiedObjects[objID]['properties']['data']['issue']) + ' -o ' + str(options.input_time) + ' -u PHI -r -b -a >& ' + inPath + '/engineOut.txt &'
        print "Running %s... "%syscmd
        os.system(syscmd)

# wait for all binaries to arrive (automation)
if options.threat_type != 'tornado':
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

# merge all auto-generated grids
print 'Merging auto-generated grids...'
for objID in autoObjects:

	# load binary
	binary = inDirAuto + '/' + status[2] + '_' + objID + '.npz'
	try:
		nz = np.load(binary)
	except:
		print 'Could not load ' + binary
		continue
        x = nz['arr_0']
        y = nz['arr_1']
        vals = nz['arr_2']

        # merge to common grid, retaining max value at grid point
        #probVals = np.maximum(probVals, vals)

	# new method
	ix = int((floaterLon - x[0][0]) * -100)+1
	iy = int((y[0][0] - (floaterLat - 6)) * 100)

        for i in range(len(x)):
                for j in range(len(x[i])):
			idx_y = iy + i
			idx_x = ix + j
			if idx_x >= 0 and idx_x < 800 and idx_y >= 0 and idx_y < 600 and vals[i][j] > probVals[idx_y][idx_x]:
	                        probVals[idx_y][idx_x] = vals[i][j]

	# write to placefile
        CS = plt.contour(x,y,vals,levels=[0,20,40,60,80])
        placefile += '; ' + str(int(vals.max())) + '\n'
        placefile += contours2placefile(CS, '')

	# write legacy
        hjson = autoObjects[objID]
        CS = plt.contour(x,y,vals,levels=[0])
        threat = sg.asShape(hjson.geometry)
        #legacy = legacy + contours2legacy(CS,options.threat_type,hjson.properties['data']['issue'],hjson.properties['data']['valid_start'],hjson.properties['data']['valid_end'],hjson.properties['data']['id'],hjson.properties['data']['discussion'],hjson.properties['data']['elements']['severity'],hjson.properties['data']['elements']['source'],hjson.properties['data']['elements']['alertLevel'],hjson['properties']['data']['automated'],-99,hjson.properties['data']['speeds'][0],hjson.properties['data']['dirs'][0],hjson.properties['data']['wfo'],threat.centroid.x,threat.centroid.y,hjson.properties['data']['duration'],hjson.properties['data']['user'])
	legacy = legacy + contours2legacy(CS,options.threat_type,hjson.properties['data']['issue'],hjson.properties['data']['valid_start'],hjson.properties['data']['valid_end'],hjson.properties['data']['id'],hjson.properties['data']['discussion'],hjson.properties['data']['elements']['severity'],hjson.properties['data']['elements']['source'],hjson.properties['data']['elements']['alertLevel'],hjson.properties['data']['automated'],-99)

# wait until human/modifid grids are done
notReady = True
tryCount = 0
while notReady:
	binCount = 0
	for binary in humanModifiedBinaries:
		print binary
		if os.path.exists(binary):
			binCount += 1
		else:
			break
	if binCount == len(humanModifiedBinaries):
		time.sleep(1)
		print 'Human/modified grids done!'
		notReady = False
	else:
		tryCount += 1
		if tryCount > 30:
			print 'Could not locate human/modified grid, continuing...'
			notReady = False
		else:
			print 'Not all human/modified grids generated, waiting...'
			time.sleep(1)

# merge all human-modified grids
print 'Merging human/modified grids...'
i = -1
for binary in humanModifiedBinaries:
	i += 1

	# load binary
	try:
		nz = np.load(binary)
	except:
		print 'Could not load '	+ binary
		continue
        x = nz['arr_0']
        y = nz['arr_1']
        vals = nz['arr_2']

	# merge to common grid, retaining max value at grid point
        probVals = np.maximum(probVals, vals)

	# new method
	'''
        ix = int((floaterLon - x[0][0]) * -100)+1
        iy = int((y[0][0] - (floaterLat - 6)) * 100)

        for k in range(len(x)):
                for j in range(len(x[k])):
                        idx_y = iy + k
                        idx_x = ix + j
                        if idx_x >= 0 and idx_x < 800 and idx_y >= 0 and idx_y < 600 and vals[k][j] > probVals[idx_y][idx_x]:
                                probVals[idx_y][idx_x] = vals[k][j]
	'''
	# write to placefile
        CS = plt.contour(x,y,vals,levels=[0,20,40,60,80])
        hFile = binary.replace('binary','placefiles')[:-3] + 'txt'
        placefile += '; ' + str(int(vals.max())) + '\n'
        placefile += contours2placefile(CS, hFile)

        # write legacy
        # 20160512-133627_000003.npz
        hObj = humanModifiedObjects[i]
        fh = open(hObj,'r')
        line = fh.readlines()[0].rstrip()
        fh.close()
        hjson = geojson.loads(line)
        CS = plt.contour(x,y,vals,levels=[int(hjson.properties['data']['elements']['warningThresh'])])
        legacy = legacy + contours2legacy(CS,options.threat_type,hjson.properties['data']['issue'],hjson.properties['data']['valid_start'],hjson.properties['data']['valid_end'],hjson.properties['data']['id'],hjson.properties['data']['discussion'],hjson.properties['data']['elements']['severity'],hjson.properties['data']['elements']['source'],hjson.properties['data']['elements']['alertLevel'],hjson.properties['data']['automated'],-99)
	print 'legacy', binary

# clean up temp jsons
for obj in humanModifiedObjects:
        os.system('rm ' + obj)

# write placefile
if not options.archive:
        fh = open(pFile,'w')
        fh.write(placefile)
        fh.close()

# write legacy advisory/warning data
legjson = {"type":"FeatureCollection","features":legacy}
fh = open(lFile, 'a')
fh.write(str(legjson).replace("'",'"') + '\n')
fh.close()

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

probVals[probVals == 1] = 5.
probVals[probVals == 2] = 5.
probVals[probVals == 3] = 5.
probVals[probVals == 4] = 5.

fig = plt.figure()
igrid = ImageGrid(fig, 111, nrows_ncols=(1,1))
ax = igrid[0]; cax = igrid.cbar_axes[0]
ax.axis('off')
clim = [1,100]
cs = m.pcolormesh(x, y, probVals, ax=ax, clim=clim, vmin=1, vmax=100, cmap=cmap)
# Floater_20150327-192626_MergedReflectivityQCComposite_00.50.png
imgFile = imgDir + '/Floater_' + timestamp + '_PHI-' + options.threat_type + '-' + machName + '_00.00.png'
print imgFile
plt.savefig(imgFile, dpi=400, bbox_inches='tight', pad_inches=0, transparent=True)

# end script
etime = time.time()
print 'Time elapsed: ' + str(etime - stime) + ' seconds'

