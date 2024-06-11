
import sequelize from '../database/sequelize'

import {DataTypes} from "sequelize";

const Airport = sequelize.define('Airport', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  cityCode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  cityName: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  countryName: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  countryCode: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'airports',
  timestamps: false // Disable timestamps if not using createdAt/updatedAt
});
export default Airport