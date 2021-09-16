import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'rendition';

ReactDOM.render(
	<Provider>
		<div>Hello world</div>
	</Provider>,
	document.getElementById('root') as HTMLDivElement,
);
