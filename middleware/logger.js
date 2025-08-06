
// console log all requests
const requestLogger = (req, res, next) => {
    console.log(`[${new Date().toLocaleString("de-DE")}] ${req.method}: ${req.path}`);
    next();
}

export { requestLogger };