import os, sys

fh = open('sseo.dat','r')
lines = fh.readlines()
fh.close()
i = 0
memberLast = ''

for line in lines:
	i += 1
	if i == 1:
		header = line
	else:
		s = line.split(',')
		if s[13] != memberLast:
			fh = open(s[13] +'.dat','w')
			fh.write(header)
			fh.close
			memberLast = s[13]
		fh = open(s[13] +'.dat','a')
		fh.write(line)
		fh.close()

