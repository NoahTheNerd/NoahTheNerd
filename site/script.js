/**
 * Type the text
 * @author Mae // noah definitely also helped and did all the work no questions asked
 */ // new copilot update lookin sick
(() => {
  const el = document.querySelector("#typed-text")
  const text = "hi, my name's noah!"
  const time = 50

  let finished;
  let timer;

  let currentChar = 0;
  const type = () => {
    const char = text[currentChar];
    if (char===undefined) return clearInterval(timer);finished=true
    el.innerHTML += char
    currentChar++;
  }
  
  timer = setInterval(type, time)
  
})()
