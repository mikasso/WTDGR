module.exports = {
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
  devServer: {
    proxy: {
      "^/graphHub": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
};
