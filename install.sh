#!/bin/bash

####
# Requirements:
# 1) Run as sudo
# 2) Have a user called pi
# 3) Have node > 6 installed
# 4) Have npm installed
####

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

echo "Installing Omxplayer Remote - Client..."

cd "$(dirname "$0")"

echo "NPM install..."
sudo -u pi npm install
cd public
echo "Bower install..."
sudo -u pi ../node_modules/bower/bin/bower install --force-latest
cd ..

INIT_SCRIPT_TEMPLAT=`cat opr-client.template`
INIT_SCRIPT="${INIT_SCRIPT_TEMPLAT/\%INSTALL_PATH\%/$PWD}"

echo "Copy init script..."
echo "$INIT_SCRIPT" > "/etc/init.d/opr-client"
chmod +x /etc/init.d/opr-client

echo "Creating log file..."
mkdir -p /var/log/opr
touch /var/log/opr/client.log

echo "Registering at startup..."
update-rc.d opr-client defaults

echo "Installation complete!"