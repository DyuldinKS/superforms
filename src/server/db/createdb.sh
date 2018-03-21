#!/bin/bash

DB_USER="postgres"
RESET_DB=false


usage() { 
	echo "Usage: $0 [-u <user>]" 1>&2;
	exit 1;
}


while getopts 'u:r' flag; do
  case "${flag}" in
    u) DB_USER=${OPTARG:-postgres} ;;
    *) error "Unexpected option ${flag}."; usage ;;
  esac
done


shift $(($OPTIND - 1))

readonly DB_NAME=${1:-sf2}
readonly INPUT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
readonly INPUT_FILES=(
	'schema.sql'
	'recipients.sql'
	'common.sql'
	'users.sql'
	'orgs.sql'
	'init.sql'
)


function init_db {
	for INIT_FILE_NAME in "$@"
	do
		echo \'$INIT_FILE_NAME\' is loading
		psql $DB_NAME < $INPUT_PATH/$INIT_FILE_NAME
	done
	echo \'$DB_NAME\' database has successfully initialized
}


createdb -U $DB_USER $DB_NAME
init_db ${INPUT_FILES[@]}