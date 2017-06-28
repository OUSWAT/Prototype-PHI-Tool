import os, sys, json

f = 'cwas.json'
fh = open(f,'r')
lines = fh.readlines()
fh.close()

data = ''.join(lines)

json = json.loads(data)

for i in range(len(json['features'])):
	fh = open('cwas/' + json['features'][i]['properties']['cwa'] + '.json','w')
	fh.write(lines[i+1][:-3])
	fh.close()
