

export default {
  e2e: {
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser: any = {}, launchOptions) => {
        if (browser.family === 'chromium') {
          launchOptions.args.push('--no-sandbox')
          launchOptions.args.push('--allow-file-access-from-files')
          launchOptions.args.push('--use-fake-ui-for-media-stream')
          launchOptions.args.push('--use-fake-device-for-media-stream')
          // @todo: Probably make it more dynamic for more tests?
          launchOptions.args.push('--use-file-for-fake-audio-capture=tests/assets/1.wav');
        }

        return launchOptions
      })
    },
  },
};
