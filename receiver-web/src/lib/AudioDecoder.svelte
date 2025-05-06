<script lang="ts">
    console.log('AudioDecoder.svelte');
</script>

<div
    class="w-full max-w-md mx-auto border-2 border-cyan-500 bg-slate-900 text-cyan-50 shadow-lg shadow-cyan-500/20"
    data-v0-t="card"
>
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
                            type="button"
                            role="radio"
                            aria-checked="false"
                            data-state="unchecked"
                            value="32"
                            class="aspect-square h-4 w-4 border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 peer sr-only"
                            id="rate-32"
                            tabindex="-1"
                            data-radix-collection-item=""
                        ></button>
                        <label
                            class="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex flex-1 items-center justify-center px-3 py-1.5 text-xs font-mono cursor-pointer peer-data-[state=checked]:bg-cyan-600 peer-data-[state=checked]:text-white hover:bg-slate-700 transition-colors"
                            for="rate-32"
                        >
                            32
                        </label>
                    </div>

                    <!-- Radio Option 64 -->
                    <div class="flex-1">
                        <button
                            type="button"
                            role="radio"
                            aria-checked="true"
                            data-state="checked"
                            value="64"
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
                            type="button"
                            role="radio"
                            aria-checked="false"
                            data-state="unchecked"
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

            <!-- Awaiting Watch Beeps Section -->
            <div class="w-full relative">
                <div class="text-center mb-2 font-mono text-xs tracking-wider text-cyan-400 uppercase">
                    AWAITING WATCH BEEPS
                </div>
                <div
                    class="w-full h-32 bg-slate-800 border border-cyan-600 flex items-center justify-center overflow-hidden relative"
                >
                    <div
                        class="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-20 pointer-events-none"
                    >
                        <div class="border-[0.5px] border-cyan-500/30"></div>
                        <!-- Repeat grid lines as needed -->
                    </div>
                    <div class="text-sm text-cyan-300 font-mono flex flex-col items-center">
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
                            class="lucide lucide-waves h-6 w-6 mb-2 opacity-50"
                        >
                            <path
                                d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"
                            ></path>
                            <path
                                d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"
                            ></path>
                            <path
                                d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"
                            ></path>
                        </svg>
                        <span>NO CHIRPY SIGNALS DETECTED</span>
                    </div>
                </div>
            </div>

            <!-- Capture Beeps Button -->
            <div class="flex gap-4 flex-wrap justify-center">
                <button
                    class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white border border-cyan-400"
                    aria-label="Start recording"
                >
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
                        class="lucide lucide-mic h-4 w-4 mr-2"
                    >
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" x2="12" y1="19" y2="22"></line>
                    </svg>
                    CAPTURE BEEPS
                </button>
            </div>
        </div>
    </div>
</div>
