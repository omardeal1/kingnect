#!/bin/bash
# Kinec auto-restart server script
# Restarts the Node.js server if it crashes
cd /home/z/my-project
while true; do
  node --expose-gc serve-next.js 2>&1
  echo "[$(date)] Server crashed, restarting in 2s..."
  sleep 2
done
