import os, sys
import shapely.geometry as sg
import shapely.ops as so
from functools import partial
import pyproj
import geojson
import datetime
import subprocess
from socket import gethostname
import urllib2
import pickle

# define some variables
inPath = os.path.dirname(os.path.realpath(__file__))
inputTime = datetime.datetime.utcnow()
timestamp = inputTime.strftime('%Y%m%d%H%M%S')
machName = gethostname().split('.')[0]
epoch = datetime.datetime.utcfromtimestamp(0)
proj_google = partial(pyproj.transform,pyproj.Proj(init='epsg:4326'),pyproj.Proj(init='epsg:3857'))

# get reports
url = 'http://www.spc.noaa.gov/climo/reports/today.csv'
response = urllib2.urlopen(url)
lines = response.read().split('\n')
reports = {'Tornado':{},'Wind':{},'Hail':{}}
for line in lines:

        s = line.rstrip().split(',')
	if len(s) == 1:
		continue

        if s[1] == 'F_Scale':
                # Time,F_Scale,Location,County,State,Lat,Lon,Comments
                report = 'Tornado'
                value = 'f_scale'
                count = 0
                continue
        elif s[1] == 'Speed':
                # Time,Speed,Location,County,State,Lat,Lon,Comments
                report = 'Wind'
                value = 'speed'
                count = 0
                continue
        elif s[1] == 'Size':
                # Time,Size,Location,County,State,Lat,Lon,Comments
                report  = 'Hail'
                value = 'size'
                count = 0
                continue

        count += 1

        # 1430,UNK,1 S COLLINSVILLE,BUTLER,OH,39.5,-84.61,DAMAGE TO BARN AND ROOF DAMAGE TO HOME. (ILN)
        reportTime = datetime.datetime(inputTime.year,inputTime.month,inputTime.day,int(s[0][:-2]),int(s[0][2:]))
        eTime = ((reportTime - epoch).days * 86400) + (reportTime - epoch).seconds

        reports[report][count] = {}
        reports[report][count]['time'] = eTime
        reports[report][count][value] = s[1]
        reports[report][count]['location'] = s[2]
        reports[report][count]['county'] = s[3]
        reports[report][count]['state'] = s[4]
        reports[report][count]['latitude'] = float(s[5])
        reports[report][count]['longitude'] = float(s[6])
        reports[report][count]['comments'] = s[7]

# get id dictionary
hids = {}
files = os.listdir(inPath + '/threats/')
for f in files:
	fid = f.split('_')[2].split('.')[0]
	hids[fid] = f

aids = {}
files = os.listdir(inPath + '/floater/probSevereObjects/objects/')
for f in files:
        fid = f.split('_')[2].split('.')[0]
        aids[fid] = f

# get latest active geojsons
cmd = 'php /var/www/html/RadarQC/phi_new/realtime/ewp/ewpProbs.php d=' + timestamp + ' fcstr=' + machName + ' type=severe archive=0 block=0 automated=1'
print cmd
proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE)
out = proc.stdout.read()
gjsons = geojson.loads(out)

# iterate through active geojsons
objReports = {}
for obj in gjsons['features']:

	# snag id and use to open up all object for id
	objID = str(obj['properties']['data']['id']).zfill(6)

	found = False
	if hids.has_key(objID):
                inputFile = inPath + '/threats/' + hids[objID]
		found = True
	elif aids.has_key(objID):
		inputFile = inPath + '/floater/probSevereObjects/objects/' + aids[objID]
		found = True

	if not found:
		print 'Could not find ' + objID + ' continuing...'
		continue

	fh = open(inputFile,'r')
	lines = fh.readlines()
	fh.close()

	allPolys = []
	for line in lines:
		gjson = geojson.loads(line.rstrip(),object_hook=geojson.GeoJSON.to_instance)
		poly = sg.asShape(gjson.geometry)
		allPolys.append(tuple(poly.exterior.coords))

	if len(allPolys) == 1:
                mp = sg.MultiPoint(allPolys[0])
                track = mp.convex_hull
        else:
                segs = []
                for i in range(len(allPolys) - 1):
                        mp = sg.MultiPoint(allPolys[i] + allPolys[i+1])
                        segs.append(mp.convex_hull)
                track = so.cascaded_union(segs)

	# see which reports land in object track
	allReports = []
	for type in reports:
		for count in reports[type]:
			point = sg.Point(reports[type][count]['longitude'],reports[type][count]['latitude'])
			if track.contains(point):
				allReports.append(reports[type][count])

	objReports[objID] = allReports

pklFile = inPath + '/objReports.pkl'
fh = open(pklFile ,'wb')
pickle.dump(objReports,fh,pickle.HIGHEST_PROTOCOL)
fh.close()
