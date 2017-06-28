import matplotlib.pyplot as plt
import netCDF4
import numpy
from mpl_toolkits.basemap import Basemap
from mpl_toolkits.axes_grid1 import ImageGrid

levels = []
for i in range(101):
	levels.append(i)

nc = netCDF4.Dataset('test.nc')
lats = nc.variables['latitude'][:]
lons = nc.variables['longitude'][:]
probs = nc.variables['probability'][:]
probs = numpy.ma.masked_array(probs, mask=(probs == -99900.))
#probs = probs[::-1]
#probs = numpy.ma.masked_array(probs)
probs = probs.transpose()

print lats.shape, lons.shape, probs.shape

lats2 = []
for i in range(len(lats[0])):
        lats2.append(round(lats[0][i],2))
lons2 = []
for i in range(len(lons)-1,-1,-1):
        lons2.append(round(lons[i][0],2))
#lats2 = numpy.arange(lats[0][0],lats[0][-1],0.01)
#lons2 = numpy.arange(lons[0][0],lons[-1][-1],0.01)
print len(lons2),len(lats2)
print lats2
print lons2
x,y = numpy.meshgrid(lons2,lats2)

probs2 = []
for i in range(len(probs)):
	probs2.append([])
	for j in range(len(probs[i])):
		probs2[-1].append(probs[i][j])

#probs2 = probs2.reverse()
probs2 = numpy.array(probs2)
probs2 = probs2.transpose()

print x.shape, y.shape, probs2.shape
'''
fig = plt.figure()
#fig.set_size_inches(10, 4)
plt.contourf(lons,lats,probs,levels=levels,cmap=plt.cm.jet)
#plt.contourf(probs,levels=levels)
#plt.imshow(probs,interpolation='nearest',origin='lower')
plt.colorbar(shrink=0.455)
plt.axes().set_aspect('equal')
'''
fig = plt.figure()
igrid = ImageGrid(fig, 111, nrows_ncols=(1,1), cbar_location='bottom', cbar_mode='single')
ax = igrid[0]
cax = igrid.cbar_axes[0]
m = Basemap(llcrnrlat=33, llcrnrlon=-101, urcrnrlat=38, urcrnrlon=-94, resolution='l', ax=ax, epsg=4326)
#x,y = m(lons, lats)
cbar3 = m.contourf(x,y,probs,ax=ax,levels=levels)
#colorbar = cax.colorbar(cbar3)

plt.savefig('tester.png',bbox_inches='tight')
