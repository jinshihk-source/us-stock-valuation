/** Production updater skeleton. Intentionally refuses to fabricate data before licensed providers are configured. */
const required=['DATABASE_URL','MARKET_DATA_PROVIDER'];
const missing=required.filter(k=>!process.env[k]);
if(missing.length){console.error(`UPDATE_SKIPPED missing: ${missing.join(', ')}`);process.exit(2)}
if(!process.env.MARKET_DATA_API_KEY){console.error('UPDATE_SKIPPED: licensed market-data API key not configured');process.exit(2)}
console.log('Provider adapter must be enabled only after display/redistribution rights are documented.');process.exit(2);
