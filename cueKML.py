import os, sys
import datetime
import pytz

now = datetime.datetime.now(pytz.timezone('America/Denver'))
caseDir = now.strftime('%Y%m%d')

path = '/var/www/html/RadarQC/phi_new'
productsPath = path + '/realtime/efp/products/' + caseDir

try:
	products = sorted(os.listdir(productsPath))
except:
	print 'no products created yet, exiting...'
	sys.exit()

try:
	fh = open(productsPath + '/' + caseDir + '.txt','r')
	processed = fh.readlines()
	fh.close()
except:
	processed = []

for p in products:
	# morning_00_12_CI_Karstens-NSSL.json
	if p[-4:] == 'json' and p + '\n' not in processed:

		cmd = 'python /localdata/radarqc/EFPkml.py -i ' + productsPath + '/' + p + ' >& ' + productsPath + '/' + caseDir + '_cron.txt &'
		print cmd
		os.system(cmd)

		fh = open(productsPath + '/' + caseDir + '.txt','a')
		fh.write(p + '\n')
		fh.close()
