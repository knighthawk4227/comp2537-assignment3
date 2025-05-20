let time;
let timerInterval;
let click = 0; 


const template = `
      <div class="card">
        <img id="img6" class="front_face" src="" alt="">
        <img class="back_face" src="" alt="">
      </div>`

function diff() {
  return new Promise((resolve) => {
    let difficulty = 0;
    let grid = document.getElementById('game_grid');
    let but = document.querySelectorAll('.diffButton');
    let allButton = document.querySelector('.buttons');
    let pairInfo = document.querySelector('.pairInfo');
    let resetButton = document.getElementById('reset');
    but.forEach((button) => {
      button.addEventListener('click', () => {

        if (button.classList.contains('easy')) {
          grid.style.display = "flex";
          console.log('easy')
          difficulty = 3;
        } else if (button.classList.contains('medium')){ 
          grid.style.display = "flex";
          grid.classList.add('medium');
          console.log('medium difficulty');
          difficulty = 6
        } else if (button.classList.contains('hard')) {
          grid.style.display = "flex";
          grid.className = '';
          grid.classList.add('hard');
          console.log('hard')
          difficulty = 8;
        }
        allButton.style.display = 'none';
        pairInfo.style.display = 'flex';
        resetButton.style.display = 'flex';
        console.log("reset button called", resetButton);
        resolve(difficulty);
      })
     
  })
  });
}

async function loadPokemon(difficulty) {
  let start = Math.random()*1000 + 1;
  let poke = [];
  let response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${start}&limit=${difficulty}`);
  let jsonObj = await response.json();
  console.log(jsonObj);

  for (let i = 0; i < jsonObj.results.length; i++) {
    let response2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${jsonObj.results[i].name}`);
    let jsonObj2 = await response2.json()
    poke.push(jsonObj2);
    poke.push(jsonObj2);
  }
  return poke;

}


// loadPokemon().then((poke) => {
//   render(poke).then(() => { game() })
// })
//
// loadPokemon().then((poke) => {
//   random(poke)
// });

function StartGame() {
 
  //set this so reset doesn't run this multiple times if pressed a lot
  diff().then((difficulty) => {
    if(difficulty === 8) {
      time = 60;
    } else {
      time = difficulty * 5;
    }
    timerInterval = setInterval(timer, 1000);
    loadPokemon(difficulty).then((poke) => {
      random(poke).then((poke) => {
        render(poke).then(() => {
          game()
          winner();
        });
      });
    });
  });
}

// loadPokemon().then((poke) => {
//   random(poke).then((poke) => { 
//     render(poke).then(() => {
//        game() }).then(() => {
//         winner()
//        });
//        });
// });

async function render(poke) {
  const template = document.querySelector('.card-template');
  const container = document.querySelector('#game_grid');
  for (let i = 0; i < poke.length; i++) {
    const temp = template.content.cloneNode(true);
    let pokemon = poke[i];
    let img = temp.querySelector('.front_face');

    img.src = pokemon.sprites['other']['official-artwork'].front_default;
    container.appendChild(temp);
  }
}

async function random(poke) {
  let currentIndex = poke.length;
  let randomIndex;
  console.log(currentIndex);

  for (let i = 0; i < currentIndex; i++) {
    let first = poke[i];
    randomIndex = (Math.floor(Math.random() * currentIndex ));
    poke[i] = poke[randomIndex];
    poke[randomIndex] = first;
  }
  return poke;
}

// function game() {
//   let first;
//   let second;

//   let cards = document.querySelectorAll('.card');
//   // cards.forEach((card) => {
//   //   card.addEventListener('click', (event) => {
//   //     card.classList.toggle('flip');
//   //   });
//   // });
// }

let lock = false;
let foreverLock = false

function game() {
  let first = undefined;
  let second = undefined;

  console.log("Check is being called");
  let cards = document.querySelectorAll('.card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      

      /*I could use lock but I did forever incase of some 
      weird edge case where spamming would work */
      if (card === first || lock  || foreverLock){
        return;
      }
      clicker();
      
      if (!first) {
        first = card;
        card.classList.add('flip');
        console.log("first card clicked", first);      
      //I realize I could have just done (!second) but too late I made this work
      } else {
        second = card;
        card.classList.add('flip');
        console.log("the second card was clicked", second);
        lock = true;

        if (first.querySelector('.front_face').src === second.querySelector('.front_face').src ){
          first.classList.add('matched');
          second.classList.add('matched');
          first = undefined;
          second = undefined;
          //I could split this into 3 functions but I do not want to ;) 
          pairCounter();
          console.log("WE HAVE A MATCH");
          lock = false;
          winner();

        } else if (!(first.querySelector('.front_face').src === second.querySelector('.front_face').src)){
          /* Stops balls from unflipping right away so they flip together 
          otherwise it does the comparison so quick the second one does not flip*/
          setTimeout (() => {
            first.classList.remove('flip');
            second.classList.remove('flip');
            first = undefined;
            second = undefined;
            /* Stops from spam clicking so much on the second ball */
            setTimeout(() => {
              lock = false;                
              }, 1000); 
          }, 1000);
        }
      }
    });
  });
}

/**
 * This  function resets the board so the player can start playing again
 * @param first 
 * @param second 
 * @return none
 */
function reset(first, second) {
  first.classList.remove('flip');
  second.classList.remove('flip');
}

function resetButton() {
  let resetButton = document.getElementById('reset');
  let grid = document.getElementById('game_grid');
  let timer = document.getElementById('timer');
  let diffButtons = document.querySelector('.buttons');
  let clickEl = document.querySelector('.clickDisplay');



  resetButton.addEventListener('click', () => {
    // code to stop timer 
    clearInterval(timerInterval);
    time = 0;
    foreverLock = false;
    lock = false;
    
    //resetting click to 0
    clickEl.innerHTML = '0';
    click = 0;
    

    //timer clear
    timer.innerHTML = '0:00';

    // remove everything from grid 
    grid.innerHTML = '';

    // hide grid 
    grid.style.display = 'none';
    grid.className = '';
    diffButtons.style.display = 'flex';
    resetButton.style.display = 'none';
    
      StartGame();
  });
    
}
resetButton();

/**
 * This function is a timer for countdown
 */
function timer() {
  let timerEl = document.getElementById('timer');
  if (time <= 0) {
    timerEl.innerHTML = '0:00';
    clearInterval(timerInterval);
    setTimeout(() => {
      alert('game over you suck');
    }, 200);
    foreverLock = true;
  }
  const minutes = Math.floor(time/60);
  let seconds = time % 60;
  seconds = seconds < 10 ? '0' + seconds: seconds 
  timerEl.innerHTML = `${minutes}: ${seconds}`;
  time --;
}

function clicker() {
  let clickEl = document.querySelector('.clickDisplay');
  click++;
  clickEl.innerHTML = click;
}




function winner() {
  let cards = document.querySelectorAll('.card');
  let match = Array.from(cards).every(card => card.classList.contains('matched'));

  if(match) {
  console.log('you matched em ell');
  clearInterval(timerInterval);
  setTimeout(() => {
    alert("you win");      
    }, 500);
  }
}


function pairCounter() {
  let matchedCard = document.querySelectorAll('.card.matched');
  let imgMap = new Map();
  let pairEl = document.getElementById('pairCount')
  let allCards = document.querySelectorAll('.card');
  let noPairEl = document.getElementById('pairLeft');
  let totalPair = document.querySelector('.totalPair');
  console.log('the total pair element is', totalPair);

  matchedCard.forEach((card) => {
    let image = card.querySelector('.front_face').src;
    if (imgMap.has(image)) {
      imgMap.set(image, imgMap.get(image) + 1);
    } else {
      imgMap.set(image, 1);
    }
  });

  let pairs = 0;
  let totalPairs = (allCards.length);
  console.log("The total pair variable is " , totalPairs);
  totalPair.innerHTML = `Total Pairs: ${totalPairs/2}`

  imgMap.forEach(count => {
    if (count === 2) {
      pairs++;
    }
  });
  let pairsLeft = (totalPairs/2) - pairs;
  
  pairEl.innerHTML = `Pairs Matched: ${pairs}`;
  noPairEl.innerHTML = `pairs left: ${pairsLeft}`;

  console.log(pairs);
}

function theme() {
  let mode = document.getElementById('darkMode');

  mode.addEventListener('click', ()=> {
    if (document.body.style.backgroundColor === 'black'){
      document.body.style.backgroundColor = 'white';
    } else {
      document.body.style.backgroundColor = 'black';
    }
  })
}

StartGame();
theme();