<script lang="ts">
  let animationDuration = 3;
  let animationTimingFunction = "ease";
  let animationDelay = 0;
  let animationIterationCount = "infinite";
  let animationDirection = "normal";
  let animationFillMode = "forwards";
  let animationStyle = "";
  $: animationStyle = `animation-duration: ${animationDuration}s;
		animation-timing-function: ${animationTimingFunction};
		animation-delay: ${animationDelay}s;
		animation-iteration-count: ${animationIterationCount};
		animation-direction: ${animationDirection};
		animation-fill-mode: ${animationFillMode};`;
</script>

<main>
  <h1 class="title">animation generator</h1>
  <div class="animation-viewer">
    <h2>アニメーション</h2>
    <h3>プログレスバー</h3>
    <div>
      <div class="progress-bar-container">
        <div class="progress-bar" style={animationStyle} />
      </div>
    </div>
  </div>
  <div class="control1">
    <h2>animation-name</h2>
    <p>@keyframes で定義したアニメーション名を記述します</p>
  </div>
  <div class="control2">
    <h2>animation-duration</h2>
    <p>何秒かけてアニメーションを1回するか指定します</p>
    <label> <input type="number" /><span>秒 </span></label>
  </div>
  <div class="control2">
    <h2>animation-duration</h2>
    <p>何秒かけてアニメーションを1回するか指定します</p>
    <label>
      <input
        class="animation-duration-input"
        type="number"
        min="0.1"
        bind:value={animationDuration}
        step="0.1"
      /><span>秒 </span></label
    >
  </div>
</main>

<style>
  h1 {
    border-left: 0.5em solid red;
    padding-left: 5px;
  }

  main {
    margin: 0 auto;
    margin-top: 20px;
    width: min(700px, 100%);
  }

  main {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(5, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 0px;
    grid-template-areas:
      "title title"
      "control1 animation-viewer"
      "control2 animation-viewer";
  }

  .title {
    grid-area: title;
  }

  .animation-viewer {
    grid-area: animation-viewer;
  }

  .control1 {
    grid-area: control1;
  }

  .animation-duration-input:invalid {
    border: solid red;
  }

  .control2 {
    grid-area: control2;
  }

  /* progress bar animation start */
  .progress-bar-container {
    width: 100%;
    height: 1.5em;
  }

  .progress-bar {
    height: 100%;
    background-color: cornflowerblue;
    animation-name: progressBarAnimation;
  }

  @keyframes progressBarAnimation {
    from {
      width: 0%;
    }

    to {
      width: 100%;
    }
  }
  /* progress bar animation end */
</style>
