'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuarios extends Model {

    static associate(models) {
    }

  } Usuarios.init({
    nome: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    senha: {
      type: DataTypes.STRING,
    }
  },
    {
    sequelize,
    modelName: 'Usuarios',
  });

  return Usuarios;
};