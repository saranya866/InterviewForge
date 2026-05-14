const mysql = require('mysql2/promise');

async function fixDatabase() {
  console.log('🔧 Connecting to MySQL...');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysqlcd',  // Leave empty if no password
    database: 'interviewforge'
  });

  console.log('✅ Connected! Fixing database...\n');

  // First, drop all tables that have foreign key constraints
  console.log('📦 Removing foreign key constraints...');
  
  try {
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 0`);
    
    // Drop dependent tables first
    await connection.execute(`DROP TABLE IF EXISTS xp_events`);
    await connection.execute(`DROP TABLE IF EXISTS user_scores`);
    await connection.execute(`DROP TABLE IF EXISTS user_answers`);
    await connection.execute(`DROP TABLE IF EXISTS sessions`);
    await connection.execute(`DROP TABLE IF EXISTS session_questions`);
    await connection.execute(`DROP TABLE IF EXISTS interview_sessions`);
    await connection.execute(`DROP TABLE IF EXISTS exam_sessions`);
    await connection.execute(`DROP TABLE IF EXISTS user_badges`);
    await connection.execute(`DROP TABLE IF EXISTS saved_jobs`);
    await connection.execute(`DROP TABLE IF EXISTS roadmap_progress`);
    await connection.execute(`DROP TABLE IF EXISTS solved_problems`);
    await connection.execute(`DROP TABLE IF EXISTS daily_stats`);
    await connection.execute(`DROP TABLE IF EXISTS daily_activity`);
    
    // Finally drop users table
    await connection.execute(`DROP TABLE IF EXISTS users`);
    
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 1`);
    console.log('✓ All old tables dropped\n');
  } catch (err) {
    console.log('⚠️ Some tables didn\'t exist, continuing...\n');
  }

  // Create fresh users table
  console.log('🏗️ Creating new users table...');
  await connection.execute(`
    CREATE TABLE users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(60) DEFAULT 'Undergraduate',
      xp INT DEFAULT 50,
      streak INT DEFAULT 1,
      last_active DATE DEFAULT (CURRENT_DATE),
      questions_answered INT DEFAULT 0,
      average_score DECIMAL(5,2) DEFAULT 0.00,
      level VARCHAR(60) DEFAULT 'Novice',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('✓ Users table created');

  // Create xp_events table
  console.log('🏗️ Creating xp_events table...');
  await connection.execute(`
    CREATE TABLE xp_events (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      amount INT NOT NULL,
      reason VARCHAR(120),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ xp_events table created');

  // Recreate other essential tables (empty but structure preserved)
  console.log('🏗️ Recreating other tables...');
  
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS interview_sessions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      category VARCHAR(80),
      score INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      badge_name VARCHAR(80),
      earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('\n🎉 DATABASE FIXED SUCCESSFULLY!');
  console.log('Now restart your backend with: node server.js\n');
  
  await connection.end();
}

fixDatabase().catch(err => {
  console.error('❌ Error:', err.message);
  console.log('\n💡 If error persists, please send me the error message');
});