import os, time, sys

files = os.listdir('.')
lastCheck = 1492702308
updates = []
push = True
ignore = ['2015052213_12.nc','getCases.php','getCoords.py','pushUpdates.py','write_threats.php','requestProbsOrig.php','writeEFP_Probs.php','writeValidProbs.php','cueKML.py','cronLogBore.txt','bore.py','cronLogCueBore.txt','special.js','getIDCount.php']

for f in files:
	mTime = os.path.getmtime(f)
	if mTime > lastCheck and not os.path.isdir(f) and f not in ignore:
		updates.append(f)

fileUpdates = ' '.join(updates)

cmd = 'scp ' + fileUpdates + ' chris.karstens@devlab12:/www/www.nssl.noaa.gov/projects/facets/phi/'
print cmd
if push:
	pass
	os.system(cmd)

cmd = 'scp ' + fileUpdates + ' phi@ewp10.hwt.nssl:/var/www/html/PHI/'
print cmd
if push:
	pass
	os.system(cmd)

cmd = 'scp ' + fileUpdates + ' phi@ewp9.hwt.nssl:/var/www/html/PHI/'
print cmd
if push:
	pass
	os.system(cmd)

cmd = 'scp ' + fileUpdates + ' phi@ewp11.hwt.nssl:/var/www/html/PHI/'
print cmd
if push:
	pass
        os.system(cmd)

cmd = 'scp ' + fileUpdates + ' phi@ewp12.hwt.nssl:/var/www/html/PHI/'
print cmd
if push:
	pass
        os.system(cmd)

cmd = 'scp ' + fileUpdates + ' phi@ewp13.hwt.nssl:/var/www/html/PHI/'
print cmd
if push:
	pass
        os.system(cmd)

cmd = 'scp ' + fileUpdates + ' phi@ewp14.hwt.nssl:/var/www/html/PHI/'
print cmd
if push:
	pass
        os.system(cmd)

