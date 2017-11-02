#!/bin/bash

DB_USER="postgres"
RESET_DB=false


usage() { 
	echo "Usage: $0 [-u <user>] [-r]" 1>&2;
	exit 1;
}


while getopts 'u:r' flag; do
  case "${flag}" in
    u) DB_USER=${OPTARG:-postgres} ;;
    r) RESET_DB=true ;;
    *) error "Unexpected option ${flag}."; usage ;;
  esac
done


shift $(($OPTIND - 1))

readonly CWD=$(pwd)
readonly DB_NAME=${1:-sf2}
readonly INPUT_PATH="$CWD/src/server/db/"
readonly DB_SCHEMA="schema.psql"


[ "$RESET_DB" == true ] && 
	(dropdb -U $DB_USER $DB_NAME) && 
	(echo \'$DB_NAME\' database has been deleted by \'$DB_USER\' user)

createdb -U $DB_USER $DB_NAME
psql -U $DB_USER $DB_NAME < $INPUT_PATH$DB_SCHEMA &&
	(echo \'$DB_NAME\' database has been successfully created by \'$DB_USER\' user)