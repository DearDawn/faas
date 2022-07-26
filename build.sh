#!/bin/bash

PROJECT_NAME=$1
PROJECT_PATH=$2

if [[ -z $PROJECT_NAME || ! -d $PROJECT_PATH ]]; then
  echo "params empty"
  exit 1
fi

echo $PROJECT_NAME $PROJECT_PATH

. /www/server/nvm/nvm.sh
# . ~/.nvm/nvm.sh

nvm use v16.10.0
if [ $? != 0 ]; then
  nvm install v16.10.0
fi

node -v
npm -v

echo "start install"
npm install --registry=https://registry.npmjs.org/
