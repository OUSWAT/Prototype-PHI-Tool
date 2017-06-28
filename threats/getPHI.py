import pointVerify
import shapefile

dis = shapefile.Reader('20May/extractDamagePoints')
shapes = dis.shapes()

times = [1369077723, 1369078330, 1369078840, 1369079081, 1369079360, 1369079613, 1369079831, 1369080085, 1369080280, 1369080578, 1369080804, 1369081072, 1369081305, 1369081557, 1369081805]

for i in range(len(shapes)):
	lon = shapes[i].points[0][0]
	lat = shapes[i].points[0][1]
	t = []
	for j in range(len(times)):
		toa_e, tod_e, toa_o, tod_o = pointVerify.getPHI(times[j],lon,lat)
		t.append(str(toa_e))
		t.append(str(tod_e))
		t.append(str(toa_o))
		t.append(str(tod_o))
	fh = open('20May/phi.txt','a')
	fh.write(','.join(t) + '\n')
	fh.close()
	print ((i+1) / float(len(shapes))) * 100
