// This function runs when the document is fully loaded
$(document).ready(function () {
  
  // Initially hide elements with class "off"
  $(".off").hide();
  
  // When element with ID "play" is clicked
  $("#play").click(function () {
    if ($(this).hasClass("active")) { // If it has class "active"
      $(".off").hide();
      $(".on").fadeIn();
      $("#powerOn")[0].pause();
      $("#powerOff")[0].play();
      $(this).toggleClass("active");
      $(".machine-art-container, .machine-lights-container, .boon h1, .bane h1").toggleClass("active");
    } else {
      $(".on").hide();
      $(".off").fadeIn();
      $("#powerOn")[0].play();
      $("#powerOff")[0].pause();
      $("#powerOff")[0].currentTime = 0;
      $(this).toggleClass("active");
      $(".machine-art-container, .machine-lights-container, .boon h1, .bane h1").toggleClass("active");
    }
  });
  
  // When mouse hovers over a link inside elements with class "menu"
  $(".menu a").mouseover(function () {
    $("#hover")[0].play();
  });
  
  // When mouse moves out of a link inside elements with class "menu"
  $(".menu a").mouseout(function () {
    $("#hover")[0].pause();
    $("#hover")[0].currentTime = 0;
  });
});
