import * as Bluebird from 'bluebird';
import { Message, systemBus } from 'dbus-native';
import * as os from 'os';

const dbus = systemBus();

const dbusInvoker = (message: Message): PromiseLike<any> => {
    return Bluebird.fromCallback(cb => dbus.invoke(message, cb))
}

const getIPv4InterfaceInfo = (iface?: string): os.NetworkInterfaceInfo[] => {
    return Object.entries(os.networkInterfaces())
        .filter(([nic]) => !iface || nic === iface)
        .flatMap(([, ips]) => ips || [])
        .filter((ip) => !ip.internal && ip.family === 'IPv4')
}

const getGroup = async (): Promise<string> => {
    return await dbusInvoker({
        destination: 'org.freedesktop.Avahi',
        path: '/',
        interface: 'org.freedesktop.Avahi.Server',
        member: 'EntryGroupNew',
    })
}

const addHostAddress = async (
    hostname: string,
    address: string,
): Promise<void> => {

    console.log(`* mdns - adding ${hostname} at address ${address} to local MDNS pool`);

    const group = await getGroup()
    console.log('* mdns - avahi group:', group)

    await dbusInvoker({
        destination: 'org.freedesktop.Avahi',
        path: group,
        interface: 'org.freedesktop.Avahi.EntryGroup',
        member: 'AddAddress',
        body: [-1, -1, 0x10, hostname, address],
        signature: 'iiuss',
    })

    await dbusInvoker({
        destination: 'org.freedesktop.Avahi',
        path: group,
        interface: 'org.freedesktop.Avahi.EntryGroup',
        member: 'Commit',
    })
}

export const addMdnsEntry = async (hostname: string) => {
    console.log('* mdns - starting')
    let ipAddr = getIPv4InterfaceInfo(process.env.INTERFACE)[0].address
    console.log('* mdns - IP:', ipAddr)
    addHostAddress(hostname, ipAddr)
}
