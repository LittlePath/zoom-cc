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

        .button-instructions{
          style: inline-block;
          background: #ccc;
          border-radius: 5px;
          font-weight: bold;
          padding: 0.2em;
          border: solid black 1px;
        }

        .field-instructions{
          font-weight: bold;
        }

        button{
          font-weight: bold;
          background-color: #ccc;
          padding: 0.2em;
          border-radius: 5px;
        }

        label{
          font-weight: bold;
        }

        li{
          line-height: 1.5em;
        }
      `;
      return style;
    }

    get content(){
      let content = document.createElement('section');
      content.innerHTML = `
<p>
To add closed captions to your Zoom call:
</p>

<ol>
  <li>As the host of a Zoom meeting, click the <span class="button-instructions">CC (Closed Caption)</span> button in your Zoom toolbar</li>
  <li>Click the <span class="button-instructions">Copy the API token</span> button under <span class="field-instructions">"Use a 3rd party CC service"</span>.</li>
  <li>Paste it into the <span class="field-instructions">"Zoom CC API Token"</span> field on this page.</li> 
  <li>Press the <span class="button-instructions">Start CC</span> button on this page to start closed captions.</li> 
</ol>

<p>
You should see the transcript appear on this page as well as in your Zoom call.
</p>

<p>
NOTE: If you are the host of a Zoom call and you don't see a "CC (Closed Caption)" button in your Zoom toolbar, follow Zoom's instructions to enable closed captioning: <a href="https://support.zoom.us/hc/en-us/articles/207279736-Using-closed-captioning">https://support.zoom.us/hc/en-us/articles/207279736-Using-closed-captioning</a>
</p>

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

