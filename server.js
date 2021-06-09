require('dotenv').config();

process.on('uncaughtException', err => {
  // eslint-disable-next-line no-console
  console.log('Uncaught Exception! shutting down...');
  // eslint-disable-next-line no-console
  console.log(`Error-name:${err.name}`, `\nError-message:${err.message}`);
  process.exit(1);
});

const mongoose = require('mongoose');
const app = require('./app');

const dbURL = process.env.DATABASE_URL.replace(
  '<USERNAME>',
  process.env.DATABASE_USERNAME
).replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection successful..');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`server started on port ${port}..`);
});

process.on('unhandledRejection', err => {
  // eslint-disable-next-line no-console
  console.log('Unhandled Rejection! shutting down...');
  // eslint-disable-next-line no-console
  console.log(`Error-name:${err.name}`, `\nError-message:${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
