#!/bin/bash
# Start the background worker in a detached thread
npm run start:worker -w apps/worker &
# Start the primary web API in the main thread
npm run start:api -w apps/api