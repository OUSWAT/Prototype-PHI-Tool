import sys
from optparse import OptionParser
from shapely.geometry import Polygon
from shapely.geometry import Point
import shapefile

def getPHI(input_time,lon,lat):
	shpOrig = shapefile.Reader('shp/' + str(input_time) + '_threatOrig')
	shpExpand = shapefile.Reader('shp/' + str(input_time) + '_threatExpand')

	shapesOrig = shpOrig.shapes()
	shapesExpand = shpExpand.shapes()
	recordsOrig = shpOrig.records()
	recordsExpand = shpExpand.records()
	toaOrig = 9999999999
	todOrig = 0
	toaExpand = 9999999999
	todExpand = 0

	for i in range(len(shapesOrig)):
		polyOrig = Polygon(shapesOrig[i].points)
		polyExpand = Polygon(shapesExpand[i].points)
	
		if polyOrig.contains(Point([float(lon),float(lat)])):
			if int(recordsOrig[i][1]) < toaOrig:
				toaOrig = int(recordsOrig[i][1])
			if int(recordsOrig[i][1]) > todOrig:
	                        todOrig = int(recordsOrig[i][1])

		if polyExpand.contains(Point([float(lon),float(lat)])):
	                if int(recordsExpand[i][1]) < toaExpand:
	                        toaExpand = int(recordsExpand[i][1])
	                if int(recordsExpand[i][1]) > todExpand:
	                        todExpand = int(recordsExpand[i][1])

	return toaExpand, todExpand, toaOrig, todOrig
