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
import paramiko
import w2py2
import netCDF4

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

# get MESH data
ssh = paramiko.SSHClient()
ssh.load_host_keys(os.path.expanduser(os.path.join('~','.ssh','known_hosts')))
ssh.connect('w2ts4.protect.nssl',username='radarqc', password='Abcd1234')
sftp = ssh.open_sftp()

files = sftp.listdir('/data/realtime/radar/PHI/multi/RotationTrackML60min/00.00')
thresh = 3600
meshFiles = []
for f in sorted(files):
	file_date = datetime.datetime(int(f[:4]),int(f[4:6]),int(f[6:8]),int(f[9:11]),int(f[11:13]),int(f[13:15]))
	fTime = ((file_date - epoch).days * 86400) + (file_date - epoch).seconds
	diff = fTime - startTime
	if diff > thresh:
		print f
		sftp.get('/data/realtime/radar/PHI/multi/RotationTrackML60min/00.00/' + f, inPath + '/AzShear/' + f)
		os.system('gunzip -f ' + inPath + '/AzShear/' + f)
		meshFiles.append(inPath + '/AzShear/' + f[:-3])
		thresh += 3600
		if fTime > endTime:
			break

if len(meshFiles) == 0:
	print 'no files found on w2ts4, exiting...'
	sys.exit()

inputProduct = 'RotationTrackML60min'
i = 0
for inputFile in meshFiles:
	i += 1
	nc_data = netCDF4.Dataset(inputFile)
        if nc_data.DataType == 'SparseLatLonGrid':
                nc_data.close()
                x,y,vals = w2py2.readSparseGrid(inputFile, inputProduct)
        elif nc_data.DataType == 'LatLonGrid':
                nc_data.close()
                x,y,vals = w2py2.readLatLonGrid(inputFile, inputProduct)
        vals[vals < 0] = 0
	if i == 1:
		accumVals = vals
	else:
		accumVals = np.maximum(accumVals, vals)

llLon = x.min()
llLat = y.min()
urLon = x.max()
urLat = y.max()

fig = plt.figure(figsize=(6,7))
ax = fig.add_axes([0.05,0.05,0.8,0.9])
m = Basemap(llcrnrlat=llLat, llcrnrlon=llLon, urcrnrlat=urLat, urcrnrlon=urLon, resolution='l', ax=ax, epsg=3857)
u = m.readshapefile(inPath + '/shp/us_states','states',linewidth=2,color='black',zorder=5)
n = m.readshapefile(inPath + '/shp/nws_cwas_simple','cwas',linewidth=1,color='black',zorder=5)
c = m.readshapefile(inPath + '/shp/c_04jn14','counties',linewidth=0.25,color='#CCCCCC',zorder=4)

# create color map
levels = []
levels2 = [0,0.005,0.010,0.015,0.020,0.025]
for i in range(26):
	levels.append(float(i) / 1000.)
#r = [255,0,0,0,0,0,0,255,191,255,255,191,127,255,255,255,255,255,255,255,255,255,255,255,255]
#g = [255,255,128,0,127,191,255,255,191,153,0,0,0,51,255,255,255,255,255,255,255,255,255,255,255]
#b = [255,255,255,255,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255]

r = [255,255,255,204,130,70,130,170,210,255,168,210,255,255,255,255,255,223,191,159,128,96,64,32,0,0]
g = [255,255,255,204,130,70,130,170,210,255,0,0,0,127,190,230,255,255,255,255,255,255,255,255,255,255]
b = [255,255,255,204,130,0,0,0,0,0,0,0,0,127,190,230,255,255,255,255,255,255,255,255,255,255]

a = []
if len(a) == 0:
        for i in range(0,len(r)):
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
plt.rcParams['image.cmap'] = 'custom_cmap'
cmap = plt.get_cmap('custom_cmap')
cmap.set_under('k', alpha=0.0)

lons = np.arange((x.min() * 1000), (x.max() * 1000),5) / 1000.
#lats = np.arange((y.min() * 100), (y.max() * 100)) / 100.
lats = np.arange((y.max() * 1000), (y.min() * 1000), -5) / 1000.
print lons.min(), lons.max(), lats.min(), lats.max()
x, y = m(*np.meshgrid(lons, lats))
#c = m.contourf(x,y,accumProbs,levels=[0,20,40,60,80,100],cmap=cmap)
clim = [levels[0], levels[-1]]
c = m.pcolormesh(x, y, accumVals, ax=ax, clim=clim, vmin=levels[0], vmax=levels[-1], cmap=cmap)
cbar = m.colorbar(c,location='right',pad="2%", ticks=levels2)

# plot warnings
shp = shapefile.Reader(inPath + '/shp/wwa_201506042300_201506050100')
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
'''
if len(segsS) > 0:
        print 'Severe: ' + str(len(segsS))
        lines2 = LineCollection(segsS,antialiaseds=(1,),zorder=5)
        #lines2.set_facecolors(cm.jet(np.random.rand(1)))
        lines2.set_edgecolors('blue')
        lines2.set_linewidth(1)
        ax.add_collection(lines2)
'''
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
			break
                # Time,Speed,Location,County,State,Lat,Lon,Comments
                report = 'Wind'
                value = 'speed'
                lats = []
                lons = []
                continue
        elif s[1] == 'Size':
                if len(lats) > 0:
                        x, y = m(lons,lats)
                        #m.scatter(x, y, marker='o', s=10, c='#00FFFF', zorder=22)
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
'''
if len(lats) > 0:
        x, y = m(lons,lats)
        m.scatter(x, y, marker='o', s = 10, c='#00FF00', zorder=20)
'''
img = inPath + '/PHI_Imagery/accumWarningsAzShear_' + sTime + '_' + eTime + '.png'
plt.title('Accumulated AzShear with Warnings/LSRs\n' + sTime + ' - ' + eTime)
plt.savefig(img,dpi=400,bbox_inches='tight')
