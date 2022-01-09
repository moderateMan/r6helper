module.exports = {
	plugins: [
		"@babel/plugin-proposal-export-default-from",
	],
	presets: [
		[
			"@babel/preset-env",
			{
				modules: 'auto',
				loose: true,
				useBuiltIns: 'usage'
			},
		],
		["@babel/preset-react"],
		["@babel/preset-typescript"],
	],
};
