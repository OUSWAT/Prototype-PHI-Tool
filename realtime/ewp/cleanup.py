import os, sys, datetime

now1 = datetime.datetime.utcnow()
delta = datetime.timedelta(seconds=1)
now = now1 - (delta * (8 * 3600))
now2 = now1 - (delta * (16 * 3600))
path = '/var/www/html/RadarQC/phi_new/realtime/ewp/floater'
products = os.listdir(path)

for product in products:
	print product
	if product == 'allhazard':
		continue
	if product == 'azShearObjects' or product == 'probSevereObjects' or product == 'lightningObjects':
                dirs = ['objects','netcdf','binary','legacy']
                for dir in dirs:
                        images = os.listdir(path + '/' + product + '/' + dir)
                        for im in images:
				if dir == 'objects' or dir == 'legacy':
	                                d = im.split('_')[1].split('-')[0]
	                                t = im.split('_')[1].split('-')[1]
				else:
					d = im.split('_')[0].split('-')[0]
                                        t = im.split('_')[0].split('-')[1]
                                imTime = datetime.datetime(int(d[:4]), int(d[4:6]), int(d[6:8]), int(t[:2]), int(t[2:4]), int(t[4:6]))
                                if imTime < now:
                                        cmd = 'rm -rf ' + path + '/' + product + '/' + dir + '/' + im
                                        print cmd
                                        os.system(cmd)
	elif product == 'humanObjects':
		dirs = ['binary']
                for dir in dirs:
                        images = os.listdir(path + '/' + product + '/' + dir)
                        for im in images:
                              	d = im.split('_')[0].split('-')[0]
                                t = im.split('_')[0].split('-')[1]
                                imTime = datetime.datetime(int(d[:4]), int(d[4:6]), int(d[6:8]), int(t[:2]), int(t[2:4]), int(t[4:6]))
                                if imTime < now and imTime > now2:
                                        cmd = 'rm -rf ' + path + '/' + product + '/' + dir + '/' + im
                                        print cmd
                                        os.system(cmd)
		dirs = ['legacy']
                for dir in dirs:
                        images = os.listdir(path + '/' + product + '/' + dir)
                        for im in images:
                                d = im.split('_')[1].split('-')[0]
                                t = im.split('_')[1].split('-')[1]
                                imTime = datetime.datetime(int(d[:4]), int(d[4:6]), int(d[6:8]), int(t[:2]), int(t[2:4]), int(t[4:6]))
                                if imTime < now and imTime > now2:
                                        cmd = 'rm -rf ' + path + '/' + product + '/' + dir + '/' + im
                                        print cmd
                                        os.system(cmd)
	elif product == 'PHITable':
		scales = ['0','1','2','3']
		for scale in scales:
			kmeans = os.listdir(path + '/' + product + '/scale_' + scale)
			for im in kmeans:
				d = im.split('_')[0].split('-')[0]
	                        t = im.split('_')[0].split('-')[1]
	                        imTime = datetime.datetime(int(d[:4]), int(d[4:6]), int(d[6:8]), int(t[:2]), int(t[2:4]), int(t[4:6]))
	                        if imTime < now:
	                                cmd = 'rm ' + path + '/' + product + '/scale_' + scale + '/' + im
	                                print cmd
	                                os.system(cmd)
	else:
		images = os.listdir(path + '/' + product)
		for im in images:
			# ReflectivityQC_20140225-223335_03.50_KFCX.png
			d = im.split('_')[1].split('-')[0]
			t = im.split('_')[1].split('-')[1]
			imTime = datetime.datetime(int(d[:4]), int(d[4:6]), int(d[6:8]), int(t[:2]), int(t[2:4]), int(t[4:6]))
			if imTime < now:
				cmd = 'rm ' + path + '/' + product + '/' + im
				print cmd
				os.system(cmd)

path = path + '/lightningObjects/nldn'
files = os.listdir(path)
for f in files:
	s = f.split('.')
        fTime = datetime.datetime(int(s[2]),int(s[3]),int(s[4]),int(s[5]),int(s[6]))
        if fTime < now:
                cmd = 'rm -rf ' + path + '/' + f
                print cmd
                os.system(cmd)

path = '/var/www/html/RadarQC/phi_new/validProbs'
products = os.listdir(path)
for product in products:
	files = os.listdir(path + '/' + product)
	for f in files:
		d = f.split('_')[1].split('-')[0]
                t = f.split('_')[1].split('-')[1].split('.')[0]
                fTime = datetime.datetime(int(d[:4]), int(d[4:6]), int(d[6:8]), int(t[:2]), int(t[2:4]), int(t[4:6]))
		if fTime < now and fTime > now2:
                        cmd = 'rm -rf ' + path + '/' + product + '/' + f
                        print cmd
                        os.system(cmd)

path = '/var/www/html/RadarQC/phi_new/realtime/ewp/threats'
files = os.listdir(path)
for f in files:
	# Karstens-tornado_20150429-153100_000013.json
	d = f.split('_')[1].split('-')[0]
	t = f.split('_')[1].split('-')[1].split('.')[0]
	fTime = datetime.datetime(int(d[:4]), int(d[4:6]), int(d[6:8]), int(t[:2]), int(t[2:4]), int(t[4:6]))
	if fTime < now and fTime > now2:
		cmd = 'rm -rf ' + path + '/' + f
		print cmd
		os.system(cmd)

# Ryan's Wind probs
path = '/var/www/html/RadarQC/phi_new/realtime/ewp/floater/probSevereObjects/wind'
files = os.listdir(path)
for f in files:
        # severe_wind_2016-04-28-211639.csv
        d = f.split('_')[2].split('-')
        fTime = datetime.datetime(int(d[0]), int(d[1]), int(d[2]), int(d[3][:2]), int(d[3][2:4]), int(d[3][4:6]))
        if fTime < now:
                cmd = 'rm -rf ' + path + '/' + f
                print cmd
                os.system(cmd)
