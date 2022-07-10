const CODE_MAP = [{
        z: ["Private", null],
        x: ["Local", null],
        glitch: ["Glitch", 10],
        buyvm: ["BuyVM", 15],
        extravm: ["ExtraVM", 40],
        hetzner: ["Hetzner", 50],
        ovh: ["OVH", 45],
        wsi: ["WSI", 50],
        vultr: ["Vultr", 30]
    }, {
        xyz: ["Local", "Localhost", null],
        unk: ["Unknown", "Unknown", null],
        svx: ["US West", "Silicon Valley, CA, US", -7],
        lax: ["US West", "Los Angeles, CA, US", -7],
        dal: ["USA", "Dallas, TX, US", -5],
        kci: ["USA", "Kansas City, MO, US", -5],
        vin: ["US East", "Vint Hill, VA, US", -4],
        mtl: ["US East", "Montreal, CA", -4],
        lon: ["Europe", "London, UK", 1],
        fra: ["Europe", "Frankfurt, DE", 2],
        fsn: ["Europe", "Falkenstein, DE", 2],
        sgp: ["Asia", "Singapore", 8]
    },
    [
        [{
            id: "x",
            D: "Private"
        }],
        [{
            id: "e",
            Ib: "word"
        }],
        [{
            id: "w",
            Ib: "words"
        }],
        [{
            id: "p",
            D: "Portal"
        }],
        [{
            id: "o",
            D: "Open"
        }],
        [{
            id: "m",
            D: "Maze",
            delay: !0,
            remove: "f"
        }],
        [{
            id: "f",
            D: "FFA"
        }, {
            id: "d",
            D: "Duos"
        }, {
            id: "s",
            D: "Squads"
        }, {
            id: "1",
            D: "1 Team",
            advance: !0
        }, {
            id: "2",
            D: "2 Team",
            advance: !0,
            end: "2TDM"
        }, {
            id: "3",
            D: "3 Team",
            advance: !0,
            end: "3TDM"
        }, {
            id: "4",
            D: "4 Team",
            advance: !0,
            end: "4TDM"
        }],
        [{
            id: "d",
            D: "Domination"
        }, {
            id: "m",
            D: "Mothership",
            remove: "2"
        }, {
            id: "a",
            D: "Assault",
            remove: ["m", "2"]
        }, {
            id: "s",
            D: "Siege",
            remove: "1"
        }, {
            id: "t",
            D: "Tag",
            remove: ["o", "4"]
        }, {
            id: "p",
            D: "Pandemic",
            remove: ["o", "2"]
        }, {
            id: "b",
            D: "Soccer",
            remove: "2"
        }, {
            id: "e",
            D: "Elimination",
            remove: ["o", "m", "4"]
        }, {
            id: "z",
            D: "Sandbox"
        }]
    ]
]

const parseGamemode = gamemode => {
    if (!gamemode || "%" === gamemode) return "Unknown";
    var b = CODE_MAP[2];
    let c = [],
        f = [];
    var e = 0;
    for (let z of b)
        for (let x of z)
            if (x.id === gamemode.charAt(e)) {
                e++;
                b = Object.assign({}, x);
                if ("word" === x.Ib) {
                    var h = parseInt(gamemode.charAt(e++), 36),
                        m = gamemode.slice(e, e + h);
                    b.D = m.charAt(0).toUpperCase() + m.slice(1);
                    e += h
                } else if ("words" === x.Ib) {
                    h = parseInt(gamemode.charAt(e++), 36);
                    m = [];
                    for (let C = 0; C < h; C++) {
                        var r = gamemode.charAt(e++);
                        if ("d" === r) m.push("-");
                        else if ("s" === r) m.push(" ");
                        else {
                            r = parseInt(r, 36);
                            let y = gamemode.slice(e, e + r);
                            m.push(y.charAt(0).toUpperCase() + y.slice(1));
                            e += r
                        }
                    }
                    b.D = m.join("")
                }
                x.remove && (Array.isArray(x.remove) ? f.push(...x.remove) : f.push(x.remove));
                c.push(b);
                break
            } if (0 === c.length) return "Unknown";
    gamemode = c[c.length - 1];
    gamemode.end && (gamemode.D = gamemode.end, gamemode.advance && (gamemode.advance = !1));
    for (gamemode = 0; gamemode + 1 < c.length; gamemode++) c[gamemode].delay && c[gamemode + 1].advance && (e = c[gamemode], c[gamemode] = c[gamemode + 1], c[gamemode + 1] = e, gamemode++);
    c = c.filter(({
        id: z
    }) => !f.includes(z));
    return c.map(z => z.D).join(" ")
}

const parseCode = (code) => {
    let [host, region, gamemode] = code.split('-');
    host = CODE_MAP[0][host][0];
    region = CODE_MAP[1][region][0];
    gamemode = parseGamemode(gamemode)
    return `[${host}] ${gamemode} - ${region}`
}

module.exports = parseCode