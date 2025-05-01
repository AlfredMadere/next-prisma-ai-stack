#!/bin/bash

# Default values
DEFAULT_USER="postgres"
DEFAULT_SCHEMA="public"
DEFAULT_PORT=5432
DEFAULT_DB_NAME="mydb"

# Initialize variables with defaults
PG_USER="$DEFAULT_USER"
PG_SCHEMA="$DEFAULT_SCHEMA"
PG_PORT="$DEFAULT_PORT"
DB_PASSWORD=""
DB_NAME="$DEFAULT_DB_NAME"
POSTGRES_HOST="localhost" # Default host, can be overridden by .env
DATA_DIR="./pgdata"
LOG_FILE="$DATA_DIR/server.log"
DATABASE_URL=""

# Check if DATABASE_URL is already set in environment
if [ -n "$DATABASE_URL" ]; then
  echo "Found DATABASE_URL in environment variables."
  USE_ENV_URL=true
else
  USE_ENV_URL=false
  # Check if .env file exists and contains DATABASE_URL
  if [ -f .env ] && grep -q '^DATABASE_URL=' .env; then
    # Extract DATABASE_URL from .env file
    DATABASE_URL=$(grep '^DATABASE_URL=' .env | cut -d '=' -f2- | tr -d '"')
    if [ -n "$DATABASE_URL" ]; then
      echo "Found DATABASE_URL in .env file."
      USE_ENV_URL=true
    fi
  fi
fi

# Parse DATABASE_URL if it exists
if [ "$USE_ENV_URL" = true ] && [ -n "$DATABASE_URL" ]; then
  echo "Using existing DATABASE_URL: $DATABASE_URL"
  
  # Parse the URL to extract components
  # Format: postgresql://username:password@host:port/dbname?schema=schema
  
  # Extract username and password
  PG_USER=$(echo $DATABASE_URL | sed -n 's/^postgresql:\/\/\([^:]*\):.*/\1/p')
  DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/^postgresql:\/\/[^:]*:\([^@]*\)@.*/\1/p')
  
  # Extract host and port
  POSTGRES_HOST=$(echo $DATABASE_URL | sed -n 's/^postgresql:\/\/[^@]*@\([^:]*\):.*/\1/p')
  PG_PORT=$(echo $DATABASE_URL | sed -n 's/^postgresql:\/\/[^@]*@[^:]*:\([0-9]*\)\/.*/\1/p')
  
  # Extract database name and schema
  DB_NAME=$(echo $DATABASE_URL | sed -n 's/^postgresql:\/\/[^@]*@[^:]*:[0-9]*\/\([^?]*\).*/\1/p')
  PG_SCHEMA=$(echo $DATABASE_URL | sed -n 's/^.*schema=\([^&]*\).*/\1/p')
  
  # Set defaults if any component couldn't be parsed
  [ -z "$PG_USER" ] && PG_USER="$DEFAULT_USER"
  [ -z "$POSTGRES_HOST" ] && POSTGRES_HOST="localhost"
  [ -z "$PG_PORT" ] && PG_PORT="$DEFAULT_PORT"
  [ -z "$DB_NAME" ] && DB_NAME="$DEFAULT_DB_NAME"
  [ -z "$PG_SCHEMA" ] && PG_SCHEMA="$DEFAULT_SCHEMA"
  
  # Ensure we have a password
  if [ -z "$DB_PASSWORD" ]; then
    echo "Error: Could not extract password from DATABASE_URL."
    exit 1
  fi
fi

# Function to print usage
usage() {
  echo "Usage: $0 --db-password <password> [--user <user>] [--schema <schema>] [--port <port>] [--db-name <dbname>]"
  echo "  --db-password : Required. Password for the database superuser."
  echo "  --user        : Database superuser name (default: $DEFAULT_USER)"
  echo "  --schema      : Default schema (default: $DEFAULT_SCHEMA) - Note: This script doesn't actively use the schema argument yet."
  echo "  --port        : Port number for the database (default: $DEFAULT_PORT)"
  echo "  --db-name     : Name of the initial database to create (default: $DEFAULT_DB_NAME)"
  exit 1
}

# Only parse command-line arguments if we're not using an existing DATABASE_URL
if [ "$USE_ENV_URL" = false ]; then
  # Parse command-line arguments
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --user)
        PG_USER="$2"
        shift 2
        ;;
      --schema)
        PG_SCHEMA="$2"
        shift 2
        ;;
      --port)
        PG_PORT="$2"
        shift 2
        ;;
      --db-password)
        DB_PASSWORD="$2"
        shift 2
        ;;
      --db-name)
        DB_NAME="$2"
        shift 2
        ;;
      *)
        echo "Unknown option: $1"
        usage
        ;;
    esac
  done

  # Check if required db-password is provided when not using DATABASE_URL
  if [ -z "$DB_PASSWORD" ]; then
    echo "Error: --db-password is required when DATABASE_URL is not set."
    usage
  fi
fi

# Read .env file for additional variables if we're not using DATABASE_URL
if [ "$USE_ENV_URL" = false ] && [ -f .env ]; then
  # Use grep and sed for basic parsing, avoiding complex dependencies
  # Prioritize already set variables (from command line)
  ENV_USER=$(grep '^POSTGRES_USER=' .env | cut -d '=' -f2-)
  ENV_PASSWORD=$(grep '^POSTGRES_PASSWORD=' .env | cut -d '=' -f2-)
  ENV_HOST=$(grep '^POSTGRES_HOST=' .env | cut -d '=' -f2-)
  ENV_PORT=$(grep '^POSTGRES_PORT=' .env | cut -d '=' -f2-)

  # Only override if the variable wasn't set via command line
  if [[ "$PG_USER" == "$DEFAULT_USER" && -n "$ENV_USER" ]]; then PG_USER="$ENV_USER"; fi
  if [[ "$DB_PASSWORD" == "" && -n "$ENV_PASSWORD" ]]; then DB_PASSWORD="$ENV_PASSWORD"; fi
  if [[ "$POSTGRES_HOST" == "localhost" && -n "$ENV_HOST" ]]; then POSTGRES_HOST="$ENV_HOST"; fi
  if [[ "$PG_PORT" == "$DEFAULT_PORT" && -n "$ENV_PORT" ]]; then PG_PORT="$ENV_PORT"; fi
fi


echo "--- Configuration ---"
echo "User:       $PG_USER"
echo "Schema:     $PG_SCHEMA (Note: Schema is not actively used in init/start)"
echo "Port:       $PG_PORT"
echo "DB Name:    $DB_NAME"
echo "Host:       $POSTGRES_HOST"
echo "Data Dir:   $DATA_DIR"
echo "Log File:   $LOG_FILE"
echo "--------------------"

# Set PGPASSWORD environment variable to avoid password prompts
export PGPASSWORD="$DB_PASSWORD"
# If we're using an existing DATABASE_URL, we don't need to start a local PostgreSQL server
if [ "$USE_ENV_URL" = true ]; then
  echo "Using existing DATABASE_URL, skipping local PostgreSQL server setup."
  
  # Just verify the connection to the existing database
  echo "Verifying connection to existing database..."
  
  # Parse the DATABASE_URL to extract components for direct connection
  # Format: postgresql://username:password@host:port/dbname?schema=schema
  PG_USER=$(echo $DATABASE_URL | sed -n 's/^postgresql:\/\/\([^:]*\):.*/\1/p')
  DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/^postgresql:\/\/[^:]*:\([^@]*\)@.*/\1/p')
  POSTGRES_HOST=$(echo $DATABASE_URL | sed -n 's/^postgresql:\/\/[^@]*@\([^:]*\):.*/\1/p')
  PG_PORT=$(echo $DATABASE_URL | sed -n 's/^postgresql:\/\/[^@]*@[^:]*:\([0-9]*\)\/.*/\1/p')
  DB_NAME=$(echo $DATABASE_URL | sed -n 's/^postgresql:\/\/[^@]*@[^:]*:[0-9]*\/\([^?]*\).*/\1/p')
  
  # Use direct connection parameters instead of the full URL with schema
  if ! PGPASSWORD="$DB_PASSWORD" psql -h "$POSTGRES_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$DB_NAME" -c "\conninfo" > /dev/null 2>&1; then
    echo "Error: Could not connect to database. Check credentials and connection details."
    echo "Attempting to connect with: PGPASSWORD=<password> psql -h $POSTGRES_HOST -p $PG_PORT -U $PG_USER -d $DB_NAME"
    exit 1
  fi
  
  echo "Successfully connected to existing database using DATABASE_URL."
  DB_URL="$DATABASE_URL"
else
  # Only proceed with local PostgreSQL setup if we're not using an existing DATABASE_URL
  
  # Check if port is already in use
  if nc -z $POSTGRES_HOST $PG_PORT; then
    echo "Error: Port $PG_PORT on host $POSTGRES_HOST is already in use." >&2
    # Check if it's our own pg_ctl process
    if [ -f "$DATA_DIR/postmaster.pid" ]; then
      echo "Hint: A PostgreSQL server might already be running with data directory '$DATA_DIR'."
      echo "      Use './scripts/stop-dev-postgres.sh' to stop it."
    fi
    exit 1
  fi

  # Check if data directory exists
  if [ ! -d "$DATA_DIR" ]; then
    echo "Data directory '$DATA_DIR' not found. Initializing new database cluster..."
    mkdir -p "$DATA_DIR"
    if [ $? -ne 0 ]; then
      echo "Error: Failed to create data directory '$DATA_DIR'. Check permissions." >&2
      exit 1
    fi

    # Create a temporary password file for initdb
    PWFILE=$(mktemp)
    echo "$DB_PASSWORD" > "$PWFILE"
    if [ $? -ne 0 ]; then
      echo "Error: Failed to create temporary password file." >&2
      exit 1
    fi

    # Initialize the database cluster
    # Use --pwfile for security instead of command-line password
    initdb -D "$DATA_DIR" --username="$PG_USER" --pwfile="$PWFILE" --auth=scram-sha-256 --encoding=UTF8 --locale=C
    if [ $? -ne 0 ]; then
      echo "Error: Failed to initialize database cluster." >&2
      rm -f "$PWFILE"
      exit 1
    fi
    rm -f "$PWFILE" # Clean up the temporary password file

    # Configure the database
    # Set listen_addresses and port in postgresql.conf
    echo "listen_addresses = '*'" >> "$DATA_DIR/postgresql.conf"
    echo "port = $PG_PORT" >> "$DATA_DIR/postgresql.conf"
    # Optionally configure pg_hba.conf for the user if needed, default might be sufficient for local dev
    # Example: Allow password auth for the user from localhost
    # echo "host    all             $PG_USER        127.0.0.1/32            scram-sha-256" >> "$DATA_DIR/pg_hba.conf"
    # echo "host    all             $PG_USER        ::1/128                 scram-sha-256" >> "$DATA_DIR/pg_hba.conf"
    # Note: Default settings might already allow local connections.

    echo "Database cluster initialized successfully in '$DATA_DIR'."
  else
    echo "Data directory '$DATA_DIR' found. Attempting to start existing cluster..."
    # Ensure port/host in existing config matches requested, or warn/fail?
    CONFIG_PORT=$(grep '^port =' "$DATA_DIR/postgresql.conf" | awk '{print $3}')
    CONFIG_HOST=$(grep '^listen_addresses =' "$DATA_DIR/postgresql.conf" | awk -F\' '{print $2}')
    if [[ "$CONFIG_PORT" != "$PG_PORT" || "$CONFIG_HOST" != "$POSTGRES_HOST" ]]; then
        echo "Warning: Requested port ($PG_PORT) or host ($POSTGRES_HOST) differs from existing config (Port: $CONFIG_PORT, Host: $CONFIG_HOST)." >&2
        echo "         Starting with configured values: Port $CONFIG_PORT, Host $CONFIG_HOST." >&2
        # Update PG_PORT and POSTGRES_HOST to reflect reality for subsequent steps
        PG_PORT=$CONFIG_PORT
        POSTGRES_HOST=$CONFIG_HOST
    fi
  fi

  # Start the PostgreSQL server
  echo "Starting PostgreSQL server..."
  pg_ctl -D "$DATA_DIR" -l "$LOG_FILE" start
  if [ $? -ne 0 ]; then
    echo "Error: Failed to start PostgreSQL server. Check log file '$LOG_FILE'." >&2
    exit 1
  fi

  # Wait a moment for the server to start
  echo "Waiting for server to become available..."
  MAX_WAIT=15 # seconds
  WAIT_COUNT=0
  while ! pg_isready -h $POSTGRES_HOST -p $PG_PORT -q -U $PG_USER -d postgres;
  do
      sleep 1
      ((WAIT_COUNT++))
      if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
          echo "Error: Server did not become ready within $MAX_WAIT seconds. Check log file '$LOG_FILE'." >&2
          pg_ctl -D "$DATA_DIR" status # Show status before exiting
          exit 1
      fi
  done

  echo "PostgreSQL server started successfully on $POSTGRES_HOST:$PG_PORT."

  # Check if the default database needs to be created
  # Connect to the default 'postgres' maintenance database to check
  DB_EXISTS=$(psql -h $POSTGRES_HOST -p $PG_PORT -U $PG_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

  if [ "$DB_EXISTS" != '1' ]; then
    echo "Database '$DB_NAME' does not exist. Creating it..."
    createdb -h $POSTGRES_HOST -p $PG_PORT -U $PG_USER "$DB_NAME"
    if [ $? -ne 0 ]; then
      echo "Error: Failed to create database '$DB_NAME'." >&2
      # Consider stopping the server if db creation is critical
      # pg_ctl -D "$DATA_DIR" stop
      exit 1
    fi
    echo "Database '$DB_NAME' created successfully."
  else
    echo "Database '$DB_NAME' already exists."
  fi
  
  # Create the DATABASE_URL from components
  DB_URL="postgresql://${PG_USER}:${DB_PASSWORD}@${POSTGRES_HOST}:${PG_PORT}/${DB_NAME}?schema=${PG_SCHEMA}"
  # Export for current session
  export DATABASE_URL="$DB_URL"
  echo "Created new DATABASE_URL: $DB_URL"
fi

# Verify database connection with the DATABASE_URL (if not already verified for existing URL)
if [ "$USE_ENV_URL" = false ]; then
  echo "Verifying database connection with DATABASE_URL..."
  
  # Extract components from DB_URL for direct connection
  echo "Attempting direct connection to verify database access..."
  if PGPASSWORD="$DB_PASSWORD" psql -h "$POSTGRES_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$DB_NAME" -c "\\conninfo"; then
    echo "Database connection successful!"
  else
    echo "Error: Could not connect to database. Check credentials and connection details."
    echo "You can try connecting manually with: PGPASSWORD=<password> psql -h $POSTGRES_HOST -p $PG_PORT -U $PG_USER -d $DB_NAME"
    
    # Check pg_hba.conf for connection settings
    echo "\nChecking PostgreSQL connection settings..."
    if [ -f "$DATA_DIR/pg_hba.conf" ]; then
      echo "Current pg_hba.conf settings:"
      grep -v "^#" "$DATA_DIR/pg_hba.conf" | grep -v "^$"
      
      # Add more permissive settings if needed
      echo "\nAdding more permissive connection settings..."
      echo "host    all             $PG_USER        127.0.0.1/32            md5" >> "$DATA_DIR/pg_hba.conf"
      echo "host    all             $PG_USER        ::1/128                 md5" >> "$DATA_DIR/pg_hba.conf"
      echo "host    all             all             127.0.0.1/32            md5" >> "$DATA_DIR/pg_hba.conf"
      echo "host    all             all             ::1/128                 md5" >> "$DATA_DIR/pg_hba.conf"
      
      # Reload PostgreSQL configuration
      echo "Reloading PostgreSQL configuration..."
      pg_ctl -D "$DATA_DIR" reload
      
      # Try connection again
      echo "Trying connection again..."
      if PGPASSWORD="$DB_PASSWORD" psql -h "$POSTGRES_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$DB_NAME" -c "\\conninfo"; then
        echo "Database connection successful after configuration update!"
      else
        echo "Still unable to connect. You may need to manually configure PostgreSQL."
        exit 1
      fi
    else
      echo "Could not find pg_hba.conf file."
      exit 1
    fi
  fi
fi

# Only update .env file if we created a new DATABASE_URL
if [ "$USE_ENV_URL" = false ]; then
    # Update .env file - macOS compatible approach
    if [ -f .env ]; then
        if grep -q '^DATABASE_URL=' .env; then
            # Create a temp file for sed on macOS (which requires backup extension with -i)
            TMP_FILE=$(mktemp)
            grep -v '^DATABASE_URL=' .env > "$TMP_FILE"
            echo "DATABASE_URL=$DB_URL" >> "$TMP_FILE"
            mv "$TMP_FILE" .env
        else
            echo "DATABASE_URL=$DB_URL" >> .env
        fi
        echo "DATABASE_URL updated in .env file:"
        grep '^DATABASE_URL=' .env 2>/dev/null || echo "Warning: Unable to verify DATABASE_URL in .env"
    else
        echo "Creating new .env file with DATABASE_URL"
        echo "DATABASE_URL=$DB_URL" > .env
        echo "DATABASE_URL set in new .env file"
    fi
fi

# Optionally: Add instructions for the user
echo ""
echo "To connect to the database:"
echo "  psql '$DATABASE_URL'"
echo "To stop the database server:"
echo "  ./scripts/stop-dev-postgres.sh"

exit 0