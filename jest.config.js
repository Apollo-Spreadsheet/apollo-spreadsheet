module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./setupTests.ts'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  rootDir: '.',
  testPathIgnorePatterns: ['dist', 'out', 'node_modules', '.storybook', 'cypress'],
}
