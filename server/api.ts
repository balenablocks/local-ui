import express, { Request, Response } from 'express';

import SupervisorProxy from './supervisor';

const api = express.Router();
const supervisor = new SupervisorProxy();

api.get('/', async (_req: Request, res: Response) => {
	res.status(501).send('Not implemented');
});

api.get('/device', async (_req: Request, res: Response) => {
	try {
		const info = await supervisor.getDeviceInfo();
		res.status(200).json(info);
	} catch (err: any) {
		// Pass along any error messages from SupervisorProxy as-is for now
		// TODO: Better error handling?
		const status = err?.code || 500;
		const message = err?.message || 'Something went wrong';
		res.status(status).json({ error: message });
	}
});

api.post('/device/identify', async (_req: Request, res: Response) => {
	try {
		await supervisor.identifyDevice();
		res.status(200);
	} catch (err: any) {
		// Pass along any error messages from SupervisorProxy as-is for now
		// TODO: Better error handling?
		const status = err?.code || 500;
		const message = err?.message || 'Something went wrong';
		res.status(status).json({ error: message });
	}
});

api.post('/device/reboot', async (_req: Request, res: Response) => {
	try {
		await supervisor.reboot();
		res.status(200);
	} catch (err: any) {
		// Pass along any error messages from SupervisorProxy as-is for now
		// TODO: Better error handling?
		const status = err?.code || 500;
		const message = err?.message || 'Something went wrong';
		res.status(status).json({ error: message });
	}
});

api.post('/service/restart', async (_req: Request, res: Response) => {
	try {
		await supervisor.restartServices();
		res.status(200);
	} catch (err: any) {
		// Pass along any error messages from SupervisorProxy as-is for now
		// TODO: Better error handling?
		const status = err?.code || 500;
		const message = err?.message || 'Something went wrong';
		res.status(status).json({ error: message });
	}
});

export { api as apiRouter };
