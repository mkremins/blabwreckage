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
const borrowings = [
// ozy
`I met a traveller from an antique land,
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
The lone and level sands stretch far away.”`,
// mwy
`Message-less birds take flight without cause
To the silence they've heard in the absence of laws
Or imperial crowns: Unsent, unsigned--`,
// mwy2
`Hail the blest atomic morn
Unto the earth a bomb is born
The pebble bed reactor core
Up to the sky ascends.

Hail the blest atomic sea,
Its mouth in Oak Ridge, Tennessee
Whose lips--untouched with blasphemy--
Our glowing eyes attend...`,
// jabber
`’Twas brillig, and the slithy toves
      Did gyre and gimble in the wabe:
All mimsy were the borogoves,
      And the mome raths outgrabe.

“Beware the Jabberwock, my son!
      The jaws that bite, the claws that catch!
Beware the Jubjub bird, and shun
      The frumious Bandersnatch!”

He took his vorpal sword in hand;
      Long time the manxome foe he sought—
So rested he by the Tumtum tree
      And stood awhile in thought.

And, as in uffish thought he stood,
      The Jabberwock, with eyes of flame,
Came whiffling through the tulgey wood,
      And burbled as it came!

One, two! One, two! And through and through
      The vorpal blade went snicker-snack!
He left it dead, and with its head
      He went galumphing back.

“And hast thou slain the Jabberwock?
      Come to my arms, my beamish boy!
O frabjous day! Callooh! Callay!”
      He chortled in his joy.

’Twas brillig, and the slithy toves
      Did gyre and gimble in the wabe:
All mimsy were the borogoves,
      And the mome raths outgrabe.`,
// roads
`Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

I shall be telling this with a sigh
Somewhere ages and ages hence:
Two roads diverged in a wood, and I—
I took the one less traveled by,
And that has made all the difference.`,
// beast
`Turning and turning in the widening gyre   
The falcon cannot hear the falconer;
Things fall apart; the centre cannot hold;
Mere anarchy is loosed upon the world,
The blood-dimmed tide is loosed, and everywhere   
The ceremony of innocence is drowned;
The best lack all conviction, while the worst   
Are full of passionate intensity.

Surely some revelation is at hand;
Surely the Second Coming is at hand.   
The Second Coming! Hardly are those words out   
When a vast image out of Spiritus Mundi
Troubles my sight: somewhere in sands of the desert   
A shape with lion body and the head of a man,   
A gaze blank and pitiless as the sun,   
Is moving its slow thighs, while all about it   
Reel shadows of the indignant desert birds.   
The darkness drops again; but now I know   
That twenty centuries of stony sleep
Were vexed to nightmare by a rocking cradle,   
And what rough beast, its hour come round at last,   
Slouches towards Bethlehem to be born?`,
// tagline
`a single operation that both wrecks and repairs`,
// barrow
`so much depends
upon

a red wheel
barrow

glazed with rain
water

beside the white
chickens`,
];
