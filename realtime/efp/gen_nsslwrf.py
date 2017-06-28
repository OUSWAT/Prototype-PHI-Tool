import os, sys
import datetime

now = datetime.datetime.utcnow()
init = str(now.year) + str(now.month).zfill(2) + str(now.day).zfill(2)
members = ["nssl_4km","nssl_4km_em_ctl","nssl_4km_em_n1","nssl_4km_em_p1","nssl_4km_GFS","nssl_4km_nmb_ctl","nssl_4km_nmb_p1","nssl_4km_nmm_ctl","nssl_4km_nmm_n1","nssl_4km_nmm_p1"]

os.system('source /mnt/home/radarqc/.cshrc')
for member in members:
	cmd = 'python plotter_nsslwrf.py 00 ' + member + ' 0 ' + init + ' >& out_' + member + '.txt &'
	print cmd
	os.system(cmd)
