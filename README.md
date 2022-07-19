# Arras DB

A bot built to scan all [arras.io](https://arras.io) game servers (besides sandbox) in search of bulk server and player data. This bot was run 5 days straight, althought [arras.io#oc](https://arras.io#oc) and [arras.io#ob](https://arras.io#ob) were not processed for majority of the run (due lack of IPv6 support on those servers).

## About the Dump

For perspective, every server in arras.io (identifiable by a unique id, for example #oc, #ha, #wa etc) runs a single gamemode at a time, and each gamemode has a series of players. Our bot collected gamemode meta data from the arras.io gamemode "status" API, and it collected player data from both the leaderboard as well as in game. The database is accessable in JSON format (zipped) at [`/arras.json.zip`](./arras.json.zip), while the more compressed formats are located in the `/db/` folder.

## Layout of the Database

(Section of the README is WIP - this will be completed and written to text for non coders soon)
```ts
// arras.json is an array of `Game`s
interface Game {
  // Contains the identifier for the server / vps
  // (insert id into arras.io#${id} to get the server link)
  // Example:
  //   "id": "vcx"
  id: string; // ascii (len is 1 to 3)
  // The start time of the server / when the server first
  // started being scanned
  // Example:
  //   "start": 1657424582585
  start: number; // float64
  // Meta includes data like mspt, uptime, and game/server information
  meta: GameMeta;
  // The amount of players retrieved from the scanning
  // Example:
  //   "playerCount": 272
  playerCount: number; // uint16
  // Array of player datas (array.length === playerCount)
  players: PlayerData[];
}

interface GameMeta {
  // The average milliseconds per tick in the game (retrieved from API)
  // Example:
  //   "mspt": 4.856888294219971
  mspt: number; // float32
  // The uptime of the game in seconds
  // Example:
  //   "uptime": 17781.03125
  uptime: number; // float32
  // The unparsed code of the server, you can use lib/parseCode
  // to parseCode(code: string): string and see a more readable format
  // Example:
  //   "code": "vultr-sgp-mf"
  code: string; // ascii
  // The host server of the game (its technically specific to
  // server ID, but it was put here anyway)
  // Example:
  //   "host": "f6jklqqdgr0l0kbm.uvwx.xyz:5001"
  host: string; // ascii
}

interface PlayerData {
  // The player's body's entity id - part of the in game
  // protocol and can be used for identifying players per game
  // Example:
  //   "id": 197956
  id: number;
  // The player's in game name
  // Example:
  //   "name": "!"
  name: string; // utf8
  // The player's team color (part of the arras protocol)
  // Example:
  //   "teamColor": 12;
  teamColor: number; // uint8
  // Whether or not the player data was collected from
  // the leaderboard or not (if false, found in from fov)
  // Example:
  //   "onLb": true
  onLb: boolean; // bool
  // Name of the player's last tank
  // Example:
  //   "tankName": "Falcon"
  tankName: string; // utf8
  // Uptime of the server when the player was first found
  // Example:
  //   "firstSeen": 9854.556640625
  firstSeen: number; // float32
  // Uptime of the server when the player was last seen
  // Example:
  //   "lastSeen": 9948.310546875
  lastSeen: number; // float32
  // The last seen score of the player
  // Example:
  //   "lastSeenScore": 283571
  lastSeenScore: number; // float32
}
```

## Executing

> Be warned, the headless bot code is now outdated as of July 18th - use at your own risk

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

## Credits

- Thank you to [Altanis](https://github.com/CoderSudaWuda) for preliminaries on the socket interface, as well as for providing servers to host recaptcha solvers.

- Thank you to [bird](https://github.com/lolbird) for running the bot for more than 80% of its lifetime (he saved the project).

- Thank you to [cx88](https://github.com/CX88) for being the developer of arras
