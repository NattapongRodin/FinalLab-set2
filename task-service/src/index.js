require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Task Service is running' });
});

app.listen(PORT, () => {
  console.log(`Task Service running on port ${PORT}`);
});