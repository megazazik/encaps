import * as React from 'react';

export interface ITestRunnerViewProps extends ITestRunnerProps {
	onChange: (newProps: ITestRunnerProps) => void;
	children?: React.ReactNode;
}

export interface ITestRunnerProps {
	props: string;
	forceUpdate: boolean;
	catchAllErrors: boolean;
}