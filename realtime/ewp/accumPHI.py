import os, sys
import datetime
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.basemap import Basemap
import urllib2

try:
	sTime = sys.argv[1]
	eTime = sys.argv[2]
	probType = sys.argv[3]
except:
	print 'No command line args given, exiting...'
	sys.exit()

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

inPath = os.path.dirname(os.path.realpath(__file__))
epoch = datetime.datetime.utcfromtimestamp(0)
start = datetime.datetime(int(sTime[:4]),int(sTime[4:6]),int(sTime[6:8]),int(sTime[9:11]),int(sTime[11:13]),int(sTime[13:15]))
startTime = ((start - epoch).days * 86400) + (start - epoch).seconds
end = datetime.datetime(int(eTime[:4]),int(eTime[4:6]),int(eTime[6:8]),int(eTime[9:11]),int(eTime[11:13]),int(eTime[13:15]))
endTime = ((end - epoch).days * 86400) + (end - epoch).seconds

if probType == 'ProbSevere':
	binaryPath = '/var/www/html/RadarQC/phi_new/realtime/ewp/floater/probSevereObjects/binary'
else:
	binaryPath = '/var/www/html/RadarQC/phi_new/realtime/ewp/floater/azShearObjects/binary'
binaries = os.listdir(binaryPath)
accumProbs = np.zeros((600,800))

for binary in binaries:
	bTime = binary.split('_')[0].split('.')[0]
	bt = datetime.datetime(int(bTime[:4]),int(bTime[4:6]),int(bTime[6:8]),int(bTime[9:11]),int(bTime[11:13]),int(bTime[13:15]))
	bTime = ((bt - epoch).days * 86400) + (bt - epoch).seconds
	#print bTime, startTime, endTime

	if bTime >= startTime and bTime <= endTime:
		binaryFile = binaryPath + '/' + binary
		nz = np.load(binaryFile)
                x = nz['arr_0']
                y = nz['arr_1']
                vals = nz['arr_2']
		accumProbs = np.maximum(accumProbs,vals)

fig = plt.figure(figsize=(6,7))
ax = fig.add_axes([0.05,0.05,0.8,0.9])
lons = np.arange((x.min() * 100), (x.max() * 100)) / 100.
lats = np.arange((y.min() * 100)+2, (y.max() * 100)+2) / 100.
m = Basemap(llcrnrlat=y.min(), llcrnrlon=x.min(), urcrnrlat=y.max(), urcrnrlon=x.max(), resolution='l', ax=ax, epsg=3857)
x, y = m(*np.meshgrid(lons, lats))
#c = m.contourf(x,y,accumProbs,levels=[0,20,40,60,80,100],cmap=cmap)
clim = [1,100]
c = m.pcolormesh(x, y, accumProbs, ax=ax, clim=clim, vmin=1, vmax=100, cmap=cmap)
cbar = m.colorbar(c,location='right',pad="2%",ticks=[0,20,40,60,80,100])
#m.drawstates(linewidth=1.5)
#m.drawcoastlines(linewidth=1.5)
#m.drawcountries(linewidth=1.5)
u = m.readshapefile(inPath + '/shp/us_states','states',linewidth=2,color='black',zorder=5)
n = m.readshapefile(inPath + '/shp/nws_cwas_simple','cwas',linewidth=1,color='black',zorder=5)
c = m.readshapefile(inPath + '/shp/c_04jn14','counties',linewidth=0.25,color='#CCCCCC',zorder=4)

#reportsFile = inPath + '/today.csv'
url = 'http://www.spc.noaa.gov/climo/reports/today.csv'
#url = 'http://www.spc.noaa.gov/climo/reports/yesterday.csv'
response = urllib2.urlopen(url)
lines = response.read().split('\n')

tDay = datetime.datetime.utcnow()
delta = datetime.timedelta(days=1)
yDay = tDay - delta

#fh = open(reportsFile,'r')
#lines = fh.readlines()
#fh.close()

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
			if probType == 'AzShear':
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
                        m.scatter(x, y, marker='o', s=10, c='#00FFFF', zorder=19)
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

img = inPath + '/PHI_Imagery/accum' + probType + 'PHI_' + sTime + '_' + eTime + '.png'
plt.title('Accumulated ' + probType + ' PHI with LSRs\n' + sTime + ' - ' + eTime)
plt.savefig(img,dpi=400,bbox_inches='tight')
