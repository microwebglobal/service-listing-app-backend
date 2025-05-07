// phonepeClient.js
const { StandardCheckoutClient, Env } = require("pg-sdk-node");
const config = require("../config/config");

const clientId = config.development.phonePe.clientId;
const clientSecret = config.development.phonePe.clientSecret;
const clientVersion = 1;
const env = Env.SANDBOX;

const client = StandardCheckoutClient.getInstance(
  clientId,
  clientSecret,
  clientVersion,
  env
);

(async () => {
  try {
    const token = await client._tokenService.getOAuthToken();
    console.log("OAuth token:", token);
  } catch (err) {
    console.error("Error fetching OAuth token:", err);
  }
})();

module.exports = { client };
