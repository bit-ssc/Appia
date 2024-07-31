'use strict';

/**
 * Mocha configuration for REST API integration tests.
 */

module.exports = {
	...require('./.mocharc.base.json'), // see https://github.com/mochajs/mocha/issues/3916
	timeout: 10000,
	bail: true,
	file: 'tests/end-to-end/teardown.js',
	spec: ['tests/unit/app/api/server/v1/**/*.spec.*', 'tests/end-to-end/api/**/*', 'tests/end-to-end/apps/*'],
};
