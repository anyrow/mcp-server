import { SDKClient, schemeAuth } from "./api.runtime.gen.js";
import { serviceMap } from "./api.map.gen.js";
export class Api extends SDKClient {
	constructor(config) {
		super(serviceMap, schemeAuth({
			...config,
			baseURL: config.baseURL ?? "https://api.anyrow.ai/api"
		}, "Authorization", "ApiKey "));
	}
}
