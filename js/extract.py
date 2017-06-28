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
    path = '/var/www/html/RadarQC/data/Chris.Karstens/20100519/processed/KTLX/Reflectivity/00.50/'
    files = ['20100519-220223.netcdf']

#------------------------------------------------------
    for field in files:
        
	# gunzip netcdf
	cmd = 'gunzip '	+ path + field	+ '.gz'
        os.system(cmd)

        # open the input files for reading
        # note the input files are NETCDF3_CLASSIC format
        nc_data = Dataset(path + field, 'r')
        
        # output variables                    
        clat = round(nc_data.Latitude,4)
        clon = round(nc_data.Longitude,4)
        
        lat_degInKm = 111.325
        lon_degInKm = N.cos(N.deg2rad(clat)) * lat_degInKm
        ncVar = nc_data.variables[var][:]
        ncAz = nc_data.variables['Azimuth'][:]
        
	fh = open('out.js','w')

        # output data
	a = []
	a2 = []
        for i in range(len(ncVar)):
	    data = []
            for j in range(len(ncVar[i]) - 1):
		if ncVar[i][j] != nc_data.MissingData:
		    data.append(str(ncVar[i][j]))
		else:
		    data.append('')
	    fh.write('az_' + str(ncAz[i]).replace('.','_') + ' = [')
	    fh.write(','.join(data))
	    fh.write('];\n')
	    a.append('\'az_' + str(ncAz[i]).replace('.','_') + '\'')
	    a2.append(str(ncAz[i]))
	fh.write('azimuths = [' + ','.join(a) + '];\n')
	fh.write('raw_azimuths = [' + ','.join(a2) + '];\n')
	fh.write('rangeToFirstGate = ' + str(nc_data.RangeToFirstGate) + ';\n')
	fh.write('gate = ' + str(nc_data.variables['GateWidth'][0]) + ';\n')
	fh.write('clat = ' + str(clat) + ';\n')
	fh.write('clon = ' + str(clon) + ';')

        # close files
	fh.close()
        nc_data.close()

	# gzip netcdf
        cmd = 'gzip ' + path + field
        os.system(cmd)    
    
#####################################################################################################       



#####################################################################################################
if __name__ == "__main__":
    W2toSHPmain()   

    
