import * as Bluebird from 'bluebird';
import { Message, systemBus } from 'dbus-native';
import * as os from 'os';
import * as _ from 'lodash';

interface PublishedHosts {
	group: string;
	hostname: string;
	address: string;
}

const publishedHosts: PublishedHosts[] = [];

const findPublishedHosts = (search: object): any => {
	return _.find(publishedHosts, search);
};

const addPublishedHost = (host: PublishedHosts) => {
	publishedHosts.push(host);
};

const removePublishedHost = (hostname: string) => {
	return _.remove(publishedHosts, { hostname });
};

const dbus = systemBus();

const dbusInvoker = (message: Message): PromiseLike<any> => {
	return Bluebird.fromCallback((cb) => dbus.invoke(message, cb));
};

const getIPv4InterfaceInfo = (iface?: string): os.NetworkInterfaceInfo[] => {
	return Object.entries(os.networkInterfaces())
		.filter(([nic]) => !iface || nic === iface)
		.flatMap(([, ips]) => ips || [])
		.filter((ip) => !ip.internal && ip.family === 'IPv4');
};

const getGroup = async (): Promise<string> => {
	return await dbusInvoker({
		destination: 'org.freedesktop.Avahi',
		path: '/',
		interface: 'org.freedesktop.Avahi.Server',
		member: 'EntryGroupNew',
	});
};

const addHostAddress = async (
	hostname: string,
	address: string,
): Promise<void> => {
	// If the hostname is already published with the same address, return
	if (findPublishedHosts({ hostname, address })) {
		return;
	}

	console.log(
		`* mdns - adding ${hostname} at address ${address} to local MDNS pool`,
	);

	const group = await getGroup();
	console.log('* mdns - avahi group:', group);

	await dbusInvoker({
		destination: 'org.freedesktop.Avahi',
		path: group,
		interface: 'org.freedesktop.Avahi.EntryGroup',
		member: 'AddAddress',
		body: [-1, -1, 0x10, hostname, address],
		signature: 'iiuss',
	});

	await dbusInvoker({
		destination: 'org.freedesktop.Avahi',
		path: group,
		interface: 'org.freedesktop.Avahi.EntryGroup',
		member: 'Commit',
	});
	addPublishedHost({
		group,
		hostname,
		address,
	});
};

const removeHostAddress = async (hostname: string): Promise<void> => {
	// If the hostname doesn't exist, we don't use it
	const hostDetails = findPublishedHosts({ hostname });
	if (!hostDetails) {
		return;
	}

	console.log(`* mdns = removing ${hostname} at address from local MDNS pool`);

	// Free the group, removing the published address
	await dbusInvoker({
		destination: 'org.freedesktop.Avahi',
		path: hostDetails.group,
		interface: 'org.freedesktop.Avahi.EntryGroup',
		member: 'Free',
	});

	// Remove from the published hosts list
	removePublishedHost(hostname);
};

export const removeMdnsEntry = async (hostname: string) => {
	removeHostAddress(hostname);
};

export const addMdnsEntry = async (hostname: string) => {
	console.log('* mdns - starting');
	const ipAddr = getIPv4InterfaceInfo(process.env.INTERFACE)[0].address;
	console.log('* mdns - IP:', ipAddr);
	addHostAddress(hostname, ipAddr);
};
