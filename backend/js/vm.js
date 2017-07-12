var VM = {

  hideAll: function() {
    var views = document.getElementsByClassName('view');
    for (var i = 0; i < views.length; i++) {
      this.hide(views[i]);
    }
  },

  hide: function(ele) {
    ele.style.display = "none";
  },

  show: function(id) {
    this.hideAll();
    document.getElementById(id).style.display = "block";
  }

}
