#!/usr/bin/python
# coding=utf-8


import sys, getopt

import Image
import ImageDraw
import ImageFont
import time
import subprocess

from rgbmatrix import Adafruit_RGBmatrix

def main(argv):
	fontSize     = 20
	textColor    = 'rgb(255, 0, 0)'
	fontName     = "Arial"
	text         = unicode("ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ", "UTF-8")
	matrixWidth  = 64
	matrixHeight = 32
	delay        = 22
	repeats      = 1
	
	# Rows and chain length are both required parameters:
	matrix = Adafruit_RGBmatrix(matrixHeight, int(matrixWidth / 32))
	
	try:
		opts, args = getopt.getopt(argv,"t:s:c:f:d:r:")

	except getopt.GetoptError:
		print 'Upps!'
		sys.exit(2)
	
	for opt, arg in opts:
		if opt == '-t':
			text = unicode(arg, "UTF-8")
	
		elif opt == "-s":
			fontSize = int(arg)

		elif opt == "-r":
			repeats = int(arg)

		elif opt == "-f":
			fontName = arg

		elif opt == "-c":
			textColor = arg

		elif opt == "-d":
			delay = float(arg)


	
	#if (beep):
	#	omxplayer = subprocess.Popen(['omxplayer', '--no-keys', '--no-osd', 'audio/beep3.mp3'], stdout=subprocess.PIPE, stderr = None)
		
	font = ImageFont.truetype("fonts/" + fontName + ".ttf", fontSize)

	matrixImage = Image.new("RGB", (matrixWidth, matrixHeight)) 
	matrixDraw  = ImageDraw.Draw(matrixImage) 
	
	textWidth, textHeight = matrixDraw.textsize(text, font = font)
	
	textImage = Image.new("RGB", (textWidth + matrixWidth * 2, matrixHeight))
	textDraw = ImageDraw.Draw(textImage)
	
	textDraw.text((matrixWidth, matrixHeight/2-textHeight/2), text, fill = textColor, font = font)

	for index in range(0, repeats):
		for offset in range(0, textWidth + matrixWidth):
			clipImage = textImage.crop([offset, 0, offset + matrixWidth - 1, matrixHeight - 1])
			matrixImage.paste(clipImage, [0, 0, matrixWidth - 1, matrixHeight - 1])
			matrix.SetImage(matrixImage.im.id, 0, 0)
			time.sleep(0.001 * delay)
	

	matrix.Clear()	


main(sys.argv[1:])

	