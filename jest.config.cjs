module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  transform: { "^.+\\.(ts|tsx)$": "ts-jest" },
  moduleNameMapper: {
    "^@shared/(.*)$": "<rootDir>/shared/$1",
    "^@/(.*)$": "<rootDir>/client/src/$1"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};