import sequelize from '../database/sequelize'

import {DataTypes, Sequelize} from "sequelize";

const AirCraft = sequelize.define('AirCraft', {
    id: {
        type: DataTypes.STRING(100),
        defaultValue: Sequelize.fn('replace', Sequelize.fn('uuid'), '-', ''),
        allowNull: true,
        primaryKey: true
    },
    airCraftId: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    aircraftName: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    aircraftModel: {
        type: DataTypes.STRING(500),
        allowNull: false
    }
}, {
    tableName: 'airCrafts',
    timestamps: false // If you don't want timestamps (createdAt, updatedAt)
});

export default AirCraft