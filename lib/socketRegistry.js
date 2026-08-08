// Shared reference to the active WhatsApp socket, so lib/server.js can
// trigger .requestPairingCode() from an HTTP route (the web pairing
// page) without index.js and server.js needing to import each other
// directly (avoids circular imports).
const registry = {
    sock: null,
    pairingInProgress: false,
};
export default registry;
