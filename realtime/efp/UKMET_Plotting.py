import os, sys, time
import pygrib
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.basemap import Basemap
from mpl_toolkits.axes_grid1 import ImageGrid
import datetime
#import paramiko

# command line args
try:
	km = sys.argv[1]
except:
	print 'Must give 2 or 4 as first command line arg, exiting now'
	sys.exit()
try:
	init = sys.argv[2]
except:
	init_date = datetime.datetime.utcnow()
	init = str(init_date.year).zfill(4) + str(init_date.month).zfill(2) +  str(init_date.day).zfill(2) + hour
	print 'no init arg given, using ' + init

# define vars
ukmet_path = 'grib/ukmet'
remote_base_dir = 'images'
remote_base_dir2 = '/www/www.nssl.noaa.gov/projects/facets/phi/linked'
case_init = init[:-2] + '00'
delta = datetime.timedelta(hours=1)
not_here = True
if km == '4' and init[-2:] == '00' and field_type == 'ALL' or km == '2' and init[-2:] == '03' and field_type == 'ALL':
	if km == '4':
		now_init = datetime.datetime(int(init[:4]),int(init[4:6]),int(init[6:8]),0)
	elif km == '2':
		now_init = datetime.datetime(int(init[:4]),int(init[4:6]),int(init[6:8]),3)
	fname = 'US' + str(km) + '.' + str(init) + '.grib2'
	f = os.path.join(path, fname)
	if km == '4':
		fields = ['t2m','td2m','uwind']
		letters = ['a','b','c','d','e']
	elif km == '2':
		fields = ['t2m','uwind']
		#fields = ['t2m']
                letters = ['a','b','c','d','e','f','g','h','i','j']

	# get big UKMET file
	parts = []
	parts_received = []
	grib_files = []
	for part in letters:
		parts.append(ukmet_path + '/US' + str(km) + '.' + str(init) + '.grib2_parta' + part + '.gz')
		grib_files.append(path + '/US' + str(km) + '.' + str(init) + '.grib2_parta' + part)
	
	while(not_here):
		for part in parts:
			try:
				if part not in parts_received:
					size1 = os.stat(part).st_size
					print 'Found ' + part + ', pausing 60 seconds to check size...'
					#time.sleep(60)
					size2 = os.stat(part).st_size
					if size1 == size2:
						os.system('cp ' + part + ' ' + path)
						os.system('gunzip ' + path + '/' + part.split('/')[-1])
						parts_received.append(part)
						print 'Received ' + part
						if len(parts_received) == 5 and km == '4' or len(parts_received) == 10 and km == '2':
							os.system('cat ' + ' '.join(grib_files) +  ' > ' + path + '/' + fname)
						        os.system('rm ' + ' '.join(grib_files))
							print 'Got all files needed, now on to make the images!'
							not_here = False
				else:
					continue
			except:
				print 'sleeping 5 min.'
				time.sleep(300)
	
elif field_type != 'ALL':
	if km == '4':
		now_init = datetime.datetime(int(init[:4]),int(init[4:6]),int(init[6:8]),0)
	elif km == '2':
		now_init = datetime.datetime(int(init[:4]),int(init[4:6]),int(init[6:8]),3)
	fname = 'US' + str(km) + '_' + field_type + '.' + str(init) + '.grib2'
	f = os.path.join(path, fname)
	if field_type == 'REFLECT':
		fields = ['refl']
	elif field_type == 'HELI':
		fields = ['uphlcy']
	else:
		print 'Unknown field type ' + field_type + ', exiting now...'
		sys.exit()

	# get data
	while(not_here):
		try:
			size1 = os.stat(ukmet_path + '/' + fname + '.gz').st_size
			print 'Found ' + ukmet_path + '/' + fname + '.gz, pausing 60 seconds to check size...'
			#time.sleep(60)
			size2 = os.stat(ukmet_path + '/' + fname + '.gz').st_size
			if size1 == size2:
				os.system('cp ' + ukmet_path + '/' + fname + '.gz ' + path)
				os.system('gunzip ' + path + '/' + fname + '.gz ')
				not_here = False
				print 'Got the ' + field_type + ' file, now on to make the images!'
		except:
			print 'no ' + field_type + ', sleeping 5 min.'
			time.sleep(300)

#ssh = paramiko.SSHClient()
#ssh.load_host_keys(os.path.expanduser(os.path.join('~','.ssh','known_hosts')))
#ssh.connect('lapwin-karstens.winstorm.nssl',username='cyg_server',password='TillyOscar11')
#sftp = ssh.open_sftp()

for field in fields:

	now = now_init

	# define color bar
	if field == 'refl':
		levels = []
                for i in range(5,80,5):
                        levels.append(float(i))
		r = [127,63,63,63,63,0,255,255,255,255,191,159,159,191,250]
		g = [255,191,63,127,255,191,223,159,63,25,25,63,63,127,250]
		b = [255,255,255,191,63,0,63,63,0,25,25,95,159,191,250]
		if km == '4':
			grib_nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49] # comp
			#grib_nums = [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98] # 1km
		elif km == '2':
			grib_nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46] #comp
			#grib_nums = [47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92] # 1km
	elif field == 'uphlcy':
		levels = []
		for i in range(20,360,10):
			levels.append(float(i))
		#levels = [20.0,30.0,40.0,50.0,60.0,70.0,80.0,100.0,150.0,200.0,250.0,300.0,350.0]
		#r = [127,0,0,16,30,0,0,255,139,205,238,255,250]
		#g = [255,205,139,78,144,178,238,0,0,0,64,127,250]
		#b = [0,0,0,139,255,238,238,0,0,0,0,0,250]
		r = [127,0,0,16,30,0,0,0,255,255,255,255,255,139,139,139,139,139,205,205,205,205,205,238,238,238,238,238,255,255,255,255,255,255]
                g = [255,205,139,78,144,178,238,238,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,64,64,64,64,127,127,127,127,127,127]
                b = [0,0,0,139,255,238,238,238,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
		for i in range(360,1010,10):
			levels.append(float(i))
			r.append(255)
			g.append(127)
			b.append(0)
		print len(levels), len(r), len(g), len(b)
		#sys.exit()
                if km == '4':
                        grib_nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49]
		elif km == '2':
                        grib_nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]
	elif field == 't2m':
		levels = []
		for i in range(-50,125,5):
			levels.append(float(i))
		r = [250,250,250,255,255,254,244,209,170,130,87,40,40,30,20,0,0,0,20,40,120,200,240,240,240,240,255,200,169,255,255,254,255,246,250,250]
		g = [250,250,250,220,180,140,100,85,40,20,0,0,80,120,160,180,200,230,230,220,240,240,240,190,130,80,40,0,4,56,103,140,105,201,250,250]
		b = [250,250,250,255,255,254,244,233,240,240,240,240,240,240,240,245,255,215,100,40,40,40,0,0,0,0,0,0,4,123,170,254,255,246,250,250]
		if km == '4':
			grib_nums = [28, 31, 55, 79, 109, 133, 157, 187, 211, 235, 265, 289, 313, 343, 367, 391, 421, 445, 469, 499, 523, 547, 577, 601, 625, 655, 679, 703, 733, 757, 781, 811, 835, 859, 889, 913, 937, 967, 991, 1015, 1045, 1069, 1093, 1123, 1147, 1171, 1201, 1225, 1249]
		elif km == '2':
			grib_nums = [28, 31, 53, 75, 106, 128, 150, 181, 203, 225, 256, 278, 300, 331, 353, 375, 406, 428, 450, 481, 503, 525, 556, 578, 600, 631, 653, 675, 706, 728, 750, 781, 803, 825, 856, 878, 900, 931, 953, 975, 1006, 1028, 1050, 1081, 1103, 1125]
	elif field == 'td2m':
		levels = []
	        for i in range(-50,95,5):
	                levels.append(float(i))
		r = [68,81,91,101,108,121,130,140,150,160,170,180,195,210,225,240,0,20,40,120,200,240,240,240,240,225,200,175,250]
		g = [68,81,91,101,108,121,130,140,150,160,170,180,195,210,225,240,230,230,220,240,240,240,190,130,80,40,0,0,250]
		b = [68,81,91,101,108,121,130,140,150,160,170,180,195,210,225,240,215,100,40,40,20,0,0,0,0,0,0,0,250]
		grib_nums = [32, 56, 80, 110, 134, 158, 188, 212, 236, 266, 290, 314, 344, 368, 392, 422, 446, 470, 500, 524, 548, 578, 602, 626, 656, 680, 704, 734, 758, 782, 812, 836, 860, 890, 914, 938, 968, 992, 1016, 1046, 1070, 1094, 1124, 1148, 1172, 1202, 1226, 1250]
		now += delta
	elif field == 'uwind':
		levels = []
	        for i in range(10,75,5):
	                levels.append(float(i))
		r = [220,180,20,30,87,170,210,235,255,255,255,250,250]
		g = [220,180,160,120,0,40,80,103,133,174,210,250,250]
		b = [240,240,240,240,240,240,240,235,255,255,255,250,250]
		if km == '4':
			grib_nums = [29, 53, 77, 107, 131, 155, 185, 209, 233, 263, 287, 311, 341, 365, 389, 419, 443, 467, 497, 521, 545, 575, 599, 623, 653, 677, 701, 731, 755, 779, 809, 833, 857, 887, 911, 935, 965, 989, 1013, 1043, 1067, 1091, 1121, 1145, 1169, 1199, 1223, 1247]
			grib_nums2 = [30, 54, 78, 108, 132, 156, 186, 210, 234, 264, 288, 312, 342, 366, 390, 420, 444, 468, 498, 522, 546, 576, 600, 624, 654, 678, 702, 732, 756, 780, 810, 834, 858, 888, 912, 936, 966, 990, 1014, 1044, 1068, 1092, 1122, 1146, 1170, 1200, 1224, 1248]
		elif km == '2':
			grib_nums = [29, 51, 73, 104, 126, 148, 179, 201, 223, 254, 276, 298, 329, 351, 373, 404, 426, 448, 479, 501, 523, 554, 576, 598, 629, 651, 673, 704, 726, 748, 779, 801, 823, 854, 876, 898, 929, 951, 973, 1004, 1026, 1048, 1079, 1101, 1123]
			grib_nums2 = [30, 52, 74, 105, 127, 149, 180, 202, 224, 255, 277, 299, 330, 352, 374, 405, 427, 449, 480, 502, 524, 555, 577, 599, 630, 652, 674, 705, 727, 749, 780, 802, 824, 855, 877, 899, 930, 952, 974, 1005, 1027, 1049, 1080, 1102, 1124]
		now += delta

	#print len(r), len(g), len(b)
	#sys.exit()

	red = []
	green = []
	blue = []
	for i in range(0,len(r)):
		if i == 0:
			i2 = i
		else:
			i2 = i - 1
		#lev = (levels[i] - levels[0]) / (levels[-1] - levels[0])
		red.append((float(i)/(len(r) - 1),float(r[i2])/255.0,float(r[i])/255.0))
		green.append((float(i)/(len(r) - 1),float(g[i2])/255.0,float(g[i])/255.0))
		blue.append((float(i)/(len(r) - 1),float(b[i2])/255.0,float(b[i])/255.0))
		#red.append((lev,float(r[i2])/255.0,float(r[i])/255.0))
                #green.append((lev,float(g[i2])/255.0,float(g[i])/255.0))
                #blue.append((lev,float(b[i2])/255.0,float(b[i])/255.0))

	custom_cmap = {'red':tuple(red),'green':tuple(green),'blue':tuple(blue)}
	plt.register_cmap(name='custom_cmap', data=custom_cmap)
	plt.rcParams['image.cmap'] = 'custom_cmap'

	grbs = pygrib.open(f)

	# loop
	k = -1
	for grib_num in grib_nums:
		k += 1
		grb = grbs[grib_num]
		if k == 0:
			lats, lons = grb.latlons()
			lons[-1][0]
		        lats[-1][-1]
		if field == 't2m' or field == 'td2m':
			vals = ((np.array(grb.values) - 273.15) * (9.0/5.0)) + 32
		elif field == 'uwind' or field == 'wind10m':
			field = 'wind10m'
			grb2 = grbs[grib_nums2[k]]
			print len(grb2.values), len(grb2.values[0])
			if km == '4':
				new_vals = np.append(grb2.values,[np.zeros(1200)],axis=0)
			elif km == '2':
				new_vals = np.append(grb2.values,[np.zeros(1700)],axis=0)
			#grb2.values = np.array(grb2.values)
			print len(grb.values), len(grb.values[0]), len(new_vals), len(new_vals[0])
			vals = np.sqrt((np.array(grb.values))**2 + (new_vals)**2) * 1.94384
		else:
			vals = grb.values
	
		# contruct basemap (4326) (3857)
		#m = Basemap(llcrnrlat=19.08, llcrnrlon=-135.13, urcrnrlat=53, urcrnrlon=-62.25, resolution='l', epsg=4326)
		m = Basemap(llcrnrlat=21.52344793998239, llcrnrlon=-137.33642392884465, urcrnrlat=53.98773585601507, urcrnrlon=-58.695332401793024, resolution='l', epsg=3857)
		x, y = m(lons, lats)

		# generate figure
		fig = plt.figure()
		igrid = ImageGrid(fig, 111, nrows_ncols=(1,1))
		#igrid = ImageGrid(fig, 111, nrows_ncols=(1,1), cbar_location='bottom', cbar_mode='single') ###
		ax = igrid[0]; cax = igrid.cbar_axes[0]
		ax.axis('off')
		#m.drawcoastlines(ax=ax)
		#m.drawcountries(ax=ax)
		#m.drawstates(ax=ax)
		#cbar = m.pcolormesh(x, y, vals, ax=ax)
		cbar = m.contourf(x, y, vals, ax=ax, levels=levels)

		#colorbar = cax.colorbar(cbar, ticks=[100,300,1000]) ###
		colorbar = cax.colorbar(cbar)

		# old code
		# t2m_old_nsslwrf_201305090100.png
		#img_time = str(now.year).zfill(4) + str(now.month).zfill(2) + str(now.day).zfill(2) + str(now.hour).zfill(2) + '00'
		#image_name = field + '_' + str(km) + 'km_ukmet_' + img_time + '.png'
		#local_img = path + '/images/' + image_name
		#remote_img = remote_dir + '/' + image_name
		#remote_wld = remote_dir	+ '/' +	image_name[:-3] + 'wld'
		#plt.savefig(local_img, dpi=588, bbox_inches='tight', pad_inches=0, transparent=True)
		#plt.savefig('/home/chris.karstens/Desktop/hwt/test.png')

		# upload processed file to server
	        #sftp.put(local_img, remote_img)
	        #sftp.put(wld, remote_wld)

		# delete image
                #os.system('rm ' + local_img)

		# create server directory tree if necessary
		remote_dir = remote_base_dir + '/' +  case_init
		if not os.path.exists(remote_dir):
			os.mkdir(remote_dir)
		remote_dir += '/ukmet_' + km + 'km/'
		if not os.path.exists(remote_dir):
                        os.mkdir(remote_dir)
		remote_dir += '/' + field
		if not os.path.exists(remote_dir):
                       	os.mkdir(remote_dir)

		# save image to server
		img_time = str(now.year).zfill(4) + str(now.month).zfill(2) + str(now.day).zfill(2) + str(now.hour).zfill(2) + '00'
                image_name = field + '_' + str(km) + 'km_ukmet_' + img_time + '.png'
		local_img = remote_dir + '/' + image_name
		plt.savefig(local_img, dpi=588, bbox_inches='tight', pad_inches=0, transparent=True)

		print image_name

		now += delta
		#break
	#break
#ssh.close()
#sftp.close()

# final clean-up
os.system('rm ' + path + '/' + fname)
