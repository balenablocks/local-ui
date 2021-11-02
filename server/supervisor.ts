import axios, { AxiosInstance } from 'axios';

import { DockerComposeError } from './lib/errors';
import type {
	ExcludeOptional,
	DeviceState,
	SupervisorAPI,
	SupervisorAPIMap,
} from './lib/types';
import { deviceToAPIMap } from './lib/constants';

class SupervisorProxy {
	private request: AxiosInstance;

	public constructor() {
		const {
			BALENA_SUPERVISOR_ADDRESS: svAddr,
			BALENA_SUPERVISOR_API_KEY: svApiKey,
		} = process.env;

		if (!svAddr) {
			throw new DockerComposeError(
				`Expected a valid BALENA_SUPERVISOR_ADDRESS, got '${svAddr}'.
				
                Check that the proper label exists in your docker-compose.yml.`,
			);
		}
		if (!svApiKey) {
			const apiKeyType = typeof svApiKey;
			// We shouldn't explicitly log the key for security reasons, but the error message
			// should give enough hints about what BALENA_SUPERVISOR_API_KEY actually is for debug purposes.
			throw new DockerComposeError(
				`Expected a 32-char hash, got a key of type ${apiKeyType} with length ${
					String(svApiKey).length
				}.

                Check that the proper label exists in your docker-compose.yml.`,
			);
		}

		// Create reuseable request instance to Supervisor API
		this.request = axios.create({
			baseURL: svAddr,
			headers: {
				Authorization: `Bearer ${svApiKey}`,
			},
		});
	}

	/**
	 * Request proxy methods
	 */
	private async get(route: string) {
		return await this.request
			.get(route)
			.then(({ data }) => {
				return data;
			})
			.catch(this.handleAxiosError);
	}

	private async post(route: string) {
		return await this.request
			.post(route)
			.then(({ data }) => {
				return data;
			})
			.catch(this.handleAxiosError);
	}

	// TODO: better error handling
	private handleAxiosError(error: NodeJS.ErrnoException) {
		if (axios.isAxiosError(error)) {
			if (error.response) {
				// Request went through but server responded with !2xx code
				console.error('Response error:', error.response);
			} else if (error.request) {
				// Request was made with no server response
				console.error('Request error:', error.request);
			}
		} else {
			// Something happened when setting up the request
			console.error('Error:', error.message);
		}
		throw error;
	}

	/**
	 * Device data methods
	 */
	/**
	 * Based on constants.deviceToAPIMap, query for an array of data fields from Supervisor API and return transformed responses
	 * @param fields - Array of device state fields to get from Supervisor API
	 *                 Example: ['deviceName', 'hostName']
	 * @returns Object with device state fields as keys and transformed API responses as values
	 */
	private async queryAPIAndTransform(
		fields: Array<keyof SupervisorAPIMap>,
	): Promise<Partial<DeviceState['device']>> {
		const apiResponses: any = {};

		const promises = fields.map(async (field) => {
			const { method, endpoint, transformer } = deviceToAPIMap[field];

			// Declare tuple to be returned for individual data field.
			// These are composed into an Object with the final return of queryAPIAndTransform.
			const tuple: any[] = [field, null];

			// If API response doesn't exist, query & cache it to avoid future repeated calls
			try {
				if (apiResponses[endpoint] === undefined) {
					apiResponses[endpoint] = await this[method](endpoint);
				}
			} catch (error) {
				// If error querying API endpoint, we still want to return a subset of device info,
				// so set the API response for this endpoint to false so that it's skipped later

				// TODO: better error handling
				console.error(error);
				apiResponses[endpoint] = false;
			}

			// If an API response has errored, handle it and just don't return the info for this
			// field, but don't reject the Promise so we can still return a subset of data
			if (apiResponses[endpoint] === false) {
				return tuple;
			}

			// If API response exists, return transformed response
			if (transformer) {
				tuple[1] = transformer(apiResponses[endpoint]);
			} else {
				tuple[1] = apiResponses[endpoint];
			}
			return tuple;
		});

		const tuples = await Promise.all(promises);
		return Object.fromEntries(tuples as Array<[keyof SupervisorAPIMap, any]>);
	}

	public async getDeviceInfo(): Promise<Partial<DeviceState['device']>> {
		const deviceInfoFields = Object.keys(deviceToAPIMap).filter(
			(key) => deviceToAPIMap[key as keyof SupervisorAPIMap].method === 'get',
		);
		return await this.queryAPIAndTransform(
			deviceInfoFields as Array<keyof ExcludeOptional<DeviceState['device']>>,
		);
	}

	/**
	 * Device action methods
	 */
	public async identifyDevice() {
		return await this.queryAPIAndTransform(['identify'] as Array<
			SupervisorAPI['action']
		>);
	}

	public async restartServices() {
		return await this.queryAPIAndTransform(['restartServices'] as Array<
			SupervisorAPI['action']
		>);
	}

	public async reboot() {
		return await this.queryAPIAndTransform(['reboot'] as Array<
			SupervisorAPI['action']
		>);
	}

	public async purge() {
		return await this.queryAPIAndTransform(['purge'] as Array<
			SupervisorAPI['action']
		>);
	}
}

export default SupervisorProxy;
