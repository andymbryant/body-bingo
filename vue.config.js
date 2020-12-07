module.exports = {
  chainWebpack: (config) => {
    config
      .plugin('html')
      .tap((_args) => {
        const args = _args;
        args[0].title = 'Body Bingo';
        args[0].description = "Let's throw some shapes!";
        return args;
      });
  },
};
