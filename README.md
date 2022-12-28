

# Installing this software: r
From your home directory clone the github repository.
```console
git clone https://github.com/lurbano/piTornado-basic.git
```


# Using virtual environments (if you're using them)

Install virtualenv 

```console
pip3 install virtualenv
```

Create an environment in the appropriate folder (mkspInventory)
```console
cd mkspInventory
python3 -m venv venv
. venv
```

activate virtual envrionment
```console
. venv/bin/activate
. venv
```

# Install tinydb
```console
sudo pip3 install tinydb
```


# Setting up Server
## Install Tornado Webserver

Setting up the tornado server used for Websockets
```console
sudo pip3 install tornado
```

### Starting server
Go to the folder *~/piTornado/webServer/* and run the command
```console
python3 server.py
```

### The webpage
The webpage will be at the computer's ip address (which should be printed to the screen when you start the server) and on port 8060 so if your ip address is 192.168.1.234, open up your browser and go to:
> http://192.168.1.234:8060

### Starting up on boot (Raspberry Pi)
** IMPORTANT **: the directory with the files needs to be in the pi home directory (e.g. */home/pi/rpi-led-strip*) with this setup. You can change this but be sure to put the full path to the commands. (From: https://learn.sparkfun.com/tutorials/how-to-run-a-raspberry-pi-program-on-startup)

EDIT */etc/rc.local* (the easy way)
```console
sudo nano /etc/rc.local
```

ADD THE LINE (before `exit 0` ).
```
/usr/bin/python3 /home/pi/piTornado-basic/webServer/server.py  2> /home/pi/rpi-led-strip/error.log &
```

Save and exit (Ctrl-S and Ctrl-X) and then restart the Pi from the command line:
```console
sudo reboot
```


### If you need to kill the server
* https://unix.stackexchange.com/questions/104821/how-to-terminate-a-background-process
```console
pgrep -a python3
```
* this will give you the process id, the name line of the command, and a number 'nnn'. Find the one that has 'python3 server.py'. To kill use:
```console
sudo kill nnn
```
