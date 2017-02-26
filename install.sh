#!/bin/bash

####
# Requirements:
# 1) Run as sudo
# 2) Have a user called pi
# 3) Have node > 6 installed
# 4) Have npm installed
# 5) Have jq installed
####

if [ "$EUID" -ne 0 ]
then
	echo "Please run as root"
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

printf "Creating config file... "
if [ ! -f config/config.json ]
then
	sudo -u pi cp config/config.example.json config/config.json
	echo "Default config file created"
else
	echo "Config file already existed"
fi


echo "Creating theme file..."
sudo -u pi ./build-theme.sh

INIT_SCRIPT_TEMPLATE=`cat opr-client.template`
INIT_SCRIPT="${INIT_SCRIPT_TEMPLATE/\%INSTALL_PATH\%/$PWD}"

echo "Copy init script..."
echo "$INIT_SCRIPT" > "/etc/init.d/opr-client"
chmod +x /etc/init.d/opr-client

echo "Creating log file..."
mkdir -p /var/log/opr
touch /var/log/opr/client.log

echo "Registering at startup..."
update-rc.d opr-client defaults

echo "Installation complete!"