module.exports = {
  postcss: () => {
    return [
      /* eslint-disable global-require */
      require('postcss-preset-env')({
        stage: 0, // required to get all features that were from cssnext without enabling them one by one
        features: {
          'custom-properties': {
            preserve: false, // required to output values instead of variables
          },
          'color-mod-function': true, // required to use color-mod()
        }
      }),
      require('postcss-calc'), // required as postcss-preset-env doesn't have a reduce calc() funtion that cssnext did
      /* eslint-enable global-require */
    ];
  },
};
