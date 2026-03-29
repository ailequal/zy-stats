import { Agent } from "undici";

/**
 * A shared undici {@link Agent} that disables TLS certificate verification.
 *
 * Use as the `dispatcher` option on `fetch` calls targeting the router's
 * self-signed / untrusted HTTPS endpoint instead of setting the global
 * `NODE_TLS_REJECT_UNAUTHORIZED` environment variable.
 */
const httpsAgent = new Agent({ connect: { rejectUnauthorized: false } });

export default httpsAgent;
