/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    id : {
      type: 'string',
      primaryKey: true,
      required: true
    },
    name : {
      type: 'string'
    },
    firstname : {
      type: 'string'
    },
    pseudo : {
      type: 'string',
      unique : true
    },
    email : {
      type: 'email',
      unique : true
    },
    password : {
      type: 'json'
    },
    created : {
      type: 'date',
      defaultsTo: Date.now()
    }
  }
};

