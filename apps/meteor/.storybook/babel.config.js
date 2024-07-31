module.exports = {
	presets: [
		[
			'@babel/preset-env',
			{
				shippedProposals: true,
				useBuiltIns: 'usage',
				corejs: '3',
				modules: 'commonjs',
				include: [
					'@babel/plugin-proposal-class-properties',
					'@babel/plugin-proposal-optional-chaining',
					'@babel/plugin-proposal-nullish-coalescing-operator',
				],
			},
		],
		'@babel/preset-react',
		'@babel/preset-flow',
		['@babel/preset-typescript', { allowDeclareFields: true }],
	],
};
