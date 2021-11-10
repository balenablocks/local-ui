// Utility types
export type ExcludeOptional<T> = {
	[K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K];
};

// Read-only device data
export interface DeviceState {
	device: {
		deviceName: string;
		hostName: string;
		updateStatus: string;
		downloadProgress: DownloadProgress;
		deviceType: string;
		osVersion: string;
		supervisorVersion: string;
		ipAddress: string[];
		macAddress: string[];
		vpn: {
			enabled: boolean;
			connected: boolean;
		};
		uuid?: string; // Requires balena API
		onlineTime?: string | null; // Requires balena API
	};
	fleet: {
		fleetName?: string; // Requires balena API
		currentVersion?: string; // Requires balena API
		targetVersion?: string; // Requires balena API
	};
	network: {
		isOnline: boolean;
		canPing: boolean;
		canResolveMDNS: boolean;
	};
}

/**
 * Supervisor API responses
 */
type DownloadProgress = number | null;
export interface SupervisorAPI {
	v1: V1;
	v2: V2;
	action: 'identify' | 'restartServices' | 'reboot' | 'purge';
}

interface V1 {
	device: {
		api_port: number;
		commit: string;
		ip_address: string;
		mac_address: string;
		status: string;
		download_progress: DownloadProgress;
		os_version: string;
		supervisor_version: string;
		update_pending: boolean;
		update_downloaded: boolean;
		update_failed: boolean;
	};
	deviceHostConfig: {
		network: {
			hostname: string;
			proxy?: {
				type?: string;
				ip?: string;
				port?: number;
				login?: string;
				password?: string;
				noProxy?: string[];
			};
		};
	};
}

interface V2 {
	stateStatus: {
		status: string;
		appState: string;
		overallDownloadProgress: DownloadProgress;
		containers: StateStatusContainer[];
		images: StateStatusImage[];
		release: string;
	};
	deviceName: {
		status: string;
		deviceName: string;
	};
	deviceVPN: {
		status: string;
		vpn: {
			enabled: boolean;
			connected: boolean;
		};
	};
	localDeviceInfo: {
		status: string;
		info: {
			arch: string;
			deviceType: string;
		};
	};
}

interface StateStatusContainer {
	status: string;
	serviceName: string;
	appId: number;
	imageId: number;
	serviceId: number;
	containerId: string;
	createdAt: string;
}

interface StateStatusImage {
	name: string;
	appId: number;
	serviceName: string;
	imageId: number;
	dockerImageId: string;
	status: string;
	downloadProgress: DownloadProgress;
}

// Supervisor API response map
interface SupervisorEndpointAccessor {
	method: 'get' | 'post';
	endpoint: string;
	// Pure function which outputs needed API data when given an API response
	transformer?: (response: any) => any;
}

export type SupervisorAPIMap = Record<
	keyof ExcludeOptional<DeviceState['device']> | SupervisorAPI['action'],
	SupervisorEndpointAccessor
>;
