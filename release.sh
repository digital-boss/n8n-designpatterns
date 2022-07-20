#!/usr/bin/env bash
set -e  # exit when any command fails
npm run build
git stash push -a dist
git checkout dist # git checkout --track origin/dist
git pull
rm -rf dist
git stash pop
npm version --no-commit-hooks --no-git-tag-version $1
git add --all
git commit -m "Release v$1"
git tag "v$1"
git push
git push origin v$1
git checkout main
