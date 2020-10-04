module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	setupFilesAfterEnv: ['./setupTests.ts'],
	snapshotSerializers: ['enzyme-to-json/serializer'],
	rootDir: '.',
	testPathIgnorePatterns: ['dist', 'out', 'node_modules', '.storybook', 'cypress'],
}
