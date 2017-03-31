declare module "*.css" {
	const content: {
		[id: string]: string;
	};
	export = content;
}

declare module "*.less" {
	const content: {
		[id: string]: string;
	};
	export = content;
}