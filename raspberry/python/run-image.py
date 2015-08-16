#!/usr/bin/python
# coding=utf-8


import sys, getopt, logging

import Image
import ImageDraw
import ImageFont
import time

from rgbmatrix import Adafruit_RGBmatrix


def main(argv):
	matrixWidth  = 64
	matrixHeight = 32
	fileName     = "adafruit.png"
	repeats      = 1
	delay        = 22
	pwm          = 8
	hold         = 0
	
	#logging.basicConfig(filename='example.log',level=logging.DEBUG)

	logger = logging.getLogger(__name__)	
	
	try:
		opts, args = getopt.getopt(argv,"f:p:d:h:r:")

	except getopt.GetoptError:
		logger.debug("Upps!")
		sys.exit(1)
	
	for opt, arg in opts:
		if opt == '-f':
			fileName = unicode(arg, "UTF-8")
		elif opt == '-p':
			pwm = int(arg)
		elif opt == '-d':
			delay = int(arg)
		elif opt == '-h':
			hold = int(arg)
		elif opt == '-r':
			repeats = int(arg)

	
	matrixImage = Image.new("RGB", (matrixWidth, matrixHeight)) 

	fp = open(fileName, "rb")
	bitmapImage = Image.open(fp)
	bitmapImage.load()
	fp.close()
	del fp

	bitmapWidth, bitmapHeight = bitmapImage.size

	if bitmapHeight != matrixHeight:
		bitmapImage.thumbnail((bitmapWidth, matrixHeight), Image.ANTIALIAS)
		bitmapWidth, bitmapHeight = bitmapImage.size

	matrix = Adafruit_RGBmatrix(matrixHeight, int(matrixWidth / 32))

	if (pwm > 0):
		matrix.SetPWMBits(pwm)
	
	tmpImage = Image.new("RGB", (matrixWidth * 2 + bitmapWidth, bitmapHeight), "black")

	if (bitmapImage.mode == "RGBA"):
		tmpImage.paste(bitmapImage, [matrixWidth, 0, matrixWidth + bitmapWidth, bitmapHeight], bitmapImage)
	else:
		tmpImage.paste(bitmapImage, [matrixWidth, 0, matrixWidth + bitmapWidth, bitmapHeight])

	for index in range(0, repeats):				
		for offset in range(0, bitmapWidth + matrixWidth):
			clipImage = tmpImage.crop([offset, 0, offset + matrixWidth, matrixHeight])
			matrixImage.paste(clipImage, [0, 0, matrixWidth, matrixHeight])
			matrix.SetImage(matrixImage.im.id, 0, 0)
			del clipImage
			time.sleep(0.001 * delay)
			
			if (hold > 0):
				if (offset == (bitmapWidth + matrixWidth) / 2):
					time.sleep(hold)
			
	matrix.Clear()	
		
	del bitmapImage
	del tmpImage
	del matrixImage
	del matrix
      
     

main(sys.argv[1:])

