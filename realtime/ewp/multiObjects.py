import os, sys
import numpy as np
from scipy import ndimage
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from skimage.draw import circle

levels = []
for i in range(101):
	levels.append(float(i) / 100.)

# create null arrays
a = np.zeros((40,40))
b = np.zeros((40,40))
c = np.zeros((40,40))

# fill arrays will dummy objects
rr,cc = circle(20,20,15)
a[rr,cc] = 1.0
rr1,cc1 = circle(14,14,4)
b[rr1,cc1] = 1.0
rr2,cc2 = circle(25,25,5)
c[rr2,cc2] = 1.0

mask = np.where(a == 0)

# compute normal edt on large object
a2 = ndimage.distance_transform_edt(a)
#a2 = a2 / a2.max()

# compute inverted edt on small objects
b2 = ndimage.distance_transform_edt(1-b)
b2[mask[0],mask[1]] = 0
#b2 = (b2.max() - b2) / b2.max()
#b2 = b2.max() - b2
b2[mask[0],mask[1]] = 0

c2 = ndimage.distance_transform_edt(1-c)
c2[mask[0],mask[1]] = 0
#c2 = (c2.max() - c2) / c2.max()
#c2 = c2.max() - c2
c2[mask[0],mask[1]] = 0

d = np.minimum(b2, c2)

#e = (a2 + d) / 2.
#e = e / e.max()
e = a2 / (a2 + d)
e[rr1,cc1] = 1.
e[rr2,cc2] = 1.

for row in e:
	print row

fig = plt.figure()
plt.contourf(e, levels=levels)
#plt.contourf(d)
plt.colorbar()
plt.savefig('test.png')
