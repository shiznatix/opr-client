#!/bin/bash

if [ ! -f config/config.json ]
then
	echo "Config file must exist to build theme"
	exit 1
fi

cd "$(dirname "$0")"

function getColor {
	CMD="cat config/config.json | jq -r '.theme.$1'"
	echo `eval $CMD`
}

echo "Creating shared-elements HTML file..."
SHARED_STYLES=`cat public/elements/shared-styles.html.template`

COLOR=`getColor color100`
SHARED_STYLES="${SHARED_STYLES/\%OPR_COLOR_100\%/$COLOR}"
COLOR=`getColor color200`
SHARED_STYLES="${SHARED_STYLES/\%OPR_COLOR_200\%/$COLOR}"
COLOR=`getColor color300`
SHARED_STYLES="${SHARED_STYLES/\%OPR_COLOR_300\%/$COLOR}"
COLOR=`getColor color400`
SHARED_STYLES="${SHARED_STYLES/\%OPR_COLOR_400\%/$COLOR}"
COLOR=`getColor color500`
SHARED_STYLES="${SHARED_STYLES/\%OPR_COLOR_500\%/$COLOR}"
COLOR=`getColor color600`
SHARED_STYLES="${SHARED_STYLES/\%OPR_COLOR_600\%/$COLOR}"
COLOR=`getColor color700`
SHARED_STYLES="${SHARED_STYLES/\%OPR_COLOR_700\%/$COLOR}"
COLOR=`getColor color800`
SHARED_STYLES="${SHARED_STYLES/\%OPR_COLOR_800\%/$COLOR}"
COLOR=`getColor color900`
SHARED_STYLES="${SHARED_STYLES/\%OPR_COLOR_900\%/$COLOR}"

COLOR=`getColor secondaryColor200`
SHARED_STYLES="${SHARED_STYLES/\%OPR_COLOR_2_200\%/$COLOR}"
COLOR=`getColor secondaryColor800`
SHARED_STYLES="${SHARED_STYLES/\%OPR_COLOR_2_800\%/$COLOR}"
COLOR=`getColor secondaryColor900`
SHARED_STYLES="${SHARED_STYLES/\%OPR_COLOR_2_900\%/$COLOR}"

echo "$SHARED_STYLES" > "public/elements/shared-styles.html"

cd public

echo "Vulcanize..."
../node_modules/vulcanize/bin/vulcanize -p ./ elements/elements.html -o elements/elements.vulcanized.html

echo "Theme built!"

