import os, sys
import numpy as np
import netCDF4
import urllib2
import time
import datetime

tNow = datetime.datetime.utcnow()

def findPoint(lons, lats, lon, lat):
        vals = np.abs(np.array(lons) - lon) + np.abs(np.array(lats) - lat)
        min = np.where(vals == vals.min())
        return min[0][0], min[1][0]

# get data from user
fh = open('/var/www/html/RadarQC/phi_new/bore/format.txt','r')
line = fh.readlines()[0].rstrip()
data = line.split(',')
fh.close()

# assign variables
# $str = $init.",".$x1.",".$y1.",".$x2.",".$y2.",".$member.",".$fHour;
initTime = data[0]
lon1 = float(data[1])
lat1 = float(data[2])
lon2 = float(data[3])
lat2 = float(data[4])
member = data[5]
fHour = data[6]
rTime = data[7]
invHeight = data[8]
invStrength = data[9]
cpDepth = data[10]
cpSpeed = data[11]

# get master lons/lats
if member == '111':
	nc = netCDF4.Dataset('/var/www/html/RadarQC/phi_new/2015060912_1km.nc')
else:
	nc = netCDF4.Dataset('/var/www/html/RadarQC/phi_new/2015052213_12.nc')
lats = nc.variables['XLAT'][:]
lons = nc.variables['XLON'][:]

# determine i, j points
py2, px2 = findPoint(lons, lats, lon1, lat1)
py1, px1 = findPoint(lons, lats, lon2, lat2)

# write out input string
# INITTIME X(COLDPOOL) Y(COLDPOOL) X(AMBIENT) Y(AMBIENT) VALIDTIME ENSSIZE MEMBER INITDATE
# 12 140 190 135 190 2015-05-16_16:00:00 20 1 20150515 
#      500       5    1000      10
#str = initTime + ' ' + str(px1) + ' ' + str(py1) + ' ' + str(px2) + ' ' + str(py2) + ' ' + validTime + ' ' + ensSize + ' ' + member + ' ' + initDate
st = invHeight.rjust(8) + invStrength.rjust(8) + cpDepth.rjust(8) + cpSpeed.rjust(8)
fName = 'needboreplot_' + initTime + '_' + str(px1).zfill(4) + '_' + str(py1).zfill(4) + '_' + str(px2).zfill(4) + '_' + str(py2).zfill(4) + '_' + member.zfill(3) + '_' + fHour.zfill(3) + '.txt'
iName = fName[:-3] + 'png'
fh = open('/var/www/html/RadarQC/phi_new/bore/' + fName,'w')
fh.write(st)
fh.close()

if member == 'hrrr':
	pass
	# fire off fortran code to extract sounding from the HRRR

	# fire off Kevin's code to generate bore diagnostics
else:
	# send to boomer
	cmd = 'scp -q /var/www/html/RadarQC/phi_new/bore/' + fName + ' kars0317@boomer.oscer.ou.edu:/work/pecanmap/boreinput/'
	print cmd
	os.system(cmd)

# build image URL
if member.zfill(3) == '111':
	mem = 'hires'
elif member.zfill(3) == '000':
	mem = 'ensmean'
else:
	mem = member.zfill(3)
link = initTime + '/' + mem + '/' + iName
url = 'http://weather.ou.edu/~map/real_time_data/PECAN/PHI/' + link
url2 = 'http://weather.ou.edu/~map/real_time_data/PECAN/PHI/' + initTime + '/' + mem

# wait for image to show up and then write notification to server
notHere = True
counter = 0
while notHere:
	try:
		f = urllib2.urlopen(urllib2.Request(url))

		f2 = urllib2.urlopen(url2)
		lines = f2.readlines()
		f2.close()

		for ln in lines:
			if iName in ln:
				s = ln.split()
				imgTime = datetime.datetime(int(s[7][:4]), int(s[7][5:7]), int(s[7][8:10]), int(s[8][:2]), int(s[8][3:5]))
				if imgTime >= tNow:
					fh = open('/var/www/html/RadarQC/phi_new/bore/' + rTime + '.txt','w')
			                fh.write(link + '\n' + line)
			                fh.close()

			                os.system('chmod 777 /var/www/html/RadarQC/phi_new/bore/' + rTime + '.txt')

			                notHere = False
				break
		if notHere:
			print 'modTime less that current time, waiting for image to update...'
			time.sleep(1)
			counter += 1
	                if counter > 120:
	                        sys.exit()

	except:
		print 'image not there yet, waiting...'
		time.sleep(1)
		counter += 1
		if counter > 120:
			sys.exit()


'''
print 'cross-section coords...'
print lons[96][122], lats[96][122], lons[218][122], lats[218][122]
print lons[96][213], lats[96][213], lons[218][213], lats[218][213]
print lons[96][288], lats[96][288], lons[218][288], lats[218][288]
print lons[96][122], lats[96][122], lons[96][288], lats[96][288]
print lons[146][122], lats[146][122], lons[146][288], lats[146][288]
print lons[218][122], lats[218][122], lons[218][288], lats[218][288]
'''
