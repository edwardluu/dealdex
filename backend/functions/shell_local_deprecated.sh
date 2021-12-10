echo "I found it difficult using the shell to test HTTP Cloud functions. I recommend using ./run_local_emulator.sh"

# Needed for local testing of Admin SDK, to generate an auth token
export GOOGLE_APPLICATION_CREDENTIALS=./service_account_file.json
# npm run shell is a shortcut for `npm run build && firebase emulators:start
npm run shell
