const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const verifyOTP = (providedOTP, storedOTP) => {
  return providedOTP === storedOTP;
};

module.exports = {
  generateOTP,
  verifyOTP
};