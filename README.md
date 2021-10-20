# Local UI
A local web UI to gain visibility into the device, importable into your multicontainer fleet as a balenaBlock. This project is a WIP.

## Usage

TODO

## Development
### Installation
```bash
# Ensure Node 14 (LTS) is installed.
nvm use 14
# Perform a clean NPM installation.
npm ci
```
### Local machine development
```bash
npm run dev
```

You may develop certain parts of the Local UI codebase on your machine regardless of its architecture. This mode is useful for developing the frontend or some parts of the server.

Then, navigate to `http://localhost/` to view your changes as they happen live.

### Local mode development
```bash
balena push <DEVICE_LOCAL_IP>
```

You may develop any part of the Local UI codebase by pushing code as a local mode container onto a device running balenaOS. This mode of development is useful for working with the devices interfaces, such as the network, balena Supervisor's [API](https://www.balena.io/docs/reference/supervisor/supervisor-api/), or `systemd` services, and requires a local installation of [balena CLI](https://www.balena.io/docs/reference/balena-cli/).

For more information about balena's local mode, see balena's [documentation](https://www.balena.io/docs/learn/develop/local-mode/). 
