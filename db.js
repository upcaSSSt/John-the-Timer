import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('mydatabase', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'database.sqlite',
});

export const datesDb = sequelize.define('dates', {
  guildId: {
    type: Sequelize.STRING,
    unique: true,
  },
  noticeChannelId: Sequelize.STRING,
  defaultOffset: Sequelize.INTEGER,
  notices: Sequelize.TEXT,
  PastDate: Sequelize.TEXT,
  CountdownDate: Sequelize.TEXT,
  LongDate: Sequelize.TEXT,
  MultiDate: Sequelize.TEXT,
});
