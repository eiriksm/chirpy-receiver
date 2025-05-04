import { mount } from 'svelte'
import './app.css'
import App from './Test.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
