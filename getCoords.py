import os, sys
import pyproj
from functools import partial
import shapely.ops as so
import shapely.geometry as sg

proj_google = partial(pyproj.transform,pyproj.Proj(init='epsg:4326'),pyproj.Proj(init='epsg:3857'))
proj_latlon = partial(pyproj.transform,pyproj.Proj(init='epsg:3857'),pyproj.Proj(init='epsg:4326'))

# OU Map Ensemble
p1 = sg.Point(-105.014,30.4876)
p2 = sg.Point(-92.3434,43.3899)

# OU Map 1 km
p1 = sg.Point(-104.148,31.4216)
p2 = sg.Point(-93.6116,42.4816)

p3 = so.transform(proj_google, p1)
p4 = so.transform(proj_google, p2)

print p3.x, ',', p3.y, ',', p4.x, ',', p4.y
