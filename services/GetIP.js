import Constants from "expo-constants";

const ipRegex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
const match = Constants.linkingUri.match(ipRegex);
export const IP_ADDRESS = match ? match[0] : null;