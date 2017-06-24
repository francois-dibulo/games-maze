var Timer = {
  ele: null,
  start_ts: null,
  is_running: false,
  init: function() {
    this.ele = document.getElementById("time");
  },
  reset: function() {
    this.start_ts = null;
    this.is_running = false;
  },
  start: function() {
    this.start_ts = +(new Date());
    this.is_running = true;
    this.loop();
  },
  stop: function() {
    this.is_running = false;
  },
  loop: function() {
    if (!this.is_running) return;
    var now = +(new Date());
    var delta = now - this.start_ts;

    var x = delta / 1000;
    var seconds = x % 60;
    x /= 60;
    var minutes = x % 60;

    var ms_label = Math.floor(delta % 1000);
    if (ms_label < 10) { ms_label = "00" + ms_label; }
    if (ms_label < 100) { ms_label = "0" + ms_label; }
    var sec_label = Math.floor(seconds);
    if (sec_label < 10) { sec_label = "0" + sec_label; }
    var min_label = Math.floor(minutes);
    if (min_label < 10) { min_label = "0" + min_label; }

    this.ele.innerHTML = min_label + ":" + sec_label + ":" + ms_label;
    setTimeout(function() {
      this.loop();
    }.bind(this), 100);
  }
};
