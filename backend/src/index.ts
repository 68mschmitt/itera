import dotenv from 'dotenv';
import app from './app.js';
import './config/database.js'; // Initialize database and run migrations

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 Ollama URL: ${process.env.OLLAMA_BASE_URL_ITERA || 'http://localhost:11434'}`);
});
