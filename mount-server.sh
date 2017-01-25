#!/bin/sh

sudo sshfs -o allow_other,default_permissions pi@pi-main.apt:/media/500gb /media/500gb
sudo sshfs -o allow_other,default_permissions pi@pi-main.apt:/media/1000gb /media/1000gb
