import os, sys, time
import datetime

now = datetime.datetime.utcnow()
init = str(now.year) + str(now.month).zfill(2) + str(now.day).zfill(2)
#members = ["nssl_4km","nssl_4km_em_ctl","nssl_4km_em_n1","nssl_4km_em_p1","nssl_4km_nmb_ctl","nssl_4km_nmb_p1","nssl_4km_nmm_ctl","nssl_4km_nmm_n1","nssl_4km_nmm_p1"] # 2014
members = ["nssl_4km","nssl_4km_em_ctl","nssl_4km_GFS","nssl_4km_nmb_ctl","nssl_4km_nmb_p1","nssl_4km_nmm_ctl","nssl_4km_nmm_n1","nssl_4km_nmm_p1","nssl_4km_nmb_p2","nssl_4km_nmb_n1"] # 2015
data_path = '/raid/efp/se2014/ftp/nssl'
minCount = 0

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


path = '/var/www/html/RadarQC/phi_new/realtime/efp'

os.system('source /mnt/home/radarqc/.cshrc')
for i in range(1,37):
	notReady = True
	while notReady:
		count = 0
		for member in members:
			memberName = members2[member]
			fname = memberName + '_' + init + '00.f' + str(i).zfill(2)
		        f_remote = os.path.join(data_path, fname)
			if os.path.exists(f_remote):
				print f_remote
				count += 1
				if count == len(members):
					notReady = False
			else:
				print f_remote + ' not here, sleeping 1 min'
				minCount += 1
				if minCount > 420:
					sys.exit()
				time.sleep(60)

	cmd = 'python ' + path + '/plotter_nsslwrf_max.py 00 ' + str(i) + ' ' + init + ' >& ' + path + '/out_max.txt'
	print cmd
	os.system(cmd)
