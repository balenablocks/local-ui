import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import winston from 'winston';
import expressWinston from 'express-winston';
import axios from 'axios';

import { PORT } from './lib/constants';
import { apiRouter } from './api';
import { addMdnsEntry } from './mdns';
import { DockerComposeError } from './lib/errors';

addMdnsEntry(process.env.MDNS_TLD || 'balena.local');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	expressWinston.logger({
		transports: [new winston.transports.Console()],
	}),
);

// Bundled client files
app.use(express.static(path.resolve(__dirname, '..', 'public')));

// API routes
app.use('/v1', apiRouter);

// Error logger middleware
// Comes after the API routes to log and pass on any errors
app.use(
	expressWinston.errorLogger({
		transports: [new winston.transports.Console()],
	}),
);

// Error handler
// TODO: We probably don't want to send the error messages directly
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
	if (err instanceof DockerComposeError) {
		res.status(400).send(err.message);
	} else if (axios.isAxiosError(err)) {
		// Error while making a request to Supervisor API
		if (err.response) {
			// Request went through but server responded with !2xx code
			res.status(err.response.status).send(err.response.data);
		} else if (err.request) {
			// Request was made with no server response
			res.status(err.request.status).send(err.request.data);
		}
	} else {
		res
			.status(500)
			.send(
				(err as NodeJS.ErrnoException).message ||
					'Internal server error, check the device logs.',
			);
	}
});

app.listen(PORT, () => {
	console.log(`Local UI server listening on port ${PORT}`);
});
