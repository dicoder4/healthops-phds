export default {
  testEnvironment: 'jsdom', // use 'node' if only backend; 'jsdom' needed for React
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  extensionsToTreatAsEsm: ['.js', '.jsx'],
  moduleFileExtensions: ['js', 'jsx'],
  testMatch: ['**/tests/**/*.test.js', '**/src/**/*.test.jsx'],
};
