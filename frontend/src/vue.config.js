module.exports = {
    devServer: {
      proxy:{
      '^/graphHub': {
        target: 'https://localhost:44330',
        changeOrigin: true
      }
    }
  }
}