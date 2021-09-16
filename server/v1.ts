import express, { Request, Response } from 'express';

const v1 = express.Router();

v1.get('/', async (_req: Request, res: Response) => {
	res.status(501).send('Not implemented');
});

export { v1 as v1Router };
