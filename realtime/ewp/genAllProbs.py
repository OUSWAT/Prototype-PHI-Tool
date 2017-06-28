import os

startTime = 1303938000
endTime = 1303943700 + (45 * 60)

for t in range(startTime,endTime,300):
	cmd = 'python probGen.py -a 20110427 -t ' + str(t)
	print cmd
	os.system(cmd)
	break
