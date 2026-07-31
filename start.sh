#!/bin/bash
export NODE_OPTIONS="--dns-result-order=ipv4first"
# Start the background worker in a detached thread
npm run start -w apps/worker &
# Start the primary web API in the main thread
npm run start -w apps/api