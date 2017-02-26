#!/bin/bash

####
# Requirements:
# 1) Run as sudo
####

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

echo "Un-installing Omxplayer Remote - Client..."

echo "Stopping..."
service opr-client stop

echo "Removing from startup..."
update-rc.d -f opr-client remove

echo "Removing startup script..."
rm /etc/init.d/opr-client

echo "Removing logs..."
rm /var/log/opr/client.log

echo "Complete!"