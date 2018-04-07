:: Purpose: Creates and initialised database for project

@ECHO OFF
SETLOCAL

:: variables
SET me=%~n0
SET db_name=sf2
SET PGUSER=postgres
SET input_path=%~dp0
SET "input_files=schema.sql recipients.sql common.sql orgs.sql users.sql forms.sql responses.sql init.sql"

:: Prompt arguments
SET /P db_name=Database name: (%db_name%)
SET /P PGUSER=Postgres user: (%PGUSER%)
SET /P PGPASSWORD=Postgres password:

:: Create database
ECHO:
ECHO %me%: Creating database %db_name%
psql -c "CREATE DATABASE %db_name%"
IF %ERRORLEVEL% NEQ 0 EXIT /B %ERRORLEVEL%
ECHO %me%: Database %db_name% created
ECHO:

:: Init database with .sql files
ECHO %me%: Begin database initialisation
CALL :init_db

:: Finish
ECHO %me%: Database ready
ENDLOCAL
ECHO ON
@EXIT /B 0

:: functions
:init_db
FOR %%f IN (%input_files%) DO (
  ECHO %me%: Processing %%f...
  psql %db_name% < %input_path%%%f

  IF %ERRORLEVEL% NEQ 0 (
    ECHO %me%: Error loading the file %%f
    EXIT /B %ERRORLEVEL%
  ) ELSE (
    ECHO %me%: Processing %%f complete
    ECHO:
  )
)