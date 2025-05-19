const Horse = require('../models/Horse');

const generateSireNumber = async (birthYear) => {
  const yearPrefix = birthYear.toString().slice(-2); // "23" for 2023
  const regex = new RegExp(`^${yearPrefix}\\d{7}$`);

  const existingSires = await Horse.find({ sireNumber: regex })
    .select('sireNumber')
    .sort({ sireNumber: -1 })
    .limit(1)
    .lean();

  let nextSequence = 1;
  if (existingSires.length > 0) {
    const lastSire = existingSires[0].sireNumber;
    const lastSeq = parseInt(lastSire.slice(2), 10);
    nextSequence = lastSeq + 1;
  }

  const paddedSequence = nextSequence.toString().padStart(7, '0');
  return `${yearPrefix}${paddedSequence}`;
};

module.exports = generateSireNumber;
