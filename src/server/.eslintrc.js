module.exports = {
    'extends': 'airbnb',
    'parser': 'babel-eslint',
		'env': {
				'browser': true,
				'node': true,
				'mocha': true,
		},
		'parserOptions': {
			'ecmaVersion': 8,
			'ecmaFeatures': {
				'jsx': true,
			},
			'sourceType': 'module'
		},
		'plugins': ['react', 'mocha'],
		'rules': {
			'indent': ['error', 'tab'],
			'keyword-spacing': [
				'error',
				{
					'overrides': {
						'if': { 	
							'after': false 
						}
					}
				}
			],
    	'mocha/no-exclusive-tests': 'error',
			'no-fallthrough': [
				'error', 
				{ 'commentPattern': '/falls?\s?through/i' }
			],
			'no-tabs': 0,
			'no-unused-vars': [
				'error', 
				{
					'vars': 'all', 
					'args': 'after-used',
					'argsIgnorePattern': 'next',
				}
			],
			'no-underscore-dangle': 0,
			'react/jsx-indent': [2, 'tab'],
			'react/jsx-indent-props': [2, 'tab'],
			'react/prop-types': 0
		},
};
