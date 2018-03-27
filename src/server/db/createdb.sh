#!/bin/bash

PGUSER="postgres"


usage() { 
	echo "Usage: $0 [-u <user>]" 1>&2;
	exit 1;
}


while getopts 'u:r' flag; do
  case "${flag}" in
    u) PGUSER=${OPTARG:-postgres} ;;
    *) error "Unexpected option ${flag}."; usage ;;
  esac
done


shift $(($OPTIND - 1))

readonly PGDATABASE=${1:-sf2}
readonly INPUT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
readonly INPUT_FILES=(
	'schema.sql'
	'recipients.sql'
	'common.sql'
	'users.sql'
	'orgs.sql'
	'forms.sql'
	'responses.sql'
	'init.sql'
)


function init_db {
	for INIT_FILE_NAME in "$@"
	do
		echo \'$INIT_FILE_NAME\' is loading
		psql -U $PGUSER $PGDATABASE < $INPUT_PATH/$INIT_FILE_NAME
	done
	echo \'$PGDATABASE\' database has successfully initialized
}


createdb -U $PGUSER $PGDATABASE
init_db ${INPUT_FILES[@]}