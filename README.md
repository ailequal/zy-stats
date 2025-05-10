## zy-stats

Fetch Zyxel's stats from the CLI.

I already know that the Zyxel's UI has already a built-in way to log most information, but I still wanted to write this tool, mainly for checking the stats from the CLI in a pretty way.

To use this program, you need to fill the `.env` file properly. Right now the automatic first login setup is not supported. So you'll have to login manually from a browser and get from there the needed credentials. Check the `.env.example` file for more information.

To use it, first make sure to have Node.js `v22.15.0` installed (use [nvm](https://github.com/nvm-sh/nvm) to install it with `nvm use`). Then run the following commands:

```bash
nvm use # set the correct nodejs version
npm install # install dependencies
npm run start # shows stats nicely formatted into the terminal
npm run start -- --log # shows stats in JSON format into the terminal and log them into a file
```

## Resources

- [miononno.it/router/zyxel-lte5398-m904](https://miononno.it/router/zyxel-lte5398-m904)
- [forum.fibra.click/d/39114-aggiornamento-firmware-zyxel-lte5398-m904](https://forum.fibra.click/d/39114-aggiornamento-firmware-zyxel-lte5398-m904)

## Third party libraries

A list of potentially useful libraries to use in this project:

- [tj/commander.js](https://github.com/tj/commander.js)
- [yargs/yargs](https://github.com/yargs/yargs)
- [oclif/oclif](https://github.com/oclif/oclif)

- [chalk/chalk](https://github.com/chalk/chalk)
- [SBoudrias/Inquirer.js](https://github.com/SBoudrias/Inquirer.js)

- [motdotla/dotenv](https://github.com/motdotla/dotenv)
- [dotenvx/dotenvx](https://github.com/dotenvx/dotenvx)

- [winstonjs/winston](https://github.com/winstonjs/winston)
