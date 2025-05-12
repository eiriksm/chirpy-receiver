<script lang="ts">
  import { getStringFromBuffer } from '../../../src/decodeFromBuffer';
  let props = $props();
  let data = $state('none');
  let errorState = $state('');
  let clockRate = props.clockRate || 32;
  const handleClick = async () => {
    data = 'fetch'
    const response = await fetch(props.filename);
    const buffer = await response.arrayBuffer();
    data = 'decoding'
    try {
      const decodedString = await getStringFromBuffer(buffer, clockRate);
      data = decodedString;
    } catch (err) {
      errorState = err.stack + "\n" + err.message
    }
  };
</script>

<div class="text-white">
  { props.filename }
  <button onclick={handleClick} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    Decode
  </button>
  <pre class="data">{ data }</pre>
  <pre class="error">{ errorState }</pre>
</div>
