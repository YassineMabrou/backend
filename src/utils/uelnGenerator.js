const Horse = require('../models/Horse');

// Generate UELN: SIRE number + 6-digit sequential suffix
const generateUELN = async (sireNumber) => {
  const regex = new RegExp(`^${sireNumber}\\d{6}$`);

  const lastHorse = await Horse.findOne({ sireKey: regex })
    .sort({ sireKey: -1 })
    .select('sireKey')
    .lean();

  let nextSuffix = '000001';
  if (lastHorse) {
    const lastSuffix = parseInt(lastHorse.sireKey.slice(9), 10);
    nextSuffix = String(lastSuffix + 1).padStart(6, '0');
  }

  return sireNumber + nextSuffix;
};

module.exports = generateUELN;
