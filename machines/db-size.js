module.exports = {


  friendlyName: 'Table Size',


  description: 'List the size of a table in MB',


  extendedDescription: '',


  inputs: {

    connectionUrl: {
      description: 'The MySql connection URL',
      example: 'mysql://foo:bar@localhost:3306/machinepack_mysql',
      required: true
    }

  },


  defaultExit: 'success',


  exits: {

    error: {
      description: 'Unexpected error occurred.',
    },

    couldNotConnect: {
      description: 'Could not connect to MySql server at specified `connectionUrl`.',
      extendedDescription: 'Make sure the credentials are correct and that the server is running.'
    },

    success: {
      description: 'Returns an size in MB',
      example: 1024
    }

  },


  fn: function(inputs, exits) {
    var parseURL = require('machine').build(require('./parse-url'));

    parseURL(inputs).exec({
      error:function(err){
        return exits.error(err.message);
      },
      success:function(options){

      // Dependencies
      var mysql = require('mysql');


      // WL SQL options
      var sqlOptions = {
        parameterized: false,
        caseSensitive: false,
        escapeCharacter: '`',
        casting: false,
        canReturnValues: false,
        escapeInserts: true
      };

      var connection = mysql.createConnection(inputs.connectionUrl);
      connection.connect(function(err) {

        if(err) {
          return exits.error(err);
        }
        var query = "SELECT table_schema \"name\", \
  Round(Sum(data_length + index_length) / 1024 / 1024, 1) \"size\" \
  FROM   information_schema.tables \
  GROUP  BY table_schema; ";

        connection.query(query, function(err, results) {

          // Close the connection
          connection.end();

          if(err) {
            return exits.error(err);
          }
          var size;
          results.forEach(function(res){
            if(res.name == options.database)
              size = res.size;
          })
          if(size) return exits.success(size);

          return exits.error("Could not find database: "+options.database)
        });
      });

      }
    })
  }

};