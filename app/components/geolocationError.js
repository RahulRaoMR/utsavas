export function getGeolocationErrorMessage(error) {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "Location works only on HTTPS or localhost. Open the site in a secure connection.";
  }

  switch (error?.code) {
    case 1:
      return "Location access was blocked. Allow location permission in your browser settings and try again.";
    case 2:
      return "Your device could not determine the current location. Try again after enabling GPS/location services.";
    case 3:
      return "Location detection timed out. Try again in an open area or with a stronger network/GPS signal.";
    default:
      return error?.message || "Unable to detect your current location right now.";
  }
}
