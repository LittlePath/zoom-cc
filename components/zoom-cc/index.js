window.customElements.define('zoom-cc',
  class ZoomCc extends HTMLElement{
    constructor(){
      super();
    }

    connectedCallback(){
      const shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.appendChild(this.style);
      shadowRoot.appendChild(this.content);

      this.recognition = undefined;
      this.transcribing = false;
      this.sequence = 1;

      let zoomLanguageField = this.shadowRoot.querySelector('#zoomLanguage');
      zoomLanguageField.value = navigator.language;

      let startStopButton = this.shadowRoot.querySelector('#start-stop');
      startStopButton.onclick = (event) => {
        if(this.transcribing){
          this.stop();
        }else{
          this.start();
        }
      }
    }

    get style(){
      let style = document.createElement('style');
      style.innerHTML = `
        .stop{ 
          background-color: red;
        }

        #zoomURL{
          width: 75vw;
        }
      `;
      return style;
    }

    get content(){
      let content = document.createElement('section');
      content.innerHTML = `
<p>
  <label for="zoomURL">Zoom CC API Token</label> <br>
  <input type="url" name="zoomURL" id="zoomURL"></input>
</p>

<p>
  <label for="zoomLanguage">Language</label> <br>
  <input type="text" name="zoomLanguage" id="zoomLanguage"></input>
  (en-US for American English, es-MX for Mexican Spanish, etc.)
</p>

<p><button id="start-stop">Start CC</button></p>
<div id="transcript-window"></div> 
      `;

      return content;
    }

    start(){
      let startStopButton = this.shadowRoot.querySelector('#start-stop');
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if(typeof SpeechRecognition === "undefined"){
        startStopButton.disabled = true;
        this.write(`This browser doesn't support the <a href="https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition">SpeechRecognition</a> API. Try Google Chrome or one of the browsers listed at <a href="https://caniuse.com/mdn-api_speechrecognition">caniuse.com</a>.`);  
      }else{
        startStopButton.innerHTML = 'Stop CC';
        startStopButton.classList.add('stop');

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.onresult = (event) => {
          const result = event.results[event.resultIndex][0].transcript;
          this.write(result);
          this.postToZoom(result);
        }
        this.recognition.onerror = (event) => {
          console.error(event);
        }
        this.recognition.onstart = (event) => {
          this.transcribing = true;
        }
        this.recognition.onend = (event) => {
          this.transcribing = false;
        }
        this.recognition.start();
      }
    }

    stop(){
      let startStopButton = this.shadowRoot.querySelector('#start-stop');
      startStopButton.innerHTML = 'Start CC';
      startStopButton.classList.remove('stop');
      this.recognition.stop();
    }

    write(message){
      let transcriptWindow = this.shadowRoot.querySelector('#transcript-window');
      transcriptWindow.insertAdjacentHTML('beforeend', `<p>${message}</p>`);
    }

    async postToZoom(message){
      let zoomURL = this.shadowRoot.querySelector('#zoomURL').value;
      let zoomLanguage = this.shadowRoot.querySelector('#zoomLanguage').value;
      zoomURL += `&lang=${zoomLanguage}`;
      zoomURL += `&seq=${this.sequence++}`;

      const options = {
        method: 'POST',
        mode: 'no-cors',
        body: message,
        headers: {
          'Content-Type': 'plain/text',
          'Content-Length': message.length
        }
      };

      return await fetch(zoomURL, options);
    }
  }
);

