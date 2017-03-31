import * as React from 'react';
import * as styles from '../styles/index.less';

export default function ErrorText (props: {error: Error}) {
	return (
		<div>
			<pre className={styles['errorText']}>{props.error.stack}</pre>
		</div>
	);
}