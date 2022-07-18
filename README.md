# Arras DB

A bot built to scan all [arras.io](https://arras.io) game servers (besides sandbox) in search of bulk server and player data. This bot was run 5 days straight, althought [arras.io#oc](https://arras.io#oc) and [arras.io#ob](https://arras.io#ob) were not processed for majority of the run (due lack of IPv6 support on those servers).

## About the Dump

For perspective, every server in arras.io (identifiable by a unique id, for example #oc, #ha, #wa etc) runs a single gamemode at a time, and each gamemode has a series of players. Our bot collected gamemode meta data from the arras.io gamemode "status" API, and it collected player data from both the leaderboard as well as in game. The database is accessable in JSON format (zipped) at [`/arras.json.zip`](./arras.json.zip), while the more compressed formats are located in the `/db/` folder.

## Layout of the Database

(WIP - this will be completed and written to text for non coders soon)
```ts
interface Game {
  // Meta includes data like mspt, uptime, and game/server information
  meta: GameMeta;
}
interface GameMeta {
  // The average milliseconds per tick in the game (retrieved from API)
  // Example:
  //   "mspt": 4.856888294219971
  mspt: number; // double (f64)
  // The uptime of the game in seconds
  // Example:
  //   "uptime": 17781.03125
  uptime: number; // double (f64)
  // The unparsed code of the server, you can use lib/parseCode to parseCode(code: string): string and see a more readable format
  // Example:
  //   "code": "vultr-sgp-mf"
  code: string;
  // The host server of the game (its technically specific to server ID, but it was put here anyway)
  // Example:
  //   "host": "f6jklqqdgr0l0kbm.uvwx.xyz:5001"
  host: string;
}
```

## Executing

After putting your CaptchaV3Solver™ API_TOKEN into config.js, see below

### Standalone

```
npm install
npm run start
```

### Using Docker

```bash
docker build .

docker start
```
