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
				useBuiltIns: 'usage',
				corejs: { version: "3.20.2", proposals: true }
			},
		],
		["@babel/preset-react"],
		["@babel/preset-typescript"],
	],
};
