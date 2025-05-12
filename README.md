## zy-stats

Fetch Zyxel's stats from the CLI.

I already know that the Zyxel's UI has already a built-in way to log most information, but I still wanted to write this tool, mainly for checking the stats from the CLI in a pretty way.

## Setup

To use it, first make sure to have Node.js `v22.15.0` installed (use [nvm](https://github.com/nvm-sh/nvm) to install it with `nvm use`).

Beware that `zy-stats` needs Google Chrome installed on the host machine to perform the log in successfully thorugh Puppeteer.

To use this program, you need to fill the `.env` file properly (or directly pass the environment variables as CLI arguments). Check the `.env.example` file for more information.

Here below are listed the basic steps to install and run the program:

```bash
git clone https://github.com/ailequal/zy-stats.git
cd zy-stats
chmod +x ./src/app.js # make the script executable
nvm use # set the correct nodejs version
npm install --omit=dev # install only the production dependencies

# fill the .env file with the correct credentials
npx zy-stats # shows stats nicely formatted into the terminal
npx zy-stats --server-url 'http://192.168.1.1' --username admin --password 'password' --interval 5 # or without filling the .env file
```

## CLI arguments

- `--no-headless`: disable browser headless mode (useful for debugging).
- `--server-url`: the URL of the Zyxel router.
- `--username`: the username to access the Zyxel router.
- `--password`: the password to access the Zyxel router.
- `--interval`: the interval in seconds to fetch the stats.
- `--log`: log the stats into a file in JSON format.

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
