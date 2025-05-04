<script lang="ts">
  import { getStringFromBuffer } from '../../../src/decodeFromBuffer';
  let props = $props();
  let data = $state('none');
  const handleClick = async () => {
    data = 'fetch'
    const response = await fetch(props.filename);
    const buffer = await response.arrayBuffer();
    data = 'decoding'
    try {
    const decodedString = await getStringFromBuffer(buffer);
    data = decodedString;
} catch (err) {
  data err.message
}
  };
</script>

<div>
  { props.filename }
  <button onclick={handleClick}>
    Decode
  </button>
  <pre class="data">{ data }</pre>
</div>
