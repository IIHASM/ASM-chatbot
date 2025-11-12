#!/bin/sh
npm run build
scp index.dyv.html suggero-app1-dev:/data/assistant/www/disfrutaverdura/index.html
cd dist
scp -r * suggero-app1-dev:/data/assistant/www/disfrutaverdura
