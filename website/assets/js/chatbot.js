const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
 
///////////////////////////////// handling get and post requests///////////////////////////

let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
}

function typingEffect(element,text,index){
    if (index < text.length) {
        element.textContent += text[index];
        setTimeout(()=>typingEffect(element,text,index+1), 50); 
      }
}

const generateResponse = (chatElement) => {
    const messageElement = chatElement.querySelector("p");
    let data = chatInput.value
    let botLang = document.getElementById('selection').value;
    let defaultLang = 'en-GB'
    translate(data,botLang,defaultLang).then((data)=>{
        const url = 'http://127.0.0.1:5000/predict'
        fetch(url, {
            method  : 'POST',
            mod     : 'cors',
            body    : JSON.stringify({message : data}),
            headers : {
                'Content-Type' : 'application/json'
            },
        })
        .then(r => r.json())
        .then(r => {
            console.log("fetch success")
            translate(r.answer,defaultLang,botLang).then((data)=>{
                messageElement.textContent = "";
                typingEffect(messageElement,data,0)
                // messageElement.textContent = data;
                //text to speech after fetching answer
                lan = document.getElementById('selection').value;
                text = data;
                if(speaking)textToSpeech(lan,text);
            })
        })
        .catch(error => {
            messageElement.classList.add("error");
            messageElement.textContent = "Oops! Something went wrong. Please try again.";
        })
        .finally(() => {chatbox.scrollTo(0, chatbox.scrollHeight)});
    })
    
}

const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if(!userMessage) return;
    
    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
        // Clear the input textarea and set its height to default
        chatInput.value = ""; 
        chatInput.style.height = `${inputInitHeight}px`;
    }, 600);

    
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window 
    // width is greater than 800px, handle the chat
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);

///////////////////////////////////////changing state//////////////////////////////////

//speech recognition
function turnSpeechOnOff() {
    recognition.lang = document.getElementById('selection').value;
    if (userSpeech == false) {
        setStartSpeech()
        userSpeech = true;
        recognition.start();
    } else {
        setStopSpeech()
        userSpeech = false;
    }
}

//text to speech
function stopStartSpeak() {
    if (speaking == false) {
        stopSpeak()
        speaking = true;
    } else {
        startSpeak()
        speaking = false;
    }
}

//////////////////////////////////////changing icons on click/////////////////////////////

//speech recognition
function setStopSpeech() {
    document.getElementById('speech').style.backgroundColor = '#434649';
}
function setStartSpeech() {
    document.getElementById('speech').style.backgroundColor = '#009999';
}

//speaking
function stopSpeak() {
    document.getElementById('speak').style.backgroundColor = '#434649';
}
function startSpeak() {
    document.getElementById('speak').style.backgroundColor = 'tomato';
}

//on click perform
document.getElementById('speech').addEventListener('click', turnSpeechOnOff);
document.getElementById('speak').addEventListener('click', stopStartSpeak);

/////////////////////////////////////// translation /////////////////////////////////////

//add languages to select menu
const languages = document.getElementById('selection');
async function translate(text, from, to) { 
    if (!text) return;
    if (from == to)return text;
    let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${from}|${to}`;
    let response = await fetch(apiUrl);
    let data = await response.json();
    return  data.responseData.translatedText; 
}
//add languages to select menu
for (const [code, language] of Object.entries(countries)) {
    const element = document.createElement("option");
    element.value = code;
    element.textContent = language;
    languages.appendChild(element);
  }

//////////////////////////////////////voice to text//////////////////////////////////////

//speech recognition
var userSpeech = false;
const speechArea = document.getElementById('speech-text');

window.SpeechRecognition = window.webkitSpeechRecognition;
const recognition = new window.SpeechRecognition();
recognition.interimResults = true;

recognition.addEventListener("result", (e) => {
    console.log('start');
  const text = Array.from(e.results)
    .map((result) => result[0]) 
    .map((result) => result.transcript) 
    .join(" ");

  speechArea.value = text;
  if(e.results[0].isFinal){
    let finalSpeech = text;
    if(finalSpeech != ''){
        let org = document.getElementById('selection').value;
    }
  }
});

recognition.addEventListener("end", ()=>{
    console.log('end');
    turnSpeechOnOff();
});

/////////////////////////////////////////////text to speech//////////////////////////

var speaking = true;

function textToSpeech(lan,text){
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lan;
    speechSynthesis.speak(utterance);
}

///////////////////
