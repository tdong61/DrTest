const uuid = require('uuid');

// Generate a random primary key
function generatePrimaryKey() {
  const timestamp = new Date().getTime();
  const uniqueId = uuid.v4().replace(/-/g, ''); // Remove dashes from UUID

  return `${timestamp}-${uniqueId}`;
}

// Generate an array of random primary keys
function generateRandomPrimaryKeys(count) {
  const primaryKeyList = [];
  for (let i = 0; i < count; i++) {
    const randomPrimaryKey = generatePrimaryKey();
    primaryKeyList.push(randomPrimaryKey);
  }
  return primaryKeyList;
}

module.exports = {
  generateRandomPrimaryKeys,
};
