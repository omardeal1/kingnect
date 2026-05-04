#!/bin/bash
# Kinec Server - Auto-restart wrapper
# This script keeps the server alive in the development environment
cd /home/z/my-project

LOG=/tmp/kinec-server.log

while true; do
  echo "[$(date)] Starting server..." >> $LOG
  node serve-next.js 2>&1 >> $LOG
  EXIT=$?
  echo "[$(date)] Server exited with code $EXIT, restarting in 2s..." >> $LOG
  sleep 2
done
