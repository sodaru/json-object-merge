/* eslint-disable */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/**.test.ts"],
  collectCoverageFrom: ["src/**/*.ts"],
  coverageReporters: ["text", "lcov"],
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  modulePathIgnorePatterns: ["<rootDir>/dist/"]
};
