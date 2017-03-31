import * as React from "react";
import controller from "../../withChildActions/controller";
import { IViewProps } from "../../withChildActions/types";
import Template from "../template";
import withStore from "../../../redux";
import Field from "../../../field";

export const previewProps = {
	text: "Это заголовок, переданный через свойства."
}

const View = (props: IViewProps): JSX.Element => (
	<Template 
		{...props.sum} 
		onAddField={props.onAddField}
		onSubtractField={props.onSubtractField}
		FieldElement={ (value, onChange, index) => 
			<Field 
				num={value} 
				onChange={onChange} 
				{...props.numbers.values[index]} 
			/> 
		}
	/>
);

export default withStore(controller.getReducer(), null, controller.getComponent(View));

