import os, sys
import shapely.geometry as sg
import datetime
import geojson

inPath = os.path.dirname(os.path.realpath(__file__))
reportsFile = inPath + '/today.csv'
now = datetime.datetime.utcnow()
epoch = datetime.datetime.utcfromtimestamp(0)

fh = open(reportsFile,'r')
lines = fh.readlines()
fh.close()

reports = {'Tornado':{},'Wind':{},'Hail':{}}

for line in lines:

        s = line.rstrip().split(',')

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
        reportTime = datetime.datetime(now.year,now.month,now.day,int(s[0][:-2]),int(s[0][2:]))
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
	reports[report][count]['point'] = sg.Point(float(s[6]), float(s[5]))

# get last status file data
statusFile = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusProbSevere.txt'
fh = open(statusFile,'r')
status = fh.readlines()[0].rstrip().split(',')
fh.close()

# get valid binaries
binaryPath = '/var/www/html/RadarQC/phi_new/realtime/ewp/floater/probSevereObjects/binary'
objectPath = '/var/www/html/RadarQC/phi_new/realtime/ewp/floater/probSevereObjects/objects'
binaries = sorted(os.listdir(binaryPath), reverse=True)[:int(status[0])]
objects = sorted(os.listdir(objectPath), reverse=True)

# get list of IDs
ids = []
for binary in binaries:
	ids.append(binary.split('_')[1].split('.')[0])

# get valid objects
# probSevere_20150413-175429_201573.json
validObjects = []
for obj in objects:
	objID = obj.split('_')[2].split('.')[0]
	if objID in ids:
		validObjects.append(obj)

# convex hull all objects per ID to create track
for obj in validObjects:
	fh = open(objectPath + '/' + obj,'r')
	lines = fh.readlines()
	fh.close()

	hits = []
	for line in lines:
		gjson = geojson.loads(line.rstrip(),object_hook=geojson.GeoJSON.to_instance)
		threatObject = sg.asShape(gjson.geometry)
		threatTime = int(gjson.properties['data']['valid_start'])
		tWinMin = threatTime - 300
		tWinMax = threatTime + 300

		for report in reports:
			for num in reports[report]:
				if reports[report][num] not in hits and reports[report][num]['time'] >= tWinMin and reports[report][num]['time'] <= tWinMax and threatObject.contains(reports[report][num]['point']):
					hits.append(reports[report][num])
	print hits
# merge reports valid objects
