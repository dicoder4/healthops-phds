export default {
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  extensionsToTreatAsEsm: ['.js', '.jsx'],
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx'],
  roots: ['<rootDir>/tests', '<rootDir>/client'],
};
