<script lang="ts">
  import { getStringFromBuffer } from '../../../src/decodeFromBuffer';
  let props = $props();
  let data = 'none';
  const handleClick = async () => {
    data = 'fetch'
    const response = await fetch(props.filename);
    const buffer = await response.arrayBuffer();
    data = 'decoding'
    const decodedString = await getStringFromBuffer(buffer);
    data = decodedString;
  };
</script>

<div>
  { props.filename }
  <button onclick={handleClick}>
    Decode
  </button>
  <pre class="data">{ data }</pre>
</div>
