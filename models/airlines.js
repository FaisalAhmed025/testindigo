import sequelize from '../database/sequelize'

import {DataTypes} from "sequelize";

const Airline = sequelize.define('Airline', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(550),
    allowNull: false
  },
  lccCarrier: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true
  },
  control: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'airlinesData',
  timestamps: false // Disable timestamps if not using createdAt/updatedAt
});

export default Airline