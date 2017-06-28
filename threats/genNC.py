import os, geojson, sys

archive = '20110427'
user = 'Karstens'

threats = os.listdir(archive)
path = os.getcwd()

for threat in threats:
	jsons = []
	fh = open(archive + '/' + threat)
	for line in fh:
		jsons.append(geojson.loads(line.rstrip(),object_hook=geojson.GeoJSON.to_instance))
	
	for gjson in jsons:
		cmd = 'python /localdata/radarqc/engine.py -i ' + path + '/' + archive + '/' + threat
		cmd += ' -t ' + str(gjson.properties['data']['issue']) + ' -u ' + user + ' -n'
		print cmd
		os.system(cmd)
		sys.exit()
