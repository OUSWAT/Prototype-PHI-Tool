import os, sys
import datetime
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.basemap import Basemap
import shapefile
from matplotlib.collections import LineCollection
import urllib2

try:
	sTime = sys.argv[1]
	eTime = sys.argv[2]
except:
	print 'No command line args given, exiting...'
	sys.exit()

inPath = os.path.dirname(os.path.realpath(__file__))
epoch = datetime.datetime.utcfromtimestamp(0)
start = datetime.datetime(int(sTime[:4]),int(sTime[4:6]),int(sTime[6:8]),int(sTime[9:11]),int(sTime[11:13]),int(sTime[13:15]))
startTime = ((start - epoch).days * 86400) + (start - epoch).seconds
end = datetime.datetime(int(eTime[:4]),int(eTime[4:6]),int(eTime[6:8]),int(eTime[9:11]),int(eTime[11:13]),int(eTime[13:15]))
endTime = ((end - epoch).days * 86400) + (end - epoch).seconds

fh = open(inPath + '/PHI_Floater_Info.txt','r')
lines = fh.readlines()
fh.close()
#NW Coords: 39.46 -104.43
#SE Coords: 33.46 -96.43

urLat = float(lines[0].rstrip().split(' ')[2])
llLon = float(lines[0].rstrip().split(' ')[3])
llLat = float(lines[1].rstrip().split(' ')[2])
urLon = float(lines[1].rstrip().split(' ')[3])

fig = plt.figure(figsize=(6,7))
ax = fig.add_axes([0.05,0.05,0.8,0.9])
m = Basemap(llcrnrlat=llLat, llcrnrlon=llLon, urcrnrlat=urLat, urcrnrlon=urLon, resolution='l', ax=ax, epsg=3857)
u = m.readshapefile(inPath + '/shp/us_states','states',linewidth=2,color='black',zorder=5)
n = m.readshapefile(inPath + '/shp/nws_cwas_simple','cwas',linewidth=1,color='black',zorder=5)
c = m.readshapefile(inPath + '/shp/c_04jn14','counties',linewidth=0.25,color='#CCCCCC',zorder=4)

#w = m.readshapefile(inPath + '/shp/wwa_201504162000_201504170200','cwas',linewidth=1,color='red',zorder=5)

shp = shapefile.Reader(inPath + '/shp/wwa_201505061930_201505070145')
records = shp.records()
shapes = shp.shapes()
segsS = []
segsT = []
for i in range(len(records)):
	# ['MAF', '201504162237', '201504162315', '201504162237', '201504162315', 'SV', 'P', 'W', '20', 'NEW', '      ', 739.17205427152498]
	wsTime = records[i][1]
	weTime = records[i][2]
	wType = records[i][5]
	wStart = datetime.datetime(int(wsTime[:4]),int(wsTime[4:6]),int(wsTime[6:8]),int(wsTime[8:10]),int(wsTime[10:12]))
        wStartTime = ((wStart - epoch).days * 86400) + (wStart - epoch).seconds
	#wEnd = datetime.datetime(int(weTime[:4]),int(weTime[4:6]),int(weTime[6:8]),int(weTime[9:11]),int(weTime[11:13]),int(weTime[13:15]))
	#wEndTime = ((wEnd - epoch).days * 86400) + (wEnd - epoch).seconds
	if wStartTime >= startTime and wStartTime <= endTime:
		lons,lats = zip(*shapes[i].points)
                data = np.array(m(lons, lats)).T
                if wType == 'SV':
                        segsS.append(data)
                elif wType == 'TO':
                        segsT.append(data)		

if len(segsT) > 0:
        print 'Tornado: ' + str(len(segsT))
        lines = LineCollection(segsT,antialiaseds=(1,),zorder=6)
        #lines.set_facecolors(cm.jet(np.random.rand(1)))
        lines.set_edgecolors('red')
        lines.set_linewidth(1)
        ax.add_collection(lines)
if len(segsS) > 0:
        print 'Severe: ' + str(len(segsS))
        lines2 = LineCollection(segsS,antialiaseds=(1,),zorder=5)
        #lines2.set_facecolors(cm.jet(np.random.rand(1)))
        lines2.set_edgecolors('blue')
        lines2.set_linewidth(1)
        ax.add_collection(lines2)

#reportsFile = inPath + '/today.csv'
tDay = datetime.datetime.utcnow()
delta = datetime.timedelta(days=1)
yDay = tDay - delta

#fh = open(reportsFile,'r')
#lines = fh.readlines()
#fh.close()

url = 'http://www.spc.noaa.gov/climo/reports/today.csv'
#url = 'http://www.spc.noaa.gov/climo/reports/yesterday.csv'
response = urllib2.urlopen(url)
lines = response.read().split('\n')

for line in lines:

        s = line.rstrip().split(',')
	if len(s) == 1:
		continue
        if s[1] == 'F_Scale':
                # Time,F_Scale,Location,County,State,Lat,Lon,Comments
                report = 'Tornado'
                value = 'f_scale'
                lats = []
                lons = []
                continue
        elif s[1] == 'Speed':
                if len(lats) > 0:
                        x, y = m(lons,lats)
                        m.scatter(x, y, marker='o', s=10, c='r', zorder=21)
                # Time,Speed,Location,County,State,Lat,Lon,Comments
                report = 'Wind'
                value = 'speed'
                lats = []
                lons = []
                continue
        elif s[1] == 'Size':
                if len(lats) > 0:
                        x, y = m(lons,lats)
                        m.scatter(x, y, marker='o', s=10, c='#00FFFF', zorder=22)
                # Time,Size,Location,County,State,Lat,Lon,Comments
                report  = 'Hail'
                value = 'size'
                lats = []
                lons = []
                continue

        # 1430,UNK,1 S COLLINSVILLE,BUTLER,OH,39.5,-84.61,DAMAGE TO BARN AND ROOF DAMAGE TO HOME. (ILN)
	if int(s[0][:-2]) > 12:
		now = yDay
	else:
		now = tDay
        reportTime = datetime.datetime(now.year,now.month,now.day,int(s[0][:-2]),int(s[0][2:]))
        rTime = ((reportTime - epoch).days * 86400) + (reportTime - epoch).seconds

        if rTime >= startTime and rTime <= endTime:
                lons.append(float(s[6]))
                lats.append(float(s[5]))

if len(lats) > 0:
        x, y = m(lons,lats)
        m.scatter(x, y, marker='o', s = 10, c='#00FF00', zorder=20)

img = inPath + '/PHI_Imagery/accumWarnings_' + sTime + '_' + eTime + '.png'
plt.title('Accumulated Warnings with LSRs\n' + sTime + ' - ' + eTime)
plt.savefig(img,dpi=400,bbox_inches='tight')
