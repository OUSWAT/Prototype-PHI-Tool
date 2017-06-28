import os, sys
import shutil
import time

statusFile = '/var/www/html/RadarQC/phi_new/bore/format.txt'
statusFileLast = '/var/www/html/RadarQC/phi_new/bore/formatLast.txt'

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

        if status == statusLast:
                i += 1
                if i == 60:
                        print 'Time eclipsed, exiting...'
                        sys.exit()
                else:
                     	print 'Already processed format file, pausing... ' + str(i)
                        time.sleep(1)
        else:
             	cmd = 'python /var/www/html/RadarQC/phi_new/bore.py >& /var/www/html/RadarQC/phi_new/cronLogBore.txt &'
                print cmd
                os.system(cmd)
                shutil.copyfile(statusFile,statusFileLast)
                waiting = False

