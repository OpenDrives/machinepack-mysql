module.exports = {


  friendlyName: 'parse-url',


  description: 'Parse the connection URL into dict object',


  cacheable: false,


  sync: false,


  inputs: {
    connectionUrl: {
      description: 'The MySql connection URL',
      defaultsTo: 'mysql://open:st0rageadmin@localhost:3306/openweb',
      example: 'mysql://foo:bar@localhost:3306/machinepack_mysql',
      required: false
    }
  },


  exits: {

    success: {
      variableName: 'result',
      description: 'Done.',
    },

  },


  fn: function(inputs, exits) {

    // lifted from https://github.com/mysqljs/mysql/blob/master/lib/ConnectionConfig.js
    var urlParse        = require('url').parse;

    var url = inputs.connectionUrl

    url = urlParse(url, true);

    var options = {
      host     : url.hostname,
      port     : url.port,
      database : url.pathname.substr(1)
    };

    if (url.auth) {
      var auth = url.auth.split(':');
      options.user     = auth.shift();
      options.password = auth.join(':');
    }

    if (url.query) {
      for (var key in url.query) {
        var value = url.query[key];

        try {
          // Try to parse this as a JSON expression first
          options[key] = JSON.parse(value);
        } catch (err) {
          // Otherwise assume it is a plain string
          options[key] = value;
        }
      }
    }

    return exits.success(options);
  }



};