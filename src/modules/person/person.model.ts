import config from "config";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database";
import { gender } from "../../types/gender.type";
class Person extends Model {
  declare id: number;
  declare username: string;
  declare email: string;
  declare first_name: string;
  declare last_name: string;
  declare phone_number: string;
  declare password: string;
  declare birthdate: Date;
  declare gender: gender;
  declare confirmed: boolean;
  declare password_reset_code: string | null;
  declare password_reset_code_time: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Person.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 255],
        // isAlphanumeric: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 255],
        isEmail: true,
      },
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 255],
        isAlpha: true,
      },
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 255],
        isAlpha: true,
      },
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 255],
        // isNumeric: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 255],
      },
    },
    birthdate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      defaultValue: "male",
      allowNull: false,
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    password_reset_code: {
      type: DataTypes.STRING,
      defaultValue: null,
      validate: {
        len: [
          config.get<number>("PASSWORD_RESET_CODE_LENGTH"),
          config.get<number>("PASSWORD_RESET_CODE_LENGTH"),
        ],
      },
    },
    password_reset_code_time: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
    sequelize,
    tableName: "person",
    modelName: "Person",
    indexes: [
      {
        unique: true,
        fields: ["email", "username", "phone_number"],
      },
    ],
  },
);

export default Person;
