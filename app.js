import express from 'express';

const port = process.env.PORT || 9075;
const app = express();

app.get("/", (req, res) => {
  res.send('Hello world!');
});

app.listen(port, () => {
  console.log(`Server running listening on port ${port}.`);
}).on('error', (e) => {
  console.error(e);
});
