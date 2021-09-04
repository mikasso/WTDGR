module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    "plugin:vue/base",
    // 'plugin:vue/recommended' // Use this if you are using Vue.js 2.x.
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'vue/no-unused-vars': 'error'
    "no-restricted-syntax": ["error"],
    "no-restricted-properties": [
      2,
      {
        property: "__defineGetter__",
        message: "Please use Object.defineProperty instead.",
      },
    ],
  },
};
