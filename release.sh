#!/usr/bin/env bash
set -e  # exit when any command fails
npm run build
npm version patch
git push
