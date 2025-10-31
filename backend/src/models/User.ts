import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import bcrypt from 'bcryptjs';

export interface UserAttributes {
  id?: number;
  username: string;
  password: string;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;


  public checkPassword(password: string) {
    return bcrypt.compareSync(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, tableName: 'users' }
);

User.beforeCreate(async (user) => {
  user.password = bcrypt.hashSync(user.password, 10);
});

export default User;