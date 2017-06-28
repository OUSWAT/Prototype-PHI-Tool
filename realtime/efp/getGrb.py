import pygrib

grbs = pygrib.open('grib/ukmet/US2.2014042900.grib2')

for grb in grbs:
	print grb
