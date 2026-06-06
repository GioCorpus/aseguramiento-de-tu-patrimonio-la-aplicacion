function generateClabe() {
  const digits = Array.from({ length: 18 }, () => Math.floor(Math.random() * 10));
  return digits.join('');
}

module.exports = {
  generateClabe
};
