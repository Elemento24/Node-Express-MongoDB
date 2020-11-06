const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', err => {
  console.log('UNHANDLED EXCEPTION! Shutting Down ...');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB Connection Successful'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App runnin on port ${port}`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting Down ...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', err => {
  console.log('UNHANDLED EXCEPTION! Shutting Down ...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});