import time
stime = time.time()
import os, sys
import numpy as np
from shapely.geometry import Polygon
from shapely.geometry import Point
import matplotlib.pyplot as plt
from matplotlib import cm
#from scipy import interpolate
from scipy.interpolate import griddata

def dist2(v, w):
	return pow(v.x - w.x,2) + pow(v.y - w.y,2)

def distToSegmentSquared(p, v, w):
	l2 = dist2(v, w)
	if l2 == 0:
		return dist2(p, v)
  	t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2
	if (t < 0):
		return dist2(p, v)
	if (t > 1):
		return dist2(p, w)
	pNew = Point((v.x + t * (w.x - v.x), v.y + t * (w.y - v.y)))
  	return dist2(p, pNew)

def distToSegment(p, v, w):
	return pow(distToSegmentSquared(p, v, w),0.5)

def dist(p, poly):
	coords = poly.exterior.coords
	d = []
	for c in range(len(coords)):
		c2 = c + 1
		if c == len(coords) - 1:
			c2 = 0
		p1 = Point(coords[c])
		p2 = Point(coords[c2])
		d.append(distToSegment(p, p1, p2))
	return min(d)

f = 'east_final_DAY1_130520_202100Z.dat'
fh = open(f,'r')

snag = False
coords = {}
coords2 = {}
contours = []
for line in fh:
	line = line.rstrip()
	split = line.split()

	if line == '$$':
		snag = False

	if snag:
		coords[cVal][-1].append((float(split[1]),float(split[0])))
		coords2[cVal][-1]['x'].append(float(split[1]))
		coords2[cVal][-1]['y'].append(float(split[0]))
	if line[-1:] == '%':
		cVal = line.split('%')[0]
		if not coords.has_key(cVal):
			coords[cVal] = [[]]
			coords2[cVal] = [{'x':[],'y':[]}]
			contours.append(float(cVal))
		else:
			coords[cVal].append([])
			coords2[cVal].append({'x':[],'y':[]})
	elif len(split) > 0 and split[0] == 'LABEL:':
		snag = True
	elif len(split) > 0 and split[0] == 'SIGNIFICANT':
		break

'''
for c in reversed(sorted(contours)):
	print c
'''
cMax = max(contours)
cMin = min(contours)

polys = {}
for c in coords:
	polys[c] = []
	for i in range(len(coords[c])):
		polys[c].append(Polygon(coords[c][i]))

fig = plt.figure(0)
for c in coords2:
	for i in range(len(coords2[c])):
		plt.plot(coords2[c][i]['x'],coords2[c][i]['y'],'-',color='black')
plt.savefig('test3.png')

#xGrid = np.arange(-102,-88,0.1)
#yGrid = np.arange(30,42,0.1)
xGrid = np.arange(-99,-91,0.1)
yGrid = np.arange(33,39,0.1)
xGrid2 = np.arange(-99,-91,0.01)
yGrid2 = np.arange(33,39,0.01)

x,y = np.meshgrid(xGrid,yGrid)
x2,y2 = np.meshgrid(xGrid2,yGrid2)
vals = np.zeros((len(yGrid),len(xGrid)))


print len(x), len(x[0])
print len(y), len(y[0])
print len(vals), len(vals[0])

for i in range(len(yGrid)):
	for j in range(len(xGrid)):
		p = Point((xGrid[j],yGrid[i]))
		cLast = 0
		breakOut = False
		for c in reversed(sorted(contours)):
			if breakOut:
				break
			for k in range(len(polys[str(int(c))])):
				if polys[str(int(c))][k].contains(p) and c == cMax:
					vals[i][j] = c
					breakOut = True
					break
				elif polys[str(int(c))][k].contains(p) and cLast != 0:
					d1 = dist(p, polys[str(int(c))][k])
					idxs = []
					for k2 in range(len(polys[str(int(cLast))])):
						if polys[str(int(c))][k].contains(polys[str(int(cLast))][k2]):
							idxs.append(k2)
					if len(idxs) == 0:
						vals[i][j] = c
						breakOut = True
						break
					distances = []
					for k2 in range(len(idxs)):
						distances.append(dist(p, polys[str(int(cLast))][idxs[k2]]))
					d2 = min(distances)
					vals[i][j] = ((cLast - c) * (d1 / (d1 + d2))) + c
					breakOut = True
					break
			cLast = c

# interpolate to floater grid
points = []
values = []
for i in range(len(x)):
	for j in range(len(x[i])):
		points.append([x[i][j],y[i][j]])
		values.append(vals[i][j])
points = np.array(points)
values = np.array(values)
zNew = griddata(points, values, (x2, y2), method='linear')

levels = []
for i in range(0,451):
	levels.append(i/10.0)

fig = plt.figure(1)
plt.contourf(x2,y2,zNew,levels=levels,cmap=cm.Reds)
#plt.contourf(x,y,vals,levels=levels)
plt.colorbar()
plt.savefig('test2.png')

etime = time.time()
print 'Time elapsed: ' + str(etime - stime) + ' seconds'
