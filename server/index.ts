import express from 'express';
import path from 'path';

import { PORT } from './constants';
import { v1Router } from './v1';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Bundled client files
app.use(express.static(path.resolve(__dirname, '..', 'public')));

// API routes
app.use('/v1', v1Router);

app.listen(PORT, () => {
	console.log(`Local UI server listening on port ${PORT}`);
});
