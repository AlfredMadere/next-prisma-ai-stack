#!/bin/bash

DATA_DIR="./pgdata"

if [ -f "$DATA_DIR/postmaster.pid" ]; then
  echo "Stopping PostgreSQL server..."
  pg_ctl -D "$DATA_DIR" stop -m fast
  if [ $? -eq 0 ]; then
    echo "PostgreSQL server stopped successfully."
  else
    echo "Warning: Failed to stop PostgreSQL server gracefully. Trying force stop..."
    pg_ctl -D "$DATA_DIR" stop -m immediate
    if [ $? -ne 0 ]; then
      echo "Error: Failed to stop PostgreSQL server. You may need to kill the process manually."
      exit 1
    fi
  fi
else
  echo "No running PostgreSQL server found with data directory '$DATA_DIR'."
fi

exit 0
