// one-time screen setup
const WindowManagement = new function() {
  
  // constants
  
  this.LAYERS_BETWEEN_SCREENS = 2;
  this.WINDOW_OPEN_SPEED_MS = parseFloat(
    getComputedStyle(document.body)
    .getPropertyValue("--openWindowTime")
    .slice(0, -1) // assuming seconds
  ) * 1000;
  this.windows = document.getElementsByClassName("windowPositioner");
  this.taskbar = document.getElementById("taskbar");
  
  // functions
  
  this.updateWindowsSize = function() {
    let tHeight = this.taskbar.getBoundingClientRect().height + "px";
    document.querySelector(":root").style.setProperty("--taskbarHeight", tHeight);
    for (let w of document.getElementsByClassName("windowPositioner")) {
      let ww = w.querySelector(".window");
      let fractionW = ww
      .getAttribute("data-width")
      ?.split("/");
      if (fractionW.length === 2) {
        let percentW = fractionW[0]/fractionW[1];
        ww.style.width = window.innerWidth * percentW + "px";
      }
      let fractionH = ww
      .getAttribute("data-height")
      ?.split("/");
      if (fractionH.length === 2) {
        let percentH = fractionH[0]/fractionH[1];
        ww.style.height = window.innerHeight * percentH + "px";
      }
    }
  }
  this.setScreenPositions = function() {
    for (let w of this.windows) {
      let fractionX = w.getAttribute("data-X")?.split("/");
      if (fractionX && fractionX.length === 2) {
        let percentX = fractionX[0]/fractionX[1];
        w.style.left = Math.round(window.innerWidth * percentX) + "px";
      }
      let fractionY = w.getAttribute("data-Y")?.split("/");
      if (fractionY && fractionY.length === 2) {
        let percentY = fractionY[0]/fractionY[1];
        w.style.top = Math.round(window.innerHeight * percentY) + "px";
      }
      // randomly offset float animation so they're not all floating in unison
      let ww = w.querySelector(".window");
      ww.style.animationDelay = Math.floor(Math.random() * 500) + "ms";
    }
  }
  this.windowIsVisible = function(window) {
    return ! (
      window.classList.contains("closed") ||
      window.classList.contains("exited")
    );
  }
  this.windowIsOpen = function() {
    for (let window of this.windows)
      if (this.windowIsVisible(window)) return true;
    return false;
  }
  this.getWindow = function(windowString) {
    let w = document.getElementById(windowString);
    if (!w) throw new ReferenceError(`Document element ${windowString} does not exist.`);
    if (!w.classList.contains("windowPositioner")) throw new ReferenceError(`Document element ${windowString}}} is not a window.`);
    return w;
  }
  this.bringWindowToTop = function(window) {
    for (let w of this.windows) {
      let previousZ = parseInt(w.style.getPropertyValue("z-index"));
      let newZ = Math.max(previousZ - this.LAYERS_BETWEEN_SCREENS, 0);
      w.style.zIndex = newZ;
    } 
    for (let element of document.querySelectorAll(".active")) element.classList.remove("active");
    window.classList.add("active");
    window.style.zIndex = (this.windows.length-1) * this.LAYERS_BETWEEN_SCREENS;
  }
  this.DragWindow = new function() {
    _isBeingDragged: null,
    this.dragStart = function(element) {
      this._isBeingDragged = element;
      WindowManagement.bringWindowToTop(element);
    }
    this.dragTo = function({movementX, movementY}) {
      if (this._isBeingDragged) {
        if (this._isBeingDragged.classList.contains("fullscreen")) return;
        let d = this._isBeingDragged.style;
        // assumes value is in px
        d.setProperty("top", parseInt(d.top.slice(0, -2)) + movementY + "px" );
        d.setProperty("left", parseInt(d.left.slice(0, -2)) + movementX + "px" );
      }
    },
    this.dragEnd = function() {
      this._isBeingDragged = null;
    }
  }
  this.exitWindow = function(windowString) {
    let window = this.getWindow(windowString);
    let toolbarbutton = document.querySelector(`#${windowString}Toolbar`);
    if (window.classList.toggle("exited")) { // if screen has been exited
      window.classList.remove("closed");
      if (toolbarbutton) toolbarbutton.classList.add("exited"); 
    }
    else { // if screen has been turned on
      this.bringWindowToTop(window);
      if (toolbarbutton) toolbarbutton.classList.remove("exited");
      toolbarbutton.classList.remove("exited");
    } 
  }
  this.openWindow = function(windowString) {
    let window = this.getWindow(windowString);
    if (window.classList.contains("exited")) { // window is coming out of an exited state
      this.exitWindow(windowString); // will run the function to start the window
    }
    else {
      if (window.classList.contains("closed")) { // if window was closed
        this.bringWindowToTop(window);
        window.classList.remove("closed");
        setTimeout(() => {window.classList.remove("smoothTopAnimation")}, this.WINDOW_OPEN_SPEED_MS);
      }
      else { // if window was open
        window.classList.add("smoothTopAnimation");
        window.classList.add("closed");
      }
    } 
  }
  this.fullscreenWindow = function(windowString) {
    let window = this.getWindow(windowString);
    if (window.classList.toggle("fullscreen")) {
      // init fullscreen mode

    }
    else {
      // deinit fullscreen mode

    }
  }
  
  // init
  
  // set/reassign window positions
  window.addEventListener('load', () => {
    this.setScreenPositions();
    this.updateWindowsSize();
  });
  window.addEventListener('resize', this.updateWindowsSize);
  for (let i = 0; i < this.windows.length; i++) {
    this.windows[i].style.setProperty("z-index", i*this.LAYERS_BETWEEN_SCREENS);
  }  
  // let the windows be moved around
  for (let window of this.windows) {
    window.addEventListener('mousedown', (e) => { this.DragWindow.dragStart(window) });
    window.addEventListener('touchstart', (e) => { this.DragWindow.dragStart(window) });
  }
  document.addEventListener('mousemove', (e) => { this.DragWindow.dragTo(e) });
  document.addEventListener('touchmove', (e) => { this.DragWindow.dragTo(e) });
  document.addEventListener('mouseup', () => {this.DragWindow.dragEnd() });
  document.addEventListener('touchend', () => { this.DragWindow.dragEnd() });

}

// blossoms
const BlossomManagement = new function() {
  // constants
  this.ANIMATION_DIRECTIONS = ["normal", "reverse", "alternate", "alternate-reverse"];
  this.PETAL_TYPES = 3;
  this.MAX_TOTAL_BLOSSOMS = 127;
  this.MAX_BLOSSOM_CYCLES = 5;
  this.BLOSSOM_LIFETIME = parseInt(
    getComputedStyle(document.body)
    .getPropertyValue("--petalLifetime")
    .slice(0, -1) // assuming seconds
  );
  
  // variables
  this.activeBlossoms = 16;
  // this.activeBlossoms = 0; // remove this line when done
  this.liveBlossoms = 0;
  this.blossomWindow;
  
  // functions
  this.setBlossomWindow = function() {
    let blossomWindowNum = Math.floor(Math.random() * WindowManagement.windows.length);
    for (let i = 0; i < WindowManagement.windows.length; i++) {
      // we need this loop to make sure the randomly chosen window isn't hidden, and if so, keep trying until one that isn't hidden is found
      let potentialWindow = WindowManagement.windows[(blossomWindowNum + i) % WindowManagement.windows.length];
      if (WindowManagement.windowIsVisible(potentialWindow)) {
        this.blossomWindow = WindowManagement.windows[blossomWindowNum];
        return;
      }
    }
  }
  this.createNewBlossom = function() {
    if (!this.blossomWindow) return;
    let {x, y, width, height} = this.blossomWindow.querySelector(".window").getBoundingClientRect();
    let petalType = Math.floor(Math.random() * this.PETAL_TYPES);
    let newPetal = document.createElement("div");
    newPetal.classList.add("petalPositioner");
    newPetal.setAttribute('aria-hidden', "true");
    newPetal.style.zIndex = parseInt(this.blossomWindow.style.getPropertyValue('z-index'))+1;
    newPetal.style.top = Math.floor(Math.random() * height) + y + "px";
    newPetal.style.left = Math.floor(Math.random() * width) + x + "px";
    newPetal.style.setProperty("--gs", Math.floor(Math.random() * 60) + 10 + "%");
    newPetal.style.setProperty("--ad1", this.ANIMATION_DIRECTIONS[Math.floor(Math.random() * this.ANIMATION_DIRECTIONS.length)]);
    newPetal.style.setProperty("--ad2", this.ANIMATION_DIRECTIONS[Math.floor(Math.random() * this.ANIMATION_DIRECTIONS.length)]);
    newPetal.innerHTML = `<div class="petalRotate">
      <div class="petal petal${petalType}"></div>
    </div>`;  
    this.blossomWindow.after(newPetal);
    setTimeout(() => {
      newPetal.remove();
      this.liveBlossoms--;
    }, this.BLOSSOM_LIFETIME*1000);
  }
  
  // init
  this.blossomsLeft = 0;
  this.blossomGenerationInterval = setInterval(() => {
    if (this.liveBlossoms < this.activeBlossoms && WindowManagement.windowIsOpen()) {
      this.blossomsLeft--;
      if (this.blossomsLeft <= 0 || !WindowManagement.windowIsVisible(this.blossomWindow)) {
        this.setBlossomWindow();
        this.blossomsLeft = Math.floor(Math.random() * this.activeBlossoms * this.MAX_BLOSSOM_CYCLES);
      }
      this.liveBlossoms++;
      setTimeout(() => { this.createNewBlossom() }, Math.floor(Math.random() * 10000));
    }
  }, 100);
  
}

// simple, efficient clock
const ClockManagement = new function() {
  // variables
  this.clock = document.getElementById("time");
  this.clockInterval;
  
  // functions
  this.updateTime = function() {
    let d = new Date();
    let meridiem = (d.getHours() > 11? "pm" : "am");
    let time = `${d.getHours()%12 || 12}:${d.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2})} ${meridiem}`;
    this.clock.innerText = time;
  }
  
  // init
  this.updateTime();
  setTimeout(() => {
    this.updateTime();
    this.clockInterval = setInterval(() => { this.updateTime() }, 60000);
  }, (60 - new Date().getSeconds())*1000);  
}

// Terminal-related functions
const TerminalHelpers = new function() {
  this.inputField = document.querySelector("#terminalInput"); // the horizontal bar that contains the input
  this.prefixField = document.querySelector("#terminalPrefix");
  this.inputText = this.inputField.querySelector("input[type='text']"); // the input HTML element
  this.terminalContent = document.querySelector("#Terminal").querySelector(".terminalContent");
  
  // used as an object constructor - each call creates and returns a unique object
  this.Command = function(name, args, desc, func) {
    return new function() {
      this.name = name;
      this.args = args;
      this.desc = desc;
      this.func = func;
    }
  };
  
  this.updateTextboxSize = function() {
    this.inputText.style.width = this.inputText.value.length + "ch";
  };
  
  this.putOutHTML = function(string, lineBeginning = "") {
    // a single line of output
    let out = document.createElement("div");
    lineBeginning? 
      out.innerHTML = `<div>${lineBeginning}</div><div>${string}</div>` : 
      out.innerHTML = `<div>${string}</div>`;
    this.inputField.parentElement.before(out);
  };
  
  this.putOutError = function(string) {
    let errorString = "<span style='color:var(--red);'</b>" + string + "</span>";
    let errorPrefix = "<b style='color: var(--red);'>&#x26D4; Error:</b>";
    this.putOutHTML(errorString, errorPrefix);
  };

  this.putOutWarning = function(string) {
    let errorString = "<span style='color:var(--yellow);'</b>" + string + "</span>";
    let errorPrefix = "<b style='color: var(--yellow);'>&#x26A0; Warning:</b>";
    this.putOutHTML(errorString, errorPrefix);
  };
  
  this.availableCommands = [
    this.Command("help", null, "displays a list of available commands", (args) => {
      let rows = "<table>";
      for (let i=0; i < this.availableCommands.length; i++) {
        let c = this.availableCommands[i]
        let argString = "";
        if (c.args) {
          argString += ` <span style="color: var(--yellow)">${c.args.join(" ")}</span>`;
        }
        rows += `<tr><td>&gt; <b style="color: var(--purple)">${c.name}${argString}</b></td><td>-</td><td>${c.desc}</td></tr>`;
        if (i < this.availableCommands.length - 1) rows += "<tr class='spacerRow'><td></td><td></td><td></td></tr>";
      }
      rows+="</table>";
      this.putOutHTML(rows);
    }),
    this.Command("name", ["[name]"], "changes your system name", (args) => {
      if (!args) {
        this.putOutError("name requires [name] argument");
      }
      args = args.split(" ");
      if (args.length > 1) this.putOutWarning("Name can only be 1 word");
      let m = this.prefixField.getAttribute("data-marker");
      this.prefixField.innerHTML = args[0] + m;
    }),
    this.Command("petals", ["[count:number[0-"+BlossomManagement.MAX_TOTAL_BLOSSOMS+"]]"], "changes the max number of petals", (args) => {
      if (!args) {
        this.putOutHTML("Max petals: " + BlossomManagement.activeBlossoms + ", Active petals: " + BlossomManagement.liveBlossoms );
        return;
      }
      args = args.split(" ");
      if (args.length > 1) this.putOutWarning("petals only accepts one argument");
      let arg = parseInt(args[0]);
      if (isNaN(arg)) {
        this.putOutError("Argument 1 is not a valid number");
        return;
      }
      if (arg > BlossomManagement.MAX_TOTAL_BLOSSOMS || arg < 0) {
        this.putOutError("Number is not within range 0-"+BlossomManagement.MAX_TOTAL_BLOSSOMS);
        return;
      }
      BlossomManagement.activeBlossoms = arg;
      this.putOutHTML("Max petals now: " + arg);
    }),
    this.Command("refresh", null, "reverts windows back to their original positions", (args) => {
      WindowManagement.setScreenPositions();
      WindowManagement.updateWindowsSize();
      this.putOutHTML("Refreshed the screen");
    }),
    this.Command("ps", null, "views the process status of the currently running processes", (args) => {
      if (args) this.putOutWarning("Arguments are not supported for ps command");
      let HTMLstring = "<table>";
      HTMLstring += "<tr><th>PID</th><th>Process Name</th><th>Status</th></tr>";
      for (let i = 0; i < WindowManagement.windows.length; i++) {
        let w = WindowManagement.windows[i];
        if (!w.classList.contains("exited")) {
          let status;
          if (w.classList.contains("fullscreen")) status = "fullscreen";
          else if (w.classList.contains("closed")) status = "minimized";
          else status = "open";
          HTMLstring += `<tr><td>${i}</td><td>${w.id}</td><td>${status}</td></tr>`;
        }
      }
      HTMLstring += "</table>";
      this.putOutHTML(HTMLstring);
    }),
    this.Command("kill", ["[pid:number]"], "closes a currently running process", (args) => {
      if (!args) {
        this.putOutError("kill requires [pid] argument");
        return;
      }
      args = args.split(" ");
      if (args.length > 1) this.putOutWarning("kill only accepts one argument");
      let arg = parseInt(args[0]);
      if (isNaN(arg)) {
        this.putOutError("Argument 1 is not a valid number");
        return;
      }
      if (!WindowManagement.windows[arg] || WindowManagement.windows[arg].classList.contains("exited")) {
        this.putOutError("pid " + arg + " is not running");
        return;
      }
      WindowManagement.exitWindow(WindowManagement.windows[arg].id);
      this.putOutHTML("Killed pid " + arg);
    }),
    this.Command("exit", null, "closes the terminal", (args) => {
      WindowManagement.exitWindow("Terminal");
    }),
  ];
  
  this.runCommand = function(inputText) {
    let prefix = this.prefixField.innerText;
    this.putOutHTML(inputText, prefix);
    let input = inputText.split(" ");
    for (let c of this.availableCommands) {
      if (input[0].toLowerCase() === c.name) {
        c.func(input.slice(1).join(" "));
        return;
      }
    }
    this.putOutError("Command <span style='color: var(--yellow)'>" + inputText + "</span> not found. Try <b style='color: var(--purple)'>help</b>.");
    return;
  };
  
  this.terminalHandleKeyup = function(e) {
    if (event.key === "Enter") {
      this.runCommand(this.inputText.value);
      this.inputText.value = "";
      this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
      this.updateTextboxSize();
    }
  };
  
  // init
  this.terminalContent.addEventListener('click', () => { this.inputText.focus() });
  this.terminalContent.style.cursor = "pointer";
  this.inputText.addEventListener('input', () => { this.updateTextboxSize() });
  this.inputField.addEventListener('keyup', (e) => { this.terminalHandleKeyup(e) });
}

const BrowserHelpers = new function() {
  // constants & variables
  this.FADE_IN_WAIT = 1.3; // in seconds
  this.browserWindow = WindowManagement.getWindow("Browser");
  this.browserContent = this.browserWindow.querySelector(".browserContent");
  
  // functions
  this.updateContentScroll = function() {
    if (!this.browserContent) return;
    let browserContentElements = this.browserContent.children;
    let browserFrame = this.browserWindow.querySelector(".window");
    let subtractHeight = 0.0;
    for (let s of browserFrame.children) {
      let computedStyleS = getComputedStyle(s);
      let isBrowserContent = s.classList.contains("browserContent");
      let isNormalDocumentFlow = computedStyleS.position !== "absolute";
      let isVisible = computedStyleS.display !== "none";
      if (isNormalDocumentFlow && isVisible && !isBrowserContent) {
        subtractHeight += s.getBoundingClientRect().height;
        subtractHeight += parseFloat(computedStyleS.getPropertyValue("margin-top"));
        subtractHeight += parseFloat(computedStyleS.getPropertyValue("margin-bottom"))
      } 
    }
    let ws = getComputedStyle(this.browserWindow.querySelector(".window"));
    subtractHeight += parseFloat(ws.getPropertyValue("border-bottom"));
    subtractHeight += parseFloat(ws.getPropertyValue("border-top"));
    subtractHeight += 2; // add two pixels to make sure it's inside the container
    let newHeight =  browserFrame.getBoundingClientRect().height - subtractHeight + "px";
    this.browserContent.style.height = newHeight;
  }
  
  // init
  
  // add animation delays to direct Content children
  for (let i = 0; i < this.browserContent.children.length; i++) {
    let element = this.browserContent.children[i];
    let prevDelay = parseFloat(element.style.animationDelay.slice(0, -1)); // assuming seconds
    element.style.animationDelay = this.FADE_IN_WAIT + (.1 * i) + "s";
  }
  let cards = document.querySelector(".browserContent>.cards").children;
  console.log(cards);
  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];
    console.log(card, this.FADE_IN_WAIT*2 + (.1 * i) + "s");
    card.style.animationDelay = this.FADE_IN_WAIT*1.5 + (.1 * i) + "s";
  }
  
  window.addEventListener('load', () => { 
    this.updateContentScroll() 
    window.addEventListener('resize', () => { this.updateContentScroll() });
  });
}