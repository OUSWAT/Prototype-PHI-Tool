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
    	fHour = int(sys.argv[2])
except:
       	print 'Missing required command line arg [fHour], exiting now.'
        sys.exit()

try:
	init = sys.argv[3] + str(hour).zfill(2)
except:
	init_date = datetime.datetime.utcnow()
	init = str(init_date.year).zfill(4) + str(init_date.month).zfill(2) +  str(init_date.day).zfill(2) + str(hour).zfill(2)
	print 'no init arg given, using ' + init

# define vars
path = '/var/www/html/RadarQC/phi_new/realtime/efp'
data_path = '/raid/efp/se2014/ftp/nssl'
remote_base_dir = '/localdata/radarqc/PHI/efp/images'
remote_base_dir2 = '/www/www.nssl.noaa.gov/projects/facets/phi/linked/efp/images'
delta = datetime.timedelta(hours=1)
now = datetime.datetime(int(init[:4]),int(init[4:6]),int(init[6:8]),int(hour))
#members = ["nssl_4km","nssl_4km_em_ctl","nssl_4km_em_n1","nssl_4km_em_p1","nssl_4km_nmb_ctl","nssl_4km_nmb_p1","nssl_4km_nmm_ctl","nssl_4km_nmm_n1","nssl_4km_nmm_p1"] # 2014
members = ["nssl_4km","nssl_4km_em_ctl","nssl_4km_GFS","nssl_4km_nmb_ctl","nssl_4km_nmb_p1","nssl_4km_nmm_ctl","nssl_4km_nmm_n1","nssl_4km_nmm_p1","nssl_4km_nmb_p2","nssl_4km_nmb_n1"] # 2015
fields = ['uphlcy','hailcast','t2m']
#fields = ['t2m']

members2 = {
	'nssl_4km':'wrf4nssl',
        'nssl_4km_em_ctl':'wrf4nssl_em_ctl',
        'nssl_4km_GFS':'wrf4nssl_GFS',
        'nssl_4km_nmb_ctl':'wrf4nssl_nmb_ctl',
        'nssl_4km_nmb_p1':'wrf4nssl_nmb_p1',
        'nssl_4km_nmm_ctl':'wrf4nssl_nmm_ctl',
        'nssl_4km_nmm_n1':'wrf4nssl_nmm_n1',
        'nssl_4km_nmm_p1':'wrf4nssl_nmm_p1',
        'nssl_4km_nmb_p2':'wrf4nssl_nmb_p2',
        'nssl_4km_nmb_n1':'wrf4nssl_nmb_n1'
}

# main loop
for field in fields:

	# define color bar
	a = []
	if field == 'uphlcy':
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
	elif field == 'hailcast':
		levels = []
		levels_in = [0.25,0.5,0.75,1.0,1.25,1.5,1.75,2.0,2.25,2.5,2.75,3.0,3.25,3.5,3.75,4.0,4.25,4.5,4.75,5.0,5.25,5.5,5.75,6.0]
		for lev in levels_in:
	                levels.append(lev * 25.4)
		r = [0,0,0,0,0,0,255,191,255,255,191,127,255,255,255,255,255,255,255,255,255,255,255,255]
	        g = [255,128,0,127,191,255,255,191,153,0,0,0,51,255,255,255,255,255,255,255,255,255,255,255]
	        b = [255,255,255,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255]
	elif field == 't2m':
                levels = []
                for i in range(-50,125,5):
                        levels.append(float(i))
                r = [250,250,250,255,255,254,244,209,170,130,87,40,40,30,20,0,0,0,20,40,120,200,240,240,240,240,255,200,169,255,255,254,255,246,250,250]
                g = [250,250,250,220,180,140,100,85,40,20,0,0,80,120,160,180,200,230,230,220,240,240,240,190,130,80,40,0,4,56,103,140,105,201,250,250]
                b = [250,250,250,255,255,254,244,233,240,240,240,240,240,240,240,245,255,215,100,40,40,40,0,0,0,0,0,0,4,123,170,254,255,246,250,250]

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
		red.append((float(i)/(len(r) - 1),float(r[i2])/255.0,float(r[i])/255.0))
		green.append((float(i)/(len(r) - 1),float(g[i2])/255.0,float(g[i])/255.0))
		blue.append((float(i)/(len(r) - 1),float(b[i2])/255.0,float(b[i])/255.0))
		alpha.append((float(i)/(len(r) - 1),a[i2],a[i]))
	
	custom_cmap = {'red':tuple(red),'green':tuple(green),'blue':tuple(blue),'alpha':tuple(alpha)}
	plt.register_cmap(name='custom_cmap', data=custom_cmap)
	plt.rcParams['image.cmap'] = 'custom_cmap'

	i = 0
	for member in members:

		# define more vars
		memberName = members2[member]
	        fname = memberName + '_' + init + '.f' + str(fHour).zfill(2)
	        f_remote = os.path.join(data_path, fname)

	        # open grib file, and start extracting data
	        try:
	            	grbs = pygrib.open(f_remote)
	        except:
	               	continue
	
		# extract grib file
		if field == 'uphlcy':
			msg = grbs.select(name='Diabatic heating by vertical diffusion gradient')[0]
	                grib_num = int(str(msg).split(':')[0])
		elif field == 'hailcast':
			if member == 'nssl_4km':
				#continue
				print 'hello'
			msg = grbs.select(name='Experimental product')[0]
                        grib_num = int(str(msg).split(':')[0])
		elif field == 't2m':
			msg = grbs.select(name='2 metre temperature')[0]
                        grib_num = int(str(msg).split(':')[0])

		grb = grbs[grib_num]
		i += 1
		if i == 1:
			lats, lons = grb.latlons()
			vals = grb.values
		else:
			vals = np.maximum(vals,grb.values)
		grb2 = ''
                new_vals = ''

	if field == 't2m':
		vals = ((vals - 273.15) * (9.0/5.0)) + 32
	print vals.max()	
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

	remote_dir = remote_base_dir + '/' + init
        if not os.path.exists(remote_dir):
                os.mkdir(remote_dir)
	remote_dir += '/max'
        if not os.path.exists(remote_dir):
                os.mkdir(remote_dir)

	# save image to server
	img_time = str(now.year).zfill(4) + str(now.month).zfill(2) + str(now.day).zfill(2) + str(now.hour).zfill(2) + '00'
        image_name = 'max_' + field + '_' + init + 'f0' + str(fHour).zfill(2) + '.png'
	local_img = remote_dir + '/' + image_name
	plt.savefig(local_img, dpi=588, bbox_inches='tight', pad_inches=0, transparent=True)

	# send to nssl server
        ssh = paramiko.SSHClient()
        ssh.load_host_keys(os.path.expanduser(os.path.join('~','.ssh','known_hosts')))
        ssh.connect('bigbang.protect.nssl',username='chris.karstens', password='9LickityChunk!')
        sftp = ssh.open_sftp()
       	try:
                sftp.mkdir(remote_base_dir2 + '/' + init)
       	except:
                print 'directory ' + init + ' already exists'
	try:
                sftp.mkdir(remote_base_dir2 + '/' + init + '/max')
        except:
                print 'directory max already exists'
        dest_file2 = remote_base_dir2 +	'/' + init + '/max/' + image_name
	print dest_file2
        sftp.put(local_img, dest_file2)
	ssh.close()
	sftp.close()

	print image_name

	# final clean-up
	#now += delta
	#grbs.close()
	#break

