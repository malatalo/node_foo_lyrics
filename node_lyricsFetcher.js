const path = require("path");
const fs = require("fs");
const readline = require("readline");
const mm = require("music-metadata");
const { getLyrics } = require("genius-lyrics-api");
require("dotenv").config({ path: path.resolve(path.dirname(require.main.filename), ".env") });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const GENIOUS_API_KEY = process.env.GENIOUS_API_KEY;
const dir = process.argv[2];
const argArtist = process.argv[3];
const argTitle = process.argv[4];

const fetchLyrics = async ({ file, artist, title }) => {
  const options = {
    apiKey: GENIOUS_API_KEY,
    artist,
    title,
    optimizeQuery: true
  };

  let lyrics = await getLyrics(options);

  if (lyrics === null) {
    return null;
  }

  return lyrics.replace(/’/g, "'");
};

const writeLyrics = ({ file, lyrics }) => {
  const lyricsPath = path.join(dir, file.replace(".flac", ".txt").replace(".wma", ".txt"));
  fs.writeFileSync(lyricsPath, lyrics, 'latin1'); // latin1 because of Foobar
};

const askForBetterNames = async ({ artist, title }) => {
  return new Promise(async res => {
    rl.question(`Better name for artist: ${artist}?\n>`, artistAnswer => {
      const fixedArtist = artistAnswer ? artistAnswer : artist;
      rl.question(`Better name for title: ${title}?\n>`, titleAnswer => {
        const fixedTitle = titleAnswer ? titleAnswer : title;
        res({ artist: fixedArtist, title: fixedTitle });
      });
      rl.write(title); // placeholder for title prompt
    });
    rl.write(artist); // placeholder for artist prompt
  });
};

const main = async () => {
  if (argArtist && argTitle) {
    fetchLyrics({ artist: argArtist, title: argTitle });
  } else {
    const noLyricsFound = [];
    const files = fs.readdirSync(dir).filter(f => f.includes("flac") || f.includes("wma"));
    for (const file of files) {
      const metadata = await mm.parseFile(path.join(dir, file));
      const { artist, title } = metadata.common;
      if (!artist || !title) {
        console.log("Metadata missing for file:", file);
        return;
      }
      const lyrics = await fetchLyrics({ file, artist, title });
      if (lyrics) {
        writeLyrics({ file, lyrics });
        console.log(`Wrote lyrics for: ${artist} | ${title}`);
      } else {
        console.log(`No lyrics found for: ${artist} | ${title}`);
        noLyricsFound.push({ file, artist, title });
      }
    }

    for (const obj of noLyricsFound) {
      console.log();
      const answer = await askForBetterNames(obj);
      if (answer.artist !== obj.artist || answer.title !== obj.title) {
        const lyrics = await fetchLyrics({
          file: obj.file,
          artist: answer.artist,
          title: answer.title
        });
        if (lyrics) {
          writeLyrics({ file: obj.file, lyrics });
          console.log(`Wrote lyrics for: ${answer.artist} | ${answer.title}`);
        } else {
          console.log(`No lyrics for: ${answer.artist} | ${answer.title}`);
        }
      } else {
        console.log("Artist & title are the same, not trying again")
      }
    }
    rl.close();
  }

  console.log("\ndone");
};

console.log(`
_______                   __  __                           __                     
\|       \\                 \|  \\\|  \\                         \|  \\                    
\| $$$$$$$\\  ______    ____\| $$\| $$      __    __   ______   \\$$  _______   _______ 
\| $$__\| $$ \|      \\  /      $$\| $$     \|  \\  \|  \\ /      \\ \|  \\ /       \\ /       \\
\| $$    $$  \\$$$$$$\\\|  $$$$$$$\| $$     \| $$  \| $$\|  $$$$$$\\\| $$\|  $$$$$$$\|  $$$$$$$
\| $$$$$$$\\ /      $$\| $$  \| $$\| $$     \| $$  \| $$\| $$   \\$$\| $$\| $$       \\$$    \\ 
\| $$  \| $$\|  $$$$$$$\| $$__\| $$\| $$_____\| $$__/ $$\| $$      \| $$\| $$_____  _\\$$$$$$\\
\| $$  \| $$ \\$$    $$ \\$$    $$\| $$     \\\\$$    $$\| $$      \| $$ \\$$     \\\|       $$
 \\$$   \\$$  \\$$$$$$$  \\$$$$$$$ \\$$$$$$$$_\\$$$$$$$ \\$$       \\$$  \\$$$$$$$ \\$$$$$$$ 
                                       \|  \\__\| $$                                  
                                        \\$$    $$                                  
                                         \\$$$$$$                                   
`)

main();
