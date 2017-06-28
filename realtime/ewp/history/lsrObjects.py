import time
stime = time.time()
import os, sys
import shapely.geometry as sg
import shapely.affinity as sa
import shapely.ops as so
import geojson
import urllib2
import datetime
import math
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pprint import pprint

path = '/var/www/html/RadarQC/phi_new/realtime/ewp'

try:
	inObjects = sys.argv[1] # probSevere or lightning
except:
	print 'no input object type specified, exiting...'

try:
	inDate = sys.argv[2] # 2015042622
	site = sys.argv[3] # KTLX
	link = 'http://www.spc.noaa.gov/climo/reports/' + inDate[2:8] + '_rpts.csv'
	objPath = '/localdata/radarqc/PHI/archive/' + inDate[:8] + '/' + site + '/' + inObjects + 'Objects/objects/'
except:
	now = datetime.datetime.utcnow()
	inDate = now.strftime('%Y%m%d%H')
	link = 'http://www.spc.noaa.gov/climo/reports/today.csv'
	objPath = path + '/floater/' + inObjects + 'Objects/objects/'


# read most recently processed LSRs
epoch = datetime.datetime.utcfromtimestamp(0)
now = datetime.datetime(int(inDate[:4]), int(inDate[4:6]), int(inDate[6:8]), int(inDate[8:10]))
delta = datetime.timedelta(days=1)
hour = int(now.strftime('%H'))
if hour < 12:
	now -= delta
timestamp = now.strftime('%Y%m%d')
log = path + '/history/reports/'+ inObjects + '_' + timestamp + '.json'

try:
	with open(log) as fh:
		fc = geojson.load(fh)
	pprint(fc)
except:
	fc = geojson.FeatureCollection([])

# get all auto objects
autoObjects = sorted(os.listdir(objPath))
ac = {}
vs = 9999999999999999
ve = 0
for f in reversed(autoObjects):
	#if 'scale0' in f:
	#	continue # scale 0 lightning files

        # probSevere_20151019-130834_039051.json
	try:
	        fh = open(objPath + '/' + f,'r')
	except:
		continue
        lines = fh.readlines()
        fh.close()

        for obj in reversed(lines):
                gjson = geojson.loads(obj.rstrip(), object_hook=geojson.GeoJSON.to_instance)
		if not ac.has_key(gjson.properties['data']['valid_start']):
			ac[gjson.properties['data']['valid_start']] = []
		ac[gjson.properties['data']['valid_start']].append(gjson)

		if gjson.properties['data']['valid_start'] > ve:
                        ve = gjson.properties['data']['valid_start']
                if gjson.properties['data']['valid_start'] < vs:
                        vs = gjson.properties['data']['valid_start']


keys2 = sorted(ac.keys())
keys = sorted(ac.keys(), reverse=True)

# get current LSRs
response = urllib2.urlopen(link)
reports = response.read().split('\n')
ignore = ['Time,F-Scale,Location,County,State,Lat,Lon,Comments','Time,F_Scale,Location,County,State,Lat,Lon,Comments','Time,Speed,Location,County,State,Lat,Lon,Comments','Time,Size,Location,County,State,Lat,Lon,Comments','']
features = []

for line in reports:

	# ignore non-data lines
	if line.rstrip() in ignore:
		if 'F-Scale' in line or 'F_Scale' in line:
			print 'Tornado Reports'
			rType = 'tornado'
			color = 'rgb(255,0,0)'
		elif 'Speed' in line:
			print 'Wind Reports'
			rType = 'wind'
			color = 'rgb(0,0,255)'
		elif 'Size' in line:
			print 'Hail Reports'
			rType = 'hail'
			color = 'rgb(0,128,0)'
		continue

	# if LSR already exists in log, add to list and continue
	s = line.rstrip().split(',')
	found = False
	try:
		feats = fc['features']
	except:
		feats = fc.features
	for feature in feats:
		if feature['properties']['time'] == s[0] and feature['properties']['magnitude'] == s[1] and feature['properties']['location'] == s[2] and feature['properties']['lat'] == s[5] and feature['properties']['lon'] == s[6] and feature['properties']['comments'] == s[7] and feature['properties']['objID'] != -999:
			features.append(feature)
			print 'Report already added to ' + str(feature['properties']['objID']) + ', continuing...'
			found = True
			break
	if found:
		continue

	# compute numeric attributes
	lat = float(s[5])
	lon = float(s[6])
	if lon > -60:
		lon -= 100
	hour = int(s[0][:2])
	minute = int(s[0][2:])
	logTime = now
	if hour < 12:
		logTime = now + delta

	rTime = datetime.datetime(logTime.year, logTime.month, logTime.day, hour, minute)
	reportTimestamp = rTime.strftime('%Y%m%d-%H%M%S')
	reportEpoch = ((rTime - epoch).days * 86400) + (rTime - epoch).seconds

	# determine which object the LSR belongs to
	# read objects, starting with newest ones and work backwards in time
	objID = -999
	pnt = sg.Point(lon,lat)
	found = False
	method = 0
	for t in keys2:
		if t > reportEpoch:
			for gjson in ac[t]:
				poly = sg.asShape(gjson.geometry)
				#print gjson.properties['data']['valid_start'], reportEpoch, (gjson.properties['data']['valid_start'] - reportEpoch), gjson.properties['data']['id']
				if poly.contains(pnt):
					objID = gjson.properties['data']['id']
					found = True
					method = 1
					print 'New report matched with ' + str(objID) + ' using point in polygon method'
					break
			break

	# resort to centroid distance matching, if time/distance thresholds are met
	if not found:
		disLast = 9999999
		minDis = 0.33 # needs to be within ~33 km or 20 miles of the object
		for t in keys2:
			if t > reportEpoch:
				for gjson in ac[t]:
					coordDis = 999999
					poly = sg.asShape(gjson.geometry)
					#distance = math.sqrt(pow(pnt.x - poly.representative_point().x,2) + pow(pnt.y - poly.representative_point().y,2))
					for coord in poly.exterior.coords:
						dis = math.sqrt(pow(pnt.x - coord[0],2) + pow(pnt.y - coord[1],2))
						if dis < coordDis:
							coordDis = dis
					if coordDis < disLast and coordDis <= minDis:
						objID = gjson.properties['data']['id']
						disLast = coordDis
						found = True
						method = 2
						print 'New report matched with ' + str(objID) + ' using centroid distance matching'
						#print coordDis, line
				break

	#if objID == -999 and '(OAX)' in line:
	#	print line
	if objID == -999:
		print 'Could not match report to object :('

	# build object geometry and properties
	point = geojson.Point((lon, lat))
	props = {
		'time': s[0],
		'magnitude': s[1],
		'location': s[2],
		'county': s[3],
		'state': s[4],
		'lat': s[5],
		'lon': s[6],
		'comments': s[7],
		'timestamp': reportTimestamp,
		'epoch': reportEpoch,
		'objID': objID,
		'hazard': rType,
		'color': color,
		'method': method
	}

	# build feature and add to list
	feat = geojson.Feature(geometry=point, properties=props)
	features.append(feat)

# convert all featuers to featurecollection and write to file
newFC = geojson.FeatureCollection(features)
dump = geojson.dumps(newFC)

fh = open(log,'w')
fh.write(dump)
fh.close()

os.system('scp ' + log + ' chris.karstens@devlab12.protect.nssl:/www/www.nssl.noaa.gov/projects/facets/phi/realtime/ewp/history/reports/')

etime = time.time()
print 'Time elapsed: ' + str(etime - stime) + ' seconds'
