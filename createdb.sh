#!/bin/bash
DB_NAME=${1:-new-sf}
INPUT_PATH="./src/server/db/"
INPUT_FILES=( 'schema.psql' 'triggers.psql' 'init.psql' )
TABLES=( 'states' 'scopes' 'actions' 'table_ids' )
DATA=()
OUTPUT_FILE="constTables.json"


function reset_db {
	dropdb $DB_NAME
	createdb $DB_NAME
	echo \'$DB_NAME\' database has successfully created
}

function init_db {
	for INIT_FILE_NAME in "$@"
	do
		psql $DB_NAME < $INPUT_PATH$INIT_FILE_NAME
	done
	echo \'$DB_NAME\' database has successfully initialized
}

function get_table_data_json_pairs {
	local VALUE COUNT=0
	for TABLE in "$@"
	do
		VALUE=`psql -d "$DB_NAME" -t -A -c "SELECT array_to_json(array_agg(t)) FROM $TABLE AS t"`
		DATA[((COUNT++))]="\"$TABLE\":$VALUE"
	done
}

function join_by {
	local IFS="$1"
	shift
	echo "$*"
}

reset_db
init_db ${INPUT_FILES[@]}
get_table_data_json_pairs ${TABLES[@]}
echo "{`join_by , ${DATA[@]}`}" > $INPUT_PATH$OUTPUT_FILE