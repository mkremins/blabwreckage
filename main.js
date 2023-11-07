const fs = require("fs");
const probs = JSON.parse(fs.readFileSync("./modelsmol.json").toString());
function prob(str) {
  str = `^${str.replace(/[^a-zA-Z]/, "")}$`;
  let prb = 1;
  for (let i = 0; i < str.length - 2; i++) {
    const fst = str[i];
    const snd = str[i + 1];
    const thd = str[i + 2];
    prb *= (probs[fst + snd] || {})[thd] || 0.00000001;
  }
  return prb;
}
const abet = "abcdefghijklmnopqrstuvwxyz";
function setchr(str, pos, chr) {
  return str.substring(0, pos) + chr + str.substring(pos + 1);
}
function mutate(str) {
  const edits = [];
  for (let i = 0; i < str.length; i++) {
    for (let j = 0; j < abet.length; j++) {
      if (str[i] === abet[j]) continue; // prevent null edits
      if (!/[a-zA-Z]/.test(str[i])) continue; // leave punctuation alone
      edits.push(setchr(str, i, abet[j]));
    }
  }
  //console.log(edits.map(x => [x, prob(x)]));
  return edits;
}
function bestmuts(str, n) {
  const muts = mutate(str);
  muts.sort((a, b) => prob(b) - prob(a));
  return muts.slice(0, n);
}
function randnth(xs) {
  return xs[Math.floor(Math.random() * xs.length)];
}
function warp(str) {
  return randnth(bestmuts(str, 3));
}
function fixsolo(word) {
  if (word.length !== 1) return word;
  return {
    "a": "a", "b": randnth(["be", "bee"]), "c": randnth(["see", "sea"]),
    "d": "the", "e": "'e", "f": "eff", "g": "gee", "h": "h'", "i": "i",
    "j": "jay", "k": "kay", "l": "ell", "m": "'em", "n": "'n", "o": "o",
    "p": "pee", "q": randnth(["cue", "queue"]), "r": "are", "s": "ess",
    "t": "tee", "u": "you", "v": "vee", "w": "with", "x": "ex", "y": "why",
    "z": "the"
  }[word];
}
function wreck(passage, turns) {
  //console.log(passage);
  turns = turns || 100;
  for (let i = 0; i < turns; i++) {
    const lines = passage.trim().split(/\n/);
    const warpedlines = [];
    for (const line of lines) {
      const words = line.split(/\s+/);
      const scoredwords = words.filter(w => w.length > 1).sort((a, b) => prob(a) - prob(b));
      const worstword = randnth(scoredwords.slice(0, 3));
      const warpedword = warp(worstword);
      const warpedline = words.map(w => w === worstword ? warpedword : w)
                              .map(w => i === turns - 1 ? fixsolo(w) : w)
                              .join(" ");
      warpedlines.push(warpedline);
    }
    passage = warpedlines.join("\n");
    //console.log(passage);
    //console.log("---");
  }
  return passage;
}
function range(n) {
  return [...Array(n).keys()];
}
function noise(len) {
  return range(len).map(_ => randnth(abet + "   ")).join("").replace(/\s+/, " ");
}
const passage = range(10).map(_ => noise(25)).join("\n");
/*
const passage = `
I met a traveller from an antique land,
Who said—“Two vast and trunkless legs of stone
Stand in the desert. . . . Near them, on the sand,
Half sunk a shattered visage lies, whose frown,
And wrinkled lip, and sneer of cold command,
Tell that its sculptor well those passions read
Which yet survive, stamped on these lifeless things,
The hand that mocked them, and the heart that fed;
And on the pedestal, these words appear:
My name is Ozymandias, King of Kings;
Look on my Works, ye Mighty, and despair!
Nothing beside remains. Round the decay
Of that colossal Wreck, boundless and bare
The lone and level sands stretch far away.”
`;
*/
/*
const passage = `
message-less birds take flight without cause
To the silence they've heard in the absence of laws
Or imperial crowns: Unsent, unsigned--`;
*/
console.log(passage);
const wrecked = wreck(passage);
console.log("---");
console.log(wrecked);
