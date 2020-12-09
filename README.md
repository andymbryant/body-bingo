# Body Bingo
This is a game that you play with your body! All you need is a webcam and a good attitude.

[Live link](https://www.bodybingo.net)


## Project Setup
If you want to play this game locally, you'll need to make sure that you have [npm](https://www.npmjs.com/get-npm) or [yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable) installed.

Start by cloning this repo or downloading and unzipping into a local directory. Navigate into that directory and install the packages with this command:
```
yarn install
```
or
```
npm install
```

Then run a dev server that will load the game into your default browser with this command:

```
yarn serve
```
or
```
npm run-script serve
```

That's it!

## Alternative Project Setup
If you'd rather work with the built distribution files, then you can visit this link to download them. Unzip that package and serve it locally using an HTTP server of your choice.

One example is to navigate into the unzipped directory and run these commmands:

```
npm install -g serve
serve -s dist
```