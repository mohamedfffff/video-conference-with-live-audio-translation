const socket = io();
const videoGrid = document.getElementById('video-grid'); //div where our video will be loaded
 
//setup
var myPeer = new Peer();
let count = 0;
let myVideoStream; //the video stram is stored in this variable
const myVideo = document.createElement('video'); //div which contains the video
let currentPeer = null;
myVideo.muted = true;
const peers = {};
const names = {};
const userName = prompt("Please enter your name", "");

/////////////////////////////////////////////////time//////////////////////////////////////

//showing date
function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}
document.getElementById('time').innerText = formatAMPM(new Date) + " | Meeting";
setInterval(setTime, 1000);
function setTime() {
    document.getElementById('time').innerText = formatAMPM(new Date) + " | Meeting";
}

/////////////////////////////////////////////video chat///////////////////////////////////////

//handling video calling
navigator.mediaDevices.getUserMedia({
    video: true, //we want video
    audio: true //we want audio
}).then(stream => {
    myVideoStream = stream; //storing the video stream returned to the myVideoStream variable
    addVideoStream(myVideo, stream, userName); //appended my stream to 'video-grid' div

    myPeer.on('call', call => { 
        call.answer(stream);
        console.log('Hello')
        const video = document.createElement('video');
        let html = '<i class="fas fa-microphone"></i>'
        video.innerHTML = html;
        call.on('stream', userVideoStream => {
            console.log('video displayed');
            addVideoStream(video, userVideoStream, userName)
        })
        currentPeer = call;
    })
    socket.on('user-connected', (userId) => {
        setTimeout(connectToNewUser, 1000, userId, userName, stream);
    });

})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id, userName);
})

function connectToNewUser(userId, userName, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream, userName);
    })
    call.on('close', () => {
        video.remove();
    })
    peers[userId] = call
    currentPeer = call;
}

function addVideoStream(video, stream, userName) {
    video.srcObject = stream; //setting the source of my video
    video.addEventListener('loadedmetadata', () => {
        video.play(); //start to play the video once loaded
    });
    let outerDiv = document.createElement('div');
    outerDiv.classList.add('user-video');
    outerDiv.setAttribute('id', 'video-' + count);
    count++;
    outerDiv.appendChild(video);
    let nameDiv = document.createElement('div');
    let pinDiv = document.createElement('div');
    nameDiv.classList.add('user-name');
    nameDiv.innerHTML = userName;
    outerDiv.appendChild(nameDiv);
    videoGrid.appendChild(outerDiv); //appending to 'video-grid' div
}

///////////////////////////////////////changing state//////////////////////////////////

//microphone
function muteUnmuteUser() {
    let enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled == true) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteAudio();
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        setMuteAudio();
    }
}

//video
function turnUserVideoOnOff() {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled == true) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setStopVideo()
    } else {
        setPlayVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

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

//translation
function stopStartTranslation() {
    if (translating == false) {
        stopTranslation()
        translating = true;
    } else {
        startTranslation()
        translating = false;
    }
}

//translation
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

//video
function setPlayVideo() {
    const html = `<i class="fas fa-video"></i>`
    document.getElementById('video-off').innerHTML = html;
    document.getElementById('video-off').style.backgroundColor = '#434649';
}
function setStopVideo() {
    const html = `<i class="stop fas fa-video-slash"></i>`
    document.getElementById('video-off').innerHTML = html;
    document.getElementById('video-off').style.backgroundColor = 'tomato';
}

//microphone
function setMuteAudio() {
    const html = `<i class="fas fa-microphone"></i>`
    document.getElementById('mute').innerHTML = html;
    document.getElementById('mute').style.backgroundColor = '#434649';
}
function setUnmuteAudio() {
    const html = `<i class="unmute fas fa-microphone-slash"></i>`
    document.getElementById('mute').innerHTML = html;
    document.getElementById('mute').style.backgroundColor = 'tomato';
}

//speech recognition
function setStopSpeech() {
    document.getElementById('speech').style.backgroundColor = '#434649';
}
function setStartSpeech() {
    document.getElementById('speech').style.backgroundColor = '#009999';
}

//translation
function stopTranslation() {
    document.getElementById('translation').style.backgroundColor = '#434649';
}
function startTranslation() {
    document.getElementById('translation').style.backgroundColor = 'tomato';
}

//speaking
function stopSpeak() {
    document.getElementById('speak').style.backgroundColor = '#434649';
}
function startSpeak() {
    document.getElementById('speak').style.backgroundColor = 'tomato';
}

//on click perform
document.getElementById('video-off').addEventListener('click', turnUserVideoOnOff);
document.getElementById('mute').addEventListener('click', muteUnmuteUser);
document.getElementById('speech').addEventListener('click', turnSpeechOnOff);
document.getElementById('translation').addEventListener('click', stopStartTranslation);
document.getElementById('speak').addEventListener('click', stopStartSpeak);

/////////////////////////////////////////text chat/////////////////////////////////////////

//send messages when submit from chat form
$('form').submit(function (e) {
    e.preventDefault();
    let inputMsg = $('input').val();
    if (inputMsg != ''){
        let org = document.getElementById('selection').value;
        socket.emit('send-message', inputMsg, userName, org);
    }
    $('input').val('');
})

//add message to chat when recieved and translating and speaking
socket.on('recieve-message', (inputMsg, userName, org) => {
    //translate
    let translatedMessage;
    let from = org;
    let to = document.getElementById('selection').value;
    //if the same language or translating is off
    if(from == to || !translating){
        //add to chat
        $('#messages').append(`<li><b style="font-size:.9rem">${userName}</b>&nbsp;${formatAMPM(new Date)}<br/>${inputMsg}</li>`);
        let scrollDiv = document.getElementById("chats");
        scrollDiv.scrollTop = scrollDiv.scrollHeight;
    }else{
        translate(inputMsg,from,to).then((data)=>{
            translatedMessage = data;
            //add to chat
            $('#messages').append(`<li><b style="font-size:.9rem">${userName}</b>&nbsp;${formatAMPM(new Date)}<br/>${translatedMessage}</li>`);
            let scrollDiv = document.getElementById("chats");
            scrollDiv.scrollTop = scrollDiv.scrollHeight;
            //speak
            if(speaking){
                if(translating){
                    textToSpeech(to,translatedMessage);
                }else{
                    textToSpeech(from,translatedMessage);
                }
            }
            
        });
    }
})

//auto scroll when recieve new message
const scrollToBottom = () => {
    var d = $('#chats');
    d.scrollTop(d.prop("scrollHeight"));
}
scrollToBottom();

///////////////////////////////////////screen sharing/////////////////////////////////////////////

//screen sharing
var screenSharing = false
function startScreenShare() {
    if (screenSharing) {
        stopScreenSharing()
    }
    navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
        screenStream = stream;
        let videoTrack = screenStream.getVideoTracks()[0];
        videoTrack.onended = () => {
            console.log('Screen sharing stopped!');
            stopScreenSharing()
        }
        if (myPeer) {
            let sender = currentPeer.peerConnection.getSenders().find(function (s) {
                return s.track.kind == videoTrack.kind;
            })
            sender.replaceTrack(videoTrack)
            screenSharing = true
        }
    })
}

function stopScreenSharing() {
    if (!screenSharing) return;
    let videoTrack = myVideoStream.getVideoTracks()[0];
    if (myPeer) {
        let sender = currentPeer.peerConnection.getSenders().find(function (s) {
            return s.track.kind == videoTrack.kind;
        })
        sender.replaceTrack(videoTrack)
    }
    screenStream.getTracks().forEach(function (track) {
        track.stop();
    });
    screenSharing = false
}
document.getElementById('screen-share-btn').addEventListener('click', startScreenShare);

//////////////////////////////////////////select video//////////////////////////////////////////

//screen expanding and shrinking
var isExpanded = false;
document.addEventListener('click', function(e) {
    //expanding selected video
    let clickedElem = e.target;
    let clickedElemId = e.target.id;
    if(isExpanded == false) {
        if(clickedElem.classList.contains('user-video')) {
            let ele = document.getElementById(clickedElemId);
            ele.firstChild.style.height = "80vh";
            ele.firstChild.style.width = "70vw";
            isExpanded = true;
            //hiding the rest of videos
            let arr = document.getElementsByClassName('user-video');
            for(let i=0;i<arr.length;i++) {
                let elem = arr[i];
                if(elem.id != clickedElemId) {
                    elem.style.display = "none";
                }
            }
        }
       
    }else {
        //shrinking video
        if(clickedElem.classList.contains('user-video')) {
            let ele = document.getElementById(clickedElemId);
            ele.firstChild.style.height = "150px";
            ele.firstChild.style.width = "250px";
            isExpanded = false;
            //showing the rest of videos
            let arr = document.getElementsByClassName('user-video');
            for(let i=0;i<arr.length;i++) {
                let elem = arr[i];
                if(elem.id != clickedElemId) {
                    elem.style.display = "block";
                }
            }
        }
    }
    
})

//////////////////////////////////////voice to text//////////////////////////////////////////

//speech recognition
var userSpeech = false;
const speechArea = document.getElementById('speech-text');

window.SpeechRecognition = window.webkitSpeechRecognition;
const recognition = new window.SpeechRecognition();
// recognition.continuous = true;
recognition.interimResults = true;

recognition.addEventListener("result", (e) => {
    console.log('start');
  const text = Array.from(e.results)
    .map((result) => result[0]) 
    .map((result) => result.transcript) 
    .join(" ");

  speechArea.innerHTML = text;
  if(e.results[0].isFinal){
    let finalSpeech = text;
    if(finalSpeech != ''){
        let org = document.getElementById('selection').value;
        socket.emit('send-message', finalSpeech, userName,org);
    }
  }
});

recognition.addEventListener("end", ()=>{
    console.log('end');
    turnSpeechOnOff();
});
////////////////////////////////////////////////translation//////////////////////////////////

const languages = document.getElementById('selection');
var translating = true;
//translation function
async function translate(text, from, to) { 
    if (!text) return;
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



/////////////////////////////////////////////text to speech//////////////////////////

var speaking = true;

function textToSpeech(lan,text){
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lan;
    speechSynthesis.speak(utterance);
}