# Firebase Backend

Contains the Firestore authentication rules, web app hosting, and Cloud Functions.

## Deploy!
```
firebase deploy
```

## Firestore Authentication Rules
Authentication rules govern which users can read/modify what documents.

## Cloud Functions
### Authentication
A getAuthToken function is used for authentication on the frontend; it generates a JWT.

We use Ethereum digital signatures to authenticate a user - more specifically, to verify that she owns her address. This authentication ensures that only a user can modify her own user document in Firebase.
How it works:
1. UI presents a precanned message to the user of the form "Verify you own address <addr> at time <UTC time>".
2. The user signs the message using his private key - MetaMask captures this nicely in their UI.
3. The UI sends an object containing {"raw_message": <message presented to user>, "signed_message": <signature hash>, "address": <address>, "time": <time>} to the backend (a Firebase Cloud function).
4. The backend (Firebase cloud function) verifies that [1] the signed_message hash matches the raw_message and [2] the time is within some threshold of the current time (e.g. last 10 minutes).
5. If both above conditions hold, the cloud function generates an authentication token (like a JWT) and sends it back to the UI


## Web App Hosting
Artifacts from the frontend are deployed to the dealdex domain.
