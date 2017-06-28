import os, sys
import shutil
import time

try:
	inThreat = sys.argv[1]
except:
	print 'No command line arg [inThreat] given, exiting...'
	sys.exit()

if inThreat == 'tornado':
       	statusFile = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusAzShear.txt'
        statusFileLast = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusAzShearLast.txt'
elif inThreat == 'severe':
        statusFile = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusProbSevere.txt'
        statusFileLast = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusProbSevereLast.txt'
elif inThreat == 'lightning':
	statusFile = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusLightning.txt'
        statusFileLast = '/var/www/html/RadarQC/phi_new/realtime/ewp/statusLightningLast.txt'


# get last status file data
fh = open(statusFileLast,'r')
statusLast = fh.readlines()[0].rstrip().split(',')
fh.close()

# check if latest grids have already been processed
i = 0
waiting = True
while waiting:

	# get current status file data
	fh = open(statusFile,'r')
	status = fh.readlines()[0].rstrip().split(',')
	fh.close()

	if int(status[1]) <= int(statusLast[1]):
		i += 1
		if i == 12:
			print 'Time eclipsed, exiting...'
			sys.exit()
		else:
		       	print 'Already processed grids for ' + status[2] + ' pausing...'
			time.sleep(5)
	else:
		cmd = 'python /var/www/html/RadarQC/phi_new/realtime/ewp/probGenTest.py -H ' + inThreat + ' >& /var/www/html/RadarQC/phi_new/realtime/ewp/cronLog' + inThreat.capitalize() + '.txt &'
		print cmd
		os.system(cmd)		
	        shutil.copyfile(statusFile,statusFileLast)
		waiting = False
