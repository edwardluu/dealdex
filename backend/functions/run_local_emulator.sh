# Needed for local testing of Admin SDK, to generate an auth token
export GOOGLE_APPLICATION_CREDENTIALS=./service_account_file.json
npm run build
firebase emulators:start --only functions
