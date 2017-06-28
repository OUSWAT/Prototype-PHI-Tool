# Author:	Dr. Chris Karstens (chris.karstens@noaa.gov)
# Versions:	Requires netCDF4 and shapefile (pyshp) modules
# Date: 	Creation: 4 December 2013
# About: 	Contains functions for reading wdssii netcdfs and various data conversions
# Updates:	18 March 2014:
#			- added function to convert gridded data to polygon shapefiles at specified levels

import netCDF4
import numpy as np
import datetime
from functools import partial
import pyproj
import shapely.geometry as sg
import shapely.affinity as sa
import shapely.ops as so
import geojson, math
#import shapefile
#import matplotlib.pyplot as plt
#from shapely.geometry import Polygon
#from scipy import ndimage
#from skimage.draw import circle
#from skimage.morphology import skeletonize

def readSparseGrid(inputFile, inputProduct):
    	nc_data = netCDF4.Dataset(inputFile) 
    	x_spacing = round(nc_data.LonGridSpacing,3)
    	y_spacing = round(nc_data.LatGridSpacing,3)
    	nc_var = nc_data.variables[inputProduct][:]
	pixel_count = nc_data.variables['pixel_count'][:]
    	lats = nc_data.Latitude - (y_spacing * np.arange(nc_data.dimensions['Lat'].__len__()))
	lons = nc_data.Longitude + (x_spacing * np.arange(nc_data.dimensions['Lon'].__len__()))
	x, y = np.meshgrid(lons, lats)
	pixel_x = nc_data.variables['pixel_x'][:]
        pixel_y = nc_data.variables['pixel_y'][:]
	vals = np.zeros((nc_data.dimensions['Lat'].__len__(),nc_data.dimensions['Lon'].__len__())) + nc_data.MissingData
	for i in range(len(nc_var)):
		if nc_var[i] > nc_data.MissingData:
			if pixel_count[i] == 1:
				vals[pixel_x[i]][pixel_y[i]] = nc_var[i]
			elif (pixel_y[i]+pixel_count[i]) < nc_data.dimensions['Lon'].__len__():
				for j in range(pixel_count[i]):
					vals[pixel_x[i]][pixel_y[i]+j] = nc_var[i]
			else:
				yPixel = pixel_x[i]
				j2 = -1
				for j in range(pixel_count[i]):
					j2 += 1
					if (pixel_y[i]+j2) == nc_data.dimensions['Lon'].__len__():
						yPixel += 1
						j2 = 0
					xPixel = pixel_y[i] + j2
					vals[yPixel][xPixel] = nc_var[i]

	nc_data.close()
    	return x,y,vals

def readLatLonGrid(inputFile, inputProduct):
	nc_data = netCDF4.Dataset(inputFile)
        x_spacing = round(nc_data.LonGridSpacing,3)
        y_spacing = round(nc_data.LatGridSpacing,3)
        vals = nc_data.variables[inputProduct][:]
	lats = nc_data.Latitude - (y_spacing * np.arange(nc_data.dimensions['Lat'].__len__()))
        lons = nc_data.Longitude + (x_spacing * np.arange(nc_data.dimensions['Lon'].__len__()))
        #x, y = np.meshgrid(lons, lats)
	return lons,lats,vals

def netcdf2point(inputFile, inputProduct, outputFile):
	nc_data = netCDF4.Dataset(inputFile)
	if nc_data.DataType == 'SparseLatLonGrid':
		nc_data.close()
		x,y,vals = readSparseGrid(inputFile, inputProduct)
	elif nc_data.DataType == 'LatLonGrid':
		nc_data.close()
		x,y,vals = readLatLonGrid(inputFile, inputProduct)
	mask = vals > -99900.
        lonArray = x[mask]
        latArray = y[mask]
        valArray = vals[mask]	
	w = shapefile.Writer(shapefile.POINT)
	w.field('VALUE')
	for i in range(len(valArray)):
		w.point(lonArray[i],latArray[i])
		w.record(valArray[i])
	w.save(outputFile)
	prj = open(outputFile + '.prj','w')
	prj.write('GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]]')
	prj.close()

def netcdf2polygon(inputFile, inputProduct, outputFile, levels):
	nc_data = netCDF4.Dataset(inputFile)
        if nc_data.DataType == 'SparseLatLonGrid':
                nc_data.close()
                x,y,vals = readSparseGrid(inputFile, inputProduct)
        elif nc_data.DataType == 'LatLonGrid':
                nc_data.close()
                x,y,vals = readLatLonGrid(inputFile, inputProduct)
	contours = plt.contour(x, y, vals, levels=levels)
	w = shapefile.Writer(shapefile.POLYGON)
	w.field('VALUE')
	for i in range(len(contours.levels)):
                level = contours.levels[i]
                paths = contours.collections[i].get_paths()
                for contour in paths:
                        coords = []
			poly = Polygon(contour.vertices)
                        for j in range(len(poly.exterior.coords)):
                                coords.append(poly.exterior.coords[j])
			w.poly(parts=[coords])
			w.record(level)
	w.save(outputFile)
	prj = open(outputFile + '.prj','w')
        prj.write('GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]]')
        prj.close()

def smoothField(inputData, threshold, roi, sigma):
	grid = np.zeros((len(inputData),len(inputData[0])))
	mask = np.where(inputData > threshold)
	for i in range(len(mask[0])):
		try:
			rr,cc = circle(mask[0][i],mask[1][i],roi)
			grid[rr,cc] = 1.0
			#if inputData[mask[0][i]][mask[1][i]] > grid[rr][cc].max():
			#	grid[rr][cc] = inputData[mask[0][i]][mask[1][i]]
			#grid[rr,cc] = inputData[rr,cc]
		except:
			continue
	skeleton = skeletonize(grid)
	grid = np.where(skeleton,[False],grid)
	newVals = ndimage.gaussian_filter(grid,sigma)
	return newVals
	#return grid

def radar2geojson(inputFile, inputProduct, tilt):
	nc_data = netCDF4.Dataset(inputFile)
        tilt_factor = np.cos(np.deg2rad(tilt))
	clat = round(nc_data.Latitude,4)
        clon = round(nc_data.Longitude,4)
	lat_degInKm = 111.325
        lon_degInKm = np.cos(np.deg2rad(clat)) * lat_degInKm
        ncVar = nc_data.variables[inputProduct][:]
        ncAz = nc_data.variables['Azimuth'][:]
	geojson = []
	for i in range(len(ncVar)):
            	theta = 90 - ncAz[i]
            	x_rad = N.cos(N.deg2rad(theta))
            	y_rad = N.sin(N.deg2rad(theta))
            	gate = nc_data.variables['GateWidth'][i]
		spacing = nc_data.variables['AzimuthalSpacing'][i]
            	for j in range(len(ncVar[i])):
                	if ncVar[i][j] != nc_data.MissingData:
                    		r1 = nc_data.RangeToFirstGate + (j * gate * tilt_factor) - (gate / 2.0) - (spacing / 2.0)
				r2 = nc_data.RangeToFirstGate + (j * gate * tilt_factor) + (gate / 2.0)	- (spacing / 2.0)
				r3 = nc_data.RangeToFirstGate + (j * gate * tilt_factor) + (gate / 2.0)	+ (spacing / 2.0)
				r4 = nc_data.RangeToFirstGate + (j * gate * tilt_factor) - (gate / 2.0) + (spacing / 2.0)
                    		x1 = (r1 * x_rad) / 1000.0
                    		y1 = (r1 * y_rad) / 1000.0
                                x2 = (r2 * x_rad) / 1000.0
                                y2 = (r2 * y_rad) / 1000.0
                                x3 = (r3 * x_rad) / 1000.0
                                y3 = (r3 * y_rad) / 1000.0
                                x4 = (r4 * x_rad) / 1000.0
                                y4 = (r4 * y_rad) / 1000.0
                    		lat1 = clat + (y1 / lat_degInKm)
                    		lon1 = clon + (x1 / lon_degInKm)
				lat2 = clat + (y2 / lat_degInKm)
                                lon2 = clon + (x2 / lon_degInKm)
				lat3 = clat + (y3 / lat_degInKm)
                                lon3 = clon + (x3 / lon_degInKm)
				lat4 = clat + (y4 / lat_degInKm)
                                lon4 = clon + (x4 / lon_degInKm)
				feat = '{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": '
				feat += '[[[' + str(lon1) + ',' + str(lat1) + '],[' + str(lon2) + ',' + str(lat2) + '],[' + str(lon3) + ',' + str(lat3) + '],[' + str(lon4) + ',' + str(lat4) + ']]]'
				feat += '}, "type": "Feature", "properties": {"color": "rgb(255,255,0)"}}'
				geojson.append(feat)
	nc_data.close()
	collection = ' ' + ','.join(geojson)
	return collection

def translateObject(gjson,start,end,addSecs):
	print addSecs
	addSecs = 0
	i = 0
	i2 = -1
	threats_projected = []
	threats_original = []
	times = []
	probs = []
	bkgd = 0.0
	start = datetime.datetime.utcfromtimestamp(start)
	end = datetime.datetime.utcfromtimestamp(end)
	now = datetime.datetime.utcfromtimestamp(int(gjson.properties['data']['valid_start']))
	delta = datetime.timedelta(minutes=1)

	proj_google = partial(pyproj.transform,pyproj.Proj(init='epsg:4326'),pyproj.Proj(init='epsg:3857'))
	proj_latlon = partial(pyproj.transform,pyproj.Proj(init='epsg:3857'),pyproj.Proj(init='epsg:4326'))
	threat = sg.asShape(gjson.geometry)
	threat = so.transform(proj_google,threat)
	threat_orig = sg.asShape(gjson.geometry)
	threat_orig = so.transform(proj_google,threat_orig)

	while now <= end:
		'''
		if i <= gjson.properties['data']['duration']:
	                if (i%5) == 0:
	                        if i != gjson.properties['data']['duration']:
	                                i2 += 1
	                                nextProb = gjson.properties['data']['probs'][0][i2+1]
	                                nextSpeed = gjson.properties['data']['speeds'][i2+1]
	                                nextDir = gjson.properties['data']['dir'][i2+1]
	                                nextSpd = gjson.properties['data']['spd'][i2+1]
	                                nextDirs = gjson.properties['data']['dirs'][i2+1]
	                        else:
	                                nextProb = bkgd

	                slp = (nextProb - gjson.properties['data']['probs'][0][i2]) / 5.0
	                y_int = gjson.properties['data']['probs'][0][i2] - ((i2 * 5.0) * slp)
	                probVal = ((i + (addSecs / 60.0)) * slp) + y_int
	                slp = (nextSpeed - gjson.properties['data']['speeds'][i2]) / 5.0
	                y_int = gjson.properties['data']['speeds'][i2] - ((i2 * 5.0) * slp)
	                speedVal = ((i + (addSecs / 60.0)) * slp) + y_int
	                slp = (nextSpd - gjson.properties['data']['spd'][i2]) / 5.0
	                y_int = gjson.properties['data']['spd'][i2] - ((i2 * 5.0) * slp)
	                spdUVal = ((i + (addSecs / 60.0)) * slp) + y_int
	                slp = (nextDir - gjson.properties['data']['dir'][i2]) / 5.0
	                y_int = gjson.properties['data']['dir'][i2] - ((i2 * 5.0) * slp)
	                dirUVal = ((i + (addSecs / 60.0)) * slp) + y_int
	                if nextDirs >= 270 and gjson.properties['data']['dirs'][i2] <= 90 or nextDirs >= 270 and gjson.properties['data']['dirs'][i2+1] <= 90:
	                        angDiff = (gjson.properties['data']['dirs'][i2] - nextDirs)
	                        if angDiff < 0:
	                                angDiff = (360 + angDiff) * -1.0
	                        else:
	                                angDiff = 360 - angDiff
	                        slp = angDiff / 5.0
	                        y_int = gjson.properties['data']['dirs'][i2] - ((i2 * 5.0) * slp)
	                        dirVal = ((i + (addSecs / 60.0)) * slp) + y_int
	                        if dirVal >= 360:
	                                dirVal = dirVal - 360
	                        elif dirVal < 0:
	                                dirVal = dirVal + 360
	                else:
	                        slp = (nextDirs - gjson.properties['data']['dirs'][i2]) / 5.0
	                        y_int = gjson.properties['data']['dirs'][i2] - ((i2 * 5.0) * slp)
	                        dirVal = ((i + (addSecs / 60.0)) * slp) + y_int
		'''
		if i <= gjson.properties['data']['duration']:
	                if (i%5) == 0:
	                        if i != gjson.properties['data']['duration']:
	                                i2 += 1
	                                nextProb = gjson.properties['data']['probs'][0][i2+1]
	                                nextSpeed = gjson.properties['data']['speeds'][i2+1]
	                                nextDir = gjson.properties['data']['dir'][i2+1]
	                                nextSpd = gjson.properties['data']['spd'][i2+1]
	                                nextDirs = gjson.properties['data']['dirs'][i2+1]
	                        else:
	                             	nextProb = bkgd
	
	                slp = (nextProb - gjson.properties['data']['probs'][0][i2]) / 5.0
	                y_int = gjson.properties['data']['probs'][0][i2] - ((i2 * 5.0) * slp)
	                probVal = ((i + (addSecs / 60.0)) * slp) + y_int
	                slp = (nextSpeed - gjson.properties['data']['speeds'][i2]) / 5.0
	                y_int = gjson.properties['data']['speeds'][i2] - ((i2 * 5.0) * slp)
	               	speedVal = ((i + (addSecs / 60.0)) * slp) + y_int
	                slp = (nextSpd - gjson.properties['data']['spd'][i2]) / 5.0
	                y_int = gjson.properties['data']['spd'][i2] - ((i2 * 5.0) * slp)
	               	spdUVal = ((i + (addSecs / 60.0)) * slp) + y_int
	                slp = (nextDir - gjson.properties['data']['dir'][i2]) / 5.0
	               	y_int = gjson.properties['data']['dir'][i2] - ((i2 * 5.0) * slp)
	               	dirUVal = ((i + (addSecs / 60.0)) * slp) + y_int
	               	if nextDirs >= 270 and gjson.properties['data']['dirs'][i2] <= 90 or nextDirs >= 270 and gjson.properties['data']['dirs'][i2+1] <= 90:
	                        angDiff = (gjson.properties['data']['dirs'][i2] - nextDirs)
	                        if angDiff < 0:
	                                angDiff = (360 + angDiff) * -1.0
	                       	else:
	                               	angDiff = 360 - angDiff
	                       	slp = angDiff / 5.0
	                       	y_int = gjson.properties['data']['dirs'][i2] - ((i2 * 5.0) * slp)
	                       	dirVal = ((i + (addSecs / 60.0)) * slp) + y_int
	                        if dirVal >= 360:
	                               	dirVal = dirVal - 360
	                        elif dirVal < 0:
	                                dirVal = dirVal + 360
	                else:
	                        slp = (nextDirs - gjson.properties['data']['dirs'][i2]) / 5.0
	                        y_int = gjson.properties['data']['dirs'][i2] - ((i2 * 5.0) * slp)
	                        dirVal = ((i + (addSecs / 60.0)) * slp) + y_int

		if i == 0:
	               	dirValLast = dirVal
	        else:
	             	dis = 60.0 * speedVal * 0.514444444
	                xDis = dis * math.cos(math.radians(270.0 - dirVal))
	                yDis = dis * math.sin(math.radians(270.0 - dirVal))
	                xDis2 = 60.0 * spdUVal * 0.514444444
	                yDis2 = dis * math.tan(math.radians(dirUVal))
	                threat = sa.translate(threat,xDis,yDis)
	                threat_orig = sa.translate(threat_orig,xDis,yDis)
	                rot = dirValLast - dirVal
	               	threat = sa.rotate(threat,rot,origin='centroid')
	                threat_orig = sa.rotate(threat_orig,rot,origin='centroid')
			rotVal = -1 * (270 - dirValLast)
			if rotVal > 0:
	                        rotVal = -1 * (360 - rotVal)
	               	threat = sa.rotate(threat,rotVal,origin='centroid')
	               	coords = threat.exterior.coords
	                center = threat.centroid
	                newCoords = []
	                for c in coords:
	                        dir = math.atan2(c[1] - center.y,c[0] - center.x)
	                       	x = math.cos(dir) * xDis2
	                        y = math.sin(dir) * yDis2
	                        p = sg.Point(c)
	                        c2 = sa.translate(p,x,y)
	                        newCoords.append((c2.x,c2.y))
	                threat = sg.Polygon(newCoords)
			rotVal = 270 - dirValLast
	                if rotVal < 0:
	                        rotVal = rotVal + 360
	                threat = sa.rotate(threat,rotVal,origin='centroid')
	                dirValLast = dirVal
		if now >= start:
                        threats_projected.append(so.transform(proj_latlon,threat))
                        threats_original.append(so.transform(proj_latlon,threat_orig))
                        times.append(now)
                        probs.append(probVal)
	        now += delta
		i += 1

	swath = so.cascaded_union(threats_projected)
	return swath
