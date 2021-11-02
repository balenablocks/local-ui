import type { SupervisorAPIMap, SupervisorAPI } from './types';

export const PORT = 80;

// Source of truth for which Supervisor API endpoint to get each piece of data from.
export const deviceToAPIMap: SupervisorAPIMap = {
	deviceName: {
		method: 'get',
		endpoint: '/v2/device/name',
		transformer: ({ deviceName }: SupervisorAPI['v2']['deviceName']) =>
			deviceName ?? null,
	},
	hostName: {
		method: 'get',
		endpoint: '/v1/device/host-config',
		transformer: ({ network }: SupervisorAPI['v1']['deviceHostConfig']) =>
			network?.hostname ?? null,
	},
	// TODO: Switch over to v2 endpoint for updateStatus when implemented in Supervisor
	// v1 is a legacy endpoint which has known issues reporting for multicontainer
	updateStatus: {
		method: 'get',
		endpoint: '/v1/device',
		transformer: ({
			update_pending,
			update_downloaded,
			update_failed,
		}: SupervisorAPI['v1']['device']) => {
			if (update_pending) {
				return 'pending';
			}
			if (update_downloaded) {
				return 'downloaded';
			}
			if (update_failed) {
				return 'failed';
			}
			return 'idle';
		},
	},
	downloadProgress: {
		method: 'get',
		endpoint: '/v2/state/status',
		transformer: ({
			overallDownloadProgress,
		}: SupervisorAPI['v2']['stateStatus']) => overallDownloadProgress ?? null,
	},
	deviceType: {
		method: 'get',
		endpoint: '/v2/local/device-info',
		transformer: ({ info }: SupervisorAPI['v2']['localDeviceInfo']) =>
			info?.deviceType ?? null,
	},
	osVersion: {
		method: 'get',
		endpoint: '/v1/device',
		transformer: ({ os_version }: SupervisorAPI['v1']['device']) =>
			os_version ?? null,
	},
	supervisorVersion: {
		method: 'get',
		endpoint: '/v1/device',
		transformer: ({ supervisor_version }: SupervisorAPI['v1']['device']) =>
			supervisor_version ?? null,
	},
	ipAddress: {
		method: 'get',
		endpoint: '/v1/device',
		transformer: ({ ip_address }: SupervisorAPI['v1']['device']) =>
			ip_address.split(' ') ?? null,
	},
	macAddress: {
		method: 'get',
		endpoint: '/v1/device',
		transformer: ({ mac_address }: SupervisorAPI['v1']['device']) =>
			mac_address.split(' ') ?? null,
	},
	vpn: {
		method: 'get',
		endpoint: '/v2/device/vpn',
		transformer: ({ vpn }: SupervisorAPI['v2']['deviceVPN']) => vpn ?? null,
	},
	identify: {
		method: 'post',
		endpoint: '/v1/blink',
	},
	restartServices: {
		method: 'post',
		endpoint: '/v1/restart',
	},
	reboot: {
		method: 'post',
		endpoint: '/v1/reboot',
	},
	purge: {
		method: 'post',
		endpoint: '/v1/purge',
	},
};
