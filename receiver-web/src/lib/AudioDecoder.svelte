<script lang="ts">
  import { getStringFromBuffer } from '../../../src/decodeFromBuffer';

let permissionGranted = $state(false)
let loading = $state(false)
let isRecording = $state(false)
let recordingAvailable = $state(false)
let hasError = $state(false)
let errorMessage = $state("")
let recordingDuration = $state(0)
let decodedMessage: string | null = $state(null)
let isDecoding = $state(false)
let randomBars = $state(Array.from({ length: 12 }, () => Math.random() * 100))

let mediaRecorderRef: MediaRecorder | null = null
let audioChunks: Blob[] = [];
let audioBlob: Blob | null = null
let audioUrl: string | null = null
let audioRef: HTMLAudioElement | null = null;
let recordingStartTime: number | null = null
let durationInterval: NodeJS.Timeout | null = null;
let audioCtx: AudioContext | null = null
let stream: MediaStream | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let gain: GainNode | null = null;
let scriptNode: ScriptProcessorNode | null = null;
let chunks: Array<any> = [];
let nSamples: number = 0;
let sampleRate: number = 0;
let clockRate = 64;

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
}

const stopRecording = () => {
    if (mediaRecorderRef && isRecording) {
      mediaRecorderRef.stop()
      // Stop all tracks on the stream
      mediaRecorderRef.stream.getTracks().forEach((track) => track.stop())

      // Stop duration tracking
      if (durationInterval) {
        clearInterval(durationInterval)
      }
    }
  }

const requestMicrophonePermission = async () => {
    loading = true
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      permissionGranted = true
      return stream
    } catch (err) {
      console.error("Error accessing microphone:", err)
      permissionGranted = false
      return null
    } finally {
      loading = false
    }
  }

 const startRecording = async () => {
    hasError = false
    errorMessage = ""
    audioChunks = []
    decodedMessage = null

    // Request microphone access if not already granted
    if (!permissionGranted) {
      stream = await requestMicrophonePermission()
      if (!stream) return

      initializeRecording(stream)
    } else {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      initializeRecording(stream)
    }
  }


  const initializeRecording = (stream: MediaStream) => {
    audioCtx = new window.AudioContext()
    const mediaRecorder = new MediaRecorder(stream)
    source = audioCtx.createMediaStreamSource(stream)
    chunks = [];
    nSamples = 0;
    sampleRate = source.context.sampleRate;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
      console.log(audioBlob)
      const buffer = await audioBlob.arrayBuffer()
      audioCtx = null;
      const url = window.URL.createObjectURL(audioBlob);
      // Create an A element to download it.
      const a = document.createElement('a');
      a.style.display = 'block';
      a.href = url;
      a.download = 'chirp.wav';
      //a.click();
      recordingAvailable = true
      isRecording = false
      decodedMessage = null
      isDecoding = true
      try {
        const decodedString = await getStringFromBuffer(buffer, clockRate);
        decodedMessage = decodedString
      } catch (error) {
        console.error("Error during decoding:", error)
        errorMessage = error.message
        hasError = true
      }
      isDecoding = false
    }

    // Start tracking duration
    recordingStartTime = Date.now()
    recordingDuration = 0

    if (durationInterval) {
      clearInterval(durationInterval)
    }

    durationInterval = setInterval(() => {
      if (recordingStartTime) {
        const duration = Math.floor((Date.now() - recordingStartTime) / 1000)
        recordingDuration = duration
        randomBars  = Array.from({ length: 12 }, () => Math.random() * 100)
      }
    }, 1000)

    mediaRecorderRef = mediaRecorder
    mediaRecorder.start()
    isRecording = true
  }

</script>

<div
    class="w-full max-w-md mx-auto border-2 border-cyan-500 bg-slate-900 text-cyan-50 shadow-lg shadow-cyan-500/20 audio-decoder">
    <div class="p-6">
        <div class="flex flex-col items-center gap-6">
            <!-- Clock Rate Section -->
            <div class="w-full">
                <div class="flex items-center justify-between mb-2">
                    <div class="font-mono text-xs tracking-wider text-cyan-400 uppercase flex items-center gap-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="lucide lucide-settings h-3 w-3"
                        >
                            <path
                                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                            ></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        CLOCK RATE
                    </div>
                    <div class="text-xs text-cyan-300 font-mono">64 Hz</div>
                </div>

                <div
                    role="radiogroup"
                    aria-required="false"
                    dir="ltr"
                    class="gap-2 flex justify-between bg-slate-800 p-1 border border-cyan-600"
                    tabindex="0"
                    style="outline: none;"
                >
                    <!-- Radio Option 32 -->
                    <div class="flex-1">
                        <button
                            aria-label="32 hz clock rate"
                            type="button"
                            role="radio"
                            aria-checked="false"
                            data-state="unchecked"
                            value="32"
                            onclick={() => clockRate = 32}
                            class="aspect-square h-4 w-4 border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 peer sr-only"
                            id="rate-32"
                            tabindex="-1"
                            data-radix-collection-item=""
                        ></button>
                        <label
                        data-cy="rate-32"
                            class="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex flex-1 items-center justify-center px-3 py-1.5 text-xs font-mono cursor-pointer peer-data-[state=checked]:bg-cyan-600 peer-data-[state=checked]:text-white hover:bg-slate-700 transition-colors"
                            for="rate-32"
                        >
                            32
                        </label>
                    </div>

                    <!-- Radio Option 64 -->
                    <div class="flex-1">
                        <button
                            aria-label="64 hz clock rate"
                            type="button"
                            role="radio"
                            aria-checked="true"
                            data-state="checked"
                            value="64"
                            onclick={() => clockRate = 64}
                            class="aspect-square h-4 w-4 border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 peer sr-only"
                            id="rate-64"
                            tabindex="-1"
                            data-radix-collection-item=""
                        >
                            <span data-state="checked" class="flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="lucide lucide-circle h-2.5 w-2.5 fill-current text-current"
                                >
                                    <circle cx="12" cy="12" r="10"></circle>
                                </svg>
                            </span>
                        </button>
                        <label
                            class="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex flex-1 items-center justify-center px-3 py-1.5 text-xs font-mono cursor-pointer peer-data-[state=checked]:bg-cyan-600 peer-data-[state=checked]:text-white hover:bg-slate-700 transition-colors"
                            for="rate-64"
                        >
                            64
                        </label>
                    </div>

                    <!-- Radio Option 128 -->
                    <div class="flex-1">
                        <button
                            aria-label="128 hz clock rate"
                            type="button"
                            role="radio"
                            aria-checked="false"
                            data-state="unchecked"
                            onclick={() => clockRate = 128}
                            value="128"
                            class="aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 peer sr-only"
                            id="rate-128"
                            tabindex="-1"
                            data-radix-collection-item=""
                        ></button>
                        <label
                            class="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex flex-1 items-center justify-center px-3 py-1.5 text-xs font-mono cursor-pointer peer-data-[state=checked]:bg-cyan-600 peer-data-[state=checked]:text-white hover:bg-slate-700 transition-colors"
                            for="rate-128"
                        >
                            128
                        </label>
                    </div>
                </div>
            </div>

            <div class="w-full relative">
              <!-- Header -->
              <div class="text-center mb-2 font-mono text-xs tracking-wider text-cyan-400 uppercase">
                {#if isRecording}
                  CAPTURING CHIRPY SIGNAL
                {:else if recordingAvailable}
                  CHIRPY SIGNAL ANALYSIS
                {:else}
                  AWAITING WATCH BEEPS
                {/if}
              </div>

              <!-- Signal box -->
              <div class="w-full h-32 bg-slate-800 rounded-md border border-cyan-600 flex items-center justify-center overflow-hidden relative">

                <!-- Grid background -->
                <div class="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-20 pointer-events-none">
                  {#each Array(72) as _, i}
                    <div class="border-[0.5px] border-cyan-500/30"></div>
                  {/each}
                </div>

                <!-- Content states -->
                {#if isRecording}
                  <div class="flex flex-col items-center z-10">
                    <!-- Audio visualizer -->
                    <div class="flex items-end h-12 gap-[2px] mb-2">
                      {#each randomBars as height, index}
                        <div
                          class="w-2 bg-cyan-400 rounded-sm animate-pulse"
                          style="height: {height}%; animation-delay: {index * 0.1}s;"
                        ></div>
                      {/each}
                    </div>
                    <div class="font-mono text-xs text-cyan-300">
                      SIGNAL TIME: {formatDuration(recordingDuration)}
                    </div>
                  </div>

                {:else if recordingAvailable}
                  <div class="flex flex-col items-center text-center z-10 px-4 w-full">
                    <div class="font-mono text-xs text-cyan-300 mb-2">
                      SIGNAL LENGTH: {formatDuration(recordingDuration)}
                    </div>

                    {#if isDecoding}
                      <div class="animate-pulse flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-watch h-4 w-4 text-cyan-400"><circle cx="12" cy="12" r="6"></circle><polyline points="12 10 12 12 13 13"></polyline><path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05"></path><path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05"></path></svg>
                        <span class="text-cyan-400 font-mono text-sm">DECODING CHIRPY SIGNAL...</span>
                      </div>
                    {:else if decodedMessage}
                      <div class="font-mono text-xs bg-slate-700/50 p-2 rounded border border-cyan-500/50 w-full">
                        <div class="text-cyan-400 mb-1 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-watch h-4 w-4 text-cyan-400"><circle cx="12" cy="12" r="6"></circle><polyline points="12 10 12 12 13 13"></polyline><path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05"></path><path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05"></path></svg>
                          <span>DECODED MESSAGE:</span>
                        </div>
                        <div class="text-cyan-100 font-bold tracking-wide actual-decoded-message">
                          {decodedMessage}
                        </div>
                      </div>
                    {:else if hasError}
                      <div class="font-mono text-xs text-red-400">
                        <span>Error decoding chirpy signal: {errorMessage}</span>
                      </div>
                    {/if}
                  </div>

                {:else}
                  <div class="text-sm text-cyan-300 font-mono flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-waves h-6 w-6 mb-2 opacity-50"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>
                    <span>NO CHIRPY SIGNALS DETECTED</span>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Capture Beeps Button -->
            <div class="flex gap-4 flex-wrap justify-center">
              {#if loading}
              <button disabled class="bg-slate-700 text-cyan-100 flex items-center px-4 py-2 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle h-4 w-4 mr-2 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                INITIALIZING
              </button>
              {:else if isRecording}
              <button
                onclick={stopRecording}
                aria-label="Stop recording"
                class="stop-record bg-red-600 hover:bg-red-700 text-white border border-red-400 flex items-center px-4 py-2 rounded"
              >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square h-4 w-4 mr-2"><rect width="18" height="18" x="3" y="3" rx="2"></rect></svg>
                STOP RECORDING
              </button>
              {:else}
              <button
                onclick={startRecording}
                aria-label="Start recording"
                class="start-record bg-cyan-600 hover:bg-cyan-700 text-white border border-cyan-400 flex items-center px-4 py-2 rounded"
              >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic h-4 w-4 mr-2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
                CAPTURE BEEPS
              </button>
              {/if}
            </div>
        </div>
    </div>
</div>
