const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 8000;

// Connect to MongoDB & Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`Smart Inventory Backend Server`);
    console.log(`Running on PORT: http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=================================`);
  });
});
