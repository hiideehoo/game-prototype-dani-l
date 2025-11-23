const readline = require('readline-sync');

// COORDINATES

let xAxis = 0;
let yAxis = 0;
let theEnd = false;
let rawMap = ["Home"];
let rawTotalMap = ["home", "cave"]
let playerMove = false;
let statusCompass = 0;
let statusMap = 0;

// LOCATIONS

class Location {
    constructor(name, coords, discovered, explore) {
        this.name = name
        this.coords = coords
        this.discovered = discovered
        this.explore = explore
    }
}

const locations = {}
locations["home"] = new Location("home", [0, 0], true, findHome);
locations["cave"] = new Location("cave", [0, 1], false, findCave);

function findHome() {
    let enterHome = "";
    do {
        enterHome = readline.question(`\n> You find your way back home.\n  Do you wish to enter? (y/n)\n>> `).toLowerCase();
        if (enterHome === "y") {
            console.log(`\n> You return home from your adventure.\n  Puppuccino is there to greet you at the counter.\n \n "[PUPPUCCINO] Hilo, friendo!\n  I got a treat or two if you wanna trade.\n  I'm also good for a chat :3"`);
            let exploreHome = false;
            do {
                exploreHome = readline.question(`\n> What do you do?\n  [1] Trade with Puppuccino.\n  [2] Have a fireside chat.\n  [3] Lodge in your room.\n  [4] Meander some more.\n>> `)
                switch (exploreHome) {
                    case "1": { console.log(`\n "[PUPPUCCINO] Let's see what we got."\n`); barter(); break; }
                    case "2": { console.log(`\n "[PUPPUCCINO] What's new with you?"`); break; }
                    case "3": { console.log(`\n> You pop a squat and take a load off in your room.`); container(homeChest); break; }
                    case "4": { console.log(`\n> You head outside for another adventure.`); break; }
                    default: { console.log(`\n> You ponder for a moment.`); }
                } if (exploreHome === "4") { return; }
            } while (exploreHome !== true);
        } else if (enterHome === "n") { return; }
        else { console.log(`> You ponder for a moment.`); }
    } while (enterHome !== "n");
}

function findCave() {
    if (locations["cave"].discovered === false) { rawMap.push("Cave"); locations['cave'].discovered = true; }
    let enterCave = "";
    do {
        enterCave = readline.question(`\n> You find a spooky cave.\n  Do you wish to enter? (y/n)\n>> `).toLowerCase();
        if (enterCave === "y") {
            console.log(`\n> You enter the cave.\n  To the left is a dusty old knapsack.\n  On your right is a bottomless(?) sinkhole.`);
            let exploreCave = false;
            do {
                exploreCave = readline.question(`> What do you do?\n  [1] Check the knapsack.\n  [2] Jump down the sinkhole.\n  [3] Leave.\n>> `);
                switch (exploreCave) {
                    case "1": { container(caveKnapsack); break; }
                    case "2": { console.log(`\n> You fall to your death. Obviously.\n`); theEnd = true; break; }
                    case "3": { console.log(`\n> You hit the dusty trail! Good riddance to that deathtrap.`); break; }
                    default: { console.log(`> You ponder for a moment.`); }
                }
                if (exploreCave === "2" || exploreCave === "3") { return; }
            } while (exploreCave !== true);
        } else if (enterCave === "n") { return; }
        else { console.log(`> You ponder for a moment.`); }
    } while (enterCave !== "n");
}

// ITEM CATALOGUE

class Item {
    constructor(name, value, category) {
        this.name = name;
        this.value = value;
        this.category = category;
    }
}

class Weapon extends Item {
    constructor(name, value, category, damage) {
        super(name, value, category);
        this.damage = damage;
    }
}

const items = {}
items['sword'] = new Weapon("sword", 500, "weapon", 5);
items['diamond'] = new Item("diamond", 10000, "gem");
items['emerald'] = new Item("emerald", 5000, "gem");
items['napkin'] = new Item("napkin", 1, "cloth");
items['compass'] = new Item("compass", 100, "tool");
items['map'] = new Item("map", 100, "tool");

// INVENTORY

class Entity {
    constructor(name, silver, rawInv) {
        this.name = name,
        this.silver = silver,
        this.rawInv = rawInv;
    }
}

let player = new Entity("", 10000, [[items['sword']], [items['diamond'], items['diamond']], [items['map'], items['compass'], items['napkin']]]);
player.name = readline.question(`> What is your name?\n>> `);

let pup = new Entity("Puppuccino", 10000, [[], [items['emerald']], [items['compass'], items['map']]]);

let caveKnapsack = new Entity("the Dusty Ol' Knapsack", 7, [[], [], [items["compass"]]]);
let homeChest = new Entity(`${player.name}'s chest`, 0, [[], [], []]);

// TRADE FUNCTIONS

function displayInventory(entity) {
    return `\n${entity.name.toUpperCase()}'S INVENTORY
Silver: ₵${entity.silver}
Weapons: ${entity.rawInv[0].map(i => `${i.name} (${i.damage}dmg, ₵${i.value})`).sort().join(", ")}
Gems: ${entity.rawInv[1].map(i => `${i.name} (₵${i.value})`).sort().join(", ")}
Misc: ${entity.rawInv[2].map(i => `${i.name} (₵${i.value})`).sort().join(", ")}`;
}

function gainItem(entity, item) {
    if (item.category === "weapon") {
        entity.rawInv[0].push(item);
    } else if (item.category === "gem") {
        entity.rawInv[1].push(item);
    } else {
        entity.rawInv[2].push(item);
    }
}

function loseItem(entity, item) {
    for (let i = 0; i < entity.rawInv.length; i++) {
        if (entity.rawInv[i].includes(item) === true) {
            entity.rawInv[i].splice(entity.rawInv[i].indexOf(item), 1);
        }
    }
}

function barter() {
    let selectTransfer = "";
    do {
        selectTransfer = readline.question(`> Would you like to buy, sell, or exit?\n>> `).toLowerCase();
        if (selectTransfer === "sell") { sell() }
        else if (selectTransfer === "buy") { buy() }
        else if (selectTransfer === "exit") { return }
    } while (selectTransfer !== "exit");

    function buy() {
        let selectPurchase = "";
        do {
            console.log(displayInventory(pup));
            console.log(displayInventory(player));
            selectPurchase = readline.question(`\n> Type an item to buy or type 'return.'\n>> `).toLowerCase();
            if (selectPurchase === 'return') { return };
            for (let i = 0; i < pup.rawInv.length; i++) {
                if (pup.rawInv[i].includes(items[selectPurchase]) === true) {
                    if (player.silver < items[selectPurchase].value) {
                        console.log(`\n> You can't afford the ${items[selectPurchase].name} right now.`);
                    } else {
                        loseItem(pup, items[selectPurchase]);
                        pup.silver += items[selectPurchase].value;
                        player.silver -= items[selectPurchase].value;
                        gainItem(player, items[selectPurchase]);
                    }
                }
            }
        } while (selectPurchase !== 'return');
    }

    function sell() {
        let selectOffload = "";
        do {
            console.log(displayInventory(pup));
            console.log(displayInventory(player));
            selectOffload = readline.question(`\n> Type an item to sell or type 'return.'\n>> `).toLowerCase();
            if (selectOffload === 'return') { return };
            for (let i = 0; i < player.rawInv.length; i++) {
                if (player.rawInv[i].includes(items[selectOffload]) === true) {
                    if (pup.silver < items[selectOffload].value) {
                        console.log(`\n> Puppuccino can't afford the ${items[selectOffload].name} right now.`);
                    } else {
                        loseItem(player, items[selectOffload]);
                        player.silver += items[selectOffload].value;
                        pup.silver -= items[selectOffload].value;
                        gainItem(pup, items[selectOffload]);
                    }
                }
            }
        } while (selectOffload !== 'return');
    }
}

function container(entity) {
    let selectTransfer = "";
    do {
        selectTransfer = readline.question(`> Would you like to 'loot' ${entity.name}, 'store' your belongings, or 'exit?'\n>> `).toLowerCase();
        if (selectTransfer === "loot") { loot() }
        else if (selectTransfer === "store") { store() }
        else if (selectTransfer === "exit") { return }
    } while (selectTransfer !== "exit");

    function loot() {
        let selectPurchase = "";
        do {
            console.log(displayInventory(entity));
            console.log(displayInventory(player));
            selectPurchase = readline.question(`\n> Type an item to loot or type 'return.'\n>> `).toLowerCase();
            if (selectPurchase === 'return') { return }
            else if (selectPurchase === "silver") {
                player.silver += entity.silver;
                entity.silver -= entity.silver;
            }
            for (let i = 0; i < entity.rawInv.length; i++) {
                if (entity.rawInv[i].includes(items[selectPurchase]) === true) {
                    loseItem(entity, items[selectPurchase]);
                    gainItem(player, items[selectPurchase]);
                }
            }
        } while (selectPurchase !== 'return');
    }

    function store() {
        let selectOffload = "";
        do {
            console.log(displayInventory(entity));
            console.log(displayInventory(player));
            selectOffload = readline.question(`\n> Type an item to store or type 'return.'\n>> `).toLowerCase();
            if (selectOffload === 'return') { return }
            else if (selectOffload === 'silver') {
                let howMuch = Number(readline.question(`> How much?\n>> `));
                if (typeof howMuch === "number" && howMuch <= player.silver) {
                    player.silver -= howMuch;
                    entity.silver += howMuch;
                } else if (typeof howMuch === "number" && howMuch > player.silver) {
                    entity.silver += player.silver;
                    player.silver = 0;
                }
            }
            for (let i = 0; i < player.rawInv.length; i++) {
                if (player.rawInv[i].includes(items[selectOffload]) === true) {
                    loseItem(player, items[selectOffload]);
                    gainItem(entity, items[selectOffload]);
                }
            }
        } while (selectOffload !== 'return');
    }
}

// TRAVEL FUNCTIONS

function travel() {

    let playerLocation = "";
    playerMove = false;
    console.log(`\n> Type a direction or type 'stay.'`);

    for (let i = 0; i < player.rawInv.length; i++) {
        if (player.rawInv[i].includes(items['compass']) === true) {
            statusCompass = true;
            console.log(`  Type 'compass' to check coordinates.`);
        } else { statusCompass = false }
    };


    for (let i = 0; i < player.rawInv.length; i++) {
        if (player.rawInv[i].includes(items['map']) === true) {
            statusMap = true;
            console.log(`  Type 'map' to fast travel to discovered locations.`);
        } else { statusMap = false; }
    };

    let playerTraverse = readline.question(`>> `).toLowerCase();
    if (playerTraverse === "north" || playerTraverse === "up") { playerMove = true; yAxis++; }
    else if (playerTraverse === "south" || playerTraverse === "down") { playerMove = true; yAxis--; }
    else if (playerTraverse === "west" || playerTraverse === "left") { playerMove = true; xAxis--; }
    else if (playerTraverse === "east" || playerTraverse === "right") { playerMove = true; xAxis++; }
    else if (playerTraverse === "stay") { playerMove = true; }
    else if (playerTraverse === "compass") {
        if (statusCompass === true) {
            console.log(`\n> Coordinates: (${xAxis}, ${yAxis})`);
        } else { console.log(`> You don't have a compass.`); }
    }
    else if (playerTraverse === "map") {
        if (statusMap === true) {
            console.log(`\n> ${rawMap.sort().join(`\n  `)}`);
            let fastTravel = readline.question(`\n> Type a location to travel to or type 'return.'\n>> `).toLowerCase();
            if (fastTravel === "return") { return; }
            for (let i = 0; i < rawMap.length; i++) {
                if (rawMap[i].toLowerCase() === locations[fastTravel].name) {
                    playerMove = true;
                    xAxis = locations[fastTravel].coords[0];
                    yAxis = locations[fastTravel].coords[1];
                    playerLocation = `(${xAxis}, ${yAxis})`;
                    for (let i = 0; i < rawTotalMap.length; i++) { if (playerLocation === `(${locations[rawTotalMap[i]].coords[0]}, ${locations[rawTotalMap[i]].coords[1]})` && playerMove === true) { locations[rawTotalMap[i]].explore(); } }
                    return;
                }
            }
        } else console.log(`> You don't have a map.`);
    }
    else { console.log(`> You rest for a moment.`); }
    if (yAxis > 5) { yAxis = 5; console.log(`> You've traveled too far. Turn back!`); }
    if (xAxis > 5) { xAxis = 5; console.log(`> You've traveled too far. Turn back!`); }
    if (yAxis < -5) { yAxis = -5; console.log(`> You've traveled too far. Turn back!`); }
    if (xAxis < -5) { xAxis = -5; console.log(`> You've traveled too far. Turn back!`); }
    playerLocation = `(${xAxis}, ${yAxis})`;

    for (let i = 0; i < rawTotalMap.length; i++) { if (playerLocation === `(${locations[rawTotalMap[i]].coords[0]}, ${locations[rawTotalMap[i]].coords[1]})` && playerMove === true) { locations[rawTotalMap[i]].explore(); } }
}

do { travel(); } while (theEnd !== true);