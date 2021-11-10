import express, { Request, Response } from 'express';

import SupervisorProxy from './supervisor';

const api = express.Router();
const supervisor = new SupervisorProxy();

api.get('/', async (_req: Request, res: Response) => {
	res.status(501).send('Not implemented');
});

api.get('/device', async (_req: Request, res: Response) => {
	res.status(200).json(await supervisor.getDeviceInfo());
});

api.post('/device/identify', async (_req: Request, res: Response) => {
	await supervisor.identifyDevice();
	res.status(200);
});

api.post('/device/reboot', async (_req: Request, res: Response) => {
	await supervisor.reboot();
	res.status(200);
});

api.post('/service/restart', async (_req: Request, res: Response) => {
	await supervisor.restartServices();
	res.status(200);
});

export { api as apiRouter };
