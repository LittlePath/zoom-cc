# zoom-transcript
W3C Web Component to display closed captioning / live transcript in a Zoom video call.

To add closed captions to your Zoom call:

* As the host of a Zoom meeting, click on the "CC (Closed Caption)" button in your toolbar 
* Click the "Copy the API token" button under "Use a 3rd party CC service". 
* Paste it into the "Zoom CC API Token" field on this page.
* Press the "Start CC" button on this page to start closed captions. 

You should see the transcript appear on this page as well as in your Zoom call.

If you are the host of a Zoom call and you don't see a "CC (Closed Caption)" button in your Zoom toolbar, follow Zoom's instructions to enable closed captioning: https://support.zoom.us/hc/en-us/articles/207279736-Using-closed-captioning 

NOTE: This Web Component currently only works in Google Chrome due to vendor support. Hopefully Mozilla, Microsoft, and others will fully support the W3C SpeechRecognition API in the future. Visit CanIUse.com for a current list of supported browsers: https://caniuse.com/mdn-api_speechrecognition 
