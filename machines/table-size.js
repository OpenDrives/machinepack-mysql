module.exports = {


  friendlyName: 'table-size',


  description: 'Get the size of a table in MB',


  cacheable: false,


  sync: false,


  inputs: {
   connectionUrl: {
      description: 'The MySql connection URL',
      defaultsTo: 'mysql://open:st0rageadmin@localhost:3306/openweb',
      example: 'mysql://foo:bar@localhost:3306/machinepack_mysql',
      required: false
    },

    table: {
      description: 'The name of the table.',
      defaultsTo: 'stats',
      example: 'direwolves',
      required: true
    }
  },


  exits: {

    success: {
      variableName: 'result',
      description: 'Done.',
    },

  },


  fn: function(inputs, exits
    /**/
  ) {

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
        var query = "SELECT TABLE_NAME \"table\", table_rows, data_length, index_length,CHECKSUM,  round(((data_length + index_length) / 1024 / 1024),2) \"size\" FROM information_schema.TABLES WHERE TABLE_NAME = '"+inputs.table+"';";

        connection.query(query, function(err, results) {

          // Close the connection
          connection.end();

          if(err) {
            return exits.error(err);
          }

          results.forEach(function(res){
            if(res.table == inputs.table)
              return exits.success(res.size);
          })
          return exits.error("Could not find database: "+options.database)
        });
      });

      }
    })
  },



};