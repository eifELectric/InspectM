const Toast = (()=>{
  const queue = [];
  const max = 5;

  const container = document.createElement("div");
  // Position
  // Toast.position("top-right");
  // Toast.position("bottom-left");
  container.className = "toast-container bottom-right";
  document.body.appendChild(container);

  function show(message, type="info", opts={}){

    const timeout = opts.timeout ?? 3000;

    if(container.children.length >= max){
      queue.push([message,type,opts]);
      return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    const progress = document.createElement("div");
    progress.className = "toast-progress";
    progress.style.animation = `progress ${timeout}ms linear`;
    progress.style.transform = "scaleX(1)";

    progress.animate(
      [{transform:"scaleX(1)"},{transform:"scaleX(0)"}],
      {duration:timeout, easing:"linear"}
    );

    toast.appendChild(progress);

    container.appendChild(toast);

    const close = ()=>{
      toast.classList.add("closing");
      setTimeout(()=>{
        toast.remove();

        if(queue.length){
          show(...queue.shift());
        }

      },200);
    };

    toast.addEventListener("click", close);

    setTimeout(close, timeout);
  }

  function position(pos){
    container.className = `toast-container ${pos}`;
  }

  return {show, position};
})();
