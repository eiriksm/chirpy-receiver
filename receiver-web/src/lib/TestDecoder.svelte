<script lang="ts">
  import { getStringFromBuffer } from '../../../src/decodeFromBuffer';
  let props = $props();
  let data;
  const handleClick = async () => {
    const response = await fetch(props.filename);
    const buffer = await response.arrayBuffer();
    const decodedString = await getStringFromBuffer(buffer);
    data = decodedString;
  };
</script>

<p>
  { props.filename }
  <button onclick={handleClick}>
    Decode
  </button>
  <pre class="data">{ data }</pre>
</p>
