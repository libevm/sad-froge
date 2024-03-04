import { Button, Frog, TextInput } from "frog";
import { randomInt } from "crypto";

enum Outcome {
  LOSE,
  WIN,
  DRAW,
}

export const app = new Frog<GameState>({
  // Supply a Hub API URL to enable frame verification.
  // hubApiUrl: 'https://api.hub.wevm.dev',
  initialState: {
    score: 0,
    outcome: Outcome.DRAW,
    userMove: "rock",
    aiMove: "rock,",
    seed: randomInt(0, 10)
  },
});

interface GameState {
  score: number;
  userMove: string;
  aiMove: string;
  outcome: Outcome;
  seed: number;
}

const getPlayOutcome = (
  userMove: string,
  prevRandom: number,
): { outcome: Outcome; aiMove: string } => {
  const returns = ["rock", "paper", "scissors"];
  const aiSelection = returns[prevRandom % 3];
  let outcome: Outcome = Outcome.DRAW;

  if (aiSelection === "scissors") {
    if (userMove === "rock") {
      outcome = Outcome.WIN;
    }
    if (userMove === "paper") {
      outcome = Outcome.LOSE;
    }
    if (userMove === "scissors") {
      outcome = Outcome.DRAW;
    }
  }

  if (aiSelection === "rock") {
    if (userMove === "paper") {
      outcome = Outcome.WIN;
    }
    if (userMove === "scissors") {
      outcome = Outcome.LOSE;
    }
    if (userMove === "rock") {
      outcome = Outcome.DRAW;
    }
  }

  if (aiSelection === "paper") {
    if (userMove === "scissors") {
      outcome = Outcome.WIN;
    }
    if (userMove === "rock") {
      outcome = Outcome.LOSE;
    }
    if (userMove === "paper") {
      outcome = Outcome.DRAW;
    }
  }

  return {
    outcome,
    aiMove: aiSelection,
  };
};

const getIntents = (outcome: Outcome) => {
  if (outcome === Outcome.LOSE) {
    return [
      <Button action="/">Play again 💀</Button>,
    ];
  }
  return [
    <Button action="/play" value="rock">
      ✊
    </Button>,
    <Button action="/play" value="paper">
      ✋
    </Button>,
    <Button action="/play" value="scissors">
      ✌️
    </Button>,
  ];
};

const getMoveEmoji = (s: string): string => {
  if (s === "paper") {
    return "✋";
  }
  if (s === "scissors") {
    return "✌";
  }
  if (s === "rock") {
    return "✊";
  }
  return "🖕";
};

app.frame("/play", (c) => {
  const { buttonValue, deriveState, inputText, status } = c;

  const state = deriveState((previousState) => {
    const fid = c.frameData?.fid;
    if (fid !== undefined) {
      // User move
      const userMove = buttonValue || "rock";
      const { outcome, aiMove } = getPlayOutcome(userMove, previousState.seed);

      if (outcome === Outcome.WIN) {
        previousState.score++;
      }

      previousState.seed = randomInt(0, 100)
      previousState.aiMove = aiMove;
      previousState.userMove = userMove;
      previousState.outcome = outcome;
    }
  });

  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background:
            status === "response"
              ? "linear-gradient(to right, #432889, #17101F)"
              : "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          {`(🎮: ${getMoveEmoji(state.userMove)}, 🤖: ${getMoveEmoji(
            state.aiMove
          )}) 🎲: ${state.score}`}
        </div>
      </div>
    ),
    intents: getIntents(state.outcome),
  });
});

app.frame("/", (c) => {
  const { deriveState, buttonValue, inputText, status } = c;

  deriveState(prevState => {
    prevState.seed = randomInt(0, 1000)
    prevState.score = 0
  })

  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background:
            status === "response"
              ? "linear-gradient(to right, #432889, #17101F)"
              : "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          Welcome
        </div>
      </div>
    ),
    intents: [
      <Button action="/play" value="rock">
        ✊
      </Button>,
      <Button action="/play" value="paper">
        ✋
      </Button>,
      <Button action="/play" value="scissors">
        ✌️
      </Button>,
    ],
  });
});

if (typeof Bun !== "undefined") {
  app.use("/*", (await import("hono/bun")).serveStatic({ root: "./public" }));
  Bun.serve({
    fetch: app.fetch,
    port: 3000,
  });
  console.log("Server is running on port 3000");
}
