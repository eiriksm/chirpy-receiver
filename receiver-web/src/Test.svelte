<script lang="ts">
  import TestDecoder from './lib/TestDecoder.svelte';
</script>

<main>
  <h1>Test Decoder</h1>
  <div class="test-1">
    <TestDecoder filename="1.wav"/>
  </div>
  <div class="test-2">
    <TestDecoder filename="2.wav"/>
  </div>
  <div class="test-3">
    <TestDecoder filename="3.wav" clockRate="64" />
  </div>
  <p>Test decoder for the receiver web app
</main>
