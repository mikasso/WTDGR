module.exports = {
  devServer: {
    proxy: {
      "^/graphHub": {
        target: "https://localhost:5001",
        changeOrigin: true,
      },
    },
  },
};
