#!/bin/sh

# Create cfg directory if it doesn't exist
mkdir -p /app/cfg

# Generate nodecg.json from environment variables
echo "Generating nodecg.json..."
cat > /app/cfg/nodecg.json << EOF
{
  "host": "${NODECG_HOST:-0.0.0.0}",
  "port": ${PORT:-8080},
  "baseURL": "${NODECG_BASE_URL}",
  "login": {
    "enabled": ${NODECG_LOGIN_ENABLED:-true},
    "sessionSecret": "${NODECG_LOGIN_SESSION_SECRET}",
    "discord": {
      "enabled": ${NODECG_LOGIN_DISCORD_ENABLED:-true},
      "clientID": "${NODECG_LOGIN_DISCORD_CLIENT_ID}",
      "clientSecret": "${NODECG_LOGIN_DISCORD_CLIENT_SECRET}",
      "scope": "identify",
      "allowedUserIDs": [
        ${NODECG_LOGIN_DISCORD_ALLOWED_USER_IDS}
      ]
    }
  }
}
EOF

echo "Generating bundleConfig..."
cat > /app/cfg/fresh-layouts.json << EOF
{
    "googleApiKey": "${NODECG_GOOGLEAPI_KEY}",
    "spreadsheetId": "${NODECG_SPREADSHEET_ID}"
}
EOF

echo "Generated nodecg.json:"
cat /app/cfg/nodecg.json

# Start NodeCG
echo "Starting NodeCG..."
exec npx nodecg start
