#! /usr/bin/python3

# From: https://www.hackster.io/dataplicity/control-raspberry-pi-gpios-with-websockets-af3d0c

import os.path
import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import tornado.gen
####import RPi.GPIO as GPIO
import time
import subprocess
import json
import sys
import argparse
import asyncio


from Logger import studentLogger
from Logger import checkoutLogger

db_directory = "./dataLog/"

#from numpy import arange, mean
####import numpy as np

#from ledController import *
#from ledPixels import *
#from oledU import *
####from basic import *

####nPix = 20

# get number of pixels from the command line
# parser = argparse.ArgumentParser()
# parser.add_argument("-n", "--nPix", help = "Number of pixels")
# args = parser.parse_args()

# if args.nPix:
# 	try:
# 		nPix = int(args.nPix)
# 	except:
# 		print("using default (20) pixels: -nPix 20")

#Tornado Folder Paths
settings = dict(
	template_path = os.path.join(os.path.dirname(__file__), "templates"),
	static_path = os.path.join(os.path.dirname(__file__), "static")
	)

#pyPath = '/home/pi/rpi-led-strip/pyLED/'

#Tonado server port
PORT = 8060

class MainHandler(tornado.web.RequestHandler):
	def get(self):
		print ("[HTTP](MainHandler) User Connected.")
		self.render("index.html")

class AdminHandler(tornado.web.RequestHandler):
	def get(self):
		print ("[HTTP](AdminHandler) User Connected.")
		self.render("admin.html")

class DataHandler(tornado.web.RequestHandler):
	def get(self):
		print ("[HTTP](AdminHandler) User Connected.")
		self.render("data.html")

class WSHandler(tornado.websocket.WebSocketHandler):
	def open(self):
		print ('[WS] Connection was opened.')
		self.write_message('{"who": "server", "info": "on"}')
		#self.oled = oledU(128,32)
		self.stuLog = studentLogger(self, db_directory)


	async def on_message(self, message):
		print ('[WS] Incoming on_message:', message)
		try:
			msg = json.loads(message)

			if msg["what"] == "sign in":

				self.stuLog.logSignIn(msg['info'])

			if msg["what"] == "studentSignInHistory":

				self.stuLog.getAll(msg['studentId'], msg['what'])

			if msg['what'] == 'checkout':
				self.logger = checkoutLogger(self, db_directory)
				self.logger.checkout(msg['info'])

			if msg['what'] == 'selectStudent':
				self.stuLog.getAll(msg['studentId'], msg['what']);
				print('selecting student', msg['studentId'])

			if msg['what'] == 'selectItemData':
				logger = checkoutLogger(self, db_directory)
				logger.getAll(msg)

			if msg['what'] == 'lastStatus':
				logger = checkoutLogger(self, db_directory)
				logger.getLastStatus(msg)

			# if msg["what"] == "reboot":
			# 	subprocess.Popen('sleep 5 ; sudo reboot', shell=True)
			# 	main_loop.stop()


		except Exception as e:
			print(e)
			print("Exception: Error with data recieved by server")
			print(message)


	def on_close(self):
		print ('[WS] Connection was closed.')


application = tornado.web.Application([
  (r'/', MainHandler),
  (r'/ws', WSHandler),
  (r'/Admin', AdminHandler),
  ], **settings)


if __name__ == "__main__":
	try:
		http_server = tornado.httpserver.HTTPServer(application)
		http_server.listen(PORT)
		print("hello")
		main_loop = tornado.ioloop.IOLoop.instance()

		print ("Tornado Server started")

		# get ip address
		cmd = "hostname -I | cut -d\' \' -f1"
		IP = subprocess.check_output(cmd, shell=True).decode("utf-8")
		print('IP: '+ IP +":" + str(PORT))
		#oled.write('IP: '+ IP, 3)
		cmd = 'iwgetid | sed \'s/.*://\' | sed \'s/"//g\''
		wifi = subprocess.check_output(cmd, shell=True).decode("utf-8")
		#oled.write(wifi, 2)
		print(wifi)

		main_loop.start()




	except:
		print ("Exception triggered - Tornado Server stopped.")

#End of Program
