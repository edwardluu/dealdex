import * as functions from "firebase-functions";
import {ethers} from "ethers";

// CORS Express middleware to enable CORS Requests.
const cors = require("cors")({origin: true});

// The Firebase Admin SDK to access Firestore and generate custom auth tokens.
const admin = require("firebase-admin");
const serviceAccount = require("../service_account_file.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

/*
Sample request: {"data":
                    {"rawMessage": "Verify yourself",
                    "signature": "0xlonghash",
                    "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    "time": 1636703634815}
                }
Sample response: {"data": {"token": "supersecret"}} or {"data": {"token": null}}
*/
export const getAuthToken = functions.https.onRequest((request, response) => {
  // response.send("Hello from Firebase!");
  const handleError = (address: string, error: Error) => {
    functions.logger.error({Address: address}, error);
    response.sendStatus(500);
    return;
  };

  const handleResponse = (address: string, status: number,
      body: Record<string, string | null> = {"token": null}) => {
    functions.logger.log(
        {Address: address},
        {Response: {Status: status, Data: {data: body}}}
    );
    if (status != 200) {
      response.sendStatus(status);
      return;
    }
    response.status(200).send({data: body});
    return;
  };

  const authenticate = (rawMessage: string, signature: string,
      address: string, time: number) => {
    const derivedAddr = ethers.utils.verifyMessage(rawMessage, signature);
    const utcMillisSinceEpoch = new Date().getTime();
    const timeThresh = 1000 * 60 * 60;

    const regex = /Please verify you own address (0x[a-zA-z0-9]*) \[epoch time = ([0-9]*)\]/;
    const matches = rawMessage.match(regex) || [];
    const regexAddr = matches[1];
    const regexTime = parseInt(matches[2]);

    const authorized =
        derivedAddr == address &&
        regexAddr == address &&
        regexTime == time &&
        Math.abs(utcMillisSinceEpoch - time) < timeThresh;
    functions.logger.info(
        {Authorized: authorized},
        {InputAddress: address},
        {DerivedAddress: derivedAddr},
        {InputTime: time},
        {CurTime: utcMillisSinceEpoch},
        {DiffSeconds: Math.abs(utcMillisSinceEpoch - time) / 1000}
    );
    return authorized;
  };

  functions.logger.info("Request body:", request.body);
  // The Firebase API nests all data under data so we treat its contents
  // as the body if it exists

  let address = "";
  try {
    return cors(request, response, async () => {
      // Authentication requests are POSTed, other requests are forbidden
      if (request.method !== "POST") {
        return handleResponse(address, 403);
      }
      let data = request.body.data;
      if (data == null) {
        return handleResponse(address, 400);
      }
      const rawMessage : string = data.rawMessage;
      const signature : string = data.signature;
      address = data.address;
      const time : number = data.time;
      if (!rawMessage || !signature || !address || !time) {
        return handleResponse(address, 400);
      }
      const valid = authenticate(rawMessage, signature, address, time);
      if (!valid) {
        return handleResponse(address, 401);
      }

      // On success return the Firebase Custom Auth Token.
      const firebaseToken = await admin.auth().createCustomToken(address);
      return handleResponse(address, 200, {token: firebaseToken});
    });
  } catch (error) {
    return handleError(address, error);
  }
});
