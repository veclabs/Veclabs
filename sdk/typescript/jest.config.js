module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  // Tests share a .veclabs scratch dir on disk — run serially to avoid races
  maxWorkers: 1,
};
