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
import urllib2
import urllib

# command line args
try:
    	hour = sys.argv[1]
except:
       	print 'Missing required command line arg [hour], exiting now.'
        sys.exit()

try:
    	fStart = int(sys.argv[2])
except:
       	print 'Missing required command line arg [fStart], exiting now.'
        sys.exit()

try:
    	init = sys.argv[3] + str(hour).zfill(2)
except:
	init_date = datetime.datetime.utcnow()
        init = str(init_date.year).zfill(4) + str(init_date.month).zfill(2) +  str(init_date.day).zfill(2) + str(hour).zfill(2)
        print 'no init arg given, using ' + init

# define vars
path = '/var/www/html/RadarQC/phi_new/realtime/efp'
path2 = '/var/www/html/RadarQC/phi_new/realtime/efp/hrrr'
iem_path = 'http://hrrr.agron.iastate.edu/data/hrrr'
remote_base_dir = '/localdata/radarqc/PHI/efp/images'
remote_base_dir2 = '/www/www.nssl.noaa.gov/projects/facets/phi/linked/efp/images'
#delta = datetime.timedelta(minutes=1) * 15
delta = datetime.timedelta(hours=1)
#now = datetime.datetime(int(init[:4]),int(init[4:6]),int(init[6:8]),int(init[8:10]))
now = datetime.datetime(int(init[:4]),int(init[4:6]),int(init[6:8]),int(hour))
now2 = datetime.datetime.utcnow()

# main loop
for fHour in range(fStart,16):
	# test fStart
        if fHour == (fStart + 2):
                cmd = 'python ' + path + '/plotter_hrrr.py ' + str(hour) + ' ' + str(fHour) + ' ' + init[:-2] + ' >& ' + path + '/out_hrrr.txt &'
                print cmd
                os.system(cmd)
                sys.exit()

	fname = 'hrrr.2d.' + init + '00f0' + str(fHour).zfill(2) + '.grib2'
	print fname

	# define more vars
	f_remote = iem_path + '/' + init + '00/' + fname
	f_local = os.path.join(path2, fname)
	fields = ['cape','mucape','cin','hlcy01','hlcy03','refl1km','refl','t2m','td2m','uwind','uphlcy']		
	not_here = True

	# get grib file
	while(not_here):
		try:
			ret = urllib2.urlopen(f_remote)
			if ret.code == 200:
				print 'Found ' + fname + ', pausing 30 seconds...'
				time.sleep(30)
				print 'Getting ' + fname
				urllib.urlretrieve(f_remote,f_local)
				print 'Received ' + fname
				not_here = False
			else:
				print 'sleeping 1 min.'
				time.sleep(60)
		except:
                       	tnow = datetime.datetime.utcnow()
			tDiff = abs(tnow - now).seconds
                        if tDiff > 18000:
                                print 'time threshold reached, continuing.'
                                not_here = False
                                #continue
				sys.exit()
                        else:
                             	print 'sleeping 1 min.'
				#raise
                                time.sleep(60)

	# extract grib inventory
	grbs = pygrib.open(f_local)
	fh = open(f_local + '.txt','w')
	for gb in grbs:
		fh.write(str(gb) + '\n')
	fh.close()
	grbs.close()

	grbs = pygrib.open(f_local)

	for m in range(0,1):
		for field in fields:

			# define color bar
			a = []
			if field == 'refl':
				levels = []
	        	        for i in range(5,80,5):
	        	                levels.append(float(i))
				r = [127,63,63,63,63,0,255,255,255,255,191,159,159,191,250]
				g = [255,191,63,127,255,191,223,159,63,25,25,63,63,127,250]
				b = [255,255,255,191,63,0,63,63,0,25,25,95,159,191,250]
				msgs = grbs.select(typeOfLevel='unknown')
				d = -1
				fh = open(f_local + '.txt','r')
	                        for gb in fh:
	                                if str(gb).split(':')[1] == '196':
	                                        d += 1
						if d == (m * 2):
							grib_num = int(str(gb).split(':')[0])
		                                        break
				fh.close()
			elif field == 'refl1km':
                                levels = []
                                for i in range(5,80,5):
                                        levels.append(float(i))
                                r = [127,63,63,63,63,0,255,255,255,255,191,159,159,191,250]
                                g = [255,191,63,127,255,191,223,159,63,25,25,63,63,127,250]
                                b = [255,255,255,191,63,0,63,63,0,25,25,95,159,191,250]
                                msgs = grbs.select(typeOfLevel='unknown')
                                d = -1
                                fh = open(f_local + '.txt','r')
                                for gb in fh:
                                        if str(gb).split(':')[1] == '195':
                                                d += 1
                                                if d == 1:
                                                        grib_num = int(str(gb).split(':')[0])
                                                        break
                                fh.close()
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
				msgs = grbs.select(typeOfLevel='heightAboveGroundLayer')
				j = 0
				for msg in msgs:
	                                if str(msg).split(':')[1] == 'Storm relative helicity':
						if field == 'hlcy03' and str(msg).split(':')[5] == 'levels 3000-0 m':
							grib_num = int(str(msg).split(':')[0])
	                                               	break					
						elif field == 'hlcy01' and str(msg).split(':')[5] == 'levels 1000-0 m':
		                                        grib_num = int(str(msg).split(':')[0])
		                                        break
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
				if field == 'cape':
					msgs = grbs.select(typeOfLevel='surface')
				elif field == 'mucape':
					msgs = grbs.select(typeOfLevel='pressureFromGroundLayer')
				#print len(levels), len(r), len(g), len(b)
	                        #sys.exit()
	                        for msg in msgs:
	                                if str(msg).split(':')[1] == 'Convective available potential energy':
	                                        grib_num = int(str(msg).split(':')[0])
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
				#print len(levels), len(r), len(g), len(b)
				#sys.exit()
				# 72:156:156 (instant):lambert:surface:level 0:fcst time 0 :from 201305130000
				msgs = grbs.select(typeOfLevel='surface')
				for msg in msgs:
					if str(msg).split(':')[1] == 'Convective inhibition':
			                        grib_num = int(str(msg).split(':')[0])
						break
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
				#print len(levels), len(r), len(g), len(b)
				#sys.exit()
				d = -1
				fh = open(f_local + '.txt','r')
	                        for gb in fh:       
	                                if str(gb).split(':')[1] == '2':
		                                d += 1
						if d == m:
						        grib_num = int(str(gb).split(':')[0])
		                                        break
				fh.close()
			elif field == 't2m':
				levels = []
				for i in range(-50,125,5):
					levels.append(float(i))
				r = [250,250,250,255,255,254,244,209,170,130,87,40,40,30,20,0,0,0,20,40,120,200,240,240,240,240,255,200,169,255,255,254,255,246,250,250]
				g = [250,250,250,220,180,140,100,85,40,20,0,0,80,120,160,180,200,230,230,220,240,240,240,190,130,80,40,0,4,56,103,140,105,201,250,250]
				b = [250,250,250,255,255,254,244,233,240,240,240,240,240,240,240,245,255,215,100,40,40,40,0,0,0,0,0,0,4,123,170,254,255,246,250,250]
				d = -1
				fh = open(f_local + '.txt','r')
                                for gb in fh:
                                        if str(gb).split(':')[1] == '2 metre temperature':
                                                d += 1
                                                if d == m:
                                                        grib_num = int(str(gb).split(':')[0])
                                                        break
				fh.close()
			elif field == 'td2m':
				levels = []
			        for i in range(-50,95,5):
			                levels.append(float(i))
				r = [68,81,91,101,108,121,130,140,150,160,170,180,195,210,225,240,0,20,40,120,200,240,240,240,240,225,200,175,250]
				g = [68,81,91,101,108,121,130,140,150,160,170,180,195,210,225,240,230,230,220,240,240,240,190,130,80,40,0,0,250]
				b = [68,81,91,101,108,121,130,140,150,160,170,180,195,210,225,240,215,100,40,40,20,0,0,0,0,0,0,0,250]
				d = -1
				fh = open(f_local + '.txt','r')
				for gb in fh:
                                        if str(gb).split(':')[1] == '2 metre dewpoint temperature':
                                                d += 1
                                                if d == m:
                                                        grib_num = int(str(gb).split(':')[0])
                                                        break
				fh.close()
			elif field == 'uwind':
				levels = []
			        for i in range(10,75,5):
			                levels.append(float(i))
				r = [220,180,20,30,87,170,210,235,255,255,255,250,250]
				g = [220,180,160,120,0,40,80,103,133,174,210,250,250]
				b = [240,240,240,240,240,240,240,235,255,255,255,250,250]
				d = -1
				d2 = -1
				fh = open(f_local + '.txt','r')
				for gb in fh:
                                        if str(gb).split(':')[1] == '10 metre U wind component':
                                                d += 1
                                                if d == m:
                                                        grib_num = int(str(gb).split(':')[0])
                                        elif str(gb).split(':')[1] == '10 metre V wind component':
                                                d2 += 1
                                                if d2 == m:
                                                        grib_num2 = int(str(gb).split(':')[0])
							print grib_num2
							break
				fh.close()
			print grib_num
	
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
			lons[-1][0]
		        lats[-1][-1]

			if field == 't2m' or field == 'td2m':
				vals = ((np.array(grb.values) - 273.15) * (9.0/5.0)) + 32
			elif field == 'uwind' or field == 'wind10m':
				field = 'wind10m'
				grb2 = grbs[grib_num2]
				#print len(grb2.values), len(grb2.values[0])
				#new_vals = np.append(grb2.values,[np.zeros(1700)],axis=0)	
				new_vals = grb2.values	
				#print len(grb.values), len(grb.values[0]), len(new_vals), len(new_vals[0])
				vals = np.sqrt((np.array(grb.values))**2 + (new_vals)**2) * 1.94384
			else:
				vals = grb.values
	
			# contruct basemap (4326) (3857)
			bmap = Basemap(llcrnrlat=21.52344793998239, llcrnrlon=-137.33642392884465, urcrnrlat=53.98773585601507, urcrnrlon=-58.695332401793024, resolution='l', epsg=3857)
			x, y = bmap(lons, lats)

			# generate figure
			fig = plt.figure()
			igrid = ImageGrid(fig, 111, nrows_ncols=(1,1))
			#igrid = ImageGrid(fig, 111, nrows_ncols=(1,1), cbar_location='bottom', cbar_mode='single') ###
			ax = igrid[0]; cax = igrid.cbar_axes[0]
			ax.axis('off')
			cbar = bmap.contourf(x, y, vals, ax=ax, levels=levels)

			#colorbar = cax.colorbar(cbar, ticks=levs[::3]) ###
			colorbar = cax.colorbar(cbar)

			# create server directory tree if necessary
			remote_dir = remote_base_dir + '/' + init
	                if not os.path.exists(remote_dir):
	                        os.mkdir(remote_dir)
	                remote_dir += '/hrrr_3km'
	                if not os.path.exists(remote_dir):
	                        os.mkdir(remote_dir)

			# save image to server
	                img_time = str(now.year).zfill(4) + str(now.month).zfill(2) + str(now.day).zfill(2) + str(now.hour).zfill(2) + '00'
	                image_name = 'hrrr_3km_' + field + '_' + init + 'f0' + str(fHour).zfill(2) + '.png'
	                local_img = remote_dir + '/' + image_name
	                plt.savefig(local_img, dpi=588, bbox_inches='tight', pad_inches=0, transparent=True)

			# send to nssl server
	                ssh = paramiko.SSHClient()
	                ssh.load_host_keys(os.path.expanduser(os.path.join('~','.ssh','known_hosts')))
	                ssh.connect('devlab12.protect.nssl',username='chris.karstens', password='9LickityChunk!')
	                sftp = ssh.open_sftp()
	                try:
	                    	sftp.mkdir(remote_base_dir2 + '/' + init)
	                except:
	                        print 'directory ' + init + ' already exists'
	                try:
	                    	sftp.mkdir(remote_base_dir2 + '/' + init + '/hrrr_3km')
	                except:
	                        print 'directory hrrr_3km already exists'
	                dest_file2 = remote_base_dir2 + '/' + init + '/hrrr_3km/' + image_name
	                sftp.put(local_img, dest_file2)
	                ssh.close()
	                sftp.close()

			print image_name
			#break

	# final clean-up
	now += delta
	grbs.close()
	os.system('rm ' + f_local)
        os.system('rm ' + f_local + '.txt')
