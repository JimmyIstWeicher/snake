const { WebSocketServer } = require("ws");
const sockserver = new WebSocketServer({ port: 3000 });
let firstID = "";
let secondID = "";
let myInterval;
let msg1 = "ArrowDown";
let msg2 = "ArrowDown";
let full = false;
let firstName;
let secondName;
sockserver.getUniqueID = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + "-" + s4();
};
sockserver.on("connection", (ws) => {
  if (full) {
    ws.close();
  } else {
    ws.id = sockserver.getUniqueID();
    console.log("New client connected!");
    if (firstID != "") {
      secondID = ws.id;
      ws.send("zweiter");

      if (sockserver.clients.size > 1) {
        full = true;
      }

      console.log("Alle verbunden, los gehts :)");
      //startGame();
    } else {
      firstID = ws.id;
      ws.send("erster");

      if (sockserver.clients.size > 1) {
        full = true;
      }
    }
    ws.send("id" + ws.id);

    ws.on("close", () => {
      console.log("Client " + ws.id + " has disconnected!");
      if (firstID == ws.id) {
        firstID = "";
        full = false;
      } else {
        secondID = "";
        full = false;
      }
    });
    ws.on("message", (data) => {
      let msg = `${data}`;
      const id2 = ws.id;
      if (msg.slice(0, 5) == "name:") {
        if (id2 == firstID) {
          firstName = msg.slice(5);
        } else {
          secondName = msg.slice(5);
        }
      }

      if (msg == "start" && firstID != "" && secondID != "") {
        console.log("Alle verbunden, los gehts :)");
        startGame();
      }
      if (msg.slice(0, 13) == firstID) {
        msg1 = msg.slice(13);
      } else if (msg.slice(0, 13) == secondID) {
        msg2 = msg.slice(13);
      }
    });
    ws.onerror = function () {
      console.log("websocket error");
    };
  }
});

let game = {};

function init() {
  msg1 = "ArrowDown";
  msg2 = "ArrowDown";
  game = {
    player: [
      {
        name: firstName,
        color: {
          color: "blue",
        },
        points: {
          points: 1,
        },
        pos: {
          x: 10,
          y: 2,
        },
        direction: {
          x: 0,
          y: 0,
        },
        body: [
          { x: 10, y: 0 },
          { x: 10, y: 1 },
          { x: 10, y: 2 },
        ],
      },
      {
        name: secondName,
        color: {
          color: "blue",
        },
        points: {
          points: 1,
        },
        pos: {
          x: 20,
          y: 2,
        },
        direction: {
          x: 0,
          y: 0,
        },
        body: [
          { x: 20, y: 0 },
          { x: 20, y: 1 },
          { x: 20, y: 2 },
        ],
      },
    ],
    food: {
      x: 15,
      y: 15,
    },
  };
}
function gameLoop(game) {
  //console.log("Player One " + msg1);
  switch (msg1) {
    case "ArrowUp":
      game.player[0].direction.x = 0;
      game.player[0].direction.y = -1;
      break;
    case "ArrowRight":
      game.player[0].direction.x = +1;
      game.player[0].direction.y = 0;
      break;
    case "ArrowDown":
      game.player[0].direction.x = 0;
      game.player[0].direction.y = +1;
      break;
    case "ArrowLeft":
      game.player[0].direction.x = -1;
      game.player[0].direction.y = 0;
      break;
  }

  //console.log("Player Two " + msg2);
  switch (msg2) {
    case "ArrowUp":
      game.player[1].direction.x = 0;
      game.player[1].direction.y = -1;
      break;
    case "ArrowRight":
      game.player[1].direction.x = 1;
      game.player[1].direction.y = 0;
      break;
    case "ArrowDown":
      game.player[1].direction.x = 0;
      game.player[1].direction.y = +1;
      break;
    case "ArrowLeft":
      game.player[1].direction.x = -1;
      game.player[1].direction.y = 0;
      break;
  }

  let playerOne = game.player[0];
  let playerTwo = game.player[1];

  playerOne.pos.x += playerOne.direction.x;
  playerTwo.pos.x += playerTwo.direction.x;
  playerOne.pos.y += playerOne.direction.y;
  playerTwo.pos.y += playerTwo.direction.y;

  playerOne.body.push({ x: playerOne.pos.x, y: playerOne.pos.y });
  playerTwo.body.push({ x: playerTwo.pos.x, y: playerTwo.pos.y });

  playerOne.body.shift();
  playerTwo.body.shift();

  let playerOneX = playerOne.pos.x;
  let playerOneY = playerOne.pos.y;

  let playerTwoX = playerTwo.pos.x;
  let playerTwoY = playerTwo.pos.y;

  if (playerOneX > 30 || playerOneX < 0 || playerOneY > 30 || playerOneY < 0) {
    clearInterval(myInterval);
    game.player[1].points.points += 5;
    evaluate();

    return;
  }

  if (playerTwoX > 30 || playerTwoX < 0 || playerTwoY > 30 || playerTwoY < 0) {
    clearInterval(myInterval);
    game.player[0].points.points += 5;
    evaluate();
    return;
  }

  let i = 0;

  while (i < game.player[0].body.length - 1) {
    let cell2 = game.player[0].body[i];

    if (
      cell2.x == game.player[0].body[game.player[0].body.length - 1].x &&
      cell2.y == game.player[0].body[game.player[0].body.length - 1].y
    ) {
      clearInterval(myInterval);
      game.player[1].points.points += 5;
      evaluate();
      return;
    }
    i++;
  }

  i = 0;
  while (i < game.player[1].body.length - 1) {
    //console.log("debug");
    let cell2 = game.player[1].body[i];
    //console.log(cell2.x);

    if (
      cell2.x == game.player[1].body[game.player[1].body.length - 1].x &&
      cell2.y == game.player[1].body[game.player[1].body.length - 1].y
    ) {
      clearInterval(myInterval);
      game.player[0].points.points += 5;
      evaluate();
      return;
    }
    i++;
  }

  i = 0;
  while (i < game.player[0].body.length) {
    let cell2 = game.player[0].body[i];

    if (cell2.x == game.player[1].pos.x && cell2.y == game.player[1].pos.y) {
      clearInterval(myInterval);
      game.player[0].points.points += 5;
      evaluate();
      return;
    }
    i++;
  }

  i = 0;
  while (i < game.player[1].body.length) {
    let cell2 = game.player[1].body[i];

    if (cell2.x == game.player[0].pos.x && cell2.y == game.player[0].pos.y) {
      clearInterval(myInterval);
      game.player[1].points.points += 5;
      evaluate();

      return;
    }
    i++;
  }

  if (playerOneX == game.food.x && playerOneY == game.food.y) {
    console.log("food!");
    game.player[0].points.points += 1;
    speedUp(200 / game.player[1].points.points + game.player[2].points.points);

    playerOne.body.push({
      x: playerOne.body[playerOne.body.length - 1].x,
      y: playerOne.body[playerOne.body.length - 1].y,
    });

    game.food.x = createRandomPos();
    game.food.y = createRandomPos();
  }
  if (playerTwoX == game.food.x && playerTwoY == game.food.y) {
    console.log("food!");
    game.player[1].points.points += 1;
    speedUp(200 / game.player[1].points.points + game.player[2].points.points);
    playerTwo.body.push({
      x: playerTwo.body[playerTwo.body.length - 1].x,
      y: playerTwo.body[playerTwo.body.length - 1].y,
    });
    game.food.x = createRandomPos();
    game.food.y = createRandomPos();
  }

  return game;
}

function startGame() {
  init();
  console.log("start");
  myInterval = setInterval(intervalFunction, 120);
}

function speedUp(speed) {
  clearInterval(myInterval);
  myInterval = setInterval(intervalFunction, speed);
}

function intervalFunction() {
  let myGame = gameLoop(game);
  sockserver.clients.forEach((client) => {
    client.send(JSON.stringify(myGame));
  });
}

function createRandomPos() {
  return Math.floor(Math.random() * 27) + 3;
}

function evaluate() {
  if (game.player[0].points.points > game.player[1].points.points) {
    sockserver.clients.forEach((client) => {
      client.send("loser:" + secondID);
    });
  } else {
    sockserver.clients.forEach((client) => {
      client.send("loser:" + firstID);
    });
  }
}
