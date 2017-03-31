import * as React from 'react';
import * as styles from './styles/index.less';
import {ITestRunnerViewProps, ITestRunnerProps} from "./props";

class TestRunnerView extends React.Component<ITestRunnerViewProps, {}> {
	render () {
		return (
			<div className={styles['wrapper']}>
				{this.props.children && (
					<div className={styles['componentContainer']}>
						{this.props.children}
					</div>
				)}
				<div>
					<div className={styles['paramsBlock']}>
						<div className={styles['paramBlock']}>
							<input 
								className={styles['paramInput']}
								checked={this.props.forceUpdate} 
								name="forceUpdate" 
								id="forceUpdate"
								type="checkbox" 
								onChange={(ev) => {
									this.props.onChange({...this.props, forceUpdate: ev.currentTarget.checked});
								}}
							/>
							<label htmlFor="forceUpdate">Force update and rerender on error</label>
						</div>
						<div className={styles['paramBlock']}>
							<input 
								className={styles['paramInput']}
								checked={this.props.catchAllErrors} 
								name="catchAllErrors" 
								id="catchAllErrors"
								type="checkbox" 
								onChange={(ev) => {
									this.props.onChange({...this.props, catchAllErrors: ev.currentTarget.checked});
								}}
							/>
							<label htmlFor="catchAllErrors">Catch all errors</label>
						</div>
					</div>
					<textarea 
						className={styles['propsField']} 
						onChange={(ev) => {
							this.props.onChange({...this.props, props: ev.currentTarget.value});
						}}
						value={this.props.props} />
				</div>
			</div>
		);
	}
}

export default TestRunnerView;