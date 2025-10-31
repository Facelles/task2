import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './User';

export interface PostAttributes {
  id?: number;
  title: string;
  content: string;
  status: 'draft' | 'published';
  userId: number;
}

export class Post extends Model<PostAttributes, Optional<PostAttributes, 'id'>> implements PostAttributes {
  public id!: number;
  public title!: string;
  public content!: string;
  public status!: 'draft' | 'published';
  public userId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published'),
      allowNull: false,
      defaultValue: 'draft',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'posts',
    modelName: 'Post',
    timestamps: true,
  }
);

User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });

export default Post;
