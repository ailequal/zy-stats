## zy-stats

Fetch Zyxel's stats from the CLI in a pretty way.

## Device support

The following Zyxel router models are supported:

- Zyxel Nebula FWA505 (default, `--device fwa505`)
- Zyxel LTE5398-M904 (`--device lte5398`)

## Setup

To use it, first make sure to have the compatible Node.js version active ([nvm](https://github.com/nvm-sh/nvm) executes `nvm use`).

Beware that `zy-stats` needs Google Chrome installed on the host machine to perform the log in successfully through Puppeteer.

To use this program, you need to fill the `.env` file properly (or directly pass the environment variables as CLI arguments). Check the `.env.example` file for more information.

Here below are listed the basic steps to install and run the program:

```bash
git clone https://github.com/ailequal/zy-stats.git
cd zy-stats
chmod +x ./src/app.ts # make the script executable
nvm use # set the correct nodejs version
npm install --omit=dev # install only the production dependencies

cp .env.example .env  # fill in your router credentials

npx zy-stats # shows stats nicely formatted into the terminal
npx zy-stats --server-url 'http://192.168.1.1' --username admin --password 'password' --interval 5 # without filling the .env file
npm exec zy-stats -- --server-url 'http://192.168.1.1' --username admin --password 'password' --interval 5 # or like this
npm run start -- --server-url 'http://192.168.1.1' --username admin --password 'password' --interval 5 # or like this

# handy alias
alias zy-stats="cd ~/path-to-repos/zy-stats && nvm use && npx zy-stats"
```

## Docker

The Docker setup bundles Node.js and Chromium into a single image, so that no local Node.js or Chrome installation is required on the host. Two modes are available: **production** (lean, source baked in) and **development** (full toolchain, source mounted from the host).

### Production

The production image contains only the production dependencies and the application source. Use it to run the program without any local setup.

Logs land in the same `./logs/` directory as the non-Docker setup and survive container restarts and rebuilds.

```bash
cp .env.example .env  # fill in your router credentials
just docker-build
just docker-up-detached
```

### Development

The development image installs all dependencies (including devDependencies). The project directory is bind-mounted into the container, so source code changes are reflected immediately; no rebuild needed after editing files. Only rebuild after changing `package.json` or `package-lock.json`.

```bash
cp .env.example .env  # fill in your router credentials
just docker-dev-build
just docker-dev-up-detached
```


## CLI arguments

- `--no-headless`: disable browser headless mode (useful for debugging).
- `--server-url`: the URL of the Zyxel router.
- `--username`: the username to access the Zyxel router.
- `--password`: the password to access the Zyxel router.
- `--interval`: the interval in seconds to fetch the stats.
- `--log`: log the stats into a file in JSON format.
- `--device`: the router model (`fwa505` or `lte5398`, default: `fwa505`).

## Development

Built with native TypeScript via Node.js >= 24 type stripping (no build step, no transpiler). Inspired by [marcoturi/fastify-boilerplate](https://github.com/marcoturi/fastify-boilerplate).

If you have [just](https://github.com/casey/just) installed, run `just` to list all available recipes and run them quickly.

## Resources

- [Zyxel Nebula FWA505](https://www.zyxel.com/global/en/products/mobile-broadband/nebula-5g-nr-indoor-router-nebula-fwa505)
- [miononno.it/router/zyxel-fwa-505](https://miononno.it/router/zyxel-fwa-505)
- [Zyxel LTE5398-M904](https://www.zyxel.com/global/en/products/mobile-broadband/4g-lte-a-pro-indoor-iad-lte5398-m904)
- [miononno.it/router/zyxel-lte5398-m904](https://miononno.it/router/zyxel-lte5398-m904)
