module.exports = {
    'extends': 'airbnb',
    'parser': 'babel-eslint',
    'env': {
        'browser': true,
        'node': true
    },
    'parserOptions': {
        'ecmaVersion': 8,
        'sourceType': 'module',
        'ecmaFeatures': {
            'jsx': true,
            'experimentalObjectRestSpread': true
        },
    },
    'plugins': ['react'],
    'rules': {
        'import/no-extraneous-dependencies': [
            'error', {
                'devDependencies': true
            }
        ],
        'react/forbid-prop-types': 0,
        "jsx-a11y/anchor-is-valid": [ "error", {
            "components": [ "Link" ],
            "specialLink": [ "to" ],
        }],
        "react/sort-comp": 0,
    },
    "settings": {
        "import/resolver": {
            "webpack": {
                "config": "webpack/webpack.client.js"
            }
        }
    },
}
