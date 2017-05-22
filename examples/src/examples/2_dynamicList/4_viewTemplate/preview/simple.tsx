import * as React from "react";
import controller from "../../0_sum/controller";
import { IViewProps } from "../../0_sum/types";
import Template from "../template";
import withStore from "../../../redux";

export const previewProps = {
	text: "Это заголовок, переданный через свойства."
}

const FieldElement = (value: number, onChange: (value: number) => void): JSX.Element  => (
	<input 
		value={value}
		onChange={ (ev) => onChange(parseFloat(ev.currentTarget.value)) }
	/>
);

const View = (props: IViewProps): JSX.Element => (
	<Template 
		{...props} 
		FieldElement={FieldElement}
	/>
);

export default withStore(controller.getReducer(), controller.getComponent(View));

