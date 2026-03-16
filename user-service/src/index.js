require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'User Service is running' });
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});