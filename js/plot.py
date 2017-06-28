#!/usr/bin/env python
#
#  W2toSHP.py
#  
#

import numpy as N
import sys
import time
#import pylab as P
from optparse import OptionParser
import glob
from netCDF4 import *
import os
import shapefile

#####################################################################################################
def W2toSHPmain():

    var = 'Reflectivity'
    files = ['/var/www/html/RadarQC/data/Chris.Karstens/20100519/processed/KTLX/Reflectivity/00.50/20100519-210347.netcdf']

#------------------------------------------------------
    for field in files:
        
	# gunzip netcdf
	cmd = 'gunzip '	+ field	+ '.gz'
        os.system(cmd)

        # open the input files for reading
        # note the input files are NETCDF3_CLASSIC format
        nc_data = Dataset(field, 'r')
        
        # output variables                    
        clat = round(nc_data.Latitude,4)
        clon = round(nc_data.Longitude,4)
        
        lat_degInKm = 111.325
        lon_degInKm = N.cos(N.deg2rad(clat)) * lat_degInKm
        ncVar = nc_data.variables[var][:]
        ncAz = nc_data.variables['Azimuth'][:]
        
	#print '{"type": "FeatureCollection","features": [{"geometry": {"type": "GeometryCollection","geometries": ['
	print 'data = ['

        # output data
        for i in range(len(ncVar)):
            theta1 = 90 - ncAz[i]
	    theta2 = 90 - ncAz[i - 1]
            x_rad1 = N.cos(N.deg2rad(theta1))
            y_rad1 = N.sin(N.deg2rad(theta1))
	    x_rad2 = N.cos(N.deg2rad(theta2))
            y_rad2 = N.sin(N.deg2rad(theta2))
            gate = nc_data.variables['GateWidth'][i]
            for j in range(len(ncVar[i]) - 1):
		if ncVar[i][j] != nc_data.MissingData:
		    r1 = nc_data.RangeToFirstGate + (j * gate)
                    r2 = nc_data.RangeToFirstGate + ((j + 1) * gate)
		    x1 = (r1 * x_rad1) / 1000.0
                    y1 = (r1 * y_rad1) / 1000.0
		    x2 = (r2 * x_rad1) / 1000.0
                    y2 = (r2 * y_rad1) / 1000.0
                    x3 = (r1 * x_rad2) / 1000.0
                    y3 = (r1 * y_rad2) / 1000.0
                    x4 = (r2 * x_rad2) / 1000.0
                    y4 = (r2 * y_rad2) / 1000.0
		    lat1 = str(round(clat + (y1 / lat_degInKm),5))
                    lon1 = str(round(clon + (x1 / lon_degInKm),5))
		    lat2 = str(round(clat + (y2 / lat_degInKm),5))
        	    lon2 = str(round(clon + (x2 / lon_degInKm),5))
		    lat3 = str(round(clat + (y3 / lat_degInKm),5))
                    lon3 = str(round(clon + (x3 / lon_degInKm),5))
                    lat4 = str(round(clat + (y4 / lat_degInKm),5))
                    lon4 = str(round(clon + (x4 / lon_degInKm),5))
		    #coords = '{"type": "Polygon","coordinates":[[[' + lon1 + ',' + lat1 + '],[' + lon2 + ',' + lat2 + '],[' + lon4 + ',' + lat4 + '],[' + lon3 + ',' + lat3 + '],[' + lon1 + ',' + lat1 + ']]]}'
		    coords = '[[' + lon1 + ',' + lat1 + '],[' + lon2 + ',' + lat2 + '],[' + lon4 + ',' + lat4 + '],[' + lon3 + ',' + lat3 + '],[' + lon1 + ',' + lat1 + ']]'
		    if j < (len(ncVar[i]) - 3):
			coords += ','
		    print coords

	#print ']},"type": "Feature","properties": {}}]}'
	print '];'

        # close files
        nc_data.close()

	# gzip netcdf
        cmd = 'gzip ' + field
        os.system(cmd)    
    
#####################################################################################################       



#####################################################################################################
if __name__ == "__main__":
    W2toSHPmain()   

    
