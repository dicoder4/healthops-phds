export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  extensionsToTreatAsEsm: ['.jsx'], // ❌ DO NOT include '.js'
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
  },
};
