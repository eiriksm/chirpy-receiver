<script lang="ts">
  import { getStringFromBuffer } from '../../../src/decodeFromBuffer';
  let props = $props();
  const handleClick = async () => {
    const response = await fetch(props.filename);
    const buffer = await response.arrayBuffer();
    const decodedString = await getStringFromBuffer(buffer);
    console.log(decodedString);
  };
</script>

<p>
  { props.filename }
  <button onclick={handleClick}>
    Decode
  </button>
</p>
