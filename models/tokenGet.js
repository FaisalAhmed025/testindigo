import { DataTypes } from "sequelize";
import sequelize from "../database/sequelize";
export const GdsControl = sequelize.define(
  "GdsControl",
  {
    id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true,
    },
    wingName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 1,
    },
  },
  {
    tableName: "gdsControl",
    timestamps: false,
  }
);

// Define the wingDetails model
export const WingDetails = sequelize.define(
  "WingDetails",
  {
    id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true,
    },
    gdsName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    pcc: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    gdsControlId: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    control: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
    },
    credential: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "wingDetails",
    timestamps: false,
  }
);

// Define the association
GdsControl.hasMany(WingDetails, { foreignKey: "gdsControlId" });
WingDetails.belongsTo(GdsControl, { foreignKey: "gdsControlId" });

export default {
  sequelize,
  GdsControl,
  WingDetails,
};
