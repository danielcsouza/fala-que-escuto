try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
 
}
catch(e) {
  console.error(e);
  $('.no-browser-support').show();
  $('.app').hide();
}

var noteTextarea = $('#note-textarea');
var instructions = $('#recording-instructions');
var notesList = $('ul#notes');

var noteContent = '';

// Get all notes from previous sessions and display them.
var notes = getAllNotes();
renderNotes(notes);



/*-----------------------------
      Voice Recognition 
------------------------------*/

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses. 
recognition.continuous = true;


recognition.lang = "pt-BR";

// This block is called every time the Speech APi captures a line. 
recognition.onresult = function(event) {

  // event is a SpeechRecognitionEvent object.
  // It holds all the lines we have captured so far. 
  // We only need the current one.
  var current = event.resultIndex;

  // Get a transcript of what was said.
  var transcript = event.results[current][0].transcript;

  // Add the current transcript to the contents of our Note.
  // There is a weird bug on mobile, where everything is repeated twice.
  // There is no official solution so far so we have to handle an edge case.
  var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

  if(!mobileRepeatBug) {
    noteContent += transcript;
    noteTextarea.val(noteContent);
  }
};

recognition.onstart = function() { 
  instructions.text('Opaaa! Captura ativado. Vai falando ...');

}

recognition.onspeechend = function() {
  instructions.text('Acabei de transcrever o que você disse.');
}

recognition.onerror = function(event) {
  if(event.error == 'no-speech') {
    instructions.text('Não encontrei microfone!');  
  };
}



/*-----------------------------
      App buttons and input 
------------------------------*/

$('#start-record-btn').on('click', function(e) {
  if (noteContent.length) {
    noteContent += ' ';
  }
  recognition.start();
});


$('#pause-record-btn').on('click', function(e) {
  recognition.stop();
  instructions.text('Captura de áudio pausada.');
});

// Sync the text inside the text area with the noteContent variable.
noteTextarea.on('input', function() {
  noteContent = $(this).val();
})

$('#save-note-btn').on('click', function(e) {
  recognition.stop();

  if(!noteContent.length) {
    instructions.text('Não tem nada para eu salvar! Fala algo aí manezão!');
  }
  else {
    // Save note to localStorage.
    // The key is the dateTime with seconds, the value is the content of the note.
    saveNote(new Date().toLocaleString(), noteContent);

    // Reset variables and update UI.
    noteContent = '';
    renderNotes(getAllNotes());
    noteTextarea.val('');
    instructions.text('Frase da sua preguiça salva com sucesso.');
  }
      
})


notesList.on('click', function(e) {
  e.preventDefault();
  var target = $(e.target);

  // Listen to the selected note.
  if(target.hasClass('listen-note')) {
    var content = target.closest('.note').find('.content').text();
    readOutLoud(content);
  }

  // Delete note.
  if(target.hasClass('delete-note')) {
    var dateTime = target.siblings('.date').text();  
    deleteNote(dateTime);
    target.closest('.note').remove();
  }
});



/*-----------------------------
      Speech Synthesis 
------------------------------*/

function readOutLoud(message) {
	var speech = new SpeechSynthesisUtterance();

  // Set the text and voice attributes.
	speech.text = message;
	speech.volume = 1;
	speech.rate = 1;
	speech.pitch = 1;
  
	window.speechSynthesis.speak(speech);
}



/*-----------------------------
      Helper Functions 
------------------------------*/

function renderNotes(notes) {
  var html = '';
  if(notes.length) {
    notes.forEach(function(note) {
      html+= `<li class="note">
        <p class="header">
          <span class="date">${note.date}</span>
          <a href="#" class="listen-note" title="Ler">Leia esta frase abaixo, porque também estou com preguiça</a>
          <a href="#" class="delete-note" title="Apagar">Apagar</a>
        </p>
        <p class="content">${note.content}</p>
      </li>`;    
    });
  }
  else {
    html = '<li><p class="content">Nada por aqui ainda...</p></li>';
  }
  notesList.html(html);
}


function saveNote(dateTime, content) {
  localStorage.setItem('note-' + dateTime, content);
}


function getAllNotes() {
  var notes = [];
  var key;
  for (var i = 0; i < localStorage.length; i++) {
    key = localStorage.key(i);

    if(key.substring(0,5) == 'note-') {
      notes.push({
        date: key.replace('note-',''),
        time: getTimeStamp(key.replace('note-','')),
        content: localStorage.getItem(localStorage.key(i))
      });
    } 
  }

  //console.log("antes - ",notes);
  function compare(a,b) {
     return b.time - a.time;
  }

 notes.sort(compare);
 
  //console.log("depois - ",notes);
  return notes;
}


function getTimeStamp(date)
{
  let myDate = date;
  let myhour = date;
  myDate = myDate.substr(0,10);
  myDate = myDate.split("/");
  let hour = myhour.substr(14,myhour.length);
  hour = hour.split(":");
  let newDate = new Date(myDate[2], myDate[1] - 1, myDate[0], hour[0], hour[1]);

  return newDate.getTime();
}

function deleteNote(dateTime) {
  localStorage.removeItem('note-' + dateTime); 
}



$('#copy').on('click', function(e) {
  var copyText = document.getElementById("note-textarea");
  if (copyText.value === "")  {
      alertify.set('notifier','position', 'top-right');
      alertify.error("Nada para copiar :(");
  } else {
      copyText.select();
      copyText.setSelectionRange(0, 99999); /*For mobile devices*/

      document.execCommand("copy");
      alertify.set('notifier','position', 'top-right');
      alertify.success("Texto copiado para área de transferência 🚀");
  }
});

