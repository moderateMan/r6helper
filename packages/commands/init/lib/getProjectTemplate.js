const request = require('@moderate-cli/request');

module.exports = function() {
  return request({
    url: '/cli/project/template',
  });
};
