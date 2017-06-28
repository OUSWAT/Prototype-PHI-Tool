import os

f = '/var/www/html/RadarQC/phi_dev/threats/20May/Tornado1_ID0_Karstens.txt'
fh = open(f,'r')
issues = []

for line in fh:
	split = line.split(',')
	for s in split:
		if s.split(':')[0] == '"issue"':
			issues.append(s.split(':')[1])
			#cmd = 'python threat2shp.py -i ' + f + ' -t ' + s.split(':')[1]
			#print cmd
			#os.system(cmd)
print issues
