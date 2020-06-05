/*global $ grecaptcha io*/

var ipbock,
  ip,
  recaptchaState,
  socket = io();

$(document).ready(function() {
  $.getJSON("https://api.ipify.org?format=json", function(data) {
    ipbock = false;
    ip = data.ip;
  });
  ipbock = true;

  socket.on('config-info', function(recaptcha, serverName, serverIp, requirement) {
    recaptchaState = (recaptcha == 'true');
    console.log(recaptchaState);
    if (!recaptchaState)
      $('.g-recaptcha').hide();
    $('span#server-name').text(serverName);
    $('span#server-ip').text(serverIp);
    $('#requirement').text(requirement);
    document.title = 'Whitelist ' + serverName;
    console.info('Config infos loaded !\n\nreCAPTCHA : ' + recaptcha + '\nServer name : ' + serverName + '\nServer IP : ' + serverIp + '\nRequirement : ' + requirement);
  });

  setTimeout(function() {
    $('.loading').fadeOut(function() {
      if (ipbock) {
        $('.err-ipblock').fadeIn();
        console.log('err ipbock');
      }
      else {
        socket.emit('status-ip', ip);
        socket.on('res-status-ip', function(status) {
          if (status == 'accepted') {
            $('.success').fadeIn();
            $("#favicon").attr("href", "img/success-fav.png");
            return;
          }
          if (status == 'waiting') {
            $('.waiting').fadeIn();
            $("#favicon").attr("href", "img/waiting-fav.png");
            return;
          }
          else {
            $('.bc').fadeIn();
            $("#favicon").attr("href", "img/main-fav.png");
            return;
          }
        });
      }
    });
  }, 2500);
});

$('#submit').click(function() {
  var res = grecaptcha.getResponse();

  if (recaptchaState) {
    if (res.length == 0) {
      $('.bc').fadeOut(function() {
        $('.err-nocapcha').fadeIn();
      });
      return;
    }
  }
  if ($('#exp').val().length == 0) {
    $('.bc').fadeOut(function() {
      $('.err-noexp').fadeIn();
    });
    return;
  }
  else {
    socket.emit('send-ip-exp', ip, $('#exp').val());
    socket.on('send-ip-exp-waiting', function() {
      $('.bc').fadeOut(function() {
        $('.waiting').fadeIn();
        $("#favicon").attr("href", "img/waiting-fav.png");
      });
    });
  }
});

$('#back').click(function() {
  $('.err-nocapcha').fadeOut(function() {
    $('.bc').fadeIn();
  });
});

$('#back-exp').click(function() {
  $('.err-noexp').fadeOut(function() {
    $('.bc').fadeIn();
  });
});
