function tokenize(str) {
  const toks = [];
  let span = "";
  let alphatok = false;
  let tokstart = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const alphachar = /[a-zA-Z]/.test(ch);
    if (alphachar && !alphatok) {
      // wrap up nontok, start new alphatok with ch
      if (span !== "") toks.push([span, false, tokstart, i]);
      span = ch;
      alphatok = true;
      tokstart = i;
    }
    else if (!alphachar && alphatok) {
      // wrap up alphatok, start new nontok with ch
      if (span !== "") toks.push([span, true, tokstart, i]);
      span = ch;
      alphatok = false;
      tokstart = i;
    }
    else {
      span += ch;
    }
  }
  if (span !== "") {
    // wrap up any dangling tok
    toks.push([span, alphatok, tokstart, str.length]);
  }
  return toks;
}
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
function randnth(xs) {
  return xs[Math.floor(Math.random() * xs.length)];
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
  const toks = tokenize(passage);
  const wordtoks = toks.filter(tok => tok[1]);
  const words = wordtoks.map(tok => tok[0]);
  const edits = mapcat(words, word => {
    const wordprob = prob(word);
    return mutate(word).map(edit => [word, edit, prob(edit) - wordprob]);
  });
  const bestedits = edits.sort((a, b) => b[2] - a[2]).slice(0, 3);
  const bestedit = randnth(bestedits);
  console.log(bestedit);
  const [worstword, wreckedword, _delta] = bestedit;
  const newtexts = toks.map(tok => tok[0] === worstword ? wreckedword : tok[0]);
  const newpassage = newtexts.join("");
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
  const toks = tokenize(passage);
  const newtexts = toks.map(tok => fixsolo(tok[0]));
  const newpassage = newtexts.join("");
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
  console.log(tokenize(wreckage.innerText));
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
  /*
  // if out of turns, fix solos
  if (turnsLeft === 0) {
    wreckage.innerText = fixsolos(wreckage.innerText);
  }
  */
  // update prevText for quiescence checking next turn
  prevText = wreckage.innerText;
}, 10);
