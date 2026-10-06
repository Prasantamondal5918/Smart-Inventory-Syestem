const seedDB = async () => {
  console.warn('Database seeding is disabled. Create records through the real application flow only.');
  process.exit(0);
};

if (require.main === module) {
  seedDB();
}

module.exports = seedDB;
