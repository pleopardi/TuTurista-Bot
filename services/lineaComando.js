/*
  Descrizione: modulo per interagire col bot in locale tramite linea di comando.
  Utilizzo: è sufficiente importare il modulo.
*/

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('Scrivi qualcosa. Io ti dirò cosa hai scritto');
rl.setPrompt('> ');
rl.prompt();


rl.on('line', msg => {
  console.log(`Hai scritto: "${msg}"`);
  rl.prompt();
})
