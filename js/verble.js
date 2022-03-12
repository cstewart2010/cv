const WORD = WORDS[Math.floor(Math.random()*WORDS.length)]
const ALPHANUMERICS = "1234567890poiuytrewqasdfghjklmnbvcxz";

const EndGameMessage= {
    "1": "Unbelievable!",
    "2": "Incredible!",
    "3": "Splendid!",
    "4": "Good job!",
    "5": "Not bad!",
    "6": "Clutch!",
    "7": `The correct word was ${WORD}!`,
}

const SAVESTRING = "VERBLE_SAVE_FILE";
let Iterator = 0;
let VerblePosition = 1;
let IsGameActive = true;

function addAttempt(){
    Iterator++;
    let container = document.createElement("div");
    container.classList.add("container");
    let attempt = document.createElement("div");
    attempt.classList.add("d-flex", "justify-content-center");
    let iterator = 1;
    while (iterator < 6){
        let letter = document.createElement("div");
        letter.classList.add("solution-letter", "p-2", "m-1", "text-center", "border", "bg-dark", "text-white");
        letter.id = `letter-${Iterator}-${iterator}`;
        letter.onpaste = () => {
            return false;
        }
        letter.ondrop = () => {
            return false;
        }
        attempt.appendChild(letter);
        iterator++;
    }
    container.appendChild(attempt);
    document.getElementById("attempts").appendChild(container);
}

function clickLetter(letter){
    document.getElementById(`letter-${Iterator}-${VerblePosition}`).textContent = letter
    if (VerblePosition < 5){
        VerblePosition++;
    }
}

function deleteLetter(){
    document.getElementById(`letter-${Iterator}-${VerblePosition}`).textContent = '';
    if (VerblePosition > 1){
        VerblePosition--;
    }
}

function check(){
    const lastChild = document.getElementById("attempts").lastChild;
    var thing = lastChild.querySelectorAll(".solution-letter");
    let guess = '';
    thing.forEach(letter => {
        guess += letter.textContent;
    })
    guess = guess.toLowerCase();
    console.log(guess);
    let word = WORD.toLowerCase();
    let currentWord = word;
    if (WORDS.includes(guess)){  
        let iterator = 0
        thing.forEach(letter => {
            const letterButton = document.querySelector(`#${letter.textContent}`);
            if (word[iterator] === letter.textContent){
                letter.classList.remove("bg-dark")
                letter.classList.add("bg-success");
                letterButton.classList.remove("btn-light", "bg-warning", "btn-dark", "border", "border-warning");
                letterButton.classList.add("bg-success", "border-success");
            }
            else if (currentWord.includes(letter.textContent)){
                letter.classList.remove("bg-dark")
                letter.classList.add("bg-warning");
                if (!letterButton.classList.contains("bg-success")){
                    letterButton.classList.remove("btn-light", "btn-dark", "border");
                    letterButton.classList.add("bg-warning", "border-warning");
                }
            }
            else {
                if (!(letterButton.classList.contains("bg-success") || letterButton.classList.contains("bg-warning"))){
                    document.querySelector(`#${letter.textContent}`).classList.remove("btn-light");
                    document.querySelector(`#${letter.textContent}`).classList.add("btn-dark", "border");
                }
            }
            currentWord = currentWord.replace(letter.textContent, "");
            letter.disabled = true;
            iterator++;
        })
        if (guess == WORD){
            addResultToSave(Iterator.toString());
            return;
        }
        else if (Iterator === 6){
            addResultToSave("7");
            return;
        }
        addAttempt();
        VerblePosition = 1;
    }
    else {
        document.querySelector("#invalid .toast-body span").textContent = `${guess} is not a valid Verble word`;
        $("#invalid").toast('show');
    }
}

const addResultToSave = (counter) => {
    document.querySelectorAll(".d-flex.justify-content-center button").forEach(button => {
        button.disabled = true;
    })
    window.onkeydown = () => false;
    let save = getSave();
    if (!save){
        save = {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
        }
    }

    save[counter]++;
    localStorage.setItem(SAVESTRING, JSON.stringify(save));
    IsGameActive = false;
    postResults(counter);
}

function postResults(counter){
    const save = getSave();
    if (save){
        console.log(EndGameMessage[counter]);
        document.querySelector("#end-game .modal-title").textContent = EndGameMessage[counter];
        const title = `Verble [${WORD.toUpperCase()}] ${counter}/6`;
        showStats(title);
    }
}

function showStats(title){    
    const save = getSave();
    if (save){
        const sum = Object.values(save).reduce((a, b) => a + b);
        const modalBody = document.querySelector("#end-game .modal-body");
        modalBody.textContent = null;
        for (const attempt in save){
            const nextPart = `${attempt === "7" ? "fail" : attempt}: ${Math.round(save[attempt]*10000/sum)/100}%`
            console.log(nextPart);
            const div = document.createElement("div");
            div.textContent = nextPart;
            div.classList.add("text-dark");
            modalBody.appendChild(div);
        }
        let copiedText = `${title}\n\n`;
        document.querySelectorAll("#attempts .d-flex.justify-content-center").forEach(element => {
            let divText = '';
            element.querySelectorAll(".solution-letter").forEach(letterElement => {
                if (letterElement.classList.contains("bg-dark")){
                    divText += String.fromCodePoint(0x2b1b);
                }
                if (letterElement.classList.contains("bg-warning")){
                    divText += String.fromCodePoint(0x1f7e8);
                }
                if (letterElement.classList.contains("bg-success")){
                    divText += String.fromCodePoint(0x1f7e9);
                }
            });
            copiedText += `${divText}\n`;
        });
        copiedText = copiedText.trim();
        const button = document.createElement("button");
        button.onclick = () => {
            if (navigator.share){
                navigator.share({
                    title,
                    text: copiedText
                }).catch(reason => {
                    document.getElementById("modal-share-text").textContent = reason;
                });
            }
            else {
                navigator.clipboard.writeText(copiedText)
                .then(() => {
                    document.getElementById("modal-share-text").textContent = "Copied.";
                })
                .catch(reason => {
                    document.getElementById("modal-share-text").textContent = reason;
                });
            }
        }
        button.textContent = "Share "
        button.classList.add("btn", "btn-primary");
        const shareIcon  = document.createElement("i");
        shareIcon.classList.add("fa", "fa-share-alt");
        button.appendChild(shareIcon);
        modalBody.appendChild(button);
        const shareText = document.createElement("div");
        shareText.id = "modal-share-text";
        modalBody.appendChild(shareText);
        (new bootstrap.Modal(document.getElementById('end-game'))).show()
    }
}

function getSave(){
    return JSON.parse(localStorage.getItem(SAVESTRING));
}

$(window).keydown(e => {
    if (IsGameActive){
        if (e.key === "Enter"){
            check();
        }
        if (e.key === "Backspace" || e.key === "Delete"){
            deleteLetter();
        }
        if (ALPHANUMERICS.includes(e.key)){
            clickLetter(e.key);
        }
    }
})

window.onload = () => {
    addAttempt();
}