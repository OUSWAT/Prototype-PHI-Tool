import os, sys, time
import pygrib
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.basemap import Basemap
from mpl_toolkits.axes_grid1 import ImageGrid
import datetime
import paramiko

# command line args
try:
	hour = sys.argv[1]
except:
	print 'Missing required command line arg [hour], exiting now.'
	sys.exit()

try:
    	member = sys.argv[2]
except:
       	print 'Missing required command line arg [member], exiting now.'
        sys.exit()

try:
    	fStart = int(sys.argv[3])
except:
       	print 'Missing required command line arg [fStart], exiting now.'
        sys.exit()

try:
	init = sys.argv[4] + str(hour).zfill(2)
except:
	init_date = datetime.datetime.utcnow()
	init = str(init_date.year).zfill(4) + str(init_date.month).zfill(2) +  str(init_date.day).zfill(2) + str(hour).zfill(2)
	print 'no init arg given, using ' + init

# define vars
path = '/var/www/html/RadarQC/phi_new/realtime/efp'
data_path = '/raid/efp/se2014/ftp/ukmet'
remote_base_dir = '/localdata/radarqc/PHI/efp/images'
remote_base_dir2 = '/www/www.nssl.noaa.gov/projects/facets/phi/linked/efp/images'
delta = datetime.timedelta(hours=1)
now = datetime.datetime(int(init[:4]),int(init[4:6]),int(init[6:8]),int(hour))
grbs = ''

# main loop
for fHour in range(fStart,46):
	# test fStart
	if fHour == (fStart + 1):
		cmd = 'python ' + path + '/plotter_ukmet.py ' + str(hour) + ' ' + member + ' ' + str(fHour) + ' ' + init[:-2] + ' >& ' + path + '/out_ukmet' + member + '.txt &'
		print cmd
		os.system(cmd)
		sys.exit()

	# define more vars
	#fname = member + '_' + init + 'f0' + str(fHour).zfill(2)
	# GM25.20140507.grib2
	if member == 'GM25':
		fname = member + '.' + init[:-2] + '.grib2'
                fname2 = member + '.' + init[:-2] + '.helicity.grib2'
	else:
		fname = 'US' + member + '.' + init + '.grib2'
		fname2 = 'US' + member + '.' + init[:-2] + '.helicity.grib2'
	f_remote = os.path.join(data_path, fname)
	f_remote2 = os.path.join(data_path, fname2)
	print f_remote
	fields = ['t2m','td2m','refl','refl1km','uwind','uphlcy']
	#fields = ['uphlcy']
	not_here = True
	count = 0
	gribs = []

	# get grib file
	while(not_here):
		try:
			size1 = os.stat(f_remote).st_size
			print 'Found ' + fname + ', pausing 10 seconds to check size...'
			if int(fHour) == 0:
				time.sleep(10)
			size2 = os.stat(f_remote).st_size
			if size1 == size2:
				print 'Ready: ' + fname
				not_here = False
		except:
			tnow = datetime.datetime.utcnow()
			tDiff = abs(tnow - now).seconds
			if tDiff > 25200:
				# if later than 2 am, start chugging through what's available
				print 'time threshold reached (' + str(tDiff) + '), continuing.'
				not_here = False
				continue
			else:
				print 'sleeping 1 min.'
	                        time.sleep(60)
	
	# open grib file, and start extracting data
	try:
		if grbs == '':
			grbs = pygrib.open(f_remote)
	except:
		continue

	for field in fields:

		# define color bar
		grib_num = ''
		a = []
		count += 1
		if field == 'refl':
			levels = []
        	        for i in range(5,80,5):
        	                levels.append(float(i))
			r = [127,63,63,63,63,0,255,255,255,255,191,159,159,191,250]
			g = [255,191,63,127,255,191,223,159,63,25,25,63,63,127,250]
			b = [255,255,255,191,63,0,63,63,0,25,25,95,159,191,250]
			key = '196'
			key1 = 'level 0'
		elif field == 'refl1km':
                       	levels = []
                       	for i in range(5,80,5):
                               	levels.append(float(i))
                        r = [127,63,63,63,63,0,255,255,255,255,191,159,159,191,250]
                        g = [255,191,63,127,255,191,223,159,63,25,25,63,63,127,250]
                        b = [255,255,255,191,63,0,63,63,0,25,25,95,159,191,250]
			key = '198'
                        key1 = 'level 0'
		elif field == 'hailcast':
	                levels = []
	                levels_in = [0.25,0.5,0.75,1.0,1.25,1.5,1.75,2.0,2.25,2.5,2.75,3.0,3.25,3.5,3.75,4.0,4.25,4.5,4.75,5.0,5.25,5.5,5.75,6.0]
	                for lev in levels_in:
	                       	levels.append(lev * 25.4)
	               	r = [0,0,0,0,0,0,255,191,255,255,191,127,255,255,255,255,255,255,255,255,255,255,255,255]
	                g = [255,128,0,127,191,255,255,191,153,0,0,0,51,255,255,255,255,255,255,255,255,255,255,255]
	                b = [255,255,255,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255]
		elif field == 'hlcy01' or field == 'hlcy03':
			levels = []
			r1 = [200,160,40,240,249,240,240,210,180,150,120,90,240,210,180,150,180,209,250]
			g1 = [200,240,240,220,190,160,130,0,0,0,0,0,0,0,0,0,180,209,250]
			b1 = [240,160,40,0,0,0,0,0,0,0,0,0,240,210,180,150,180,209,250]
			levs = [25,50,75,100,125,150,175,200,250,300,350,400,450,500,550,600,700,800,900]
			j = 0
			r = []
			g = []
			b = []
			for i in range(25,2500,25):
				if i in levs and i != 25:
                                        j += 1
                                levels.append(float(i))
                               	r.append(r1[j])
                               	g.append(g1[j])
                                b.append(b1[j])
		elif field == 'cape' or field == 'mucape':
			levels = []
			r1 = [255,220,200,180,160,130,100,70,40,240,240,240,240,240,210,180,150,120,90,240,210,180,150,180,210,250]
			g1 = [255,220,200,180,240,240,240,240,240,220,190,160,130,0,0,0,0,0,0,0,0,0,0,180,210,250]
			b1 = [255,240,240,240,160,130,100,70,40,0,0,0,0,0,0,0,0,0,0,240,210,180,150,180,210,250]
			levs = [0,250,500,750,1000,1250,1500,1750,2000,2250,2500,2750,3000,3500,4000,4500,5000,5500,6000,6500,7000,7500,8000,8500,9000]
			j = 0
			r = []
			g = []
			b = []
			for i in range(-250,15250,250):
				if i in levs:
					j += 1
				levels.append(float(i))
				r.append(r1[j])
				g.append(g1[j])
				b.append(b1[j])
				a.append(1.0)
			a[0] = 0.0
		elif field == 'cin':
			levels = []
			r1 = [160,180,200,220,255,245,223,205,138,106,68,25,26,0,20,0,0]
			g1 = [0,20,40,60,160,214,245,255,236,235,202,175,102,25,5,0,0]
			b1 = [0,20,40,60,69,104,141,162,174,225,255,255,240,212,175,121,121]
			r1.reverse()
			g1.reverse()
			b1.reverse()
			levs = [-900,-500,-400,-300,-200,-150,-100,-90,-80,-70,-60,-50,-40,-30,-20,-10]
			j = 0
			r = []
			g = []
			b = []
			for i in range(-960,0,10):
				if i in levs:
                                       	j += 1
				levels.append(float(i))
				r.append(r1[j])
				g.append(g1[j])
				b.append(b1[j])
		elif field == 'uphlcy':
			levels = []
			for i in range(20,360,10):
				levels.append(float(i))
			r = [127,0,0,16,30,0,0,0,255,255,255,255,255,139,139,139,139,139,205,205,205,205,205,238,238,238,238,238,255,255,255,255,255,255]
	                g = [255,205,139,78,144,178,238,238,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,64,64,64,64,127,127,127,127,127,127]
	                b = [0,0,0,139,255,238,238,238,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
			for i in range(360,1010,10):
				levels.append(float(i))
				r.append(255)
				g.append(127)
				b.append(0)
			key = '15'
			key1 = '15 (instant)'
		elif field == 't2m':
			levels = []
			for i in range(-50,125,5):
				levels.append(float(i))
			r = [250,250,250,255,255,254,244,209,170,130,87,40,40,30,20,0,0,0,20,40,120,200,240,240,240,240,255,200,169,255,255,254,255,246,250,250]
			g = [250,250,250,220,180,140,100,85,40,20,0,0,80,120,160,180,200,230,230,220,240,240,240,190,130,80,40,0,4,56,103,140,105,201,250,250]
			b = [250,250,250,255,255,254,244,233,240,240,240,240,240,240,240,245,255,215,100,40,40,40,0,0,0,0,0,0,4,123,170,254,255,246,250,250]
			key = 'Temperature'
			key1 = 'level 1 m'
		elif field == 'td2m':
			levels = []
		        for i in range(-50,95,5):
		                levels.append(float(i))
			r = [68,81,91,101,108,121,130,140,150,160,170,180,195,210,225,240,0,20,40,120,200,240,240,240,240,225,200,175,250]
			g = [68,81,91,101,108,121,130,140,150,160,170,180,195,210,225,240,230,230,220,240,240,240,190,130,80,40,0,0,250]
			b = [68,81,91,101,108,121,130,140,150,160,170,180,195,210,225,240,215,100,40,40,20,0,0,0,0,0,0,0,250]
			key = 'Dew point temperature'
			key1 = 'level 1 m'
		elif field == 'uwind':
			levels = []
		        for i in range(10,75,5):
		                levels.append(float(i))
			r = [220,180,20,30,87,170,210,235,255,255,255,250,250]
			g = [220,180,160,120,0,40,80,103,133,174,210,250,250]
			b = [240,240,240,240,240,240,240,235,255,255,255,250,250]
			key = 'U component of wind'
                        key1 = 'level 0 m'

		if count == 1:
			#fh = open('grbs_4km.txt','w')
			for grb in grbs:
				#fh.write(str(grb) + '\n')
				gribs.append(str(grb) + '\n')
			grbs.close()
			#fh.close()
			#sys.exit()
			grbs = pygrib.open(f_remote)
		if field == 'uphlcy' and member != 'GM25':
			grbs.close()
			gribs = []
			grbs = pygrib.open(f_remote2)
			for grb in grbs:
                                gribs.append(str(grb) + '\n')
                        grbs.close()
			grbs = pygrib.open(f_remote2)
			#fh = open('grbs_helicity.txt','w')
			#for grb in grbs:
			#	fh.write(str(grb) + '\n')
			#fh.close()
			#sys.exit()

		key2 = 'fcst time 10 mins'
		key3 = 'fcst time ' + str(fHour) + ' hrs'
		for grb in gribs:
			gr = str(grb).split(':')
			if key in gr and key1 in gr:
				if key2 in gr and fHour == 0 or key3 in gr:
					grib_num = int(gr[0])
					break
		if grib_num == '':
			#print field, key, key1, key2, key3, fHour
			continue


		if len(a) == 0:
			for i in range(0,len(r)):
				a.append(1.0)
		red = []
		green = []
		blue = []
		alpha = []
		for i in range(0,len(r)):
			if i == 0:
				i2 = i
			else:
				i2 = i - 1
			#lev = (levels[i] - levels[0]) / (levels[-1] - levels[0])
			red.append((float(i)/(len(r) - 1),float(r[i2])/255.0,float(r[i])/255.0))
			green.append((float(i)/(len(r) - 1),float(g[i2])/255.0,float(g[i])/255.0))
			blue.append((float(i)/(len(r) - 1),float(b[i2])/255.0,float(b[i])/255.0))
			alpha.append((float(i)/(len(r) - 1),a[i2],a[i]))
			#red.append((lev,float(r[i2])/255.0,float(r[i])/255.0))
	                #green.append((lev,float(g[i2])/255.0,float(g[i])/255.0))
	                #blue.append((lev,float(b[i2])/255.0,float(b[i])/255.0))
	
		custom_cmap = {'red':tuple(red),'green':tuple(green),'blue':tuple(blue),'alpha':tuple(alpha)}
		plt.register_cmap(name='custom_cmap', data=custom_cmap)
		plt.rcParams['image.cmap'] = 'custom_cmap'
	
		# extract grib file
		grb = grbs[grib_num]
		lats, lons = grb.latlons()
		if member == 'GM25':
			lons = lons - 360.0
		#lons[-1][0]
	        #lats[-1][-1]
	
		if field == 't2m' or field == 'td2m':
			vals = ((np.array(grb.values) - 273.15) * (9.0/5.0)) + 32
			grb2 = ''
			new_vals = ''
		elif field == 'uwind' or field == 'wind10m':
			field = 'wind10m'
			grb2 = grbs[grib_num + 1]
			print len(grb2.values), len(grb2.values[0])
			#new_vals = np.append(grb2.values,[np.zeros(1700)],axis=0)
			if member == '4':
				new_vals = np.resize(grb2.values,(700,1200))
			elif member == '2':
				new_vals = np.resize(grb2.values,(1200,1700))
			elif member == 'GM25':
				new_vals = np.resize(grb2.values,(129,200))
			#new_vals = grb2.values
			print len(grb.values), len(grb.values[0]), len(new_vals), len(new_vals[0])
			vals = np.sqrt((np.array(grb.values))**2 + (new_vals)**2) * 1.94384
		else:
			vals = grb.values
			grb2 = ''
                        new_vals = ''

		print lats.max(), lats.min(), lons.max(), lons.min()
	
		# contruct basemap (4326) (3857)
		m = Basemap(llcrnrlat=21.52344793998239, llcrnrlon=-137.33642392884465, urcrnrlat=53.98773585601507, urcrnrlon=-58.695332401793024, resolution='l', epsg=3857)
		x, y = m(lons, lats)

		# generate figure
		fig = plt.figure()
		igrid = ImageGrid(fig, 111, nrows_ncols=(1,1))
		#igrid = ImageGrid(fig, 111, nrows_ncols=(1,1), cbar_location='bottom', cbar_mode='single') ###
		ax = igrid[0]; cax = igrid.cbar_axes[0]
		ax.axis('off')
		cbar = m.contourf(x, y, vals, ax=ax, levels=levels)
	
		#colorbar = cax.colorbar(cbar, ticks=levs[::3]) ###
		#colorbar = cax.colorbar(cbar)

		remote_dir = remote_base_dir + '/' + init[:-2] + '00'
                if not os.path.exists(remote_dir):
                        os.mkdir(remote_dir)
		if member == 'GM25':
			remote_dir += '/ukmet_25km'
		else:
			remote_dir += '/ukmet_' + member + 'km'
                if not os.path.exists(remote_dir):
                        os.mkdir(remote_dir)

		# save image to server
		img_time = str(now.year).zfill(4) + str(now.month).zfill(2) + str(now.day).zfill(2) + str(now.hour).zfill(2) + '00'
		if member == 'GM25':
			image_name = 'ukmet_25km_' + field + '_' + init[:-2] + '00f0' + str(fHour).zfill(2) + '.png'
		else:
	                image_name = 'ukmet_' + member + 'km_' + field + '_' + init[:-2] + '00f0' + str(fHour).zfill(2) + '.png'
		local_img = remote_dir + '/' + image_name
		plt.savefig(local_img, dpi=588, bbox_inches='tight', pad_inches=0, transparent=True)

		#print image_name
		#continue

		# send to nssl server
		ssh = paramiko.SSHClient()
		ssh.load_host_keys(os.path.expanduser(os.path.join('~','.ssh','known_hosts')))
		ssh.connect('bigbang.protect.nssl',username='chris.karstens', password='9LickityChunk!')
		sftp = ssh.open_sftp()
		try:
		        sftp.mkdir(remote_base_dir2 + '/' + init[:-2] + '00')
		except:
		       	print 'directory ' + init[:-2] + '00 already exists'
		try:
			if member == 'GM25':
				sftp.mkdir(remote_base_dir2 + '/' + init[:-2] + '00/ukmet_25km')
			else:
	                        sftp.mkdir(remote_base_dir2 + '/' + init[:-2] + '00/ukmet_' + member + 'km')
                except:
                        print 'directory ukmet_' + member + 'km already exists'
		if member == 'GM25':
			dest_file2 = remote_base_dir2 + '/' + init[:-2] + '00/ukmet_25km/' + image_name
		else:
			dest_file2 = remote_base_dir2 + '/' + init[:-2] + '00/ukmet_' + member + 'km/' + image_name
		sftp.put(local_img, dest_file2)
		ssh.close()
		sftp.close()

		print image_name

	# final clean-up
	now += delta
	#grbs.close()
	#break

