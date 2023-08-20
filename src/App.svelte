<script lang="ts">
  import { dom, library } from "@fortawesome/fontawesome-svg-core";
  import {
    faArrowRight,
    faArrowLeft,
    faArrowRightArrowLeft,
  } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";

  library.add(faArrowRight, faArrowLeft, faArrowRightArrowLeft);

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

  const restartAnimation = () => {
    const animationComponent = Array.from(
      document.querySelectorAll(".animation-component")
    );
    animationComponent
      .map((component) => component as HTMLElement)
      .forEach((component) => {
        component.classList.remove("animation-component");
        setTimeout(() => component.classList.add("animation-component"), 100);
      });
  };

  onMount(() => {
    dom.i2svg();
  });
</script>

<main>
  <h1 class="title">animation generator</h1>
  <div class="animation-viewer">
    <div>
      <h2>アニメーション</h2>
      <h3>プログレスバー</h3>
      <div>
        <div class="progress-bar-container">
          <div
            class="progress-bar animation-component"
            style={animationStyle}
          />
        </div>
      </div>
    </div>
  </div>
  <div class="control">
    <div>
      <h2>animation-name</h2>
      <p>@keyframes で定義したアニメーション名を記述します</p>
    </div>
    <div>
      <h2>animation-duration</h2>
      <p>何秒かけてアニメーションを1回するか指定します</p>
      <label>
        <input
          type="number"
          min="0.1"
          bind:value={animationDuration}
          step="0.1"
        /><span>秒 </span></label
      >
    </div>
    <div>
      <h2>animation-timing-function</h2>
      <p>1回あたり、どのようにアニメーションするか指定します。</p>
      <p>
        現在の設定:<span class="current-setting">{animationTimingFunction}</span
        >
      </p>
      <div class="ease-function-area">
        <button on:click={() => (animationTimingFunction = "linear")}>
          <h3>linear</h3>
          <div class="animation-timing-function-container">
            <div
              class="animation-timing-function-bar animation-component"
              style="animation-timing-function: linear;"
            />
          </div>
        </button>
        <button on:click={() => (animationTimingFunction = "ease")}>
          <h3>ease</h3>
          <div class="animation-timing-function-container">
            <div
              class="animation-timing-function-bar animation-component"
              style="animation-timing-function: ease;"
            />
          </div>
        </button>
        <button on:click={() => (animationTimingFunction = "ease-in")}>
          <h3>ease-in</h3>
          <div class="animation-timing-function-container">
            <div
              class="animation-timing-function-bar animation-component"
              style="animation-timing-function: ease-in;"
            />
          </div>
        </button>
        <button on:click={() => (animationTimingFunction = "ease-out")}>
          <h3>ease-out</h3>
          <div class="animation-timing-function-container">
            <div
              class="animation-timing-function-bar animation-component"
              style="animation-timing-function: ease-out;"
            />
          </div>
        </button>
        <button on:click={() => (animationTimingFunction = "ease-in-out")}>
          <h3>ease-in-out</h3>
          <div class="animation-timing-function-container">
            <div
              class="animation-timing-function-bar animation-component"
              style="animation-timing-function: ease-in-out;"
            />
          </div>
        </button>
      </div>
    </div>
    <div>
      <h2>animation-delay</h2>
      <p>アニメーションをいつ実行するか設定します</p>
      <button on:click={restartAnimation}>再起動</button>
      <label>
        <input
          type="number"
          min="0"
          bind:value={animationDelay}
          step="0.1"
        /><span>秒 </span></label
      >
    </div>
    <div>
      <h2>animation-iteration-count</h2>
      <p>アニメーション回数を設定します</p>
      <p>
        {`${animationIterationCount}回`}
      </p>
      <button on:click={restartAnimation}>再起動</button>
      <label>
        <input
          type="number"
          min="0.1"
          bind:value={animationIterationCount}
          step="0.1"
        /><span>回 </span></label
      >
      <button on:click={() => (animationIterationCount = "infinite")}
        >無限</button
      >
    </div>
    <div>
      <h2>animation-direction</h2>
      <p>アニメーションの方向を設定します</p>
      <p>
        現在の設定:<span class="current-setting">{animationDirection}</span>
      </p>
      <div class="animation-direction-area">
        <button
          on:click={() => {
            animationDirection = "normal";
          }}
          >normal <i class="fa-solid fa-arrow-right" />
        </button>
        <button
          on:click={() => {
            animationDirection = "reverse";
          }}
          >reverse <i class="fa-solid fa-arrow-left" />
        </button>
        <button
          on:click={() => {
            animationDirection = "alternate";
          }}>alternate <i class="fa-solid fa-arrow-right-arrow-left" /></button
        >
        <button
          on:click={() => {
            animationDirection = "alternate-reverse";
          }}
          >alternate-reverse <i
            class="fa-solid fa-arrow-right-arrow-left"
            data-fa-transform="flip-h"
          /></button
        >
      </div>
    </div>
  </div>
</main>

<style>
  h1 {
    border-left: 0.5em solid red;
    padding-left: 5px;
  }

  button {
    background-color: #ffffff;
    border: #8e8888 solid 1px;
    border-radius: 7px;
    padding: 5px 10px;
  }

  button:hover {
    background-color: #ece6e6;
  }

  button:active {
    background-color: #c8c0c0;
  }

  main {
    margin: 0 auto;
    margin-top: 20px;
    width: min(700px, 100%);
  }

  main {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: 3em max-content;
    grid-column-gap: 0px;
    grid-row-gap: 0px;
    grid-template-areas:
      "title title"
      "control animation-viewer";
  }

  .title {
    grid-area: title;
  }

  .animation-viewer {
    grid-area: animation-viewer;
  }

  .control {
    grid-area: control;
  }

  input[type="number"]:invalid {
    border: solid red;
  }

  .ease-function-area {
    display: flex;
    flex-direction: column;
  }

  .current-setting {
    font-weight: bold;
  }

  /* animation timing function animation start */
  .animation-timing-function-container {
    height: 1.5em;
    width: 100%;
    border: 1px solid #6c6767;
  }

  .animation-timing-function-bar {
    height: 100%;
    width: 30px;
    background-color: #ff0000;
    animation-duration: 3s;
    animation-delay: 0s;
    animation-iteration-count: infinite;
    animation-direction: normal;
    animation-fill-mode: forwards;
  }

  .animation-component.animation-timing-function-bar {
    animation-name: animationTimingFunctionAnimation;
  }

  @keyframes animationTimingFunctionAnimation {
    from {
      margin-left: 0px;
    }
    to {
      margin-left: calc(100% - 30px);
    }
  }
  /* animation timing function animation end*/

  .animation-direction-area {
    display: flex;
  }

  /* progress bar animation start */
  .progress-bar-container {
    width: 100%;
    height: 1.5em;
  }

  .progress-bar {
    height: 100%;
    width: 0;
    background-color: cornflowerblue;
  }
  .animation-component.progress-bar {
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
