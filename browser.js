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
const vows = "aeiouy".split("");
function setchr(str, pos, chr) {
  return str.substring(0, pos) + chr + str.substring(pos + 1);
}
const constraints = [
  w => vows.some(v => w.includes(v)),
];
function mutate(str) {
  if (!str) return edits; // skip empty lines
  const edits = [str]; // allow a single null edit, so we can quiesce
  for (let i = 0; i < str.length; i++) {
    for (let j = 0; j < abet.length; j++) {
      if (str[i] === abet[j]) continue; // prevent excess null edits
      if (!/[a-zA-Z]/.test(str[i])) continue; // leave punctuation alone
      const edit = setchr(str, i, abet[j]);
      if (constraints.some(c => !c(edit))) continue; // prevent disallowed edits
      edits.push(edit);
    }
  }
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
function mapcat(xs, fn) {
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    var x = fn(xs[i], i);
    if (Array.isArray(x)) res.push.apply(res, x);
    else res.push(x);
  }
  return res;
}
function wreck(passage) {
  const words = passage.trim().replace(/\n/g, "%%%").split(/\s+/);
  const actualwords = words.filter(w => w.length > 1);
  const scoredwords = actualwords.map(w => [w, prob(w)]);
  const edits = mapcat(actualwords, word => {
    const edits = mutate(word).map(edit => {
      return [word, edit, prob(edit) - prob(word)];
    });
    return edits;
  });
  const bestedits = edits.sort((a, b) => b[2] - a[2]).slice(0, 3);
  const bestedit = randnth(bestedits);
  console.log(bestedit);
  const [worstword, wreckedword, _delta] = bestedit;
  const newwords = words.map(w => w === worstword ? wreckedword : w);
  const newpassage = newwords.join(" ").replace(/%%%/g, "\n");
  return newpassage;
}
function fixsolo(word) {
  if (word.length !== 1) return word;
  return {
    "a": "a", "b": randnth(["be", "bee"]), "c": randnth(["see", "sea"]),
    "d": "the", "e": "he", "f": "eff", "g": "gee", "h": "huh", "i": "i",
    "j": "jay", "k": "kay", "l": "ell", "m": "'em", "n": "and", "o": "o",
    "p": "pee", "q": randnth(["cue", "queue"]), "r": "are", "s": "ess",
    "t": "tee", "u": "you", "v": "vee", "w": "with", "x": "ex", "y": "why",
    "z": "the"
  }[word] || word;
}
function fixsolos(passage) {
  // FIXME doesn't handle words at start or end of line correctly? %%% screwup?
  const words = passage.trim().replace(/\n/g, "%%%").split(/\s+/);
  const newwords = words.map(fixsolo);
  const newpassage = newwords.join(" ").replace(/%%%/g, "\n");
  return newpassage;
}
function range(n) {
  return [...Array(n).keys()];
}
function noise(len) {
  return range(len).map(_ => randnth(abet + "    ")).join("").replace(/\s+/, " ");
}
const wreckage = document.getElementById("wreckage");
const initTurns = 1000;
wreckage.innerText = wreckage.innerText.trim();
let prevText = wreckage.innerText;
document.getElementById("borrow").onclick = () => {
  wreckage.innerText = randnth(borrowings);
  prevText = wreckage.innerText;
};
document.getElementById("summon").onclick = () => {
  wreckage.innerText = range(10).map(_ => noise(25)).join("\n");
  prevText = wreckage.innerText;
};
document.getElementById("wreck").onclick = () => {
  turnsLeft = initTurns;
};
let turnsLeft = 0;
window.setInterval(() => {
  // bail immediately if no turns left
  if (turnsLeft <= 0) return;
  // wreck text
  wreckage.innerText = wreck(wreckage.innerText);
  // if quiescent, burn remaining turn budget
  if (prevText === wreckage.innerText) {
    console.log("Quiescence reached in", initTurns - turnsLeft, "turns. ∎");
    turnsLeft = 1;
  }
  // decrement turn budget
  turnsLeft -= 1;
  // if out of turns, fix solos
  if (turnsLeft === 0) {
    wreckage.innerText = fixsolos(wreckage.innerText);
  }
  // update prevText for quiescence checking next turn
  prevText = wreckage.innerText;
}, 10);
