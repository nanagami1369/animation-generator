<script lang="ts">
  import { Router, link, Route } from "svelte-routing";
  import Index from "./Pages/Index.svelte";
  import License from "./Pages/License.svelte";
</script>

<Router>
  <header class="header">
    <nav>
      <a href="/" use:link>Home</a>
      <a href="/license" use:link>License</a>
    </nav>
  </header>
  <div>
    <Route path="/"><Index /></Route>
    <Route path="/license"><License /></Route>
  </div>
</Router>

<style>
  .header {
    color: #c2b6b6;
    background-color: #332828;
    height: 30px;
    display: flex;
    justify-content: center;
  }

  .header nav {
    height: 100%;
  }
  .header nav a {
    text-decoration: none;
    display: inline-flex;
    align-items: flex-end;
    height: 100%;
    font-size: 1em;
    padding: 0 1em;
  }

  .header nav a:hover {
    background-color: #695656;
  }

  .header nav a:link {
    color: #c9c62e;
  }

  .header nav a:visited {
    color: #c9c62e;
  }
</style>
