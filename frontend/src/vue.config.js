/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";
var webpack = require("webpack");
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
  ],
  chainWebpack: (config) => {
    config.resolve.alias.set("vue", "@vue/compat");
    config.module
      .rule("vue")
      .use("vue-loader")
      .tap((options) => {
        return {
          ...options,
          compilerOptions: {
            compatConfig: {
              MODE: 2,
            },
          },
        };
      });
  },
};
